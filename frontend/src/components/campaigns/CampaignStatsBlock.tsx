"use client";

/**
 * @file: CampaignStatsBlock.tsx
 * @description: Блок статистики кампанії для координатора/адміна.
 */

import { useState, useEffect } from "react";
import { useAtomValue } from "jotai";
import { tokensAtom } from "@/lib/auth";
import {
  getCampaignStats,
  type CampaignStats,
} from "@/lib/api";
import { formatCurrency } from "@/lib/utils";
import { useCanEditCampaign } from "@/hooks/useRoles";

interface CampaignStatsBlockProps {
  campaignSlug: string;
  coordinatorId?: number;
}

export function CampaignStatsBlock({
  campaignSlug,
  coordinatorId,
}: CampaignStatsBlockProps) {
  const tokens = useAtomValue(tokensAtom);
  const canEdit = useCanEditCampaign(coordinatorId);
  const [stats, setStats] = useState<CampaignStats | null>(null);
  const [loading, setLoading] = useState(false);
  const [error, setError] = useState<string | null>(null);

  useEffect(() => {
    if (!canEdit || !tokens?.access) return;
    setLoading(true);
    setError(null);
    getCampaignStats(campaignSlug, tokens)
      .then(setStats)
      .catch((e) => setError(e instanceof Error ? e.message : "Помилка"))
      .finally(() => setLoading(false));
  }, [campaignSlug, canEdit, tokens]);

  if (!canEdit) return null;
  if (loading) {
    return (
      <div className="rounded-3xl border border-white/10 bg-slate-900/50 p-6">
        <p className="text-sm text-slate-400">Завантаження статистики...</p>
      </div>
    );
  }
  if (error || !stats) {
    return (
      <div className="rounded-3xl border border-amber-500/20 bg-amber-500/5 p-6">
        <p className="text-sm text-amber-200">
          {error ?? "Не вдалося завантажити статистику."}
        </p>
      </div>
    );
  }

  const target = Number(stats.campaign.target_amount) || 0;
  const current = Number(stats.campaign.current_amount) || 0;
  const progress =
    target > 0 ? Math.min(100, Math.round((current / target) * 100)) : null;

  return (
    <section
      aria-labelledby="campaign-stats"
      className="space-y-4 rounded-3xl border border-white/10 bg-slate-900/50 p-6 shadow-inner shadow-black/30 backdrop-blur"
    >
      <h2
        id="campaign-stats"
        className="text-lg font-semibold text-white"
      >
        Статистика кампанії
      </h2>
      <div className="grid gap-4 sm:grid-cols-2 lg:grid-cols-4">
        <div>
          <p className="text-xs uppercase tracking-wide text-slate-400">
            Підтверджені волонтери
          </p>
          <p className="mt-1 text-2xl font-semibold text-emerald-300">
            {stats.volunteers.approved}
          </p>
        </div>
        <div>
          <p className="text-xs uppercase tracking-wide text-slate-400">
            Очікують підтвердження
          </p>
          <p className="mt-1 text-2xl font-semibold text-amber-300">
            {stats.volunteers.pending}
          </p>
        </div>
        <div>
          <p className="text-xs uppercase tracking-wide text-slate-400">
            Ємність змін
          </p>
          <p className="mt-1 text-2xl font-semibold text-white">
            {stats.shift_capacity}
          </p>
        </div>
        <div>
          <p className="text-xs uppercase tracking-wide text-slate-400">
            Зібрано / Ціль
          </p>
          <p className="mt-1 text-lg font-semibold text-white">
            {formatCurrency(current)} / {formatCurrency(target)}
          </p>
          {progress !== null && (
            <div className="mt-2 h-2 overflow-hidden rounded-full bg-slate-800/80">
              <div
                className="h-full rounded-full bg-gradient-to-r from-brand-400 to-brand-200"
                style={{ width: `${progress}%` }}
                aria-hidden
              />
            </div>
          )}
        </div>
      </div>
    </section>
  );
}
