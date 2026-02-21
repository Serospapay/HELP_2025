"use client";

/**
 * @file: CampaignEditForm.tsx
 * @description: Форма редагування кампанії.
 */

import { useState, type FormEvent } from "react";
import { useRouter } from "next/navigation";
import { useAtomValue } from "jotai";
import { tokensAtom } from "@/lib/auth";
import { updateCampaign } from "@/lib/api";
import type { Campaign, CampaignUpdateInput, Category } from "@/types";

const STATUS_OPTIONS = [
  { value: "draft", label: "Чернетка" },
  { value: "published", label: "Опубліковано" },
  { value: "in_progress", label: "У процесі" },
  { value: "completed", label: "Завершено" },
  { value: "cancelled", label: "Скасовано" },
];

interface CampaignEditFormProps {
  campaign: Campaign;
  categories: Category[];
}

export function CampaignEditForm({ campaign, categories }: CampaignEditFormProps) {
  const router = useRouter();
  const tokens = useAtomValue(tokensAtom);
  const [status, setStatus] = useState<"idle" | "loading" | "error">("idle");
  const [errorMessage, setErrorMessage] = useState<string>("");

  const toDateValue = (v: string | null | undefined) => {
    if (!v) return "";
    const d = new Date(v);
    return isNaN(d.getTime()) ? "" : d.toISOString().slice(0, 10);
  };

  const handleSubmit = async (e: FormEvent<HTMLFormElement>) => {
    e.preventDefault();
    if (!tokens?.access) {
      setStatus("error");
      setErrorMessage("Увійдіть для збереження змін.");
      return;
    }

    const form = e.currentTarget;
    const fd = new FormData(form);

    const payload: CampaignUpdateInput = {
      title: String(fd.get("title") || "").trim(),
      short_description: String(fd.get("short_description") || "").trim(),
      description: String(fd.get("description") || "").trim(),
      status: (fd.get("status") as Campaign["status"]) || campaign.status,
      category: Number(fd.get("category")) || campaign.category?.id,
      location_name: String(fd.get("location_name") || "").trim(),
      location_address: String(fd.get("location_address") || "").trim() || undefined,
      region: String(fd.get("region") || "").trim() || undefined,
      target_amount: (() => {
        const v = fd.get("target_amount");
        if (v === "" || v === null) return null;
        const n = Number(v);
        return Number.isNaN(n) || n <= 0 ? null : n;
      })(),
      required_volunteers: Math.max(0, Number(fd.get("required_volunteers")) || 0),
      start_date: (() => {
        const v = fd.get("start_date");
        return v && String(v).trim() ? String(v) : null;
      })(),
      end_date: (() => {
        const v = fd.get("end_date");
        return v && String(v).trim() ? String(v) : null;
      })(),
      contact_email: String(fd.get("contact_email") || "").trim() || undefined,
      contact_phone: String(fd.get("contact_phone") || "").trim() || undefined,
    };

    if (!payload.title || !payload.short_description || !payload.description) {
      setStatus("error");
      setErrorMessage("Назва та опис обов'язкові.");
      return;
    }

    if (!payload.location_name) {
      setStatus("error");
      setErrorMessage("Вкажіть локацію.");
      return;
    }

    setStatus("loading");
    setErrorMessage("");

    try {
      await updateCampaign(campaign.slug, payload, tokens);
      router.push(`/campaigns/${campaign.slug}`);
      router.refresh();
    } catch (err) {
      setStatus("error");
      setErrorMessage(
        err instanceof Error ? err.message : "Не вдалося зберегти зміни.",
      );
    }
  };

  const inputClass =
    "mt-2 w-full rounded-2xl border border-white/10 bg-slate-950 px-4 py-3 text-sm text-slate-100 placeholder:text-slate-500 focus:border-brand-400 focus:outline-none focus:ring-2 focus:ring-brand-400/60";
  const labelClass =
    "text-xs font-semibold uppercase tracking-wide text-slate-300";

  const targetNum =
    typeof campaign.target_amount === "number"
      ? campaign.target_amount
      : campaign.target_amount
        ? parseFloat(String(campaign.target_amount))
        : null;

  return (
    <form
      onSubmit={handleSubmit}
      className="space-y-6 rounded-3xl border border-white/10 bg-slate-900/60 p-6 shadow-xl shadow-black/20"
    >
      {errorMessage && (
        <div
          role="alert"
          className="rounded-2xl border border-red-500/30 bg-red-500/10 px-4 py-3 text-sm text-red-200"
        >
          {errorMessage}
        </div>
      )}

      <div className="grid gap-4 md:grid-cols-2">
        <label className="md:col-span-2">
          <span className={labelClass}>Назва кампанії</span>
          <input
            type="text"
            name="title"
            required
            maxLength={255}
            defaultValue={campaign.title}
            className={inputClass}
          />
        </label>

        <label className="md:col-span-2">
          <span className={labelClass}>Короткий опис</span>
          <textarea
            name="short_description"
            required
            maxLength={280}
            rows={2}
            defaultValue={campaign.short_description}
            className={inputClass}
          />
        </label>

        <label className="md:col-span-2">
          <span className={labelClass}>Повний опис</span>
          <textarea
            name="description"
            required
            rows={5}
            defaultValue={campaign.description}
            className={inputClass}
          />
        </label>

        <label>
          <span className={labelClass}>Категорія</span>
          <select
            name="category"
            required
            defaultValue={campaign.category?.id}
            className={inputClass}
          >
            {categories.map((c) => (
              <option key={c.id} value={c.id}>
                {c.name}
              </option>
            ))}
          </select>
        </label>

        <label>
          <span className={labelClass}>Статус</span>
          <select
            name="status"
            defaultValue={campaign.status}
            className={inputClass}
          >
            {STATUS_OPTIONS.map((o) => (
              <option key={o.value} value={o.value}>
                {o.label}
              </option>
            ))}
          </select>
        </label>

        <label className="md:col-span-2">
          <span className={labelClass}>Локація</span>
          <input
            type="text"
            name="location_name"
            required
            defaultValue={campaign.location_name}
            className={inputClass}
          />
        </label>

        <label>
          <span className={labelClass}>Адреса</span>
          <input
            type="text"
            name="location_address"
            defaultValue={campaign.location_address ?? ""}
            className={inputClass}
          />
        </label>

        <label>
          <span className={labelClass}>Регіон</span>
          <input
            type="text"
            name="region"
            defaultValue={campaign.region ?? ""}
            className={inputClass}
          />
        </label>

        <label>
          <span className={labelClass}>Дата початку</span>
          <input
            type="date"
            name="start_date"
            defaultValue={toDateValue(campaign.start_date)}
            className={inputClass}
          />
        </label>

        <label>
          <span className={labelClass}>Дата завершення</span>
          <input
            type="date"
            name="end_date"
            defaultValue={toDateValue(campaign.end_date)}
            className={inputClass}
          />
        </label>

        <label>
          <span className={labelClass}>Цільова сума (грн)</span>
          <input
            type="number"
            name="target_amount"
            min={0}
            step={1}
            defaultValue={targetNum ?? ""}
            placeholder="Порожньо = без збору"
            className={inputClass}
          />
        </label>

        <label>
          <span className={labelClass}>Необхідно волонтерів</span>
          <input
            type="number"
            name="required_volunteers"
            min={0}
            defaultValue={campaign.required_volunteers ?? 0}
            className={inputClass}
          />
        </label>

        <label>
          <span className={labelClass}>Email</span>
          <input
            type="email"
            name="contact_email"
            defaultValue={campaign.contact_email ?? ""}
            className={inputClass}
          />
        </label>

        <label>
          <span className={labelClass}>Телефон</span>
          <input
            type="tel"
            name="contact_phone"
            defaultValue={campaign.contact_phone ?? ""}
            className={inputClass}
          />
        </label>
      </div>

      <div className="flex flex-wrap gap-3">
        <button
          type="submit"
          disabled={status === "loading"}
          className="inline-flex items-center rounded-full bg-brand-500 px-6 py-3 text-sm font-semibold text-white transition hover:bg-brand-400 disabled:opacity-60 focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-brand-300 focus-visible:ring-offset-2 focus-visible:ring-offset-slate-950"
        >
          {status === "loading" ? "Збереження..." : "Зберегти зміни"}
        </button>
        <button
          type="button"
          onClick={() => router.back()}
          className="inline-flex items-center rounded-full border border-white/20 px-5 py-3 text-sm font-semibold text-white transition hover:border-white/40 focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-brand-400 focus-visible:ring-offset-2 focus-visible:ring-offset-slate-950"
        >
          Скасувати
        </button>
      </div>
    </form>
  );
}
