"use client";

import { useEffect } from "react";
import { useAtomValue } from "jotai";
import { useRouter } from "next/navigation";
import {
  authStatusAtom,
  currentUserAtom,
  logoutAtom,
  tokensAtom,
} from "@/lib/auth";
import { useSetAtom } from "jotai";
import Link from "next/link";
import { StatusBadge } from "@/components/common/StatusBadge";
import { VolunteerApplicationsList } from "@/components/dashboard/VolunteerApplicationsList";
import { CoordinatorApplicationsPanel } from "@/components/dashboard/CoordinatorApplicationsPanel";
import { VolunteerUpcomingShifts } from "@/components/dashboard/VolunteerUpcomingShifts";
import { BeneficiaryHelpSection } from "@/components/dashboard/BeneficiaryHelpSection";
import { useIsAdmin, useSafeRole } from "@/hooks/useRoles";
import type { UserRole } from "@/constants/roles";

const ROLE_GREETINGS: Record<UserRole, string> = {
  volunteer:
    "Керуйте заявками, змінами та долучайтеся до волонтерських ініціатив.",
  coordinator:
    "Керуйте кампаніями, підтверджуйте заявки волонтерів та плануйте зміни.",
  beneficiary:
    "Перегляньте кампанії з допомогою та зв'яжіться з координаторами.",
  admin:
    "Повний доступ до кампаній, заявок та адміністрування платформи.",
};

export default function DashboardPage() {
  const router = useRouter();
  const authStatus = useAtomValue(authStatusAtom);
  const user = useAtomValue(currentUserAtom);
  const logout = useSetAtom(logoutAtom);
  const tokens = useAtomValue(tokensAtom);

  useEffect(() => {
    if (authStatus === "guest" && !tokens?.access) {
      router.replace("/auth/login?from=/dashboard");
    }
  }, [authStatus, tokens, router]);

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

  const role = useSafeRole();
  const isAdmin = useIsAdmin();
  const isCoordinator = role === "coordinator" || isAdmin;
  const isVolunteerOrCoordinator = role === "volunteer" || isCoordinator;
  const isBeneficiary = role === "beneficiary";
  const showVolunteerShifts = isVolunteerOrCoordinator;
  const showVolunteerApplications = isVolunteerOrCoordinator || isBeneficiary;
  const showVolunteerShiftsForBeneficiary = isBeneficiary;

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
          <StatusBadge status={role} />
        </div>
        <p className="text-sm text-slate-300 md:text-base">
          {ROLE_GREETINGS[role]}
        </p>
      </header>

      <section className="grid gap-6 md:grid-cols-3">
        {isAdmin && (
          <article className="rounded-3xl border border-rose-500/20 bg-rose-500/5 p-6 shadow-lg shadow-black/20">
            <h2 className="text-lg font-semibold text-white">
              Адміністрування
            </h2>
            <p className="mt-2 text-sm text-slate-300">
              Повний доступ до кампаній, користувачів та налаштувань платформи.
            </p>
            <a
              href={`${(process.env.NEXT_PUBLIC_API_URL ?? "http://localhost:8000/api").replace(/\/api\/?$/, "")}/admin/`}
              target="_blank"
              rel="noopener noreferrer"
              className="mt-5 inline-flex items-center text-sm font-semibold text-rose-200 transition hover:text-rose-100 focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-rose-400 focus-visible:ring-offset-2 focus-visible:ring-offset-slate-950"
            >
              Django Admin →
            </a>
          </article>
        )}
        {isCoordinator && (
          <article className="rounded-3xl border border-white/10 bg-slate-900/60 p-6 shadow-lg shadow-black/20">
            <h2 className="text-lg font-semibold text-white">
              {isAdmin ? "Мої та інші кампанії" : "Кампанії координатора"}
            </h2>
            <p className="mt-2 text-sm text-slate-300">
              Переглядайте, редагуйте та публікуйте ініціативи. Плануйте етапи і зміни.
            </p>
            <div className="mt-5 flex flex-wrap gap-2">
              <Link
                href="/campaigns/new"
                className="inline-flex items-center rounded-full bg-brand-500 px-4 py-2 text-sm font-semibold text-white transition hover:bg-brand-400 focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-brand-400 focus-visible:ring-offset-2 focus-visible:ring-offset-slate-950"
              >
                Створити кампанію
              </Link>
              <Link
                href={user?.id ? `/campaigns?coordinator=${user.id}` : "/campaigns"}
                className="inline-flex items-center text-sm font-semibold text-brand-200 transition hover:text-brand-100 focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-brand-400 focus-visible:ring-offset-2 focus-visible:ring-offset-slate-950"
              >
                Мої кампанії →
              </Link>
            </div>
          </article>
        )}

        {isVolunteerOrCoordinator && (
          <article className="rounded-3xl border border-white/10 bg-slate-900/60 p-6 shadow-lg shadow-black/20">
            <h2 className="text-lg font-semibold text-white">
              Мої заявки волонтера
            </h2>
            <p className="mt-2 text-sm text-slate-300">
              Стежте за статусами заявок, долучайтесь до змін.
            </p>
            <Link
              href="/campaigns"
              className="mt-5 inline-flex items-center text-sm font-semibold text-brand-200 transition hover:text-brand-100 focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-brand-400 focus-visible:ring-offset-2 focus-visible:ring-offset-slate-950"
            >
              Знайти кампанію →
            </Link>
          </article>
        )}

        {isBeneficiary && (
          <article className="rounded-3xl border border-white/10 bg-slate-900/60 p-6 shadow-lg shadow-black/20">
            <h2 className="text-lg font-semibold text-white">
              Кампанії з допомогою
            </h2>
            <p className="mt-2 text-sm text-slate-300">
              Перегляньте кампанії, що надають гуманітарну та матеріальну допомогу.
            </p>
            <Link
              href="/campaigns?has_funding=true"
              className="mt-5 inline-flex items-center text-sm font-semibold text-brand-200 transition hover:text-brand-100 focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-brand-400 focus-visible:ring-offset-2 focus-visible:ring-offset-slate-950"
            >
              Кампанії з фінансовою підтримкою →
            </Link>
          </article>
        )}

        <article className="rounded-3xl border border-white/10 bg-slate-900/60 p-6 shadow-lg shadow-black/20">
          <h2 className="text-lg font-semibold text-white">
            Підтримка та налаштування
          </h2>
          <p className="mt-2 text-sm text-slate-300">
            Профіль, зміна пароля, служба підтримки.
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

      {isBeneficiary && <BeneficiaryHelpSection />}
      {(showVolunteerShifts || showVolunteerShiftsForBeneficiary) && (
        <VolunteerUpcomingShifts />
      )}
      {showVolunteerApplications && (
        <VolunteerApplicationsList
          titleOverride={
            isBeneficiary ? "Мої запити на участь" : undefined
          }
        />
      )}
      {isCoordinator && <CoordinatorApplicationsPanel />}
    </div>
  );
}
