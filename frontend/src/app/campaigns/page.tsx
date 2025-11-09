import Link from "next/link";
import type { Metadata } from "next";
import { getCampaigns } from "@/lib/api";
import { CampaignGrid } from "@/components/campaigns/CampaignGrid";

const STATUS_OPTIONS: { value: string; label: string }[] = [
  { value: "published", label: "Опубліковано" },
  { value: "in_progress", label: "У процесі" },
  { value: "completed", label: "Завершені" },
];

export const metadata: Metadata = {
  title: "Кампанії",
  description:
    "Знайдіть волонтерські кампанії за напрямком, регіоном та статусом. Долучайтесь як волонтер або донор.",
};

interface CampaignsPageProps {
  searchParams?: { [key: string]: string | string[] | undefined };
}

export default async function CampaignsPage({ searchParams }: CampaignsPageProps) {
  const params = {
    search: Array.isArray(searchParams?.search)
      ? searchParams?.search?.[0]
      : searchParams?.search ?? "",
    status: Array.isArray(searchParams?.status)
      ? searchParams?.status?.[0]
      : searchParams?.status ?? "published",
    region: Array.isArray(searchParams?.region)
      ? searchParams?.region?.[0]
      : searchParams?.region ?? "",
  };

  const campaigns = await getCampaigns({
    status: params.status,
    search: params.search,
    region: params.region,
  }).catch(() => null);

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

      <section className="container space-y-8">
        <form
          method="get"
          className="grid gap-4 rounded-3xl border border-white/10 bg-slate-900/60 p-6 shadow-lg shadow-black/20 md:grid-cols-4"
        >
          <label className="md:col-span-2">
            <span className="text-xs font-semibold uppercase tracking-wide text-slate-300">
              Пошук за назвою чи описом
            </span>
            <input
              type="search"
              name="search"
              defaultValue={params.search}
              placeholder="Наприклад, логістика у Львові"
              className="mt-2 w-full rounded-2xl border border-white/10 bg-slate-950 px-4 py-3 text-sm text-slate-100 placeholder:text-slate-500 focus:border-brand-400 focus:outline-none focus:ring-2 focus:ring-brand-400/60"
            />
          </label>
          <label>
            <span className="text-xs font-semibold uppercase tracking-wide text-slate-300">
              Статус
            </span>
            <select
              name="status"
              defaultValue={params.status}
              className="mt-2 w-full rounded-2xl border border-white/10 bg-slate-950 px-4 py-3 text-sm text-slate-100 focus:border-brand-400 focus:outline-none focus:ring-2 focus:ring-brand-400/60"
            >
              {STATUS_OPTIONS.map((option) => (
                <option key={option.value} value={option.value}>
                  {option.label}
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
              defaultValue={params.region}
              placeholder="Область або місто"
              className="mt-2 w-full rounded-2xl border border-white/10 bg-slate-950 px-4 py-3 text-sm text-slate-100 placeholder:text-slate-500 focus:border-brand-400 focus:outline-none focus:ring-2 focus:ring-brand-400/60"
            />
          </label>
          <div className="flex items-end gap-3 md:col-span-4">
            <button
              type="submit"
              className="inline-flex items-center rounded-full bg-brand-500 px-6 py-3 text-sm font-semibold text-white transition hover:bg-brand-400 focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-brand-300 focus-visible:ring-offset-2 focus-visible:ring-offset-slate-950"
            >
              Застосувати фільтри
            </button>
            <Link
              href="/campaigns"
              className="inline-flex items-center rounded-full border border-white/20 px-5 py-3 text-sm font-semibold text-white transition hover:border-white/40 focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-brand-400 focus-visible:ring-offset-2 focus-visible:ring-offset-slate-950"
            >
              Скинути
            </Link>
          </div>
        </form>

        <div className="flex items-center justify-between text-sm text-slate-300">
          <p>
            Знайдено кампаній:{" "}
            <span className="font-semibold text-white">
              {campaigns?.length ?? 0}
            </span>
          </p>
          <p className="text-xs text-slate-400">
            Дані оновлюються в реальному часі за даними координаторів.
          </p>
        </div>

        <CampaignGrid campaigns={campaigns} />
      </section>
    </div>
  );
}


