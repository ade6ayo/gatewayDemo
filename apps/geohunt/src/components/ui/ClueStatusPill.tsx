import { useCallback, useRef, useState } from 'react';
import { AnimatePresence, motion } from 'framer-motion';
import { Loader2, LocateFixed } from 'lucide-react';
import { useShallow } from 'zustand/react/shallow';
import { useMap } from 'react-map-gl/maplibre';
import { useQuestStore } from '../../store/useQuestStore';
import { useGPSStore } from '../../store/useGPSStore';
import { useAuthStore } from '../../store/useAuthStore';
import { useNotificationStore, type SubmissionWithMeta } from '../../store/useNotificationStore';
import { fetchAllActiveQuests } from '../../services/quests';
import { supabase } from '../../lib/supabase';

function haversineKm(lat1: number, lng1: number, lat2: number, lng2: number) {
  const R = 6371;
  const dLat = ((lat2 - lat1) * Math.PI) / 180;
  const dLng = ((lng2 - lng1) * Math.PI) / 180;
  const a =
    Math.sin(dLat / 2) ** 2 +
    Math.cos((lat1 * Math.PI) / 180) *
      Math.cos((lat2 * Math.PI) / 180) *
      Math.sin(dLng / 2) ** 2;
  return R * 2 * Math.atan2(Math.sqrt(a), Math.sqrt(1 - a));
}

function formatDistance(km: number): string {
  if (km < 1) return `${Math.round(km * 1000)} m`;
  return `${km.toFixed(1)} km`;
}

const CITY_RADIUS_KM = 60;

export function ClueStatusPill() {
  const maps = useMap();
  const mapRef = maps['main-map'] ?? maps.current;

  const { quests, loading } = useQuestStore(
    useShallow((s) => ({ quests: s.quests, loading: s.loading })),
  );
  const setQuests = useQuestStore((s) => s.setQuests);
  const { lat, lng } = useGPSStore(useShallow((s) => ({ lat: s.lat, lng: s.lng })));

  const [morphLabel, setMorphLabel] = useState<string | null>(null);
  const morphTimerRef = useRef<ReturnType<typeof setTimeout> | null>(null);

  const cityQuests =
    lat !== null && lng !== null
      ? quests.filter((q) => haversineKm(lat, lng, q.lat, q.lng) <= CITY_RADIUS_KM)
      : quests;

  const unsolvedCount = cityQuests.filter((q) => !q.solved_by).length;

  const label =
    morphLabel ??
    (unsolvedCount > 0 ? `${unsolvedCount} quest${unsolvedCount === 1 ? '' : 's'} available` : 'No active quests');

  const handlePillClick = useCallback(() => {
    if (lat === null || lng === null) return;
    const unsolved = cityQuests.filter((q) => !q.solved_by);
    if (!unsolved.length) return;
    let nearest = unsolved[0];
    let minDist = haversineKm(lat, lng, nearest.lat, nearest.lng);
    for (const q of unsolved) {
      const d = haversineKm(lat, lng, q.lat, q.lng);
      if (d < minDist) { minDist = d; nearest = q; }
    }
    const distLabel = formatDistance(minDist);
    setMorphLabel(`${distLabel} to nearest`);
    if (morphTimerRef.current) clearTimeout(morphTimerRef.current);
    morphTimerRef.current = setTimeout(() => setMorphLabel(null), 4000);
    mapRef?.fitBounds(
      [
        [Math.min(lng, nearest.lng), Math.min(lat, nearest.lat)],
        [Math.max(lng, nearest.lng), Math.max(lat, nearest.lat)],
      ],
      { padding: 100, duration: 1200, maxZoom: 15 },
    );

    // Background refresh: re-fetch quests and user submissions silently
    void (async () => {
      const userId = useAuthStore.getState().user?.id;
      await Promise.all([
        fetchAllActiveQuests().then(setQuests).catch(() => null),
        userId
          ? Promise.resolve(
              supabase
                .from('submissions')
                .select('id, quest_id, clue_id, submission_kind, user_id, photo_url, post_link, link_submitted_at, status, gps_lat, gps_lng, submitted_at, quests(title, reward_airtime_naira)')
                .eq('user_id', userId)
                .order('submitted_at', { ascending: false }),
            ).then(({ data }) => {
                if (!data?.length) return;
                type SubRow = (typeof data)[number] & { quests?: { title?: string; reward_airtime_naira?: number } | null };
                const withMeta: SubmissionWithMeta[] = (data as SubRow[]).map((r) => ({
                  id: r.id,
                  quest_id: r.quest_id,
                  clue_id: r.clue_id,
                  submission_kind: r.submission_kind as 'quest' | 'clue',
                  user_id: r.user_id,
                  photo_url: r.photo_url,
                  post_link: r.post_link,
                  link_submitted_at: r.link_submitted_at,
                  status: r.status as 'pending' | 'approved' | 'rejected',
                  gps_lat: r.gps_lat,
                  gps_lng: r.gps_lng,
                  submitted_at: r.submitted_at,
                  quest_title: (r as SubRow).quests?.title ?? '',
                  reward_airtime_naira: (r as SubRow).quests?.reward_airtime_naira ?? 500,
                }));
                useNotificationStore.getState().setSubmissions(withMeta);
              })
              .catch(() => null)
          : null,
      ]);
    })();
  }, [lat, lng, mapRef, cityQuests, setQuests]);

  const handleLocate = useCallback(() => {
    if (lat !== null && lng !== null) {
      mapRef?.flyTo({ center: [lng, lat], zoom: 17, duration: 1200, essential: true });
    }
  }, [lat, lng, mapRef]);

  return (
    <div className="top-pill-row">
      <motion.button
        type="button"
        layout
        className={`top-pill quest-pill ${unsolvedCount === 0 && !loading ? 'top-pill-pulse' : ''}`}
        onClick={handlePillClick}
        aria-label="Scope out to show my location and nearest quest"
      >
        <AnimatePresence mode="wait" initial={false}>
          <motion.span
            key={loading ? 'loading' : label}
            initial={{ opacity: 0, y: 8 }}
            animate={{ opacity: 1, y: 0 }}
            exit={{ opacity: 0, y: -8 }}
            transition={{ duration: 0.18 }}
            className="pill-text"
          >
            {loading ? <Loader2 size={14} className="animate-spin" /> : null}
            {loading ? 'Loading' : label}
          </motion.span>
        </AnimatePresence>
      </motion.button>

      <button
        type="button"
        className="locate-button"
        aria-label="Zoom in to my location"
        onClick={handleLocate}
      >
        <LocateFixed size={18} />
      </button>
    </div>
  );
}
