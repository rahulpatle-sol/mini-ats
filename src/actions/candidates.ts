"use server";

import { and, eq, ne } from "drizzle-orm";
import { revalidatePath } from "next/cache";
import { redirect } from "next/navigation";
import { after } from "next/server";
import { z } from "zod";
import { getDb } from "@/db";
import { candidateNotes, candidates, jobs, resumeFiles, stageEvents } from "@/db/schema";
import { canMove, isStage } from "@/lib/constants";
import { sendEmail } from "@/lib/email";
import { newCandidateEmail, stageEmail } from "@/lib/email-templates";
import { checkResumeFile, extensionOf, matchesSignature } from "@/lib/resume";
import { requireUser } from "@/lib/session";
import { isUuid } from "@/lib/utils";
import { candidateSchema, noteSchema } from "@/lib/validators";

export type FormState = {
  errors?: Record<string, string[] | undefined>;
  message?: string;
  values?: Record<string, string>;
};

const FIELDS = ["name", "email", "phone", "jobId", "skills", "experienceYears", "source", "resumeUrl"] as const;

function readForm(fd: FormData) {
  return Object.fromEntries(FIELDS.map((k) => [k, String(fd.get(k) ?? "")])) as Record<(typeof FIELDS)[number], string>;
}

function refresh() {
  revalidatePath("/", "layout");
}

type ResumeRow = { filename: string; contentType: string; size: number; data: string };

async function readResume(fd: FormData): Promise<ResumeRow | null | { error: string }> {
  const file = fd.get("resume");
  if (!(file instanceof File) || file.size === 0) return null;
  const checked = checkResumeFile(file);
  if ("error" in checked) return checked;
  const bytes = new Uint8Array(await file.arrayBuffer());
  if (!matchesSignature(extensionOf(file.name), bytes)) {
    return { error: "That file does not look like a valid PDF, DOC or DOCX." };
  }
  return {
    filename: file.name.replace(/[^\w.\- ]+/g, "_").slice(0, 120),
    contentType: checked.contentType,
    size: file.size,
    data: Buffer.from(bytes).toString("base64"),
  };
}

async function checkJob(jobId: string, userId: string) {
  const [job] = await getDb()
    .select({ id: jobs.id, title: jobs.title, status: jobs.status })
    .from(jobs)
    .where(and(eq(jobs.id, jobId), eq(jobs.userId, userId)))
    .limit(1);
  return job ?? null;
}

export async function createCandidate(_prev: FormState, fd: FormData): Promise<FormState> {
  const user = await requireUser();
  const raw = readForm(fd);
  const parsed = candidateSchema.safeParse(raw);
  const resume = await readResume(fd);
  const errors: Record<string, string[] | undefined> = parsed.success ? {} : z.flattenError(parsed.error).fieldErrors;
  if (resume && "error" in resume) errors.resume = [resume.error];
  if (Object.keys(errors).length || !parsed.success || (resume && "error" in resume)) return { errors, values: raw };

  const db = getDb();
  const data = parsed.data;

  const job = await checkJob(data.jobId, user.uid);
  if (!job) return { errors: { jobId: ["That role no longer exists"] }, values: raw };
  if (job.status === "closed") return { errors: { jobId: ["That role is closed. Reopen it first or pick another."] }, values: raw };

  const dup = await db
    .select({ id: candidates.id })
    .from(candidates)
    .where(and(eq(candidates.email, data.email), eq(candidates.userId, user.uid)))
    .limit(1);
  if (dup.length) return { errors: { email: ["A candidate with this email already exists"] }, values: raw };

  const id = crypto.randomUUID();
  try {
    const stmts = [
      db.insert(candidates).values({ id, userId: user.uid, ...data }),
      db.insert(stageEvents).values({ candidateId: id, fromStage: null, toStage: "applied", note: "Candidate added" }),
    ] as const;
    if (resume) {
      await db.batch([...stmts, db.insert(resumeFiles).values({ candidateId: id, ...resume })]);
    } else {
      await db.batch([...stmts]);
    }
  } catch {
    return { message: "Could not save the candidate. Check your connection and try again.", values: raw };
  }

  const notify = process.env.NOTIFY_EMAIL ?? process.env.ADMIN_EMAIL;
  if (notify) {
    const base = process.env.APP_URL ?? "http://localhost:3000";
    after(() => sendEmail({ to: notify, ...newCandidateEmail({ name: data.name, jobTitle: job.title, url: `${base}/candidates/${id}` }) }));
  }

  refresh();
  redirect(`/candidates/${id}`);
}

export async function updateCandidate(id: string, _prev: FormState, fd: FormData): Promise<FormState> {
  const user = await requireUser();
  if (!isUuid(id)) return { message: "Candidate not found." };
  const raw = readForm(fd);
  const parsed = candidateSchema.safeParse(raw);
  const resume = await readResume(fd);
  const errors: Record<string, string[] | undefined> = parsed.success ? {} : z.flattenError(parsed.error).fieldErrors;
  if (resume && "error" in resume) errors.resume = [resume.error];
  if (Object.keys(errors).length || !parsed.success || (resume && "error" in resume)) return { errors, values: raw };

  const db = getDb();
  const data = parsed.data;

  const job = await checkJob(data.jobId, user.uid);
  if (!job) return { errors: { jobId: ["That role no longer exists"] }, values: raw };

  const dup = await db
    .select({ id: candidates.id })
    .from(candidates)
    .where(and(eq(candidates.email, data.email), ne(candidates.id, id), eq(candidates.userId, user.uid)))
    .limit(1);
  if (dup.length) return { errors: { email: ["Another candidate already uses this email"] }, values: raw };

  const removeResume = fd.get("removeResume") === "on";
  try {
    const update = db.update(candidates).set({ ...data, updatedAt: new Date() }).where(eq(candidates.id, id));
    if (resume) {
      await db.batch([
        update,
        db.delete(resumeFiles).where(eq(resumeFiles.candidateId, id)),
        db.insert(resumeFiles).values({ candidateId: id, ...resume }),
      ]);
    } else if (removeResume) {
      await db.batch([update, db.delete(resumeFiles).where(eq(resumeFiles.candidateId, id))]);
    } else {
      await update;
    }
  } catch {
    return { message: "Could not save changes. Check your connection and try again.", values: raw };
  }

  refresh();
  redirect(`/candidates/${id}`);
}

export async function changeStage(
  id: string,
  to: string,
  note?: string,
  notifyCandidate = false,
): Promise<{ ok: boolean; error?: string }> {
  await requireUser();
  if (!isUuid(id) || !isStage(to)) return { ok: false, error: "Invalid request." };
  const db = getDb();

  const [current] = await db
    .select({ stage: candidates.stage, name: candidates.name, email: candidates.email, jobTitle: jobs.title })
    .from(candidates)
    .innerJoin(jobs, eq(jobs.id, candidates.jobId))
    .where(eq(candidates.id, id))
    .limit(1);
  if (!current) return { ok: false, error: "Candidate not found." };
  if (!canMove(current.stage, to)) return { ok: false, error: `Cannot move from ${current.stage} to ${to}.` };

  const cleanNote = note?.trim() ? note.trim().slice(0, 500) : null;
  try {
    await db.batch([
      db.update(candidates).set({ stage: to, updatedAt: new Date() }).where(eq(candidates.id, id)),
      db.insert(stageEvents).values({ candidateId: id, fromStage: current.stage, toStage: to, note: cleanNote }),
    ]);
  } catch {
    return { ok: false, error: "Could not update the stage. Try again." };
  }

  if (notifyCandidate) {
    after(() => sendEmail({ to: current.email, ...stageEmail({ name: current.name, jobTitle: current.jobTitle, stage: to, note: cleanNote }) }));
  }

  refresh();
  return { ok: true };
}

export async function deleteCandidate(id: string) {
  await requireUser();
  if (!isUuid(id)) return;
  await getDb().delete(candidates).where(eq(candidates.id, id));
  refresh();
  redirect("/candidates");
}

export async function addNote(candidateId: string, _prev: FormState, fd: FormData): Promise<FormState> {
  const user = await requireUser();
  if (!isUuid(candidateId)) return { message: "Candidate not found." };
  const parsed = noteSchema.safeParse({ body: String(fd.get("body") ?? "") });
  if (!parsed.success) return { errors: z.flattenError(parsed.error).fieldErrors };
  try {
    await getDb().insert(candidateNotes).values({ candidateId, body: parsed.data.body, author: user.sub });
  } catch {
    return { message: "Could not save the note. Try again." };
  }
  refresh();
  return { values: { saved: "1" } };
}

export async function deleteNote(noteId: string) {
  await requireUser();
  if (!isUuid(noteId)) return;
  await getDb().delete(candidateNotes).where(eq(candidateNotes.id, noteId));
  refresh();
}
