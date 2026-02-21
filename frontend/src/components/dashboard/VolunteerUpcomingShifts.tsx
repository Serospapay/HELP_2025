"use client";

import { useEffect, useMemo, useState } from "react";
import Link from "next/link";
import { useAtomValue } from "jotai";
import { authStatusAtom, tokensAtom } from "@/lib/auth";
import {
  getMyUpcomingShiftAssignments,
  leaveCampaignShift,
} from "@/lib/api";
import type { ShiftAssignmentSummary } from "@/types";
import { formatDate, formatTimeRange, cn } from "@/lib/utils";
import { useToast } from "@/components/common/toast/ToastContext";
import { ConfirmDialog } from "@/components/common/confirm/ConfirmDialog";

type FetchState = "idle" | "loading" | "success" | "error";

export function VolunteerUpcomingShifts() {
  const authStatus = useAtomValue(authStatusAtom);
  const tokens = useAtomValue(tokensAtom);
  const { addToast } = useToast();

  const [assignments, setAssignments] = useState<ShiftAssignmentSummary[]>([]);
  const [fetchState, setFetchState] = useState<FetchState>("idle");
  const [error, setError] = useState<string | null>(null);
  const [leavingId, setLeavingId] = useState<number | null>(null);

  useEffect(() => {
    if (authStatus !== "authenticated" || !tokens?.access) return;
    let isMounted = true;

    setFetchState("loading");
    getMyUpcomingShiftAssignments(tokens)
      .then((data) => {
        if (!isMounted) return;
        setAssignments(data);
        setFetchState("success");
      })
      .catch((err) => {
        if (!isMounted) return;
        const message =
          err instanceof Error
            ? err.message
            : "Не вдалося отримати ваші найближчі зміни.";
        setError(message);
        setFetchState("error");
        addToast({
          variant: "error",
          title: "Помилка завантаження",
          description: message,
        });
      });

    return () => {
      isMounted = false;
    };
  }, [authStatus, tokens, addToast]);

  const isLoading = fetchState === "loading" || fetchState === "idle";

  const items = useMemo(() => assignments.sort((a, b) => a.shift.start_at.localeCompare(b.shift.start_at)), [assignments]);

  if (authStatus !== "authenticated") {
    return null;
  }

  if (isLoading) {
    return (
      <section className="rounded-3xl border border-white/10 bg-slate-900/60 p-6 text-sm text-slate-300">
        Завантажуємо ваш розклад змін...
      </section>
    );
  }

  if (fetchState === "error") {
    return (
      <section className="rounded-3xl border border-rose-400/40 bg-rose-500/10 p-6 text-sm text-rose-100">
        {error ?? "Не вдалося отримати найближчі зміни."}
      </section>
    );
  }

  if (items.length === 0) {
    return (
      <section className="rounded-3xl border border-white/10 bg-slate-900/60 p-6 text-sm text-slate-300">
        Найближчих змін немає. Встигайте приєднатися до актуальних слотів у кампаніях.
      </section>
    );
  }

  return (
    <section className="space-y-4 rounded-3xl border border-white/10 bg-slate-900/60 p-6 shadow-lg shadow-black/20">
      <header className="space-y-1">
        <h2 className="text-lg font-semibold text-white">Мої найближчі зміни</h2>
        <p className="text-xs text-slate-400">
          Слідкуйте за розкладом та інструкціями координатора. Не забудьте попередити, якщо не зможете прийти.
        </p>
      </header>
      <div className="space-y-3">
        {items.map((assignment) => {
          const { shift, campaign } = assignment;
          return (
            <div
              key={assignment.id}
              className="flex flex-col gap-3 rounded-2xl border border-white/10 bg-slate-950/60 p-4 md:flex-row md:items-center md:justify-between"
            >
              <div className="space-y-1">
                <p className="text-sm font-semibold text-white">{shift.title}</p>
                <p className="text-xs text-slate-400">
                  {formatDate(shift.start_at)} • {formatTimeRange(shift.start_at, shift.end_at)} •{" "}
                  {campaign.location_name || shift.location_details || "Локація уточнюється"}
                </p>
                {shift.description ? (
                  <p className="text-xs text-slate-300">{shift.description}</p>
                ) : null}
                {shift.instructions ? (
                  <p className="text-xs text-slate-300">Інструкції: {shift.instructions}</p>
                ) : null}
              </div>
              <div className="flex flex-col items-start gap-2 md:items-end">
                <Link
                  href={`/campaigns/${campaign.slug}`}
                  className="text-xs font-semibold text-brand-200 transition hover:text-brand-100 focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-brand-400 focus-visible:ring-offset-2 focus-visible:ring-offset-slate-950"
                >
                  Перейти до кампанії →
                </Link>
                <ConfirmDialog
                  disabled={leavingId === assignment.id}
                  variant="danger"
                  title="Покинути зміну?"
                  description="Ви звільните своє місце. Координатор побачить статус як 'скасовано'."
                  confirmLabel="Так, покинути"
                  onConfirm={async () => {
                    if (!tokens?.access) return;
                    setLeavingId(assignment.id);
                    try {
                      await leaveCampaignShift(shift.id, tokens);
                      setAssignments((prev) => prev.filter((item) => item.id !== assignment.id));
                      addToast({
                        variant: "success",
                        title: "Ви покинули зміну",
                      });
                    } catch (err) {
                      const message =
                        err instanceof Error
                          ? err.message
                          : "Не вдалося покинути зміну. Спробуйте пізніше.";
                      addToast({
                        variant: "error",
                        title: "Помилка",
                        description: message,
                      });
                    } finally {
                      setLeavingId(null);
                    }
                  }}
                  trigger={
                    <button
                      type="button"
                      className={cn(
                        "inline-flex items-center rounded-full border border-rose-400/40 px-4 py-2 text-xs font-semibold text-rose-100 transition hover:bg-rose-500/10 focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-rose-400 focus-visible:ring-offset-2 focus-visible:ring-offset-slate-950",
                        leavingId === assignment.id && "cursor-wait opacity-80",
                      )}
                    >
                      Вийти зі зміни
                    </button>
                  }
                />
              </div>
            </div>
          );
        })}
      </div>
    </section>
  );
}

