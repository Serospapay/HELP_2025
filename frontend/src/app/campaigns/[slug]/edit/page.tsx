import { notFound } from "next/navigation";
import type { Metadata } from "next";
import { getCampaignBySlug, getCampaignCategories } from "@/lib/api";
import { CampaignEditForm } from "@/components/campaigns/CampaignEditForm";
import { CampaignEditGuard } from "@/components/campaigns/CampaignEditGuard";
import Link from "next/link";

export const metadata: Metadata = {
  title: "Редагувати кампанію",
  description: "Змініть параметри кампанії.",
};

export default async function EditCampaignPage({
  params,
}: {
  params: { slug: string };
}) {
  let campaign;
  try {
    campaign = await getCampaignBySlug(params.slug);
  } catch {
    notFound();
  }

  const categories = await getCampaignCategories().catch(() => []);

  return (
    <div className="space-y-12 pb-20">
      <section className="border-b border-white/10 bg-slate-900/60 py-12">
        <div className="container space-y-4">
          <Link
            href={`/campaigns/${campaign.slug}`}
            className="text-sm text-slate-400 transition hover:text-brand-300"
          >
            Повернутися до кампанії
          </Link>
          <h1 className="text-3xl font-semibold text-white md:text-4xl">
            Редагувати кампанію
          </h1>
          <p className="max-w-2xl text-sm text-slate-300">
            {campaign.title}
          </p>
        </div>
      </section>

      <section className="container max-w-3xl">
        <CampaignEditGuard campaign={campaign}>
          <CampaignEditForm campaign={campaign} categories={categories} />
        </CampaignEditGuard>
      </section>
    </div>
  );
}
