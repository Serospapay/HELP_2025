"use client";

import { Provider as JotaiProvider } from "jotai";
import { ReactNode, useEffect } from "react";
import { useHydrateAtoms } from "jotai/utils";
import { bootstrapAuthAtom, tokensAtom } from "@/lib/auth";
import { useSetAtom } from "jotai";
import { ToastProvider } from "@/components/common/toast/ToastContext";
import { registerTokenUpdater } from "@/lib/api";

interface ProvidersProps {
  children: ReactNode;
}

function Bootstrapper() {
  const bootstrap = useSetAtom(bootstrapAuthAtom);
  const setTokens = useSetAtom(tokensAtom);

  useEffect(() => {
    registerTokenUpdater((tokens) => setTokens(tokens));
    bootstrap();
    return () => registerTokenUpdater(null);
  }, [bootstrap, setTokens]);

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

