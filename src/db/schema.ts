import { sql } from "drizzle-orm";
import {
  index,
  integer,
  pgEnum,
  pgTable,
  text,
  timestamp,
  uuid,
} from "drizzle-orm/pg-core";

export const stageEnum = pgEnum("stage", [
  "applied",
  "screening",
  "interview",
  "offer",
  "hired",
  "rejected",
]);

export const jobStatusEnum = pgEnum("job_status", ["open", "closed"]);

export const users = pgTable(
  "users",
  {
    id: uuid("id").defaultRandom().primaryKey(),
    email: text("email").notNull().unique(),
    passwordHash: text("password_hash").notNull(),
    name: text("name").notNull(),
    createdAt: timestamp("created_at", { withTimezone: true }).notNull().defaultNow(),
  },
  (t) => [index("users_email_idx").on(t.email)],
);

export const jobs = pgTable(
  "jobs",
  {
    id: uuid("id").defaultRandom().primaryKey(),
    userId: uuid("user_id")
      .notNull()
      .references(() => users.id, { onDelete: "cascade" }),
    title: text("title").notNull(),
    department: text("department"),
    status: jobStatusEnum("status").notNull().default("open"),
    createdAt: timestamp("created_at", { withTimezone: true }).notNull().defaultNow(),
    updatedAt: timestamp("updated_at", { withTimezone: true }).notNull().defaultNow(),
  },
  (t) => [
    index("jobs_status_idx").on(t.status),
    index("jobs_user_idx").on(t.userId),
    index("jobs_user_title_idx").on(t.userId, t.title),
  ],
);

export const candidates = pgTable(
  "candidates",
  {
    id: uuid("id").defaultRandom().primaryKey(),
    userId: uuid("user_id")
      .notNull()
      .references(() => users.id, { onDelete: "cascade" }),
    name: text("name").notNull(),
    email: text("email").notNull(),
    phone: text("phone"),
    jobId: uuid("job_id")
      .notNull()
      .references(() => jobs.id, { onDelete: "restrict" }),
    stage: stageEnum("stage").notNull().default("applied"),
    skills: text("skills")
      .array()
      .notNull()
      .default(sql`'{}'::text[]`),
    experienceYears: integer("experience_years").notNull().default(0),
    source: text("source"),
    resumeUrl: text("resume_url"),
    createdAt: timestamp("created_at", { withTimezone: true }).notNull().defaultNow(),
    updatedAt: timestamp("updated_at", { withTimezone: true }).notNull().defaultNow(),
  },
  (t) => [
    index("candidates_stage_idx").on(t.stage),
    index("candidates_job_idx").on(t.jobId),
    index("candidates_user_idx").on(t.userId),
    index("candidates_user_email_idx").on(t.userId, t.email),
    index("candidates_created_at_idx").on(t.createdAt),
  ],
);

export const candidateNotes = pgTable(
  "candidate_notes",
  {
    id: uuid("id").defaultRandom().primaryKey(),
    candidateId: uuid("candidate_id")
      .notNull()
      .references(() => candidates.id, { onDelete: "cascade" }),
    body: text("body").notNull(),
    author: text("author"),
    createdAt: timestamp("created_at", { withTimezone: true }).notNull().defaultNow(),
  },
  (t) => [index("candidate_notes_candidate_idx").on(t.candidateId)],
);

export const resumeFiles = pgTable(
  "resume_files",
  {
    id: uuid("id").defaultRandom().primaryKey(),
    candidateId: uuid("candidate_id")
      .notNull()
      .references(() => candidates.id, { onDelete: "cascade" }),
    filename: text("filename").notNull(),
    contentType: text("content_type").notNull(),
    size: integer("size").notNull(),
    data: text("data").notNull(),
    createdAt: timestamp("created_at", { withTimezone: true }).notNull().defaultNow(),
  },
  (t) => [index("resume_files_candidate_idx").on(t.candidateId)],
);

export const stageEvents = pgTable(
  "stage_events",
  {
    id: uuid("id").defaultRandom().primaryKey(),
    candidateId: uuid("candidate_id")
      .notNull()
      .references(() => candidates.id, { onDelete: "cascade" }),
    fromStage: stageEnum("from_stage"),
    toStage: stageEnum("to_stage").notNull(),
    note: text("note"),
    createdAt: timestamp("created_at", { withTimezone: true }).notNull().defaultNow(),
  },
  (t) => [index("stage_events_candidate_idx").on(t.candidateId)],
);

export type User = typeof users.$inferSelect;
export type Candidate = typeof candidates.$inferSelect;
export type Job = typeof jobs.$inferSelect;
export type CandidateNote = typeof candidateNotes.$inferSelect;
export type ResumeFile = typeof resumeFiles.$inferSelect;
export type StageEvent = typeof stageEvents.$inferSelect;
