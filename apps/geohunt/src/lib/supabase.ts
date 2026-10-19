import { createClient } from '@supabase/supabase-js';

const supabaseUrl = import.meta.env.VITE_SUPABASE_URL as string | undefined;
const supabaseAnonKey = import.meta.env.VITE_SUPABASE_ANON_KEY as string | undefined;

export const isSupabaseConfigured = Boolean(supabaseUrl && supabaseAnonKey);

export const supabase = createClient(
  supabaseUrl || 'https://example.supabase.co',
  supabaseAnonKey || 'anon-key-missing',
  {
    auth: {
      persistSession: true,
      autoRefreshToken: true,
    },
  },
);

export const SAFE_CLUE_SELECT =
  'id, title, riddle, hint, region, reward_airtime_naira, scope_city, scope_state, solved_by, solved_photo_url, solved_at';

export const SAFE_QUEST_SELECT =
  'id, title, instructions, lat, lng, reward_airtime_naira, geofence_required, geofence_radius_m, solved_by, solved_photo_url, solved_at, solver:profiles!quests_solved_by_fkey(username, clues_solved)';

export function fakeEmailForUsername(username: string) {
    return `${username.trim().toLowerCase().replace(/[^a-z0-9]/g, '')}@example.com`;
}
