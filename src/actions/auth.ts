"use server";

import { eq } from "drizzle-orm";
import { redirect } from "next/navigation";
import { z } from "zod";
import { getDb } from "@/db";
import { users } from "@/db/schema";
import { safeNext, hashPassword, verifyPassword } from "@/lib/auth";
import { createSession, destroySession } from "@/lib/session";

export type AuthState = { error?: string; email?: string; name?: string };

const loginSchema = z.object({
  email: z.string().trim().toLowerCase().pipe(z.email("Enter a valid email")),
  password: z.string().min(1, "Password is required"),
});

const signupSchema = z.object({
  name: z.string().trim().min(2, "Enter your name").max(80),
  email: z.string().trim().toLowerCase().pipe(z.email("Enter a valid email")),
  password: z.string().min(8, "At least 8 characters").max(128),
});

export async function login(_prev: AuthState, fd: FormData): Promise<AuthState> {
  const raw = {
    email: String(fd.get("email") ?? ""),
    password: String(fd.get("password") ?? ""),
  };
  const parsed = loginSchema.safeParse(raw);
  if (!parsed.success) {
    const fe = z.flattenError(parsed.error).fieldErrors;
    return { error: fe.email?.[0] ?? fe.password?.[0] ?? "Check your inputs.", email: raw.email };
  }

  const next = safeNext(fd.get("next"));

  let user;
  try {
    [user] = await getDb().select().from(users).where(eq(users.email, parsed.data.email)).limit(1);
  } catch (e) {
    console.error("[login] DB error:", e);
    const cause = (e as { cause?: Error })?.cause;
    if (cause) console.error("[login] cause:", cause.message, (cause as { code?: string }).code);
    return {
      error: !process.env.DATABASE_URL
        ? "DATABASE_URL is not set. Add it to .env and restart the dev server."
        : "Could not reach the database. Check your connection and try again.",
      email: raw.email,
    };
  }

  // Fallback: first-run admin from env (so old setups still work)
  if (!user && parsed.data.email === process.env.ADMIN_EMAIL?.toLowerCase()) {
    if (verifyPassword(parsed.data.password, process.env.ADMIN_PASSWORD_HASH ?? "")) {
      await createSession("env-admin", parsed.data.email);
      redirect(next);
    }
  }

  if (!user || !verifyPassword(parsed.data.password, user.passwordHash)) {
    return { error: "Invalid email or password.", email: raw.email };
  }

  await createSession(user.id, user.email);
  redirect(next);
}

export async function signup(_prev: AuthState, fd: FormData): Promise<AuthState> {
  const raw = {
    name: String(fd.get("name") ?? ""),
    email: String(fd.get("email") ?? ""),
    password: String(fd.get("password") ?? ""),
  };
  const parsed = signupSchema.safeParse(raw);
  if (!parsed.success) {
    const fe = z.flattenError(parsed.error).fieldErrors;
    return { error: fe.name?.[0] ?? fe.email?.[0] ?? fe.password?.[0] ?? "Check your inputs.", email: raw.email, name: raw.name };
  }

  const db = getDb();
  let existing;
  try {
    existing = await db.select({ id: users.id }).from(users).where(eq(users.email, parsed.data.email)).limit(1);
  } catch (e) {
    console.error("[signup] DB error:", e);
    return { error: "Could not reach the database. Try again.", email: raw.email, name: raw.name };
  }
  if (existing.length) return { error: "An account with this email already exists.", email: raw.email, name: raw.name };

  const id = crypto.randomUUID();
  try {
    await db.insert(users).values({
      id,
      email: parsed.data.email,
      name: parsed.data.name,
      passwordHash: hashPassword(parsed.data.password),
    });
  } catch {
    return { error: "Could not create the account. Try again.", email: raw.email, name: raw.name };
  }

  await createSession(id, parsed.data.email);
  redirect("/dashboard");
}

export async function logout() {
  await destroySession();
  redirect("/login");
}
