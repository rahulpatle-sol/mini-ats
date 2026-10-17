import type { Metadata } from "next";
import { createCandidate } from "@/actions/candidates";
import { CandidateForm } from "@/components/candidate-form";
import { PageHeader } from "@/components/page-header";
import { getPositions } from "@/lib/queries";

export const metadata: Metadata = { title: "New candidate" };
export const dynamic = "force-dynamic";

export default async function NewCandidatePage() {
  const positions = await getPositions();
  return (
    <div className="mx-auto max-w-3xl">
      <PageHeader title="New candidate" description="They start in the Applied stage. You can move them along any time." />
      <CandidateForm action={createCandidate} positions={positions} submitLabel="Add candidate" cancelHref="/candidates" />
    </div>
  );
}
