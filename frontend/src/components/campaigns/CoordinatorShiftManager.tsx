"use client";

import { useAtomValue } from "jotai";
import { FormEvent, useMemo, useState } from "react";
import {
  createCampaignShift,
  deleteCampaignShift,
  updateCampaignShift,
} from "@/lib/api";
import { authStatusAtom, tokensAtom } from "@/lib/auth";
import { useCanEditCampaign } from "@/hooks/useRoles";
import type { CampaignShift, CampaignShiftInput } from "@/types";
import { cn, formatDate, formatTimeRange } from "@/lib/utils";
import { useToast } from "@/components/common/toast/ToastContext";
import { ConfirmDialog } from "@/components/common/confirm/ConfirmDialog";

interface CoordinatorShiftManagerProps {
  campaignId: number;
  coordinatorId: number | null | undefined;
  initialShifts: CampaignShift[];
}

export function CoordinatorShiftManager({
  campaignId,
  coordinatorId,
  initialShifts,
}: CoordinatorShiftManagerProps) {
  const authStatus = useAtomValue(authStatusAtom);
  const tokens = useAtomValue(tokensAtom);
  const canEditBase = useCanEditCampaign(coordinatorId);
  const canEdit =
    authStatus === "authenticated" && tokens?.access && canEditBase;
  const [shifts, setShifts] = useState(() =>
    [...initialShifts].sort((a, b) => a.start_at.localeCompare(b.start_at)),
  );
  const [isSubmitting, setIsSubmitting] = useState(false);
  const [error, setError] = useState<string | null>(null);
  const [editingShift, setEditingShift] = useState<CampaignShift | null>(null);
  const { addToast } = useToast();

  const editingDefaults = useMemo(() => {
    if (!editingShift) return null;
    return {
      title: editingShift.title,
      start_at: editingShift.start_at.slice(0, 16),
      end_at: editingShift.end_at.slice(0, 16),
      capacity: editingShift.capacity,
      location_details: editingShift.location_details ?? "",
      description: editingShift.description ?? "",
      instructions: editingShift.instructions ?? "",
    };
  }, [editingShift]);

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
      const payload: CampaignShiftInput = {
        title: String(formData.get("title") || "").trim(),
        start_at: String(formData.get("start_at") || ""),
        end_at: String(formData.get("end_at") || ""),
        capacity: formData.get("capacity")
          ? Number(formData.get("capacity"))
          : 1,
        description:
          String(formData.get("description") || "").trim() || undefined,
        instructions:
          String(formData.get("instructions") || "").trim() || undefined,
        location_details:
          String(formData.get("location_details") || "").trim() || undefined,
      };
      if (!payload.title || !payload.start_at || !payload.end_at) {
        setError("Заповніть назву, час початку та завершення зміни.");
        setIsSubmitting(false);
        return;
      }
      const saved = editingShift
        ? await updateCampaignShift(editingShift.id, payload, tokens)
        : await createCampaignShift(campaignId, payload, tokens);
      setShifts((prev) =>
        [...prev.filter((shift) => shift.id !== saved.id), saved].sort((a, b) =>
          a.start_at.localeCompare(b.start_at),
        ),
      );
      form.reset();
      setEditingShift(null);
      addToast({
        variant: "success",
        title: editingShift ? "Зміну оновлено" : "Зміну створено",
      });
    } catch (err) {
      const message =
        err instanceof Error
          ? err.message
          : "Не вдалося зберегти зміну. Спробуйте знову.";
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
      await deleteCampaignShift(id, tokens);
      setShifts((prev) => prev.filter((shift) => shift.id !== id));
      setEditingShift((prev) => (prev?.id === id ? null : prev));
      addToast({ variant: "success", title: "Зміну видалено" });
    } catch (err) {
      const message =
        err instanceof Error
          ? err.message
          : "Не вдалося видалити зміну. Спробуйте знову.";
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
        <h2 className="text-2xl font-semibold text-white">План змін</h2>
        <p className="text-xs text-slate-400">
          Заплануйте слоти, щоб волонтери знали, коли та де допомагати.
        </p>
      </header>

      {canEdit ? (
        <form
          onSubmit={handleCreate}
          className="grid gap-3 rounded-2xl border border-white/10 bg-slate-950/60 p-4 text-sm"
        >
          <div className="grid gap-3 md:grid-cols-3">
            <label className="text-slate-200 md:col-span-3">
              Назва зміни *
              <input
                name="title"
                type="text"
                required
                defaultValue={editingDefaults?.title}
                placeholder="Наприклад, Пакування гуманітарних наборів"
                className="mt-2 w-full rounded-xl border border-white/10 bg-slate-900 px-3 py-2 text-sm text-white focus:border-brand-400 focus:outline-none focus:ring-2 focus:ring-brand-400/60"
              />
            </label>
            <label className="text-slate-200">
              Початок *
              <input
                name="start_at"
                type="datetime-local"
                required
                defaultValue={editingDefaults?.start_at}
                className="mt-2 w-full rounded-xl border border-white/10 bg-slate-900 px-3 py-2 text-sm text-white focus:border-brand-400 focus:outline-none focus:ring-2 focus:ring-brand-400/60"
              />
            </label>
            <label className="text-slate-200">
              Завершення *
              <input
                name="end_at"
                type="datetime-local"
                required
                defaultValue={editingDefaults?.end_at}
                className="mt-2 w-full rounded-xl border border-white/10 bg-slate-900 px-3 py-2 text-sm text-white focus:border-brand-400 focus:outline-none focus:ring-2 focus:ring-brand-400/60"
              />
            </label>
            <label className="text-slate-200">
              Кількість місць
              <input
                name="capacity"
                type="number"
                min={1}
                defaultValue={editingDefaults?.capacity ?? 5}
                className="mt-2 w-full rounded-xl border border-white/10 bg-slate-900 px-3 py-2 text-sm text-white focus:border-brand-400 focus:outline-none focus:ring-2 focus:ring-brand-400/60"
              />
            </label>
            <label className="text-slate-200 md:col-span-3">
              Деталі локації
              <input
                name="location_details"
                type="text"
                defaultValue={editingDefaults?.location_details}
                placeholder="Адреса, контактна особа, особливі умови"
                className="mt-2 w-full rounded-xl border border-white/10 bg-slate-900 px-3 py-2 text-sm text-white focus:border-brand-400 focus:outline-none focus:ring-2 focus:ring-brand-400/60"
              />
            </label>
            <label className="text-slate-200 md:col-span-3">
              Опис / інструкції
              <textarea
                name="description"
                rows={2}
                defaultValue={editingDefaults?.description}
                placeholder="Що потрібно робити, які матеріали необхідні."
                className="mt-2 w-full rounded-xl border border-white/10 bg-slate-900 px-3 py-2 text-sm text-white focus:border-brand-400 focus:outline-none focus:ring-2 focus:ring-brand-400/60"
              />
            </label>
            <label className="text-slate-200 md:col-span-3">
              Додаткові інструкції волонтерам
              <textarea
                name="instructions"
                rows={2}
                defaultValue={editingDefaults?.instructions}
                placeholder="Інструкції щодо безпеки, контакти координатора, що взяти із собою."
                className="mt-2 w-full rounded-xl border border-white/10 bg-slate-900 px-3 py-2 text-sm text-white focus:border-brand-400 focus:outline-none focus:ring-2 focus:ring-brand-400/60"
              />
            </label>
          </div>
          {error && (
            <div className="rounded-xl border border-rose-400/40 bg-rose-500/10 px-3 py-2 text-xs text-rose-100">
              {error}
            </div>
          )}
          <div className="flex flex-wrap items-center gap-3">
            <button
              type="submit"
              disabled={isSubmitting}
              className={cn(
                "inline-flex rounded-full bg-brand-500 px-5 py-2 text-sm font-semibold text-white transition hover:bg-brand-400 focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-brand-300 focus-visible:ring-offset-2 focus-visible:ring-offset-slate-950",
                isSubmitting && "cursor-wait opacity-80",
              )}
            >
              {editingShift ? "Оновити зміну" : "Додати зміну"}
            </button>
            {editingShift ? (
              <button
                type="button"
                onClick={() => setEditingShift(null)}
                className="inline-flex rounded-full border border-white/20 px-5 py-2 text-sm font-semibold text-slate-200 transition hover:bg-white/10 focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-white/60 focus-visible:ring-offset-2 focus-visible:ring-offset-slate-950"
              >
                Скасувати редагування
              </button>
            ) : null}
          </div>
        </form>
      ) : null}

      <div className="space-y-3">
        {shifts.length === 0 ? (
          <p className="text-sm text-slate-300">
            Зміни ще не заплановані. Створіть першу зміну, щоб формувати розклад.
          </p>
        ) : (
          shifts.map((shift) => (
            <div
              key={shift.id}
              className="flex flex-col gap-3 rounded-2xl border border-white/10 bg-slate-950/60 p-4 md:flex-row md:items-center md:justify-between"
            >
              <div className="space-y-1">
                <p className="text-sm font-semibold text-white">
                  {shift.title}
                </p>
                <p className="text-xs text-slate-400">
                  {formatDate(shift.start_at)} • {formatTimeRange(shift.start_at, shift.end_at)} •{" "}
                  {shift.location_details || "Локація уточнюється"}
                </p>
                <p className="text-xs text-slate-400">
                  {shift.occupied_spots ?? 0}/{shift.capacity} зайнято • Статус: {shift.status}
                </p>
                {shift.description ? (
                  <p className="text-xs text-slate-300">{shift.description}</p>
                ) : null}
                {shift.instructions ? (
                  <p className="text-xs text-slate-300">
                    Інструкції: {shift.instructions}
                  </p>
                ) : null}
              </div>
              {canEdit ? (
                <div className="flex flex-wrap items-center gap-2">
                  <button
                    type="button"
                    onClick={() => setEditingShift(shift)}
                    className="inline-flex items-center rounded-full border border-white/20 px-4 py-2 text-xs font-semibold text-slate-100 transition hover:bg-white/10 focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-brand-400 focus-visible:ring-offset-2 focus-visible:ring-offset-slate-950"
                  >
                    Редагувати
                  </button>
                  <ConfirmDialog
                    disabled={isSubmitting}
                    variant="danger"
                    title="Видалити зміну?"
                    description="Волонтери втратять запис на цей слот. Дію не можна скасувати."
                    confirmLabel="Так, видалити"
                    onConfirm={() => handleDelete(shift.id)}
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
                </div>
              ) : null}
            </div>
          ))
        )}
      </div>
    </section>
  );
}

