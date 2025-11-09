"use client";

import { Provider as JotaiProvider } from "jotai";
import { ReactNode, useEffect } from "react";
import { useHydrateAtoms } from "jotai/utils";
import { bootstrapAuthAtom } from "@/lib/auth";
import { useSetAtom } from "jotai";
import { ToastProvider } from "@/components/common/toast/ToastContext";

interface ProvidersProps {
  children: ReactNode;
}

function Bootstrapper() {
  const bootstrap = useSetAtom(bootstrapAuthAtom);

  useEffect(() => {
    bootstrap();
  }, [bootstrap]);

  return null;
}

export function Providers({ children }: ProvidersProps) {
  useHydrateAtoms([]);

  return (
    <JotaiProvider>
      <ToastProvider>
        <Bootstrapper />
        {children}
      </ToastProvider>
    </JotaiProvider>
  );
}

