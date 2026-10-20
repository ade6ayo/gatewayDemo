import { Info } from 'lucide-react';
import { motion } from 'framer-motion';
import { useNotificationBadge, useNotificationStore } from '../../store/useNotificationStore';

export function InfoButton() {
  const { visible, variant } = useNotificationBadge();
  const openDrawer = useNotificationStore((s) => s.openDrawer);

  if (!visible) return null;

  return (
    <motion.button
      key="info-btn"
      type="button"
      className="floating-button top-right"
      style={{ right: 68 }}
      onClick={openDrawer}
      aria-label="Open notifications"
      initial={{ opacity: 0, scale: 0.6 }}
      animate={{ opacity: 1, scale: 1 }}
      exit={{ opacity: 0, scale: 0.6 }}
    >
      <Info size={20} />
      {variant ? (
        <span
          className={`notif-dot notif-dot-${variant}`}
          aria-hidden="true"
        />
      ) : null}
    </motion.button>
  );
}
