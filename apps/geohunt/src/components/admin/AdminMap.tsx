import { useMemo, useRef, useState } from 'react';
import Map, { Marker, type MapRef } from 'react-map-gl/maplibre';
import { MapPin } from 'lucide-react';
import { getMapTilerStyleUrl } from '../../lib/maplibre';

interface Props {
  lat: number | null;
  lng: number | null;
  onPinMove: (lat: number, lng: number) => void;
}

interface NominatimResult {
  display_name: string;
  lat: string;
  lon: string;
}

export function AdminMap({ lat, lng, onPinMove }: Props) {
  const mapRef = useRef<MapRef>(null);
  const styleUrl = useMemo(() => getMapTilerStyleUrl(), []);
  const [query, setQuery] = useState('');
  const [suggestions, setSuggestions] = useState<NominatimResult[]>([]);
  const [searching, setSearching] = useState(false);
  const debounceRef = useRef<ReturnType<typeof setTimeout> | null>(null);

  const searchAddress = async (q: string) => {
    if (q.trim().length < 3) { setSuggestions([]); return; }

    // Try to detect "lat, lng" paste and jump directly
    const parts = q.split(',').map((p) => parseFloat(p.trim()));
    if (parts.length === 2 && !isNaN(parts[0]) && !isNaN(parts[1])) {
      const [pLat, pLng] = parts;
      onPinMove(pLat, pLng);
      mapRef.current?.flyTo({ center: [pLng, pLat], zoom: 15, duration: 800 });
      setQuery('');
      setSuggestions([]);
      return;
    }

    setSearching(true);
    try {
      const res = await fetch(
        `https://nominatim.openstreetmap.org/search?format=json&q=${encodeURIComponent(q)}&limit=5`,
        { headers: { 'Accept-Language': 'en' } },
      );
      const data = (await res.json()) as NominatimResult[];
      setSuggestions(data);
    } catch {
      setSuggestions([]);
    } finally {
      setSearching(false);
    }
  };

  const handleInput = (value: string) => {
    setQuery(value);
    if (debounceRef.current) clearTimeout(debounceRef.current);
    debounceRef.current = setTimeout(() => void searchAddress(value), 400);
  };

  const handleSelect = (result: NominatimResult) => {
    const pLat = parseFloat(result.lat);
    const pLng = parseFloat(result.lon);
    onPinMove(pLat, pLng);
    mapRef.current?.flyTo({ center: [pLng, pLat], zoom: 15, duration: 800 });
    setQuery('');
    setSuggestions([]);
  };

  const handleMapClick = (e: { lngLat: { lat: number; lng: number } }) => {
    onPinMove(e.lngLat.lat, e.lngLat.lng);
  };

  return (
    <div className="admin-map-wrap">
      <div className="admin-map-search" style={{ flexDirection: 'column', gap: 0, position: 'relative' }}>
        <div style={{ display: 'flex', gap: 6 }}>
          <input
            className="admin-map-search-input"
            placeholder="Search address or paste lat, lng…"
            value={query}
            onChange={(e) => handleInput(e.target.value)}
            onKeyDown={(e) => { if (e.key === 'Enter') void searchAddress(query); }}
            autoComplete="off"
          />
          {searching ? (
            <span style={{ display: 'grid', placeItems: 'center', padding: '0 8px', background: 'oklch(0.99 0.01 86)', borderRadius: 9, fontSize: '0.76rem', color: 'oklch(0.44 0.04 75)' }}>…</span>
          ) : null}
        </div>
        {suggestions.length > 0 ? (
          <ul className="admin-map-suggestions">
            {suggestions.map((s) => (
              <li key={`${s.lat},${s.lon}`}>
                <button type="button" onClick={() => handleSelect(s)}>
                  {s.display_name}
                </button>
              </li>
            ))}
          </ul>
        ) : null}
      </div>
      <Map
        ref={mapRef}
        mapLib={import('maplibre-gl')}
        mapStyle={styleUrl}
        initialViewState={{
          latitude: lat ?? 6.5244,
          longitude: lng ?? 3.3792,
          zoom: lat ? 14 : 6,
        }}
        attributionControl={false}
        style={{ width: '100%', height: '100%' }}
        onClick={handleMapClick}
        cursor="crosshair"
      >
        {lat !== null && lng !== null ? (
          <Marker
            latitude={lat}
            longitude={lng}
            draggable
            onDragEnd={(e) => onPinMove(e.lngLat.lat, e.lngLat.lng)}
          >
            <MapPin size={32} fill="#dc2626" color="#dc2626" style={{ marginBottom: -16 }} />
          </Marker>
        ) : null}
      </Map>
    </div>
  );
}
