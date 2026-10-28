import React, { useMemo, useState } from 'react';
import { ArrowLeft, Crosshair, Droplet, Navigation, Camera, Phone, User, Sun } from 'lucide-react';
import { T } from '../theme';
import { DISTRICTS, OGUN_BOUNDS, PROGRAMME_TOTALS, loadAssets } from '../data/infrastructure';

// Light Up Ogun — infrastructure map with a peek-and-expand bottom sheet.
//
// TEMPORARY, and deliberately self-contained so it can be deleted in one piece.
// It draws its own schematic map rather than pulling in maplibre: the asset
// records have no home in the database yet (see data/infrastructure.js), so
// shipping ~800KB of tile renderer for placeholder pins is the wrong trade
// before the restructure. Pin positions are projected from real coordinates,
// so the geometry is honest; the backdrop is a graticule, not a coastline.

const project = ({ lat, lng }) => ({
    left: `${((lng - OGUN_BOUNDS.minLng) / (OGUN_BOUNDS.maxLng - OGUN_BOUNDS.minLng)) * 100}%`,
    top: `${((OGUN_BOUNDS.maxLat - lat) / (OGUN_BOUNDS.maxLat - OGUN_BOUNDS.minLat)) * 100}%`,
});

const pctXY = ({ lat, lng }) => [
    ((lng - OGUN_BOUNDS.minLng) / (OGUN_BOUNDS.maxLng - OGUN_BOUNDS.minLng)) * 100,
    ((OGUN_BOUNDS.maxLat - lat) / (OGUN_BOUNDS.maxLat - OGUN_BOUNDS.minLat)) * 100,
];

// Decorative network: join each asset to its nearest neighbour. Not a real
// route — it reads as a grid without inventing specific cable runs.
const nearestNeighbourLinks = (assets) => {
    const pts = assets.map(pctXY);
    return pts.flatMap(([x1, y1], i) => {
        let best = -1;
        let bestD = Infinity;
        pts.forEach(([x2, y2], j) => {
            if (i === j) return;
            const d = (x1 - x2) ** 2 + (y1 - y2) ** 2;
            if (d < bestD) { bestD = d; best = j; }
        });
        return best > i ? [[x1, y1, pts[best][0], pts[best][1]]] : [];
    });
};

const Graticule = () => (
    <svg width="100%" height="100%" style={{ position: 'absolute', inset: 0 }} aria-hidden="true">
        {[20, 40, 60, 80].map(p => (
            <line key={`v${p}`} x1={`${p}%`} y1="0" x2={`${p}%`} y2="100%" stroke="rgba(255,255,255,.045)" strokeWidth="1" />
        ))}
        {[25, 50, 75].map(p => (
            <line key={`h${p}`} x1="0" y1={`${p}%`} x2="100%" y2={`${p}%`} stroke="rgba(255,255,255,.045)" strokeWidth="1" />
        ))}
    </svg>
);

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

const AssetCard = ({ asset, onVerify }) => (
    <div style={{
        borderRadius: 14, background: T.card,
        border: `1px solid ${T.line}`, padding: 14,
        display: 'flex', flexDirection: 'column', gap: 11,
    }}>
        <div style={{ display: 'flex', alignItems: 'flex-start', justifyContent: 'space-between', gap: 12 }}>
            <div style={{ minWidth: 0 }}>
                <div style={{ fontSize: 15, fontWeight: 600, lineHeight: 1.25, color: T.text }}>{asset.name}</div>
                <div style={{ marginTop: 4, display: 'flex', alignItems: 'center', gap: 5, fontSize: 11.5, color: T.textDim }}>
                    <Crosshair size={12} strokeWidth={2.2} /> {asset.lga} · {asset.district}
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

        <div style={{
            display: 'flex', gap: 14, paddingTop: 10,
            borderTop: `1px solid ${T.line}`, fontSize: 11.5,
        }}>
            <div style={{ display: 'flex', alignItems: 'center', gap: 6, minWidth: 0 }}>
                <User size={13} color={T.textMute} strokeWidth={2.2} />
                <span style={{ color: T.textDim, overflow: 'hidden', textOverflow: 'ellipsis', whiteSpace: 'nowrap' }}>{asset.contactName}</span>
            </div>
            <a href={`tel:${asset.contactPhone}`} style={{ display: 'flex', alignItems: 'center', gap: 6, color: T.textDim, textDecoration: 'none' }}>
                <Phone size={13} color={T.textMute} strokeWidth={2.2} />
                {asset.contactPhone}
            </a>
        </div>

        <div style={{ display: 'flex', gap: 8 }}>
            <a className="yc-btn"
                href={`https://www.google.com/maps/dir/?api=1&destination=${asset.lat},${asset.lng}`}
                target="_blank" rel="noopener noreferrer"
                style={{
                    flex: 1, minHeight: 40, borderRadius: 999, background: T.gold, color: '#101a14',
                    fontSize: 12, fontWeight: 700, textDecoration: 'none',
                    display: 'inline-flex', alignItems: 'center', justifyContent: 'center', gap: 6,
                }}>
                <Navigation size={13} strokeWidth={2.6} /> Navigate to Site
            </a>
            <button className="yc-btn" onClick={onVerify} style={{
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

export const InfrastructureSheet = ({ onClose, openGeoQuest }) => {
    const [kind, setKind] = useState('solar');
    const [filter, setFilter] = useState('All');
    const [expanded, setExpanded] = useState(false);
    const [selected, setSelected] = useState(null);

    const assets = useMemo(() => loadAssets(kind), [kind]);
    const links = useMemo(() => (kind === 'solar' ? nearestNeighbourLinks(assets) : []), [kind, assets]);
    const totals = PROGRAMME_TOTALS[kind];

    const visible = useMemo(() => assets.filter(a => (
        filter === 'All' ||
        (DISTRICTS.includes(filter) && a.district === filter) ||
        (filter === 'Completed' && a.status === 'completed') ||
        (filter === 'Ongoing' && a.status === 'ongoing')
    )), [assets, filter]);

    const cards = selected ? [selected] : visible;
    const accent = kind === 'solar' ? T.gold : T.accent;
    const chips = [
        'All',
        ...DISTRICTS.map(d => `${d}`),
        'Completed',
        'Ongoing',
    ];
    const countFor = (chip) => (
        chip === 'All' ? assets.length
            : DISTRICTS.includes(chip) ? assets.filter(a => a.district === chip).length
            : chip === 'Completed' ? assets.filter(a => a.status === 'completed').length
            : assets.filter(a => a.status === 'ongoing').length
    );

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
                    width: 36, height: 36, borderRadius: 8, border: 'none',
                    background: '#18271f', color: T.text,
                    display: 'flex', alignItems: 'center', justifyContent: 'center',
                }}>
                    <ArrowLeft size={16} strokeWidth={2.4} />
                </button>
                <div style={{ flex: 1, minWidth: 0 }}>
                    <div style={{ fontSize: 10.5, letterSpacing: '.16em', color: T.gold, fontWeight: 600 }}>YAYI CONNECT</div>
                    <div style={{ marginTop: 2, fontSize: 14, fontWeight: 600 }}>{totals.label}</div>
                </div>
                <div style={{ display: 'flex', gap: 5, background: 'rgba(255,255,255,.05)', borderRadius: 999, padding: 3 }}>
                    {[['solar', Sun], ['borehole', Droplet]].map(([k, Icon]) => (
                        <button key={k} className="yc-btn"
                            onClick={() => { setKind(k); setFilter('All'); setSelected(null); }}
                            aria-label={k === 'solar' ? 'Solar lights' : 'Boreholes'}
                            style={{
                                width: 32, height: 28, borderRadius: 999, border: 'none',
                                background: kind === k ? (k === 'solar' ? T.gold : T.accent) : 'transparent',
                                color: kind === k ? '#101a14' : T.textMute,
                                display: 'flex', alignItems: 'center', justifyContent: 'center',
                            }}>
                            <Icon size={14} strokeWidth={2.4} />
                        </button>
                    ))}
                </div>
            </div>

            {/* Map panel */}
            <div style={{
                flex: 1, minHeight: 0, position: 'relative', overflow: 'hidden',
                background: kind === 'solar'
                    ? 'radial-gradient(120% 90% at 50% 20%, #16243a 0%, #0d1526 60%, #080d18 100%)'
                    : 'radial-gradient(120% 90% at 50% 20%, #13302a 0%, #0c1f1b 60%, #081411 100%)',
            }}>
                <Graticule />

                <svg width="100%" height="100%" style={{ position: 'absolute', inset: 0 }} aria-hidden="true">
                    {links.map(([x1, y1, x2, y2], i) => (
                        <line key={i} x1={`${x1}%`} y1={`${y1}%`} x2={`${x2}%`} y2={`${y2}%`}
                            stroke={accent} strokeWidth="2" strokeLinecap="round"
                            opacity=".55" style={{ filter: `drop-shadow(0 0 4px ${accent})` }} />
                    ))}
                </svg>

                {assets.map(a => {
                    const dim = !visible.includes(a);
                    const isSel = selected?.id === a.id;
                    return (
                        <button key={a.id} className="yc-btn"
                            onClick={() => { setSelected(isSel ? null : a); setExpanded(false); }}
                            aria-label={a.name}
                            style={{
                                position: 'absolute', ...project(a),
                                transform: 'translate(-50%,-50%)',
                                width: isSel ? 30 : 22, height: isSel ? 30 : 22,
                                borderRadius: '50%', border: `2px solid ${accent}`,
                                background: a.status === 'completed' ? accent : T.header,
                                color: a.status === 'completed' ? '#0b1510' : accent,
                                opacity: dim ? .25 : 1,
                                display: 'flex', alignItems: 'center', justifyContent: 'center',
                                boxShadow: isSel ? `0 0 0 4px ${accent}33, 0 0 14px ${accent}` : `0 0 8px ${accent}66`,
                                transition: 'width .15s ease, height .15s ease, opacity .2s ease',
                                padding: 0, cursor: 'pointer',
                            }}>
                            {kind === 'solar'
                                ? <Sun size={isSel ? 15 : 11} strokeWidth={2.6} />
                                : <Droplet size={isSel ? 15 : 11} strokeWidth={2.6} />}
                        </button>
                    );
                })}

                {/* Headline counts */}
                <div style={{
                    position: 'absolute', top: 12, left: '50%', transform: 'translateX(-50%)',
                    display: 'flex', alignItems: 'center', gap: 10,
                    padding: '8px 14px', borderRadius: 999,
                    background: 'rgba(8,16,13,.82)', border: `1px solid ${accent}55`,
                    backdropFilter: 'blur(8px)', whiteSpace: 'nowrap',
                }}>
                    <span style={{
                        width: 24, height: 24, borderRadius: '50%', background: accent,
                        display: 'flex', alignItems: 'center', justifyContent: 'center', color: '#0b1510',
                    }}>
                        {kind === 'solar' ? <Sun size={13} strokeWidth={2.6} /> : <Droplet size={13} strokeWidth={2.6} />}
                    </span>
                    <span style={{ fontSize: 11.5, lineHeight: 1.35 }}>
                        <strong style={{ color: T.text }}>Completed: {totals.completed.toLocaleString()}</strong><br />
                        <span style={{ color: T.textDim }}>In Progress: {totals.ongoing.toLocaleString()}</span>
                    </span>
                </div>

                <div style={{
                    position: 'absolute', right: 12, bottom: 12,
                    padding: '7px 12px', borderRadius: 999,
                    background: 'rgba(8,16,13,.82)', border: `1px solid ${T.lineStrong}`,
                    fontSize: 11, color: T.textDim, backdropFilter: 'blur(8px)',
                }}>
                    Showing {visible.length} of {assets.length} sites
                </div>
            </div>

            {/* Bottom sheet */}
            <div style={{
                flex: 'none',
                height: expanded ? '62%' : '42%',
                background: T.header,
                borderTop: `1px solid ${T.lineStrong}`,
                borderRadius: '18px 18px 0 0',
                marginTop: -18, position: 'relative', zIndex: 2,
                display: 'flex', flexDirection: 'column',
                transition: 'height .28s cubic-bezier(.4,0,.2,1)',
                boxShadow: '0 -8px 28px rgba(0,0,0,.45)',
            }}>
                <button className="yc-btn" onClick={() => setExpanded(e => !e)}
                    aria-label={expanded ? 'Collapse list' : 'Expand list'}
                    style={{
                        flex: 'none', border: 'none', background: 'transparent',
                        padding: '10px 0 6px', display: 'flex', justifyContent: 'center',
                    }}>
                    <span style={{ width: 38, height: 4, borderRadius: 999, background: 'rgba(255,255,255,.22)' }} />
                </button>

                {/* Filter chips */}
                <div className="yc-hide-scroll" style={{
                    flex: 'none', display: 'flex', gap: 8, overflowX: 'auto',
                    padding: '2px 14px 10px',
                }}>
                    {chips.map(chip => {
                        const on = filter === chip;
                        return (
                            <button key={chip} className="yc-btn"
                                onClick={() => { setFilter(chip); setSelected(null); }}
                                style={{
                                    flex: 'none', padding: '7px 13px', borderRadius: 999,
                                    fontSize: 12, fontWeight: 600, whiteSpace: 'nowrap',
                                    background: on ? `${accent}22` : 'rgba(255,255,255,.04)',
                                    border: `1px solid ${on ? accent : T.line}`,
                                    color: on ? accent : T.textDim,
                                }}>
                                {chip} <span style={{ opacity: .65 }}>({countFor(chip)})</span>
                            </button>
                        );
                    })}
                </div>

                {selected && (
                    <div style={{ flex: 'none', padding: '0 14px 8px' }}>
                        <button className="yc-btn" onClick={() => setSelected(null)} style={{
                            border: 'none', background: 'transparent', padding: 0,
                            color: T.textMute, fontSize: 11.5, fontWeight: 600,
                        }}>← Back to all {visible.length} sites</button>
                    </div>
                )}

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
                        <AssetCard key={a.id} asset={a} onVerify={openGeoQuest} />
                    ))}
                </div>
            </div>
        </div>
    );
};
