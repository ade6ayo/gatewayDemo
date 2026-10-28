import React, { useCallback, useEffect, useMemo, useRef } from 'react';
import Map, { GeolocateControl, Marker, NavigationControl } from 'react-map-gl/maplibre';
import 'maplibre-gl/dist/maplibre-gl.css';
import { Droplet, Sun } from 'lucide-react';
import { T } from '../../theme';
import { BASEMAPS, OGUN_VIEW } from '../../lib/basemap';

// Real basemap with one marker per asset. Kept separate from the sheet so the
// whole maplibre dependency sits behind the sheet's dynamic import.
//
// GeoQuest has its own MapView, but it is wired into three zustand stores and
// cannot be lifted without decoupling them first. That belongs in the shared
// package, not here.

const KIND_COLOR = { solar: T.gold, borehole: '#38bdf8' };

const Pin = ({ asset, selected, onSelect }) => {
    const color = KIND_COLOR[asset.kind];
    const done = asset.status === 'completed';
    const Icon = asset.kind === 'solar' ? Sun : Droplet;
    const size = selected ? 34 : 26;

    return (
        <Marker
            longitude={asset.lng}
            latitude={asset.lat}
            anchor="center"
            onClick={(e) => { e.originalEvent.stopPropagation(); onSelect(asset); }}
        >
            <div
                role="button"
                tabIndex={0}
                aria-label={asset.name}
                onKeyDown={(e) => { if (e.key === 'Enter' || e.key === ' ') { e.preventDefault(); onSelect(asset); } }}
                style={{
                    width: size, height: size, borderRadius: '50%',
                    border: `2px solid ${color}`,
                    // Filled = delivered, hollow = still in progress.
                    background: done ? color : 'rgba(8,16,13,.88)',
                    color: done ? '#0b1510' : color,
                    display: 'flex', alignItems: 'center', justifyContent: 'center',
                    cursor: 'pointer',
                    boxShadow: selected
                        ? `0 0 0 4px ${color}44, 0 0 16px ${color}`
                        : `0 1px 5px rgba(0,0,0,.5), 0 0 7px ${color}55`,
                    transition: 'width .15s ease, height .15s ease, box-shadow .15s ease',
                }}>
                <Icon size={selected ? 17 : 13} strokeWidth={2.6} />
            </div>
        </Marker>
    );
};

export const InfraMap = ({ assets, selected, onSelect, onClearSelection, basemap }) => {
    const mapRef = useRef(null);

    const style = BASEMAPS[basemap].url;

    const onLoad = useCallback(() => {
        const map = mapRef.current;
        if (!map || assets.length === 0) return;
        const lngs = assets.map(a => a.lng);
        const lats = assets.map(a => a.lat);
        map.fitBounds(
            [[Math.min(...lngs), Math.min(...lats)], [Math.max(...lngs), Math.max(...lats)]],
            { padding: { top: 60, bottom: 40, left: 40, right: 40 }, duration: 0, maxZoom: 11 },
        );
    }, [assets]);

    // Fly to the selected asset, leaving room for the sheet below.
    useEffect(() => {
        if (!selected || !mapRef.current) return;
        mapRef.current.flyTo({
            center: [selected.lng, selected.lat],
            zoom: Math.max(mapRef.current.getZoom(), 12),
            offset: [0, -60],
            duration: 900,
            essential: true,
        });
    }, [selected]);

    const markers = useMemo(() => assets.map(a => (
        <Pin key={a.id} asset={a} selected={selected?.id === a.id} onSelect={onSelect} />
    )), [assets, selected, onSelect]);

    return (
        <Map
            ref={mapRef}
            reuseMaps
            initialViewState={OGUN_VIEW}
            mapStyle={style}
            onLoad={onLoad}
            onClick={onClearSelection}
            attributionControl={{ compact: true }}
            style={{ position: 'absolute', inset: 0 }}
        >
            <NavigationControl position="top-right" showCompass={false} />
            <GeolocateControl position="top-right" trackUserLocation positionOptions={{ enableHighAccuracy: true }} />
            {markers}
        </Map>
    );
};

export default InfraMap;
