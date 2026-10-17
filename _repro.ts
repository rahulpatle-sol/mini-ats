import { neon } from "@neondatabase/serverless";
import { drizzle } from "drizzle-orm/neon-http";
import { and, eq, sql, count, gte, desc, asc } from "drizzle-orm";
import { candidates, jobs, stageEvents } from "./src/db/schema";

const db = drizzle(neon(process.env.DATABASE_URL!));
const uid = "e7d1eeb0-09ba-46f5-9f1c-48a0c39382b3";
const since = new Date(Date.now() - 8 * 7 * 86400000);

async function main() {
  for (let attempt = 1; attempt <= 3; attempt++) {
    try {
      const t0 = Date.now();
      const results = await Promise.all([
        db.select({ n: count() }).from(candidates).where(eq(candidates.userId, uid)),
        db.select({ createdAt: candidates.createdAt }).from(candidates).where(and(eq(candidates.userId, uid), gte(candidates.createdAt, since))),
        db.select({ id: jobs.id, n: count() }).from(candidates).innerJoin(jobs, eq(jobs.id, candidates.jobId)).where(eq(candidates.userId, uid)).groupBy(jobs.id),
        db.select({ id: stageEvents.id }).from(stageEvents).innerJoin(candidates, eq(candidates.id, stageEvents.candidateId)).innerJoin(jobs, eq(jobs.id, candidates.jobId)).where(eq(candidates.userId, uid)).orderBy(desc(stageEvents.createdAt)).limit(7),
        db.select({ hiredAt: stageEvents.createdAt, appliedAt: candidates.createdAt }).from(stageEvents).innerJoin(candidates, eq(candidates.id, stageEvents.candidateId)).where(and(eq(candidates.userId, uid), eq(stageEvents.toStage, "hired"))),
      ]);
      console.log(`attempt ${attempt}: OK in ${Date.now() - t0}ms`, results.map((r) => r.length));
    } catch (e: any) {
      console.log(`attempt ${attempt}: FAILED —`, e?.message, "| cause:", e?.cause?.message ?? e?.cause, "| code:", e?.code ?? e?.cause?.code);
    }
  }
  // orphan check
  const orphans = await db.execute(sql`select count(*) as n from stage_events se left join candidates c on c.id = se.candidate_id where c.id is null`);
  console.log("orphan stage_events:", orphans.rows[0]);
}
main();
