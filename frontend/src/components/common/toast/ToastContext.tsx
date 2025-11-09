"use client";

import * as React from "react";
import * as ToastPrimitive from "@radix-ui/react-toast";
import { cn } from "@/lib/utils";

type ToastVariant = "default" | "success" | "error";

interface Toast {
  id: number;
  title?: string;
  description?: string;
  variant?: ToastVariant;
  duration?: number;
}

type ToastContextValue = {
  addToast: (toast: Omit<Toast, "id">) => void;
};

const ToastContext = React.createContext<ToastContextValue | undefined>(
  undefined,
);

const variantStyles: Record<ToastVariant, string> = {
  default: "bg-slate-900/90 text-slate-50 border border-white/10",
  success: "bg-emerald-500/90 text-emerald-50 border border-emerald-400/40",
  error: "bg-rose-500/90 text-rose-50 border border-rose-400/40",
};

export function ToastProvider({ children }: { children: React.ReactNode }) {
  const [openToasts, setOpenToasts] = React.useState<Toast[]>([]);

  const addToast = React.useCallback(
    (toast: Omit<Toast, "id">) => {
      setOpenToasts((prev) => [
        ...prev,
        {
          id: Date.now(),
          duration: 4000,
          variant: "default",
          ...toast,
        },
      ]);
    },
    [setOpenToasts],
  );

  const removeToast = React.useCallback(
    (id: number) => {
      setOpenToasts((prev) => prev.filter((toast) => toast.id !== id));
    },
    [setOpenToasts],
  );

  return (
    <ToastContext.Provider value={{ addToast }}>
      <ToastPrimitive.Provider swipeDirection="right">
        {children}
        <ToastPrimitive.Viewport className="fixed bottom-4 right-4 z-[100] flex max-h-screen w-96 flex-col gap-3" />
        {openToasts.map((toast) => (
          <ToastPrimitive.Root
            key={toast.id}
            duration={toast.duration}
            onOpenChange={(open) => {
              if (!open) removeToast(toast.id);
            }}
            className={cn(
              "flex w-full flex-col gap-1 rounded-2xl px-4 py-3 text-sm shadow-xl shadow-black/30 focus:outline-none focus-visible:ring-2 focus-visible:ring-white/60",
              variantStyles[toast.variant ?? "default"],
            )}
          >
            {toast.title ? (
              <ToastPrimitive.Title className="font-semibold">
                {toast.title}
              </ToastPrimitive.Title>
            ) : null}
            {toast.description ? (
              <ToastPrimitive.Description>{toast.description}</ToastPrimitive.Description>
            ) : null}
          </ToastPrimitive.Root>
        ))}
      </ToastPrimitive.Provider>
    </ToastContext.Provider>
  );
}

export function useToast() {
  const context = React.useContext(ToastContext);
  if (!context) {
    throw new Error("useToast must be used within a ToastProvider");
  }
  return context;
}

