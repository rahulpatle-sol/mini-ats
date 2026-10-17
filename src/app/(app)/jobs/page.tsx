import { Plus } from "lucide-react";
import type { Metadata } from "next";
import Link from "next/link";
import { JobActions } from "@/components/job-actions";
import { PageHeader } from "@/components/page-header";
import { getJobsWithCounts } from "@/lib/queries";
import { cn, formatDate } from "@/lib/utils";

export const metadata: Metadata = { title: "Jobs" };
export const dynamic = "force-dynamic";

export default async function JobsPage() {
  const jobs = await getJobsWithCounts();

  return (
    <>
      <PageHeader
        title="Jobs"
        description="The roles you are hiring for. Candidates apply to one of these."
        action={
          <Link href="/jobs/new" className="btn-primary">
            <Plus size={16} /> New job
          </Link>
        }
      />

      <div className="card overflow-hidden">
        {jobs.length === 0 ? (
          <div className="px-6 py-16 text-center">
            <h2 className="font-serif text-xl">No jobs yet</h2>
            <p className="mt-1 text-sm text-muted">Add a role first, then add candidates to it.</p>
            <Link href="/jobs/new" className="btn-primary mt-5">
              <Plus size={16} /> Add job
            </Link>
          </div>
        ) : (
          <div className="overflow-x-auto">
            <table className="w-full min-w-[640px] text-left text-sm">
              <thead className="border-b border-line text-muted">
                <tr>
                  <th className="px-5 py-3 font-medium">Job</th>
                  <th className="px-3 py-3 font-medium">Status</th>
                  <th className="px-3 py-3 font-medium">Candidates</th>
                  <th className="hidden px-3 py-3 font-medium md:table-cell">Created</th>
                  <th className="px-5 py-3"><span className="sr-only">Actions</span></th>
                </tr>
              </thead>
              <tbody className="divide-y divide-line">
                {jobs.map((j) => (
                  <tr key={j.id} className="hover:bg-canvas">
                    <td className="px-5 py-3.5">
                      <p className="font-medium">{j.title}</p>
                      {j.department && <p className="text-xs text-muted">{j.department}</p>}
                    </td>
                    <td className="px-3 py-3.5">
                      <span className={cn("inline-flex rounded-full px-2.5 py-1 text-xs font-medium", j.status === "open" ? "bg-emerald-500/12 text-emerald-800 dark:text-emerald-300" : "bg-slate-500/10 text-slate-700 dark:text-slate-300")}>
                        {j.status === "open" ? "Open" : "Closed"}
                      </span>
                    </td>
                    <td className="px-3 py-3.5">
                      {j.candidateCount > 0 ? (
                        <Link href={`/candidates?job=${j.id}`} className="hover:underline">{j.candidateCount}</Link>
                      ) : (
                        <span className="text-muted">0</span>
                      )}
                    </td>
                    <td className="hidden px-3 py-3.5 text-muted md:table-cell">{formatDate(j.createdAt)}</td>
                    <td className="px-5 py-3.5">
                      <JobActions id={j.id} title={j.title} status={j.status} candidateCount={j.candidateCount} />
                    </td>
                  </tr>
                ))}
              </tbody>
            </table>
          </div>
        )}
      </div>
    </>
  );
}
