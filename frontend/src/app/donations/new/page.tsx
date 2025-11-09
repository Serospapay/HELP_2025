import Link from "next/link";
import type { Metadata } from "next";
import { getCampaigns } from "@/lib/api";
import { DonationForm } from "@/components/donations/DonationForm";

interface DonationsPageProps {
  searchParams?: { [key: string]: string | string[] | undefined };
}

export const metadata: Metadata = {
  title: "Зробити пожертву",
  description:
    "Підтримайте волонтерські кампанії через інтегровані платіжні сервіси. Прозорі референси та миттєві оновлення.",
};

export default async function NewDonationPage({ searchParams }: DonationsPageProps) {
  const selectedCampaign = Array.isArray(searchParams?.campaign)
    ? Number(searchParams?.campaign?.[0])
    : Number(searchParams?.campaign ?? 0);

  const campaigns = await getCampaigns({
    status: "published",
  }).catch(() => []);

  const campaignOptions =
    campaigns?.map((campaign) => ({
      id: campaign.id,
      title: campaign.title,
    })) ?? [];

  return (
    <div className="space-y-12 pb-20">
      <section className="border-b border-white/10 bg-slate-900/60 py-12">
        <div className="container space-y-4">
          <p className="text-xs uppercase tracking-wide text-slate-400">
            Пожертви
          </p>
          <h1 className="text-3xl font-semibold text-white md:text-4xl">
            Підтримайте кампанію безпечно та прозоро
          </h1>
          <p className="max-w-2xl text-sm text-slate-300">
            Ми напряму синхронізуємо дані з банками-партнерами, щоб ви могли
            бачити реальний стан зборів та отримувати підтвердження.
          </p>
        </div>
      </section>

      <section className="container grid gap-8 lg:grid-cols-[3fr_2fr]">
        <DonationForm
          campaigns={campaignOptions}
          initialCampaignId={
            campaignOptions.find((item) => item.id === selectedCampaign)?.id ??
            campaignOptions[0]?.id
          }
        />

        <aside className="space-y-4 rounded-3xl border border-white/10 bg-slate-900/60 p-6 shadow-lg shadow-black/20">
          <h2 className="text-lg font-semibold text-white">
            Як ми гарантуємо прозорість
          </h2>
          <ul className="space-y-3 text-sm text-slate-300">
            <li>• Миттєве підтвердження платежу та референс у системі.</li>
            <li>
              • Аналітика зборів доступна координаторам у режимі реального часу.
            </li>
            <li>• Служба підтримки допомагає 24/7 щодо квитанцій та звітів.</li>
          </ul>

          <div className="rounded-2xl border border-white/10 bg-slate-950/70 px-4 py-3 text-sm text-slate-200">
            Потрібно виставити рахунок на юридичну особу чи гуманітарний вантаж?
            Напишіть нам — допоможемо налаштувати.
          </div>

          <Link
            href="/support"
            className="inline-flex items-center rounded-full border border-brand-400 px-5 py-2 text-sm font-semibold text-brand-200 transition hover:bg-brand-500/10 focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-brand-400 focus-visible:ring-offset-2 focus-visible:ring-offset-slate-950"
          >
            Зв&apos;язатися з підтримкою
          </Link>
        </aside>
      </section>
    </div>
  );
}


