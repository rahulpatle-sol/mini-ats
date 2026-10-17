import Link from "next/link";

export default function NotFound() {
  return (
    <div className="relative grid min-h-dvh place-items-center overflow-hidden px-6">
      {/* faint desert-warm wash */}
      <div className="pointer-events-none absolute inset-0 -z-10 bg-[radial-gradient(ellipse_60%_50%_at_50%_100%,rgba(196,98,63,0.12),transparent_70%)]" />

      <div className="text-center">
        <p className="tele-label mb-4">Error 404 // Lost in the dunes</p>
        <h1 className="font-serif text-5xl tracking-tight md:text-6xl">
          Page <span className="text-accent">not found</span>
        </h1>
        <p className="mx-auto mt-4 max-w-sm text-muted">
          This route doesn&apos;t exist — the candidate may have been deleted, or the link is wrong.
        </p>
        <div className="mt-8 flex flex-wrap justify-center gap-3">
          <Link href="/dashboard" className="btn-primary px-6 py-2.5">
            Back to dashboard
          </Link>
          <Link href="/candidates" className="btn-ghost px-6 py-2.5">
            Candidates
          </Link>
          <Link href="/" className="btn-ghost px-6 py-2.5">
            Home
          </Link>
        </div>
      </div>
    </div>
  );
}
