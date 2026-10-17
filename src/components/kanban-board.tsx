"use client";

import Link from "next/link";
import { useEffect, useState, useTransition } from "react";
import { changeStage } from "@/actions/candidates";
import { allowedTargets, canMove, isStage, STAGES, STAGE_META, type Stage } from "@/lib/constants";
import { cn, daysSince } from "@/lib/utils";

export type BoardCard = {
  id: string;
  name: string;
  jobTitle: string;
  stage: Stage;
  experienceYears: number;
  skills: string[];
  createdAt: string;
};

type Columns = Record<Stage, BoardCard[]>;

export function KanbanBoard({ initial }: { initial: Columns }) {
  const [cols, setCols] = useState<Columns>(initial);
  const [dragId, setDragId] = useState<string | null>(null);
  const [over, setOver] = useState<Stage | null>(null);
  const [error, setError] = useState<string | null>(null);
  const [, startTransition] = useTransition();

  useEffect(() => setCols(initial), [initial]);

  const dragging = dragId ? STAGES.flatMap((s) => cols[s]).find((c) => c.id === dragId) : undefined;

  function move(id: string, to: Stage) {
    const from = STAGES.find((s) => cols[s].some((c) => c.id === id));
    if (!from || !canMove(from, to)) return;
    const card = cols[from].find((c) => c.id === id)!;
    const snapshot = cols;

    setError(null);
    setCols({
      ...cols,
      [from]: cols[from].filter((c) => c.id !== id),
      [to]: [{ ...card, stage: to }, ...cols[to]],
    });

    startTransition(async () => {
      const res = await changeStage(id, to);
      if (!res.ok) {
        setCols(snapshot);
        setError(res.error ?? "Could not move the candidate.");
      }
    });
  }

  return (
    <div>
      {error && (
        <p role="alert" className="mb-4 rounded-xl bg-rose-500/10 px-4 py-3 text-sm text-rose-800 dark:text-rose-300">
          {error}
        </p>
      )}
      <div className="-mx-5 flex gap-4 overflow-x-auto px-5 pb-4 md:-mx-10 md:px-10">
        {STAGES.map((stage) => {
          const droppable = dragging ? canMove(dragging.stage, stage) : false;
          return (
            <section
              key={stage}
              aria-label={`${STAGE_META[stage].label} column`}
              onDragOver={(e) => {
                if (droppable) {
                  e.preventDefault();
                  setOver(stage);
                }
              }}
              onDragLeave={() => setOver((o) => (o === stage ? null : o))}
              onDrop={(e) => {
                e.preventDefault();
                const id = e.dataTransfer.getData("text/plain");
                setOver(null);
                setDragId(null);
                if (id) move(id, stage);
              }}
              className={cn(
                "flex w-72 shrink-0 flex-col rounded-2xl border bg-sidebar/60 p-3 transition-colors",
                over === stage ? "border-accent bg-accent-soft" : "border-line",
                dragging && !droppable && dragging.stage !== stage && "opacity-50",
              )}
            >
              <header className="mb-3 flex items-center justify-between px-1.5 pt-1">
                <div className="flex items-center gap-2">
                  <span className={cn("size-2 rounded-full", STAGE_META[stage].dot)} />
                  <h2 className="text-sm font-medium">{STAGE_META[stage].label}</h2>
                </div>
                <span className="text-xs tabular-nums text-muted">{cols[stage].length}</span>
              </header>

              <ul className="flex min-h-24 flex-col gap-2.5">
                {cols[stage].map((c) => (
                  <li
                    key={c.id}
                    draggable
                    onDragStart={(e) => {
                      e.dataTransfer.setData("text/plain", c.id);
                      e.dataTransfer.effectAllowed = "move";
                      setDragId(c.id);
                    }}
                    onDragEnd={() => {
                      setDragId(null);
                      setOver(null);
                    }}
                    className={cn(
                      "cursor-grab rounded-xl border border-line bg-surface p-3.5 active:cursor-grabbing",
                      dragId === c.id && "opacity-40",
                    )}
                  >
                    <Link href={`/candidates/${c.id}`} draggable={false} className="block">
                      <p className="truncate text-sm font-medium">{c.name}</p>
                      <p className="mt-0.5 truncate text-xs text-muted">{c.jobTitle}</p>
                    </Link>
                    {c.skills.length > 0 && (
                      <ul className="mt-2.5 flex flex-wrap gap-1">
                        {c.skills.slice(0, 2).map((s) => (
                          <li key={s} className="rounded-full bg-canvas px-2 py-0.5 text-[11px] text-muted">
                            {s}
                          </li>
                        ))}
                        {c.skills.length > 2 && <li className="px-1 py-0.5 text-[11px] text-muted">+{c.skills.length - 2}</li>}
                      </ul>
                    )}
                    <div className="mt-3 flex items-center justify-between gap-2">
                      <span className="text-[11px] text-muted">
                        {c.experienceYears}y exp · {daysSince(c.createdAt)}d ago
                      </span>
                      {allowedTargets(c.stage).length > 0 && (
                        <select
                          aria-label={`Move ${c.name}`}
                          value=""
                          onChange={(e) => isStage(e.target.value) && move(c.id, e.target.value)}
                          className="max-w-24 rounded-md border border-line bg-canvas px-1.5 py-1 text-[11px] text-muted"
                        >
                          <option value="">Move…</option>
                          {allowedTargets(c.stage).map((s) => (
                            <option key={s} value={s}>
                              {STAGE_META[s].label}
                            </option>
                          ))}
                        </select>
                      )}
                    </div>
                  </li>
                ))}
                {cols[stage].length === 0 && (
                  <li className="grid h-20 place-items-center rounded-xl border border-dashed border-line text-xs text-muted">
                    Drop candidates here
                  </li>
                )}
              </ul>
            </section>
          );
        })}
      </div>
    </div>
  );
}
