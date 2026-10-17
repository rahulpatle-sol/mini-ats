import type { Metadata } from "next";
import { KanbanBoard, type BoardCard } from "@/components/kanban-board";
import { PageHeader } from "@/components/page-header";
import type { Stage } from "@/lib/constants";
import { getBoard } from "@/lib/queries";
import { getSession } from "@/lib/session";

export const metadata: Metadata = { title: "Board" };
export const dynamic = "force-dynamic";

export default async function BoardPage() {
  const session = await getSession();
  if (!session) return null;
  const board = await getBoard(session.uid);
  const initial = Object.fromEntries(
    Object.entries(board).map(([stage, rows]) => [
      stage,
      rows.map(
        (c): BoardCard => ({
          id: c.id,
          name: c.name,
          jobTitle: c.jobTitle,
          stage: c.stage as Stage,
          experienceYears: c.experienceYears,
          skills: c.skills,
          createdAt: c.createdAt.toISOString(),
        }),
      ),
    ]),
  ) as Record<Stage, BoardCard[]>;

  return (
    <div className="page-full">
      <PageHeader title="Board" description="Drag candidates between stages. Changes save automatically." />
      <KanbanBoard initial={initial} />
    </div>
  );
}
