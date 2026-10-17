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

export const candidates = pgTable(
  "candidates",
  {
    id: uuid("id").defaultRandom().primaryKey(),
    name: text("name").notNull(),
    email: text("email").notNull().unique(),
    phone: text("phone"),
    position: text("position").notNull(),
    stage: stageEnum("stage").notNull().default("applied"),
    skills: text("skills")
      .array()
      .notNull()
      .default(sql`'{}'::text[]`),
    experienceYears: integer("experience_years").notNull().default(0),
    source: text("source"),
    resumeUrl: text("resume_url"),
    notes: text("notes"),
    createdAt: timestamp("created_at", { withTimezone: true }).notNull().defaultNow(),
    updatedAt: timestamp("updated_at", { withTimezone: true }).notNull().defaultNow(),
  },
  (t) => [
    index("candidates_stage_idx").on(t.stage),
    index("candidates_created_at_idx").on(t.createdAt),
  ],
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

export type Candidate = typeof candidates.$inferSelect;
export type StageEvent = typeof stageEvents.$inferSelect;
