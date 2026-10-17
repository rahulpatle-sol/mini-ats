"use client";

import { useState, useTransition } from "react";
import Link from "next/link";
import { deleteJob, setJobStatus } from "@/actions/jobs";

export function JobActions({ id, title, status, candidateCount }: { id: string; title: string; status: "open" | "closed"; candidateCount: number }) {
  const [pending, startTransition] = useTransition();
  const [error, setError] = useState<string | null>(null);

  return (
    <div className="relative z-10 flex items-center justify-end gap-1.5">
      {error && <span role="alert" className="mr-2 text-xs text-rose-700 dark:text-rose-300">{error}</span>}
      <Link href={`/jobs/${id}/edit`} className="rounded-lg px-2.5 py-1.5 text-sm text-muted hover:bg-canvas hover:text-ink">
        Edit
      </Link>
      <button
        disabled={pending}
        onClick={() => startTransition(() => setJobStatus(id, status === "open" ? "closed" : "open"))}
        className="rounded-lg px-2.5 py-1.5 text-sm text-muted hover:bg-canvas hover:text-ink disabled:opacity-50"
      >
        {status === "open" ? "Close" : "Reopen"}
      </button>
      {candidateCount === 0 && (
        <button
          disabled={pending}
          onClick={() => {
            if (!window.confirm(`Delete the job "${title}"?`)) return;
            startTransition(async () => {
              const res = await deleteJob(id);
              if (!res.ok) setError(res.error ?? "Could not delete.");
            });
          }}
          className="rounded-lg px-2.5 py-1.5 text-sm text-rose-700 hover:bg-rose-500/10 disabled:opacity-50 dark:text-rose-300"
        >
          Delete
        </button>
      )}
    </div>
  );
}
