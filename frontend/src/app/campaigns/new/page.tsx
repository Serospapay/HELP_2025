import type { Metadata } from "next";
import Link from "next/link";
import { getCampaignCategories } from "@/lib/api";
import { CampaignCreateForm } from "@/components/campaigns/CampaignCreateForm";
import { CampaignCreateGuard } from "@/components/campaigns/CampaignCreateGuard";

export const metadata: Metadata = {
  title: "Створити кампанію",
  description: "Додайте нову волонтерську кампанію до платформи.",
};

export default async function NewCampaignPage() {
  const categories = await getCampaignCategories().catch(() => []);

  return (
    <div className="space-y-12 pb-20">
      <section className="border-b border-white/10 bg-slate-900/60 py-12">
        <div className="container space-y-4">
          <Link
            href="/campaigns"
            className="text-sm text-slate-400 transition hover:text-brand-300"
          >
            Повернутися до каталогу
          </Link>
          <p className="text-xs uppercase tracking-wide text-slate-400">
            Координатори
          </p>
          <h1 className="text-3xl font-semibold text-white md:text-4xl">
            Створити нову кампанію
          </h1>
          <p className="max-w-2xl text-sm text-slate-300">
            Заповніть форму нижче. Можете зберегти кампанію як чернетку або
            одразу опублікувати.
          </p>
        </div>
      </section>

      <section className="container max-w-3xl">
        <CampaignCreateGuard>
          <CampaignCreateForm categories={categories} />
        </CampaignCreateGuard>
      </section>
    </div>
  );
}
