import { create } from 'zustand';
import type { Clue, Scope, ScopeLevel } from '../types';
import { DEFAULT_SCOPE } from './useGPSStore';

interface ClueState {
  clues: Clue[];
  selectedClueId: string | null;
  scope: Scope;
  scopeLevel: ScopeLevel;
  loading: boolean;
  error: string | null;
  scrollPanelOpen: boolean;
  isInsideRegion: boolean;
  setClues: (clues: Clue[]) => void;
  setSelectedClue: (id: string | null) => void;
  updateClue: (clue: Clue) => void;
  setScope: (scope: Partial<Scope>) => void;
  setScopeLevel: (level: ScopeLevel) => void;
  setLoading: (loading: boolean) => void;
  setError: (error: string | null) => void;
  setScrollPanelOpen: (open: boolean) => void;
  setIsInsideRegion: (inside: boolean) => void;
}

export const useClueStore = create<ClueState>((set) => ({
  clues: [],
  selectedClueId: null,
  scope: DEFAULT_SCOPE,
  scopeLevel: 'city',
  loading: false,
  error: null,
  scrollPanelOpen: false,
  isInsideRegion: false,
  setClues: (clues) => set({ clues }),
  setSelectedClue: (id) =>
    set({
      selectedClueId: id,
      scrollPanelOpen: false,
      isInsideRegion: false,
    }),
  updateClue: (clue) =>
    set((state) => ({
      clues: state.clues.map((existing) => (existing.id === clue.id ? clue : existing)),
    })),
  setScope: (scope) => set((state) => ({ scope: { ...state.scope, ...scope } })),
  setScopeLevel: (scopeLevel) => set({ scopeLevel }),
  setLoading: (loading) => set({ loading }),
  setError: (error) => set({ error }),
  setScrollPanelOpen: (scrollPanelOpen) => set({ scrollPanelOpen }),
  setIsInsideRegion: (isInsideRegion) => set({ isInsideRegion }),
}));

export const selectSelectedClue = (state: ClueState) =>
  state.clues.find((clue) => clue.id === state.selectedClueId) || null;
