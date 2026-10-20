import { useEffect, useState } from 'react';
import { isSupabaseConfigured, supabase } from '../lib/supabase';

// Returns null until loaded, and stays null if Supabase isn't configured or the
// call fails, so callers fall back to their static copy rather than render zeros.
export function useLiveStats() {
  const [stats, setStats] = useState(null);
  const [leaderboard, setLeaderboard] = useState(null);

  useEffect(() => {
    if (!isSupabaseConfigured) return;
    let cancelled = false;

    const load = async () => {
      const [statsRes, boardRes] = await Promise.all([
        supabase.rpc('homepage_stats'),
        supabase.from('public_leaderboard').select('username, clues_solved').limit(10),
      ]);
      if (cancelled) return;
      if (!statsRes.error) setStats(statsRes.data);
      if (!boardRes.error) setLeaderboard(boardRes.data);
    };

    void load();
    const id = window.setInterval(load, 60000);
    return () => {
      cancelled = true;
      window.clearInterval(id);
    };
  }, []);

  return { stats, leaderboard };
}
