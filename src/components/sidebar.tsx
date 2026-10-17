"use client";

import { KanbanSquare, LayoutDashboard, Plus, Users } from "lucide-react";
import Link from "next/link";
import { usePathname } from "next/navigation";
import { cn } from "@/lib/utils";

const NAV = [
  { href: "/", label: "Overview", icon: LayoutDashboard },
  { href: "/candidates", label: "Candidates", icon: Users },
  { href: "/board", label: "Board", icon: KanbanSquare },
];

export function Sidebar() {
  const pathname = usePathname();
  const isActive = (href: string) => (href === "/" ? pathname === "/" : pathname.startsWith(href));

  return (
    <>
      <aside className="sticky top-0 hidden h-dvh w-64 shrink-0 flex-col border-r border-line bg-sidebar px-4 py-5 md:flex">
        <Link href="/" className="mb-6 flex items-center gap-2.5 px-2">
          <span className="font-serif text-2xl leading-none text-accent" aria-hidden>
            ✺
          </span>
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

        <p className="mt-auto px-3 text-xs leading-relaxed text-muted">
          Applied to hired, all in one place.
        </p>
      </aside>

      <header className="sticky top-0 z-20 flex items-center justify-between gap-3 border-b border-line bg-sidebar/95 px-4 py-3 backdrop-blur md:hidden">
        <Link href="/" className="flex items-center gap-2">
          <span className="font-serif text-xl text-accent" aria-hidden>
            ✺
          </span>
          <span className="font-serif text-lg">Mini ATS</span>
        </Link>
        <nav className="flex items-center gap-1" aria-label="Main">
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
        </nav>
      </header>
    </>
  );
}
