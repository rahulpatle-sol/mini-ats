"use client";

import { Briefcase, KanbanSquare, LayoutDashboard, LogOut, Moon, Plus, Sun, Users } from "lucide-react";
import Link from "next/link";
import { usePathname } from "next/navigation";
import { useTheme } from "next-themes";
import { useEffect, useState } from "react";
import { logout } from "@/actions/auth";
import { cn } from "@/lib/utils";

const NAV = [
  { href: "/dashboard", label: "Overview", icon: LayoutDashboard },
  { href: "/candidates", label: "Candidates", icon: Users },
  { href: "/jobs", label: "Jobs", icon: Briefcase },
  { href: "/board", label: "Board", icon: KanbanSquare },
];

function ThemeBtn({ className }: { className?: string }) {
  const { theme, setTheme } = useTheme();
  const [mounted, setMounted] = useState(false);
  useEffect(() => setMounted(true), []);
  if (!mounted) return <span className={className} />;
  const isDark = theme === "dark";
  return (
    <button
      type="button"
      aria-label={isDark ? "Switch to light mode" : "Switch to dark mode"}
      onClick={() => setTheme(isDark ? "light" : "dark")}
      className={className}
    >
      {isDark ? <Sun size={17} /> : <Moon size={17} />}
    </button>
  );
}

export function Sidebar({ email }: { email?: string }) {
  const pathname = usePathname();
  const isActive = (href: string) => (href === "/dashboard" ? pathname === "/dashboard" : pathname.startsWith(href));

  return (
    <>
      <aside className="sticky top-0 hidden h-dvh w-64 shrink-0 flex-col border-r border-line bg-sidebar px-4 py-5 md:flex">
        <Link href="/dashboard" className="mb-6 flex items-center gap-2.5 px-2">
          <span className="font-serif text-2xl leading-none text-accent" aria-hidden>✺</span>
          <span className="font-serif text-xl tracking-tight">Mini ATS</span>
        </Link>

        <Link href="/candidates/new" className="btn-primary mb-5 w-full">
          <Plus size={16} /> New candidate
        </Link>

        <nav className="flex flex-col gap-1" aria-label="Main">
          {NAV.map(({ href, label, icon: Icon }) => (
            <Link
              key={href}
              href={href}
              aria-current={isActive(href) ? "page" : undefined}
              className={cn(
                "flex items-center gap-3 rounded-xl px-3 py-2 text-sm transition-colors",
                isActive(href) ? "bg-surface font-medium shadow-[0_0_0_1px_var(--line)]" : "text-muted hover:bg-surface/60 hover:text-ink",
              )}
            >
              <Icon size={17} /> {label}
            </Link>
          ))}
        </nav>

        <div className="mt-auto space-y-1 border-t border-line pt-4">
          <ThemeBtn className="flex w-full items-center gap-3 rounded-xl px-3 py-2 text-sm text-muted hover:bg-surface/60 hover:text-ink" />
          <form action={logout}>
            {email && <p className="mb-1 truncate px-3 text-xs text-muted">{email}</p>}
            <button type="submit" className="flex w-full items-center gap-3 rounded-xl px-3 py-2 text-sm text-muted hover:bg-surface/60 hover:text-ink">
              <LogOut size={17} /> Sign out
            </button>
          </form>
        </div>
      </aside>

      <header className="sticky top-0 z-20 flex items-center justify-between gap-3 border-b border-line bg-sidebar/95 px-4 py-3 backdrop-blur md:hidden">
        <Link href="/dashboard" className="flex items-center gap-2">
          <span className="font-serif text-xl text-accent" aria-hidden>✺</span>
          <span className="font-serif text-lg">Mini ATS</span>
        </Link>
        <nav className="flex items-center gap-0.5" aria-label="Main">
          {NAV.map(({ href, label, icon: Icon }) => (
            <Link
              key={href}
              href={href}
              aria-label={label}
              aria-current={isActive(href) ? "page" : undefined}
              className={cn("rounded-lg p-2", isActive(href) ? "bg-surface text-ink" : "text-muted")}
            >
              <Icon size={18} />
            </Link>
          ))}
          <Link href="/candidates/new" aria-label="New candidate" className="ml-1 rounded-lg bg-accent p-2 text-accent-ink">
            <Plus size={18} />
          </Link>
          <ThemeBtn className="rounded-lg p-2 text-muted" />
          <form action={logout}>
            <button type="submit" aria-label="Sign out" className="rounded-lg p-2 text-muted">
              <LogOut size={18} />
            </button>
          </form>
        </nav>
      </header>
    </>
  );
}
