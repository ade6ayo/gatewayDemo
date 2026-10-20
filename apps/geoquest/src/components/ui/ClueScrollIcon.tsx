import { motion } from 'framer-motion';
import { ScrollText } from 'lucide-react';
import { useClueStore } from '../../store/useClueStore';

export function ClueScrollIcon() {
  const setScrollPanelOpen = useClueStore((state) => state.setScrollPanelOpen);

  return (
    <motion.button
      layoutId="clue-scroll"
      type="button"
      className="scroll-icon"
      initial={{ opacity: 0, x: 40, scale: 0.9 }}
      animate={{ opacity: 1, x: 0, scale: 1 }}
      exit={{ opacity: 0, x: 40, scale: 0.9 }}
      onClick={() => setScrollPanelOpen(true)}
      aria-label="Open clue scroll"
    >
      <ScrollText size={24} />
    </motion.button>
  );
}
