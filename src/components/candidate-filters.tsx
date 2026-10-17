"use client";

import { Search, X } from "lucide-react";
import { usePathname, useRouter, useSearchParams } from "next/navigation";
import { useEffect, useState, useTransition } from "react";
import { SORT_OPTIONS, STAGES, STAGE_META, type Stage } from "@/lib/constants";
import { cn } from "@/lib/utils";

export function CandidateFilters({
  positions,
  counts,
}: {
  positions: string[];
  counts: Record<Stage, number>;
}) {
  const router = useRouter();
  const pathname = usePathname();
  const sp = useSearchParams();
  const [pending, startTransition] = useTransition();
  const [q, setQ] = useState(sp.get("q") ?? "");

  const stage = sp.get("stage") ?? "";
  const total = STAGES.reduce((s, k) => s + counts[k], 0);

  function update(patch: Record<string, string | null>) {
    const next = new URLSearchParams(sp.toString());
    for (const [k, v] of Object.entries(patch)) {
      if (v) next.set(k, v);
      else next.delete(k);
    }
    next.delete("page");
    const qs = next.toString();
    startTransition(() => router.replace(qs ? `${pathname}?${qs}` : pathname, { scroll: false }));
  }

  useEffect(() => {
    const value = q.trim();
    if (value === (sp.get("q") ?? "")) return;
    const t = setTimeout(() => update({ q: value || null }), 300);
    return () => clearTimeout(t);
    // eslint-disable-next-line react-hooks/exhaustive-deps
  }, [q]);

  // keep the box in sync when filters are cleared elsewhere
  useEffect(() => {
    setQ(sp.get("q") ?? "");
  }, [sp]);

  const tabs: { value: string; label: string; n: number }[] = [
    { value: "", label: "All", n: total },
    ...STAGES.map((s) => ({ value: s, label: STAGE_META[s].label, n: counts[s] })),
  ];

  return (
    <div className={cn("space-y-4 transition-opacity", pending && "opacity-70")}>
      <div className="flex flex-col gap-3 sm:flex-row">
        <div className="relative flex-1">
          <Search size={16} className="pointer-events-none absolute left-3.5 top-1/2 -translate-y-1/2 text-muted" />
          <input
            type="search"
            value={q}
            onChange={(e) => setQ(e.target.value)}
            placeholder="Search by name, email, role or skill"
            aria-label="Search candidates"
            className="field pl-10"
          />
        </div>
        <select
          aria-label="Filter by role"
          value={sp.get("position") ?? ""}
          onChange={(e) => update({ position: e.target.value || null })}
          className="field sm:w-52"
        >
          <option value="">All roles</option>
          {positions.map((p) => (
            <option key={p} value={p}>
              {p}
            </option>
          ))}
        </select>
        <select
          aria-label="Sort candidates"
          value={sp.get("sort") ?? "newest"}
          onChange={(e) => update({ sort: e.target.value === "newest" ? null : e.target.value })}
          className="field sm:w-44"
        >
          {SORT_OPTIONS.map((o) => (
            <option key={o.value} value={o.value}>
              {o.label}
            </option>
          ))}
        </select>
      </div>

      <div className="-mx-1 flex gap-1.5 overflow-x-auto px-1 pb-1" role="tablist" aria-label="Filter by stage">
        {tabs.map((t) => {
          const active = stage === t.value;
          return (
            <button
              key={t.value || "all"}
              role="tab"
              aria-selected={active}
              onClick={() => update({ stage: t.value || null })}
              className={cn(
                "shrink-0 rounded-full border px-3.5 py-1.5 text-sm transition-colors",
                active ? "border-ink bg-ink text-canvas" : "border-line bg-surface text-muted hover:text-ink",
              )}
            >
              {t.label} <span className={cn("ml-1 tabular-nums", active ? "opacity-70" : "opacity-60")}>{t.n}</span>
            </button>
          );
        })}
        {(sp.get("q") || sp.get("stage") || sp.get("position")) && (
          <button
            onClick={() => {
              setQ("");
              startTransition(() => router.replace(pathname, { scroll: false }));
            }}
            className="ml-1 inline-flex shrink-0 items-center gap-1 rounded-full px-3 py-1.5 text-sm text-muted hover:text-ink"
          >
            <X size={14} /> Clear filters
          </button>
        )}
      </div>
    </div>
  );
}
