import type { Metadata } from "next";
import Link from "next/link";
import { redirect } from "next/navigation";
import { AuthForm } from "@/components/auth-form";
import { getSession } from "@/lib/session";

export const metadata: Metadata = { title: "Create account" };
export const dynamic = "force-dynamic";

export default async function SignupPage() {
  if (await getSession().catch(() => null)) redirect("/dashboard");

  return (
    <div className="grid min-h-dvh place-items-center px-5 py-12">
      <div className="w-full max-w-sm">
        <div className="mb-8 text-center">
          <Link href="/" className="font-serif text-4xl text-accent">✺</Link>
          <h1 className="mt-3 font-serif text-3xl tracking-tight">Create your account</h1>
          <p className="mt-2 text-sm text-muted">Start tracking candidates in minutes.</p>
        </div>
        <div className="card p-6">
          <AuthForm mode="signup" next="/dashboard" />
        </div>
        <p className="mt-4 text-center text-sm text-muted">
          Already have an account?{" "}
          <Link href="/login" className="text-accent hover:underline">Sign in</Link>
        </p>
      </div>
    </div>
  );
}
