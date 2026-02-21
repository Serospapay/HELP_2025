"use client";

import { useEffect } from "react";
import { useRouter } from "next/navigation";
import { useAtomValue } from "jotai";
import { authStatusAtom, tokensAtom } from "@/lib/auth";
import { useCanEditCampaign } from "@/hooks/useRoles";
import type { Campaign } from "@/types";

export function CampaignEditGuard({
  campaign,
  children,
}: {
  campaign: Campaign;
  children: React.ReactNode;
}) {
  const router = useRouter();
  const authStatus = useAtomValue(authStatusAtom);
  const tokens = useAtomValue(tokensAtom);
  const canEdit = useCanEditCampaign(campaign.coordinator?.id);

  useEffect(() => {
    if (authStatus === "idle" || authStatus === "loading") return;
    if (!tokens?.access) {
      router.replace(`/auth/login?from=/campaigns/${campaign.slug}/edit`);
      return;
    }
    if (!canEdit) {
      router.replace(`/campaigns/${campaign.slug}`);
    }
  }, [authStatus, tokens, canEdit, campaign.slug, router]);

  if (authStatus === "idle" || authStatus === "loading") {
    return (
      <div className="rounded-3xl border border-white/10 bg-slate-900/60 p-12 text-center text-slate-300">
        Завантаження...
      </div>
    );
  }

  if (!tokens?.access || !canEdit) return null;

  return <>{children}</>;
}
