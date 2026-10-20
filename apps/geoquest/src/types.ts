import type { Polygon } from 'geojson';

export type ScopeLevel = 'city' | 'state' | 'country';

export interface Clue {
  id: string;
  title: string;
  riddle: string;
  hint: string;
  region: Polygon;
  reward_airtime_naira: number;
  scope_city: string;
  scope_state: string;
  solved_by: string | null;
  solved_photo_url: string | null;
  solved_at: string | null;
}

export interface Quest {
  id: string;
  title: string;
  instructions: string;
  lat: number;
  lng: number;
  reward_airtime_naira: number;
  geofence_required: boolean;
  geofence_radius_m: number;
  is_active?: boolean;
  solved_by: string | null;
  solved_photo_url: string | null;
  solved_at: string | null;
  solver?: { username: string; clues_solved: number } | null;
}

export type Network = 'MTN' | 'Glo' | 'Airtel' | '9mobile';

export interface UserProfile {
  id: string;
  username: string;
  phone_number: string;
  city: string | null;
  state: string | null;
  country: string | null;
  clues_solved: number;
  network: Network | null;
  bank_account_number: string | null;
  bank_account_name: string | null;
}

export interface Submission {
  id: string;
  clue_id: string | null;
  quest_id: string | null;
  submission_kind: 'clue' | 'quest';
  user_id: string;
  photo_url: string;
  post_link: string | null;
  link_submitted_at: string | null;
  status: 'pending' | 'approved' | 'rejected';
  gps_lat: number;
  gps_lng: number;
  submitted_at: string;
}

export interface QuestSubmission extends Submission {
  quest_title: string;
  reward_airtime_naira: number;
  username: string;
  phone_number: string;
  network: Network | null;
}

export interface AdminSubmission extends Submission {
  clue_title: string;
  answer_name: string;
  reward_airtime_naira: number;
  username: string;
  phone_number: string;
  network?: string | null;
  quest_lat?: number | null;
  quest_lng?: number | null;
}

export interface Scope {
  city: string;
  state: string;
  country: string;
}
