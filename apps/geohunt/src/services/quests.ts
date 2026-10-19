import type { Quest } from '../types';
import { isSupabaseConfigured, SAFE_QUEST_SELECT, supabase } from '../lib/supabase';

export async function fetchAllActiveQuests(): Promise<Quest[]> {
  if (!isSupabaseConfigured) return [];
  const { data, error } = await supabase
    .from('quests')
    .select(SAFE_QUEST_SELECT)
    .eq('is_active', true)
    .order('created_at', { ascending: false });
  if (error) throw error;
  return (data || []) as unknown as Quest[];
}

export function subscribeToQuestChanges(
  onUpsert: (quest: Quest) => void,
) {
  return supabase
    .channel('quests-changes')
    .on(
      'postgres_changes',
      { event: '*', schema: 'public', table: 'quests' },
      (payload) => {
        if (payload.eventType === 'INSERT' || payload.eventType === 'UPDATE') {
          onUpsert(payload.new as Quest);
        }
      },
    )
    .subscribe();
}
