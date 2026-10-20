import type { Clue, Scope, ScopeLevel } from '../types';
import { isSupabaseConfigured, SAFE_CLUE_SELECT, supabase } from '../lib/supabase';

export async function fetchCluesForScope(scope: Scope, scopeLevel: ScopeLevel) {
  if (!isSupabaseConfigured) return [] as Clue[];

  let query = supabase.from('clues').select(SAFE_CLUE_SELECT).eq('is_active', true);
  if (scopeLevel === 'city') query = query.eq('scope_city', scope.city);
  if (scopeLevel === 'state') query = query.eq('scope_state', scope.state);
  if (scopeLevel === 'country') query = query.eq('scope_country', scope.country);

  const { data, error } = await query.order('created_at', { ascending: false });
  if (error) throw error;
  return (data || []) as Clue[];
}
