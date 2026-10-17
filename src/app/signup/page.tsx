import type { Metadata } from "next";
import Link from "next/link";
import { redirect } from "next/navigation";
import { AuthForm } from "@/components/auth-form";
import { AuthShell } from "@/components/auth-shell";
import { getSession } from "@/lib/session";

export const metadata: Metadata = { title: "Create account" };
export const dynamic = "force-dynamic";

export default async function SignupPage() {
  if (await getSession().catch(() => null)) redirect("/dashboard");

  return (
    <AuthShell
      title="Create your account"
      subtitle="Start tracking candidates in minutes."
      footer={
        <>
          Already have an account?{" "}
          <Link href="/login" className="text-accent hover:underline">
            Sign in
          </Link>
        </>
      }
    >
      <AuthForm mode="signup" next="/dashboard" />
    </AuthShell>
  );
}
