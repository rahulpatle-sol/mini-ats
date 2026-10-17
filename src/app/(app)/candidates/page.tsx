import { Plus, SearchX } from "lucide-react";
import type { Metadata } from "next";
import Link from "next/link";
import { Suspense } from "react";
import { CandidateFilters } from "@/components/candidate-filters";
import { CsvExport } from "@/components/csv-export";
import { PageHeader } from "@/components/page-header";
import { Pagination } from "@/components/pagination";
import { Avatar, StageBadge } from "@/components/stage-badge";
import { isStage, SORT_OPTIONS, type SortKey } from "@/lib/constants";
import { getJobs, getStageCounts, listCandidates } from "@/lib/queries";
import { getSession } from "@/lib/session";
import { formatDate } from "@/lib/utils";

export const metadata: Metadata = { title: "Candidates" };
export const dynamic = "force-dynamic";

type SP = { q?: string; stage?: string; job?: string; sort?: string; page?: string };

export default async function CandidatesPage({ searchParams }: { searchParams: Promise<SP> }) {
  const session = await getSession();
  if (!session) return null;
  const uid = session.uid;
  const sp = await searchParams;
  const stage = isStage(sp.stage) ? sp.stage : undefined;
  const sort = SORT_OPTIONS.some((o) => o.value === sp.sort) ? (sp.sort as SortKey) : "newest";
  const page = Math.max(1, Number.parseInt(sp.page ?? "1", 10) || 1);

  const [{ rows, total, pageCount, page: current }, counts, jobs] = await Promise.all([
    listCandidates({ userId: uid, q: sp.q, stage, jobId: sp.job, sort, page }),
    getStageCounts(uid),
    getJobs(uid),
  ]);

  const exportParams = new URLSearchParams();
  if (sp.q) exportParams.set("q", sp.q);
  if (stage) exportParams.set("stage", stage);
  if (sp.job) exportParams.set("job", sp.job);
  if (sort !== "newest") exportParams.set("sort", sort);

  const filtered = Boolean(sp.q || stage || sp.job);

  return (
    <>
      <PageHeader
        title="Candidates"
        description="Search, filter and open anyone in your pipeline."
        action={
          <div className="flex gap-2">
            <CsvExport params={exportParams} />
            <Link href="/candidates/new" className="btn-primary">
              <Plus size={16} /> New candidate
            </Link>
          </div>
        }
      />

      <Suspense>
        <CandidateFilters jobs={jobs} counts={counts} />
      </Suspense>

      <div className="card mt-5 overflow-hidden">
        {rows.length === 0 ? (
          <div className="px-6 py-16 text-center">
            <SearchX className="mx-auto text-muted" size={28} />
            <h2 className="mt-3 font-serif text-xl">{filtered ? "No candidates match" : "No candidates yet"}</h2>
            <p className="mt-1 text-sm text-muted">
              {filtered ? "Try a different search or clear the filters." : "Add your first candidate to get started."}
            </p>
            {filtered ? (
              <Link href="/candidates" className="btn-ghost mt-5">
                Clear filters
              </Link>
            ) : (
              <Link href="/candidates/new" className="btn-primary mt-5">
                <Plus size={16} /> Add candidate
              </Link>
            )}
          </div>
        ) : (
          <div className="overflow-x-auto">
            <table className="w-full min-w-[640px] text-left text-sm">
              <thead className="border-b border-line text-muted">
                <tr>
                  <th className="px-5 py-3 font-medium">Candidate</th>
                  <th className="px-3 py-3 font-medium">Role</th>
                  <th className="px-3 py-3 font-medium">Stage</th>
                  <th className="hidden px-3 py-3 font-medium md:table-cell">Experience</th>
                  <th className="px-5 py-3 text-right font-medium">Applied</th>
                </tr>
              </thead>
              <tbody className="divide-y divide-line">
                {rows.map((c) => (
                  <tr key={c.id} className="group relative hover:bg-canvas">
                    <td className="px-5 py-3.5">
                      <Link href={`/candidates/${c.id}`} className="flex items-center gap-3 after:absolute after:inset-0">
                        <Avatar name={c.name} />
                        <span className="min-w-0">
                          <span className="block truncate font-medium">{c.name}</span>
                          <span className="block truncate text-xs text-muted">{c.email}</span>
                        </span>
                      </Link>
                    </td>
                    <td className="px-3 py-3.5">{c.jobTitle}</td>
                    <td className="px-3 py-3.5">
                      <StageBadge stage={c.stage} />
                    </td>
                    <td className="hidden px-3 py-3.5 text-muted md:table-cell">
                      {c.experienceYears} {c.experienceYears === 1 ? "year" : "years"}
                    </td>
                    <td className="px-5 py-3.5 text-right text-muted">{formatDate(c.createdAt)}</td>
                  </tr>
                ))}
              </tbody>
            </table>
          </div>
        )}
      </div>

      {total > 0 && (
        <Pagination
          page={current}
          pageCount={pageCount}
          total={total}
          params={{ q: sp.q, stage, job: sp.job, sort: sort === "newest" ? undefined : sort }}
        />
      )}
    </>
  );
}
