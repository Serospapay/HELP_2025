import Link from "next/link";
import type { Metadata } from "next";
import { RegisterForm } from "@/components/auth/RegisterForm";

export const metadata: Metadata = {
  title: "Реєстрація",
  description:
    "Створіть обліковий запис волонтера, координатора або отримувача допомоги, щоб працювати в єдиній платформі.",
};

export default function RegisterPage() {
  return (
    <div className="container my-16 max-w-4xl space-y-10">
      <header className="space-y-4 text-center">
        <h1 className="text-3xl font-semibold text-white md:text-4xl">
          Долучайтесь до волонтерської платформи
        </h1>
        <p className="text-sm text-slate-300 md:text-base">
          Оберіть роль, заповніть основну інформацію та підтвердіть акаунт, щоб
          отримати доступ до інструментів координації.
        </p>
      </header>
      <div className="rounded-3xl border border-white/10 bg-slate-900/60 p-6 shadow-xl shadow-black/20">
        <RegisterForm />
      </div>
      <p className="text-center text-sm text-slate-300">
        Уже маєте акаунт?{" "}
        <Link
          href="/auth/login"
          className="font-semibold text-brand-200 underline-offset-4 transition hover:text-brand-100 hover:underline focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-brand-300 focus-visible:ring-offset-2 focus-visible:ring-offset-slate-950"
        >
          Увійти
        </Link>
      </p>
    </div>
  );
}

