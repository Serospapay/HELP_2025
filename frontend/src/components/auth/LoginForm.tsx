"use client";

import { useState } from "react";
import { useSetAtom } from "jotai";
import { useRouter } from "next/navigation";
import { loginAtom } from "@/state/auth";
import { cn } from "@/lib/utils";

interface LoginFormState {
  error?: string;
  isSubmitting: boolean;
}

export function LoginForm() {
  const router = useRouter();
  const login = useSetAtom(loginAtom);
  const [state, setState] = useState<LoginFormState>({
    isSubmitting: false,
  });

  async function handleSubmit(event: React.FormEvent<HTMLFormElement>) {
    event.preventDefault();
    const form = event.currentTarget;
    const formData = new FormData(form);

    const email = String(formData.get("email") || "").trim();
    const password = String(formData.get("password") || "");

    if (!email || !password) {
      setState({
        isSubmitting: false,
        error: "Введіть email та пароль.",
      });
      return;
    }

    setState({ isSubmitting: true });
    try {
      await login({ email, password });
      router.push("/dashboard");
      router.refresh();
    } catch (error) {
      setState({
        isSubmitting: false,
        error:
          error instanceof Error
            ? error.message
            : "Не вдалося увійти. Перевірте дані та спробуйте ще раз.",
      });
    }
  }

  return (
    <form
      onSubmit={handleSubmit}
      className="space-y-6"
      noValidate
      aria-describedby={state.error ? "login-error" : undefined}
    >
      <div className="space-y-4">
        <label className="block text-sm font-medium text-slate-200">
          Email
          <input
            name="email"
            type="email"
            autoComplete="email"
            required
            placeholder="name@example.com"
            className="mt-2 w-full rounded-2xl border border-white/10 bg-slate-950 px-4 py-3 text-sm text-slate-100 shadow-inner shadow-black/20 focus:border-brand-400 focus:outline-none focus:ring-2 focus:ring-brand-400/60"
          />
        </label>
        <label className="block text-sm font-medium text-slate-200">
          Пароль
          <input
            name="password"
            type="password"
            autoComplete="current-password"
            required
            placeholder="********"
            className="mt-2 w-full rounded-2xl border border-white/10 bg-slate-950 px-4 py-3 text-sm text-slate-100 shadow-inner shadow-black/20 focus:border-brand-400 focus:outline-none focus:ring-2 focus:ring-brand-400/60"
          />
        </label>
      </div>

      {state.error && (
        <div
          id="login-error"
          className="rounded-2xl border border-rose-400/40 bg-rose-500/10 px-4 py-3 text-sm text-rose-100"
          role="alert"
        >
          {state.error}
        </div>
      )}

      <button
        type="submit"
        disabled={state.isSubmitting}
        className={cn(
          "inline-flex w-full justify-center rounded-full bg-brand-500 px-6 py-3 text-sm font-semibold text-white transition hover:bg-brand-400 focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-brand-300 focus-visible:ring-offset-2 focus-visible:ring-offset-slate-950 md:w-auto",
          state.isSubmitting && "cursor-wait opacity-80",
        )}
      >
        {state.isSubmitting ? "Входимо..." : "Увійти"}
      </button>
    </form>
  );
}

