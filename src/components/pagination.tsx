import { ChevronLeft, ChevronRight } from "lucide-react";
import Link from "next/link";
import { PAGE_SIZE } from "@/lib/constants";
import { cn } from "@/lib/utils";

export function Pagination({
  page,
  pageCount,
  total,
  params,
}: {
  page: number;
  pageCount: number;
  total: number;
  params: Record<string, string | undefined>;
}) {
  const href = (p: number) => {
    const sp = new URLSearchParams();
    for (const [k, v] of Object.entries(params)) if (v) sp.set(k, v);
    if (p > 1) sp.set("page", String(p));
    const qs = sp.toString();
    return qs ? `/candidates?${qs}` : "/candidates";
  };
  const from = (page - 1) * PAGE_SIZE + 1;
  const to = Math.min(page * PAGE_SIZE, total);
  const btn = "inline-flex size-9 items-center justify-center rounded-xl border border-line bg-surface";

  return (
    <nav className="mt-5 flex items-center justify-between" aria-label="Pagination">
      <p className="text-sm text-muted">
        Showing {from}–{to} of {total}
      </p>
      <div className="flex items-center gap-2">
        <span className="mr-1 text-sm text-muted">
          Page {page} of {pageCount}
        </span>
        {page > 1 ? (
          <Link href={href(page - 1)} className={btn} aria-label="Previous page">
            <ChevronLeft size={16} />
          </Link>
        ) : (
          <span className={cn(btn, "opacity-40")} aria-hidden>
            <ChevronLeft size={16} />
          </span>
        )}
        {page < pageCount ? (
          <Link href={href(page + 1)} className={btn} aria-label="Next page">
            <ChevronRight size={16} />
          </Link>
        ) : (
          <span className={cn(btn, "opacity-40")} aria-hidden>
            <ChevronRight size={16} />
          </span>
        )}
      </div>
    </nav>
  );
}
