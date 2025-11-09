import type {
  CampaignShift,
  CampaignShiftInput,
  CampaignStage,
  CampaignStageInput,
  ShiftAssignmentSummary,
  Tokens,
  User,
  VolunteerApplication,
} from "@/types";

const API_BASE =
  process.env.NEXT_PUBLIC_API_URL?.replace(/\/+$/, "") ??
  "http://localhost:8000/api";

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

type RequestOptions = RequestInit & {
  tokens?: Tokens;
  query?: Record<string, string | number | boolean | undefined>;
};

async function request<T>(
  path: string,
  options: RequestOptions = {},
): Promise<T> {
  const { tokens, headers, query, ...rest } = options;
  const url = new URL(`${API_BASE}${path.startsWith("/") ? path : `/${path}`}`);
  if (query) {
    Object.entries(query).forEach(([key, value]) => {
      if (value === undefined || value === null || value === "") return;
      url.searchParams.set(key, String(value));
    });
  }

  const response = await fetch(url.toString(), {
    headers: {
      "Content-Type": "application/json",
      ...(tokens?.access ? { Authorization: `Bearer ${tokens.access}` } : {}),
      ...headers,
    },
    ...rest,
  });

  if (!response.ok) {
    let detail = "Request failed";
    try {
      const errorJson = await response.json();
      detail = errorJson.detail ?? JSON.stringify(errorJson);
    } catch (error) {
      detail = await response.text();
    }
    throw new Error(detail || `${response.status} ${response.statusText}`);
  }

  if (response.status === 204) return {} as T;

  return response.json();
}

export async function login(payload: LoginPayload) {
  return request<{
    access: string;
    refresh: string;
    user: User;
  }>("/v1/auth/login/", {
    method: "POST",
    body: JSON.stringify(payload),
  });
}

export async function register(payload: RegisterPayload) {
  return request<{
    user: User;
    tokens: { access: string; refresh: string };
  }>("/v1/auth/register/", {
    method: "POST",
    body: JSON.stringify(payload),
  });
}

export async function refreshToken(refresh: string) {
  return request<{ access: string }>("/v1/auth/refresh/", {
    method: "POST",
    body: JSON.stringify({ refresh }),
  });
}

export async function getMe(accessToken: string) {
  const user = await request<User>("/v1/auth/me/", {
    tokens: { access: accessToken, refresh: "" },
  });
  return user;
}

export async function applyForCampaign(
  slug: string,
  tokens: Tokens,
  payload: { motivation?: string; experience?: string },
) {
  return request<VolunteerApplication>(`/v1/campaigns/${slug}/apply/`, {
    method: "POST",
    body: JSON.stringify(payload),
    tokens,
  });
}

export async function getVolunteerApplications(
  tokens: Tokens,
  params?: Record<string, string>,
) {
  return request<VolunteerApplication[]>("/v1/volunteer-applications/", {
    tokens,
    query: params,
  });
}

export async function updateVolunteerApplicationStatus(
  id: number,
  status: "approved" | "declined" | "withdrawn",
  tokens: Tokens,
) {
  return request<VolunteerApplication>(`/v1/volunteer-applications/${id}/`, {
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
  return request<CampaignStage>("/v1/campaign-stages/", {
    method: "POST",
    body: JSON.stringify({
      ...payload,
      campaign_id: campaignId,
    }),
    tokens,
  });
}

export async function deleteCampaignStage(stageId: number, tokens: Tokens) {
  return request(`/v1/campaign-stages/${stageId}/`, {
    method: "DELETE",
    tokens,
  });
}

export async function createCampaignShift(
  campaignId: number,
  payload: CampaignShiftInput,
  tokens: Tokens,
) {
  return request<CampaignShift>("/v1/campaign-shifts/", {
    method: "POST",
    body: JSON.stringify({
      ...payload,
      campaign_id: campaignId,
    }),
    tokens,
  });
}

export async function deleteCampaignShift(shiftId: number, tokens: Tokens) {
  return request(`/v1/campaign-shifts/${shiftId}/`, {
    method: "DELETE",
    tokens,
  });
}

export async function updateCampaignShift(
  shiftId: number,
  payload: CampaignShiftInput,
  tokens: Tokens,
) {
  return request<CampaignShift>(`/v1/campaign-shifts/${shiftId}/`, {
    method: "PATCH",
    body: JSON.stringify(payload),
    tokens,
  });
}

export async function joinCampaignShift(shiftId: number, tokens: Tokens) {
  return request<{ id: number }>(`/v1/campaign-shifts/${shiftId}/join/`, {
    method: "POST",
    tokens,
  });
}

export async function leaveCampaignShift(shiftId: number, tokens: Tokens) {
  return request(`/v1/campaign-shifts/${shiftId}/leave/`, {
    method: "DELETE",
    tokens,
  });
}

export async function getMyUpcomingShiftAssignments(tokens: Tokens) {
  return request<ShiftAssignmentSummary[]>("/v1/my-shift-assignments/", {
    tokens,
  });
}

