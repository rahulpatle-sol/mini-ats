export default function Loading() {
  return (
    <div className="animate-pulse space-y-6" aria-busy="true" aria-label="Loading">
      <div className="h-10 w-64 rounded-xl bg-line/70" />
      <div className="grid grid-cols-2 gap-4 lg:grid-cols-4">
        {Array.from({ length: 4 }).map((_, i) => (
          <div key={i} className="h-28 rounded-2xl bg-line/50" />
        ))}
      </div>
      <div className="h-72 rounded-2xl bg-line/40" />
    </div>
  );
}
