import { z } from "zod";

const optionalText = (max: number) =>
  z
    .string()
    .trim()
    .max(max, `Keep this under ${max} characters`)
    .transform((v) => (v === "" ? null : v));

export const candidateSchema = z.object({
  name: z.string().trim().min(2, "Enter the candidate's full name").max(100),
  email: z.string().trim().toLowerCase().pipe(z.email("Enter a valid email address")),
  phone: optionalText(30),
  jobId: z.string().pipe(z.uuid("Choose a role")),
  skills: z
    .string()
    .transform((s) => Array.from(new Set(s.split(",").map((x) => x.trim()).filter(Boolean))))
    .pipe(z.array(z.string().max(40, "Each skill must be under 40 characters")).max(20, "Add up to 20 skills")),
  experienceYears: z.coerce
    .number({ error: "Enter a number" })
    .int("Use whole years")
    .min(0, "Cannot be negative")
    .max(60, "That looks too high"),
  source: optionalText(50),
  resumeUrl: z
    .string()
    .trim()
    .transform((v) => (v === "" ? null : v))
    .pipe(z.union([z.null(), z.url("Enter a full link starting with https://")])),
});

export type CandidateInput = z.infer<typeof candidateSchema>;

export const jobSchema = z.object({
  title: z.string().trim().min(2, "Enter a job title").max(100),
  department: optionalText(60),
  status: z.enum(["open", "closed"]),
});

export const noteSchema = z.object({
  body: z.string().trim().min(1, "Write a note first").max(2000, "Keep notes under 2000 characters"),
});
