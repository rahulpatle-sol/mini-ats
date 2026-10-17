import { and, asc, count, desc, eq, getTableColumns, gte, ilike, or, sql, type SQL } from "drizzle-orm";
import { getDb } from "@/db";
import { candidateNotes, candidates, jobs, resumeFiles, stageEvents } from "@/db/schema";
import { PAGE_SIZE, PIPELINE, STAGES, type SortKey, type Stage } from "@/lib/constants";
import { isUuid } from "@/lib/utils";

export type CandidateFilters = {
  userId: string;
  q?: string;
  stage?: Stage;
  jobId?: string;
  sort?: SortKey;
  page?: number;
};

const candidateCols = { ...getTableColumns(candidates), jobTitle: jobs.title };

function buildWhere(f: CandidateFilters) {
  const conds: (SQL | undefined)[] = [eq(candidates.userId, f.userId)];
  const q = f.q?.trim();
  if (q) {
    const like = `%${q.replace(/[\\%_]/g, "\\$&")}%`;
    conds.push(
      or(
        ilike(candidates.name, like),
        ilike(candidates.email, like),
        ilike(jobs.title, like),
        sql`array_to_string(${candidates.skills}, ' ') ilike ${like}`,
      ),
    );
  }
  if (f.stage) conds.push(eq(candidates.stage, f.stage));
  if (f.jobId && isUuid(f.jobId)) conds.push(eq(candidates.jobId, f.jobId));
  return and(...conds);
}

function orderBy(sort: SortKey = "newest") {
  switch (sort) {
    case "oldest":
      return [asc(candidates.createdAt)];
    case "name":
      return [asc(candidates.name)];
    case "experience":
      return [desc(candidates.experienceYears), asc(candidates.name)];
    default:
      return [desc(candidates.createdAt)];
  }
}

export async function listCandidates(f: CandidateFilters) {
  const db = getDb();
  const where = buildWhere(f);
  const page = Math.max(1, f.page ?? 1);

  const [rows, totalRows] = await Promise.all([
    db
      .select(candidateCols)
      .from(candidates)
      .innerJoin(jobs, eq(jobs.id, candidates.jobId))
      .where(where)
      .orderBy(...orderBy(f.sort))
      .limit(PAGE_SIZE)
      .offset((page - 1) * PAGE_SIZE),
    db.select({ n: count() }).from(candidates).innerJoin(jobs, eq(jobs.id, candidates.jobId)).where(where),
  ]);

  const total = totalRows[0]?.n ?? 0;
  return { rows, total, page, pageCount: Math.max(1, Math.ceil(total / PAGE_SIZE)) };
}

export async function listAllCandidates(f: CandidateFilters, limit = 5000) {
  return getDb()
    .select(candidateCols)
    .from(candidates)
    .innerJoin(jobs, eq(jobs.id, candidates.jobId))
    .where(buildWhere(f))
    .orderBy(...orderBy(f.sort))
    .limit(limit);
}

export async function getStageCounts(userId: string) {
  const rows = await getDb()
    .select({ stage: candidates.stage, n: count() })
    .from(candidates)
    .where(eq(candidates.userId, userId))
    .groupBy(candidates.stage);
  const counts = Object.fromEntries(STAGES.map((s) => [s, 0])) as Record<Stage, number>;
  for (const r of rows) counts[r.stage] = r.n;
  return counts;
}

export async function getJobs(userId: string) {
  return getDb().select().from(jobs).where(eq(jobs.userId, userId)).orderBy(asc(jobs.title));
}

export async function getJobsWithCounts(userId: string) {
  return getDb()
    .select({ ...getTableColumns(jobs), candidateCount: count(candidates.id) })
    .from(jobs)
    .leftJoin(candidates, eq(candidates.jobId, jobs.id))
    .where(eq(jobs.userId, userId))
    .groupBy(jobs.id)
    .orderBy(asc(jobs.status), asc(jobs.title));
}

export async function getJob(id: string, userId: string) {
  if (!isUuid(id)) return null;
  const [row] = await getDb().select().from(jobs).where(and(eq(jobs.id, id), eq(jobs.userId, userId))).limit(1);
  return row ?? null;
}

export async function getCandidate(id: string, userId: string) {
  if (!isUuid(id)) return null;
  const [row] = await getDb()
    .select(candidateCols)
    .from(candidates)
    .innerJoin(jobs, eq(jobs.id, candidates.jobId))
    .where(and(eq(candidates.id, id), eq(candidates.userId, userId)))
    .limit(1);
  return row ?? null;
}

export async function getCandidateEvents(id: string) {
  return getDb().select().from(stageEvents).where(eq(stageEvents.candidateId, id)).orderBy(desc(stageEvents.createdAt));
}

export async function getCandidateNotes(id: string) {
  return getDb().select().from(candidateNotes).where(eq(candidateNotes.candidateId, id)).orderBy(desc(candidateNotes.createdAt));
}

export async function getResumeMeta(candidateId: string) {
  const [row] = await getDb()
    .select({ id: resumeFiles.id, filename: resumeFiles.filename, size: resumeFiles.size, contentType: resumeFiles.contentType })
    .from(resumeFiles)
    .where(eq(resumeFiles.candidateId, candidateId))
    .limit(1);
  return row ?? null;
}

export async function getResumeFile(id: string) {
  if (!isUuid(id)) return null;
  const [row] = await getDb().select().from(resumeFiles).where(eq(resumeFiles.id, id)).limit(1);
  return row ?? null;
}

export async function getBoard(userId: string) {
  const rows = await getDb()
    .select(candidateCols)
    .from(candidates)
    .innerJoin(jobs, eq(jobs.id, candidates.jobId))
    .where(eq(candidates.userId, userId))
    .orderBy(desc(candidates.updatedAt))
    .limit(300);
  const board = Object.fromEntries(STAGES.map((s) => [s, [] as typeof rows])) as Record<Stage, typeof rows>;
  for (const r of rows) board[r.stage].push(r);
  return board;
}

function startOfWeek(d: Date) {
  const x = new Date(d);
  const day = (x.getDay() + 6) % 7;
  x.setHours(0, 0, 0, 0);
  x.setDate(x.getDate() - day);
  return x;
}

export async function getDashboard(userId: string) {
  const db = getDb();
  const weeks = 8;
  const thisWeek = startOfWeek(new Date());
  const since = new Date(thisWeek);
  since.setDate(since.getDate() - 7 * (weeks - 1));

  const userCond = eq(candidates.userId, userId);
  const [stageCounts, recentCandidates, jobRows, recentEvents, hiredRows] = await Promise.all([
    getStageCounts(userId),
    db.select({ createdAt: candidates.createdAt }).from(candidates).where(and(userCond, gte(candidates.createdAt, since))),
    db
      .select({ id: jobs.id, title: jobs.title, n: count() })
      .from(candidates)
      .innerJoin(jobs, eq(jobs.id, candidates.jobId))
      .where(userCond)
      .groupBy(jobs.id, jobs.title)
      .orderBy(desc(count()), asc(jobs.title))
      .limit(5),
    db
      .select({
        id: stageEvents.id,
        candidateId: stageEvents.candidateId,
        name: candidates.name,
        jobTitle: jobs.title,
        fromStage: stageEvents.fromStage,
        toStage: stageEvents.toStage,
        createdAt: stageEvents.createdAt,
      })
      .from(stageEvents)
      .innerJoin(candidates, eq(candidates.id, stageEvents.candidateId))
      .innerJoin(jobs, eq(jobs.id, candidates.jobId))
      .where(userCond)
      .orderBy(desc(stageEvents.createdAt))
      .limit(7),
    db
      .select({ hiredAt: stageEvents.createdAt, appliedAt: candidates.createdAt })
      .from(stageEvents)
      .innerJoin(candidates, eq(candidates.id, stageEvents.candidateId))
      .where(and(userCond, eq(stageEvents.toStage, "hired"))),
  ]);

  const total = STAGES.reduce((sum, s) => sum + stageCounts[s], 0);
  const active = PIPELINE.filter((s) => s !== "hired").reduce((sum, s) => sum + stageCounts[s], 0);
  const hired = stageCounts.hired;
  const rejected = stageCounts.rejected;

  const weekly = Array.from({ length: weeks }, (_, i) => {
    const start = new Date(since);
    start.setDate(start.getDate() + i * 7);
    return { start, n: 0 };
  });
  for (const c of recentCandidates) {
    const idx = Math.round((startOfWeek(c.createdAt).getTime() - since.getTime()) / (7 * 86_400_000));
    if (idx >= 0 && idx < weeks) weekly[idx]!.n += 1;
  }

  const avgDaysToHire = hiredRows.length
    ? hiredRows.reduce((s, r) => s + (r.hiredAt.getTime() - r.appliedAt.getTime()) / 86_400_000, 0) / hiredRows.length
    : null;

  return {
    total,
    active,
    hired,
    rejected,
    hireRate: total ? Math.round((hired / total) * 100) : 0,
    avgDaysToHire,
    stageCounts,
    weekly,
    jobs: jobRows,
    recentEvents,
  };
}
