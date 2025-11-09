import { CampaignCardSkeleton } from "@/components/campaigns/CampaignCardSkeleton";

const PLACEHOLDER_COUNT = 6;

export default function CampaignsLoadingPage() {
  return (
    <div className="space-y-12 pb-16">
      <section className="border-b border-white/10 bg-slate-900/60 py-12">
        <div className="container space-y-4">
          <p className="text-xs uppercase tracking-wide text-slate-400">
            Каталог кампаній
          </p>
          <h1 className="text-3xl font-semibold text-white md:text-4xl">
            Допоможіть там, де зараз найбільше потребують
          </h1>
          <p className="max-w-2xl text-sm text-slate-300">
            Фільтруйте активні ініціативи за напрямками, регіонами та статусом.
            Подавайте заявку як волонтер або підтримуйте фінансово.
          </p>
        </div>
      </section>

      <section
        className="container space-y-8"
        aria-busy="true"
        aria-live="polite"
        role="status"
      >
        <div className="grid gap-4 rounded-3xl border border-white/10 bg-slate-900/60 p-6 shadow-lg shadow-black/20 md:grid-cols-4">
          <div className="space-y-2 md:col-span-2">
            <span className="text-xs font-semibold uppercase tracking-wide text-slate-400">
              Пошук за назвою чи описом
            </span>
            <span className="block h-12 w-full rounded-2xl bg-slate-800 animate-pulse" />
          </div>
          <div className="space-y-2">
            <span className="text-xs font-semibold uppercase tracking-wide text-slate-400">
              Статус
            </span>
            <span className="block h-12 w-full rounded-2xl bg-slate-800 animate-pulse" />
          </div>
          <div className="space-y-2">
            <span className="text-xs font-semibold uppercase tracking-wide text-slate-400">
              Регіон
            </span>
            <span className="block h-12 w-full rounded-2xl bg-slate-800 animate-pulse" />
          </div>
          <div className="flex flex-wrap items-end gap-3 md:col-span-4">
            <span className="inline-flex h-12 w-40 rounded-full bg-slate-800 animate-pulse" />
            <span className="inline-flex h-12 w-28 rounded-full bg-slate-800 animate-pulse" />
          </div>
        </div>

        <div className="flex items-center justify-between text-sm text-slate-300">
          <span className="flex items-center gap-2">
            Знайдено кампаній:
            <span className="h-4 w-10 rounded-full bg-slate-800 animate-pulse" />
          </span>
          <span className="h-4 w-40 rounded-full bg-slate-800 animate-pulse" />
        </div>

        <section className="grid gap-6 sm:grid-cols-2 xl:grid-cols-3">
          {Array.from({ length: PLACEHOLDER_COUNT }).map((_, index) => (
            <CampaignCardSkeleton key={index} />
          ))}
        </section>
      </section>
    </div>
  );
}

