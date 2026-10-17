"use server";

import { eq } from "drizzle-orm";
import { revalidatePath } from "next/cache";
import { redirect } from "next/navigation";
import { z } from "zod";
import { getDb } from "@/db";
import { candidates, jobs } from "@/db/schema";
import type { FormState } from "@/actions/candidates";
import { requireUser } from "@/lib/session";
import { isUuid } from "@/lib/utils";
import { jobSchema } from "@/lib/validators";

function readJob(fd: FormData) {
  return {
    title: String(fd.get("title") ?? ""),
    department: String(fd.get("department") ?? ""),
    status: String(fd.get("status") ?? "open"),
  };
}

async function titleTaken(title: string, exceptId?: string) {
  const rows = await getDb().select({ id: jobs.id, title: jobs.title }).from(jobs);
  return rows.some((r) => r.title.toLowerCase() === title.toLowerCase() && r.id !== exceptId);
}

export async function createJob(_prev: FormState, fd: FormData): Promise<FormState> {
  await requireUser();
  const raw = readJob(fd);
  const parsed = jobSchema.safeParse(raw);
  if (!parsed.success) return { errors: z.flattenError(parsed.error).fieldErrors, values: raw };
  if (await titleTaken(parsed.data.title)) return { errors: { title: ["A job with this title already exists"] }, values: raw };
  try {
    await getDb().insert(jobs).values(parsed.data);
  } catch {
    return { message: "Could not save the job. Try again.", values: raw };
  }
  revalidatePath("/", "layout");
  redirect("/jobs");
}

export async function updateJob(id: string, _prev: FormState, fd: FormData): Promise<FormState> {
  await requireUser();
  if (!isUuid(id)) return { message: "Job not found." };
  const raw = readJob(fd);
  const parsed = jobSchema.safeParse(raw);
  if (!parsed.success) return { errors: z.flattenError(parsed.error).fieldErrors, values: raw };
  if (await titleTaken(parsed.data.title, id)) return { errors: { title: ["A job with this title already exists"] }, values: raw };
  try {
    await getDb().update(jobs).set(parsed.data).where(eq(jobs.id, id));
  } catch {
    return { message: "Could not save changes. Try again.", values: raw };
  }
  revalidatePath("/", "layout");
  redirect("/jobs");
}

export async function setJobStatus(id: string, status: "open" | "closed") {
  await requireUser();
  if (!isUuid(id)) return;
  await getDb().update(jobs).set({ status, updatedAt: new Date() }).where(eq(jobs.id, id));
  revalidatePath("/", "layout");
}

export async function deleteJob(id: string): Promise<{ ok: boolean; error?: string }> {
  await requireUser();
  if (!isUuid(id)) return { ok: false, error: "Job not found." };
  const db = getDb();
  const used = await db.select({ id: candidates.id }).from(candidates).where(eq(candidates.jobId, id)).limit(1);
  if (used.length) return { ok: false, error: "This job has candidates. Close it instead of deleting." };
  await db.delete(jobs).where(eq(jobs.id, id));
  revalidatePath("/", "layout");
  return { ok: true };
}
