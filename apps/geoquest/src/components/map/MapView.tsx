import { useEffect, useMemo, useRef } from 'react';
import Map, { NavigationControl, type MapRef } from 'react-map-gl/maplibre';
import 'maplibre-gl/dist/maplibre-gl.css';
import { useShallow } from 'zustand/react/shallow';
import { getMapTilerStyleUrl } from '../../lib/maplibre';
import { DEFAULT_CENTER, useGPSStore } from '../../store/useGPSStore';
import { QuestMarkersLayer } from './QuestMarkersLayer';
import { UserLocationLayer } from './UserLocationLayer';

interface Props {
  mapRefCallback?: (ref: MapRef | null) => void;
}

export function MapView({ mapRefCallback }: Props) {
  const mapRef = useRef<MapRef>(null);
  const styleUrl = useMemo(() => getMapTilerStyleUrl(), []);
  const hasAutoPannedRef = useRef(false);

  const { lat, lng } = useGPSStore(
    useShallow((state) => ({ lat: state.lat, lng: state.lng })),
  );

  useEffect(() => {
    if (mapRefCallback) mapRefCallback(mapRef.current);
  });

  // Auto-pan once on first GPS fix 1
  useEffect(() => {
    if (hasAutoPannedRef.current) return;
    if (lat === null || lng === null) return;
    mapRef.current?.flyTo({ center: [lng, lat], zoom: 15, duration: 1400, essential: true });
    hasAutoPannedRef.current = true;
  }, [lat, lng]);

  return (
    <Map
      ref={mapRef}
      id="main-map"
      initialViewState={{
        longitude: lng ?? DEFAULT_CENTER.lng,
        latitude: lat ?? DEFAULT_CENTER.lat,
        zoom: 12.5,
      }}
      mapLib={import('maplibre-gl')}
      mapStyle={styleUrl}
      attributionControl={false}
      reuseMaps
      style={{ position: 'absolute', inset: 0 }}
    >
      <NavigationControl position="bottom-left" visualizePitch />
      <QuestMarkersLayer />
      <UserLocationLayer />
    </Map>
  );
}
