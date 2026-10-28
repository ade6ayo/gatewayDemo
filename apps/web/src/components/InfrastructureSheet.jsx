import React, { useCallback, useEffect, useMemo, useRef, useState } from 'react';
import { ArrowLeft, Camera, Crosshair, Droplet, Layers, Navigation, Phone, Search, Sun, User, X as XIcon } from 'lucide-react';
import { T } from '../theme';
import { DISTRICTS, PROGRAMME_TOTALS, loadAssets } from '../data/infrastructure';
import { InfraMap } from './map/InfraMap';

// Light Up Ogun — real basemap with a draggable asset sheet over it.
//
// The sheet overlays the map rather than sharing a flex row with it, so dragging
// never resizes the map canvas. Resizing maplibre on every pointer frame is
// expensive and makes the gesture stutter on mid-range phones.
//
// Still placeholder data — see data/infrastructure.js and TODO 2e.

const SNAPS = [0.20, 0.48, 0.85];
const nearestSnap = (h, velocity) => {
    // A decisive flick wins over proximity, so a fast drag doesn't snap back.
    const biased = h + velocity * 0.12;
    return SNAPS.reduce((best, s) => (Math.abs(s - biased) < Math.abs(best - biased) ? s : best), SNAPS[0]);
};

const KIND_COLOR = { solar: T.gold, borehole: '#38bdf8' };
const TYPE_FILTERS = [
    { id: 'all', label: 'All types' },
    { id: 'solar', label: 'Solar' },
    { id: 'borehole', label: 'Boreholes' },
];

const StatusPill = ({ status }) => {
    const done = status === 'completed';
    return (
        <span style={{
            padding: '3px 10px', borderRadius: 999,
            fontSize: 11, fontWeight: 600, whiteSpace: 'nowrap',
            background: done ? 'rgba(31,168,92,.16)' : 'rgba(217,180,92,.14)',
            border: `1px solid ${done ? T.accent : T.gold}`,
            color: done ? T.accent : T.gold,
        }}>{done ? 'Completed' : 'Ongoing'}</span>
    );
};

const AssetCard = ({ asset, onVerify, onFocus }) => {
    const color = KIND_COLOR[asset.kind];
    const Icon = asset.kind === 'solar' ? Sun : Droplet;
    return (
        <div onClick={() => onFocus(asset)} style={{
            borderRadius: 14, background: T.card,
            border: `1px solid ${T.line}`, padding: 14, cursor: 'pointer',
            display: 'flex', flexDirection: 'column', gap: 11,
        }}>
            <div style={{ display: 'flex', alignItems: 'flex-start', justifyContent: 'space-between', gap: 12 }}>
                <div style={{ minWidth: 0, display: 'flex', gap: 10 }}>
                    <span style={{
                        flex: 'none', width: 28, height: 28, borderRadius: 8, marginTop: 2,
                        background: `${color}1f`, border: `1px solid ${color}66`, color,
                        display: 'flex', alignItems: 'center', justifyContent: 'center',
                    }}>
                        <Icon size={14} strokeWidth={2.4} />
                    </span>
                    <div style={{ minWidth: 0 }}>
                        <div style={{ fontSize: 15, fontWeight: 600, lineHeight: 1.25, color: T.text }}>{asset.name}</div>
                        <div style={{ marginTop: 4, display: 'flex', alignItems: 'center', gap: 5, fontSize: 11.5, color: T.textDim }}>
                            <Crosshair size={12} strokeWidth={2.2} /> {asset.lga} · {asset.district}
                        </div>
                    </div>
                </div>
                <div style={{ flex: 'none', textAlign: 'right' }}>
                    <div style={{ fontSize: 21, fontWeight: 600, lineHeight: 1, color: T.text }}>{asset.allocated.toLocaleString()}</div>
                    <div style={{ marginTop: 3, fontSize: 10, color: T.textMute }}>{asset.unit}</div>
                </div>
            </div>

            <div style={{ display: 'flex', alignItems: 'center', gap: 9 }}>
                <span style={{ fontSize: 12, color: T.textDim }}>Status:</span>
                <StatusPill status={asset.status} />
            </div>

            <div style={{ display: 'flex', alignItems: 'center', gap: 9 }}>
                <div style={{ flex: 1, height: 7, borderRadius: 4, background: 'rgba(255,255,255,.08)', overflow: 'hidden' }}>
                    <div style={{
                        height: '100%', width: `${asset.pct}%`, borderRadius: 4,
                        background: asset.pct === 100 ? T.accent : `linear-gradient(90deg, ${T.accentDark}, ${T.gold})`,
                    }} />
                </div>
                <span style={{ fontSize: 11.5, fontWeight: 600, color: T.textDim }}>{asset.pct}%</span>
            </div>

            <div style={{ display: 'flex', gap: 14, paddingTop: 10, borderTop: `1px solid ${T.line}`, fontSize: 11.5 }}>
                <div style={{ display: 'flex', alignItems: 'center', gap: 6, minWidth: 0 }}>
                    <User size={13} color={T.textMute} strokeWidth={2.2} />
                    <span style={{ color: T.textDim, overflow: 'hidden', textOverflow: 'ellipsis', whiteSpace: 'nowrap' }}>{asset.contactName}</span>
                </div>
                <a href={`tel:${asset.contactPhone}`} onClick={e => e.stopPropagation()}
                    style={{ display: 'flex', alignItems: 'center', gap: 6, color: T.textDim, textDecoration: 'none' }}>
                    <Phone size={13} color={T.textMute} strokeWidth={2.2} />
                    {asset.contactPhone}
                </a>
            </div>

            <div style={{ display: 'flex', gap: 8 }}>
                <a className="yc-btn"
                    href={`https://www.google.com/maps/dir/?api=1&destination=${asset.lat},${asset.lng}`}
                    target="_blank" rel="noopener noreferrer" onClick={e => e.stopPropagation()}
                    style={{
                        flex: 1, minHeight: 40, borderRadius: 999, background: T.gold, color: '#101a14',
                        fontSize: 12, fontWeight: 700, textDecoration: 'none',
                        display: 'inline-flex', alignItems: 'center', justifyContent: 'center', gap: 6,
                    }}>
                    <Navigation size={13} strokeWidth={2.6} /> Navigate to Site
                </a>
                <button className="yc-btn" onClick={e => { e.stopPropagation(); onVerify(); }} style={{
                    flex: 1, minHeight: 40, borderRadius: 999,
                    border: `1px solid ${T.lineStrong}`, background: 'rgba(255,255,255,.05)', color: T.text,
                    fontSize: 12, fontWeight: 600,
                    display: 'inline-flex', alignItems: 'center', justifyContent: 'center', gap: 6,
                }}>
                    <Camera size={13} strokeWidth={2.4} /> Verify & Check-In
                </button>
            </div>
        </div>
    );
};

export const InfrastructureSheet = ({ onClose, openGeoQuest }) => {
    const [typeFilter, setTypeFilter] = useState('all');
    const [placeFilter, setPlaceFilter] = useState('All');
    const [selected, setSelected] = useState(null);
    const [basemap, setBasemap] = useState('dark');
    const [query, setQuery] = useState('');
    const [searchOpen, setSearchOpen] = useState(false);

    const [height, setHeight] = useState(SNAPS[1]);
    const [dragging, setDragging] = useState(false);
    const mapAreaRef = useRef(null);
    const dragState = useRef(null);
    const heightRef = useRef(height);
    heightRef.current = height;

    const assets = useMemo(() => loadAssets(), []);

    const byType = useMemo(
        () => (typeFilter === 'all' ? assets : assets.filter(a => a.kind === typeFilter)),
        [assets, typeFilter],
    );

    const visible = useMemo(() => {
        const q = query.trim().toLowerCase();
        return byType.filter(a => {
            const placeOk =
                placeFilter === 'All' ||
                (DISTRICTS.includes(placeFilter) && a.district === placeFilter) ||
                (placeFilter === 'Completed' && a.status === 'completed') ||
                (placeFilter === 'Ongoing' && a.status === 'ongoing');
            const queryOk = !q || a.name.toLowerCase().includes(q) || a.lga.toLowerCase().includes(q);
            return placeOk && queryOk;
        });
    }, [byType, placeFilter, query]);

    // A selection that gets filtered out should not keep the sheet pinned to it.
    useEffect(() => {
        if (selected && !visible.some(a => a.id === selected.id)) setSelected(null);
    }, [visible, selected]);

    const focusAsset = useCallback((asset) => {
        setSelected(asset);
        setHeight(h => (h > SNAPS[1] ? SNAPS[1] : h));
    }, []);

    // ── Sheet drag ──────────────────────────────────────────────────────────
    // Listeners go on window rather than the handle. Pointer capture on the
    // handle does not survive the re-render that the first setHeight triggers,
    // so every move after the first one landed on the map and panned it
    // instead of resizing the sheet.
    const onPointerDown = (e) => {
        const box = mapAreaRef.current?.getBoundingClientRect();
        if (!box) return;
        e.preventDefault();
        dragState.current = {
            startY: e.clientY, startH: heightRef.current, boxH: box.height,
            lastY: e.clientY, lastT: performance.now(), v: 0,
        };
        setDragging(true);
    };

    useEffect(() => {
        if (!dragging) return undefined;

        const onMove = (e) => {
            const d = dragState.current;
            if (!d) return;
            const now = performance.now();
            const dt = now - d.lastT;
            if (dt > 0) {
                // Fraction of the container per second, upward positive.
                d.v = ((d.lastY - e.clientY) / d.boxH) * (1000 / dt);
                d.lastY = e.clientY;
                d.lastT = now;
            }
            const next = d.startH + (d.startY - e.clientY) / d.boxH;
            setHeight(Math.min(SNAPS[2], Math.max(0.12, next)));
        };

        const onUp = () => {
            const d = dragState.current;
            dragState.current = null;
            setDragging(false);
            setHeight(nearestSnap(heightRef.current, d ? d.v : 0));
        };

        window.addEventListener('pointermove', onMove, { passive: true });
        window.addEventListener('pointerup', onUp);
        window.addEventListener('pointercancel', onUp);
        return () => {
            window.removeEventListener('pointermove', onMove);
            window.removeEventListener('pointerup', onUp);
            window.removeEventListener('pointercancel', onUp);
        };
    }, [dragging]);

    const totals = useMemo(() => {
        const kinds = typeFilter === 'all' ? ['solar', 'borehole'] : [typeFilter];
        return kinds.reduce((acc, k) => ({
            completed: acc.completed + PROGRAMME_TOTALS[k].completed,
            ongoing: acc.ongoing + PROGRAMME_TOTALS[k].ongoing,
        }), { completed: 0, ongoing: 0 });
    }, [typeFilter]);

    const placeChips = ['All', ...DISTRICTS, 'Completed', 'Ongoing'];
    const countFor = (chip) => (
        chip === 'All' ? byType.length
            : DISTRICTS.includes(chip) ? byType.filter(a => a.district === chip).length
            : chip === 'Completed' ? byType.filter(a => a.status === 'completed').length
            : byType.filter(a => a.status === 'ongoing').length
    );

    const cards = selected ? [selected] : visible;

    return (
        <div style={{
            position: 'absolute', inset: 0, zIndex: 40,
            background: T.ground, color: T.text,
            display: 'flex', flexDirection: 'column',
            animation: 'yc-fade .25s ease',
        }}>
            {/* Header */}
            <div style={{
                flex: 'none', display: 'flex', alignItems: 'center', gap: 10,
                padding: '12px 14px', background: T.header, borderBottom: `1px solid ${T.line}`,
            }}>
                <button className="yc-btn" onClick={onClose} aria-label="Back" style={{
                    flex: 'none', width: 36, height: 36, borderRadius: 8, border: 'none',
                    background: '#18271f', color: T.text,
                    display: 'flex', alignItems: 'center', justifyContent: 'center',
                }}>
                    <ArrowLeft size={16} strokeWidth={2.4} />
                </button>

                {searchOpen ? (
                    <input
                        autoFocus
                        value={query}
                        onChange={e => { setQuery(e.target.value); setSelected(null); }}
                        placeholder="Search site or LGA…"
                        style={{
                            flex: 1, minWidth: 0, boxSizing: 'border-box',
                            padding: '9px 12px', borderRadius: 999,
                            background: 'rgba(255,255,255,.06)', border: `1px solid ${T.lineStrong}`,
                            color: T.text, fontSize: 13, fontFamily: 'inherit', outline: 'none',
                        }} />
                ) : (
                    <div style={{ flex: 1, minWidth: 0 }}>
                        <div style={{ fontSize: 10.5, letterSpacing: '.16em', color: T.gold, fontWeight: 600 }}>YAYI CONNECT</div>
                        <div style={{ marginTop: 2, fontSize: 14, fontWeight: 600 }}>Infrastructure Map</div>
                    </div>
                )}

                <button className="yc-btn"
                    onClick={() => { if (searchOpen) { setQuery(''); } setSearchOpen(o => !o); }}
                    aria-label={searchOpen ? 'Close search' : 'Search sites'}
                    style={{
                        flex: 'none', width: 36, height: 36, borderRadius: 8, border: 'none',
                        background: searchOpen ? T.gold : '#18271f', color: searchOpen ? '#101a14' : T.text,
                        display: 'flex', alignItems: 'center', justifyContent: 'center',
                    }}>
                    {searchOpen ? <XIcon size={16} strokeWidth={2.6} /> : <Search size={16} strokeWidth={2.4} />}
                </button>
            </div>

            {/* Map + sheet */}
            <div ref={mapAreaRef} style={{ flex: 1, minHeight: 0, position: 'relative', overflow: 'hidden' }}>
                <InfraMap
                    assets={visible}
                    selected={selected}
                    onSelect={focusAsset}
                    onClearSelection={() => setSelected(null)}
                    basemap={basemap}
                />

                {/* Basemap toggle, stacked under maplibre's own controls */}
                <button className="yc-btn"
                    onClick={() => setBasemap(b => (b === 'dark' ? 'light' : 'dark'))}
                    aria-label="Switch basemap"
                    style={{
                        position: 'absolute', top: 118, right: 10, zIndex: 3,
                        width: 29, height: 29, borderRadius: 4, border: 'none',
                        background: '#fff', color: '#333',
                        boxShadow: '0 0 0 2px rgba(0,0,0,.1)',
                        display: 'flex', alignItems: 'center', justifyContent: 'center',
                    }}>
                    <Layers size={15} strokeWidth={2.2} />
                </button>

                {/* Headline counts */}
                <div style={{
                    position: 'absolute', top: 12, left: 12, zIndex: 3,
                    display: 'flex', alignItems: 'center', gap: 10,
                    padding: '8px 13px', borderRadius: 12,
                    background: 'rgba(8,16,13,.84)', border: `1px solid ${T.lineStrong}`,
                    backdropFilter: 'blur(8px)', whiteSpace: 'nowrap',
                }}>
                    <span style={{ fontSize: 11.5, lineHeight: 1.35 }}>
                        <strong style={{ color: T.text }}>Completed: {totals.completed.toLocaleString()}</strong><br />
                        <span style={{ color: T.textDim }}>In Progress: {totals.ongoing.toLocaleString()}</span>
                    </span>
                </div>

                {/* Bottom sheet */}
                <div style={{
                    position: 'absolute', left: 0, right: 0, bottom: 0, zIndex: 4,
                    height: `${height * 100}%`,
                    background: T.header,
                    borderTop: `1px solid ${T.lineStrong}`,
                    borderRadius: '18px 18px 0 0',
                    display: 'flex', flexDirection: 'column',
                    transition: dragging ? 'none' : 'height .3s cubic-bezier(.4,0,.2,1)',
                    boxShadow: '0 -8px 28px rgba(0,0,0,.5)',
                    touchAction: 'none',
                }}>
                    <div
                        onPointerDown={onPointerDown}
                        role="separator"
                        aria-label="Drag to resize the list"
                        style={{
                            flex: 'none', padding: '10px 0 8px', cursor: 'grab',
                            display: 'flex', justifyContent: 'center', touchAction: 'none',
                        }}>
                        <span style={{ width: 38, height: 4, borderRadius: 999, background: 'rgba(255,255,255,.26)' }} />
                    </div>

                    {/* Type filter */}
                    <div style={{ flex: 'none', display: 'flex', gap: 6, padding: '0 14px 8px' }}>
                        {TYPE_FILTERS.map(t => {
                            const on = typeFilter === t.id;
                            const tint = t.id === 'all' ? T.accent : KIND_COLOR[t.id];
                            return (
                                <button key={t.id} className="yc-btn"
                                    onClick={() => { setTypeFilter(t.id); setPlaceFilter('All'); setSelected(null); }}
                                    style={{
                                        flex: 1, padding: '8px 4px', borderRadius: 9,
                                        fontSize: 12, fontWeight: 600,
                                        background: on ? `${tint}22` : 'rgba(255,255,255,.04)',
                                        border: `1px solid ${on ? tint : T.line}`,
                                        color: on ? tint : T.textDim,
                                    }}>{t.label}</button>
                            );
                        })}
                    </div>

                    {/* District / status filter */}
                    <div className="yc-hide-scroll" style={{
                        flex: 'none', display: 'flex', gap: 8, overflowX: 'auto', padding: '0 14px 10px',
                    }}>
                        {placeChips.map(chip => {
                            const on = placeFilter === chip;
                            return (
                                <button key={chip} className="yc-btn"
                                    onClick={() => { setPlaceFilter(chip); setSelected(null); }}
                                    style={{
                                        flex: 'none', padding: '6px 12px', borderRadius: 999,
                                        fontSize: 11.5, fontWeight: 600, whiteSpace: 'nowrap',
                                        background: on ? 'rgba(255,255,255,.1)' : 'rgba(255,255,255,.04)',
                                        border: `1px solid ${on ? T.lineStrong : T.line}`,
                                        color: on ? T.text : T.textDim,
                                    }}>
                                    {chip} <span style={{ opacity: .6 }}>({countFor(chip)})</span>
                                </button>
                            );
                        })}
                    </div>

                    <div style={{
                        flex: 'none', display: 'flex', alignItems: 'center', justifyContent: 'space-between',
                        gap: 10, padding: '0 14px 8px',
                    }}>
                        {selected ? (
                            <button className="yc-btn" onClick={() => setSelected(null)} style={{
                                border: 'none', background: 'transparent', padding: 0,
                                color: T.textMute, fontSize: 11.5, fontWeight: 600,
                            }}>← Back to all {visible.length} sites</button>
                        ) : (
                            <span style={{ fontSize: 11.5, color: T.textMute }}>
                                Showing {visible.length} of {assets.length} sites
                            </span>
                        )}
                        <span title="These records are placeholders, not delivery data" style={{
                            flex: 'none', padding: '3px 8px', borderRadius: 999,
                            fontSize: 9.5, fontWeight: 700, letterSpacing: '.08em',
                            background: 'rgba(227,93,91,.14)', border: '1px solid rgba(227,93,91,.45)',
                            color: '#f5a4a2',
                        }}>SAMPLE DATA</span>
                    </div>

                    <div className="yc-scroll" style={{
                        flex: 1, minHeight: 0, overflowY: 'auto',
                        padding: '0 14px 18px', display: 'flex', flexDirection: 'column', gap: 10,
                    }}>
                        {cards.length === 0 && (
                            <div style={{ padding: '24px 0', textAlign: 'center', fontSize: 12.5, color: T.textMute }}>
                                No sites match this filter yet.
                            </div>
                        )}
                        {cards.map(a => (
                            <AssetCard key={a.id} asset={a} onVerify={openGeoQuest} onFocus={focusAsset} />
                        ))}
                    </div>
                </div>
            </div>
        </div>
    );
};

export default InfrastructureSheet;
