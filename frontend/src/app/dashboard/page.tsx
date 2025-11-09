"use client";

import { useEffect } from "react";
import { useAtomValue } from "jotai";
import { useRouter } from "next/navigation";
import {
  authStatusAtom,
  currentUserAtom,
  logoutAtom,
} from "@/lib/auth";
import { useSetAtom } from "jotai";
import Link from "next/link";
import { StatusBadge } from "@/components/common/StatusBadge";
import { VolunteerApplicationsList } from "@/components/dashboard/VolunteerApplicationsList";
import { CoordinatorApplicationsPanel } from "@/components/dashboard/CoordinatorApplicationsPanel";
import { VolunteerUpcomingShifts } from "@/components/dashboard/VolunteerUpcomingShifts";

export default function DashboardPage() {
  const router = useRouter();
  const authStatus = useAtomValue(authStatusAtom);
  const user = useAtomValue(currentUserAtom);
  const logout = useSetAtom(logoutAtom);

  useEffect(() => {
    if (authStatus === "guest") {
      router.replace("/auth/login?from=/dashboard");
    }
  }, [authStatus, router]);

  if (authStatus === "idle" || authStatus === "loading") {
    return (
      <div className="container flex min-h-[60vh] items-center justify-center">
        <div className="flex items-center gap-3 text-sm text-slate-300">
          <span className="size-3 animate-pulse rounded-full bg-brand-400" />
          Завантажуємо дані...
        </div>
      </div>
    );
  }

  if (!user) {
    return null;
  }

  return (
    <div className="container space-y-10 pb-16 pt-12">
      <header className="space-y-3">
        <p className="text-xs uppercase tracking-wide text-slate-400">
          Особистий кабінет
        </p>
        <div className="flex flex-wrap items-center gap-3">
          <h1 className="text-3xl font-semibold text-white md:text-4xl">
            Привіт, {user.first_name || user.email}!
          </h1>
          <StatusBadge status={user.role as any} />
        </div>
        <p className="text-sm text-slate-300 md:text-base">
          Керуйте своїми заявками, змінами та кампаніями. У розробці — більше
          аналітики, сповіщень і персональних рекомендацій.
        </p>
      </header>

      <section className="grid gap-6 md:grid-cols-3">
        <article className="rounded-3xl border border-white/10 bg-slate-900/60 p-6 shadow-lg shadow-black/20">
          <h2 className="text-lg font-semibold text-white">
            Кампанії координатора
          </h2>
          <p className="mt-2 text-sm text-slate-300">
            Переглянути, редагувати та публікувати нові ініціативи.
          </p>
          <Link
            href="/campaigns"
            className="mt-5 inline-flex items-center text-sm font-semibold text-brand-200 transition hover:text-brand-100 focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-brand-400 focus-visible:ring-offset-2 focus-visible:ring-offset-slate-950"
          >
            Перейти до кампаній →
          </Link>
        </article>

        <article className="rounded-3xl border border-white/10 bg-slate-900/60 p-6 shadow-lg shadow-black/20">
          <h2 className="text-lg font-semibold text-white">
            Мої заявки волонтера
          </h2>
          <p className="mt-2 text-sm text-slate-300">
            Стежте за статусами, змінюйте доступність та оновлюйте контакти.
          </p>
          <Link
            href="/campaigns"
            className="mt-5 inline-flex items-center text-sm font-semibold text-brand-200 transition hover:text-brand-100 focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-brand-400 focus-visible:ring-offset-2 focus-visible:ring-offset-slate-950"
          >
            Знайти кампанію →
          </Link>
        </article>

        <article className="rounded-3xl border border-white/10 bg-slate-900/60 p-6 shadow-lg shadow-black/20">
          <h2 className="text-lg font-semibold text-white">
            Підтримка та налаштування
          </h2>
          <p className="mt-2 text-sm text-slate-300">
            Оновіть профіль, змініть пароль або зверніться до служби підтримки.
          </p>
          <div className="mt-5 flex flex-wrap gap-2">
            <Link
              href="/support"
              className="inline-flex items-center rounded-full border border-white/20 px-4 py-2 text-sm font-semibold text-slate-100 transition hover:bg-white/10 focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-brand-400 focus-visible:ring-offset-2 focus-visible:ring-offset-slate-950"
            >
              Центр підтримки
            </Link>
            <button
              type="button"
              onClick={() => logout()}
              className="inline-flex items-center rounded-full border border-rose-400/40 px-4 py-2 text-sm font-semibold text-rose-100 transition hover:bg-rose-500/10 focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-rose-400 focus-visible:ring-offset-2 focus-visible:ring-offset-slate-950"
            >
              Вийти
            </button>
          </div>
        </article>
      </section>

      {user.role === "volunteer" ? <VolunteerUpcomingShifts /> : null}
      <VolunteerApplicationsList />
      {user.role === "coordinator" || user.role === "admin" ? (
        <CoordinatorApplicationsPanel />
      ) : null}
    </div>
  );
}

