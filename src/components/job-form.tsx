"use client";

import { Loader2 } from "lucide-react";
import Link from "next/link";
import { useActionState } from "react";
import type { FormState } from "@/actions/candidates";
import { Field } from "@/components/field";

export function JobForm({
  action,
  defaults = {},
  submitLabel,
}: {
  action: (prev: FormState, fd: FormData) => Promise<FormState>;
  defaults?: { title?: string; department?: string | null; status?: "open" | "closed" };
  submitLabel: string;
}) {
  const [state, formAction, pending] = useActionState(action, {} as FormState);
  const e = state.errors ?? {};
  const v = state.values;

  return (
    <form action={formAction} className="card space-y-5 p-6 md:p-8" noValidate>
      {state.message && (
        <p role="alert" className="rounded-xl bg-rose-500/10 px-4 py-3 text-sm text-rose-800 dark:text-rose-300">
          {state.message}
        </p>
      )}
      <Field label="Job title" name="title" error={e.title}>
        <input id="title" name="title" required defaultValue={v?.title ?? defaults.title ?? ""} placeholder="Frontend Engineer" className="field" aria-invalid={e.title ? true : undefined} />
      </Field>
      <div className="grid gap-5 md:grid-cols-2">
        <Field label="Department" name="department" error={e.department} hint="Optional">
          <input id="department" name="department" defaultValue={v?.department ?? defaults.department ?? ""} placeholder="Engineering" className="field" />
        </Field>
        <Field label="Status" name="status" error={e.status} hint="Closed jobs cannot receive new candidates">
          <select id="status" name="status" defaultValue={v?.status ?? defaults.status ?? "open"} className="field">
            <option value="open">Open</option>
            <option value="closed">Closed</option>
          </select>
        </Field>
      </div>
      <div className="flex items-center justify-end gap-3 border-t border-line pt-5">
        <Link href="/jobs" className="btn-ghost">
          Cancel
        </Link>
        <button type="submit" disabled={pending} className="btn-primary min-w-32">
          {pending && <Loader2 size={16} className="animate-spin" />}
          {pending ? "Saving" : submitLabel}
        </button>
      </div>
    </form>
  );
}
