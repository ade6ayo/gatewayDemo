import { create } from 'zustand';
import { useShallow } from 'zustand/react/shallow';
import type { Submission } from '../types';

export interface SubmissionWithMeta extends Submission {
  quest_title: string;
  reward_airtime_naira: number;
  _seenAt?: number;
}

interface NotificationState {
  submissions: SubmissionWithMeta[];
  drawerOpen: boolean;
  lastSeenAt: number;
  setSubmissions: (submissions: SubmissionWithMeta[]) => void;
  upsertSubmission: (submission: SubmissionWithMeta) => void;
  openDrawer: () => void;
  closeDrawer: () => void;
  markSeen: () => void;
}

function readLastSeen(): number {
  try {
    return parseInt(localStorage.getItem('notif_last_seen') || '0', 10);
  } catch {
    return 0;
  }
}

export const useNotificationStore = create<NotificationState>((set) => ({
  submissions: [],
  drawerOpen: false,
  lastSeenAt: readLastSeen(),
  setSubmissions: (submissions) => set({ submissions }),
  upsertSubmission: (submission) =>
    set((state) => {
      const exists = state.submissions.some((s) => s.id === submission.id);
      const next = exists
        ? state.submissions.map((s) => (s.id === submission.id ? submission : s))
        : [submission, ...state.submissions];
      return { submissions: next };
    }),
  openDrawer: () => set({ drawerOpen: true }),
  closeDrawer: () => set({ drawerOpen: false }),
  markSeen: () => {
    const now = Date.now();
    try {
      localStorage.setItem('notif_last_seen', String(now));
    } catch {
      // ignore
    }
    set({ lastSeenAt: now });
  },
}));

export function useNotificationBadge() {
  return useNotificationStore(
    useShallow((s) => {
      const hasAwaitingLink = s.submissions.some(
        (sub) => sub.submission_kind === 'quest' && !sub.post_link && sub.status === 'pending',
      );
      const hasUnseen = s.submissions.some(
        (sub) =>
          sub.status === 'approved' &&
          new Date(sub.submitted_at).getTime() > s.lastSeenAt,
      );
      const visible = s.submissions.length > 0;
      const variant: 'red' | 'green' | null = hasAwaitingLink
        ? 'red'
        : hasUnseen
          ? 'green'
          : null;
      return { visible, variant };
    }),
  );
}
