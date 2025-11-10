"use client";

import { useEffect, useMemo, useState } from "react";
import Link from "next/link";
import { useAtomValue } from "jotai";
import { authStatusAtom, currentUserAtom, tokensAtom } from "@/lib/auth";
import {
  getVolunteerApplications,
  updateVolunteerApplicationStatus,
} from "@/lib/endpoints";
import type { VolunteerApplication } from "@/types";
import { StatusBadge } from "@/components/common/StatusBadge";
import { cn, formatDate } from "@/lib/utils";
import { useToast } from "@/components/common/toast/ToastContext";
import { ConfirmDialog } from "@/components/common/confirm/ConfirmDialog";

type FetchState = "idle" | "loading" | "success" | "error";

export function CoordinatorApplicationsPanel() {
  const authStatus = useAtomValue(authStatusAtom);
  const currentUser = useAtomValue(currentUserAtom);
  const tokens = useAtomValue(tokensAtom);
  const [applications, setApplications] = useState<VolunteerApplication[]>([]);
  const [fetchState, setFetchState] = useState<FetchState>("idle");
  const [error, setError] = useState<string | null>(null);
  const [updatingId, setUpdatingId] = useState<number | null>(null);
  const { addToast } = useToast();

  const isCoordinator =
    authStatus === "authenticated" &&
    (currentUser?.role === "coordinator" || currentUser?.role === "admin");

  useEffect(() => {
    if (!isCoordinator || !tokens?.access) return;

    let isMounted = true;
    setFetchState("loading");
    getVolunteerApplications(tokens)
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
            : "Не вдалося завантажити заявки волонтерів.",
        );
        setFetchState("error");
      });

    return () => {
      isMounted = false;
    };
  }, [isCoordinator, tokens]);

  const grouped = useMemo(() => {
    return applications.reduce<Record<string, VolunteerApplication[]>>(
      (acc, item) => {
        const key = item.campaign.slug;
        if (!acc[key]) acc[key] = [];
        acc[key].push(item);
        return acc;
      },
      {},
    );
  }, [applications]);

  async function handleDecision(
    applicationId: number,
    nextStatus: "approved" | "declined",
  ) {
    if (!tokens?.access) return;
    setUpdatingId(applicationId);
    try {
      const updated = await updateVolunteerApplicationStatus(
        applicationId,
        nextStatus,
        tokens,
      );
      setApplications((prev) =>
        prev.map((item) =>
          item.id === applicationId ? { ...item, status: updated.status } : item,
        ),
      );
      addToast({
        variant: "success",
        title:
          nextStatus === "approved"
            ? "Статус заявки оновлено"
            : "Заявку відхилено",
      });
    } catch (err) {
      console.error(err);
      const message =
        err instanceof Error
          ? err.message
          : "Не вдалося оновити статус заявки.";
      setError(message);
      addToast({
        variant: "error",
        title: "Помилка оновлення",
        description: message,
      });
    } finally {
      setUpdatingId(null);
    }
  }

  if (!isCoordinator) return null;

  if (fetchState === "loading") {
    return (
      <div className="rounded-3xl border border-white/10 bg-slate-900/60 p-6 text-sm text-slate-300">
        Завантажуємо заявки волонтерів...
      </div>
    );
  }

  if (error) {
    return (
      <div className="rounded-3xl border border-rose-400/40 bg-rose-500/10 p-6 text-sm text-rose-100">
        {error}
      </div>
    );
  }

  if (applications.length === 0) {
    return (
      <div className="rounded-3xl border border-white/10 bg-slate-900/60 p-6 text-sm text-slate-300">
        Немає заявок для модерації. Коли волонтери подадуться, ви побачите їх
        тут.
      </div>
    );
  }

  return (
    <section className="space-y-4 rounded-3xl border border-white/10 bg-slate-900/60 p-6 shadow-lg shadow-black/20">
      <header className="space-y-1">
        <h2 className="text-lg font-semibold text-white">
          Заявки, що потребують модерації
        </h2>
        <p className="text-xs text-slate-400">
          Підтверджуйте волонтерів або відхиляйте заявки безпосередньо звідси.
        </p>
      </header>
      <div className="space-y-4">
        {Object.entries(grouped).map(([slug, apps]) => (
          <div key={slug} className="space-y-3 rounded-2xl border border-white/10 p-4">
            <div className="flex flex-wrap items-center justify-between gap-2">
              <p className="text-sm font-semibold text-white">
                {apps[0].campaign.title}
              </p>
              <Link
                href={`/campaigns/${slug}`}
                className="text-xs font-semibold text-brand-200 transition hover:text-brand-100 focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-brand-400 focus-visible:ring-offset-2 focus-visible:ring-offset-slate-950"
              >
                Переглянути кампанію →
              </Link>
            </div>
            <div className="space-y-2">
              {apps.map((application) => (
                <div
                  key={application.id}
                  data-testid="coordinator-application-card"
                  data-application-id={String(application.id)}
                  data-volunteer-email={application.volunteer.email}
                  className={cn(
                    "flex flex-col gap-3 rounded-xl border border-white/10 bg-slate-950/60 p-4 md:flex-row md:items-center md:justify-between",
                    application.status === "pending"
                      ? "border-amber-500/40"
                      : "border-white/10",
                  )}
                >
                  <div className="space-y-1">
                    <p className="text-sm font-semibold text-white">
                      {application.volunteer.first_name ||
                        application.volunteer.email}
                    </p>
                    <p className="text-xs text-slate-400">
                      {application.volunteer.email}
                    </p>
                    <p className="text-xs text-slate-400">
                      Подано {formatDate(application.created_at)}
                    </p>
                    {application.motivation && (
                      <p className="text-xs text-slate-300">
                        “{application.motivation}”
                      </p>
                    )}
                  </div>
                  <div className="flex flex-col items-start gap-2 md:items-end">
                    <StatusBadge
                      status={application.status}
                      labelOverride={
                        application.status === "approved" ? "Схвалено" : undefined
                      }
                      data-testid="coordinator-application-status"
                      data-status={application.status}
                    />
                    {application.status === "pending" ? (
                      <div className="flex gap-2">
                        <button
                          type="button"
                          disabled={updatingId === application.id}
                          onClick={() =>
                            handleDecision(application.id, "approved")
                          }
                          className={cn(
                            "inline-flex items-center rounded-full bg-emerald-500 px-4 py-2 text-xs font-semibold text-white transition hover:bg-emerald-400 focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-emerald-300 focus-visible:ring-offset-2 focus-visible:ring-offset-slate-950",
                            updatingId === application.id && "opacity-80",
                          )}
                        >
                          Підтвердити
                        </button>
                        <ConfirmDialog
                          disabled={updatingId === application.id}
                          variant="danger"
                          title="Відхилити заявку?"
                          description="Цю дію не можна скасувати. Волонтер отримає повідомлення про відмову."
                          confirmLabel="Так, відхилити"
                          onConfirm={() =>
                            handleDecision(application.id, "declined")
                          }
                          trigger={
                            <button
                              type="button"
                              className={cn(
                                "inline-flex items-center rounded-full border border-rose-400/40 px-4 py-2 text-xs font-semibold text-rose-100 transition hover:bg-rose-500/10 focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-rose-400 focus-visible:ring-offset-2 focus-visible:ring-offset-slate-950",
                                updatingId === application.id && "opacity-80",
                              )}
                            >
                              Відхилити
                            </button>
                          }
                        />
                      </div>
                    ) : (
                      <p
                        className={cn(
                          "text-xs text-slate-300",
                          application.status === "declined" && "text-rose-200",
                        )}
                      >
                        {application.status === "approved"
                          ? "Заявку підтверджено"
                          : application.status === "declined"
                            ? "Заявку відхилено"
                            : "Статус заявки синхронізовано"}
                      </p>
                    )}
                  </div>
                </div>
              ))}
            </div>
          </div>
        ))}
      </div>
    </section>
  );
}

