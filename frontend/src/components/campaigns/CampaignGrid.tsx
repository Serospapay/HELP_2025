import type { Campaign } from "@/types";
import { CampaignCard } from "./CampaignCard";
import { EmptyState } from "@/components/common/EmptyState";

interface CampaignGridProps {
  campaigns: Campaign[] | null;
  emptyMessage?: string;
}

export function CampaignGrid({
  campaigns,
  emptyMessage = "Кампанії наразі відсутні. Спробуйте змінити фільтри або поверніться пізніше.",
}: CampaignGridProps) {
  if (!campaigns || campaigns.length === 0) {
    return <EmptyState message={emptyMessage} />;
  }

  return (
    <section
      aria-live="polite"
      className="grid gap-6 sm:grid-cols-2 xl:grid-cols-3"
    >
      {campaigns.map((campaign) => (
        <CampaignCard key={campaign.id} campaign={campaign} />
      ))}
    </section>
  );
}


