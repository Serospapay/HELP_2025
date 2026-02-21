"use client";

/**
 * @file: CampaignFilters.tsx
 * @description: Фільтри кампаній з підтримкою ролей (coordinator: мої кампанії, beneficiary: з фінансовою допомогою).
 */

import { useAtomValue } from "jotai";
import { currentUserAtom } from "@/lib/auth";
import { useIsCoordinatorOrAdmin } from "@/hooks/useRoles";
import type { Category } from "@/types";

interface CampaignFiltersProps {
  categories: Category[];
  currentParams: {
    search?: string;
    status?: string;
    region?: string;
    category?: string;
    coordinator?: string;
    has_funding?: string;
  };
}

const STATUS_OPTIONS = [
  { value: "published", label: "Опубліковано" },
  { value: "in_progress", label: "У процесі" },
  { value: "completed", label: "Завершені" },
];

export function CampaignFilters({
  categories,
  currentParams,
}: CampaignFiltersProps) {
  const currentUser = useAtomValue(currentUserAtom);
  const isCoordinator = useIsCoordinatorOrAdmin();
  const isBeneficiary = currentUser?.role === "beneficiary";

  const buildSearchParams = (formData: FormData) => {
    const params = new URLSearchParams();
    const search = String(formData.get("search") || "").trim();
    const status = String(formData.get("status") || "published");
    const region = String(formData.get("region") || "").trim();
    const category = String(formData.get("category") || "").trim();
    const myCampaigns = formData.get("my_campaigns") === "on";
    const hasFunding = formData.get("has_funding") === "on";

    if (search) params.set("search", search);
    if (status) params.set("status", status);
    if (region) params.set("region", region);
    if (category) params.set("category", category);
    if (isCoordinator && myCampaigns && currentUser?.id) {
      params.set("coordinator", String(currentUser.id));
    }
    if (hasFunding) params.set("has_funding", "true");

    return params.toString();
  };

  const handleSubmit = (e: React.FormEvent<HTMLFormElement>) => {
    e.preventDefault();
    const form = e.currentTarget;
    const query = buildSearchParams(new FormData(form));
    window.location.href = query ? `/campaigns?${query}` : "/campaigns";
  };

  const inputClass =
    "mt-2 w-full rounded-2xl border border-white/10 bg-slate-950 px-4 py-3 text-sm text-slate-100 placeholder:text-slate-500 focus:border-brand-400 focus:outline-none focus:ring-2 focus:ring-brand-400/60";

  return (
    <form
      onSubmit={handleSubmit}
      className="grid gap-4 rounded-3xl border border-white/10 bg-slate-900/50 p-6 shadow-lg shadow-black/30 backdrop-blur md:grid-cols-4"
    >
      <label className="md:col-span-2">
        <span className="text-xs font-semibold uppercase tracking-wide text-slate-300">
          Пошук за назвою чи описом
        </span>
        <input
          type="search"
          name="search"
          defaultValue={currentParams.search}
          placeholder="Наприклад, логістика у Львові"
          className={inputClass}
        />
      </label>
      <label>
        <span className="text-xs font-semibold uppercase tracking-wide text-slate-300">
          Статус
        </span>
        <select
          name="status"
          defaultValue={currentParams.status ?? "published"}
          className={inputClass}
        >
          {STATUS_OPTIONS.map((opt) => (
            <option key={opt.value} value={opt.value}>
              {opt.label}
            </option>
          ))}
        </select>
      </label>
      <label>
        <span className="text-xs font-semibold uppercase tracking-wide text-slate-300">
          Регіон
        </span>
        <input
          type="text"
          name="region"
          defaultValue={currentParams.region}
          placeholder="Область або місто"
          className={inputClass}
        />
      </label>
      <label>
        <span className="text-xs font-semibold uppercase tracking-wide text-slate-300">
          Категорія
        </span>
        <select
          name="category"
          defaultValue={currentParams.category ?? ""}
          className={inputClass}
        >
          <option value="">Усі</option>
          {categories.map((c) => (
            <option key={c.id} value={c.slug}>
              {c.name}
            </option>
          ))}
        </select>
      </label>
      {isCoordinator && currentUser && (
        <label className="flex items-center gap-3 pt-8">
          <input
            type="checkbox"
            name="my_campaigns"
            defaultChecked={!!currentParams.coordinator}
            className="size-4 rounded border-white/20 bg-slate-950 text-brand-500 focus:ring-brand-400"
          />
          <span className="text-sm text-slate-200">Мої кампанії</span>
        </label>
      )}
      {isBeneficiary && (
        <label className="flex items-center gap-3 pt-8">
          <input
            type="checkbox"
            name="has_funding"
            defaultChecked={currentParams.has_funding === "true"}
            className="size-4 rounded border-white/20 bg-slate-950 text-brand-500 focus:ring-brand-400"
          />
          <span className="text-sm text-slate-200">
            Лише з фінансовою допомогою
          </span>
        </label>
      )}
      <div className="flex items-end gap-3 md:col-span-4">
        <button
          type="submit"
          className="inline-flex items-center rounded-full bg-brand-500 px-6 py-3 text-sm font-semibold text-white transition hover:bg-brand-400 focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-brand-300 focus-visible:ring-offset-2 focus-visible:ring-offset-slate-950"
        >
          Застосувати фільтри
        </button>
        <a
          href="/campaigns"
          className="inline-flex items-center rounded-full border border-white/20 px-5 py-3 text-sm font-semibold text-white transition hover:border-white/40 focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-brand-400 focus-visible:ring-offset-2 focus-visible:ring-offset-slate-950"
        >
          Скинути
        </a>
      </div>
    </form>
  );
}
