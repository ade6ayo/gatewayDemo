import { useEffect, useMemo } from 'react';
import { Marker, useMap } from 'react-map-gl/maplibre';
import type { GeoJSONSource } from 'maplibre-gl';
import type { Feature } from 'geojson';
import { useShallow } from 'zustand/react/shallow';
import { useGPSStore } from '../../store/useGPSStore';

const SOURCE_ID = 'user-location';
const DOT_LAYER_ID = 'user-dot';

export function UserLocationLayer() {
  const { current: mapRef } = useMap();
  const { lat, lng } = useGPSStore(
    useShallow((state) => ({
      lat: state.lat,
      lng: state.lng,
    })),
  );

  const feature = useMemo<Feature>(
    () => ({
      type: 'Feature',
      properties: {},
      geometry:
        lat !== null && lng !== null
          ? { type: 'Point', coordinates: [lng, lat] }
          : { type: 'Point', coordinates: [0, 0] },
    }),
    [lat, lng],
  );

  useEffect(() => {
    const map = mapRef?.getMap();
    if (!map || lat === null || lng === null) return;

    const addLayer = () => {
      if (!map.getSource(SOURCE_ID)) {
        map.addSource(SOURCE_ID, {
          type: 'geojson',
          data: feature,
        });
      }

      if (!map.getLayer(DOT_LAYER_ID)) {
        map.addLayer({
          id: DOT_LAYER_ID,
          type: 'circle',
          source: SOURCE_ID,
          paint: {
            'circle-radius': 10,
            'circle-color': '#3b82f6',
            'circle-stroke-color': '#f8fafc',
            'circle-stroke-width': 2,
          },
        });
      }
    };

    if (map.isStyleLoaded()) {
      addLayer();
    } else {
      map.once('load', addLayer);
    }

    return () => {
      map.off('load', addLayer);
    };
  }, [feature, lat, lng, mapRef]);

  useEffect(() => {
    const source = mapRef?.getMap().getSource(SOURCE_ID) as GeoJSONSource | undefined;
    source?.setData(feature);
  }, [feature, mapRef]);

  if (lat === null || lng === null) return null;

  return (
    <Marker latitude={lat} longitude={lng} anchor="center">
      <div className="user-pulse" aria-hidden="true" />
    </Marker>
  );
}
