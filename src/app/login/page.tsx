import type { Metadata } from "next";
import Link from "next/link";
import { redirect } from "next/navigation";
import { AuthForm } from "@/components/auth-form";
import { AuthShell } from "@/components/auth-shell";
import { safeNext } from "@/lib/auth";
import { getSession } from "@/lib/session";

export const metadata: Metadata = { title: "Sign in" };
export const dynamic = "force-dynamic";

export default async function LoginPage({ searchParams }: { searchParams: Promise<{ next?: string }> }) {
  const next = safeNext((await searchParams).next);
  if (await getSession().catch(() => null)) redirect(next);

  return (
    <AuthShell
      title="Welcome back"
      subtitle="Sign in to manage your hiring pipeline."
      footer={
        <>
          No account?{" "}
          <Link href="/signup" className="text-accent hover:underline">
            Create one
          </Link>
        </>
      }
    >
      <AuthForm mode="login" next={next} />
    </AuthShell>
  );
}
