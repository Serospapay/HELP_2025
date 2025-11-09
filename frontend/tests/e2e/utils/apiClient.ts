/**
 * @file: utils/apiClient.ts
 * @description: Допоміжні функції для взаємодії з бекенд-API у Playwright-тестах.
 * @dependencies: глобальний fetch (Node 18+)
 * @created: 2025-11-09
 */

export interface ApiTokens {
  access: string;
  refresh: string;
}

export interface ApiUser {
  id: number;
  email: string;
  role: string;
  first_name?: string;
  last_name?: string;
}

export interface RegisterResponse {
  user: ApiUser;
  tokens: ApiTokens;
}

const API_BASE =
  (process.env.PLAYWRIGHT_API_URL ??
    process.env.NEXT_PUBLIC_API_URL ??
    "http://127.0.0.1:8000/api/v1"
  ).replace(/\/+$/, "");

async function apiRequest<T>(
  path: string,
  init: RequestInit & { token?: string } = {},
): Promise<T> {
  const { token, headers, ...rest } = init;
  const url = `${API_BASE}${path.startsWith("/") ? path : `/${path}`}`;

  const response = await fetch(url, {
    headers: {
      "Content-Type": "application/json",
      ...(token ? { Authorization: `Bearer ${token}` } : {}),
      ...headers,
    },
    ...rest,
  });

  if (!response.ok) {
    let detail: string;
    try {
      const json = await response.json();
      detail = json.detail ?? JSON.stringify(json);
    } catch {
      detail = await response.text();
    }
    throw new Error(
      `[API ${response.status}] ${detail || response.statusText} (${url})`,
    );
  }

  if (response.status === 204) {
    return {} as T;
  }

  return (await response.json()) as T;
}

export async function registerUser(payload: {
  email: string;
  password: string;
  confirm_password?: string;
  first_name?: string;
  last_name?: string;
  role?: string;
  phone_number?: string;
}): Promise<RegisterResponse> {
  return apiRequest<RegisterResponse>("/auth/register/", {
    method: "POST",
    body: JSON.stringify({
      ...payload,
      confirm_password: payload.confirm_password ?? payload.password,
    }),
  });
}

export async function loginUser(payload: {
  email: string;
  password: string;
}): Promise<{ access: string; refresh: string; user: ApiUser }> {
  return apiRequest<{ access: string; refresh: string; user: ApiUser }>(
    "/auth/login/",
    {
      method: "POST",
      body: JSON.stringify(payload),
    },
  );
}

export async function createCampaignCategory(
  payload: { name: string; description?: string },
  token: string,
): Promise<{ id: number; name: string; slug: string }> {
  return apiRequest<{ id: number; name: string; slug: string }>(
    "/campaign-categories/",
    {
      method: "POST",
      body: JSON.stringify(payload),
      token,
    },
  );
}

export async function createCampaign(
  payload: {
    title: string;
    short_description: string;
    description: string;
    status: string;
    category: number;
    location_name: string;
    location_address?: string;
    region?: string;
    target_amount?: number;
    required_volunteers?: number;
    start_date?: string;
    end_date?: string;
    contact_email?: string;
    contact_phone?: string;
  },
  token: string,
): Promise<void> {
  await apiRequest("/campaigns/", {
    method: "POST",
    body: JSON.stringify(payload),
    token,
  });
}

export async function findCampaignByTitle(
  title: string,
  token: string,
): Promise<{
  id: number;
  slug: string;
  title: string;
}> {
  const url = new URL(`${API_BASE}/campaigns/`);
  url.searchParams.set("search", title);

  const response = await fetch(url.toString(), {
    headers: {
      "Content-Type": "application/json",
      Authorization: `Bearer ${token}`,
    },
  });

  if (!response.ok) {
    const text = await response.text();
    throw new Error(`Не вдалося отримати кампанію "${title}": ${text}`);
  }

  const data = (await response.json()) as Array<{
    id: number;
    slug: string;
    title: string;
  }>;

  const match = data.find((item) => item.title === title);
  if (!match) {
    throw new Error(`Не знайдено кампанію з назвою "${title}".`);
  }

  return match;
}

export async function createCampaignShift(
  payload: {
    campaign_id: number;
    title: string;
    description?: string;
    start_at: string;
    end_at: string;
    capacity: number;
    location_details?: string;
    instructions?: string;
  },
  token: string,
): Promise<{ id: number }> {
  const shift = await apiRequest<{ id: number }>(
    "/campaign-shifts/",
    {
      method: "POST",
      body: JSON.stringify(payload),
      token,
    },
  );
  return shift;
}

export function isoDate(date: Date): string {
  return date.toISOString().slice(0, 10);
}

export async function deleteCampaignShift(id: number, token: string): Promise<void> {
  await apiRequest(`/campaign-shifts/${id}/`, {
    method: "DELETE",
    token,
  });
}

export async function deleteCampaign(slug: string, token: string): Promise<void> {
  await apiRequest(`/campaigns/${slug}/`, {
    method: "DELETE",
    token,
  });
}

export async function deleteCampaignCategory(id: number, token: string): Promise<void> {
  await apiRequest(`/campaign-categories/${id}/`, {
    method: "DELETE",
    token,
  });
}


