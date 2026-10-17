"use server";

import { redirect } from "next/navigation";
import { credentialsMatch, safeNext } from "@/lib/auth";
import { createSession, destroySession } from "@/lib/session";

export type LoginState = { error?: string; email?: string };

export async function login(_prev: LoginState, fd: FormData): Promise<LoginState> {
  const email = String(fd.get("email") ?? "");
  const password = String(fd.get("password") ?? "");
  const next = safeNext(fd.get("next"));

  if (!credentialsMatch(email, password)) {
    return { error: "Invalid email or password.", email };
  }

  await createSession(email);
  redirect(next);
}

export async function logout() {
  await destroySession();
  redirect("/login");
}
