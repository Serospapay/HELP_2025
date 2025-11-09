import Link from "next/link";
import type { Metadata } from "next";
import { LoginForm } from "@/components/auth/LoginForm";

export const metadata: Metadata = {
  title: "Вхід",
  description:
    "Увійдіть до особистого кабінету волонтера, координатора чи отримувача допомоги.",
};

export default function LoginPage() {
  return (
    <div className="container my-16 max-w-3xl space-y-10">
      <header className="space-y-4 text-center">
        <h1 className="text-3xl font-semibold text-white md:text-4xl">
          Вітаємо знову!
        </h1>
        <p className="text-sm text-slate-300 md:text-base">
          Увійдіть, щоб керувати кампаніями, відстежувати заявки та отримувати
          оперативні оновлення.
        </p>
      </header>
      <div className="rounded-3xl border border-white/10 bg-slate-900/60 p-6 shadow-xl shadow-black/20">
        <LoginForm />
      </div>
      <p className="text-center text-sm text-slate-300">
        Ще немає облікового запису?{" "}
        <Link
          href="/auth/register"
          className="font-semibold text-brand-200 underline-offset-4 transition hover:text-brand-100 hover:underline focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-brand-300 focus-visible:ring-offset-2 focus-visible:ring-offset-slate-950"
        >
          Зареєструватися
        </Link>
      </p>
    </div>
  );
}

