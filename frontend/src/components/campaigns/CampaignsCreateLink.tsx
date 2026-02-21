"use client";

import Link from "next/link";
import { useAtomValue } from "jotai";
import { authStatusAtom } from "@/lib/auth";
import { useIsCoordinatorOrAdmin } from "@/hooks/useRoles";

export function CampaignsCreateLink() {
  const authStatus = useAtomValue(authStatusAtom);
  const canCreate = useIsCoordinatorOrAdmin();

  if (authStatus !== "authenticated" || !canCreate) return null;

  return (
    <Link
      href="/campaigns/new"
      className="inline-flex items-center rounded-full bg-brand-500 px-5 py-2.5 text-sm font-semibold text-white transition hover:bg-brand-400 focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-brand-400 focus-visible:ring-offset-2 focus-visible:ring-offset-slate-950"
    >
      Створити кампанію
    </Link>
  );
}
