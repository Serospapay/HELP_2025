/**
 * @file: api.ts
 * @description: Єдиний API-клієнт для Next.js (SSR-кеш) та клієнтських запитів з підтримкою refresh токенів.
 * @dependencies: react cache (SSR), tokensAtom setter (refresh)
 */

import { cache } from "react";
import type {
  Campaign,
  CampaignCreateInput,
  CampaignShift,
  CampaignShiftInput,
  CampaignStage,
  CampaignStageInput,
  CampaignUpdateInput,
  Category,
  DonationPayload,
  DonationResponse,
  ShiftAssignmentSummary,
  Tokens,
  User,
  VolunteerApplication,
} from "@/types";

const API_BASE =
  process.env.NEXT_PUBLIC_API_URL?.replace(/\/+$/, "") ??
  "http://localhost:8000/api";

export type RequestOptions = RequestInit & {
  tokens?: Tokens | null;
  query?: Record<string, string | number | boolean | undefined>;
  nextOptions?: { revalidate?: number } | undefined;
  _skipRefresh?: boolean;
};

let tokenUpdater: ((tokens: Tokens) => void) | null = null;

export function registerTokenUpdater(updater: ((tokens: Tokens) => void) | null) {
  tokenUpdater = updater;
}

function buildURL(path: string, query?: RequestOptions["query"]) {
  const url = new URL(`${API_BASE}${path.startsWith("/") ? path : `/${path}`}`);
  if (query) {
    Object.entries(query).forEach(([key, value]) => {
      if (value === undefined || value === null || value === "") return;
      url.searchParams.set(key, String(value));
    });
  }
  return url;
}

async function parseErrorResponse(response: Response): Promise<string> {
  const text = await response.text();
  try {
    const json = JSON.parse(text);
    return json.detail ?? JSON.stringify(json);
  } catch {
    return text || `${response.status} ${response.statusText}`;
  }
}

export interface PaginatedResponse<T> {
  count: number;
  next: string | null;
  previous: string | null;
  results: T[];
}

function unwrapPaginated<T>(data: T[] | PaginatedResponse<T>): T[] {
  return Array.isArray(data) ? data : (data as PaginatedResponse<T>).results;
}

export async function apiRequest<T>(
  path: string,
  options: RequestOptions = {},
): Promise<T> {
  const { tokens, query, nextOptions, headers, _skipRefresh, ...rest } = options;

  const url = buildURL(path, query);

  const init: RequestInit & { next?: { revalidate?: number | false } } = {
    headers: {
      "Content-Type": "application/json",
      ...(tokens?.access ? { Authorization: `Bearer ${tokens.access}` } : {}),
      ...headers,
    },
    ...rest,
  };

  if (nextOptions) {
    init.next = nextOptions;
  } else if (typeof (init as RequestInit).cache === "undefined") {
    init.cache = "no-store";
  }

  const response = await fetch(url.toString(), init);

  if (response.status === 401 && tokens?.refresh && !_skipRefresh) {
    try {
      const refreshed = await apiRequest<{ access: string }>(
        "/v1/auth/refresh/",
        {
          method: "POST",
          body: JSON.stringify({ refresh: tokens.refresh }),
          _skipRefresh: true,
        },
      );
      const newTokens: Tokens = {
        access: refreshed.access,
        refresh: tokens.refresh,
      };
      tokenUpdater?.(newTokens);
      return apiRequest<T>(path, {
        ...options,
        tokens: newTokens,
        _skipRefresh: true,
      });
    } catch {
      throw new Error("Сесію закінчено. Увійдіть знову.");
    }
  }

  if (!response.ok) {
    const detail = await parseErrorResponse(response);
    throw new Error(detail || `${response.status} ${response.statusText}`);
  }

  if (response.status === 204) return {} as T;

  return response.json();
}

// --- SSR (server-side, Next.js cache) ---

export const getCampaigns = cache(
  async (params: RequestOptions["query"] = {}): Promise<Campaign[]> => {
    const data = await apiRequest<Campaign[] | PaginatedResponse<Campaign>>(
      "/v1/campaigns/",
      { query: params, nextOptions: { revalidate: 45 } },
    );
    return unwrapPaginated(data);
  },
);

export const getCampaignBySlug = cache(async (slug: string): Promise<Campaign> => {
  return apiRequest<Campaign>(`/v1/campaigns/${slug}/`, {
    nextOptions: { revalidate: 45 },
  });
});

export async function getCampaignCategories(): Promise<Category[]> {
  const data = await apiRequest<Category[] | PaginatedResponse<Category>>(
    "/v1/campaign-categories/",
    { nextOptions: { revalidate: 300 } },
  );
  return unwrapPaginated(data);
}

export async function createCampaign(
  payload: CampaignCreateInput,
  tokens: Tokens,
): Promise<Campaign> {
  return apiRequest<Campaign>("/v1/campaigns/", {
    method: "POST",
    body: JSON.stringify(payload),
    tokens,
  });
}

export async function updateCampaign(
  slug: string,
  payload: CampaignUpdateInput,
  tokens: Tokens,
): Promise<Campaign> {
  return apiRequest<Campaign>(`/v1/campaigns/${slug}/`, {
    method: "PATCH",
    body: JSON.stringify(payload),
    tokens,
  });
}

export async function deleteCampaign(slug: string, tokens: Tokens): Promise<void> {
  await apiRequest(`/v1/campaigns/${slug}/`, {
    method: "DELETE",
    tokens,
  });
}

export interface CampaignStats {
  volunteers: { approved: number; pending: number; declined: number; withdrawn: number };
  shift_capacity: number;
  campaign: { id: number; title: string; target_amount: number; current_amount: number };
}

export async function getCampaignStats(
  slug: string,
  tokens: Tokens,
): Promise<CampaignStats> {
  return apiRequest<CampaignStats>(`/v1/campaigns/${slug}/stats/`, { tokens });
}

export async function submitDonation(
  payload: DonationPayload,
): Promise<DonationResponse> {
  return apiRequest<DonationResponse>("/v1/donations/", {
    method: "POST",
    body: JSON.stringify(payload),
  });
}

// --- Auth (без токенів) ---

interface LoginPayload {
  email: string;
  password: string;
}

interface RegisterPayload {
  email: string;
  password: string;
  confirm_password: string;
  first_name?: string;
  last_name?: string;
  role?: string;
  phone_number?: string;
}

export async function login(payload: LoginPayload) {
  return apiRequest<{
    access: string;
    refresh: string;
    user: User;
  }>("/v1/auth/login/", {
    method: "POST",
    body: JSON.stringify(payload),
  });
}

export async function register(payload: RegisterPayload) {
  return apiRequest<{
    user: User;
    tokens: { access: string; refresh: string };
  }>("/v1/auth/register/", {
    method: "POST",
    body: JSON.stringify(payload),
  });
}

export async function getMe(accessToken: string) {
  return apiRequest<User>("/v1/auth/me/", {
    tokens: { access: accessToken, refresh: "" },
  });
}

// --- Authenticated endpoints ---

export async function applyForCampaign(
  slug: string,
  tokens: Tokens,
  payload: { motivation?: string; experience?: string },
) {
  return apiRequest<VolunteerApplication>(`/v1/campaigns/${slug}/apply/`, {
    method: "POST",
    body: JSON.stringify(payload),
    tokens,
  });
}

export async function getVolunteerApplications(
  tokens: Tokens,
  params?: Record<string, string>,
) {
  const data = await apiRequest<
    VolunteerApplication[] | PaginatedResponse<VolunteerApplication>
  >("/v1/volunteer-applications/", { tokens, query: params });
  return unwrapPaginated(data);
}

export async function updateVolunteerApplicationStatus(
  id: number,
  status: "approved" | "declined" | "withdrawn",
  tokens: Tokens,
) {
  return apiRequest<VolunteerApplication>(`/v1/volunteer-applications/${id}/`, {
    method: "PATCH",
    body: JSON.stringify({ status }),
    tokens,
  });
}

export async function createCampaignStage(
  campaignId: number,
  payload: CampaignStageInput,
  tokens: Tokens,
) {
  return apiRequest<CampaignStage>("/v1/campaign-stages/", {
    method: "POST",
    body: JSON.stringify({ ...payload, campaign_id: campaignId }),
    tokens,
  });
}

export async function deleteCampaignStage(stageId: number, tokens: Tokens) {
  return apiRequest(`/v1/campaign-stages/${stageId}/`, {
    method: "DELETE",
    tokens,
  });
}

export async function createCampaignShift(
  campaignId: number,
  payload: CampaignShiftInput,
  tokens: Tokens,
) {
  return apiRequest<CampaignShift>("/v1/campaign-shifts/", {
    method: "POST",
    body: JSON.stringify({ ...payload, campaign_id: campaignId }),
    tokens,
  });
}

export async function deleteCampaignShift(shiftId: number, tokens: Tokens) {
  return apiRequest(`/v1/campaign-shifts/${shiftId}/`, {
    method: "DELETE",
    tokens,
  });
}

export async function updateCampaignShift(
  shiftId: number,
  payload: CampaignShiftInput,
  tokens: Tokens,
) {
  return apiRequest<CampaignShift>(`/v1/campaign-shifts/${shiftId}/`, {
    method: "PATCH",
    body: JSON.stringify(payload),
    tokens,
  });
}

export async function joinCampaignShift(shiftId: number, tokens: Tokens) {
  return apiRequest<{ id: number }>(`/v1/campaign-shifts/${shiftId}/join/`, {
    method: "POST",
    tokens,
  });
}

export async function leaveCampaignShift(shiftId: number, tokens: Tokens) {
  return apiRequest(`/v1/campaign-shifts/${shiftId}/leave/`, {
    method: "DELETE",
    tokens,
  });
}

export async function getMyUpcomingShiftAssignments(tokens: Tokens) {
  const data = await apiRequest<
    ShiftAssignmentSummary[] | PaginatedResponse<ShiftAssignmentSummary>
  >("/v1/my-shift-assignments/", { tokens });
  return unwrapPaginated(data);
}
