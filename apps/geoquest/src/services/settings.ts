import { isSupabaseConfigured, supabase } from '../lib/supabase';

export interface AppSettings {
  final_instructions: string;
  post_template: string;
}

const DEFAULTS: AppSettings = {
  final_instructions:
    'Thanks for your submission! Once our moderators approve it, your reward will be disbursed to the phone number on your profile within 24 hours.',
  post_template: 'Just solved a #GeoQuestNG quest! Find yours at geoquest.app 🏆',
};

export async function fetchAppSettings(): Promise<AppSettings> {
  if (!isSupabaseConfigured) return DEFAULTS;
  const { data, error } = await supabase.from('app_settings').select('key, value');
  if (error) return DEFAULTS;
  const map: Record<string, string> = {};
  for (const row of data || []) map[row.key as string] = row.value as string;
  return {
    final_instructions: map['final_instructions'] ?? DEFAULTS.final_instructions,
    post_template: map['post_template'] ?? DEFAULTS.post_template,
  };
}
