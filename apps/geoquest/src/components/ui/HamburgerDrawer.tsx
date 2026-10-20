import { useMemo } from 'react';
import { motion } from 'framer-motion';
import { Flag, X } from 'lucide-react';
import { useShallow } from 'zustand/react/shallow';
import { useQuestStore } from '../../store/useQuestStore';
import { useGPSStore } from '../../store/useGPSStore';
import type { Quest } from '../../types';

interface Props {
  onClose: () => void;
}

const NEARBY_RADIUS_KM = 35;

function haversineKm(lat1: number, lng1: number, lat2: number, lng2: number) {
  const R = 6371;
  const dLat = ((lat2 - lat1) * Math.PI) / 180;
  const dLng = ((lng2 - lng1) * Math.PI) / 180;
  const a =
    Math.sin(dLat / 2) ** 2 +
    Math.cos((lat1 * Math.PI) / 180) *
      Math.cos((lat2 * Math.PI) / 180) *
      Math.sin(dLng / 2) ** 2;
  return R * 2 * Math.atan2(Math.sqrt(a), Math.sqrt(1 - a));
}

function formatDistance(km: number): string {
  if (km < 1) return `${Math.round(km * 1000)} m`;
  return `${km.toFixed(1)} km`;
}

interface QuestWithDistance extends Quest {
  distanceKm: number;
}

export default function HamburgerDrawer({ onClose }: Props) {
  const quests = useQuestStore((s) => s.quests);
  const selectQuest = useQuestStore((s) => s.selectQuest);
  const { lat, lng } = useGPSStore(useShallow((s) => ({ lat: s.lat, lng: s.lng })));

  const { sortedUnsolved, completedQuests } = useMemo(() => {
    const withDist = quests
      .filter((q) => !q.solved_by)
      .map((q) => ({
        ...q,
        distanceKm:
          lat !== null && lng !== null
            ? haversineKm(lat, lng, q.lat, q.lng)
            : Infinity,
      }))
      .filter((q) => q.distanceKm <= NEARBY_RADIUS_KM || lat === null);
    withDist.sort((a, b) => a.distanceKm - b.distanceKm);
    return {
      sortedUnsolved: withDist,
      completedQuests: quests.filter((q) => q.solved_by !== null),
    };
  }, [quests, lat, lng]);

  const handleQuestTap = (quest: QuestWithDistance | Quest) => {
    selectQuest(quest.id);
    onClose();
  };

  const allEmpty = sortedUnsolved.length === 0 && completedQuests.length === 0;

  return (
    <motion.aside
      className="drawer drawer-left"
      initial={{ x: '-105%' }}
      animate={{ x: 0 }}
      exit={{ x: '-105%' }}
      transition={{ duration: 0.32, ease: [0.22, 1, 0.36, 1] }}
    >
      <div className="drawer-header">
        <h2>Quests Available</h2>
        <button type="button" className="icon-button" onClick={onClose} aria-label="Close quests drawer">
          <X size={19} />
        </button>
      </div>
      <p className="drawer-subtitle">Sorted by distance</p>

      {allEmpty ? (
        <div className="quest-empty">
          <Flag size={32} strokeWidth={1.5} />
          <p>No quests in your area yet</p>
        </div>
      ) : (
        <ul className="quest-list">
          {sortedUnsolved.map((quest, index) => (
            <li key={quest.id}>
              <button
                type="button"
                className="quest-row"
                onClick={() => handleQuestTap(quest)}
              >
                <span className="quest-row-title">{quest.title}</span>
                <span className="quest-row-distance">
                  {quest.distanceKm === Infinity ? '—' : formatDistance(quest.distanceKm)}
                </span>
              </button>
              {(index < sortedUnsolved.length - 1 || completedQuests.length > 0) ? (
                <div className="quest-divider" aria-hidden="true" />
              ) : null}
            </li>
          ))}

          {completedQuests.map((quest, index) => (
            <li key={quest.id}>
              <button
                type="button"
                className="quest-row quest-row-completed"
                onClick={() => handleQuestTap(quest)}
              >
                <span className="quest-row-title">{quest.title}</span>
                <span className="quest-completed-badge">Completed</span>
              </button>
              {index < completedQuests.length - 1 ? (
                <div className="quest-divider" aria-hidden="true" />
              ) : null}
            </li>
          ))}
        </ul>
      )}
    </motion.aside>
  );
}
