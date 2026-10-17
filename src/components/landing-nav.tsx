"use client";

import { Moon, Sun, Zap } from "lucide-react";
import { useTheme } from "next-themes";
import Link from "next/link";
import { useEffect, useState } from "react";

export function LandingNav() {
  const { theme, setTheme } = useTheme();
  const [mounted, setMounted] = useState(false);
  useEffect(() => setMounted(true), []);

  const isDark = theme === "dark";

  return (
    <header className="fixed inset-x-0 top-0 z-50 border-b border-line/60 bg-canvas/80 backdrop-blur-lg">
      <nav className="mx-auto flex max-w-6xl items-center justify-between px-5 py-4 md:px-10">
        <Link href="/" className="flex items-center gap-2">
          <span className="font-serif text-2xl text-accent" aria-hidden>✺</span>
          <span className="font-serif text-xl tracking-tight">Mini ATS</span>
        </Link>
        <div className="flex items-center gap-3">
          <button
            type="button"
            aria-label={isDark ? "Switch to light mode" : "Switch to dark mode"}
            onClick={() => mounted && setTheme(isDark ? "light" : "dark")}
            className="rounded-xl border border-line bg-surface p-2 text-muted hover:text-ink"
          >
            {mounted && (isDark ? <Sun size={16} /> : <Moon size={16} />)}
          </button>
          <Link href="/login" className="btn-ghost hidden sm:inline-flex">Sign in</Link>
          <Link href="/signup" className="btn-primary">
            <Zap size={15} /> Get started
          </Link>
        </div>
      </nav>
    </header>
  );
}
