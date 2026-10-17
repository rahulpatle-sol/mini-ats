"use server";

import { and, eq, ne } from "drizzle-orm";
import { revalidatePath } from "next/cache";
import { redirect } from "next/navigation";
import { z } from "zod";
import { getDb } from "@/db";
import { candidates, stageEvents } from "@/db/schema";
import { canMove, isStage } from "@/lib/constants";
import { isUuid } from "@/lib/utils";
import { candidateSchema } from "@/lib/validators";

export type FormState = {
  errors?: Record<string, string[] | undefined>;
  message?: string;
  values?: Record<string, string>;
};

const FIELDS = ["name", "email", "phone", "position", "skills", "experienceYears", "source", "resumeUrl", "notes"] as const;

function readForm(fd: FormData) {
  return Object.fromEntries(FIELDS.map((k) => [k, String(fd.get(k) ?? "")])) as Record<(typeof FIELDS)[number], string>;
}

function refresh() {
  revalidatePath("/", "layout");
}

export async function createCandidate(_prev: FormState, fd: FormData): Promise<FormState> {
  const raw = readForm(fd);
  const parsed = candidateSchema.safeParse(raw);
  if (!parsed.success) {
    return { errors: z.flattenError(parsed.error).fieldErrors, values: raw };
  }

  const db = getDb();
  const data = parsed.data;

  const dup = await db.select({ id: candidates.id }).from(candidates).where(eq(candidates.email, data.email)).limit(1);
  if (dup.length) {
    return { errors: { email: ["A candidate with this email already exists"] }, values: raw };
  }

  const id = crypto.randomUUID();
  try {
    await db.batch([
      db.insert(candidates).values({ id, ...data }),
      db.insert(stageEvents).values({ candidateId: id, fromStage: null, toStage: "applied", note: "Candidate added" }),
    ]);
  } catch {
    return { message: "Could not save the candidate. Check your connection and try again.", values: raw };
  }

  refresh();
  redirect(`/candidates/${id}`);
}

export async function updateCandidate(id: string, _prev: FormState, fd: FormData): Promise<FormState> {
  if (!isUuid(id)) return { message: "Candidate not found." };
  const raw = readForm(fd);
  const parsed = candidateSchema.safeParse(raw);
  if (!parsed.success) {
    return { errors: z.flattenError(parsed.error).fieldErrors, values: raw };
  }

  const db = getDb();
  const data = parsed.data;

  const dup = await db
    .select({ id: candidates.id })
    .from(candidates)
    .where(and(eq(candidates.email, data.email), ne(candidates.id, id)))
    .limit(1);
  if (dup.length) {
    return { errors: { email: ["Another candidate already uses this email"] }, values: raw };
  }

  try {
    await db.update(candidates).set({ ...data, updatedAt: new Date() }).where(eq(candidates.id, id));
  } catch {
    return { message: "Could not save changes. Check your connection and try again.", values: raw };
  }

  refresh();
  redirect(`/candidates/${id}`);
}

export async function changeStage(id: string, to: string, note?: string): Promise<{ ok: boolean; error?: string }> {
  if (!isUuid(id) || !isStage(to)) return { ok: false, error: "Invalid request." };
  const db = getDb();

  const [current] = await db
    .select({ stage: candidates.stage })
    .from(candidates)
    .where(eq(candidates.id, id))
    .limit(1);
  if (!current) return { ok: false, error: "Candidate not found." };
  if (!canMove(current.stage, to)) {
    return { ok: false, error: `Cannot move from ${current.stage} to ${to}.` };
  }

  try {
    await db.batch([
      db.update(candidates).set({ stage: to, updatedAt: new Date() }).where(eq(candidates.id, id)),
      db.insert(stageEvents).values({
        candidateId: id,
        fromStage: current.stage,
        toStage: to,
        note: note?.trim() ? note.trim().slice(0, 500) : null,
      }),
    ]);
  } catch {
    return { ok: false, error: "Could not update the stage. Try again." };
  }

  refresh();
  return { ok: true };
}

export async function deleteCandidate(id: string) {
  if (!isUuid(id)) return;
  await getDb().delete(candidates).where(eq(candidates.id, id));
  refresh();
  redirect("/candidates");
}
