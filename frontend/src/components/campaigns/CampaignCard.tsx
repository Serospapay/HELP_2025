import Link from "next/link";
import type { Campaign } from "@/types";
import { formatCurrency, formatDate, toNumber } from "@/lib/utils";
import { StatusBadge } from "@/components/common/StatusBadge";

interface CampaignCardProps {
  campaign: Campaign;
}

export function CampaignCard({ campaign }: CampaignCardProps) {
  const target = toNumber(campaign.target_amount);
  const current = toNumber(campaign.current_amount);
  const progress =
    target > 0 ? Math.min(100, Math.round((current / target) * 100)) : null;
  const volunteersNeeded = campaign.required_volunteers ?? 0;

  return (
    <article className="flex h-full flex-col rounded-3xl border border-white/10 bg-slate-900/60 p-6 shadow-lg shadow-black/20 transition hover:-translate-y-1 hover:border-white/20">
      <div className="flex items-center gap-2">
        <StatusBadge status={campaign.status} />
        <span className="text-xs uppercase tracking-wide text-slate-400">
          {campaign.category?.name ?? "Категорія"}
        </span>
      </div>
      <h2 className="mt-4 text-xl font-semibold text-white md:text-2xl">
        <Link
          href={`/campaigns/${campaign.slug}`}
          className="focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-brand-400 focus-visible:ring-offset-2 focus-visible:ring-offset-slate-950"
        >
          {campaign.title}
        </Link>
      </h2>
      <p className="mt-3 line-clamp-3 text-sm text-slate-300">
        {campaign.short_description}
      </p>

      <dl className="mt-4 grid grid-cols-2 gap-4 text-sm text-slate-300">
        <div>
          <dt className="text-xs uppercase tracking-wide text-slate-400">Локація</dt>
          <dd className="mt-1 font-medium text-slate-100">
            {campaign.location_name}
          </dd>
        </div>
        <div>
          <dt className="text-xs uppercase tracking-wide text-slate-400">Період</dt>
          <dd className="mt-1 font-medium text-slate-100">
            {formatDate(campaign.start_date)} – {formatDate(campaign.end_date)}
          </dd>
        </div>
        <div>
          <dt className="text-xs uppercase tracking-wide text-slate-400">
            Волонтери
          </dt>
          <dd className="mt-1 font-medium text-slate-100">
            {volunteersNeeded > 0 ? `${volunteersNeeded}+` : "За потреби"}
          </dd>
        </div>
        <div>
          <dt className="text-xs uppercase tracking-wide text-slate-400">
            Ціль
          </dt>
          <dd className="mt-1 font-medium text-slate-100">
            {target > 0 ? formatCurrency(target) : "Матеріальна допомога"}
          </dd>
        </div>
      </dl>

      <div className="mt-6 space-y-3">
        {progress !== null && (
          <div>
            <div className="flex items-center justify-between text-xs uppercase tracking-wide text-slate-400">
              <span>Зібрано</span>
              <span className="font-semibold text-slate-200">{progress}%</span>
            </div>
            <div className="mt-2 h-2 overflow-hidden rounded-full bg-slate-800">
              <div
                className="h-full rounded-full bg-brand-500 transition-all"
                style={{ width: `${progress}%` }}
                aria-hidden="true"
              />
            </div>
            <p className="mt-2 text-xs text-slate-400">
              {formatCurrency(current)} / {formatCurrency(target)}
            </p>
          </div>
        )}
      </div>

      <div className="mt-auto flex flex-wrap items-center gap-3 pt-6">
        <Link
          href={`/campaigns/${campaign.slug}`}
          className="inline-flex items-center rounded-full bg-white px-4 py-2 text-sm font-semibold text-slate-900 transition hover:bg-slate-100 focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-brand-400 focus-visible:ring-offset-2 focus-visible:ring-offset-slate-900"
        >
          Переглянути
        </Link>
        <Link
          href={`/donations/new?campaign=${campaign.id}`}
          className="inline-flex items-center rounded-full border border-brand-400 px-4 py-2 text-sm font-semibold text-brand-300 transition hover:bg-brand-500/10 focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-brand-400 focus-visible:ring-offset-2 focus-visible:ring-offset-slate-900"
        >
          Пожертвувати
        </Link>
      </div>
    </article>
  );
}

