"use client";

import { Eye, EyeOff, Loader2 } from "lucide-react";
import { useActionState, useState } from "react";
import { login, signup, type AuthState } from "@/actions/auth";

export function AuthForm({ mode, next }: { mode: "login" | "signup"; next: string }) {
  const action = mode === "login" ? login : signup;
  const [state, formAction, pending] = useActionState<AuthState, FormData>(action, {});
  const [showPassword, setShowPassword] = useState(false);

  return (
    <form action={formAction} className="space-y-5">
      <input type="hidden" name="next" value={next} />
      {state.error && (
        <p role="alert" className="auth-shake rounded-xl bg-rose-500/10 px-4 py-3 text-sm font-medium text-rose-800 dark:text-rose-300">
          {state.error}
        </p>
      )}
      {mode === "signup" && (
        <div>
          <label htmlFor="name" className="label">Full name</label>
          <input
            id="name"
            name="name"
            required
            defaultValue={state.name ?? ""}
            placeholder="Aarav Sharma"
            className="field !py-3 !text-base"
            autoComplete="name"
          />
        </div>
      )}
      <div>
        <label htmlFor="email" className="label">Email</label>
        <input
          id="email"
          name="email"
          type="email"
          required
          defaultValue={state.email ?? ""}
          placeholder="you@example.com"
          className="field !py-3 !text-base"
          autoComplete="username"
        />
      </div>
      <div>
        <label htmlFor="password" className="label">Password</label>
        <div className="relative">
          <input
            id="password"
            name="password"
            type={showPassword ? "text" : "password"}
            required
            minLength={mode === "signup" ? 8 : 1}
            className="field !py-3 !pr-12 !text-base"
            autoComplete={mode === "signup" ? "new-password" : "current-password"}
            placeholder={mode === "signup" ? "At least 8 characters" : "Enter your password"}
          />
          <button
            type="button"
            onClick={() => setShowPassword((v) => !v)}
            aria-label={showPassword ? "Hide password" : "Show password"}
            tabIndex={-1}
            className="absolute right-3 top-1/2 -translate-y-1/2 rounded-lg p-1.5 text-muted transition-colors hover:bg-sidebar hover:text-ink"
          >
            {showPassword ? <EyeOff size={18} /> : <Eye size={18} />}
          </button>
        </div>
      </div>
      <button type="submit" disabled={pending} className="btn-primary w-full !py-3 !text-base">
        {pending && <Loader2 size={18} className="animate-spin" />}
        {pending ? "Please wait…" : mode === "login" ? "Sign in" : "Create account"}
      </button>
    </form>
  );
}
