import { useEffect, useMemo, useState } from 'react';
import Map, { Marker } from 'react-map-gl/maplibre';
import { Check, ExternalLink, X } from 'lucide-react';
import { motion } from 'framer-motion';
import { supabase } from '../../lib/supabase';
import { getMapTilerStyleUrl } from '../../lib/maplibre';
import { disburseAirtime } from '../../services/RewardService';
import type { AdminSubmission } from '../../types';

interface Props {
  submission: AdminSubmission;
  onResolved: (id: string) => void;
}

function relativeTime(value: string) {
  const diff = Date.now() - new Date(value).getTime();
  const minutes = Math.max(1, Math.round(diff / 60000));
  if (minutes < 60) return `${minutes} min ago`;
  const hours = Math.round(minutes / 60);
  if (hours < 24) return `${hours}h ago`;
  return `${Math.round(hours / 24)}d ago`;
}

export function SubmissionCard({ submission, onResolved }: Props) {
  const [signedUrl, setSignedUrl] = useState('');
  const [lightboxOpen, setLightboxOpen] = useState(false);
  const [locationOpen, setLocationOpen] = useState(false);
  const [busy, setBusy] = useState<'approve' | 'reject' | null>(null);
  const [error, setError] = useState('');
  const styleUrl = useMemo(() => getMapTilerStyleUrl(), []);
  const isQuest = submission.submission_kind === 'quest';
  const hasQuestLocation = submission.quest_lat != null && submission.quest_lng != null;

  useEffect(() => {
    supabase.storage
      .from('submission-photos')
      .createSignedUrl(submission.photo_url, 3600)
      .then(({ data }) => { if (data?.signedUrl) setSignedUrl(data.signedUrl); });
  }, [submission.photo_url]);

  const approve = async () => {
    setBusy('approve');
    setError('');
    try {
      const { error: submissionError } = await supabase
        .from('submissions')
        .update({ status: 'approved' })
        .eq('id', submission.id);
      if (submissionError) throw submissionError;

      const { data: signed, error: signedError } = await supabase.storage
        .from('submission-photos')
        .createSignedUrl(submission.photo_url, 60 * 60 * 24 * 365);
      if (signedError) throw signedError;

      if (isQuest && submission.quest_id) {
        const { error: questError } = await supabase
          .from('quests')
          .update({
            solved_by: submission.user_id,
            solved_at: new Date().toISOString(),
            solved_photo_url: signed.signedUrl,
            solved_submission_link: submission.post_link,
          })
          .eq('id', submission.quest_id);
        if (questError) throw questError;
      } else if (submission.clue_id) {
        const { error: clueError } = await supabase
          .from('clues')
          .update({
            solved_by: submission.user_id,
            solved_at: new Date().toISOString(),
            solved_photo_url: signed.signedUrl,
          })
          .eq('id', submission.clue_id);
        if (clueError) throw clueError;
      }

      const { data: profile } = await supabase
        .from('profiles')
        .select('clues_solved')
        .eq('id', submission.user_id)
        .single();
      await supabase
        .from('profiles')
        .update({ clues_solved: (profile?.clues_solved || 0) + 1 })
        .eq('id', submission.user_id);

      await disburseAirtime(submission.phone_number, submission.reward_airtime_naira);
      onResolved(submission.id);
    } catch (caught) {
      setError(caught instanceof Error ? caught.message : 'Approval failed.');
    } finally {
      setBusy(null);
    }
  };

  const decline = async () => {
    setBusy('reject');
    setError('');
    try {
      const { error: submissionError } = await supabase
        .from('submissions')
        .update({ status: 'rejected' })
        .eq('id', submission.id);
      if (submissionError) throw submissionError;
      onResolved(submission.id);
    } catch (caught) {
      setError(caught instanceof Error ? caught.message : 'Decline failed.');
    } finally {
      setBusy(null);
    }
  };

  return (
    <>
      <motion.article layout exit={{ opacity: 0, y: 12 }} className="submission-card">

        {/* ── Visual area: full-bleed photo with overlaid map ── */}
        <div
          className="card-visual"
          role="button"
          tabIndex={0}
          aria-label="Inspect photo"
          onClick={() => signedUrl && setLightboxOpen(true)}
          onKeyDown={(e) => e.key === 'Enter' && signedUrl && setLightboxOpen(true)}
        >
          <div className="submission-kind-badge">{isQuest ? 'Quest' : 'Clue'}</div>

          {signedUrl ? (
            <img src={signedUrl} alt="Player submission" className="card-photo" />
          ) : (
            <div className="card-photo-loading" />
          )}

          {/* Mini-map: bottom-right overlay */}
          <button
            type="button"
            className="card-map-overlay"
            onClick={(e) => { e.stopPropagation(); setLocationOpen(true); }}
            aria-label="Verify player location"
          >
            <Map
              initialViewState={{ latitude: submission.gps_lat, longitude: submission.gps_lng, zoom: 14 }}
              mapLib={import('maplibre-gl')}
              mapStyle={styleUrl}
              interactive={false}
              attributionControl={false}
              style={{ width: '100%', height: '100%' }}
            >
              <Marker latitude={submission.gps_lat} longitude={submission.gps_lng}>
                <div className="loc-dot loc-dot-user" />
              </Marker>
            </Map>
          </button>
        </div>

        {/* ── Info footer ── */}
        <div className="submission-body">
          <div>
            <h3>{submission.clue_title}</h3>
            {!isQuest && submission.answer_name ? (
              <p className="answer-name">{submission.answer_name}</p>
            ) : null}
            <p>
              {submission.username} · {submission.phone_number}
              {submission.network ? ` · ${submission.network}` : ''}
              {' · '}{relativeTime(submission.submitted_at)}
            </p>
            <p className="coords">
              {submission.gps_lat.toFixed(5)}, {submission.gps_lng.toFixed(5)}
              {isQuest && submission.post_link ? (
                <>
                  {' · '}
                  <a
                    href={submission.post_link}
                    target="_blank"
                    rel="noopener noreferrer"
                    className="admin-inline-link"
                    onClick={(e) => e.stopPropagation()}
                  >
                    link <ExternalLink size={11} style={{ display: 'inline', verticalAlign: 'middle' }} />
                  </a>
                </>
              ) : null}
            </p>
          </div>
          {error ? <p className="form-error">{error}</p> : null}
          {submission.status === 'pending' ? (
            <div className="admin-actions">
              <button type="button" className="approve-button" onClick={() => void approve()} disabled={Boolean(busy)}>
                <Check size={18} />
                {busy === 'approve' ? 'Approving…' : 'Approve'}
              </button>
              <button type="button" className="decline-button" onClick={() => void decline()} disabled={Boolean(busy)}>
                <X size={18} />
                {busy === 'reject' ? 'Declining…' : 'Decline'}
              </button>
            </div>
          ) : (
            <div className={`admin-status-badge admin-status-${submission.status}`}>
              {submission.status === 'approved' ? (
                <>
                  <Check size={14} /> Approved
                </>
              ) : (
                <>
                  <X size={14} /> Declined
                </>
              )}
            </div>
          )}
        </div>
      </motion.article>

      {/* Photo lightbox */}
      {lightboxOpen && signedUrl ? (
        <div
          className="photo-lightbox"
          onClick={() => setLightboxOpen(false)}
          role="dialog"
          aria-modal="true"
          aria-label="Photo inspection"
        >
          <img src={signedUrl} alt="Full size player submission" className="lightbox-img" />
          <button
            type="button"
            className="lightbox-close"
            onClick={() => setLightboxOpen(false)}
            aria-label="Close"
          >
            <X size={22} />
          </button>
        </div>
      ) : null}

      {/* Location verification modal */}
      {locationOpen ? (
        <div
          className="location-modal-overlay"
          onClick={() => setLocationOpen(false)}
          role="dialog"
          aria-modal="true"
          aria-label="Location verification"
        >
          <div className="location-modal" onClick={(e) => e.stopPropagation()}>
            <div className="location-modal-map">
              <Map
                initialViewState={{
                  latitude: (submission.gps_lat + (submission.quest_lat ?? submission.gps_lat)) / 2,
                  longitude: (submission.gps_lng + (submission.quest_lng ?? submission.gps_lng)) / 2,
                  zoom: hasQuestLocation ? 13 : 15,
                }}
                mapLib={import('maplibre-gl')}
                mapStyle={styleUrl}
                attributionControl={false}
                style={{ width: '100%', height: '100%' }}
                onLoad={({ target }) => {
                  if (!hasQuestLocation) return;
                  target.fitBounds(
                    [
                      [Math.min(submission.gps_lng, submission.quest_lng!) - 0.004, Math.min(submission.gps_lat, submission.quest_lat!) - 0.004],
                      [Math.max(submission.gps_lng, submission.quest_lng!) + 0.004, Math.max(submission.gps_lat, submission.quest_lat!) + 0.004],
                    ],
                    { padding: 48, animate: false },
                  );
                }}
              >
                <Marker latitude={submission.gps_lat} longitude={submission.gps_lng}>
                  <div className="loc-dot loc-dot-user" title="Player location" />
                </Marker>
                {hasQuestLocation ? (
                  <Marker latitude={submission.quest_lat!} longitude={submission.quest_lng!}>
                    <div className="loc-dot loc-dot-quest" title="Quest location" />
                  </Marker>
                ) : null}
              </Map>
            </div>
            <div className="location-modal-footer">
              <div className="location-legend">
                <span className="loc-dot loc-dot-user" />
                <span>Player</span>
                {hasQuestLocation ? (
                  <>
                    <span className="loc-dot loc-dot-quest" />
                    <span>Quest</span>
                  </>
                ) : null}
              </div>
              <button type="button" className="secondary-button" onClick={() => setLocationOpen(false)}>
                Close
              </button>
            </div>
          </div>
        </div>
      ) : null}
    </>
  );
}
