import type { Metadata } from "next";
import Link from "next/link";
import { redirect } from "next/navigation";
import { AuthForm } from "@/components/auth-form";
import { safeNext } from "@/lib/auth";
import { getSession } from "@/lib/session";

export const metadata: Metadata = { title: "Sign in" };
export const dynamic = "force-dynamic";

export default async function LoginPage({ searchParams }: { searchParams: Promise<{ next?: string }> }) {
  const next = safeNext((await searchParams).next);
  if (await getSession().catch(() => null)) redirect(next);

  return (
    <div className="grid min-h-dvh place-items-center px-5 py-12">
      <div className="w-full max-w-sm">
        <div className="mb-8 text-center">
          <Link href="/" className="font-serif text-4xl text-accent">✺</Link>
          <h1 className="mt-3 font-serif text-3xl tracking-tight">Welcome back</h1>
          <p className="mt-2 text-sm text-muted">Sign in to manage your hiring pipeline.</p>
        </div>
        <div className="card p-6">
          <AuthForm mode="login" next={next} />
        </div>
        <p className="mt-4 text-center text-sm text-muted">
          No account?{" "}
          <Link href="/signup" className="text-accent hover:underline">Create one</Link>
        </p>
      </div>
    </div>
  );
}
