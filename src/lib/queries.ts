import { and, asc, count, desc, eq, gte, ilike, or, sql, type SQL } from "drizzle-orm";
import { getDb } from "@/db";
import { candidates, stageEvents } from "@/db/schema";
import { PAGE_SIZE, PIPELINE, STAGES, type SortKey, type Stage } from "@/lib/constants";
import { isUuid } from "@/lib/utils";

export type CandidateFilters = {
  q?: string;
  stage?: Stage;
  position?: string;
  sort?: SortKey;
  page?: number;
};

function buildWhere(f: CandidateFilters) {
  const conds: (SQL | undefined)[] = [];
  const q = f.q?.trim();
  if (q) {
    const like = `%${q.replace(/[\\%_]/g, "\\$&")}%`;
    conds.push(
      or(
        ilike(candidates.name, like),
        ilike(candidates.email, like),
        ilike(candidates.position, like),
        sql`array_to_string(${candidates.skills}, ' ') ilike ${like}`,
      ),
    );
  }
  if (f.stage) conds.push(eq(candidates.stage, f.stage));
  if (f.position) conds.push(eq(candidates.position, f.position));
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
      .select()
      .from(candidates)
      .where(where)
      .orderBy(...orderBy(f.sort))
      .limit(PAGE_SIZE)
      .offset((page - 1) * PAGE_SIZE),
    db.select({ n: count() }).from(candidates).where(where),
  ]);

  const total = totalRows[0]?.n ?? 0;
  return { rows, total, page, pageCount: Math.max(1, Math.ceil(total / PAGE_SIZE)) };
}

export async function getStageCounts() {
  const db = getDb();
  const rows = await db
    .select({ stage: candidates.stage, n: count() })
    .from(candidates)
    .groupBy(candidates.stage);
  const counts = Object.fromEntries(STAGES.map((s) => [s, 0])) as Record<Stage, number>;
  for (const r of rows) counts[r.stage] = r.n;
  return counts;
}

export async function getPositions() {
  const db = getDb();
  const rows = await db
    .selectDistinct({ position: candidates.position })
    .from(candidates)
    .orderBy(asc(candidates.position));
  return rows.map((r) => r.position);
}

export async function getCandidate(id: string) {
  if (!isUuid(id)) return null;
  const db = getDb();
  const [row] = await db.select().from(candidates).where(eq(candidates.id, id)).limit(1);
  return row ?? null;
}

export async function getCandidateEvents(id: string) {
  const db = getDb();
  return db
    .select()
    .from(stageEvents)
    .where(eq(stageEvents.candidateId, id))
    .orderBy(desc(stageEvents.createdAt));
}

export async function getBoard() {
  const db = getDb();
  const rows = await db.select().from(candidates).orderBy(desc(candidates.updatedAt)).limit(300);
  const board = Object.fromEntries(STAGES.map((s) => [s, [] as typeof rows])) as Record<Stage, typeof rows>;
  for (const r of rows) board[r.stage].push(r);
  return board;
}

function startOfWeek(d: Date) {
  const x = new Date(d);
  const day = (x.getDay() + 6) % 7; // Monday = 0
  x.setHours(0, 0, 0, 0);
  x.setDate(x.getDate() - day);
  return x;
}

export async function getDashboard() {
  const db = getDb();
  const weeks = 8;
  const thisWeek = startOfWeek(new Date());
  const since = new Date(thisWeek);
  since.setDate(since.getDate() - 7 * (weeks - 1));

  const [stageCounts, recentCandidates, positionRows, recentEvents, hiredRows] = await Promise.all([
    getStageCounts(),
    db.select({ createdAt: candidates.createdAt }).from(candidates).where(gte(candidates.createdAt, since)),
    db
      .select({ position: candidates.position, n: count() })
      .from(candidates)
      .groupBy(candidates.position)
      .orderBy(desc(count()))
      .limit(5),
    db
      .select({
        id: stageEvents.id,
        candidateId: stageEvents.candidateId,
        name: candidates.name,
        position: candidates.position,
        fromStage: stageEvents.fromStage,
        toStage: stageEvents.toStage,
        createdAt: stageEvents.createdAt,
      })
      .from(stageEvents)
      .innerJoin(candidates, eq(candidates.id, stageEvents.candidateId))
      .orderBy(desc(stageEvents.createdAt))
      .limit(7),
    db
      .select({ hiredAt: stageEvents.createdAt, appliedAt: candidates.createdAt })
      .from(stageEvents)
      .innerJoin(candidates, eq(candidates.id, stageEvents.candidateId))
      .where(eq(stageEvents.toStage, "hired")),
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
    const idx = Math.floor((startOfWeek(c.createdAt).getTime() - since.getTime()) / (7 * 86_400_000));
    if (idx >= 0 && idx < weeks) weekly[idx]!.n += 1;
  }

  const avgDaysToHire = hiredRows.length
    ? hiredRows.reduce((s, r) => s + (r.hiredAt.getTime() - r.appliedAt.getTime()) / 86_400_000, 0) /
      hiredRows.length
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
    positions: positionRows,
    recentEvents,
  };
}
