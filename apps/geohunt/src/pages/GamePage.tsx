import { lazy, Suspense, useEffect, useState } from 'react';
import { AnimatePresence, motion } from 'framer-motion';
import { Menu, UserRound } from 'lucide-react';
import { useShallow } from 'zustand/react/shallow';
import { MapProvider } from 'react-map-gl/maplibre';
import { MapView } from '../components/map/MapView';
import { ClueStatusPill } from '../components/ui/ClueStatusPill';
import { InfoButton } from '../components/ui/InfoButton';
import { resolveIPLocation } from '../services/location';
import { fetchAllActiveQuests, subscribeToQuestChanges } from '../services/quests';
import { supabase } from '../lib/supabase';
import { startGPSWatch, useGPSStore } from '../store/useGPSStore';
import { useQuestStore } from '../store/useQuestStore';
import { useNotificationStore, type SubmissionWithMeta } from '../store/useNotificationStore';
import { useAuthStore } from '../store/useAuthStore';
import type { UserProfile } from '../types';

const HamburgerDrawer = lazy(() => import('../components/ui/HamburgerDrawer'));
const AvatarDrawer = lazy(() => import('../components/ui/AvatarDrawer'));
const QuestScrollPanel = lazy(() => import('../components/ui/QuestScrollPanel'));
const NotificationDrawer = lazy(() => import('../components/ui/NotificationDrawer'));

type SideDrawer = 'left' | 'right' | null;

export function GamePage() {
  const [sideDrawer, setSideDrawer] = useState<SideDrawer>(null);

  const scrollPanelOpen = useQuestStore((s) => s.scrollPanelOpen);
  const selectQuest = useQuestStore((s) => s.selectQuest);
  const { setQuests, upsertQuest } = useQuestStore(
    useShallow((s) => ({ setQuests: s.setQuests, upsertQuest: s.upsertQuest })),
  );

  const notifDrawerOpen = useNotificationStore((s) => s.drawerOpen);
  const closeNotifDrawer = useNotificationStore((s) => s.closeDrawer);
  const openNotifDrawer = useNotificationStore((s) => s.openDrawer);

  const error = useGPSStore((s) => s.error);

  const { setSession, setProfile, clear } = useAuthStore(
    useShallow((state) => ({
      setSession: state.setSession,
      setProfile: state.setProfile,
      clear: state.clear,
    })),
  );
  const profile = useAuthStore((state) => state.userProfile);

  // Bootstrap: IP location + GPS + quest load + realtime
  useEffect(() => {
    void resolveIPLocation().catch(() => {
      useGPSStore.getState().setLoading(false);
    });
    startGPSWatch();

    void fetchAllActiveQuests()
      .then((quests) => setQuests(quests))
      .catch(() => null);

    const channel = subscribeToQuestChanges(upsertQuest);
    return () => { void supabase.removeChannel(channel); };
  }, [setQuests, upsertQuest]);

  // Auth bootstrap
  useEffect(() => {
    const bootAuth = async () => {
      const { data } = await supabase.auth.getSession();
      setSession(data.session);
      if (data.session?.user) {
        const [profileResult, subsResult] = await Promise.all([
          supabase
            .from('profiles')
            .select('id, username, phone_number, city, state, country, clues_solved, network, bank_account_number, bank_account_name')
            .eq('id', data.session.user.id)
            .single(),
          supabase
            .from('submissions')
            .select('id, quest_id, clue_id, submission_kind, user_id, photo_url, post_link, link_submitted_at, status, gps_lat, gps_lng, submitted_at, quests(title, reward_airtime_naira)')
            .eq('user_id', data.session.user.id)
            .order('submitted_at', { ascending: false }),
        ]);
        if (profileResult.data) setProfile(profileResult.data as UserProfile);
        if (subsResult.data?.length) {
          type SubRow = typeof subsResult.data[number] & { quests?: { title?: string; reward_airtime_naira?: number } | null };
          const withMeta: SubmissionWithMeta[] = (subsResult.data as SubRow[]).map((r) => ({
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
            quest_title: r.quests?.title ?? '',
            reward_airtime_naira: r.quests?.reward_airtime_naira ?? 500,
          }));

          // Clear rejected quest IDs from the local submitted_quests cache
          // so players can resubmit after their submission is declined.
          const rejectedQuestIds = withMeta
            .filter((s) => s.status === 'rejected' && s.quest_id)
            .map((s) => s.quest_id!);
          if (rejectedQuestIds.length) {
            try {
              const prev = JSON.parse(localStorage.getItem('submitted_quests') || '[]') as string[];
              localStorage.setItem('submitted_quests', JSON.stringify(prev.filter((id) => !rejectedQuestIds.includes(id))));
            } catch { /* ignore */ }
          }

          useNotificationStore.getState().setSubmissions(withMeta);
        }
      }
    };

    const { data: subscription } = supabase.auth.onAuthStateChange((_event, session) => {
      if (session) setSession(session);
      else clear();
    });

    void bootAuth();
    return () => { subscription.subscription.unsubscribe(); };
  }, [clear, setProfile, setSession]);

  return (
    <MapProvider>
    <div className="relative h-screen w-screen overflow-hidden">
      <MapView />
      <AnimatePresence>
        <motion.button
          key="hamburger"
          type="button"
          className="floating-button top-left"
          onClick={() => setSideDrawer('left')}
          aria-label="Open quests drawer"
        >
          <Menu size={22} />
        </motion.button>

        <ClueStatusPill key="pill" />

        <InfoButton key="info-btn" />

        <motion.button
          key="avatar"
          type="button"
          className="floating-button top-right avatar-button"
          onClick={() => setSideDrawer('right')}
          aria-label="Open profile drawer"
        >
          {profile ? profile.username.slice(0, 2).toUpperCase() : <UserRound size={21} />}
        </motion.button>

        {scrollPanelOpen ? (
          <Suspense key="quest-scroll" fallback={null}>
            <QuestScrollPanel
              onSignIn={() => { selectQuest(null); setSideDrawer('right'); }}
            />
          </Suspense>
        ) : null}

        {sideDrawer === 'left' ? (
          <Suspense key="left-drawer" fallback={null}>
            <HamburgerDrawer onClose={() => setSideDrawer(null)} />
          </Suspense>
        ) : null}

        {sideDrawer === 'right' ? (
          <Suspense key="right-drawer" fallback={null}>
            <AvatarDrawer
              onClose={() => setSideDrawer(null)}
              onViewSubmissions={() => { setSideDrawer(null); openNotifDrawer(); }}
            />
          </Suspense>
        ) : null}

        {notifDrawerOpen ? (
          <Suspense key="notif-drawer" fallback={null}>
            <NotificationDrawer onClose={closeNotifDrawer} />
          </Suspense>
        ) : null}
      </AnimatePresence>

      <AnimatePresence>
        {error ? (
          <motion.div
            className="toast"
            initial={{ opacity: 0, y: 20 }}
            animate={{ opacity: 1, y: 0 }}
            exit={{ opacity: 0, y: 20 }}
          >
            {error}
          </motion.div>
        ) : null}
      </AnimatePresence>
    </div>
    </MapProvider>
  );
}
