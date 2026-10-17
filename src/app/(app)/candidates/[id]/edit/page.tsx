import type { Metadata } from "next";
import { notFound } from "next/navigation";
import { updateCandidate } from "@/actions/candidates";
import { CandidateForm } from "@/components/candidate-form";
import { PageHeader } from "@/components/page-header";
import { getCandidate, getJobs, getResumeMeta } from "@/lib/queries";
import { getSession } from "@/lib/session";

export const metadata: Metadata = { title: "Edit candidate" };

export default async function EditCandidatePage({ params }: { params: Promise<{ id: string }> }) {
  const session = await getSession();
  if (!session) return null;
  const { id } = await params;
  const candidate = await getCandidate(id, session.uid);
  if (!candidate) notFound();
  const [jobs, resume] = await Promise.all([getJobs(session.uid), getResumeMeta(candidate.id)]);

  return (
    <div className="mx-auto max-w-3xl">
      <PageHeader title={`Edit ${candidate.name}`} />
      <CandidateForm
        action={updateCandidate.bind(null, candidate.id)}
        defaults={candidate}
        jobs={jobs}
        existingResume={resume}
        submitLabel="Save changes"
        cancelHref={`/candidates/${candidate.id}`}
      />
    </div>
  );
}
