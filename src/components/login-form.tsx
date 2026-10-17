"use client";

import { Loader2 } from "lucide-react";
import { useActionState } from "react";
import { login, type LoginState } from "@/actions/auth";

export function LoginForm({ next }: { next: string }) {
  const [state, action, pending] = useActionState<LoginState, FormData>(login, {});
  return (
    <form action={action} className="space-y-4">
      <input type="hidden" name="next" value={next} />
      {state.error && (
        <p role="alert" className="rounded-xl bg-rose-500/10 px-4 py-3 text-sm text-rose-800 dark:text-rose-300">
          {state.error}
        </p>
      )}
      <div>
        <label htmlFor="email" className="label">Email</label>
        <input id="email" name="email" type="email" autoComplete="username" required defaultValue={state.email ?? ""} className="field" />
      </div>
      <div>
        <label htmlFor="password" className="label">Password</label>
        <input id="password" name="password" type="password" autoComplete="current-password" required className="field" />
      </div>
      <button type="submit" disabled={pending} className="btn-primary w-full">
        {pending && <Loader2 size={16} className="animate-spin" />}
        {pending ? "Signing in" : "Sign in"}
      </button>
    </form>
  );
}
