import type { Metadata } from "next";
import { KanbanBoard, type BoardCard } from "@/components/kanban-board";
import { PageHeader } from "@/components/page-header";
import { STAGES, type Stage } from "@/lib/constants";
import { getBoard } from "@/lib/queries";

export const metadata: Metadata = { title: "Board" };
export const dynamic = "force-dynamic";

export default async function BoardPage() {
  const board = await getBoard();
  const initial = Object.fromEntries(
    STAGES.map((s) => [
      s,
      board[s].map(
        (c): BoardCard => ({
          id: c.id,
          name: c.name,
          position: c.position,
          stage: c.stage,
          experienceYears: c.experienceYears,
          skills: c.skills,
          createdAt: c.createdAt.toISOString(),
        }),
      ),
    ]),
  ) as Record<Stage, BoardCard[]>;

  return (
    <>
      <PageHeader title="Board" description="Drag a card to another column to change its stage. On touch screens, use the Move menu on each card." />
      <KanbanBoard initial={initial} />
    </>
  );
}
