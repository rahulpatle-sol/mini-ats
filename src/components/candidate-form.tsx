"use client";

import { Loader2 } from "lucide-react";
import Link from "next/link";
import { useActionState } from "react";
import type { FormState } from "@/actions/candidates";
import { SOURCES } from "@/lib/constants";

type Defaults = {
  name?: string;
  email?: string;
  phone?: string | null;
  position?: string;
  skills?: string[];
  experienceYears?: number;
  source?: string | null;
  resumeUrl?: string | null;
  notes?: string | null;
};

function Field({
  label,
  name,
  error,
  hint,
  children,
}: {
  label: string;
  name: string;
  error?: string[];
  hint?: string;
  children: React.ReactNode;
}) {
  return (
    <div>
      <label htmlFor={name} className="label">
        {label}
      </label>
      {children}
      {error?.[0] ? (
        <p id={`${name}-error`} className="mt-1.5 text-sm text-rose-700 dark:text-rose-300">
          {error[0]}
        </p>
      ) : (
        hint && <p className="mt-1.5 text-xs text-muted">{hint}</p>
      )}
    </div>
  );
}

export function CandidateForm({
  action,
  defaults = {},
  positions,
  submitLabel,
  cancelHref,
}: {
  action: (prev: FormState, fd: FormData) => Promise<FormState>;
  defaults?: Defaults;
  positions: string[];
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
        <Field label="Role applied for" name="position" error={e.position}>
          <input id="position" name="position" list="positions" required defaultValue={val("position", defaults.position ?? "")} placeholder="Frontend Engineer" className="field" {...aria("position")} />
          <datalist id="positions">
            {positions.map((p) => (
              <option key={p} value={p} />
            ))}
          </datalist>
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

      <Field label="Resume link" name="resumeUrl" error={e.resumeUrl} hint="Optional. A Drive, Notion or portfolio link">
        <input id="resumeUrl" name="resumeUrl" type="url" defaultValue={val("resumeUrl", defaults.resumeUrl ?? "")} placeholder="https://" className="field" {...aria("resumeUrl")} />
      </Field>

      <Field label="Notes" name="notes" error={e.notes}>
        <textarea id="notes" name="notes" rows={4} defaultValue={val("notes", defaults.notes ?? "")} placeholder="Anything the team should know" className="field resize-y" {...aria("notes")} />
      </Field>

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
