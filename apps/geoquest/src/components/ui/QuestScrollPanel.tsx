import { lazy, Suspense } from 'react';
import { motion } from 'framer-motion';
import { X } from 'lucide-react';
import { Trophy, NavigationArrow } from '@phosphor-icons/react';
import { useShallow } from 'zustand/react/shallow';
import { useQuestStore, selectSelectedQuest } from '../../store/useQuestStore';
import { useAuthStore } from '../../store/useAuthStore';
import { useGPSStore } from '../../store/useGPSStore';
import { useNotificationStore } from '../../store/useNotificationStore';

const QuestSubmitFlow = lazy(() => import('./QuestSubmitFlow'));
const SolvedQuestOverlay = lazy(() => import('./SolvedQuestOverlay'));

function haversineM(lat1: number, lng1: number, lat2: number, lng2: number) {
  const R = 6371000;
  const dLat = ((lat2 - lat1) * Math.PI) / 180;
  const dLng = ((lng2 - lng1) * Math.PI) / 180;
  const a =
    Math.sin(dLat / 2) ** 2 +
    Math.cos((lat1 * Math.PI) / 180) *
      Math.cos((lat2 * Math.PI) / 180) *
      Math.sin(dLng / 2) ** 2;
  return R * 2 * Math.atan2(Math.sqrt(a), Math.sqrt(1 - a));
}

function getSubmittedQuests(): string[] {
  try { return JSON.parse(localStorage.getItem('submitted_quests') || '[]') as string[]; }
  catch { return []; }
}

interface Props {
  onSignIn?: () => void;
}

export default function QuestScrollPanel({ onSignIn }: Props) {
  const quest = useQuestStore(selectSelectedQuest);
  const selectQuest = useQuestStore((s) => s.selectQuest);
  const user = useAuthStore((s) => s.user);
  const { lat, lng } = useGPSStore(useShallow((s) => ({ lat: s.lat, lng: s.lng })));

  const latestSubmission = useNotificationStore((s) => {
    if (!quest) return null;
    const subs = s.submissions.filter((sub) => sub.quest_id === quest.id);
    if (!subs.length) return null;
    return subs.reduce((latest, sub) =>
      sub.submitted_at > latest.submitted_at ? sub : latest,
    );
  });

  if (!quest) return null;

  const distM =
    lat !== null && lng !== null
      ? haversineM(lat, lng, quest.lat, quest.lng)
      : Infinity;
  const withinRadius = distM <= (quest.geofence_radius_m ?? 50);
  const canSubmit = !quest.geofence_required || withinRadius;

  const submissionState: 'none' | 'draft' | 'pending' | 'approved' | 'rejected' =
    latestSubmission?.status === 'rejected' ? 'rejected'
    : latestSubmission?.status === 'approved' ? 'approved'
    : latestSubmission?.status === 'pending' && !latestSubmission.post_link ? 'draft'
    : latestSubmission?.status === 'pending' ? 'pending'
    : getSubmittedQuests().includes(quest.id) ? 'pending' : 'none';
  // iOS (Safari + Chrome on iPhone/iPad) opens Apple Maps natively; everything else gets Google Maps.
  const isIOS = /iPad|iPhone|iPod/.test(navigator.userAgent);
  const mapsUrl = isIOS
    ? `https://maps.apple.com/?daddr=${quest.lat},${quest.lng}&dirflg=d`
    : `https://www.google.com/maps/dir/?api=1&destination=${quest.lat},${quest.lng}`;
  const distLabel = distM !== Infinity ? ` · ${Math.round(distM)}m away` : '';

  return (
    <>
      <motion.section
        className="clue-scroll-panel"
        initial={{ opacity: 0 }}
        animate={{ opacity: 1 }}
        exit={{ opacity: 0 }}
        transition={{ duration: 0.24, ease: [0.22, 1, 0.36, 1] }}
        onClick={() => selectQuest(null)}
      >
        <button
          type="button"
          className="scroll-close"
          onClick={(e) => { e.stopPropagation(); selectQuest(null); }}
          aria-label="Close quest"
        >
          <X size={20} />
        </button>
        <div
          className="scroll-paper"
          onClick={(e) => e.stopPropagation()}
        >
          <h1>{quest.title}</h1>
          <svg className="scroll-divider" viewBox="0 0 260 16" aria-hidden="true">
            <path d="M8 8h96M156 8h96" />
            <circle cx="130" cy="8" r="4" />
            <path d="M118 8c4-7 20-7 24 0" />
          </svg>

          <p className="quest-instructions">{quest.instructions}</p>

          <div className="reward-badge">
            <Trophy size={15} weight="fill" color="oklch(0.39 0.08 86)" />
            ₦{quest.reward_airtime_naira} airtime
          </div>

          {quest.solved_by ? (
            <div className="solved-state">
              {quest.solved_photo_url ? (
                <img src={quest.solved_photo_url} alt="Winner submission" />
              ) : null}
              <span>✓ Solved</span>
            </div>
          ) : submissionState === 'pending' || submissionState === 'approved' ? (
            <p className="muted-callout">Submission pending review.</p>
          ) : submissionState === 'draft' ? (
            <p className="muted-callout">Photo uploaded — open <strong>Quests</strong> in your profile drawer and paste the post link to send it to admin.</p>
          ) : !user ? (
            <button
              type="button"
              className="primary-button quest-signin-btn"
              onClick={(e) => { e.stopPropagation(); selectQuest(null); onSignIn?.(); }}
            >
              Sign in to submit
            </button>
          ) : !canSubmit ? (
            <div className="quest-action-stack">
              <a
                className="primary-button quest-directions-btn-primary"
                href={mapsUrl}
                target="_blank"
                rel="noopener noreferrer"
                onClick={(e) => e.stopPropagation()}
              >
                <NavigationArrow size={17} weight="fill" color="white" />
                Get Directions{distLabel}
              </a>
              <button
                type="button"
                className="primary-button quest-signin-btn"
                disabled
              >
                Must be within {quest.geofence_radius_m}m to submit
              </button>
            </div>
          ) : (
            <div className="quest-action-stack">
              <a
                className="primary-button quest-directions-btn-primary"
                href={mapsUrl}
                target="_blank"
                rel="noopener noreferrer"
                onClick={(e) => e.stopPropagation()}
              >
                <NavigationArrow size={17} weight="fill" color="white" />
                Get Directions{distLabel}
              </a>
              <Suspense fallback={null}>
                <QuestSubmitFlow quest={quest} />
              </Suspense>
            </div>
          )}
        </div>
      </motion.section>

      {quest.solved_by && quest.solver ? (
        <Suspense fallback={null}>
          <SolvedQuestOverlay quest={quest} />
        </Suspense>
      ) : null}
    </>
  );
}
