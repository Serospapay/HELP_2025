"use client";

/**
 * @file: CampaignCreateForm.tsx
 * @description: Форма створення кампанії для координаторів.
 * @dependencies: useRouter, tokensAtom, currentUserAtom, createCampaign, getCampaignCategories
 */

import { useState, type FormEvent } from "react";
import { useRouter } from "next/navigation";
import { useAtomValue } from "jotai";
import { tokensAtom } from "@/lib/auth";
import { createCampaign } from "@/lib/api";
import type { CampaignCreateInput, Category } from "@/types";

interface CampaignCreateFormProps {
  categories: Category[];
}

const STATUS_OPTIONS = [
  { value: "draft", label: "Чернетка" },
  { value: "published", label: "Опублікувати одразу" },
];

export function CampaignCreateForm({ categories }: CampaignCreateFormProps) {
  const router = useRouter();
  const tokens = useAtomValue(tokensAtom);
  const [status, setStatus] = useState<"idle" | "loading" | "error">("idle");
  const [errorMessage, setErrorMessage] = useState<string>("");

  const handleSubmit = async (e: FormEvent<HTMLFormElement>) => {
    e.preventDefault();
    if (!tokens?.access) {
      setStatus("error");
      setErrorMessage("Увійдіть, щоб створити кампанію.");
      return;
    }

    const form = e.currentTarget;
    const fd = new FormData(form);

    const payload: CampaignCreateInput = {
      title: String(fd.get("title") || "").trim(),
      short_description: String(fd.get("short_description") || "").trim(),
      description: String(fd.get("description") || "").trim(),
      status: (fd.get("status") as "draft" | "published") || "draft",
      category: Number(fd.get("category")),
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

    if (!payload.category || Number.isNaN(payload.category)) {
      setStatus("error");
      setErrorMessage("Оберіть категорію.");
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
      const campaign = await createCampaign(payload, tokens);
      router.push(`/campaigns/${campaign.slug}`);
      router.refresh();
    } catch (err) {
      setStatus("error");
      setErrorMessage(
        err instanceof Error ? err.message : "Не вдалося створити кампанію.",
      );
    }
  };

  const inputClass =
    "mt-2 w-full rounded-2xl border border-white/10 bg-slate-950 px-4 py-3 text-sm text-slate-100 placeholder:text-slate-500 focus:border-brand-400 focus:outline-none focus:ring-2 focus:ring-brand-400/60";
  const labelClass =
    "text-xs font-semibold uppercase tracking-wide text-slate-300";

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
            placeholder="Наприклад, Логістична допомога на схід"
            className={inputClass}
          />
        </label>

        <label className="md:col-span-2">
          <span className={labelClass}>Короткий опис (до 280 символів)</span>
          <textarea
            name="short_description"
            required
            maxLength={280}
            rows={2}
            placeholder="Короткий опис для картки кампанії"
            className={inputClass}
          />
        </label>

        <label className="md:col-span-2">
          <span className={labelClass}>Повний опис</span>
          <textarea
            name="description"
            required
            rows={5}
            placeholder="Детальний опис завдань та цілей"
            className={inputClass}
          />
        </label>

        <label>
          <span className={labelClass}>Категорія</span>
          <select name="category" required className={inputClass}>
            <option value="">Оберіть категорію</option>
            {categories.map((c) => (
              <option key={c.id} value={c.id}>
                {c.name}
              </option>
            ))}
          </select>
        </label>

        <label>
          <span className={labelClass}>Статус</span>
          <select name="status" className={inputClass}>
            {STATUS_OPTIONS.map((o) => (
              <option key={o.value} value={o.value}>
                {o.label}
              </option>
            ))}
          </select>
        </label>

        <label className="md:col-span-2">
          <span className={labelClass}>Локація (назва)</span>
          <input
            type="text"
            name="location_name"
            required
            placeholder="Місто або регіон"
            className={inputClass}
          />
        </label>

        <label>
          <span className={labelClass}>Адреса локації</span>
          <input
            type="text"
            name="location_address"
            placeholder="Повна адреса (необов'язково)"
            className={inputClass}
          />
        </label>

        <label>
          <span className={labelClass}>Регіон / область</span>
          <input
            type="text"
            name="region"
            placeholder="Наприклад, Львівська область"
            className={inputClass}
          />
        </label>

        <label>
          <span className={labelClass}>Дата початку</span>
          <input type="date" name="start_date" className={inputClass} />
        </label>

        <label>
          <span className={labelClass}>Дата завершення</span>
          <input type="date" name="end_date" className={inputClass} />
        </label>

        <label>
          <span className={labelClass}>Цільова сума (грн)</span>
          <input
            type="number"
            name="target_amount"
            min={0}
            step={1}
            placeholder="Залиште порожнім, якщо без збору"
            className={inputClass}
          />
        </label>

        <label>
          <span className={labelClass}>Необхідно волонтерів</span>
          <input
            type="number"
            name="required_volunteers"
            min={0}
            defaultValue={0}
            className={inputClass}
          />
        </label>

        <label>
          <span className={labelClass}>Email для контактів</span>
          <input
            type="email"
            name="contact_email"
            placeholder="coordinator@example.com"
            className={inputClass}
          />
        </label>

        <label>
          <span className={labelClass}>Телефон</span>
          <input
            type="tel"
            name="contact_phone"
            placeholder="+380..."
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
          {status === "loading" ? "Створення..." : "Створити кампанію"}
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
