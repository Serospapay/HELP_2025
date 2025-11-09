import Link from "next/link";
import { getCampaigns } from "@/lib/api";
import { CampaignGrid } from "@/components/campaigns/CampaignGrid";

export default async function Home() {
  const campaigns = await getCampaigns({ status: "published" }).catch(() => null);
  const featuredCampaigns = campaigns
    ? campaigns.slice(0, Math.min(3, campaigns.length))
    : null;

  return (
    <div className="space-y-16 pb-20">
      <section className="relative overflow-hidden border-b border-white/10 bg-gradient-to-br from-slate-900 via-slate-950 to-slate-900 py-16">
        <div className="absolute inset-0 -z-10 opacity-40">
          <div className="mx-auto size-[600px] rounded-full bg-brand-500 blur-3xl md:size-[800px]" />
        </div>
        <div className="container flex flex-col gap-12 md:flex-row md:items-center">
          <div className="max-w-2xl space-y-6">
            <p className="inline-flex items-center rounded-full border border-white/20 bg-slate-900/60 px-3 py-1 text-xs font-semibold uppercase tracking-wide text-slate-200">
              Платформа волонтерської взаємодії
            </p>
            <h1 className="text-3xl font-semibold text-white sm:text-4xl lg:text-5xl">
              Допомагаємо координувати волонтерів, донорів і отримувачів
              допомоги в один клік
            </h1>
            <p className="text-base text-slate-300 md:text-lg">
              Створюйте кампанії, керуйте змінами, завершуйте заявки на допомогу
              та відстежуйте пожертви в реальному часі. Прозоро, безпечно та з
              фокусом на impact.
            </p>
            <div className="flex flex-wrap gap-3">
              <Link
                href="/campaigns"
                className="inline-flex items-center rounded-full bg-white px-6 py-3 text-sm font-semibold text-slate-900 transition hover:bg-slate-200 focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-brand-400 focus-visible:ring-offset-2 focus-visible:ring-offset-slate-950"
              >
                Переглянути активні кампанії
              </Link>
              <Link
                href="/donations/new"
                className="inline-flex items-center rounded-full border border-brand-400 px-6 py-3 text-sm font-semibold text-brand-200 transition hover:bg-brand-500/10 focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-brand-400 focus-visible:ring-offset-2 focus-visible:ring-offset-slate-950"
              >
                Зробити пожертву
              </Link>
            </div>
          </div>
          <div className="relative grid w-full gap-4 rounded-3xl border border-white/10 bg-slate-900/80 p-6 shadow-xl shadow-black/30 md:max-w-sm">
            <p className="text-sm font-semibold text-slate-200">
              Миттєві метрики
            </p>
            <dl className="grid gap-4 text-sm text-slate-300">
              <div>
                <dt className="text-xs uppercase tracking-wide text-slate-400">
                  Активні кампанії
                </dt>
                <dd className="mt-1 text-2xl font-semibold text-white">
                  {campaigns?.length ?? 0}
                </dd>
              </div>
              <div>
                <dt className="text-xs uppercase tracking-wide text-slate-400">
                  Підтверджені волонтери
                </dt>
                <dd className="mt-1 text-2xl font-semibold text-white">1200+</dd>
              </div>
              <div>
                <dt className="text-xs uppercase tracking-wide text-slate-400">
                  Допомогли сім&apos;ям у 2025
                </dt>
                <dd className="mt-1 text-2xl font-semibold text-white">874</dd>
              </div>
            </dl>
          </div>
        </div>
      </section>

      <section className="container space-y-6">
        <div className="flex flex-col items-start justify-between gap-4 md:flex-row md:items-center">
          <div>
            <h2 className="text-2xl font-semibold text-white md:text-3xl">
              Найактуальніші кампанії
            </h2>
            <p className="mt-2 text-sm text-slate-300">
              Підтримайте одну з перевірених ініціатив вже сьогодні або
              долучіться як волонтер.
            </p>
          </div>
          <Link
            href="/campaigns"
            className="inline-flex items-center rounded-full border border-white/20 px-4 py-2 text-sm font-semibold text-white transition hover:border-white/40 focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-brand-400 focus-visible:ring-offset-2 focus-visible:ring-offset-slate-950"
          >
            Переглянути всі
          </Link>
        </div>
        <CampaignGrid campaigns={featuredCampaigns} />
      </section>

      <section className="border-y border-white/10 bg-slate-900/60 py-16">
        <div className="container grid gap-10 md:grid-cols-3">
          <div className="md:col-span-1">
            <h2 className="text-2xl font-semibold text-white">
              Як це працює
            </h2>
            <p className="mt-2 text-sm text-slate-300">
              Три кроки, щоб організувати допомогу ефективно.
            </p>
          </div>
          <ol className="md:col-span-2 space-y-6">
            <li className="flex gap-4 rounded-3xl border border-white/10 bg-slate-950/80 p-6 shadow-sm shadow-black/30">
              <span className="flex size-10 items-center justify-center rounded-full bg-brand-500 font-semibold text-white">
                1
              </span>
              <div>
                <h3 className="text-lg font-semibold text-white">
                  Створіть або знайдіть кампанію
                </h3>
                <p className="mt-2 text-sm text-slate-300">
                  Координатори формують потреби, локації та графік. Волонтери й
                  донори бачать весь контекст на одній сторінці.
                </p>
              </div>
            </li>
            <li className="flex gap-4 rounded-3xl border border-white/10 bg-slate-950/80 p-6 shadow-sm shadow-black/30">
              <span className="flex size-10 items-center justify-center rounded-full bg-brand-500 font-semibold text-white">
                2
              </span>
              <div>
                <h3 className="text-lg font-semibold text-white">
                  Залучіть волонтерів та пожертви
                </h3>
                <p className="mt-2 text-sm text-slate-300">
                  Плануйте зміни, ведіть комунікацію та приймайте платежі через
                  захищені інтеграції банків.
                </p>
              </div>
            </li>
            <li className="flex gap-4 rounded-3xl border border-white/10 bg-slate-950/80 p-6 shadow-sm shadow-black/30">
              <span className="flex size-10 items-center justify-center rounded-full bg-brand-500 font-semibold text-white">
                3
              </span>
              <div>
                <h3 className="text-lg font-semibold text-white">
                  Звітуйте та масштабуйте
                </h3>
                <p className="mt-2 text-sm text-slate-300">
                  Автоматичні звіти, відгуки отримувачів та аналітика для
                  команд, що розвиваються.
                </p>
              </div>
            </li>
          </ol>
        </div>
      </section>

      <section className="container space-y-10">
        <div className="max-w-2xl">
          <h2 className="text-2xl font-semibold text-white md:text-3xl">
            Питання та підтримка
          </h2>
          <p className="mt-2 text-sm text-slate-300">
            Команда супроводу доступна щоденно. Обирайте зручний спосіб
            зв&apos;язку чи перегляньте відповіді на популярні питання.
          </p>
        </div>
        <div className="grid gap-6 md:grid-cols-3">
          <div className="rounded-3xl border border-white/10 bg-slate-900/60 p-6 shadow-sm shadow-black/20">
            <h3 className="text-lg font-semibold text-white">Чат підтримки</h3>
            <p className="mt-2 text-sm text-slate-300">
              Оперативні консультації для координаторів та волонтерів.
            </p>
            <Link
              href="/support"
              className="mt-4 inline-flex items-center text-sm font-semibold text-brand-300 transition hover:text-brand-200 focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-brand-400 focus-visible:ring-offset-2 focus-visible:ring-offset-slate-950"
            >
              Перейти до центру підтримки →
            </Link>
          </div>
          <div className="rounded-3xl border border-white/10 bg-slate-900/60 p-6 shadow-sm shadow-black/20">
            <h3 className="text-lg font-semibold text-white">
              Бібліотека знань
            </h3>
            <p className="mt-2 text-sm text-slate-300">
              Інструкції з безпеки, шаблони звітів, поради з логістики.
            </p>
            <Link
              href="/resources"
              className="mt-4 inline-flex items-center text-sm font-semibold text-brand-300 transition hover:text-brand-200 focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-brand-400 focus-visible:ring-offset-2 focus-visible:ring-offset-slate-950"
            >
              Відкрити бібліотеку →
            </Link>
          </div>
          <div className="rounded-3xl border border-white/10 bg-slate-900/60 p-6 shadow-sm shadow-black/20">
            <h3 className="text-lg font-semibold text-white">
              Навчальні сесії
            </h3>
            <p className="mt-2 text-sm text-slate-300">
              Регулярні воркшопи з управління волонтерами та кризового реагування.
            </p>
            <Link
              href="/events"
              className="mt-4 inline-flex items-center text-sm font-semibold text-brand-300 transition hover:text-brand-200 focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-brand-400 focus-visible:ring-offset-2 focus-visible:ring-offset-slate-950"
            >
              Запланувати участь →
            </Link>
          </div>
        </div>
      </section>
    </div>
  );
}
