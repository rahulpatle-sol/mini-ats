import { neon } from "@neondatabase/serverless";

const url = process.env.DATABASE_URL;
if (!url) throw new Error("DATABASE_URL missing");
const sql = neon(url);

async function main() {
  // 1. users table
  await sql`
    CREATE TABLE IF NOT EXISTS "users" (
      "id" uuid PRIMARY KEY DEFAULT gen_random_uuid() NOT NULL,
      "email" text NOT NULL,
      "password_hash" text NOT NULL,
      "name" text NOT NULL,
      "created_at" timestamp with time zone DEFAULT now() NOT NULL
    )
  `;
  await sql`CREATE UNIQUE INDEX IF NOT EXISTS "users_email_unique" ON "users" ("email")`;

  // ensure a demo user exists before any backfill
  const [existingUser] = await sql`SELECT id FROM "users" LIMIT 1`;
  let userId: string;
  if (existingUser) {
    userId = existingUser.id as string;
  } else {
    const created = await sql`
      INSERT INTO "users" ("email", "password_hash", "name")
      VALUES ('admin@example.com', 'placeholder-will-be-reseeded', 'Demo Admin')
      RETURNING id
    `;
    userId = created[0].id as string;
    console.log("Created placeholder user admin@example.com");
  }

  // 2. jobs table (create if missing, else add user_id column)
  await sql`
    CREATE TABLE IF NOT EXISTS "jobs" (
      "id" uuid PRIMARY KEY DEFAULT gen_random_uuid() NOT NULL,
      "user_id" uuid NOT NULL REFERENCES "users"("id") ON DELETE cascade,
      "title" text NOT NULL,
      "department" text,
      "status" "job_status" DEFAULT 'open' NOT NULL,
      "created_at" timestamp with time zone DEFAULT now() NOT NULL,
      "updated_at" timestamp with time zone DEFAULT now() NOT NULL
    )
  `;
  const jobsHasUserId = await sql`
    SELECT column_name FROM information_schema.columns
    WHERE table_name = 'jobs' AND column_name = 'user_id'
  `;
  if (jobsHasUserId.length === 0) {
    await sql`ALTER TABLE "jobs" ADD COLUMN "user_id" uuid REFERENCES "users"("id") ON DELETE cascade`;
    const [u] = await sql`SELECT id FROM "users" LIMIT 1`;
    if (u) {
      await sql`UPDATE "jobs" SET "user_id" = ${u.id} WHERE "user_id" IS NULL`;
    }
  }
  await sql`CREATE INDEX IF NOT EXISTS "jobs_user_idx" ON "jobs" ("user_id")`;

  // 3. add user_id to candidates
  const hasUserId = await sql`
    SELECT column_name FROM information_schema.columns
    WHERE table_name = 'candidates' AND column_name = 'user_id'
  `;
  if (hasUserId.length === 0) {
    await sql`ALTER TABLE "candidates" ADD COLUMN "user_id" uuid`;
    await sql`UPDATE "candidates" SET "user_id" = ${userId} WHERE "user_id" IS NULL`;
    await sql`ALTER TABLE "candidates" ALTER COLUMN "user_id" SET NOT NULL`;
    await sql`ALTER TABLE "candidates" ADD FOREIGN KEY ("user_id") REFERENCES "users"("id") ON DELETE cascade`;
    await sql`CREATE INDEX IF NOT EXISTS "candidates_user_idx" ON "candidates" ("user_id")`;
  }

  // 4. candidates: drop old position column if exists, drop notes column
  const hasPosition = await sql`
    SELECT column_name FROM information_schema.columns
    WHERE table_name = 'candidates' AND column_name = 'position'
  `;
  if (hasPosition.length > 0) {
    await sql`ALTER TABLE "candidates" DROP COLUMN "position"`;
  }
  const hasNotes = await sql`
    SELECT column_name FROM information_schema.columns
    WHERE table_name = 'candidates' AND column_name = 'notes'
  `;
  if (hasNotes.length > 0) {
    await sql`ALTER TABLE "candidates" DROP COLUMN "notes"`;
  }

  // 5. candidates: add job_id if missing (was position text before)
  const hasJobId = await sql`
    SELECT column_name FROM information_schema.columns
    WHERE table_name = 'candidates' AND column_name = 'job_id'
  `;
  if (hasJobId.length === 0) {
    await sql`ALTER TABLE "candidates" ADD COLUMN "job_id" uuid`;
    // jobs will be empty on fresh schema; leave NULL then set NOT NULL after seed
    console.log("NOTE: job_id added as nullable; run seed first, then: ALTER TABLE candidates ALTER COLUMN job_id SET NOT NULL;");
  }

  // 6. unique email per user (drop global unique if present)
  await sql`ALTER TABLE "candidates" DROP CONSTRAINT IF EXISTS "candidates_email_unique"`;
  await sql`DROP INDEX IF EXISTS "candidates_email_unique"`;
  await sql`CREATE UNIQUE INDEX IF NOT EXISTS "candidates_user_email_idx" ON "candidates" ("user_id", "email")`;
  await sql`CREATE INDEX IF NOT EXISTS "candidates_job_idx" ON "candidates" ("job_id")`;

  // 7. candidate_notes table
  await sql`
    CREATE TABLE IF NOT EXISTS "candidate_notes" (
      "id" uuid PRIMARY KEY DEFAULT gen_random_uuid() NOT NULL,
      "candidate_id" uuid NOT NULL REFERENCES "candidates"("id") ON DELETE cascade,
      "body" text NOT NULL,
      "author" text,
      "created_at" timestamp with time zone DEFAULT now() NOT NULL
    )
  `;
  await sql`CREATE INDEX IF NOT EXISTS "candidate_notes_candidate_idx" ON "candidate_notes" ("candidate_id")`;

  // 8. resume_files table
  await sql`
    CREATE TABLE IF NOT EXISTS "resume_files" (
      "id" uuid PRIMARY KEY DEFAULT gen_random_uuid() NOT NULL,
      "candidate_id" uuid NOT NULL REFERENCES "candidates"("id") ON DELETE cascade,
      "filename" text NOT NULL,
      "content_type" text NOT NULL,
      "size" integer NOT NULL,
      "data" text NOT NULL,
      "created_at" timestamp with time zone DEFAULT now() NOT NULL
    )
  `;
  await sql`CREATE INDEX IF NOT EXISTS "resume_files_candidate_idx" ON "resume_files" ("candidate_id")`;

  // 9. jobs: unique title per user (drop global unique)
  await sql`ALTER TABLE "jobs" DROP CONSTRAINT IF EXISTS "jobs_title_unique"`;
  await sql`DROP INDEX IF EXISTS "jobs_title_unique"`;
  await sql`CREATE UNIQUE INDEX IF NOT EXISTS "jobs_user_title_idx" ON "jobs" ("user_id", "title")`;

  console.log("Migration complete.");
}

main().catch((e) => {
  console.error(e);
  process.exit(1);
});
