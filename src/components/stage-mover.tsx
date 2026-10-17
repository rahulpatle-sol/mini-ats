"use client";

import { Loader2 } from "lucide-react";
import { useState, useTransition } from "react";
import { changeStage } from "@/actions/candidates";
import { allowedTargets, STAGE_META, type Stage } from "@/lib/constants";

export function StageMover({ id, stage }: { id: string; stage: Stage }) {
  const targets = allowedTargets(stage);
  const [to, setTo] = useState<Stage>(targets[0] ?? stage);
  const [note, setNote] = useState("");
  const [error, setError] = useState<string | null>(null);
  const [pending, startTransition] = useTransition();

  if (targets.length === 0) {
    return <p className="text-sm text-muted">This candidate is hired, so the stage is final.</p>;
  }

  function submit(e: React.FormEvent) {
    e.preventDefault();
    setError(null);
    startTransition(async () => {
      const res = await changeStage(id, to, note);
      if (!res.ok) setError(res.error ?? "Something went wrong.");
      else setNote("");
    });
  }

  return (
    <form onSubmit={submit} className="space-y-3">
      <div>
        <label htmlFor="stage-to" className="label">
          Move to
        </label>
        <select id="stage-to" value={to} onChange={(e) => setTo(e.target.value as Stage)} className="field">
          {targets.map((s) => (
            <option key={s} value={s}>
              {s === "applied" && stage === "rejected" ? "Reopen as Applied" : STAGE_META[s].label}
            </option>
          ))}
        </select>
      </div>
      <div>
        <label htmlFor="stage-note" className="label">
          Note <span className="font-normal text-muted">(optional)</span>
        </label>
        <input
          id="stage-note"
          value={note}
          onChange={(e) => setNote(e.target.value)}
          maxLength={500}
          placeholder="Reason or next step"
          className="field"
        />
      </div>
      {error && (
        <p role="alert" className="text-sm text-rose-700 dark:text-rose-300">
          {error}
        </p>
      )}
      <button type="submit" disabled={pending} className="btn-primary w-full">
        {pending && <Loader2 size={16} className="animate-spin" />}
        Update stage
      </button>
    </form>
  );
}
