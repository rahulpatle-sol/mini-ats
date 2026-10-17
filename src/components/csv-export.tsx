"use client";

import { Download, FileSpreadsheet, Loader2, X } from "lucide-react";
import { useCallback, useEffect, useState } from "react";

type PreviewRow = string[];
type Preview = {
  columns: string[];
  rows: PreviewRow[];
  total: number;
  page: number;
  pageCount: number;
};

const PAGE_SIZE = 8;

export function CsvExport({ params }: { params: URLSearchParams }) {
  const [open, setOpen] = useState(false);
  const [loading, setLoading] = useState(false);
  const [error, setError] = useState<string | null>(null);
  const [preview, setPreview] = useState<Preview | null>(null);
  const [page, setPage] = useState(1);

  const qs = params.toString();

  const load = useCallback(
    async (p: number) => {
      setLoading(true);
      setError(null);
      try {
        const sp = new URLSearchParams(qs);
        sp.set("preview", "1");
        sp.set("page", String(p));
        sp.set("pageSize", String(PAGE_SIZE));
        const res = await fetch(`/api/candidates/export?${sp}`);
        if (!res.ok) throw new Error(`HTTP ${res.status}`);
        const data: Preview = await res.json();
        setPreview(data);
        setPage(p);
      } catch {
        setError("Could not load preview. Try again.");
      } finally {
        setLoading(false);
      }
    },
    [qs],
  );

  useEffect(() => {
    if (open && !preview) void load(1);
  }, [open, preview, load]);

  const downloadHref = qs ? `/api/candidates/export?${qs}` : "/api/candidates/export";

  return (
    <>
      <button type="button" onClick={() => setOpen(true)} className="btn-ghost">
        <FileSpreadsheet size={15} /> Export CSV
      </button>

      {open && (
        <div className="fixed inset-0 z-50 grid place-items-center bg-ink/40 p-4 backdrop-blur-sm" role="dialog" aria-modal="true" aria-label="CSV export preview">
          <div className="card w-full max-w-3xl overflow-hidden shadow-2xl">
            <div className="flex items-center justify-between border-b border-line px-5 py-4">
              <div>
                <h2 className="font-serif text-lg">CSV preview</h2>
                <p className="text-xs text-muted">
                  {preview ? `${preview.total} row${preview.total === 1 ? "" : "s"} will be exported` : "Loading…"}
                </p>
              </div>
              <button type="button" onClick={() => setOpen(false)} aria-label="Close preview" className="rounded-lg p-2 text-muted hover:bg-sidebar hover:text-ink">
                <X size={18} />
              </button>
            </div>

            <div className="max-h-[55vh] overflow-auto">
              {error ? (
                <p className="px-5 py-10 text-center text-sm text-rose-700">{error}</p>
              ) : !preview ? (
                <div className="grid place-items-center py-16 text-muted">
                  <Loader2 size={22} className="animate-spin" />
                </div>
              ) : preview.rows.length === 0 ? (
                <p className="px-5 py-10 text-center text-sm text-muted">No candidates match the current filters.</p>
              ) : (
                <table className="w-full min-w-[720px] text-left text-xs">
                  <thead className="sticky top-0 border-b border-line bg-surface text-muted">
                    <tr>
                      {preview.columns.map((c) => (
                        <th key={c} className="whitespace-nowrap px-3 py-2.5 font-medium">
                          {c}
                        </th>
                      ))}
                    </tr>
                  </thead>
                  <tbody className="divide-y divide-line">
                    {preview.rows.map((row, i) => (
                      <tr key={i} className="hover:bg-canvas">
                        {row.map((cell, j) => (
                          <td key={j} className="max-w-[180px] truncate px-3 py-2" title={cell}>
                            {cell || "—"}
                          </td>
                        ))}
                      </tr>
                    ))}
                  </tbody>
                </table>
              )}
            </div>

            <div className="flex flex-wrap items-center justify-between gap-3 border-t border-line px-5 py-4">
              <div className="flex items-center gap-2 text-sm text-muted">
                {loading && <Loader2 size={14} className="animate-spin" />}
                <span>
                  Page {page} of {Math.max(1, preview?.pageCount ?? 1)}
                </span>
                <button
                  type="button"
                  disabled={loading || page <= 1}
                  onClick={() => void load(page - 1)}
                  className="btn-ghost px-2.5 py-1 text-xs disabled:opacity-40"
                >
                  Prev
                </button>
                <button
                  type="button"
                  disabled={loading || page >= (preview?.pageCount ?? 1)}
                  onClick={() => void load(page + 1)}
                  className="btn-ghost px-2.5 py-1 text-xs disabled:opacity-40"
                >
                  Next
                </button>
              </div>
              <a href={downloadHref} className="btn-primary" download>
                <Download size={15} /> Download full CSV
              </a>
            </div>
          </div>
        </div>
      )}
    </>
  );
}
