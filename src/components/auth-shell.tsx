import Link from "next/link";

const AUTH_BG = "/img/auth.jpg";

/** Centered popup-style auth card over a full-bleed photo. */
export function AuthShell({
  title,
  subtitle,
  children,
  footer,
}: {
  title: string;
  subtitle: string;
  children: React.ReactNode;
  footer: React.ReactNode;
}) {
  return (
    <div className="relative min-h-dvh overflow-hidden bg-[#1a0f0a]">
      {/* background photo */}
      <div
        className="absolute inset-0 bg-cover bg-center"
        style={{ backgroundImage: `url(${AUTH_BG})` }}
        aria-hidden
      />
      <div className="absolute inset-0 bg-black/45" />

      {/* centered popup card */}
      <div className="relative z-10 flex min-h-dvh items-center justify-center px-4 py-10">
        <div className="auth-pop w-full max-w-md">
          <Link href="/" className="mb-6 flex items-center justify-center gap-2.5">
            <span className="flex size-10 items-center justify-center rounded-full border border-white/30 text-xl text-white" aria-hidden>
              ✺
            </span>
            <span className="font-serif text-2xl tracking-tight text-white drop-shadow">Mini ATS</span>
          </Link>

          <div className="rounded-3xl border border-white/15 bg-white/92 p-8 shadow-2xl shadow-black/50 backdrop-blur-xl dark:bg-black/75 sm:p-10">
            <h1 className="font-serif text-3xl tracking-tight md:text-4xl">{title}</h1>
            <p className="mt-2 text-[15px] text-muted">{subtitle}</p>

            <div className="mt-7">{children}</div>
          </div>

          <p className="mt-6 text-center text-[15px] text-white/80 drop-shadow">{footer}</p>
        </div>
      </div>
    </div>
  );
}
