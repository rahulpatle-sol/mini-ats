"use client";

export default function Error({ error, reset }: { error: Error & { digest?: string }; reset: () => void }) {
  const noDb = error.message.includes("DATABASE_URL");
  return (
    <div className="mx-auto max-w-lg py-24 text-center">
      <h1 className="font-serif text-3xl">Something went wrong</h1>
      <p className="mt-3 text-muted">
        {noDb
          ? "The database isn't connected yet. Add your Neon connection string as DATABASE_URL in .env.local and restart the dev server."
          : "We couldn't load this page. Check your connection and try again."}
      </p>
      <button onClick={reset} className="btn-primary mt-6">
        Try again
      </button>
    </div>
  );
}
