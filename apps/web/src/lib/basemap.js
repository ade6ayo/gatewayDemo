// Basemap style resolution.
//
// Mirrors GeoQuest's getMapTilerStyleUrl() so a single VITE_MAPTILER_KEY serves
// both apps — but with a different fallback. GeoQuest falls back to
// demotiles.maplibre.org, which only renders country outlines and shows nothing
// at the zoom levels this map uses. CARTO's hosted styles need no key and do
// render streets, so they are the default here.

const MAPTILER_KEY = import.meta.env.VITE_MAPTILER_KEY;

export const BASEMAPS = {
    dark: {
        label: 'Dark',
        url: MAPTILER_KEY
            ? `https://api.maptiler.com/maps/streets-v2-dark/style.json?key=${MAPTILER_KEY}`
            : 'https://basemaps.cartocdn.com/gl/dark-matter-gl-style/style.json',
    },
    light: {
        label: 'Light',
        url: MAPTILER_KEY
            ? `https://api.maptiler.com/maps/streets-v2/style.json?key=${MAPTILER_KEY}`
            : 'https://basemaps.cartocdn.com/gl/positron-gl-style/style.json',
    },
};

export const usingMapTiler = Boolean(MAPTILER_KEY);

// Ogun State, roughly. Used for the initial fit so the map opens on the whole
// state rather than wherever the first asset happens to be.
export const OGUN_VIEW = { longitude: 3.55, latitude: 7.05, zoom: 7.6 };
