import { useEffect, useState } from 'react';
import { motion } from 'framer-motion';
import { Check, Clock, Copy, ExternalLink, Loader2, X } from 'lucide-react';
import { useShallow } from 'zustand/react/shallow';
import { useNotificationStore, type SubmissionWithMeta } from '../../store/useNotificationStore';
import { useAuthStore } from '../../store/useAuthStore';
import { fetchAppSettings } from '../../services/settings';
import { supabase } from '../../lib/supabase';

interface Props {
  onClose: () => void;
}

const URL_RE = /\S+\.\S+/;

function normalizeUrl(raw: string): string {
  const trimmed = raw.trim();
  if (/^https?:\/\//i.test(trimmed)) return trimmed;
  return `https://${trimmed}`;
}

function relativeDate(iso: string): string {
  const diff = Date.now() - new Date(iso).getTime();
  const mins = Math.floor(diff / 60000);
  if (mins < 60) return `${Math.max(1, mins)} min ago`;
  const hrs = Math.floor(mins / 60);
  if (hrs < 24) return `${hrs}h ago`;
  return `${Math.floor(hrs / 24)}d ago`;
}

function StatusDot({ sub }: { sub: SubmissionWithMeta }) {
  const isDraft =
    sub.submission_kind === 'quest' &&
    sub.status === 'pending' &&
    !sub.post_link;
  const cls = isDraft ? 'draft' : sub.status;
  const label = isDraft ? 'Draft (add link)' : sub.status[0].toUpperCase() + sub.status.slice(1);
  return (
    <span
      className={`status-dot status-dot-${cls}`}
      title={label}
      aria-label={`Status: ${cls}`}
    />
  );
}

function SignedThumb({ path }: { path: string }) {
  const [url, setUrl] = useState('');
  useEffect(() => {
    supabase.storage
      .from('submission-photos')
      .createSignedUrl(path, 3600, { transform: { width: 400, quality: 70, resize: 'cover' } })
      .then(({ data }) => { if (data?.signedUrl) setUrl(data.signedUrl); });
  }, [path]);

  if (!url) return <div className="sub-thumb sub-thumb-loading" />;
  return <img className="sub-thumb" src={url} alt="Submission photo" />;
}

interface LinkFormProps {
  submission: SubmissionWithMeta;
  postTemplate: string;
}

function LinkForm({ submission, postTemplate }: LinkFormProps) {
  const upsertSubmission = useNotificationStore((s) => s.upsertSubmission);
  const [link, setLink] = useState('');
  const [copied, setCopied] = useState(false);
  const [busy, setBusy] = useState(false);
  const [sent, setSent] = useState(false);
  const [error, setError] = useState('');

  if (sent) {
    return (
      <motion.p
        className="link-sent-msg"
        initial={{ opacity: 0, y: 6 }}
        animate={{ opacity: 1, y: 0 }}
        transition={{ duration: 0.3 }}
      >
        <Check size={15} />
        Sent to admin for verification.
      </motion.p>
    );
  }

  if (submission.post_link) {
    return (
      <p className="notif-pending-msg">
        <Clock size={14} />
        Submission pending review
      </p>
    );
  }

  const copyTemplate = async () => {
    try {
      await navigator.clipboard.writeText(postTemplate);
      setCopied(true);
      setTimeout(() => setCopied(false), 2000);
    } catch {
      // ignore
    }
  };

  const submitLink = async () => {
    if (!URL_RE.test(link)) { setError('Please enter a valid URL.'); return; }
    const finalUrl = normalizeUrl(link);
    setBusy(true);
    setError('');
    try {
      const { data: updated, error: dbError } = await supabase
        .from('submissions')
        .update({ post_link: finalUrl, link_submitted_at: new Date().toISOString() })
        .eq('id', submission.id)
        .select()
        .single();
      if (dbError) throw dbError;
      if (!updated) throw new Error('Update failed — please try again.');
      // Show success message BEFORE updating the store. Updating the store
      // causes the parent to unmount this component (it checks !sub.post_link),
      // which would swallow the success animation if we updated first.
      setSent(true);
      setTimeout(() => {
        upsertSubmission({ ...submission, post_link: finalUrl });
      }, 1200);
    } catch (caught) {
      setError(caught instanceof Error ? caught.message : 'Could not save link.');
      setBusy(false);
    }
  };

  return (
    <div className="link-form">
      <p className="link-form-instruction">
        Post the text below on Facebook, X, Instagram or TikTok with your photo, then paste the post link.
      </p>
      <div className="link-template-row">
        <textarea className="link-template-box" readOnly value={postTemplate} rows={2} />
        <button type="button" className="icon-button" onClick={() => void copyTemplate()} aria-label="Copy post text">
          {copied ? <Check size={15} /> : <Copy size={15} />}
        </button>
      </div>
      <input
        className="link-input"
        placeholder="Paste your post URL here"
        value={link}
        onChange={(e) => setLink(e.target.value)}
      />
      {error ? <p className="form-error">{error}</p> : null}
      <button
        type="button"
        className="primary-button"
        disabled={!URL_RE.test(link) || busy}
        onClick={() => void submitLink()}
        style={busy ? { opacity: 0.8, cursor: 'not-allowed' } : undefined}
      >
        {busy ? (
          <>
            <motion.span
              animate={{ rotate: 360 }}
              transition={{ duration: 0.8, repeat: Infinity, ease: 'linear' }}
              style={{ display: 'inline-flex' }}
            >
              <Loader2 size={16} />
            </motion.span>
            Sending…
          </>
        ) : 'Submit Final'}
      </button>
    </div>
  );
}

export default function NotificationDrawer({ onClose }: Props) {
  const { submissions, markSeen } = useNotificationStore(
    useShallow((s) => ({ submissions: s.submissions, markSeen: s.markSeen })),
  );
  const user = useAuthStore((s) => s.user);
  const [postTemplate, setPostTemplate] = useState('');

  useEffect(() => {
    markSeen();
    void fetchAppSettings().then((s) => setPostTemplate(s.post_template));
  }, [markSeen]);

  useEffect(() => {
    if (!user) return;
    const channel = supabase
      .channel(`user-submissions-${user.id}`)
      .on(
        'postgres_changes',
        {
          event: 'UPDATE',
          schema: 'public',
          table: 'submissions',
          filter: `user_id=eq.${user.id}`,
        },
        (payload) => {
          const updated = payload.new as SubmissionWithMeta;
          // When a quest submission is rejected, clear it from the local
          // submitted_quests cache so the player can resubmit.
          if (updated.status === 'rejected' && updated.quest_id) {
            try {
              const prev = JSON.parse(localStorage.getItem('submitted_quests') || '[]') as string[];
              localStorage.setItem('submitted_quests', JSON.stringify(prev.filter((id) => id !== updated.quest_id)));
            } catch { /* ignore */ }
          }
          useNotificationStore.getState().upsertSubmission(updated);
        },
      )
      .subscribe();
    return () => { void supabase.removeChannel(channel); };
  }, [user]);

  return (
    <motion.aside
      className="drawer drawer-right"
      initial={{ x: '105%' }}
      animate={{ x: 0 }}
      exit={{ x: '105%' }}
      transition={{ duration: 0.32, ease: [0.22, 1, 0.36, 1] }}
    >
      <div className="drawer-header">
        <h2>Quests</h2>
        <button type="button" className="icon-button" onClick={onClose} aria-label="Close">
          <X size={19} />
        </button>
      </div>

      {submissions.length === 0 ? (
        <p className="drawer-subtitle">No submissions yet.</p>
      ) : (
        <ul className="notif-list">
          {submissions.map((sub) => (
            <li key={sub.id} className="notif-card">
              {/* Top row: thumbnail + info + status dot */}
              <div className="notif-row">
                <SignedThumb path={sub.photo_url} />
                <div className="notif-info">
                  <div className="notif-card-header">
                    <span className="notif-card-title">{sub.quest_title}</span>
                    <span className="notif-card-date">{relativeDate(sub.submitted_at)}</span>
                  </div>
                  <div className="notif-meta-row">
                    <span className="notif-prize">₦{sub.reward_airtime_naira} airtime</span>
                    <StatusDot sub={sub} />
                  </div>
                </div>
              </div>

              {/* Stage 2: paste social link */}
              {sub.status === 'pending' && !sub.post_link ? (
                <LinkForm submission={sub} postTemplate={postTemplate} />
              ) : null}

              {/* After link submitted, waiting for review */}
              {sub.post_link && sub.status === 'pending' ? (
                <a
                  href={sub.post_link}
                  target="_blank"
                  rel="noopener noreferrer"
                  className="notif-post-link"
                >
                  <ExternalLink size={13} />
                  View social post
                </a>
              ) : null}

              {sub.status === 'approved' ? (
                <p className="notif-approved-msg">
                  ₦{sub.reward_airtime_naira} reward disbursed.
                </p>
              ) : null}

              {sub.status === 'rejected' ? (
                <p className="notif-rejected-msg">Try again on another quest.</p>
              ) : null}
            </li>
          ))}
        </ul>
      )}
    </motion.aside>
  );
}
