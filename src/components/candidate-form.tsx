"use client";

import { Loader2 } from "lucide-react";
import Link from "next/link";
import { useActionState } from "react";
import type { FormState } from "@/actions/candidates";
import { Field } from "@/components/field";
import { SOURCES } from "@/lib/constants";

type Defaults = {
  name?: string;
  email?: string;
  phone?: string | null;
  jobId?: string;
  skills?: string[];
  experienceYears?: number;
  source?: string | null;
  resumeUrl?: string | null;
};

export function CandidateForm({
  action,
  defaults = {},
  jobs,
  existingResume,
  submitLabel,
  cancelHref,
}: {
  action: (prev: FormState, fd: FormData) => Promise<FormState>;
  defaults?: Defaults;
  jobs: { id: string; title: string; status: "open" | "closed" }[];
  existingResume?: { filename: string } | null;
  submitLabel: string;
  cancelHref: string;
}) {
  const [state, formAction, pending] = useActionState(action, {} as FormState);
  const v = state.values;
  const e = state.errors ?? {};

  const val = (key: keyof Defaults & string, fallback: string) => v?.[key] ?? fallback;
  const aria = (name: string) => ({
    "aria-invalid": e[name] ? true : undefined,
    "aria-describedby": e[name] ? `${name}-error` : undefined,
  });

  const selectable = jobs.filter((j) => j.status === "open" || j.id === defaults.jobId);

  if (jobs.length === 0) {
    return (
      <div className="card px-6 py-14 text-center">
        <h2 className="font-serif text-xl">Create a job first</h2>
        <p className="mx-auto mt-2 max-w-sm text-sm text-muted">Candidates apply for a role. Add at least one job, then come back.</p>
        <Link href="/jobs/new" className="btn-primary mt-5">
          Add a job
        </Link>
      </div>
    );
  }

  return (
    <form action={formAction} className="card space-y-6 p-6 md:p-8" noValidate>
      {state.message && (
        <p role="alert" className="rounded-xl bg-rose-500/10 px-4 py-3 text-sm text-rose-800 dark:text-rose-300">
          {state.message}
        </p>
      )}

      <div className="grid gap-5 md:grid-cols-2">
        <Field label="Full name" name="name" error={e.name}>
          <input id="name" name="name" required defaultValue={val("name", defaults.name ?? "")} placeholder="Aarav Sharma" className="field" {...aria("name")} />
        </Field>
        <Field label="Email" name="email" error={e.email}>
          <input id="email" name="email" type="email" required defaultValue={val("email", defaults.email ?? "")} placeholder="aarav@example.com" className="field" {...aria("email")} />
        </Field>
        <Field label="Phone" name="phone" error={e.phone} hint="Optional">
          <input id="phone" name="phone" type="tel" defaultValue={val("phone", defaults.phone ?? "")} placeholder="+91 98765 43210" className="field" {...aria("phone")} />
        </Field>
        <Field label="Role applied for" name="jobId" error={e.jobId}>
          <select id="jobId" name="jobId" required defaultValue={val("jobId", defaults.jobId ?? "")} className="field" {...aria("jobId")}>
            <option value="" disabled>
              Choose a role
            </option>
            {selectable.map((j) => (
              <option key={j.id} value={j.id}>
                {j.title}
                {j.status === "closed" ? " (closed)" : ""}
              </option>
            ))}
          </select>
        </Field>
        <Field label="Years of experience" name="experienceYears" error={e.experienceYears}>
          <input id="experienceYears" name="experienceYears" type="number" min={0} max={60} defaultValue={val("experienceYears", String(defaults.experienceYears ?? 0))} className="field" {...aria("experienceYears")} />
        </Field>
        <Field label="Source" name="source" error={e.source} hint="Where did they come from?">
          <select id="source" name="source" defaultValue={val("source", defaults.source ?? "")} className="field">
            <option value="">Not set</option>
            {SOURCES.map((s) => (
              <option key={s} value={s}>
                {s}
              </option>
            ))}
          </select>
        </Field>
      </div>

      <Field label="Skills" name="skills" error={e.skills} hint="Separate with commas, like React, TypeScript, SQL">
        <input id="skills" name="skills" defaultValue={val("skills", (defaults.skills ?? []).join(", "))} placeholder="React, TypeScript, Node.js" className="field" {...aria("skills")} />
      </Field>

      <div className="grid gap-5 md:grid-cols-2">
        <Field
          label="Resume file"
          name="resume"
          error={e.resume}
          hint={existingResume ? `Current: ${existingResume.filename}. Choose a file to replace it.` : "PDF, DOC or DOCX, up to 3 MB"}
        >
          <input
            id="resume"
            name="resume"
            type="file"
            accept=".pdf,.doc,.docx,application/pdf"
            className="field file:mr-3 file:rounded-lg file:border-0 file:bg-accent-soft file:px-3 file:py-1 file:text-sm file:font-medium file:text-accent"
            {...aria("resume")}
          />
          {existingResume && (
            <label className="mt-2 flex items-center gap-2 text-sm text-muted">
              <input type="checkbox" name="removeResume" className="size-4 accent-[var(--accent)]" /> Remove the current resume
            </label>
          )}
        </Field>
        <Field label="Resume or portfolio link" name="resumeUrl" error={e.resumeUrl} hint="Optional">
          <input id="resumeUrl" name="resumeUrl" type="url" defaultValue={val("resumeUrl", defaults.resumeUrl ?? "")} placeholder="https://" className="field" {...aria("resumeUrl")} />
        </Field>
      </div>

      <div className="flex items-center justify-end gap-3 border-t border-line pt-5">
        <Link href={cancelHref} className="btn-ghost">
          Cancel
        </Link>
        <button type="submit" disabled={pending} className="btn-primary min-w-32">
          {pending ? <Loader2 size={16} className="animate-spin" /> : null}
          {pending ? "Saving" : submitLabel}
        </button>
      </div>
    </form>
  );
}
