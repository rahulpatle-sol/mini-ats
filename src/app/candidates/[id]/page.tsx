import { ArrowLeft, ExternalLink, Mail, Pencil, Phone } from "lucide-react";
import type { Metadata } from "next";
import Link from "next/link";
import { notFound } from "next/navigation";
import { DeleteButton } from "@/components/delete-button";
import { StageMover } from "@/components/stage-mover";
import { Avatar, StageBadge } from "@/components/stage-badge";
import { STAGE_META } from "@/lib/constants";
import { getCandidate, getCandidateEvents } from "@/lib/queries";
import { cn, daysSince, formatDate, formatDateTime } from "@/lib/utils";

export async function generateMetadata({ params }: { params: Promise<{ id: string }> }): Promise<Metadata> {
  const { id } = await params;
  const c = await getCandidate(id);
  return { title: c?.name ?? "Candidate" };
}

function Row({ label, children }: { label: string; children: React.ReactNode }) {
  return (
    <div className="grid grid-cols-3 gap-4 py-3 text-sm">
      <dt className="text-muted">{label}</dt>
      <dd className="col-span-2 min-w-0 break-words">{children}</dd>
    </div>
  );
}

export default async function CandidatePage({ params }: { params: Promise<{ id: string }> }) {
  const { id } = await params;
  const candidate = await getCandidate(id);
  if (!candidate) notFound();
  const events = await getCandidateEvents(candidate.id);

  return (
    <>
      <Link href="/candidates" className="mb-6 inline-flex items-center gap-1.5 text-sm text-muted hover:text-ink">
        <ArrowLeft size={15} /> Candidates
      </Link>

      <div className="mb-8 flex flex-wrap items-center justify-between gap-5">
        <div className="flex items-center gap-4">
          <Avatar name={candidate.name} size="lg" />
          <div>
            <h1 className="font-serif text-3xl tracking-tight md:text-4xl">{candidate.name}</h1>
            <div className="mt-1.5 flex flex-wrap items-center gap-2.5 text-muted">
              <span>{candidate.position}</span>
              <StageBadge stage={candidate.stage} />
            </div>
          </div>
        </div>
        <div className="flex gap-2">
          <Link href={`/candidates/${candidate.id}/edit`} className="btn-ghost">
            <Pencil size={15} /> Edit
          </Link>
          <DeleteButton id={candidate.id} name={candidate.name} />
        </div>
      </div>

      <div className="grid gap-6 lg:grid-cols-5">
        <div className="space-y-6 lg:col-span-3">
          <section className="card p-6" aria-labelledby="details-h">
            <h2 id="details-h" className="font-serif text-xl">Details</h2>
            <dl className="mt-2 divide-y divide-line">
              <Row label="Email">
                <a href={`mailto:${candidate.email}`} className="inline-flex items-center gap-1.5 hover:underline">
                  <Mail size={14} className="text-muted" /> {candidate.email}
                </a>
              </Row>
              <Row label="Phone">
                {candidate.phone ? (
                  <a href={`tel:${candidate.phone}`} className="inline-flex items-center gap-1.5 hover:underline">
                    <Phone size={14} className="text-muted" /> {candidate.phone}
                  </a>
                ) : (
                  <span className="text-muted">Not added</span>
                )}
              </Row>
              <Row label="Experience">
                {candidate.experienceYears} {candidate.experienceYears === 1 ? "year" : "years"}
              </Row>
              <Row label="Source">{candidate.source ?? <span className="text-muted">Not set</span>}</Row>
              <Row label="Resume">
                {candidate.resumeUrl ? (
                  <a href={candidate.resumeUrl} target="_blank" rel="noopener noreferrer" className="inline-flex items-center gap-1.5 text-accent hover:underline">
                    Open resume <ExternalLink size={13} />
                  </a>
                ) : (
                  <span className="text-muted">No link added</span>
                )}
              </Row>
              <Row label="Applied">
                {formatDate(candidate.createdAt)} <span className="text-muted">({daysSince(candidate.createdAt)} days ago)</span>
              </Row>
              <Row label="Skills">
                {candidate.skills.length ? (
                  <ul className="flex flex-wrap gap-1.5">
                    {candidate.skills.map((s) => (
                      <li key={s} className="rounded-full border border-line bg-canvas px-2.5 py-0.5 text-xs">
                        {s}
                      </li>
                    ))}
                  </ul>
                ) : (
                  <span className="text-muted">None listed</span>
                )}
              </Row>
            </dl>
          </section>

          <section className="card p-6" aria-labelledby="notes-h">
            <h2 id="notes-h" className="font-serif text-xl">Notes</h2>
            {candidate.notes ? (
              <p className="mt-3 whitespace-pre-wrap text-[15px] leading-relaxed">{candidate.notes}</p>
            ) : (
              <p className="mt-3 text-sm text-muted">
                No notes yet. <Link href={`/candidates/${candidate.id}/edit`} className="text-accent hover:underline">Add one</Link>
              </p>
            )}
          </section>
        </div>

        <div className="space-y-6 lg:col-span-2">
          <section className="card p-6" aria-labelledby="move-h">
            <h2 id="move-h" className="mb-4 font-serif text-xl">Hiring stage</h2>
            <StageMover id={candidate.id} stage={candidate.stage} />
          </section>

          <section className="card p-6" aria-labelledby="history-h">
            <h2 id="history-h" className="font-serif text-xl">History</h2>
            <ol className="mt-4">
              {events.map((e, i) => (
                <li key={e.id} className="relative flex gap-3 pb-5 last:pb-0">
                  {i < events.length - 1 && <span className="absolute left-[5px] top-4 h-full w-px bg-line" aria-hidden />}
                  <span className={cn("relative mt-1.5 size-[11px] shrink-0 rounded-full ring-4 ring-surface", STAGE_META[e.toStage].dot)} />
                  <div className="min-w-0">
                    <p className="text-sm">
                      {e.fromStage ? (
                        <>
                          {STAGE_META[e.fromStage].label} <span className="text-muted">to</span> <span className="font-medium">{STAGE_META[e.toStage].label}</span>
                        </>
                      ) : (
                        <span className="font-medium">Applied</span>
                      )}
                    </p>
                    <p className="text-xs text-muted">{formatDateTime(e.createdAt)}</p>
                    {e.note && <p className="mt-1 text-sm text-muted">{e.note}</p>}
                  </div>
                </li>
              ))}
            </ol>
          </section>
        </div>
      </div>
    </>
  );
}
