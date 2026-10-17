CREATE TYPE "stage" AS ENUM ('applied', 'screening', 'interview', 'offer', 'hired', 'rejected');
CREATE TYPE "job_status" AS ENUM ('open', 'closed');

CREATE TABLE "jobs" (
	"id" uuid PRIMARY KEY DEFAULT gen_random_uuid() NOT NULL,
	"title" text NOT NULL,
	"department" text,
	"status" "job_status" DEFAULT 'open' NOT NULL,
	"created_at" timestamp with time zone DEFAULT now() NOT NULL,
	"updated_at" timestamp with time zone DEFAULT now() NOT NULL,
	CONSTRAINT "jobs_title_unique" UNIQUE("title")
);

CREATE TABLE "candidates" (
	"id" uuid PRIMARY KEY DEFAULT gen_random_uuid() NOT NULL,
	"name" text NOT NULL,
	"email" text NOT NULL,
	"phone" text,
	"job_id" uuid NOT NULL,
	"stage" "stage" DEFAULT 'applied' NOT NULL,
	"skills" text[] DEFAULT '{}'::text[] NOT NULL,
	"experience_years" integer DEFAULT 0 NOT NULL,
	"source" text,
	"resume_url" text,
	"created_at" timestamp with time zone DEFAULT now() NOT NULL,
	"updated_at" timestamp with time zone DEFAULT now() NOT NULL,
	CONSTRAINT "candidates_email_unique" UNIQUE("email")
);

CREATE TABLE "candidate_notes" (
	"id" uuid PRIMARY KEY DEFAULT gen_random_uuid() NOT NULL,
	"candidate_id" uuid NOT NULL,
	"body" text NOT NULL,
	"author" text,
	"created_at" timestamp with time zone DEFAULT now() NOT NULL
);

CREATE TABLE "resume_files" (
	"id" uuid PRIMARY KEY DEFAULT gen_random_uuid() NOT NULL,
	"candidate_id" uuid NOT NULL,
	"filename" text NOT NULL,
	"content_type" text NOT NULL,
	"size" integer NOT NULL,
	"data" text NOT NULL,
	"created_at" timestamp with time zone DEFAULT now() NOT NULL
);

CREATE TABLE "stage_events" (
	"id" uuid PRIMARY KEY DEFAULT gen_random_uuid() NOT NULL,
	"candidate_id" uuid NOT NULL,
	"from_stage" "stage",
	"to_stage" "stage" NOT NULL,
	"note" text,
	"created_at" timestamp with time zone DEFAULT now() NOT NULL
);

ALTER TABLE "candidates" ADD CONSTRAINT "candidates_job_id_jobs_id_fk" FOREIGN KEY ("job_id") REFERENCES "public"."jobs"("id") ON DELETE restrict ON UPDATE no action;
ALTER TABLE "candidate_notes" ADD CONSTRAINT "candidate_notes_candidate_id_candidates_id_fk" FOREIGN KEY ("candidate_id") REFERENCES "public"."candidates"("id") ON DELETE cascade ON UPDATE no action;
ALTER TABLE "resume_files" ADD CONSTRAINT "resume_files_candidate_id_candidates_id_fk" FOREIGN KEY ("candidate_id") REFERENCES "public"."candidates"("id") ON DELETE cascade ON UPDATE no action;
ALTER TABLE "stage_events" ADD CONSTRAINT "stage_events_candidate_id_candidates_id_fk" FOREIGN KEY ("candidate_id") REFERENCES "public"."candidates"("id") ON DELETE cascade ON UPDATE no action;

CREATE INDEX "jobs_status_idx" ON "jobs" USING btree ("status");
CREATE INDEX "candidates_stage_idx" ON "candidates" USING btree ("stage");
CREATE INDEX "candidates_job_idx" ON "candidates" USING btree ("job_id");
CREATE INDEX "candidates_created_at_idx" ON "candidates" USING btree ("created_at");
CREATE INDEX "candidate_notes_candidate_idx" ON "candidate_notes" USING btree ("candidate_id");
CREATE INDEX "resume_files_candidate_idx" ON "resume_files" USING btree ("candidate_id");
CREATE INDEX "stage_events_candidate_idx" ON "stage_events" USING btree ("candidate_id");
