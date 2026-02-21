import type { Metadata } from "next";
import { getCampaigns, getCampaignCategories } from "@/lib/api";
import { CampaignGrid } from "@/components/campaigns/CampaignGrid";
import { CampaignFilters } from "@/components/campaigns/CampaignFilters";
import { CampaignsCreateLink } from "@/components/campaigns/CampaignsCreateLink";

function getParam(
  sp: { [key: string]: string | string[] | undefined } | undefined,
  key: string,
): string {
  const v = sp?.[key];
  return Array.isArray(v) ? (v[0] ?? "") : (v ?? "");
}

export const metadata: Metadata = {
  title: "Кампанії",
  description:
    "Знайдіть волонтерські кампанії за напрямком, регіоном та статусом. Долучайтесь як волонтер або донор.",
};

export default async function CampaignsPage({
  searchParams,
}: {
  searchParams?: { [key: string]: string | string[] | undefined };
}) {
  const params = {
    search: getParam(searchParams, "search"),
    status: getParam(searchParams, "status") || "published",
    region: getParam(searchParams, "region"),
    category: getParam(searchParams, "category"),
    coordinator: getParam(searchParams, "coordinator"),
    has_funding: getParam(searchParams, "has_funding"),
  };

  const [campaigns, categories] = await Promise.all([
    getCampaigns({
      status: params.status,
      search: params.search || undefined,
      region: params.region || undefined,
      category: params.category || undefined,
      coordinator: params.coordinator || undefined,
      has_funding: params.has_funding || undefined,
    }).catch(() => null),
    getCampaignCategories().catch(() => []),
  ]);

  return (
    <div className="space-y-12 pb-16">
      <section className="relative border-b border-white/10 bg-slate-900/40 py-12">
        <div className="absolute inset-0 bg-gradient-to-b from-white/5 via-transparent to-transparent" aria-hidden="true" />
        <div className="container relative flex flex-wrap items-end justify-between gap-4">
          <div className="space-y-4">
            <p className="text-xs uppercase tracking-wide text-slate-300">
              Каталог кампаній
            </p>
            <h1 className="text-3xl font-semibold text-white md:text-4xl">
              Допоможіть там, де зараз найбільше потребують
            </h1>
            <p className="max-w-2xl text-sm text-slate-200/90">
              Фільтруйте активні ініціативи за напрямками, регіонами та статусом.
              Подавайте заявку як волонтер або підтримуйте фінансово.
            </p>
          </div>
          <CampaignsCreateLink />
        </div>
      </section>

      <section className="container space-y-8">
        <CampaignFilters categories={categories} currentParams={params} />

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


