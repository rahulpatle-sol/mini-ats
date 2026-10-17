import type { Metadata } from "next";
import { notFound } from "next/navigation";
import { updateJob } from "@/actions/jobs";
import { JobForm } from "@/components/job-form";
import { PageHeader } from "@/components/page-header";
import { getJob } from "@/lib/queries";

export const metadata: Metadata = { title: "Edit job" };

export default async function EditJobPage({ params }: { params: Promise<{ id: string }> }) {
  const { id } = await params;
  const job = await getJob(id);
  if (!job) notFound();
  return (
    <div className="mx-auto max-w-2xl">
      <PageHeader title={`Edit ${job.title}`} />
      <JobForm action={updateJob.bind(null, job.id)} defaults={job} submitLabel="Save changes" />
    </div>
  );
}
