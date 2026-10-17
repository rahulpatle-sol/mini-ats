import { isStage, SORT_OPTIONS, STAGE_META, type SortKey } from "@/lib/constants";
import { toCsv } from "@/lib/csv";
import { listAllCandidates } from "@/lib/queries";
import { getSession } from "@/lib/session";

export async function GET(req: Request) {
  const session = await getSession();
  if (!session) return new Response("Unauthorized", { status: 401 });

  const sp = new URL(req.url).searchParams;
  const stage = sp.get("stage");
  const sort = SORT_OPTIONS.find((o) => o.value === sp.get("sort"))?.value as SortKey | undefined;

  const rows = await listAllCandidates({
    userId: session.uid,
    q: sp.get("q") ?? undefined,
    stage: isStage(stage) ? stage : undefined,
    jobId: sp.get("job") ?? undefined,
    sort,
  });

  const csv = toCsv([
    ["Name", "Email", "Phone", "Role", "Stage", "Experience (years)", "Skills", "Source", "Resume link", "Applied on"],
    ...rows.map((c) => [
      c.name,
      c.email,
      c.phone,
      c.jobTitle,
      STAGE_META[c.stage].label,
      c.experienceYears,
      c.skills.join("; "),
      c.source,
      c.resumeUrl,
      c.createdAt.toISOString().slice(0, 10),
    ]),
  ]);

  return new Response("\uFEFF" + csv, {
    headers: {
      "Content-Type": "text/csv; charset=utf-8",
      "Content-Disposition": `attachment; filename="candidates-${new Date().toISOString().slice(0, 10)}.csv"`,
      "Cache-Control": "private, no-store",
    },
  });
}
