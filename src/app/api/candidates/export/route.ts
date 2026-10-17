import { isStage, SORT_OPTIONS, STAGE_META, type SortKey } from "@/lib/constants";
import { toCsv } from "@/lib/csv";
import { listAllCandidates } from "@/lib/queries";
import { getSession } from "@/lib/session";

const COLUMNS = ["Name", "Email", "Phone", "Role", "Stage", "Experience (years)", "Skills", "Source", "Resume link", "Applied on"];

function toRow(c: Awaited<ReturnType<typeof listAllCandidates>>[number]): string[] {
  return [
    c.name ?? "",
    c.email ?? "",
    c.phone ?? "",
    c.jobTitle ?? "",
    STAGE_META[c.stage]?.label ?? c.stage,
    String(c.experienceYears ?? 0),
    (c.skills ?? []).join("; "),
    c.source ?? "",
    c.resumeUrl ?? "",
    c.createdAt ? c.createdAt.toISOString().slice(0, 10) : "",
  ];
}

export async function GET(req: Request) {
  const session = await getSession();
  if (!session) return new Response("Unauthorized", { status: 401 });

  const sp = new URL(req.url).searchParams;
  const stage = sp.get("stage");
  const sort = SORT_OPTIONS.find((o) => o.value === sp.get("sort"))?.value as SortKey | undefined;

  const filters = {
    userId: session.uid,
    q: sp.get("q") ?? undefined,
    stage: isStage(stage) ? stage : undefined,
    jobId: sp.get("job") ?? undefined,
    sort,
  };

  // JSON preview mode (paginated, for the export dialog)
  if (sp.get("preview") === "1") {
    const pageSize = Math.min(50, Math.max(1, Number.parseInt(sp.get("pageSize") ?? "8", 10) || 8));
    const page = Math.max(1, Number.parseInt(sp.get("page") ?? "1", 10) || 1);
    const all = await listAllCandidates(filters);
    const total = all.length;
    const pageCount = Math.max(1, Math.ceil(total / pageSize));
    const start = (page - 1) * pageSize;
    const rows = all.slice(start, start + pageSize).map(toRow);
    return Response.json(
      { columns: COLUMNS, rows, total, page, pageCount },
      { headers: { "Cache-Control": "private, no-store" } },
    );
  }

  const rows = await listAllCandidates(filters);
  const csv = toCsv([COLUMNS, ...rows.map(toRow)]);

  return new Response("\uFEFF" + csv, {
    headers: {
      "Content-Type": "text/csv; charset=utf-8",
      "Content-Disposition": `attachment; filename="candidates-${new Date().toISOString().slice(0, 10)}.csv"`,
      "Cache-Control": "private, no-store",
    },
  });
}
