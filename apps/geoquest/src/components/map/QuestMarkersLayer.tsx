import { useEffect, useRef } from 'react';
import { Marker, useMap } from 'react-map-gl/maplibre';
import type { MarkerEvent } from 'react-map-gl/maplibre';
import { useShallow } from 'zustand/react/shallow';
import { useQuestStore } from '../../store/useQuestStore';
import { useNotificationStore } from '../../store/useNotificationStore';

function FlagPin({ solved, pending, selected }: { solved: boolean; pending: boolean; selected: boolean }) {
  const flagFill = solved ? '#ffffff' : pending ? '#f97316' : '#dc2626';
  const flagStroke = solved ? '#94a3b8' : 'none';
  const flagStrokeWidth = solved ? '1' : '0';
  return (
    <svg
      xmlns="http://www.w3.org/2000/svg"
      width={selected ? 48 : 36}
      height={selected ? 60 : 45}
      viewBox="0 0 32 40"
      style={{
        display: 'block',
        cursor: 'pointer',
        filter: selected
          ? 'drop-shadow(0 3px 8px rgba(0,0,0,0.6))'
          : 'drop-shadow(0 1px 3px rgba(0,0,0,0.35))',
        transition: 'width 0.2s ease, height 0.2s ease, filter 0.2s ease',
      }}
      aria-hidden="true"
    >
      <line x1="6" y1="2" x2="6" y2="38" stroke="#1a1a1a" strokeWidth="2.5" strokeLinecap="round" />
      <path d="M6 3 Q18 5 26 10 Q18 16 6 14 Z" fill={flagFill} stroke={flagStroke} strokeWidth={flagStrokeWidth} />
    </svg>
  );
}

export function QuestMarkersLayer() {
  const { current: mapRef } = useMap();
  const { quests, selectedQuestId } = useQuestStore(
    useShallow((s) => ({ quests: s.quests, selectedQuestId: s.selectedQuestId })),
  );
  const selectQuest = useQuestStore((s) => s.selectQuest);

  // Collect quest IDs where the current user has a pending submission
  const pendingQuestIds = useNotificationStore(
    useShallow((s) =>
      s.submissions
        .filter((sub) =>
          sub.submission_kind === 'quest' &&
          sub.status === 'pending' &&
          sub.post_link !== null &&
          sub.quest_id
        )
        .map((sub) => sub.quest_id as string),
    ),
  );
  const pendingSet = new Set(pendingQuestIds);

  // Stable ref so the flyTo effect doesn't re-trigger on quest list updates
  const questsRef = useRef(quests);
  questsRef.current = quests;

  // Fly to the selected quest whenever the selection changes
  useEffect(() => {
    if (!selectedQuestId || !mapRef) return;
    const quest = questsRef.current.find((q) => q.id === selectedQuestId);
    if (!quest) return;
    mapRef.flyTo({ center: [quest.lng, quest.lat], zoom: 16, duration: 1000, essential: true });
  }, [selectedQuestId, mapRef]);

  return (
    <>
      {quests.map((quest) => (
        <Marker
          key={quest.id}
          latitude={quest.lat}
          longitude={quest.lng}
          anchor="bottom"
          onClick={(e: MarkerEvent<MouseEvent>) => {
            e.originalEvent.stopPropagation();
            selectQuest(quest.id);
          }}
        >
          <FlagPin
            solved={quest.solved_by !== null}
            pending={!quest.solved_by && pendingSet.has(quest.id)}
            selected={quest.id === selectedQuestId}
          />
        </Marker>
      ))}
    </>
  );
}
