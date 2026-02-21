"use client";

import Link from "next/link";

export function BeneficiaryHelpSection() {
  return (
    <section className="space-y-4 rounded-3xl border border-amber-500/20 bg-amber-500/5 p-6 shadow-lg">
      <header className="space-y-1">
        <h2 className="text-lg font-semibold text-white">
          Як отримати допомогу
        </h2>
        <p className="text-sm text-slate-300">
          Перегляньте кампанії, що надають гуманітарну та матеріальну допомогу.
          Зв&apos;яжіться з координаторами для отримання підтримки.
        </p>
      </header>
      <div className="flex flex-wrap gap-3">
        <Link
          href="/campaigns"
          className="inline-flex items-center rounded-full bg-amber-500/20 px-6 py-2.5 text-sm font-semibold text-amber-100 transition hover:bg-amber-500/30 focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-amber-400 focus-visible:ring-offset-2 focus-visible:ring-offset-slate-950"
        >
          Переглянути кампанії →
        </Link>
        <Link
          href="/support"
          className="inline-flex items-center rounded-full border border-white/20 px-6 py-2.5 text-sm font-semibold text-slate-100 transition hover:bg-white/10 focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-brand-400 focus-visible:ring-offset-2 focus-visible:ring-offset-slate-950"
        >
          Центр підтримки
        </Link>
      </div>
    </section>
  );
}
