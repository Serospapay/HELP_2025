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
      {(process.env.NODE_ENV === "development" ||
        process.env.NEXT_PUBLIC_SHOW_DEMO_ACCOUNTS === "true") && (
      <section
        aria-labelledby="demo-accounts-heading"
        className="space-y-4 rounded-3xl border border-brand-400/30 bg-slate-900/50 p-6 shadow-lg shadow-brand-500/10"
      >
        <div className="flex flex-col gap-2 sm:flex-row sm:items-center sm:justify-between">
          <div>
            <h2
              id="demo-accounts-heading"
              className="text-lg font-semibold text-white md:text-xl"
            >
              Демо-акаунти для швидкої перевірки
            </h2>
            <p className="text-xs text-slate-300 md:text-sm">
              Використовуйте їх лише для презентацій. У продуктиві створіть власні
              облікові записи та змініть паролі.
            </p>
          </div>
          <span className="inline-flex items-center rounded-full border border-brand-400/40 bg-brand-500/10 px-3 py-1 text-xs font-semibold uppercase tracking-wide text-brand-200">
            Demo only
          </span>
        </div>
        <ul className="grid gap-3 text-sm text-slate-200 sm:grid-cols-2">
          <li className="rounded-2xl border border-white/10 bg-slate-950/60 p-4 shadow-sm shadow-black/30">
            <p className="text-xs uppercase tracking-wide text-brand-200">
              Адміністратор
            </p>
            <p className="mt-1 font-semibold text-white">admin@help.test</p>
            <p className="font-mono text-xs text-slate-300">Пароль: Admin123!</p>
          </li>
          <li className="rounded-2xl border border-white/10 bg-slate-950/60 p-4 shadow-sm shadow-black/30">
            <p className="text-xs uppercase tracking-wide text-brand-200">
              Координатор
            </p>
            <p className="mt-1 font-semibold text-white">
              coordinator@help.test
            </p>
            <p className="font-mono text-xs text-slate-300">
              Пароль: Coordinator123!
            </p>
          </li>
          <li className="rounded-2xl border border-white/10 bg-slate-950/60 p-4 shadow-sm shadow-black/30">
            <p className="text-xs uppercase tracking-wide text-brand-200">
              Волонтер (підтверджений)
            </p>
            <p className="mt-1 font-semibold text-white">
              volunteer1@help.test
            </p>
            <p className="font-mono text-xs text-slate-300">
              Пароль: Volunteer123!
            </p>
          </li>
          <li className="rounded-2xl border border-white/10 bg-slate-950/60 p-4 shadow-sm shadow-black/30">
            <p className="text-xs uppercase tracking-wide text-brand-200">
              Волонтер (очікує)
            </p>
            <p className="mt-1 font-semibold text-white">
              volunteer2@help.test
            </p>
            <p className="font-mono text-xs text-slate-300">
              Пароль: Volunteer123!
            </p>
          </li>
          <li className="rounded-2xl border border-white/10 bg-slate-950/60 p-4 shadow-sm shadow-black/30 sm:col-span-2">
            <p className="text-xs uppercase tracking-wide text-brand-200">
              Отримувач допомоги
            </p>
            <div className="mt-1 flex flex-col gap-1 sm:flex-row sm:items-baseline sm:justify-between">
              <p className="font-semibold text-white">
                beneficiary@help.test
              </p>
              <p className="font-mono text-xs text-slate-300">
                Пароль: Beneficiary123!
              </p>
            </div>
          </li>
        </ul>
      </section>
      )}
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

