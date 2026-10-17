import type { Metadata } from "next";
import { createCandidate } from "@/actions/candidates";
import { CandidateForm } from "@/components/candidate-form";
import { PageHeader } from "@/components/page-header";
import { getJobs } from "@/lib/queries";
import { getSession } from "@/lib/session";

export const metadata: Metadata = { title: "New candidate" };
export const dynamic = "force-dynamic";

export default async function NewCandidatePage() {
  const session = await getSession();
  if (!session) return null;
  const jobs = await getJobs(session.uid);
  return (
    <div className="mx-auto max-w-3xl">
      <PageHeader title="New candidate" description="They start in the Applied stage. You can move them along any time." />
      <CandidateForm action={createCandidate} jobs={jobs} submitLabel="Add candidate" cancelHref="/candidates" />
    </div>
  );
}
