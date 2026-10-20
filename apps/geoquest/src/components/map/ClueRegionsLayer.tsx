import { useEffect, useMemo } from 'react';
import { useMap } from 'react-map-gl/maplibre';
import type { GeoJSONSource, MapLayerMouseEvent } from 'maplibre-gl';
import type { FeatureCollection, Polygon } from 'geojson';
import { useShallow } from 'zustand/react/shallow';
import { useClueStore } from '../../store/useClueStore';

const SOURCE_ID = 'clue-regions';
const FILL_LAYER_ID = 'clue-regions-fill';
const BORDER_LAYER_ID = 'clue-regions-border';

export function ClueRegionsLayer() {
  const { current: mapRef } = useMap();
  const { clues, selectedClueId, setSelectedClue } = useClueStore(
    useShallow((state) => ({
      clues: state.clues,
      selectedClueId: state.selectedClueId,
      setSelectedClue: state.setSelectedClue,
    })),
  );

  const featureCollection = useMemo<FeatureCollection<Polygon>>(
    () => ({
      type: 'FeatureCollection',
      features: clues.map((clue) => ({
        type: 'Feature',
        id: clue.id,
        properties: {
          id: clue.id,
          title: clue.title,
          solved: Boolean(clue.solved_by),
        },
        geometry: clue.region,
      })),
    }),
    [clues],
  );

  useEffect(() => {
    const map = mapRef?.getMap();
    if (!map) return;

    const addLayers = () => {
      if (!map.getSource(SOURCE_ID)) {
        map.addSource(SOURCE_ID, {
          type: 'geojson',
          data: featureCollection,
        });
      }

      if (!map.getLayer(FILL_LAYER_ID)) {
        map.addLayer({
          id: FILL_LAYER_ID,
          type: 'fill',
          source: SOURCE_ID,
          paint: {
            'fill-color': ['case', ['==', ['get', 'solved'], true], '#22c55e', '#D2B48C'],
            'fill-opacity': [
              'case',
              ['==', ['get', 'id'], selectedClueId || ''],
              0.6,
              0.35,
            ],
          },
        });
      }

      if (!map.getLayer(BORDER_LAYER_ID)) {
        map.addLayer({
          id: BORDER_LAYER_ID,
          type: 'line',
          source: SOURCE_ID,
          paint: {
            'line-color': '#8B6914',
            'line-width': 2,
          },
        });
      }
    };

    if (map.isStyleLoaded()) {
      addLayers();
    } else {
      map.once('load', addLayers);
    }

    return () => {
      map.off('load', addLayers);
    };
  }, [featureCollection, mapRef, selectedClueId]);

  useEffect(() => {
    const map = mapRef?.getMap();
    const source = map?.getSource(SOURCE_ID) as GeoJSONSource | undefined;
    source?.setData(featureCollection);
  }, [featureCollection, mapRef]);

  useEffect(() => {
    const map = mapRef?.getMap();
    if (!map?.getLayer(FILL_LAYER_ID)) return;
    map.setPaintProperty(FILL_LAYER_ID, 'fill-opacity', [
      'case',
      ['==', ['get', 'id'], selectedClueId || ''],
      0.6,
      0.35,
    ]);
  }, [mapRef, selectedClueId]);

  useEffect(() => {
    const map = mapRef?.getMap();
    if (!map) return;

    const handleClick = (event: MapLayerMouseEvent) => {
      const id = event.features?.[0]?.properties?.id as string | undefined;
      if (id) setSelectedClue(id);
    };

    map.on('click', FILL_LAYER_ID, handleClick);
    map.on('mouseenter', FILL_LAYER_ID, () => {
      map.getCanvas().style.cursor = 'pointer';
    });
    map.on('mouseleave', FILL_LAYER_ID, () => {
      map.getCanvas().style.cursor = '';
    });

    return () => {
      map.off('click', FILL_LAYER_ID, handleClick);
    };
  }, [mapRef, setSelectedClue]);

  return null;
}
