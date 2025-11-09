"use client";

import { useEffect, useState } from "react";
import Link from "next/link";
import { useAtomValue } from "jotai";
import { authStatusAtom, tokensAtom } from "@/lib/auth";
import {
  getVolunteerApplications,
  updateVolunteerApplicationStatus,
} from "@/lib/endpoints";
import type { VolunteerApplication } from "@/types";
import { StatusBadge } from "@/components/common/StatusBadge";
import { ConfirmDialog } from "@/components/common/confirm/ConfirmDialog";
import { useToast } from "@/components/common/toast/ToastContext";

export function VolunteerApplicationsList() {
  const authStatus = useAtomValue(authStatusAtom);
  const tokens = useAtomValue(tokensAtom);
  const [applications, setApplications] = useState<VolunteerApplication[]>([]);
  const [isLoading, setIsLoading] = useState(false);
  const [error, setError] = useState<string | null>(null);
  const [updatingId, setUpdatingId] = useState<number | null>(null);
  const { addToast } = useToast();

  useEffect(() => {
    if (authStatus !== "authenticated" || !tokens?.access) return;
    let isMounted = true;
    setIsLoading(true);
    getVolunteerApplications(tokens)
      .then((data) => {
        if (!isMounted) return;
        setApplications(data);
      })
      .catch((err) => {
        if (!isMounted) return;
        setError(
          err instanceof Error
            ? err.message
            : "Не вдалося завантажити ваші заявки.",
        );
      })
      .finally(() => {
        if (isMounted) setIsLoading(false);
      });

    return () => {
      isMounted = false;
    };
  }, [authStatus, tokens]);

  if (authStatus !== "authenticated") return null;

  if (isLoading) {
    return (
      <div className="rounded-3xl border border-white/10 bg-slate-900/60 p-6 text-sm text-slate-300">
        Завантажуємо ваші заявки...
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
        Немає активних заявок. Перегляньте{" "}
        <Link
          href="/campaigns"
          className="font-semibold text-brand-200 underline-offset-4 transition hover:text-brand-100 hover:underline focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-brand-300 focus-visible:ring-offset-2 focus-visible:ring-offset-slate-950"
        >
          кампанії
        </Link>{" "}
        та долучіться до волонтерської команди.
      </div>
    );
  }

  return (
    <div className="space-y-4 rounded-3xl border border-white/10 bg-slate-900/60 p-6 shadow-lg shadow-black/20">
      <h2 className="text-lg font-semibold text-white">Мої заявки</h2>
      <ul className="space-y-3 text-sm">
        {applications.map((application) => {
          const canWithdraw =
            application.status !== "withdrawn" &&
            application.status !== "declined";
          return (
            <li
              key={application.id}
              className="flex flex-col gap-2 rounded-2xl border border-white/10 bg-slate-950/60 p-4 md:flex-row md:items-center md:justify-between"
            >
              <div>
                <p className="text-base font-semibold text-white">
                  {application.campaign.title}
                </p>
                <p className="text-xs text-slate-400">
                  Подано{" "}
                  {new Date(application.created_at).toLocaleDateString("uk-UA")}
                </p>
              </div>
              <div className="flex flex-col items-start gap-2 md:items-end">
                <StatusBadge status={application.status} />
                <Link
                  href={`/campaigns/${application.campaign.slug}`}
                  className="text-xs font-semibold text-brand-200 transition hover:text-brand-100 focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-brand-400 focus-visible:ring-offset-2 focus-visible:ring-offset-slate-950"
                >
                  Переглянути кампанію →
                </Link>
                {canWithdraw ? (
                  <ConfirmDialog
                    disabled={updatingId === application.id}
                    variant="danger"
                    title="Відмінити заявку?"
                    description="Місце у зміні звільниться, а координатор побачить статус 'скасовано'."
                    confirmLabel="Так, скасувати"
                    onConfirm={async () => {
                      if (!tokens?.access) return;
                      setUpdatingId(application.id);
                      setError(null);
                      try {
                        const updated = await updateVolunteerApplicationStatus(
                          application.id,
                          "withdrawn",
                          tokens,
                        );
                        setApplications((prev) =>
                          prev.map((item) =>
                            item.id === updated.id ? updated : item,
                          ),
                        );
                        addToast({
                          variant: "success",
                          title: "Заявку скасовано",
                        });
                      } catch (err) {
                        const message =
                          err instanceof Error
                            ? err.message
                            : "Не вдалося скасувати заявку. Спробуйте знову.";
                        setError(message);
                        addToast({
                          variant: "error",
                          title: "Помилка",
                          description: message,
                        });
                      } finally {
                        setUpdatingId(null);
                      }
                    }}
                    trigger={
                      <button
                        type="button"
                        className={`inline-flex items-center rounded-full border border-rose-400/40 px-4 py-2 text-xs font-semibold text-rose-100 transition hover:bg-rose-500/10 focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-rose-400 focus-visible:ring-offset-2 focus-visible:ring-offset-slate-950 ${
                          updatingId === application.id
                            ? "cursor-wait opacity-80"
                            : ""
                        }`}
                      >
                        Скасувати заявку
                      </button>
                    }
                  />
                ) : null}
              </div>
            </li>
          );
        })}
      </ul>
    </div>
  );
}

