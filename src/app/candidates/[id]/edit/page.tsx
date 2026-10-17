import type { Metadata } from "next";
import { notFound } from "next/navigation";
import { updateCandidate } from "@/actions/candidates";
import { CandidateForm } from "@/components/candidate-form";
import { PageHeader } from "@/components/page-header";
import { getCandidate, getPositions } from "@/lib/queries";

export const metadata: Metadata = { title: "Edit candidate" };

export default async function EditCandidatePage({ params }: { params: Promise<{ id: string }> }) {
  const { id } = await params;
  const [candidate, positions] = await Promise.all([getCandidate(id), getPositions()]);
  if (!candidate) notFound();

  return (
    <div className="mx-auto max-w-3xl">
      <PageHeader title={`Edit ${candidate.name}`} />
      <CandidateForm
        action={updateCandidate.bind(null, candidate.id)}
        defaults={candidate}
        positions={positions}
        submitLabel="Save changes"
        cancelHref={`/candidates/${candidate.id}`}
      />
    </div>
  );
}
