import { useState } from 'react';
import { motion } from 'framer-motion';
import { Trophy, X } from 'lucide-react';
import type { Quest } from '../../types';

function relativeDate(iso: string): string {
  const diff = Date.now() - new Date(iso).getTime();
  const mins = Math.floor(diff / 60000);
  if (mins < 60) return `${Math.max(1, mins)} minutes ago`;
  const hrs = Math.floor(mins / 60);
  if (hrs < 24) return `${hrs} hours ago`;
  return `${Math.floor(hrs / 24)} days ago`;
}

interface Props {
  quest: Quest;
}

export default function SolvedQuestOverlay({ quest }: Props) {
  const [open, setOpen] = useState(false);

  return (
    <>
      <button
        type="button"
        className="solved-winner-trigger"
        onClick={() => setOpen(true)}
        aria-label="View quest winner"
      >
        View winner
      </button>

      {open ? (
        <motion.div
          className="solved-overlay-backdrop"
          initial={{ opacity: 0 }}
          animate={{ opacity: 1 }}
          exit={{ opacity: 0 }}
          onClick={() => setOpen(false)}
        >
          <motion.div
            className="solved-overlay-card"
            initial={{ scale: 0.88, opacity: 0 }}
            animate={{ scale: 1, opacity: 1 }}
            exit={{ scale: 0.88, opacity: 0 }}
            onClick={(e) => e.stopPropagation()}
          >
            <button
              type="button"
              className="icon-button solved-overlay-close"
              onClick={() => setOpen(false)}
              aria-label="Close"
            >
              <X size={18} />
            </button>

            {quest.solved_photo_url ? (
              <img
                src={quest.solved_photo_url}
                alt="Winner submission"
                className="solved-overlay-photo"
              />
            ) : null}

            <div className="solved-overlay-info">
              <div className="solved-overlay-avatar">
                {(quest.solver?.username ?? 'U').slice(0, 2).toUpperCase()}
              </div>
              <div>
                <p className="solved-overlay-username">{quest.solver?.username ?? 'Unknown'}</p>
                <p className="solved-overlay-meta">
                  {quest.solver?.clues_solved ?? 0} quests solved
                </p>
                {quest.solved_at ? (
                  <p className="solved-overlay-meta">Solved {relativeDate(quest.solved_at)}</p>
                ) : null}
              </div>
            </div>

            <div className="reward-badge" style={{ alignSelf: 'flex-start' }}>
              <Trophy size={14} />
              ₦{quest.reward_airtime_naira} earned
            </div>
          </motion.div>
        </motion.div>
      ) : null}
    </>
  );
}
