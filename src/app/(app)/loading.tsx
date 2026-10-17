export default function Loading() {
  return (
    <div className="animate-pulse space-y-6" aria-busy="true" aria-label="Loading">
      <div className="flex items-center justify-between gap-4">
        <div className="space-y-2">
          <div className="h-8 w-52 rounded-xl bg-line/70" />
          <div className="h-4 w-72 max-w-full rounded-lg bg-line/50" />
        </div>
        <div className="h-10 w-32 rounded-xl bg-line/60" />
      </div>
      <div className="grid grid-cols-2 gap-4 lg:grid-cols-4">
        {Array.from({ length: 4 }).map((_, i) => (
          <div key={i} className="h-28 rounded-2xl bg-line/45" />
        ))}
      </div>
      <div className="grid gap-6 lg:grid-cols-5">
        <div className="h-72 rounded-2xl bg-line/40 lg:col-span-3" />
        <div className="h-72 rounded-2xl bg-line/35 lg:col-span-2" />
      </div>
      <div className="flex items-center gap-3 pt-2 text-sm text-muted">
        <span className="inline-block size-4 animate-spin rounded-full border-2 border-accent border-t-transparent" aria-hidden />
        Loading your pipeline…
      </div>
    </div>
  );
}
