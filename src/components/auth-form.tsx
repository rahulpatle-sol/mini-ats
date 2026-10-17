"use client";

import { Loader2 } from "lucide-react";
import { useActionState } from "react";
import { login, signup, type AuthState } from "@/actions/auth";

export function AuthForm({ mode, next }: { mode: "login" | "signup"; next: string }) {
  const action = mode === "login" ? login : signup;
  const [state, formAction, pending] = useActionState<AuthState, FormData>(action, {});

  return (
    <form action={formAction} className="space-y-4">
      <input type="hidden" name="next" value={next} />
      {state.error && (
        <p role="alert" className="rounded-xl bg-rose-500/10 px-4 py-3 text-sm text-rose-800 dark:text-rose-300">
          {state.error}
        </p>
      )}
      {mode === "signup" && (
        <div>
          <label htmlFor="name" className="label">Full name</label>
          <input id="name" name="name" required defaultValue={state.name ?? ""} placeholder="Aarav Sharma" className="field" autoComplete="name" />
        </div>
      )}
      <div>
        <label htmlFor="email" className="label">Email</label>
        <input id="email" name="email" type="email" required defaultValue={state.email ?? ""} placeholder="you@example.com" className="field" autoComplete="username" />
      </div>
      <div>
        <label htmlFor="password" className="label">Password</label>
        <input
          id="password"
          name="password"
          type="password"
          required
          minLength={mode === "signup" ? 8 : 1}
          className="field"
          autoComplete={mode === "signup" ? "new-password" : "current-password"}
          placeholder={mode === "signup" ? "At least 8 characters" : ""}
        />
      </div>
      <button type="submit" disabled={pending} className="btn-primary w-full">
        {pending && <Loader2 size={16} className="animate-spin" />}
        {pending ? "Please wait" : mode === "login" ? "Sign in" : "Create account"}
      </button>
    </form>
  );
}
