"use client";

import * as AlertDialog from "@radix-ui/react-alert-dialog";
import { ReactNode } from "react";
import { cn } from "@/lib/utils";

interface ConfirmDialogProps {
  trigger: ReactNode;
  title: string;
  description?: string;
  confirmLabel?: string;
  cancelLabel?: string;
  onConfirm: () => Promise<void> | void;
  variant?: "danger" | "default";
  disabled?: boolean;
}

export function ConfirmDialog({
  trigger,
  title,
  description,
  confirmLabel = "Підтвердити",
  cancelLabel = "Скасувати",
  onConfirm,
  variant = "default",
  disabled,
}: ConfirmDialogProps) {
  return (
    <AlertDialog.Root>
      <AlertDialog.Trigger asChild disabled={disabled}>
        {trigger}
      </AlertDialog.Trigger>
      <AlertDialog.Portal>
        <AlertDialog.Overlay className="fixed inset-0 z-[80] bg-slate-950/70 backdrop-blur-sm data-[state=open]:animate-in data-[state=closed]:animate-out data-[state=closed]:fade-out-0 data-[state=open]:fade-in-0" />
        <AlertDialog.Content className="fixed left-1/2 top-1/2 z-[90] w-[calc(100%-2rem)] max-w-md -translate-x-1/2 -translate-y-1/2 rounded-3xl border border-white/10 bg-slate-900/90 p-6 shadow-2xl shadow-black/40 focus:outline-none data-[state=open]:animate-in data-[state=closed]:animate-out data-[state=open]:zoom-in-95 data-[state=closed]:zoom-out-95">
          <AlertDialog.Title className="text-lg font-semibold text-white">
            {title}
          </AlertDialog.Title>
          {description ? (
            <AlertDialog.Description className="mt-2 text-sm text-slate-300">
              {description}
            </AlertDialog.Description>
          ) : null}
          <div className="mt-6 flex flex-col-reverse gap-3 sm:flex-row sm:justify-end">
            <AlertDialog.Cancel asChild>
              <button
                type="button"
                className="inline-flex items-center justify-center rounded-full border border-white/20 px-5 py-2 text-sm font-semibold text-slate-200 transition hover:bg-white/10 focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-white/60 focus-visible:ring-offset-2 focus-visible:ring-offset-slate-950"
              >
                {cancelLabel}
              </button>
            </AlertDialog.Cancel>
            <AlertDialog.Action asChild>
              <button
                type="button"
                onClick={() => {
                  void onConfirm();
                }}
                className={cn(
                  "inline-flex items-center justify-center rounded-full px-5 py-2 text-sm font-semibold text-white transition focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-offset-2 focus-visible:ring-offset-slate-950",
                  variant === "danger"
                    ? "bg-rose-500 hover:bg-rose-400 focus-visible:ring-rose-300"
                    : "bg-brand-500 hover:bg-brand-400 focus-visible:ring-brand-300",
                )}
              >
                {confirmLabel}
              </button>
            </AlertDialog.Action>
          </div>
        </AlertDialog.Content>
      </AlertDialog.Portal>
    </AlertDialog.Root>
  );
}

