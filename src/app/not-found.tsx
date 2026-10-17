import Link from "next/link";

export default function NotFound() {
  return (
    <div className="py-24 text-center">
      <p className="font-serif text-5xl text-accent">✺</p>
      <h1 className="mt-4 font-serif text-3xl">We couldn't find that page</h1>
      <p className="mt-2 text-muted">The candidate may have been deleted, or the link is wrong.</p>
      <Link href="/candidates" className="btn-primary mt-6">
        Back to candidates
      </Link>
    </div>
  );
}
