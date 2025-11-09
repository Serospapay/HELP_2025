"use client";

import { useAtomValue } from "jotai";
import { FormEvent, useState } from "react";
import {
  createCampaignStage,
  deleteCampaignStage,
} from "@/lib/endpoints";
import { authStatusAtom, currentUserAtom, tokensAtom } from "@/lib/auth";
import type { CampaignStage, CampaignStageInput } from "@/types";
import { cn, formatDate } from "@/lib/utils";
import { useToast } from "@/components/common/toast/ToastContext";
import { ConfirmDialog } from "@/components/common/confirm/ConfirmDialog";

interface CoordinatorStageManagerProps {
  campaignId: number;
  coordinatorId: number | null | undefined;
  initialStages: CampaignStage[];
}

export function CoordinatorStageManager({
  campaignId,
  coordinatorId,
  initialStages,
}: CoordinatorStageManagerProps) {
  const authStatus = useAtomValue(authStatusAtom);
  const currentUser = useAtomValue(currentUserAtom);
  const tokens = useAtomValue(tokensAtom);
  const [stages, setStages] = useState(() =>
    [...initialStages].sort(
      (a, b) => (a.order ?? 999) - (b.order ?? 999),
    ),
  );
  const [isSubmitting, setIsSubmitting] = useState(false);
  const [error, setError] = useState<string | null>(null);
  const { addToast } = useToast();

  const canEdit =
    authStatus === "authenticated" &&
    tokens?.access &&
    (currentUser?.role === "admin" || currentUser?.id === coordinatorId);

  if (!canEdit) {
    return null;
  }

  async function handleCreate(event: FormEvent<HTMLFormElement>) {
    event.preventDefault();
    const form = event.currentTarget;
    const formData = new FormData(form);
    if (!tokens?.access) return;
    setIsSubmitting(true);
    setError(null);
    try {
      const payload: CampaignStageInput = {
        title: String(formData.get("title") || "").trim(),
        description: String(formData.get("description") || "").trim() || undefined,
        order: formData.get("order")
          ? Number(formData.get("order"))
          : undefined,
        due_date: formData.get("due_date")
          ? String(formData.get("due_date"))
          : undefined,
      };
      if (!payload.title) {
        setError("Вкажіть назву етапу.");
        setIsSubmitting(false);
        return;
      }
      const created = await createCampaignStage(campaignId, payload, tokens);
      setStages((prev) =>
        [...prev, created].sort(
          (a, b) => (a.order ?? 999) - (b.order ?? 999),
        ),
      );
      form.reset();
      addToast({ variant: "success", title: "Етап додано" });
    } catch (err) {
      const message =
        err instanceof Error
          ? err.message
          : "Не вдалося створити етап. Спробуйте знову.";
      setError(message);
      addToast({
        variant: "error",
        title: "Помилка",
        description: message,
      });
    } finally {
      setIsSubmitting(false);
    }
  }

  async function handleDelete(id: number) {
    if (!tokens?.access) return;
    setIsSubmitting(true);
    setError(null);
    try {
      await deleteCampaignStage(id, tokens);
      setStages((prev) => prev.filter((stage) => stage.id !== id));
      addToast({ variant: "success", title: "Етап видалено" });
    } catch (err) {
      const message =
        err instanceof Error
          ? err.message
          : "Не вдалося видалити етап. Спробуйте знову.";
      setError(message);
      addToast({
        variant: "error",
        title: "Помилка",
        description: message,
      });
    } finally {
      setIsSubmitting(false);
    }
  }

  return (
    <section className="space-y-4 rounded-3xl border border-white/10 bg-slate-900/60 p-6 shadow-lg shadow-black/20">
      <header className="space-y-1">
        <h2 className="text-2xl font-semibold text-white">Етапи виконання</h2>
        <p className="text-xs text-slate-400">
          Створюйте контрольні точки, щоб волонтери бачили прогрес кампанії.
        </p>
      </header>

      {canEdit ? (
        <form
          onSubmit={handleCreate}
          className="grid gap-3 rounded-2xl border border-white/10 bg-slate-950/60 p-4 text-sm"
        >
          <div className="grid gap-3 md:grid-cols-2">
            <label className="text-slate-200">
              Назва етапу *
              <input
                name="title"
                type="text"
                required
                placeholder="Наприклад, Збір коштів"
                className="mt-2 w-full rounded-xl border border-white/10 bg-slate-900 px-3 py-2 text-sm text-white focus:border-brand-400 focus:outline-none focus:ring-2 focus:ring-brand-400/60"
              />
            </label>
            <label className="text-slate-200">
              Порядок (ціле число)
              <input
                name="order"
                type="number"
                min={1}
                placeholder="1"
                className="mt-2 w-full rounded-xl border border-white/10 bg-slate-900 px-3 py-2 text-sm text-white focus:border-brand-400 focus:outline-none focus:ring-2 focus:ring-brand-400/60"
              />
            </label>
            <label className="text-slate-200">
              Дата завершення
              <input
                name="due_date"
                type="date"
                className="mt-2 w-full rounded-xl border border-white/10 bg-slate-900 px-3 py-2 text-sm text-white focus:border-brand-400 focus:outline-none focus:ring-2 focus:ring-brand-400/60"
              />
            </label>
            <label className="md:col-span-2 text-slate-200">
              Опис
              <textarea
                name="description"
                rows={2}
                placeholder="Опишіть, що саме має бути виконано на цьому етапі."
                className="mt-2 w-full rounded-xl border border-white/10 bg-slate-900 px-3 py-2 text-sm text-white focus:border-brand-400 focus:outline-none focus:ring-2 focus:ring-brand-400/60"
              />
            </label>
          </div>
          {error && (
            <div className="rounded-xl border border-rose-400/40 bg-rose-500/10 px-3 py-2 text-xs text-rose-100">
              {error}
            </div>
          )}
          <button
            type="submit"
            disabled={isSubmitting}
            className={cn(
              "inline-flex w-full justify-center rounded-full bg-brand-500 px-5 py-2 text-sm font-semibold text-white transition hover:bg-brand-400 focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-brand-300 focus-visible:ring-offset-2 focus-visible:ring-offset-slate-950 md:w-max",
              isSubmitting && "cursor-wait opacity-80",
            )}
          >
            Додати етап
          </button>
        </form>
      ) : null}

      <div className="space-y-3">
        {stages.length === 0 ? (
          <p className="text-sm text-slate-300">
            Етапи ще не додані. Заповніть форму, щоб створити перші кроки.
          </p>
        ) : (
          stages.map((stage) => (
            <div
              key={stage.id}
              className="flex flex-col gap-2 rounded-2xl border border-white/10 bg-slate-950/60 p-4 md:flex-row md:items-center md:justify-between"
            >
              <div>
                <p className="text-sm font-semibold text-white">
                  {(stage.order ?? 0) > 0 ? `${stage.order}. ` : ""}
                  {stage.title}
                </p>
                {stage.description && (
                  <p className="text-xs text-slate-300">{stage.description}</p>
                )}
                <p className="text-xs text-slate-500">
                  Заплановано до {formatDate(stage.due_date)}
                </p>
              </div>
              {canEdit ? (
                <ConfirmDialog
                  disabled={isSubmitting}
                  variant="danger"
                  title="Видалити етап?"
                  description="Ця дія незворотна. Волонтери більше не бачитимуть цей етап у плані."
                  confirmLabel="Так, видалити"
                  onConfirm={() => handleDelete(stage.id)}
                  trigger={
                    <button
                      type="button"
                      className={cn(
                        "inline-flex items-center rounded-full border border-rose-400/40 px-4 py-2 text-xs font-semibold text-rose-100 transition hover:bg-rose-500/10 focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-rose-400 focus-visible:ring-offset-2 focus-visible:ring-offset-slate-950",
                        isSubmitting && "cursor-wait opacity-80",
                      )}
                    >
                      Видалити
                    </button>
                  }
                />
              ) : null}
            </div>
          ))
        )}
      </div>
    </section>
  );
}

