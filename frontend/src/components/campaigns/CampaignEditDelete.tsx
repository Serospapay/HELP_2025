"use client";

/**
 * @file: CampaignEditDelete.tsx
 * @description: Кнопки редагування та видалення кампанії для координатора/адміна.
 */

import { useState } from "react";
import { useRouter } from "next/navigation";
import Link from "next/link";
import { useAtomValue } from "jotai";
import { tokensAtom } from "@/lib/auth";
import { updateCampaign, deleteCampaign } from "@/lib/api";
import { useCanEditCampaign } from "@/hooks/useRoles";
import { useToast } from "@/components/common/toast/ToastContext";
import { DeleteConfirmModal } from "@/components/campaigns/DeleteConfirmModal";
import type { Campaign } from "@/types";

interface CampaignEditDeleteProps {
  campaign: Campaign;
}

export function CampaignEditDelete({ campaign }: CampaignEditDeleteProps) {
  const router = useRouter();
  const tokens = useAtomValue(tokensAtom);
  const { addToast } = useToast();
  const canEdit = useCanEditCampaign(campaign.coordinator?.id);

  const [deleteOpen, setDeleteOpen] = useState(false);
  const [deleting, setDeleting] = useState(false);

  const handleDelete = async () => {
    if (!tokens?.access) return;
    setDeleting(true);
    try {
      await deleteCampaign(campaign.slug, tokens);
      addToast({ variant: "success", description: "Кампанію видалено." });
      router.push("/campaigns");
      router.refresh();
    } catch (e) {
      addToast({
        variant: "error",
        description: e instanceof Error ? e.message : "Не вдалося видалити.",
      });
    } finally {
      setDeleting(false);
      setDeleteOpen(false);
    }
  };

  if (!canEdit) return null;

  return (
    <div className="flex flex-wrap gap-3">
      <Link
        href={`/campaigns/${campaign.slug}/edit`}
        className="inline-flex items-center rounded-full border border-white/20 px-5 py-2.5 text-sm font-semibold text-white transition hover:border-white/40 hover:bg-white/5 focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-brand-400 focus-visible:ring-offset-2 focus-visible:ring-offset-slate-950"
      >
        Редагувати кампанію
      </Link>
      <button
        type="button"
        onClick={() => setDeleteOpen(true)}
        className="inline-flex items-center rounded-full border border-red-500/30 px-5 py-2.5 text-sm font-semibold text-red-200 transition hover:border-red-500/50 hover:bg-red-500/10 focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-red-400 focus-visible:ring-offset-2 focus-visible:ring-offset-slate-950"
      >
        Видалити кампанію
      </button>
      <DeleteConfirmModal
        open={deleteOpen}
        onClose={() => setDeleteOpen(false)}
        onConfirm={handleDelete}
        title={`Видалити кампанію «${campaign.title}»?`}
        loading={deleting}
      />
    </div>
  );
}
