"use client";

import { useAtomValue } from "jotai";
import { useMemo, useState } from "react";
import {
  authStatusAtom,
  currentUserAtom,
  tokensAtom,
} from "@/lib/auth";
import type { CampaignShift } from "@/types";
import {
  joinCampaignShift,
  leaveCampaignShift,
} from "@/lib/api";
import { cn, formatDate } from "@/lib/utils";
import { useToast } from "@/components/common/toast/ToastContext";

interface ShiftJoinerProps {
  campaignSlug: string;
  shifts: CampaignShift[];
}

export function ShiftJoiner({ campaignSlug, shifts }: ShiftJoinerProps) {
  const authStatus = useAtomValue(authStatusAtom);
  const currentUser = useAtomValue(currentUserAtom);
  const tokens = useAtomValue(tokensAtom);

  const [items, setItems] = useState(shifts);
  const [error, setError] = useState<string | null>(null);
  const [loadingShiftId, setLoadingShiftId] = useState<number | null>(null);
  const { addToast } = useToast();

  const hasAccessToken = Boolean(tokens?.access);
  const isAuthenticated =
    authStatus === "authenticated" || (authStatus === "guest" && hasAccessToken);

  const approvalsRequired = useMemo(() => {
    if (!currentUser) return true;
    return currentUser.role === "volunteer" || currentUser.role === "beneficiary";
  }, [currentUser]);

  async function handleJoin(shiftId: number) {
    if (!tokens?.access) return;
    setLoadingShiftId(shiftId);
    setError(null);
    try {
      const assignment = await joinCampaignShift(shiftId, tokens);
      setItems((prev) =>
        prev.map((shift) =>
          shift.id === shiftId
            ? {
                ...shift,
                is_user_enrolled: true,
                user_assignment_id: assignment?.id ?? shift.user_assignment_id ?? null,
                occupied_spots: shift.is_user_enrolled
                  ? shift.occupied_spots ?? 0
                  : (shift.occupied_spots ?? 0) + 1,
              }
            : shift,
        ),
      );
      addToast({
        variant: "success",
        title: "Ви приєдналися до зміни",
      });
    } catch (err) {
      setError(
        err instanceof Error
          ? err.message
          : "Не вдалося записатися на зміну. Спробуйте пізніше.",
      );
      addToast({
        variant: "error",
        title: "Помилка",
        description:
          err instanceof Error
            ? err.message
            : "Не вдалося записатися на зміну. Спробуйте пізніше.",
      });
    } finally {
      setLoadingShiftId(null);
    }
  }

  async function handleLeave(shiftId: number) {
    if (!tokens?.access) return;
    setLoadingShiftId(shiftId);
    setError(null);
    try {
      await leaveCampaignShift(shiftId, tokens);
      setItems((prev) =>
        prev.map((shift) =>
          shift.id === shiftId
            ? {
                ...shift,
                is_user_enrolled: false,
                user_assignment_id: null,
                occupied_spots: Math.max((shift.occupied_spots ?? 1) - 1, 0),
              }
            : shift,
        ),
      );
      addToast({
        variant: "success",
        title: "Зміну залишено",
      });
    } catch (err) {
      setError(
        err instanceof Error
          ? err.message
          : "Не вдалося покинути зміну. Спробуйте пізніше.",
      );
      addToast({
        variant: "error",
        title: "Помилка",
        description:
          err instanceof Error
            ? err.message
            : "Не вдалося покинути зміну. Спробуйте пізніше.",
      });
    } finally {
      setLoadingShiftId(null);
    }
  }

  if (!items || items.length === 0) {
    return null;
  }

  return (
    <section className="space-y-4 rounded-3xl border border-white/10 bg-slate-900/60 p-6 shadow-lg shadow-black/20">
      <header className="space-y-2">
        <h2 className="text-2xl font-semibold text-white">Зміни кампанії</h2>
        <p className="text-xs text-slate-400">
          Оберіть доступний слот. Статуси оновлюються в реальному часі.
        </p>
      </header>

      {error && (
        <div className="rounded-2xl border border-rose-400/40 bg-rose-500/10 px-4 py-3 text-sm text-rose-100">
          {error}
        </div>
      )}

      {!isAuthenticated ? (
        <div className="rounded-2xl border border-white/10 bg-slate-950/60 px-4 py-3 text-sm text-slate-300">
          Увійдіть у систему, щоб приєднуватися до змін.
        </div>
      ) : null}

      <div className="space-y-3">
        {items.map((shift) => {
          const spotsTaken = shift.occupied_spots ?? 0;
          const spotsTotal = shift.capacity;
          const isFull = spotsTotal > 0 && spotsTaken >= spotsTotal;
          const disabled =
            !isAuthenticated ||
            loadingShiftId === shift.id ||
            shift.status !== "open";
          const canJoin =
            !shift.is_user_enrolled && !isFull && shift.status === "open";

          return (
            <div
              key={shift.id}
              className="flex flex-col gap-3 rounded-2xl border border-white/10 bg-slate-950/60 p-4 md:flex-row md:items-center md:justify-between"
            >
              <div className="space-y-1">
                <p className="text-sm font-semibold text-white">
                  {shift.title}
                </p>
                <p className="text-xs text-slate-400">
                  {formatDate(shift.start_at)} – {formatDate(shift.end_at)} •{" "}
                  {shift.location_details || "Локація уточнюється"}
                </p>
                <p className="text-xs text-slate-500">
                  Заповненість: {spotsTaken}/{spotsTotal}
                </p>
                {shift.description && (
                  <p className="text-xs text-slate-300">{shift.description}</p>
                )}
                {shift.instructions && (
                  <p className="text-xs text-slate-300">
                    Інструкції: {shift.instructions}
                  </p>
                )}
              </div>
              <div className="flex flex-col items-start gap-2 md:items-end">
                {shift.is_user_enrolled ? (
                  <button
                    type="button"
                    disabled={disabled}
                    onClick={() => handleLeave(shift.id)}
                    className={cn(
                      "inline-flex items-center rounded-full border border-rose-400/40 px-4 py-2 text-xs font-semibold text-rose-100 transition hover:bg-rose-500/10 focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-rose-400 focus-visible:ring-offset-2 focus-visible:ring-offset-slate-950",
                      loadingShiftId === shift.id && "cursor-wait opacity-80",
                    )}
                  >
                    Вийти зі зміни
                  </button>
                ) : (
                  <button
                    type="button"
                    disabled={disabled || !canJoin}
                    onClick={() => handleJoin(shift.id)}
                    className={cn(
                      "inline-flex items-center rounded-full bg-brand-500 px-4 py-2 text-xs font-semibold text-white transition hover:bg-brand-400 focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-brand-300 focus-visible:ring-offset-2 focus-visible:ring-offset-slate-950",
                      (disabled || !canJoin) && "cursor-not-allowed opacity-60",
                    )}
                  >
                    {isFull
                      ? "Місць немає"
                      : loadingShiftId === shift.id
                        ? "Опрацьовується..."
                        : "Приєднатися до зміни"}
                  </button>
                )}
                {!isAuthenticated && approvalsRequired ? (
                  <p className="text-[10px] uppercase tracking-wide text-slate-500">
                    Потрібно увійти та отримати підтвердження заявки
                  </p>
                ) : null}
              </div>
            </div>
          );
        })}
      </div>
    </section>
  );
}

