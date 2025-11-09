export interface Category {
  id: number;
  name: string;
  slug: string;
  description?: string;
}

export interface CampaignStage {
  id: number;
  title: string;
  description?: string;
  order: number;
  is_completed: boolean;
  due_date?: string | null;
}

export interface CampaignShift {
  id: number;
  title: string;
  description?: string;
  start_at: string;
  end_at: string;
  capacity: number;
  status: "open" | "full" | "completed" | "cancelled";
  location_details?: string;
  instructions?: string;
  occupied_spots?: number;
  is_user_enrolled?: boolean;
  user_assignment_id?: number | null;
}

export interface CampaignStageInput {
  title: string;
  description?: string;
  order?: number;
  due_date?: string | null;
}

export interface CampaignShiftInput {
  title: string;
  description?: string;
  start_at: string;
  end_at: string;
  capacity: number;
  location_details?: string;
  instructions?: string;
}

export interface Campaign {
  id: number;
  title: string;
  slug: string;
  short_description: string;
  description: string;
  status: "draft" | "published" | "in_progress" | "completed" | "cancelled";
  category: Category;
  coordinator: {
    id: number;
    email: string;
    first_name?: string;
    last_name?: string;
    role: string;
  };
  location_name: string;
  location_address?: string;
  location_lat?: number | null;
  location_lng?: number | null;
  region?: string;
  target_amount?: string | number | null;
  current_amount?: string | number | null;
  required_volunteers: number;
  start_date?: string | null;
  end_date?: string | null;
  contact_email?: string;
  contact_phone?: string;
  stages?: CampaignStage[];
  shifts?: CampaignShift[];
  published_at?: string | null;
  created_at?: string;
  updated_at?: string;
}

export interface DonationPayload {
  campaign: number;
  provider: "monobank" | "privatbank" | "manual";
  amount: number;
  currency?: string;
  note?: string;
  payer_email?: string;
  payer_name?: string;
}

export interface DonationResponse {
  reference: string;
  status: "pending" | "processing" | "succeeded" | "failed" | "refunded";
  campaign: number;
  amount: string;
  currency: string;
  created_at: string;
  confirmed_at?: string | null;
}

export interface Tokens {
  access: string;
  refresh: string;
}

export interface User {
  id: number;
  email: string;
  first_name?: string;
  last_name?: string;
  role: string;
  phone_number?: string;
  is_verified: boolean;
  is_active: boolean;
  date_joined?: string;
}

export interface VolunteerApplication {
  id: number;
  campaign: Campaign;
  volunteer: User;
  motivation?: string;
  experience?: string;
  status: "pending" | "approved" | "declined" | "withdrawn";
  created_at: string;
  updated_at: string;
}

export interface ShiftAssignmentSummary {
  id: number;
  status: "pending" | "approved" | "declined" | "withdrawn";
  notes?: string;
  created_at: string;
  shift: CampaignShift;
  campaign: {
    id: number;
    title: string;
    slug: string;
    location_name?: string;
  };
}


