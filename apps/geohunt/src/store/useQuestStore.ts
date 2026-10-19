import { create } from 'zustand';
import { useShallow } from 'zustand/react/shallow';
import type { Quest } from '../types';

interface QuestState {
  quests: Quest[];
  selectedQuestId: string | null;
  scrollPanelOpen: boolean;
  loading: boolean;
  error: string | null;
  setQuests: (quests: Quest[]) => void;
  selectQuest: (id: string | null) => void;
  setScrollPanelOpen: (open: boolean) => void;
  upsertQuest: (quest: Quest) => void;
  deleteQuest: (id: string) => void;
  setLoading: (loading: boolean) => void;
  setError: (error: string | null) => void;
}

export const useQuestStore = create<QuestState>((set) => ({
  quests: [],
  selectedQuestId: null,
  scrollPanelOpen: false,
  loading: false,
  error: null,
  setQuests: (quests) => set({ quests }),
  selectQuest: (id) => set({ selectedQuestId: id, scrollPanelOpen: id !== null }),
  setScrollPanelOpen: (scrollPanelOpen) => set({ scrollPanelOpen }),
  upsertQuest: (quest) =>
    set((state) => {
      const existing = state.quests.find((q) => q.id === quest.id);
      // Merge so realtime payloads (which lack joined fields like solver) don't wipe them out
      const merged = existing ? { ...existing, ...quest } : quest;
      return {
        quests: existing
          ? state.quests.map((q) => (q.id === quest.id ? merged : q))
          : [...state.quests, quest],
      };
    }),
  deleteQuest: (id) =>
    set((state) => ({ quests: state.quests.filter((q) => q.id !== id) })),
  setLoading: (loading) => set({ loading }),
  setError: (error) => set({ error }),
}));

export const selectSelectedQuest = (state: QuestState) =>
  state.quests.find((q) => q.id === state.selectedQuestId) ?? null;

export function useSelectedQuest() {
  return useQuestStore(selectSelectedQuest);
}

export function useQuestState() {
  return useQuestStore(
    useShallow((s) => ({
      quests: s.quests,
      selectedQuestId: s.selectedQuestId,
      scrollPanelOpen: s.scrollPanelOpen,
      loading: s.loading,
    })),
  );
}
