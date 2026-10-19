import { useEffect, useState } from 'react';
import { AnimatePresence } from 'framer-motion';
import { Settings } from 'lucide-react';
import { supabase } from '../../lib/supabase';
import { SubmissionCard } from './SubmissionCard';
import { QuestsTab } from './QuestsTab';
import { SettingsModal } from './SettingsModal';
import type { AdminSubmission, QuestSubmission } from '../../types';

type Status = 'pending' | 'approved' | 'rejected';
type MainTab = 'submissions' | 'quests';

interface AdminJoinRow {
  id: string;
  clue_id: string | null;
  quest_id: string | null;
  submission_kind: 'clue' | 'quest';
  user_id: string;
  photo_url: string;
  post_link: string | null;
  link_submitted_at: string | null;
  status: Status;
  gps_lat: number;
  gps_lng: number;
  submitted_at: string;
  clues: { title?: string; answer_name?: string; reward_airtime_naira?: number } | null;
  quests: { title?: string; reward_airtime_naira?: number; lat?: number; lng?: number } | null;
  profiles: { username?: string; phone_number?: string; network?: string } | null;
}

export default function AdminConsole() {
  const [mainTab, setMainTab] = useState<MainTab>('submissions');
  const [status, setStatus] = useState<Status>('pending');
  const [submissions, setSubmissions] = useState<(AdminSubmission | QuestSubmission)[]>([]);
  const [counts, setCounts] = useState<Record<Status, number>>({ pending: 0, approved: 0, rejected: 0 });
  const [error, setError] = useState('');
  const [settingsOpen, setSettingsOpen] = useState(false);

  useEffect(() => {
    if (mainTab !== 'submissions') return;

    const load = async () => {
      setError('');
      try {
        const { data, error: queryError } = await supabase
          .from('submissions')
          .select(
            'id, clue_id, quest_id, submission_kind, user_id, photo_url, post_link, link_submitted_at, status, gps_lat, gps_lng, submitted_at, clues(title, answer_name, reward_airtime_naira), quests(title, reward_airtime_naira, lat, lng), profiles(username, phone_number, network)',
          )
          .eq('status', status)
          .or('submission_kind.eq.clue,post_link.not.is.null')
          .order('submitted_at', { ascending: false });
        if (queryError) throw queryError;

        const rows = ((data || []) as unknown as AdminJoinRow[]).map((row) => {
          const isQuest = row.submission_kind === 'quest';
          return {
            id: row.id,
            clue_id: row.clue_id,
            quest_id: row.quest_id,
            submission_kind: row.submission_kind,
            user_id: row.user_id,
            photo_url: row.photo_url,
            post_link: row.post_link,
            link_submitted_at: row.link_submitted_at,
            status: row.status,
            gps_lat: row.gps_lat,
            gps_lng: row.gps_lng,
            submitted_at: row.submitted_at,
            clue_title: isQuest
              ? (row.quests?.title ?? 'Untitled quest')
              : (row.clues?.title ?? 'Untitled clue'),
            answer_name: row.clues?.answer_name ?? '',
            reward_airtime_naira:
              (isQuest ? row.quests?.reward_airtime_naira : row.clues?.reward_airtime_naira) ?? 500,
            username: row.profiles?.username ?? 'Unknown player',
            phone_number: row.profiles?.phone_number ?? '',
            network: row.profiles?.network ?? null,
            quest_title: row.quests?.title ?? '',
            quest_lat: row.quests?.lat ?? null,
            quest_lng: row.quests?.lng ?? null,
          };
        });
        setSubmissions(rows);

        const nextCounts = { pending: 0, approved: 0, rejected: 0 };
        await Promise.all(
          (Object.keys(nextCounts) as Status[]).map(async (s) => {
            const { count } = await supabase
              .from('submissions')
              .select('id', { count: 'exact', head: true })
              .eq('status', s)
              .or('submission_kind.eq.clue,post_link.not.is.null');
            nextCounts[s] = count || 0;
          }),
        );
        setCounts(nextCounts);
      } catch (caught) {
        setError(caught instanceof Error ? caught.message : 'Could not load submissions.');
      }
    };

    void load();

    // Live feed: reload whenever any submission is inserted or updated
    const channel = supabase
      .channel(`admin-submissions-${status}`)
      .on('postgres_changes', { event: 'INSERT', schema: 'public', table: 'submissions' }, () => { void load(); })
      .on('postgres_changes', { event: 'UPDATE', schema: 'public', table: 'submissions' }, () => { void load(); })
      .subscribe((subStatus) => {
        if (subStatus === 'CHANNEL_ERROR' || subStatus === 'TIMED_OUT' || subStatus === 'CLOSED') {
          // eslint-disable-next-line no-console
          console.warn('[admin realtime]', subStatus, '— relying on polling fallback');
        }
      });

    // Polling fallback: catches new submissions even if realtime publication
    // isn't enabled on the submissions table.
    const pollId = window.setInterval(() => { void load(); }, 8000);

    return () => {
      window.clearInterval(pollId);
      void supabase.removeChannel(channel);
    };
  }, [mainTab, status]);

  return (
    <main className="admin-console">
      <header className="admin-header">
        <h1>GeoHunt Admin</h1>
        <div className="admin-header-right">
          <nav className="admin-tabs" aria-label="Main tabs">
            <button
              type="button"
              className={mainTab === 'submissions' ? 'active' : ''}
              onClick={() => setMainTab('submissions')}
            >
              Submissions
            </button>
            <button
              type="button"
              className={mainTab === 'quests' ? 'active' : ''}
              onClick={() => setMainTab('quests')}
            >
              Quests
            </button>
          </nav>
          <button
            type="button"
            className="icon-button"
            onClick={() => setSettingsOpen(true)}
            aria-label="Open settings"
          >
            <Settings size={18} />
          </button>
        </div>
      </header>

      {mainTab === 'submissions' ? (
        <>
          <nav className="admin-tabs submission-status-tabs" aria-label="Submission status">
            {(['pending', 'approved', 'rejected'] as Status[]).map((s) => (
              <button
                type="button"
                key={s}
                className={status === s ? 'active' : ''}
                onClick={() => setStatus(s)}
              >
                {s[0].toUpperCase() + s.slice(1)}
                <span>{counts[s]}</span>
              </button>
            ))}
          </nav>
          {error ? <p className="form-error">{error}</p> : null}
          <AnimatePresence>
            <section className="submission-list">
              {submissions.map((sub) => (
                <SubmissionCard
                  key={sub.id}
                  submission={sub as AdminSubmission}
                  onResolved={(id) => {
                    setSubmissions((cur) => cur.filter((s) => s.id !== id));
                    setCounts((cur) => ({ ...cur, [status]: Math.max(0, cur[status] - 1) }));
                  }}
                />
              ))}
            </section>
          </AnimatePresence>
        </>
      ) : (
        <QuestsTab />
      )}

      <AnimatePresence>
        {settingsOpen ? (
          <SettingsModal onClose={() => setSettingsOpen(false)} />
        ) : null}
      </AnimatePresence>
    </main>
  );
}
