"use client";

import { useState, type FormEvent } from "react";
import { useRouter } from "next/navigation";
import { cn, formatCurrency, toNumber } from "@/lib/utils";

interface DonationFormProps {
  campaigns: Array<{ id: number; title: string }>;
  initialCampaignId?: number;
}

interface DonationState {
  status: "idle" | "loading" | "success" | "error";
  message?: string;
  reference?: string;
}

export function DonationForm({
  campaigns,
  initialCampaignId,
}: DonationFormProps) {
  const router = useRouter();
  const [state, setState] = useState<DonationState>({ status: "idle" });
  const [amountPreview, setAmountPreview] = useState(() =>
    formatCurrency(0),
  );

  const apiBase =
    process.env.NEXT_PUBLIC_API_URL?.replace(/\/+$/, "") ??
    "http://localhost:8000/api";

  const handleSubmit = async (event: FormEvent<HTMLFormElement>) => {
    event.preventDefault();
    const form = event.currentTarget;
    const formData = new FormData(form);

    const payload = {
      campaign: Number(formData.get("campaign")),
      provider: String(formData.get("provider") || "monobank"),
      amount: Number(formData.get("amount")),
      currency: String(formData.get("currency") || "UAH"),
      payer_email: String(formData.get("payer_email") || ""),
      payer_name: String(formData.get("payer_name") || ""),
      note: String(formData.get("note") || ""),
    };

    if (!payload.campaign || Number.isNaN(payload.campaign)) {
      setState({
        status: "error",
        message: "Оберіть кампанію для пожертви.",
      });
      return;
    }

    if (!payload.amount || Number.isNaN(payload.amount) || payload.amount <= 0) {
      setState({
        status: "error",
        message: "Вкажіть коректну суму пожертви.",
      });
      return;
    }

    setState({ status: "loading" });
    try {
      const response = await fetch(`${apiBase}/v1/donations/`, {
        method: "POST",
        headers: {
          "Content-Type": "application/json",
        },
        body: JSON.stringify(payload),
      });

      if (!response.ok) {
        const error = await response.json().catch(() => ({}));
        throw new Error(error.detail || "Не вдалося створити пожертву.");
      }

      const data = await response.json();
      setState({
        status: "success",
        reference: data.reference,
        message:
          "Дякуємо за вашу підтримку! Ми надішлемо деталі на вказаний email.",
      });
      form.reset();
      setAmountPreview(formatCurrency(0));
      router.refresh();
    } catch (error) {
      setState({
        status: "error",
        message:
          error instanceof Error
            ? error.message
            : "Сталася помилка. Спробуйте пізніше.",
      });
    }
  };

  return (
    <form
      onSubmit={handleSubmit}
      className="space-y-6 rounded-3xl border border-white/10 bg-slate-900/60 p-6 shadow-xl shadow-black/20"
    >
      <div className="grid gap-4 md:grid-cols-2">
        <label className="flex flex-col gap-2 text-sm">
          <span className="text-xs font-semibold uppercase tracking-wide text-slate-300">
            Кампанія
          </span>
          <select
            name="campaign"
            defaultValue={initialCampaignId ?? campaigns[0]?.id}
            className="rounded-2xl border border-white/10 bg-slate-950 px-4 py-3 text-sm text-slate-100 focus:border-brand-400 focus:outline-none focus:ring-2 focus:ring-brand-400/60"
            required
          >
            {campaigns.map((campaign) => (
              <option key={campaign.id} value={campaign.id}>
                {campaign.title}
              </option>
            ))}
          </select>
        </label>
        <label className="flex flex-col gap-2 text-sm">
          <span className="text-xs font-semibold uppercase tracking-wide text-slate-300">
            Сума (UAH)
          </span>
          <input
            type="number"
            name="amount"
            min={50}
            step={10}
            placeholder="500"
            inputMode="decimal"
            className="rounded-2xl border border-white/10 bg-slate-950 px-4 py-3 text-sm text-slate-100 focus:border-brand-400 focus:outline-none focus:ring-2 focus:ring-brand-400/60"
            required
            onChange={(event) => {
              const value = toNumber(event.target.value, 0);
              setAmountPreview(formatCurrency(value));
            }}
          />
        </label>
        <label className="flex flex-col gap-2 text-sm">
          <span className="text-xs font-semibold uppercase tracking-wide text-slate-300">
            Email для квитанції
          </span>
          <input
            type="email"
            name="payer_email"
            placeholder="volunteer@email.com"
            className="rounded-2xl border border-white/10 bg-slate-950 px-4 py-3 text-sm text-slate-100 focus:border-brand-400 focus:outline-none focus:ring-2 focus:ring-brand-400/60"
          />
        </label>
        <label className="flex flex-col gap-2 text-sm">
          <span className="text-xs font-semibold uppercase tracking-wide text-slate-300">
            Ім&apos;я або ініціали
          </span>
          <input
            type="text"
            name="payer_name"
            placeholder="Ім'я, організація або анонімно"
            className="rounded-2xl border border-white/10 bg-slate-950 px-4 py-3 text-sm text-slate-100 focus:border-brand-400 focus:outline-none focus:ring-2 focus:ring-brand-400/60"
          />
        </label>
      </div>

      <label className="flex flex-col gap-2 text-sm">
        <span className="text-xs font-semibold uppercase tracking-wide text-slate-300">
          Коментар (опційно)
        </span>
        <textarea
          name="note"
          rows={4}
          placeholder="Побажання координатору або напрям використання коштів."
          className="rounded-2xl border border-white/10 bg-slate-950 px-4 py-3 text-sm text-slate-100 focus:border-brand-400 focus:outline-none focus:ring-2 focus:ring-brand-400/60"
        />
      </label>

      <label className="flex flex-col gap-2 text-sm">
        <span className="text-xs font-semibold uppercase tracking-wide text-slate-300">
          Платіжний сервіс
        </span>
        <select
          name="provider"
          className="rounded-2xl border border-white/10 bg-slate-950 px-4 py-3 text-sm text-slate-100 focus:border-brand-400 focus:outline-none focus:ring-2 focus:ring-brand-400/60"
          defaultValue="monobank"
        >
          <option value="monobank">Monobank</option>
          <option value="privatbank">PrivatBank</option>
          <option value="manual">Інший спосіб</option>
        </select>
      </label>

      <div className="rounded-2xl border border-brand-400/30 bg-brand-500/10 px-4 py-3 text-sm text-brand-100">
        <p>
          Попередня сума: <strong>{amountPreview}</strong>. Після підтвердження
          платежу ви отримаєте референс та лист-підтвердження.
        </p>
      </div>

      {state.status === "error" && (
        <div
          role="alert"
          className="rounded-2xl border border-rose-400/40 bg-rose-500/10 px-4 py-3 text-sm text-rose-100"
        >
          {state.message}
        </div>
      )}
      {state.status === "success" && (
        <div
          role="status"
          className="rounded-2xl border border-emerald-400/40 bg-emerald-500/10 px-4 py-3 text-sm text-emerald-100"
        >
          {state.message} Референс платежу:{" "}
          <span className="font-mono font-semibold">{state.reference}</span>
        </div>
      )}

      <button
        type="submit"
        className={cn(
          "inline-flex w-full justify-center rounded-full bg-brand-500 px-6 py-3 text-sm font-semibold text-white transition focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-brand-300 focus-visible:ring-offset-2 focus-visible:ring-offset-slate-950 md:w-auto",
          state.status === "loading" && "cursor-wait opacity-70",
        )}
        disabled={state.status === "loading"}
      >
        {state.status === "loading" ? "Опрацьовується..." : "Підтвердити внесок"}
      </button>
    </form>
  );
}

