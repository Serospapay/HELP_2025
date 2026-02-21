"use client";

import { useEffect } from "react";
import Link from "next/link";

interface ErrorProps {
  error: Error & { digest?: string };
  reset: () => void;
}

export default function Error({ error, reset }: ErrorProps) {
  useEffect(() => {
    console.error("Application error:", error);
  }, [error]);

  return (
    <div className="container flex min-h-[60vh] flex-col items-center justify-center gap-6 py-16">
      <div className="max-w-md space-y-4 text-center">
        <h1 className="text-2xl font-semibold text-white">
          Щось пішло не так
        </h1>
        <p className="text-sm text-slate-300">
          {error.message || "Сталася неочікувана помилка. Спробуйте оновити сторінку або повернутися на головну."}
        </p>
      </div>
      <div className="flex flex-wrap items-center justify-center gap-3">
        <button
          type="button"
          onClick={() => reset()}
          className="rounded-full bg-brand-500 px-6 py-2.5 text-sm font-semibold text-white transition hover:bg-brand-400 focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-brand-300 focus-visible:ring-offset-2 focus-visible:ring-offset-slate-950"
        >
          Спробувати знову
        </button>
        <Link
          href="/"
          className="rounded-full border border-white/20 px-6 py-2.5 text-sm font-semibold text-slate-100 transition hover:bg-white/10 focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-brand-400 focus-visible:ring-offset-2 focus-visible:ring-offset-slate-950"
        >
          На головну
        </Link>
      </div>
    </div>
  );
}
