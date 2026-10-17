import type { Metadata } from "next";
import Link from "next/link";
import { redirect } from "next/navigation";
import { Counter } from "@/components/counter";
import { DemoVideo } from "@/components/demo-video";
import { GsapDrift, GsapParallaxImage, GsapPinScale, GsapReveal } from "@/components/gsap-effects";
import { HeroPipelineSvg } from "@/components/hero-pipeline";
import { LandingNav } from "@/components/landing-nav";
import { ScrollDraw } from "@/components/scroll-effects";
import { SmoothScroll } from "@/components/smooth-scroll";
import { Starfield } from "@/components/starfield";
import { getSession } from "@/lib/session";
import { ArrowUpRight } from "lucide-react";

export const metadata: Metadata = {
  title: "Mini ATS — The integrated hiring platform",
  description: "One integrated platform for jobs, candidates, pipeline stages, notes, resumes, CSV export and dashboard metrics.",
};
export const dynamic = "force-dynamic";

const IMG = {
  hero: "/img/hero.jpg",
  platform: "/img/platform.jpg",
  pipeline: "/img/pipeline.jpg",
  rules: "/img/rules.jpg",
  cta: "/img/cta.jpg",
};

/* ─── Hero ─── */
function Hero() {
  return (
    <section className="relative flex min-h-svh flex-col justify-end overflow-hidden pb-16 pt-32 md:pb-24" aria-labelledby="hero-h">
      {/* cinematic photo bg with GSAP parallax */}
      <GsapParallaxImage
        src={IMG.hero}
        amount={16}
        className="absolute inset-0"
        overlay={
          <>
            <div className="absolute inset-0 bg-gradient-to-b from-black/70 via-black/50 to-black" />
            <Starfield density={120} />
            <div className="absolute inset-0 bg-[radial-gradient(ellipse_70%_50%_at_50%_120%,rgba(217,128,95,0.18),transparent_70%)]" />
          </>
        }
      />

      <GsapPinScale className="relative mx-auto w-full max-w-7xl px-6 lg:px-10">
        <GsapReveal stagger={0.12}>
          <p className="tele-label mb-6">Applicant Tracking System &nbsp;//&nbsp; Hiring Infrastructure</p>
          <h1 id="hero-h" className="max-w-5xl text-[13vw] font-medium leading-[0.92] tracking-[-0.04em] md:text-[7.5vw] lg:text-[6.5rem]">
            Accelerating
            <br />
            hiring velocity.
          </h1>
          <div className="mt-8 flex flex-col gap-6 md:flex-row md:items-end md:justify-between">
            <p className="max-w-md text-[15px] leading-relaxed text-white/50">
              One integrated platform. Track every candidate from applied to hired — jobs, resumes, stages, notes and metrics, on one pipeline.
            </p>
            <div className="flex flex-wrap gap-3">
              <Link href="/signup" className="rounded-full bg-white px-7 py-3 text-[12px] font-medium uppercase tracking-[0.18em] text-black transition-opacity hover:opacity-85">
                Start free
              </Link>
              <Link href="/login" className="rounded-full border border-white/20 px-7 py-3 text-[12px] uppercase tracking-[0.18em] text-white/80 transition-colors hover:border-white/50 hover:text-white">
                Sign in
              </Link>
            </div>
          </div>
        </GsapReveal>
      </GsapPinScale>
    </section>
  );
}

/* ─── Telemetry stats band ─── */
const STATS = [
  { value: 5, suffix: "", label: "Pipeline stages", chip: "ACTIVE" },
  { value: 28, suffix: "+", label: "Demo candidates", chip: "LIVE" },
  { value: 78, suffix: "", label: "Stage events logged", chip: "SYNCED" },
  { value: 100, suffix: "%", label: "Audit trail coverage", chip: "VERIFIED" },
];

function StatsBand() {
  return (
    <section className="border-y border-white/10" aria-label="Platform statistics">
      <div className="mx-auto grid max-w-7xl grid-cols-2 lg:grid-cols-4">
        {STATS.map((s, i) => (
          <GsapDrift key={s.label} from={i % 2 === 0 ? -50 : 50} className="h-full">
            <div className={`flex h-full flex-col gap-3 border-white/10 px-6 py-10 lg:px-10 ${i < 3 ? "lg:border-r" : ""} ${i % 2 === 0 ? "border-r lg:border-r" : ""} ${i < 2 ? "border-b lg:border-b-0" : ""} ${i === 2 ? "border-b lg:border-b-0 border-r-0" : ""}`}>
              <span className="tele-chip w-fit">{s.chip}</span>
              <p className="text-4xl font-medium tracking-tight md:text-5xl">
                <Counter to={s.value} suffix={s.suffix} />
              </p>
              <p className="tele-label">{s.label}</p>
            </div>
          </GsapDrift>
        ))}
      </div>
    </section>
  );
}

/* ─── One integrated platform ─── */
const MISSIONS = [
  {
    code: "01",
    title: "Jobs & Roles",
    desc: "Separate every open role with status tracking. Candidates reference a job — never free text. Duplicate checks built in.",
    chips: ["OPEN", "CLOSED"],
  },
  {
    code: "02",
    title: "Pipeline Engine",
    desc: "Applied → Screening → Interview → Offer → Hired. Drag-and-drop with atomic stage rules. Every move logged with a timestamp.",
    chips: ["ENFORCED", "ATOMIC"],
  },
  {
    code: "03",
    title: "Resume Vault",
    desc: "PDF/DOC/DOCX uploads with magic-byte validation, or paste a portfolio link. Download resumes straight from the profile.",
    chips: ["VALIDATED", "SECURE"],
  },
  {
    code: "04",
    title: "Telemetry & Export",
    desc: "Dashboard metrics, hire rate, avg days to hire, weekly charts — and one-click CSV export of your entire candidate table.",
    chips: ["LIVE", "CSV"],
  },
];

function Platform() {
  return (
    <section className="relative overflow-hidden py-24 md:py-36" aria-labelledby="platform-h">
      {/* background photo with GSAP parallax */}
      <GsapParallaxImage
        src={IMG.platform}
        amount={10}
        className="absolute inset-0"
        overlay={
          <>
            <div className="absolute inset-0 opacity-30" />
            <div className="absolute inset-0 bg-gradient-to-b from-black via-black/80 to-black" />
          </>
        }
      />
      <div className="relative mx-auto max-w-7xl px-6 lg:px-10">
        <GsapReveal>
          <p className="tele-label mb-5">What we do &nbsp;//&nbsp; Platform</p>
          <h2 id="platform-h" className="max-w-3xl text-4xl font-medium leading-[1.05] tracking-[-0.03em] md:text-6xl lg:text-7xl">
            One integrated
            <br />
            platform.
          </h2>
        </GsapReveal>

        <div className="mt-16 grid gap-px border border-white/10 bg-white/10 md:grid-cols-2">
          {MISSIONS.map((m, i) => (
            <GsapDrift key={m.code} from={i % 2 === 0 ? -60 : 60} className="h-full">
              <article className="group relative h-full bg-black p-8 transition-colors hover:bg-[#0a0a0a] md:p-10">
                <div className="flex items-start justify-between">
                  <span className="tele-label">{m.code}</span>
                  <ArrowUpRight size={18} className="text-white/25 transition-all group-hover:-translate-y-0.5 group-hover:translate-x-0.5 group-hover:text-white/70" />
                </div>
                <h3 className="mt-10 text-2xl font-medium tracking-tight md:text-3xl">{m.title}</h3>
                <p className="mt-4 max-w-sm text-[14px] leading-relaxed text-white/45">{m.desc}</p>
                <div className="mt-8 flex gap-2">
                  {m.chips.map((c) => (
                    <span key={c} className="tele-chip">{c}</span>
                  ))}
                </div>
              </article>
            </GsapDrift>
          ))}
        </div>
      </div>
    </section>
  );
}

/* ─── Live pipeline HUD ─── */
function PipelineHUD() {
  return (
    <section className="relative overflow-hidden border-y border-white/10 py-24 md:py-36" aria-labelledby="hud-h">
      <GsapParallaxImage
        src={IMG.pipeline}
        amount={12}
        className="absolute inset-0"
        overlay={
          <>
            <div className="absolute inset-0 bg-gradient-to-b from-black/90 via-black/75 to-black/90" />
            <div className="tele-grid absolute inset-0 opacity-60" />
          </>
        }
      />
      <div className="relative mx-auto max-w-7xl px-6 lg:px-10">
        <div className="flex flex-col gap-6 md:flex-row md:items-end md:justify-between">
          <GsapReveal>
            <p className="tele-label mb-5">Pipeline &nbsp;//&nbsp; Live telemetry</p>
            <h2 id="hud-h" className="max-w-2xl text-4xl font-medium leading-[1.05] tracking-[-0.03em] md:text-6xl">
              Operating on
              <br />
              every hire.
            </h2>
          </GsapReveal>
          <GsapDrift from={60}>
            <div className="flex gap-2">
              <span className="tele-chip border-emerald-400/40 text-emerald-300">● LIVE</span>
              <span className="tele-chip">AUTO-DRAW</span>
            </div>
          </GsapDrift>
        </div>

        <GsapReveal y={80} className="mt-14">
          <div className="rounded-2xl border border-white/10 bg-[#050505] p-6 md:p-10">
            <div className="mb-6 flex flex-wrap items-center justify-between gap-3">
              <span className="tele-label">Candidate trajectory</span>
              <div className="flex gap-4">
                <span className="tele-label">Velocity <span className="text-white/80">1.0 move/h</span></span>
                <span className="tele-label">Confidence <span className="text-emerald-300">99.2%</span></span>
              </div>
            </div>
            <HeroPipelineSvg />
          </div>
        </GsapReveal>

        {/* stage ticker */}
        <GsapReveal y={40} className="mt-8 overflow-hidden border-y border-white/10 py-4">
          <div className="tele-marquee flex w-max gap-12 whitespace-nowrap">
            {Array.from({ length: 2 }).flatMap((_, r) =>
              ["APPLIED", "SCREENING", "INTERVIEW", "OFFER", "HIRED", "REJECTED → REOPEN", "NOTES ×∞", "CSV EXPORT", "RESUME VAULT", "DASHBOARD"].map((t, i) => (
                <span key={`${r}-${i}`} className="tele-label">
                  {t} <span className="mx-4 text-white/20">/</span>
                </span>
              )),
            )}
          </div>
        </GsapReveal>
      </div>
    </section>
  );
}

/* ─── Demo video ─── */
function VideoSection() {
  return (
    <section className="py-24 md:py-36" aria-labelledby="video-h">
      <div className="mx-auto max-w-7xl px-6 lg:px-10">
        <GsapReveal>
          <p className="tele-label mb-5">Demo &nbsp;//&nbsp; 30 seconds</p>
          <h2 id="video-h" className="text-4xl font-medium tracking-[-0.03em] md:text-6xl">See it move.</h2>
          <p className="mt-4 max-w-md text-[15px] text-white/45">Add a candidate, drag them through stages, export a CSV.</p>
        </GsapReveal>
        <GsapReveal y={90} className="mt-12">
          <div className="rounded-2xl border border-white/10 bg-[#050505] p-4 md:p-6">
            <DemoVideo />
          </div>
        </GsapReveal>
      </div>
    </section>
  );
}

/* ─── Mission rules ─── */
const RULES = [
  { k: "Hired is terminal", v: "Once a candidate reaches Hired, the stage locks. No silent overwrites." },
  { k: "Rejected can reopen", v: "Only back to Applied. The rule lives in one function shared by server and UI." },
  { k: "Atomic history", v: "Stage change + history insert run in a single batch — history never drifts." },
  { k: "Notify on move", v: "Tick one box to queue a stage-update email. Resend in prod, console in dev." },
];

function Rules() {
  return (
    <section className="relative overflow-hidden border-y border-white/10 py-24 md:py-36" aria-labelledby="rules-h">
      <GsapParallaxImage
        src={IMG.rules}
        amount={8}
        className="absolute inset-0"
        overlay={<div className="absolute inset-0 bg-gradient-to-b from-black/85 via-black/70 to-black/85" />}
      />
      <div className="relative mx-auto max-w-7xl px-6 lg:px-10">
        <GsapReveal>
          <p className="tele-label mb-5">Mission rules</p>
          <h2 id="rules-h" className="max-w-2xl text-4xl font-medium leading-[1.05] tracking-[-0.03em] md:text-6xl">
            Rules you can trust.
          </h2>
        </GsapReveal>
        <dl className="mt-14 border-t border-white/10">
          {RULES.map((r) => (
            <GsapDrift key={r.k} from={-70}>
              <div className="grid gap-2 border-b border-white/10 py-8 md:grid-cols-[280px_1fr] md:gap-10 md:py-10">
                <dt className="text-xl font-medium tracking-tight md:text-2xl">{r.k}</dt>
                <dd className="max-w-xl text-[14px] leading-relaxed text-white/45">{r.v}</dd>
              </div>
            </GsapDrift>
          ))}
        </dl>
      </div>
    </section>
  );
}

/* ─── CTA ─── */
function CTA() {
  return (
    <section className="relative overflow-hidden py-28 md:py-40" aria-labelledby="cta-h">
      <GsapParallaxImage
        src={IMG.cta}
        amount={14}
        className="absolute inset-0"
        overlay={
          <>
            <div className="absolute inset-0 bg-gradient-to-b from-black/80 via-black/60 to-black" />
            <Starfield density={90} />
          </>
        }
      />
      <svg className="pointer-events-none absolute inset-x-0 bottom-0 h-48 w-full opacity-30" viewBox="0 0 1200 200" preserveAspectRatio="none" aria-hidden>
        <ScrollDraw d="M0 160 Q 300 80, 600 140 T 1200 100" strokeWidth={1.5} />
      </svg>
      <div className="relative mx-auto max-w-7xl px-6 text-center lg:px-10">
        <GsapReveal stagger={0.14}>
          <p className="tele-label mb-6">Ready for launch</p>
          <h2 id="cta-h" className="mx-auto max-w-3xl text-4xl font-medium leading-[1.02] tracking-[-0.03em] md:text-6xl lg:text-7xl">
            Streamline hiring.
            <br />
            Ship faster.
          </h2>
          <div className="mt-10 flex flex-wrap justify-center gap-3">
            <Link href="/signup" className="rounded-full bg-white px-8 py-3.5 text-[12px] font-medium uppercase tracking-[0.18em] text-black transition-opacity hover:opacity-85">
              Create free account
            </Link>
            <Link href="/login" className="rounded-full border border-white/20 px-8 py-3.5 text-[12px] uppercase tracking-[0.18em] text-white/80 transition-colors hover:border-white/50 hover:text-white">
              I already have one
            </Link>
          </div>
        </GsapReveal>
      </div>
    </section>
  );
}

/* ─── Footer ─── */
const FOOTER = [
  { head: "Product", links: [["Pipeline", "/signup"], ["Jobs", "/signup"], ["Candidates", "/signup"], ["Dashboard", "/signup"]] },
  { head: "Mission areas", links: [["Resume upload", "/signup"], ["Stage rules", "/signup"], ["CSV export", "/signup"], ["Email alerts", "/signup"]] },
  { head: "Company", links: [["Sign in", "/login"], ["Create account", "/signup"], ["Health", "/api/health"]] },
];

function Footer() {
  return (
    <footer className="border-t border-white/10 pb-10 pt-16 md:pt-20">
      <div className="mx-auto max-w-7xl px-6 lg:px-10">
        <div className="grid gap-12 md:grid-cols-[1.4fr_1fr_1fr_1fr]">
          <div>
            <div className="flex items-center gap-3">
              <span className="flex size-8 items-center justify-center rounded-full border border-white/20 text-sm" aria-hidden>✺</span>
              <span className="text-[13px] font-medium uppercase tracking-[0.22em]">Mini ATS</span>
            </div>
            <p className="mt-5 max-w-xs text-[13px] leading-relaxed text-white/40">
              A lightweight applicant tracking system for small hiring teams. Applied to hired, one pipeline.
            </p>
          </div>
          {FOOTER.map((col) => (
            <div key={col.head}>
              <p className="tele-label mb-5">{col.head}</p>
              <ul className="space-y-3">
                {col.links.map(([label, href]) => (
                  <li key={label}>
                    <Link href={href} className="text-[13px] text-white/55 transition-colors hover:text-white">
                      {label}
                    </Link>
                  </li>
                ))}
              </ul>
            </div>
          ))}
        </div>
        <div className="mt-16 flex flex-col gap-3 border-t border-white/10 pt-6 text-[11px] uppercase tracking-[0.18em] text-white/30 md:flex-row md:items-center md:justify-between">
          <span>© {new Date().getFullYear()} Mini ATS</span>
          <span>Applied → Screening → Interview → Offer → Hired</span>
        </div>
      </div>
    </footer>
  );
}

export default async function LandingPage() {
  if (await getSession().catch(() => null)) redirect("/dashboard");

  return (
    <SmoothScroll>
      <div className="landing-dark min-h-svh bg-black">
        <LandingNav />
        <main>
          <Hero />
          <StatsBand />
          <Platform />
          <PipelineHUD />
          <VideoSection />
          <Rules />
          <CTA />
        </main>
        <Footer />
      </div>
    </SmoothScroll>
  );
}
