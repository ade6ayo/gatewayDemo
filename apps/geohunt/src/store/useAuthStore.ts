import { create } from 'zustand';
import type { Session, User } from '@supabase/supabase-js';
import type { UserProfile } from '../types';

interface AuthState {
  session: Session | null;
  user: User | null;
  userProfile: UserProfile | null;
  loading: boolean;
  setSession: (session: Session | null) => void;
  setProfile: (profile: UserProfile | null) => void;
  setLoading: (loading: boolean) => void;
  clear: () => void;
}

export const useAuthStore = create<AuthState>((set) => ({
  session: null,
  user: null,
  userProfile: null,
  loading: true,
  setSession: (session) => set({ session, user: session?.user || null, loading: false }),
  setProfile: (userProfile) => set({ userProfile }),
  setLoading: (loading) => set({ loading }),
  clear: () => set({ session: null, user: null, userProfile: null, loading: false }),
}));
