import { notFound } from "next/navigation";
import type { Metadata } from "next";
import Link from "next/link";
import { getCampaignBySlug } from "@/lib/api";
import { StatusBadge } from "@/components/common/StatusBadge";
import { formatCurrency, formatDate, toNumber } from "@/lib/utils";
import { VolunteerActions } from "@/components/campaigns/VolunteerActions";
import { CoordinatorStageManager } from "@/components/campaigns/CoordinatorStageManager";
import { CoordinatorShiftManager } from "@/components/campaigns/CoordinatorShiftManager";
import { ShiftJoiner } from "@/components/campaigns/ShiftJoiner";

interface CampaignPageProps {
  params: { slug: string };
}

export async function generateMetadata({
  params,
}: CampaignPageProps): Promise<Metadata> {
  try {
    const campaign = await getCampaignBySlug(params.slug);
    return {
      title: campaign.title,
      description: campaign.short_description,
      openGraph: {
        title: campaign.title,
        description: campaign.short_description,
      },
    };
  } catch {
    return {
      title: "Кампанія не знайдена",
    };
  }
}

export default async function CampaignDetailPage({ params }: CampaignPageProps) {
  let campaign;
  try {
    campaign = await getCampaignBySlug(params.slug);
  } catch {
    notFound();
  }

  const target = toNumber(campaign.target_amount);
  const current = toNumber(campaign.current_amount);
  const progress =
    target > 0 ? Math.min(100, Math.round((current / target) * 100)) : null;

  return (
    <article className="space-y-12 pb-20">
      <header className="border-b border-white/10 bg-slate-900/60 py-12">
        <div className="container space-y-6">
          <div className="flex flex-wrap items-center gap-3">
            <StatusBadge status={campaign.status} />
            <span className="rounded-full border border-white/10 px-3 py-1 text-xs text-slate-300">
              {campaign.category?.name ?? "Категорія"}
            </span>
          </div>
          <h1 className="text-3xl font-semibold text-white md:text-4xl">
            {campaign.title}
          </h1>
          <p className="max-w-3xl text-sm text-slate-300 md:text-base">
            {campaign.short_description}
          </p>
          <div className="flex flex-wrap gap-3">
            <Link
              href={`/donations/new?campaign=${campaign.id}`}
              className="inline-flex items-center rounded-full bg-brand-500 px-6 py-3 text-sm font-semibold text-white transition hover:bg-brand-400 focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-brand-300 focus-visible:ring-offset-2 focus-visible:ring-offset-slate-950"
            >
              Підтримати фінансово
            </Link>
            <Link
              href={`/campaigns/${campaign.slug}#volunteer`}
              className="inline-flex items-center rounded-full border border-white/20 px-6 py-3 text-sm font-semibold text-white transition hover:border-white/40 focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-brand-400 focus-visible:ring-offset-2 focus-visible:ring-offset-slate-950"
            >
              Подати заявку волонтера
            </Link>
          </div>
        </div>
      </header>

      <section className="container space-y-10">
        <VolunteerActions
          campaignId={campaign.id}
          campaignSlug={campaign.slug}
          coordinatorId={campaign.coordinator?.id}
        />

        <div className="grid gap-6 md:grid-cols-4">
          <div className="rounded-3xl border border-white/10 bg-slate-900/60 p-6">
            <p className="text-xs uppercase tracking-wide text-slate-400">
              Локація
            </p>
            <p className="mt-2 text-lg font-semibold text-white">
              {campaign.location_name}
            </p>
            {campaign.region && (
              <p className="text-sm text-slate-300">{campaign.region}</p>
            )}
            {campaign.location_address && (
              <p className="mt-2 text-xs text-slate-400">
                {campaign.location_address}
              </p>
            )}
          </div>
          <div className="rounded-3xl border border-white/10 bg-slate-900/60 p-6">
            <p className="text-xs uppercase tracking-wide text-slate-400">
              Період
            </p>
            <p className="mt-2 text-lg font-semibold text-white">
              {formatDate(campaign.start_date)} – {formatDate(campaign.end_date)}
            </p>
            <p className="text-xs text-slate-400">
              Дата оновлення: {formatDate(campaign.updated_at)}
            </p>
          </div>
          <div className="rounded-3xl border border-white/10 bg-slate-900/60 p-6">
            <p className="text-xs uppercase tracking-wide text-slate-400">
              Необхідно волонтерів
            </p>
            <p className="mt-2 text-lg font-semibold text-white">
              {campaign.required_volunteers > 0
                ? `${campaign.required_volunteers}+`
                : "За потреби"}
            </p>
            <p className="text-xs text-slate-400">
              Координатор: {campaign.coordinator?.email}
            </p>
          </div>
          <div className="rounded-3xl border border-white/10 bg-slate-900/60 p-6">
            <p className="text-xs uppercase tracking-wide text-slate-400">
              Фінансова ціль
            </p>
            {target > 0 ? (
              <>
                <p className="mt-2 text-lg font-semibold text-white">
                  {formatCurrency(target)}
                </p>
                <p className="text-xs text-slate-400">
                  Зібрано: {formatCurrency(current)} ({progress}%)
                </p>
                <div className="mt-3 h-2 overflow-hidden rounded-full bg-slate-800">
                  <div
                    className="h-full rounded-full bg-brand-500 transition-all"
                    style={{ width: `${progress}%` }}
                    aria-hidden="true"
                  />
                </div>
              </>
            ) : (
              <p className="mt-2 text-lg font-semibold text-white">
                Матеріальна або сервісна допомога
              </p>
            )}
          </div>
        </div>

        <section aria-labelledby="campaign-description" className="space-y-4">
          <h2
            id="campaign-description"
            className="text-2xl font-semibold text-white"
          >
            Детальний опис
          </h2>
          <div className="prose prose-invert max-w-none text-sm leading-relaxed text-slate-200 prose-headings:text-white prose-a:text-brand-300">
            {campaign.description
              .split("\n")
              .filter(Boolean)
              .map((paragraph, idx) => (
                <p key={idx}>{paragraph}</p>
              ))}
          </div>
        </section>

        <section aria-labelledby="campaign-stages" className="space-y-4">
          <h2 id="campaign-stages" className="text-2xl font-semibold text-white">
            Етапи виконання
          </h2>
          {campaign.stages && campaign.stages.length > 0 ? (
            <ol className="relative space-y-4 border-l border-white/10 pl-6">
              {campaign.stages.map((stage) => (
                <li key={stage.id} className="space-y-1">
                  <span className="absolute -left-[9px] mt-1 size-4 rounded-full border-2 border-slate-900 bg-brand-500" />
                  <p className="flex items-center gap-3 text-base font-semibold text-white">
                    {stage.title}
                    {stage.is_completed && (
                      <span className="rounded-full border border-emerald-400/40 bg-emerald-500/10 px-2 py-1 text-[10px] uppercase tracking-wide text-emerald-200">
                        Виконано
                      </span>
                    )}
                  </p>
                  {stage.description && (
                    <p className="text-sm text-slate-300">{stage.description}</p>
                  )}
                  {stage.due_date && (
                    <p className="text-xs text-slate-400">
                      Очікувана дата: {formatDate(stage.due_date)}
                    </p>
                  )}
                </li>
              ))}
            </ol>
          ) : (
            <p className="text-sm text-slate-300">
              Етапи планування ще не додано. Стежте за оновленнями координатора.
            </p>
          )}
        </section>

        <CoordinatorStageManager
          campaignId={campaign.id}
          coordinatorId={campaign.coordinator?.id}
          initialStages={campaign.stages ?? []}
        />

        <section aria-labelledby="campaign-shifts" className="space-y-4">
          <div className="flex flex-wrap items-center justify-between gap-4">
            <div>
              <h2
                id="campaign-shifts"
                className="text-2xl font-semibold text-white"
              >
                Заплановані зміни
              </h2>
              <p className="text-sm text-slate-300">
                Оберіть зручний слот і подайте заявку волонтера.
              </p>
            </div>
            <Link
              id="volunteer"
              href={`/campaigns/${campaign.slug}/apply`}
              className="inline-flex items-center rounded-full border border-brand-400 px-5 py-2 text-sm font-semibold text-brand-200 transition hover:bg-brand-500/10 focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-brand-400 focus-visible:ring-offset-2 focus-visible:ring-offset-slate-950"
            >
              Стати волонтером
            </Link>
          </div>
          {campaign.shifts && campaign.shifts.length > 0 ? (
            <div className="overflow-hidden rounded-3xl border border-white/10">
              <table className="min-w-full divide-y divide-white/10">
                <thead className="bg-slate-900/60 text-left text-xs uppercase tracking-wide text-slate-400">
                  <tr>
                    <th scope="col" className="px-4 py-3">
                      Зміна
                    </th>
                    <th scope="col" className="px-4 py-3">
                      Час
                    </th>
                    <th scope="col" className="px-4 py-3">
                      Кількість місць
                    </th>
                    <th scope="col" className="px-4 py-3">
                      Статус
                    </th>
                  </tr>
                </thead>
                <tbody className="divide-y divide-white/10 text-sm text-slate-200">
                  {campaign.shifts.map((shift) => (
                    <tr key={shift.id} className="bg-slate-950/60">
                      <td className="px-4 py-3">
                        <p className="font-semibold text-white">{shift.title}</p>
                        {shift.description && (
                          <p className="mt-1 text-xs text-slate-400">
                            {shift.description}
                          </p>
                        )}
                      </td>
                      <td className="px-4 py-3">
                        <p>{formatDate(shift.start_at)}</p>
                        <p className="text-xs text-slate-400">
                          Завершення: {formatDate(shift.end_at)}
                        </p>
                      </td>
                      <td className="px-4 py-3">
                        {shift.occupied_spots ?? 0} / {shift.capacity}
                      </td>
                      <td className="px-4 py-3">
                        <StatusBadge status={shift.status} />
                      </td>
                    </tr>
                  ))}
                </tbody>
              </table>
            </div>
          ) : (
            <p className="text-sm text-slate-300">
              Розклад волонтерських змін узгоджується. Слідкуйте за оновленнями.
            </p>
          )}
        </section>

        <CoordinatorShiftManager
          campaignId={campaign.id}
          coordinatorId={campaign.coordinator?.id}
          initialShifts={campaign.shifts ?? []}
        />

        <ShiftJoiner
          campaignSlug={campaign.slug}
          shifts={campaign.shifts ?? []}
        />

        <section aria-labelledby="campaign-contacts" className="space-y-4">
          <h2
            id="campaign-contacts"
            className="text-2xl font-semibold text-white"
          >
            Контакти координатора
          </h2>
          <div className="grid gap-4 rounded-3xl border border-white/10 bg-slate-900/60 p-6 md:grid-cols-3">
            <div>
              <p className="text-xs uppercase tracking-wide text-slate-400">
                Email
              </p>
              <p className="mt-2 text-sm text-slate-200">
                {campaign.contact_email ?? campaign.coordinator?.email}
              </p>
            </div>
            <div>
              <p className="text-xs uppercase tracking-wide text-slate-400">
                Телефон
              </p>
              <p className="mt-2 text-sm text-slate-200">
                {campaign.contact_phone ?? "Надається після підтвердження заявки"}
              </p>
            </div>
            <div>
              <p className="text-xs uppercase tracking-wide text-slate-400">
                Координатор
              </p>
              <p className="mt-2 text-sm text-slate-200">
                {[
                  campaign.coordinator?.first_name,
                  campaign.coordinator?.last_name,
                ]
                  .filter(Boolean)
                  .join(" ") || campaign.coordinator?.email}
              </p>
            </div>
          </div>
        </section>
      </section>
    </article>
  );
}


