"use client";

/**
 * @file: CampaignCreateGuard.tsx
 * @description: Редирект для некоординаторів/неавторизованих на сторінці створення кампанії.
 */

import { useEffect } from "react";
import { useRouter } from "next/navigation";
import { useAtomValue } from "jotai";
import { authStatusAtom, tokensAtom } from "@/lib/auth";
import { useIsCoordinatorOrAdmin } from "@/hooks/useRoles";

export function CampaignCreateGuard({
  children,
}: {
  children: React.ReactNode;
}) {
  const router = useRouter();
  const authStatus = useAtomValue(authStatusAtom);
  const tokens = useAtomValue(tokensAtom);
  const canCreate = useIsCoordinatorOrAdmin();

  useEffect(() => {
    if (authStatus === "idle" || authStatus === "loading") return;
    if (!tokens?.access) {
      router.replace(`/auth/login?from=/campaigns/new`);
      return;
    }
    if (!canCreate) {
      router.replace("/campaigns");
    }
  }, [authStatus, tokens, canCreate, router]);

  if (authStatus === "idle" || authStatus === "loading") {
    return (
      <div className="rounded-3xl border border-white/10 bg-slate-900/60 p-12 text-center text-slate-300">
        Завантаження...
      </div>
    );
  }

  if (!tokens?.access || !canCreate) {
    return null;
  }

  return <>{children}</>;
}
