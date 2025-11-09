import { cache } from "react";
import type {
  Campaign,
  DonationPayload,
  DonationResponse,
} from "@/types";

const API_BASE =
  process.env.NEXT_PUBLIC_API_URL?.replace(/\/+$/, "") ??
  "http://localhost:8000/api";

type FetchOptions = RequestInit & {
  query?: Record<string, string | number | boolean | undefined>;
  nextOptions?: { revalidate?: number } | undefined;
};

function buildURL(path: string, query?: FetchOptions["query"]) {
  const url = new URL(`${API_BASE}${path.startsWith("/") ? path : `/${path}`}`);
  if (query) {
    Object.entries(query).forEach(([key, value]) => {
      if (value === undefined || value === null || value === "") return;
      url.searchParams.set(key, String(value));
    });
  }
  return url;
}

async function fetchJson<T>(path: string, options: FetchOptions = {}) {
  const { query, nextOptions, headers, ...rest } = options;
  const url = buildURL(path, query);

  const response = await fetch(url, {
    headers: {
      "Content-Type": "application/json",
      ...headers,
    },
    cache: "no-store",
    ...rest,
    next: nextOptions,
  });

  if (!response.ok) {
    const errorText = await response.text();
    throw new Error(
      `API ${response.status} ${response.statusText}: ${errorText || "Unknown error"}`,
    );
  }

  return (await response.json()) as T;
}

export const getCampaigns = cache(
  async (params: FetchOptions["query"] = {}): Promise<Campaign[]> => {
    return fetchJson<Campaign[]>("/v1/campaigns/", {
      query: params,
    });
  },
);

export const getCampaignBySlug = cache(
  async (slug: string): Promise<Campaign> => {
    return fetchJson<Campaign>(`/v1/campaigns/${slug}/`);
  },
);

export async function submitDonation(
  payload: DonationPayload,
): Promise<DonationResponse> {
  return fetchJson<DonationResponse>("/v1/donations/", {
    method: "POST",
    body: JSON.stringify(payload),
  });
}


