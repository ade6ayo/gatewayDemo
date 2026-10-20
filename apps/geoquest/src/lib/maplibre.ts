export function getMapTilerStyleUrl() {
  const key = import.meta.env.VITE_MAPTILER_KEY as string | undefined;
  if (!key) {
    return 'https://demotiles.maplibre.org/style.json';
  }

  return `https://api.maptiler.com/maps/streets-v2/style.json?key=${key}`;
}
