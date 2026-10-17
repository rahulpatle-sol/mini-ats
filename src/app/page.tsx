import type { Metadata } from "next";
import Link from "next/link";
import { redirect } from "next/navigation";
import { DemoVideo } from "@/components/demo-video";
import { HeroPipelineSvg } from "@/components/hero-pipeline";
import { LandingNav } from "@/components/landing-nav";
import { ParallaxCard, Reveal, ScrollDraw } from "@/components/scroll-effects";
import { getSession } from "@/lib/session";
import { ArrowRight, BarChart3, Briefcase, FileUp, KanbanSquare, Mail, Search, StickyNote, Users, Zap } from "lucide-react";

export const metadata: Metadata = {
  title: "Mini ATS — Track candidates from applied to hired",
  description: "A lightweight applicant tracking system: jobs, candidates, pipeline stages, notes, resume uploads, CSV export and dashboard metrics.",
};
export const dynamic = "force-dynamic";

/* ─── Section 1: Hero ─── */
function Hero() {
  return (
    <section className="relative overflow-hidden pt-28 pb-16 md:pt-36 md:pb-24" aria-labelledby="hero-h">
      {/* soft gradient wash */}
      <div className="pointer-events-none absolute inset-0 -z-10">
        <div className="absolute -top-32 left-1/2 h-[520px] w-[900px] -translate-x-1/2 rounded-full bg-accent/10 blur-[120px]" />
        <div className="absolute right-0 top-40 h-72 w-72 rounded-full bg-violet-500/10 blur-[80px]" />
        <div className="absolute bottom-0 left-0 h-64 w-64 rounded-full bg-emerald-500/10 blur-[80px]" />
      </div>

      <div className="mx-auto max-w-6xl px-5 md:px-10">
        <div className="grid items-center gap-12 lg:grid-cols-2 lg:gap-16">
          {/* left: copy */}
          <div>
            <Reveal>
              <p className="mb-5 inline-flex items-center gap-2 rounded-full border border-line bg-surface/80 px-4 py-1.5 text-sm text-muted shadow-sm backdrop-blur">
                <span className="relative flex size-2">
                  <span className="absolute inline-flex size-full animate-ping rounded-full bg-emerald-400 opacity-75" />
                  <span className="relative inline-flex size-2 rounded-full bg-emerald-500" />
                </span>
                Lightweight. Fast. Open source.
              </p>
            </Reveal>

            <Reveal delay={80}>
              <h1 id="hero-h" className="font-serif text-[2.75rem] leading-[1.05] tracking-tight md:text-6xl xl:text-7xl">
                Hiring, <span className="italic text-accent">decoded.</span>
                <br />
                Applied to hired
                <br className="hidden sm:block" /> in one pipeline.
              </h1>
            </Reveal>

            <Reveal delay={160}>
              <p className="mt-6 max-w-lg text-lg leading-relaxed text-muted">
                Every candidate moves through <strong className="font-medium text-ink">Applied → Screening → Interview → Offer → Hired</strong>. Notes, resumes, stage history and metrics — all in one place your whole team can trust.
              </p>
            </Reveal>

            <Reveal delay={240}>
              <div className="mt-9 flex flex-wrap items-center gap-4">
                <Link href="/signup" className="btn-primary px-7 py-3 text-base shadow-lg shadow-accent/25">
                  Start free <ArrowRight size={17} />
                </Link>
                <Link href="/login" className="btn-ghost px-7 py-3 text-base">
                  Sign in
                </Link>
              </div>
            </Reveal>

            <Reveal delay={320}>
              <div className="mt-10 flex flex-wrap gap-x-8 gap-y-3 text-sm text-muted">
                <span className="inline-flex items-center gap-1.5"><Zap size={14} className="text-accent" /> Setup in 1 minute</span>
                <span className="inline-flex items-center gap-1.5"><FileUp size={14} className="text-accent" /> Resume uploads</span>
                <span className="inline-flex items-center gap-1.5"><BarChart3 size={14} className="text-accent" /> Live metrics</span>
              </div>
            </Reveal>
          </div>

          {/* right: animated hiring pipeline */}
          <Reveal delay={200} className="relative">
            <div className="card relative overflow-hidden p-5 shadow-2xl shadow-ink/5 md:p-7">
              <div className="mb-4 flex items-center justify-between">
                <div className="flex items-center gap-2">
                  <span className="font-serif text-lg text-accent" aria-hidden>✺</span>
                  <span className="text-sm font-medium text-muted">Pipeline</span>
                </div>
                <span className="rounded-full bg-emerald-500/10 px-2.5 py-1 text-xs font-medium text-emerald-700 dark:text-emerald-300">Live</span>
              </div>
              <HeroPipelineSvg />
              <p className="mt-2 text-center text-xs text-muted">A candidate&apos;s journey — drawn as the path draws itself.</p>
            </div>

            {/* floating mini stat cards */}
            <div className="absolute -left-4 -top-6 hidden rounded-xl border border-line bg-surface px-3.5 py-2.5 shadow-lg md:block" aria-hidden>
              <p className="text-[11px] text-muted">Hire rate</p>
              <p className="font-serif text-xl leading-none text-accent">38%</p>
            </div>
            <div className="absolute -bottom-5 -right-3 hidden rounded-xl border border-line bg-surface px-3.5 py-2.5 shadow-lg md:block" aria-hidden>
              <p className="text-[11px] text-muted">Avg days to hire</p>
              <p className="font-serif text-xl leading-none">12</p>
            </div>
          </Reveal>
        </div>
      </div>
    </section>
  );
}

/* ─── Section 2: Features grid ─── */
const FEATURES = [
  { icon: Briefcase, title: "Jobs table", desc: "Separate roles with open/closed status. Candidates reference a job, not free text." },
  { icon: Users, title: "Candidate profiles", desc: "Name, email, phone, skills, experience, source. Duplicate checks built in." },
  { icon: FileUp, title: "Resume upload", desc: "PDF/DOC/DOCX up to 3 MB with magic-byte validation. Or paste a portfolio link." },
  { icon: StickyNote, title: "Unlimited notes", desc: "Interview feedback, observations — add and delete any number of notes per candidate." },
  { icon: KanbanSquare, title: "Drag-and-drop board", desc: "Kanban pipeline with optimistic updates. Stage rules prevent invalid moves." },
  { icon: Search, title: "Search & filter", desc: "Search by name, email, role or skill. Filter by stage and job. Sort and paginate." },
  { icon: BarChart3, title: "Dashboard metrics", desc: "Totals, hire rate, avg days to hire, weekly charts, busiest roles and activity feed." },
  { icon: Mail, title: "Email alerts", desc: "New-candidate notification and optional stage-update emails via Resend." },
];

function Features() {
  return (
    <section className="border-t border-line py-20 md:py-28" aria-labelledby="features-h">
      <div className="mx-auto max-w-6xl px-5 md:px-10">
        <Reveal>
          <p className="text-sm font-medium uppercase tracking-widest text-accent">Features</p>
          <h2 id="features-h" className="mt-3 max-w-2xl font-serif text-4xl tracking-tight md:text-5xl">
            Everything you need to run hiring
          </h2>
        </Reveal>
        <div className="mt-14 grid gap-5 sm:grid-cols-2 lg:grid-cols-4">
          {FEATURES.map((f, i) => (
            <Reveal key={f.title} delay={i * 60}>
              <div className="card h-full p-6 transition-shadow hover:shadow-lg">
                <span className="inline-flex rounded-xl bg-accent-soft p-3 text-accent">
                  <f.icon size={20} />
                </span>
                <h3 className="mt-4 font-serif text-lg">{f.title}</h3>
                <p className="mt-1.5 text-sm leading-relaxed text-muted">{f.desc}</p>
              </div>
            </Reveal>
          ))}
        </div>
      </div>
    </section>
  );
}

/* ─── Section 3: Demo video ─── */
function VideoSection() {
  return (
    <section className="border-t border-line bg-sidebar/40 py-20 md:py-28" aria-labelledby="video-h">
      <div className="mx-auto max-w-6xl px-5 md:px-10">
        <Reveal className="text-center">
          <p className="text-sm font-medium uppercase tracking-widest text-accent">Demo</p>
          <h2 id="video-h" className="mt-3 font-serif text-4xl tracking-tight md:text-5xl">
            See it in 30 seconds
          </h2>
          <p className="mx-auto mt-4 max-w-md text-muted">Add a candidate, drag them through stages, export a CSV.</p>
        </Reveal>
        <Reveal delay={120} className="mt-12">
          <DemoVideo />
        </Reveal>
      </div>
    </section>
  );
}

/* ─── Section 4: Pipeline / scroll-drawn SVG ─── */
const STAGES = ["Applied", "Screening", "Interview", "Offer", "Hired"];

function Pipeline() {
  return (
    <section className="border-t border-line py-20 md:py-28" aria-labelledby="pipeline-h">
      <div className="mx-auto max-w-6xl px-5 md:px-10">
        <Reveal>
          <p className="text-sm font-medium uppercase tracking-widest text-accent">Workflow</p>
          <h2 id="pipeline-h" className="mt-3 max-w-2xl font-serif text-4xl tracking-tight md:text-5xl">
            One pipeline, five stages, zero confusion
          </h2>
          <p className="mt-4 max-w-lg text-muted">
            Every move is logged with a timestamp and optional note. Hired is final; rejected can be reopened. The rules live in one function both server and UI share.
          </p>
        </Reveal>

        <Reveal delay={100} className="mt-14">
          <svg viewBox="0 0 900 180" className="w-full" role="img" aria-label="Pipeline: Applied to Screening to Interview to Offer to Hired">
            <ScrollDraw
              d="M 60 90 H 180 C 220 90, 220 50, 260 50 H 380 C 420 50, 420 90, 460 90 H 580 C 620 90, 620 50, 660 50 H 780 C 810 50, 820 90, 850 90"
              strokeWidth={3}
            />
            {STAGES.map((s, i) => {
              const x = 60 + i * 197;
              const y = i % 2 === 0 ? 90 : 50;
              return (
                <g key={s}>
                  <circle cx={x} cy={y} r={12} fill="var(--accent)" />
                  <circle cx={x} cy={y} r={5} fill="var(--surface)" />
                  <text x={x} y={y + 36} textAnchor="middle" fill="var(--ink)" fontSize="14" fontWeight="600" fontFamily="system-ui">
                    {s}
                  </text>
                </g>
              );
            })}
          </svg>
        </Reveal>

        <div className="mt-14 grid gap-6 md:grid-cols-3">
          {[
            { title: "Stage rules enforced", desc: "Hired is terminal. Rejected can only reopen to Applied. Everything else is free to move." },
            { title: "History you can trust", desc: "Stage change + history insert run in a single atomic batch — history never drifts." },
            { title: "Notify the candidate", desc: "Tick one box to queue a stage-update email. Resend in prod, console in dev." },
          ].map((c, i) => (
            <Reveal key={c.title} delay={i * 80}>
              <ParallaxCard speed={0.03}>
                <div className="card h-full p-6">
                  <h3 className="font-serif text-lg">{c.title}</h3>
                  <p className="mt-2 text-sm leading-relaxed text-muted">{c.desc}</p>
                </div>
              </ParallaxCard>
            </Reveal>
          ))}
        </div>
      </div>
    </section>
  );
}

/* ─── Section 5: CTA ─── */
function CTA() {
  return (
    <section className="relative overflow-hidden border-t border-line py-24 md:py-32" aria-labelledby="cta-h">
      <svg className="pointer-events-none absolute inset-x-0 bottom-0 h-64 w-full opacity-20" viewBox="0 0 1200 240" preserveAspectRatio="none" aria-hidden>
        <ScrollDraw d="M0 200 Q 300 120, 600 180 T 1200 140" strokeWidth={2} />
        <ScrollDraw d="M0 220 Q 300 160, 600 210 T 1200 180" strokeWidth={1.5} />
      </svg>

      <div className="mx-auto max-w-6xl px-5 text-center md:px-10">
        <Reveal>
          <p className="font-serif text-4xl text-accent" aria-hidden>✺</p>
          <h2 id="cta-h" className="mx-auto mt-6 max-w-2xl font-serif text-4xl tracking-tight md:text-5xl">
            Ready to streamline your hiring?
          </h2>
          <p className="mx-auto mt-4 max-w-md text-muted">
            Create your account, add a job and your first candidate takes under a minute.
          </p>
        </Reveal>
        <Reveal delay={120}>
          <div className="mt-9 flex flex-wrap justify-center gap-4">
            <Link href="/signup" className="btn-primary px-7 py-3 text-base">
              Create free account <ArrowRight size={17} />
            </Link>
            <Link href="/login" className="btn-ghost px-7 py-3 text-base">
              I already have one
            </Link>
          </div>
        </Reveal>
      </div>
    </section>
  );
}

export default async function LandingPage() {
  if (await getSession().catch(() => null)) redirect("/dashboard");

  return (
    <>
      <LandingNav />
      <main>
        <Hero />
        <Features />
        <VideoSection />
        <Pipeline />
        <CTA />
      </main>
      <footer className="border-t border-line py-8 text-center text-sm text-muted">
        Mini ATS — a lightweight applicant tracking system.
      </footer>
    </>
  );
}
