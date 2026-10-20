import { useEffect, useState } from 'react';
import { AnimatePresence, motion } from 'framer-motion';
import { ChevronDown, X } from 'lucide-react';
import { useShallow } from 'zustand/react/shallow';
import { supabase } from '../../lib/supabase';
import { selectSelectedClue, useClueStore } from '../../store/useClueStore';
import { useAuthStore } from '../../store/useAuthStore';
import SubmitFlow from './SubmitFlow';

export default function ClueScrollPanel() {
  const clue = useClueStore(selectSelectedClue);
  const { isInsideRegion, setScrollPanelOpen, updateClue } = useClueStore(
    useShallow((state) => ({
      isInsideRegion: state.isInsideRegion,
      setScrollPanelOpen: state.setScrollPanelOpen,
      updateClue: state.updateClue,
    })),
  );
  const user = useAuthStore((state) => state.user);
  const [hintOpen, setHintOpen] = useState(false);

  useEffect(() => {
    if (!clue) return undefined;
    const channel = supabase
      .channel(`clue-${clue.id}`)
      .on(
        'postgres_changes',
        {
          event: 'UPDATE',
          schema: 'public',
          table: 'clues',
          filter: `id=eq.${clue.id}`,
        },
        (payload) => {
          updateClue(payload.new as typeof clue);
        },
      )
      .subscribe();

    return () => {
      void supabase.removeChannel(channel);
    };
  }, [clue, updateClue]);

  if (!clue) return null;

  return (
    <motion.section
      layoutId="clue-scroll"
      className="clue-scroll-panel"
      initial={{ opacity: 0 }}
      animate={{ opacity: 1 }}
      exit={{ opacity: 0 }}
      transition={{ duration: 0.24, ease: [0.22, 1, 0.36, 1] }}
    >
      <button
        type="button"
        className="scroll-close"
        onClick={() => setScrollPanelOpen(false)}
        aria-label="Close clue"
      >
        <X size={20} />
      </button>
      <div className="scroll-paper">
        <h1>{clue.title}</h1>
        <svg className="scroll-divider" viewBox="0 0 260 16" aria-hidden="true">
          <path d="M8 8h96M156 8h96" />
          <circle cx="130" cy="8" r="4" />
          <path d="M118 8c4-7 20-7 24 0" />
        </svg>
        <p className="riddle">{clue.riddle}</p>

        <button type="button" className="hint-toggle" onClick={() => setHintOpen((open) => !open)}>
          Show Hint
          <ChevronDown size={17} className={hintOpen ? 'rotated' : ''} />
        </button>
        <AnimatePresence initial={false}>
          {hintOpen ? (
            <motion.p
              className="hint-box"
              initial={{ height: 0, opacity: 0 }}
              animate={{ height: 'auto', opacity: 1 }}
              exit={{ height: 0, opacity: 0 }}
            >
              {clue.hint}
            </motion.p>
          ) : null}
        </AnimatePresence>

        <div className="reward-badge">Trophy NGN {clue.reward_airtime_naira} airtime</div>

        {clue.solved_by ? (
          <div className="solved-state">
            {clue.solved_photo_url ? (
              <img src={clue.solved_photo_url} alt="Solved player submission" />
            ) : null}
            <span>✓ Solved</span>
          </div>
        ) : user && isInsideRegion ? (
          <SubmitFlow clue={clue} />
        ) : user ? (
          <p className="muted-callout">Travel to this location to submit.</p>
        ) : (
          <p className="muted-callout">Sign in to submit.</p>
        )}
      </div>
    </motion.section>
  );
}
