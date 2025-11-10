import type { HTMLAttributes } from "react";
import { cn } from "@/lib/utils";

type StatusVariant =
  | "draft"
  | "published"
  | "in_progress"
  | "completed"
  | "cancelled"
  | "open"
  | "full"
  | "volunteer"
  | "coordinator"
  | "beneficiary"
  | "admin"
  | "pending"
  | "approved"
  | "declined"
  | "withdrawn";

interface StatusBadgeProps extends HTMLAttributes<HTMLSpanElement> {
  status: StatusVariant;
  className?: string;
  labelOverride?: string;
}

const STATUS_CONFIG: Record<
  StatusVariant,
  { label: string; className: string }
> = {
  draft: { label: "Чернетка", className: "bg-slate-700 text-slate-100" },
  published: { label: "Опубліковано", className: "bg-brand-500 text-white" },
  in_progress: {
    label: "У процесі",
    className: "bg-amber-500/20 text-amber-200 border border-amber-500/40",
  },
  completed: {
    label: "Завершено",
    className: "bg-emerald-500/20 text-emerald-200 border border-emerald-500/40",
  },
  cancelled: {
    label: "Скасовано",
    className: "bg-rose-500/20 text-rose-200 border border-rose-500/40",
  },
  open: {
    label: "Набір триває",
    className: "bg-emerald-500 text-emerald-50",
  },
  full: {
    label: "Набір завершено",
    className: "bg-slate-700 text-slate-100",
  },
  volunteer: {
    label: "Волонтер",
    className: "bg-brand-500/20 text-brand-200 border border-brand-400/50",
  },
  coordinator: {
    label: "Координатор",
    className: "bg-emerald-500/20 text-emerald-200 border border-emerald-400/40",
  },
  beneficiary: {
    label: "Отримувач допомоги",
    className: "bg-amber-500/20 text-amber-100 border border-amber-400/40",
  },
  admin: {
    label: "Адміністратор",
    className: "bg-rose-500/20 text-rose-100 border border-rose-400/40",
  },
  pending: {
    label: "Очікує підтвердження",
    className: "bg-amber-500/20 text-amber-100 border border-amber-400/40",
  },
  approved: {
    label: "Підтверджено",
    className: "bg-emerald-500/20 text-emerald-100 border border-emerald-400/40",
  },
  declined: {
    label: "Відхилено",
    className: "bg-rose-500/20 text-rose-100 border border-rose-400/40",
  },
  withdrawn: {
    label: "Скасовано волонтером",
    className: "bg-slate-700 text-slate-100",
  },
};

export function StatusBadge({
  status,
  className,
  labelOverride,
  ...props
}: StatusBadgeProps) {
  const config =
    STATUS_CONFIG[status] ??
    STATUS_CONFIG.draft ?? { label: status, className: "bg-slate-700" };

  return (
    <span
      {...props}
      className={cn(
        "inline-flex items-center rounded-full px-3 py-1 text-xs font-semibold uppercase tracking-wide",
        config.className,
        className,
      )}
    >
      {labelOverride ?? config.label}
    </span>
  );
}


