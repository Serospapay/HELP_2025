"use client";

import { useState } from "react";
import { useRouter } from "next/navigation";
import { useSetAtom } from "jotai";
import { registerAtom } from "@/state/auth";
import { cn } from "@/lib/utils";
import { UserRoleLabels } from "@/constants/roles";

interface RegisterFormState {
  error?: string;
  isSubmitting: boolean;
}

export function RegisterForm() {
  const router = useRouter();
  const register = useSetAtom(registerAtom);
  const [state, setState] = useState<RegisterFormState>({
    isSubmitting: false,
  });

  async function handleSubmit(event: React.FormEvent<HTMLFormElement>) {
    event.preventDefault();
    const form = event.currentTarget;
    const formData = new FormData(form);

    const email = String(formData.get("email") || "").trim();
    const password = String(formData.get("password") || "");
    const confirmPassword = String(formData.get("confirm_password") || "");
    const firstName = String(formData.get("first_name") || "").trim();
    const lastName = String(formData.get("last_name") || "").trim();
    const role = String(formData.get("role") || "volunteer");
    const phoneNumber = String(formData.get("phone_number") || "").trim();

    if (!email || !password) {
      setState({
        isSubmitting: false,
        error: "Введіть email та пароль.",
      });
      return;
    }
    if (password !== confirmPassword) {
      setState({
        isSubmitting: false,
        error: "Паролі не співпадають.",
      });
      return;
    }

    setState({ isSubmitting: true });
    try {
      await register({
        email,
        password,
        confirm_password: confirmPassword,
        first_name: firstName,
        last_name: lastName,
        role,
        phone_number: phoneNumber,
      });
      router.push("/dashboard");
      router.refresh();
    } catch (error) {
      setState({
        isSubmitting: false,
        error:
          error instanceof Error
            ? error.message
            : "Не вдалося створити акаунт. Спробуйте ще раз.",
      });
    }
  }

  return (
    <form
      onSubmit={handleSubmit}
      className="space-y-6"
      noValidate
      aria-describedby={state.error ? "register-error" : undefined}
    >
      <div className="grid gap-4 md:grid-cols-2">
        <label className="block text-sm font-medium text-slate-200">
          Email
          <input
            name="email"
            type="email"
            autoComplete="email"
            required
            placeholder="name@example.com"
            className="mt-2 w-full rounded-2xl border border-white/10 bg-slate-950 px-4 py-3 text-sm text-slate-100 focus:border-brand-400 focus:outline-none focus:ring-2 focus:ring-brand-400/60"
          />
        </label>
        <label className="block text-sm font-medium text-slate-200">
          Номер телефону
          <input
            name="phone_number"
            type="tel"
            placeholder="+380..."
            className="mt-2 w-full rounded-2xl border border-white/10 bg-slate-950 px-4 py-3 text-sm text-slate-100 focus:border-brand-400 focus:outline-none focus:ring-2 focus:ring-brand-400/60"
          />
        </label>
        <label className="block text-sm font-medium text-slate-200">
          Ім&apos;я
          <input
            name="first_name"
            type="text"
            placeholder="Олена"
            className="mt-2 w-full rounded-2xl border border-white/10 bg-slate-950 px-4 py-3 text-sm text-slate-100 focus:border-brand-400 focus:outline-none focus:ring-2 focus:ring-brand-400/60"
          />
        </label>
        <label className="block text-sm font-medium text-slate-200">
          Прізвище
          <input
            name="last_name"
            type="text"
            placeholder="Шевченко"
            className="mt-2 w-full rounded-2xl border border-white/10 bg-slate-950 px-4 py-3 text-sm text-slate-100 focus:border-brand-400 focus:outline-none focus:ring-2 focus:ring-brand-400/60"
          />
        </label>
        <label className="block text-sm font-medium text-slate-200">
          Пароль
          <input
            name="password"
            type="password"
            autoComplete="new-password"
            required
            placeholder="********"
            className="mt-2 w-full rounded-2xl border border-white/10 bg-slate-950 px-4 py-3 text-sm text-slate-100 focus:border-brand-400 focus:outline-none focus:ring-2 focus:ring-brand-400/60"
          />
        </label>
        <label className="block text-sm font-medium text-slate-200">
          Підтвердження пароля
          <input
            name="confirm_password"
            type="password"
            autoComplete="new-password"
            required
            placeholder="********"
            className="mt-2 w-full rounded-2xl border border-white/10 bg-slate-950 px-4 py-3 text-sm text-slate-100 focus:border-brand-400 focus:outline-none focus:ring-2 focus:ring-brand-400/60"
          />
        </label>
        <label className="block text-sm font-medium text-slate-200 md:col-span-2">
          Роль
          <select
            name="role"
            defaultValue="volunteer"
            className="mt-2 w-full rounded-2xl border border-white/10 bg-slate-950 px-4 py-3 text-sm text-slate-100 focus:border-brand-400 focus:outline-none focus:ring-2 focus:ring-brand-400/60"
          >
            {Object.entries(UserRoleLabels).map(([role, label]) => (
              <option key={role} value={role}>
                {label}
              </option>
            ))}
          </select>
        </label>
      </div>

      {state.error && (
        <div
          id="register-error"
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
        {state.isSubmitting ? "Реєструємо..." : "Створити акаунт"}
      </button>
    </form>
  );
}

