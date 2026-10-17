export const STAGES = [
  "applied",
  "screening",
  "interview",
  "offer",
  "hired",
  "rejected",
] as const;

export type Stage = (typeof STAGES)[number];

/** The happy path, in order. Rejected sits outside it. */
export const PIPELINE: Stage[] = ["applied", "screening", "interview", "offer", "hired"];

export const STAGE_META: Record<Stage, { label: string; badge: string; dot: string; bar: string }> = {
  applied: {
    label: "Applied",
    badge: "bg-slate-500/10 text-slate-700 dark:text-slate-300",
    dot: "bg-slate-400",
    bar: "bg-slate-400/70",
  },
  screening: {
    label: "Screening",
    badge: "bg-amber-500/12 text-amber-800 dark:text-amber-300",
    dot: "bg-amber-500",
    bar: "bg-amber-500/70",
  },
  interview: {
    label: "Interview",
    badge: "bg-violet-500/12 text-violet-800 dark:text-violet-300",
    dot: "bg-violet-500",
    bar: "bg-violet-500/70",
  },
  offer: {
    label: "Offer",
    badge: "bg-sky-500/12 text-sky-800 dark:text-sky-300",
    dot: "bg-sky-500",
    bar: "bg-sky-500/70",
  },
  hired: {
    label: "Hired",
    badge: "bg-emerald-500/12 text-emerald-800 dark:text-emerald-300",
    dot: "bg-emerald-500",
    bar: "bg-emerald-500/70",
  },
  rejected: {
    label: "Rejected",
    badge: "bg-rose-500/10 text-rose-800 dark:text-rose-300",
    dot: "bg-rose-400",
    bar: "bg-rose-400/60",
  },
};

export function isStage(value: unknown): value is Stage {
  return typeof value === "string" && (STAGES as readonly string[]).includes(value);
}

/**
 * Stage rules:
 * - Hired is final.
 * - Rejected candidates can only be reopened to Applied.
 * - Everything else can move to any other stage.
 */
export function canMove(from: Stage, to: Stage): boolean {
  if (from === to) return false;
  if (from === "hired") return false;
  if (from === "rejected") return to === "applied";
  return true;
}

export function allowedTargets(from: Stage): Stage[] {
  return STAGES.filter((s) => canMove(from, s));
}

export const SOURCES = ["LinkedIn", "Referral", "Job board", "Company website", "Campus", "Other"];

export const SORT_OPTIONS = [
  { value: "newest", label: "Newest first" },
  { value: "oldest", label: "Oldest first" },
  { value: "name", label: "Name A to Z" },
  { value: "experience", label: "Most experience" },
] as const;

export type SortKey = (typeof SORT_OPTIONS)[number]["value"];

export const PAGE_SIZE = 10;
