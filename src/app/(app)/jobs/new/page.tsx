import type { Metadata } from "next";
import { createJob } from "@/actions/jobs";
import { JobForm } from "@/components/job-form";
import { PageHeader } from "@/components/page-header";

export const metadata: Metadata = { title: "New job" };

export default function NewJobPage() {
  return (
    <div className="mx-auto max-w-2xl">
      <PageHeader title="New job" description="Add a role you are hiring for." />
      <JobForm action={createJob} submitLabel="Add job" />
    </div>
  );
}
