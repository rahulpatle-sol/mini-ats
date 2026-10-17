import { ArrowRight, Plus } from "lucide-react";
import Link from "next/link";
import { PageHeader } from "@/components/page-header";
import { StageBadge } from "@/components/stage-badge";
import { PIPELINE, STAGE_META, type Stage } from "@/lib/constants";
import { getDashboard } from "@/lib/queries";
import { getSession } from "@/lib/session";
import { cn, timeAgo } from "@/lib/utils";

export const dynamic = "force-dynamic";

function Stat({ label, value, hint }: { label: string; value: string | number; hint?: string }) {
  return (
    <div className="card p-5">
      <p className="text-sm text-muted">{label}</p>
      <p className="mt-2 font-serif text-4xl tracking-tight">{value}</p>
      {hint && <p className="mt-1 text-xs text-muted">{hint}</p>}
    </div>
  );
}

export default async function Dashboard() {
  const session = await getSession();
  if (!session) return null;
  const d = await getDashboard(session.uid);

  if (d.total === 0) {
    return (
      <>
        <PageHeader title="Hiring overview" description="Your pipeline at a glance." />
        <div className="card px-6 py-16 text-center">
          <p className="font-serif text-4xl text-accent">✺</p>
          <h2 className="mt-4 font-serif text-2xl">No candidates yet</h2>
          <p className="mx-auto mt-2 max-w-sm text-muted">
            Add your first candidate to start tracking them from applied to hired. Metrics appear here automatically.
          </p>
          <div className="mt-6 flex justify-center gap-3">
            <Link href="/jobs/new" className="btn-ghost">
              <Plus size={16} /> Add a job
            </Link>
            <Link href="/candidates/new" className="btn-primary">
              <Plus size={16} /> Add candidate
            </Link>
          </div>
        </div>
      </>
    );
  }

  const stages: Stage[] = [...PIPELINE, "rejected"];
  const maxStage = Math.max(1, ...stages.map((s) => d.stageCounts[s]));
  const maxWeek = Math.max(1, ...d.weekly.map((w) => w.n));
  const maxPos = Math.max(1, ...d.jobs.map((p) => p.n));

  return (
    <>
      <PageHeader
        title="Hiring overview"
        description={`${d.active} ${d.active === 1 ? "candidate is" : "candidates are"} moving through your pipeline right now.`}
        action={
          <Link href="/candidates/new" className="btn-primary">
            <Plus size={16} /> New candidate
          </Link>
        }
      />

      <section className="grid grid-cols-2 gap-4 lg:grid-cols-4" aria-label="Key numbers">
        <Stat label="Total candidates" value={d.total} />
        <Stat label="In progress" value={d.active} hint="Applied to offer" />
        <Stat label="Hired" value={d.hired} hint={`${d.rejected} rejected`} />
        <Stat
          label="Hire rate"
          value={`${d.hireRate}%`}
          hint={d.avgDaysToHire != null ? `Avg ${Math.round(d.avgDaysToHire)} days to hire` : "No hires yet"}
        />
      </section>

      <div className="mt-6 grid gap-6 lg:grid-cols-5">
        <section className="card p-6 lg:col-span-3" aria-labelledby="pipeline-h">
          <h2 id="pipeline-h" className="font-serif text-xl">Pipeline</h2>
          <p className="mt-1 text-sm text-muted">Where candidates are right now. Select a stage to see them.</p>
          <ul className="mt-5 space-y-1">
            {stages.map((s) => {
              const n = d.stageCounts[s];
              return (
                <li key={s}>
                  <Link
                    href={`/candidates?stage=${s}`}
                    className="group grid grid-cols-[88px_1fr_28px] items-center gap-3 rounded-lg px-2 py-2 hover:bg-canvas"
                  >
                    <span className="text-sm">{STAGE_META[s].label}</span>
                    <span className="h-7 overflow-hidden rounded-md bg-canvas">
                      <span
                        className={cn("block h-full rounded-md", STAGE_META[s].bar)}
                        style={{ width: `${n === 0 ? 0 : Math.max(4, (n / maxStage) * 100)}%` }}
                      />
                    </span>
                    <span className="text-right text-sm tabular-nums text-muted">{n}</span>
                  </Link>
                </li>
              );
            })}
          </ul>
        </section>

        <section className="card p-6 lg:col-span-2" aria-labelledby="weekly-h">
          <h2 id="weekly-h" className="font-serif text-xl">New applicants</h2>
          <p className="mt-1 text-sm text-muted">Last 8 weeks</p>
          <div className="mt-6 flex h-44 items-end gap-2" role="img" aria-label={`Applicants per week: ${d.weekly.map((w) => w.n).join(", ")}`}>
            {d.weekly.map((w, i) => (
              <div key={i} className="flex h-full flex-1 flex-col items-center justify-end gap-2">
                <span className="text-xs tabular-nums text-muted">{w.n || ""}</span>
                <div
                  className={cn("w-full rounded-t-md", i === d.weekly.length - 1 ? "bg-accent" : "bg-accent/35")}
                  style={{ height: `${w.n === 0 ? 2 : Math.max(6, (w.n / maxWeek) * 100)}%` }}
                />
              </div>
            ))}
          </div>
          <div className="mt-2 flex gap-2">
            {d.weekly.map((w, i) => (
              <span key={i} className="flex-1 text-center text-[11px] text-muted">
                {w.start.toLocaleDateString("en-IN", { day: "numeric", month: "short" })}
              </span>
            ))}
          </div>
        </section>
      </div>

      <div className="mt-6 grid gap-6 lg:grid-cols-5">
        <section className="card p-6 lg:col-span-2" aria-labelledby="roles-h">
          <h2 id="roles-h" className="font-serif text-xl">Busiest roles</h2>
          <ul className="mt-4 space-y-4">
            {d.jobs.map((p) => (
              <li key={p.id}>
                <Link href={`/candidates?job=${p.id}`} className="block">
                  <div className="flex justify-between text-sm">
                    <span>{p.title}</span>
                    <span className="tabular-nums text-muted">{p.n}</span>
                  </div>
                  <div className="mt-1.5 h-1.5 rounded-full bg-canvas">
                    <div className="h-full rounded-full bg-accent/60" style={{ width: `${(p.n / maxPos) * 100}%` }} />
                  </div>
                </Link>
              </li>
            ))}
          </ul>
        </section>

        <section className="card p-6 lg:col-span-3" aria-labelledby="activity-h">
          <div className="flex items-center justify-between">
            <h2 id="activity-h" className="font-serif text-xl">Recent activity</h2>
            <Link href="/candidates" className="inline-flex items-center gap-1 text-sm text-muted hover:text-ink">
              All candidates <ArrowRight size={14} />
            </Link>
          </div>
          <ul className="mt-3 divide-y divide-line">
            {d.recentEvents.map((e) => (
              <li key={e.id} className="flex items-center justify-between gap-3 py-3">
                <div className="min-w-0">
                  <Link href={`/candidates/${e.candidateId}`} className="block truncate text-sm font-medium hover:underline">
                    {e.name}
                  </Link>
                  <p className="truncate text-xs text-muted">{e.jobTitle}</p>
                </div>
                <div className="flex shrink-0 items-center gap-3">
                  <StageBadge stage={e.toStage} />
                  <span className="hidden w-16 text-right text-xs text-muted sm:block">{timeAgo(e.createdAt)}</span>
                </div>
              </li>
            ))}
          </ul>
        </section>
      </div>
    </>
  );
}
