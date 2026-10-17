"use client";

import { Moon, Sun } from "lucide-react";
import { useTheme } from "next-themes";
import Link from "next/link";
import { useEffect, useState } from "react";

export function LandingNav() {
  const { resolvedTheme, setTheme } = useTheme();
  const [mounted, setMounted] = useState(false);
  useEffect(() => setMounted(true), []);

  const isDark = resolvedTheme !== "light";

  return (
    <header className="fixed inset-x-0 top-0 z-50 border-b border-white/8 bg-black/60 backdrop-blur-xl">
      <nav className="mx-auto flex max-w-7xl items-center justify-between px-6 py-4 lg:px-10">
        <Link href="/" className="group flex items-center gap-3">
          <span className="flex size-8 items-center justify-center rounded-full border border-white/20 text-sm text-white transition-colors group-hover:border-white/50" aria-hidden>
            ✺
          </span>
          <span className="text-[13px] font-medium uppercase tracking-[0.22em] text-white/90">Mini&nbsp;ATS</span>
        </Link>

        <div className="hidden items-center gap-8 md:flex">
          {[
            { href: "/signup", label: "Platform" },
            { href: "/login", label: "Pipeline" },
            { href: "/signup", label: "Company" },
          ].map((l) => (
            <Link key={l.label} href={l.href} className="text-[12px] uppercase tracking-[0.18em] text-white/50 transition-colors hover:text-white">
              {l.label}
            </Link>
          ))}
        </div>

        <div className="flex items-center gap-3">
          <button
            type="button"
            aria-label="Toggle color theme"
            onClick={() => setTheme(isDark ? "light" : "dark")}
            className="rounded-full border border-white/15 p-2 text-white/60 transition-colors hover:border-white/40 hover:text-white"
          >
            {mounted ? (
              isDark ? (
                <Sun size={14} />
              ) : (
                <Moon size={14} />
              )
            ) : (
              <span className="block size-3.5" aria-hidden />
            )}
          </button>
          <Link
            href="/login"
            className="hidden rounded-full border border-white/20 px-5 py-2 text-[12px] uppercase tracking-[0.16em] text-white/80 transition-colors hover:border-white/50 hover:text-white sm:inline-flex"
          >
            Sign in
          </Link>
          <Link
            href="/signup"
            className="rounded-full bg-white px-5 py-2 text-[12px] font-medium uppercase tracking-[0.16em] text-black transition-opacity hover:opacity-85"
          >
            Get started
          </Link>
        </div>
      </nav>
    </header>
  );
}
