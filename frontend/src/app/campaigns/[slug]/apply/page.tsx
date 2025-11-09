import Link from "next/link";
import { notFound } from "next/navigation";
import { getCampaignBySlug } from "@/lib/api";
import { StatusBadge } from "@/components/common/StatusBadge";

interface ApplyPageProps {
  params: { slug: string };
}

export default async function ApplyPage({ params }: ApplyPageProps) {
  let campaign;
  try {
    campaign = await getCampaignBySlug(params.slug);
  } catch {
    notFound();
  }

  return (
    <div className="container space-y-8 pb-16">
      <header className="mt-10 space-y-3">
        <StatusBadge status={campaign.status} />
        <h1 className="text-3xl font-semibold text-white">
          Заявка волонтера · {campaign.title}
        </h1>
        <p className="max-w-3xl text-sm text-slate-300">
          Щоб приєднатися до кампанії, увійдіть у систему або створіть акаунт.
          Після підтвердження координатор надішле графік та інструкції.
        </p>
      </header>

      <section className="grid gap-6 rounded-3xl border border-white/10 bg-slate-900/60 p-6 shadow-lg shadow-black/20 md:grid-cols-2">
        <div className="space-y-4">
          <h2 className="text-lg font-semibold text-white">Що для цього потрібно</h2>
          <ul className="space-y-3 text-sm text-slate-300">
            <li>1. Вхід до особистого кабінету.</li>
            <li>2. Заповнена анкетна інформація волонтера.</li>
            <li>3. Підтвердження заявки координатором.</li>
            <li>4. Ознайомлення з планом зміни та правилами безпеки.</li>
          </ul>
        </div>
        <aside className="space-y-4 rounded-2xl border border-white/10 bg-slate-950/70 p-6">
          <h3 className="text-base font-semibold text-white">Швидкі дії</h3>
          <div className="flex flex-col gap-3">
            <Link
              href="/auth/login"
              className="inline-flex items-center justify-center rounded-full bg-brand-500 px-5 py-3 text-sm font-semibold text-white transition hover:bg-brand-400 focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-brand-300 focus-visible:ring-offset-2 focus-visible:ring-offset-slate-950"
            >
              Увійти
            </Link>
            <Link
              href="/auth/register"
              className="inline-flex items-center justify-center rounded-full border border-white/20 px-5 py-3 text-sm font-semibold text-white transition hover:border-white/40 focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-brand-400 focus-visible:ring-offset-2 focus-visible:ring-offset-slate-950"
            >
              Зареєструватися
            </Link>
            <Link
              href={`/campaigns/${campaign.slug}`}
              className="inline-flex items-center justify-center rounded-full border border-transparent px-5 py-3 text-sm font-semibold text-slate-200 transition hover:bg-white/10 focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-brand-400 focus-visible:ring-offset-2 focus-visible:ring-offset-slate-950"
            >
              Назад до кампанії
            </Link>
          </div>
        </aside>
      </section>
    </div>
  );
}


