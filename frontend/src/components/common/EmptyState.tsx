import Link from "next/link";
import { cn } from "@/lib/utils";

interface EmptyStateProps {
  message: string;
  actionLabel?: string;
  actionHref?: string;
  className?: string;
}

export function EmptyState({
  message,
  actionHref,
  actionLabel = "Створити кампанію",
  className,
}: EmptyStateProps) {
  return (
    <div
      className={cn(
        "flex flex-col items-center justify-center rounded-3xl border border-dashed border-white/20 bg-slate-900/60 px-6 py-16 text-center shadow-inner shadow-black/20",
        className,
      )}
    >
      <svg
        className="size-12 text-brand-400"
        xmlns="http://www.w3.org/2000/svg"
        viewBox="0 0 24 24"
        fill="none"
        stroke="currentColor"
        strokeWidth="1.5"
        strokeLinecap="round"
        strokeLinejoin="round"
        aria-hidden="true"
      >
        <path d="M12 22c4.97 0 9-4.03 9-9S16.97 4 12 4 3 8.03 3 13c0 2.386 1.066 4.53 2.75 6" />
        <path d="M12 8v8" />
        <path d="M8 12h8" />
      </svg>
      <p className="mt-4 max-w-md text-sm text-slate-300">{message}</p>
      {actionHref && (
        <Link
          href={actionHref}
          className="mt-6 inline-flex items-center rounded-full bg-brand-500 px-5 py-2 text-sm font-semibold text-white transition hover:bg-brand-400 focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-brand-300 focus-visible:ring-offset-2 focus-visible:ring-offset-slate-950"
        >
          {actionLabel}
        </Link>
      )}
    </div>
  );
}


