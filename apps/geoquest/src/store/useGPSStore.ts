import { create } from 'zustand';
import type { Scope } from '../types';

interface GPSState {
  lat: number | null;
  lng: number | null;
  accuracy: number | null;
  loading: boolean;
  error: string | null;
  ipScope: Scope;
  firstFixResolved: boolean;
  reverseGeocodeCalls: number;
  setIPLocation: (lat: number, lng: number, scope: Scope) => void;
  setPosition: (lat: number, lng: number, accuracy: number) => void;
  setError: (error: string | null) => void;
  setLoading: (loading: boolean) => void;
  markFirstFixResolved: () => void;
  incrementReverseGeocodeCalls: () => void;
}

export const DEFAULT_SCOPE: Scope = {
  city: 'Lagos',
  state: 'Lagos',
  country: 'Nigeria',
};

export const DEFAULT_CENTER = {
  lat: 6.5244,
  lng: 3.3792,
};

export const useGPSStore = create<GPSState>((set) => ({
  lat: null,
  lng: null,
  accuracy: null,
  loading: true,
  error: null,
  ipScope: DEFAULT_SCOPE,
  firstFixResolved: false,
  reverseGeocodeCalls: 0,
  setIPLocation: (lat, lng, scope) =>
    set({
      lat,
      lng,
      accuracy: null,
      loading: false,
      ipScope: scope,
    }),
  setPosition: (lat, lng, accuracy) =>
    set({
      lat,
      lng,
      accuracy,
      loading: false,
      error: null,
    }),
  setError: (error) => set({ error, loading: false }),
  setLoading: (loading) => set({ loading }),
  markFirstFixResolved: () => set({ firstFixResolved: true }),
  incrementReverseGeocodeCalls: () =>
    set((state) => ({ reverseGeocodeCalls: state.reverseGeocodeCalls + 1 })),
}));

function distanceMeters(
  fromLat: number,
  fromLng: number,
  toLat: number,
  toLng: number,
) {
  const radius = 6371000;
  const toRad = (value: number) => (value * Math.PI) / 180;
  const dLat = toRad(toLat - fromLat);
  const dLng = toRad(toLng - fromLng);
  const a =
    Math.sin(dLat / 2) * Math.sin(dLat / 2) +
    Math.cos(toRad(fromLat)) *
      Math.cos(toRad(toLat)) *
      Math.sin(dLng / 2) *
      Math.sin(dLng / 2);
  return 2 * radius * Math.atan2(Math.sqrt(a), Math.sqrt(1 - a));
}

let watchId: number | null = null;
let lastUpdate = 0;
let lastLat: number | null = null;
let lastLng: number | null = null;

export function startGPSWatch() {
  if (!navigator.geolocation || watchId !== null) return;

  useGPSStore.getState().setLoading(true);
  watchId = navigator.geolocation.watchPosition(
    (position) => {
      const now = Date.now();
      const { latitude, longitude, accuracy } = position.coords;
      if (now - lastUpdate < 800) return;
      if (
        lastLat !== null &&
        lastLng !== null &&
        distanceMeters(lastLat, lastLng, latitude, longitude) < 5
      ) {
        return;
      }

      lastUpdate = now;
      lastLat = latitude;
      lastLng = longitude;
      useGPSStore.getState().setPosition(latitude, longitude, accuracy);
    },
    (error) => {
      useGPSStore.getState().setError(error.message || 'Could not read GPS location.');
    },
    { enableHighAccuracy: true, timeout: 10000 },
  );
}

export function stopGPSWatch() {
  if (watchId !== null) {
    navigator.geolocation.clearWatch(watchId);
    watchId = null;
  }
}
