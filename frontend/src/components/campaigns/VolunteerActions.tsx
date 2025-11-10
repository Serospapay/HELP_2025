"use client";

import { useEffect, useState } from "react";
import Link from "next/link";
import { useAtomValue } from "jotai";
import { authStatusAtom, currentUserAtom, tokensAtom } from "@/lib/auth";
import {
  applyForCampaign,
  getVolunteerApplications,
  updateVolunteerApplicationStatus,
} from "@/lib/endpoints";
import type { VolunteerApplication } from "@/types";
import { StatusBadge } from "@/components/common/StatusBadge";
import { cn } from "@/lib/utils";

interface VolunteerActionsProps {
  campaignId: number;
  campaignSlug: string;
  coordinatorId?: number | null;
}

type FetchState = "idle" | "loading" | "success" | "error";

export function VolunteerActions({
  campaignId,
  campaignSlug,
  coordinatorId,
}: VolunteerActionsProps) {
  const authStatus = useAtomValue(authStatusAtom);
  const user = useAtomValue(currentUserAtom);
  const tokens = useAtomValue(tokensAtom);
  const [applications, setApplications] = useState<VolunteerApplication[] | null>(
    null,
  );
  const [fetchState, setFetchState] = useState<FetchState>("idle");
  const [error, setError] = useState<string | null>(null);
  const [motivation, setMotivation] = useState("");
  const [isSubmitting, setIsSubmitting] = useState(false);
  const [isWithdrawing, setIsWithdrawing] = useState(false);

  const currentApplication = applications?.[0];
  const isCampaignCoordinator =
    user?.id && coordinatorId ? user.id === coordinatorId : false;
  const isAdmin = user?.role === "admin";
  const hasAccessToken = Boolean(tokens?.access);
  const effectiveAuthStatus =
    authStatus === "guest" && hasAccessToken ? "authenticated" : authStatus;

  useEffect(() => {
    if (!hasAccessToken || isCampaignCoordinator) {
      setApplications(null);
      setFetchState("idle");
      return;
    }

    let isMounted = true;
    setFetchState("loading");
    getVolunteerApplications(tokens, { campaign: String(campaignSlug) })
      .then((data) => {
        if (!isMounted) return;
        setApplications(data);
        setFetchState("success");
      })
      .catch((err) => {
        if (!isMounted) return;
        console.error(err);
        setError(
          err instanceof Error
            ? err.message
            : "Не вдалося завантажити статус заявки.",
        );
        setFetchState("error");
      });

    return () => {
      isMounted = false;
    };
  }, [authStatus, tokens, campaignSlug, isCampaignCoordinator, hasAccessToken]);

  async function handleSubmit(event: React.FormEvent<HTMLFormElement>) {
    event.preventDefault();
    if (!tokens?.access) return;
    setIsSubmitting(true);
    setError(null);
    try {
      const application = await applyForCampaign(
        campaignSlug,
        tokens,
        motivation ? { motivation } : {},
      );
      setApplications([application]);
    } catch (err) {
      setError(
        err instanceof Error
          ? err.message
          : "Не вдалося подати заявку. Спробуйте знову.",
      );
    } finally {
      setIsSubmitting(false);
    }
  }

  async function handleWithdraw() {
    if (!currentApplication || !tokens?.access) return;
    setIsWithdrawing(true);
    setError(null);
    try {
      const updated = await updateVolunteerApplicationStatus(
        currentApplication.id,
        "withdrawn",
        tokens,
      );
      setApplications([updated]);
    } catch (err) {
      setError(
        err instanceof Error
          ? err.message
          : "Не вдалося скасувати заявку. Спробуйте знову.",
      );
    } finally {
      setIsWithdrawing(false);
    }
  }

  if (!hasAccessToken) {
    return (
      <div className="space-y-4 rounded-3xl border border-white/10 bg-slate-900/60 p-6 text-sm text-slate-300">
        <p>
          Щоб подати заявку,{" "}
          <Link
            href={`/auth/login?from=/campaigns/${campaignSlug}`}
            className="font-semibold text-brand-200 underline-offset-4 transition hover:text-brand-100 hover:underline focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-brand-300 focus-visible:ring-offset-2 focus-visible:ring-offset-slate-950"
          >
            увійдіть у свій акаунт
          </Link>{" "}
          або{" "}
          <Link
            href={`/auth/register?from=/campaigns/${campaignSlug}`}
            className="font-semibold text-brand-200 underline-offset-4 transition hover:text-brand-100 hover:underline focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-brand-300 focus-visible:ring-offset-2 focus-visible:ring-offset-slate-950"
          >
            зареєструйтесь
          </Link>
          .
        </p>
        <button
          type="button"
          disabled
          className="inline-flex w-full justify-center rounded-full bg-slate-800/70 px-6 py-3 text-sm font-semibold text-slate-400 opacity-80 md:w-auto"
        >
          Подати заявку волонтера
        </button>
      </div>
    );
  }

  if (effectiveAuthStatus === "idle" || effectiveAuthStatus === "loading") {
    return (
      <div
        className="space-y-4 rounded-3xl border border-white/10 bg-slate-900/60 p-6 text-sm text-slate-300"
        aria-busy="true"
      >
        <p>Підтверджуємо ваш статус волонтера…</p>
        <button
          type="button"
          disabled
          className="inline-flex w-full justify-center rounded-full bg-slate-800/70 px-6 py-3 text-sm font-semibold text-slate-400 opacity-80 md:w-auto"
        >
          Подати заявку волонтера
        </button>
      </div>
    );
  }

  if (effectiveAuthStatus !== "authenticated") {
    return (
      <div
        className="space-y-4 rounded-3xl border border-white/10 bg-slate-900/60 p-6 text-sm text-slate-300"
        aria-busy="true"
      >
        <p>Синхронізуємо дані профілю…</p>
        <button
          type="button"
          disabled
          className="inline-flex w-full justify-center rounded-full bg-slate-800/70 px-6 py-3 text-sm font-semibold text-slate-400 opacity-80 md:w-auto"
        >
          Подати заявку волонтера
        </button>
      </div>
    );
  }

  if (isCampaignCoordinator || isAdmin) {
    return (
      <div className="rounded-3xl border border-white/10 bg-slate-900/60 p-6 text-sm text-slate-300">
        Ви є координатором цієї кампанії. Керуйте заявками та змінами у власному
        кабінеті.
      </div>
    );
  }

  if (fetchState === "loading") {
    return (
      <div
        className="space-y-4 rounded-3xl border border-white/10 bg-slate-900/60 p-6 text-sm text-slate-300"
        aria-busy="true"
      >
        <p>Завантажуємо вашу заявку...</p>
        <button
          type="button"
          disabled
          className="inline-flex w-full justify-center rounded-full bg-slate-800/70 px-6 py-3 text-sm font-semibold text-slate-400 opacity-80 md:w-auto"
        >
          Подати заявку волонтера
        </button>
      </div>
    );
  }

  if (currentApplication) {
    return (
      <div className="space-y-4 rounded-3xl border border-white/10 bg-slate-900/60 p-6 shadow-lg shadow-black/20">
        <div className="flex items-center gap-3">
          <StatusBadge
            status={currentApplication.status}
            data-testid="volunteer-application-status"
            data-status={currentApplication.status}
          />
          <span className="text-sm text-slate-200">
            Подано {new Date(currentApplication.created_at).toLocaleDateString("uk-UA")}
          </span>
        </div>
        {currentApplication.motivation && (
          <div>
            <p className="text-xs uppercase tracking-wide text-slate-400">
              Ваш коментар
            </p>
            <p className="mt-1 text-sm text-slate-200">
              {currentApplication.motivation}
            </p>
          </div>
        )}
        <p className="text-xs text-slate-400">
          Координатор зв&apos;яжеться з вами електронною поштою:{" "}
          <span className="text-slate-200">{user?.email}</span>
        </p>
        {currentApplication.status !== "withdrawn" ? (
          <button
            type="button"
            disabled={isWithdrawing}
            onClick={handleWithdraw}
            className={cn(
              "inline-flex items-center rounded-full border border-rose-400/40 px-4 py-2 text-xs font-semibold text-rose-100 transition hover:bg-rose-500/10 focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-rose-400 focus-visible:ring-offset-2 focus-visible:ring-offset-slate-950",
              isWithdrawing && "cursor-wait opacity-80",
            )}
          >
            Скасувати заявку
          </button>
        ) : null}
      </div>
    );
  }

  return (
    <form
      onSubmit={handleSubmit}
      className="space-y-4 rounded-3xl border border-white/10 bg-slate-900/60 p-6 shadow-lg shadow-black/20"
    >
      <div>
        <label className="block text-sm font-semibold text-white">
          Чому хочете долучитись? (опційно)
          <textarea
            name="motivation"
            value={motivation}
            onChange={(event) => setMotivation(event.target.value)}
            rows={3}
            placeholder="Коротко розкажіть про свій досвід або чому вас зацікавила ця кампанія."
            className="mt-2 w-full rounded-2xl border border-white/10 bg-slate-950 px-4 py-3 text-sm text-slate-100 focus:border-brand-400 focus:outline-none focus:ring-2 focus:ring-brand-400/60"
          />
        </label>
      </div>

      {error && (
        <div
          role="alert"
          className="rounded-2xl border border-rose-400/40 bg-rose-500/10 px-4 py-3 text-sm text-rose-100"
        >
          {error}
        </div>
      )}

      <button
        type="submit"
        disabled={isSubmitting}
        className={cn(
          "inline-flex w-full justify-center rounded-full bg-brand-500 px-6 py-3 text-sm font-semibold text-white transition hover:bg-brand-400 focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-brand-300 focus-visible:ring-offset-2 focus-visible:ring-offset-slate-950 md:w-auto",
          isSubmitting && "cursor-wait opacity-80",
        )}
      >
        {isSubmitting ? "Відправляємо..." : "Подати заявку волонтера"}
      </button>
    </form>
  );
}

