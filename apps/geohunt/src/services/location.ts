import type { Scope } from '../types';
import { useClueStore } from '../store/useClueStore';
import { useGPSStore } from '../store/useGPSStore';

export async function resolveIPLocation() {
  const response = await fetch('http://ip-api.com/json');
  const data = (await response.json()) as {
    lat?: number;
    lon?: number;
    city?: string;
    regionName?: string;
    country?: string;
  };

  if (typeof data.lat !== 'number' || typeof data.lon !== 'number') {
    throw new Error('IP geolocation did not return coordinates.');
  }

  const scope: Scope = {
    city: data.city || 'Lagos',
    state: data.regionName || 'Lagos',
    country: data.country || 'Nigeria',
  };
  useGPSStore.getState().setIPLocation(data.lat, data.lon, scope);
  useClueStore.getState().setScope(scope);
}

export async function reverseGeocodeScope(lat: number, lng: number) {
  const gpsStore = useGPSStore.getState();
  if (gpsStore.reverseGeocodeCalls >= 2) return null;

  const key = import.meta.env.VITE_OPENCAGE_KEY as string | undefined;
  if (!key) return null;

  gpsStore.incrementReverseGeocodeCalls();
  const response = await fetch(
    `https://api.opencagedata.com/geocode/v1/json?q=${lat}+${lng}&key=${key}&no_annotations=1&limit=1`,
  );
  const data = await response.json();
  const components = data?.results?.[0]?.components;
  if (!components) return null;

  const scope: Scope = {
    city: components.city || components.town || components.village || '',
    state: components.state_district || components.state || '',
    country: components.country || '',
  };
  useClueStore.getState().setScope(scope);
  return scope;
}
