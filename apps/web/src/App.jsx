import React, { useState, useEffect, useRef, useMemo } from 'react';
import yayiMark from './assets/yayi-mark.png';
import adeolaPortrait from './assets/adeola-portrait.png';
import mandatePortrait from './assets/yayi-portrait-new.png';
import {
    Home,
    Award,
    QrCode,
    Map,
    Gift,
    Search,
    ArrowRight,
    ArrowLeft,
    Camera,
    CheckCircle,
    Users,
    HelpCircle,
    FileText,
    Ticket,
    ChevronRight,
    Play,
    Scissors,
    Phone,
    Check,
    X as XIcon,
    Sun,
    Store,
    Laptop,
    Settings,
    Trophy,
    MapPin,
    UserPlus,
    Star,
} from 'lucide-react';

// ═══════════════════════════════════════════════════════════════════════════
//  THEME + CONSTANTS
// ═══════════════════════════════════════════════════════════════════════════

const T = {
    ground: '#0b1510',
    header: '#0d1d16',
    card: '#12241b',
    heroA: '#0f3a26',
    heroB: '#0c2a1c',
    heroC: '#0a1f16',
    accent: '#1fa85c',
    accentDark: '#14734a',
    gold: '#d9b45c',
    goldLight: '#f0cf85',
    text: '#ecf3ee',
    textDim: 'rgba(236,243,238,.62)',
    textMute: 'rgba(236,243,238,.5)',
    line: 'rgba(255,255,255,.07)',
    lineStrong: 'rgba(255,255,255,.12)',
};

const FONT = "'Inter', system-ui, -apple-system, sans-serif";
const PROXY_BASE = import.meta.env.VITE_PAYMENTS_API_URL || 'https://gatewaybe-production.up.railway.app';
const GEOHUNT_URL = import.meta.env.VITE_GEOHUNT_URL || 'https://geohunt-production.up.railway.app/';

const POINTS_GOAL = 2000;

// ── Trivia game config ──────────────────────────────────────────────────────
const QUESTIONS = [
    {
        id: 1,
        question: "What is the primary gubernatorial campaign slogan displayed on yayiconnect.com?",
        options: [
            'Hope, Renewal, Victory',
            'Progress. Unity. Future.',
            'Better Days Ahead',
            'Together for Greater Ogun',
        ],
        correct: 1, difficulty: 'easy', category: 'Campaign',
        explanation: 'The banner of the official campaign platform features the motto: "Progress. Unity. Future."',
    },
    {
        id: 2,
        question: "For which election cycle and executive office is Senator Yayi campaigning?",
        options: [
            'Ogun State Governor 2027',
            'Senate President 2027',
            'Lagos West Senator 2027',
            'Federal House of Representatives 2027',
        ],
        correct: 0, difficulty: 'easy', category: 'Campaign',
        explanation: 'The platform explicitly brands his gubernatorial bid as "Senator Yayi | Ogun State Governor 2027."',
    },
    {
        id: 3,
        question: "According to the website, how many years of dedicated public service does Senator Yayi have?",
        options: [
            'Over 10 years',
            'Over 15 years',
            'Over 20 years',
            'Over 30 years',
        ],
        correct: 2, difficulty: 'medium', category: 'Campaign',
        explanation: 'Under the "About Senator Yayi" section, the site highlights his distinguished leadership with over 20 years of public service.',
    },
];

const PRIZE_STRUCTURE = [50, 100, 250];
const TIME_PER_QUESTION = 30;

// ── Nigerian network detection ──────────────────────────────────────────────
const detectNigerianNetwork = (phone) => {
    const p = (phone || '').replace(/\D/g, '');
    const prefix = p.slice(0, 4);
    const MTN    = ['0703','0706','0803','0806','0810','0813','0814','0816','0903','0906','0913','0916'];
    const GLO    = ['0705','0805','0807','0811','0815','0905','0915'];
    const AIRTEL = ['0701','0708','0802','0808','0812','0901','0902','0904','0907','0912'];
    const NINE   = ['0809','0817','0818','0909','0908'];
    if (MTN.includes(prefix))    return { name: 'MTN',     code: 'MTN' };
    if (GLO.includes(prefix))    return { name: 'GLO',     code: 'GLO' };
    if (AIRTEL.includes(prefix)) return { name: 'Airtel',  code: 'AIRTEL' };
    if (NINE.includes(prefix))   return { name: '9mobile', code: 'ETISALAT' };
    return null;
};

const NETWORK_OPTIONS = [
    { name: 'MTN',     code: 'MTN' },
    { name: 'Airtel',  code: 'AIRTEL' },
    { name: 'GLO',     code: 'GLO' },
    { name: '9mobile', code: 'ETISALAT' },
];

// ── Home / directory data ───────────────────────────────────────────────────
const PROJECTS = [
    { id: 'p1', name: 'Solar street lights — Yewa North',  type: 'Solar',     status: 'DELIVERED', meta: 'Ward 04 · 220 poles · commissioned Jul 2026', pct: 100, reports: 412 },
    { id: 'p2', name: 'Motorised borehole — Ayetoro I',    type: 'Boreholes', status: 'ACTIVE',    meta: 'Ward 04 · 1 of 3 phases · 2,400 households',  pct: 62,  reports: 138 },
    { id: 'p3', name: 'Ilaro–Owode road rehabilitation',   type: 'Roads',     status: 'ACTIVE',    meta: 'Ogun West · 11.4 km · contractor on site',    pct: 41,  reports: 96 },
    { id: 'p4', name: 'Primary health centre upgrade',     type: 'Health',    status: 'PLANNED',   meta: 'Imeko Afon · equipment tender open',          pct: 12,  reports: 24 },
    { id: 'p5', name: 'Solar boreholes — Imeko cluster',   type: 'Boreholes', status: 'ACTIVE',    meta: '6 communities · water committees trained',    pct: 78,  reports: 201 },
];

const PROGRAMS = [
    { id: 'g1', name: 'Artisan tools grant',         meta: '₦250,000 equipment support · Ogun West',   pct: 72, slots: '180 of 250 slots screened',  Icon: Settings, tint: 'accent' },
    { id: 'g2', name: 'Gateway digital skills',      meta: '8-week training + device · 500 seats',    pct: 45, slots: '225 of 500 seats filled',    Icon: Laptop,   tint: 'gold' },
    { id: 'g3', name: 'Agro input package',          meta: 'Seedlings, fertiliser, offtake guarantee', pct: 88, slots: '440 of 500 farmers cleared', Icon: Sun,      tint: 'accent' },
    { id: 'g4', name: 'Market women revolving fund', meta: '0% interest · ward cooperative model',    pct: 30, slots: '150 of 500 groups onboarded', Icon: Store,    tint: 'gold' },
];

const PEERS = [
    { name: 'Folashade A.',  ward: 'Ward 04 · Ayetoro I',  pts: 2180 },
    { name: 'Tunde Bakare',  ward: 'Ward 04 · Ayetoro I',  pts: 1860 },
    { name: 'Halima Yusuf',  ward: 'Ward 04 · Ayetoro II', pts: 1495 },
    { name: 'Segun Odubiyi', ward: 'Ward 04 · Joga Orile', pts: 1120 },
    { name: 'Chinedu Okafor',ward: 'Ward 04 · Ayetoro I',  pts: 980 },
    { name: 'Ruka Adeniyi',  ward: 'Ward 04 · Ilaro Rd',   pts: 870 },
    { name: 'Musa Danjuma',  ward: 'Ward 04 · Joga Orile', pts: 640 },
];

const RECENT_CHECKINS = [
    { place: 'Ilaro Ward 02 · Youth Town Hall',       when: '14 Sep, 16:05', pts: '+50' },
    { place: 'Abeokuta South · Market Walk',          when: '09 Sep, 09:12', pts: '+50' },
    { place: 'Ayetoro I · Borehole Commissioning',    when: '31 Aug, 11:40', pts: '+60' },
];

const HUB_STEPS = [
    { label: 'Application received',                       when: 'Today',   Icon: CheckCircle, color: T.accent,   done: true },
    { label: 'Ward screening · Ayetoro I town hall',       when: '28 Sep',  Icon: Users,       color: T.gold,     done: false },
    { label: 'Ballot draw, published publicly',            when: '05 Oct',  Icon: Ticket,      color: T.textMute, done: false },
    { label: 'Collection at LGA secretariat',              when: '19 Oct',  Icon: Gift,        color: T.textMute, done: false },
];

// ═══════════════════════════════════════════════════════════════════════════
//  PRIMITIVE COMPONENTS
// ═══════════════════════════════════════════════════════════════════════════

const GlobalStyles = () => (
    <style>{`
        @keyframes yc-fade-up { from { opacity: 0; transform: translateY(8px); } to { opacity: 1; transform: translateY(0); } }
        @keyframes yc-fade    { from { opacity: 0; } to { opacity: 1; } }
        @keyframes yc-pulse   { 0%,100% { transform: scale(1); opacity: .9; } 50% { transform: scale(1.04); opacity: 1; } }
        @keyframes yc-spin    { to { transform: rotate(360deg); } }
        @keyframes yc-scan    { 0% { top: 8%; } 100% { top: 88%; } }
        @keyframes yc-drift   { 0%,100% { transform: translateY(0); } 50% { transform: translateY(-4px); } }
        .yc-btn { cursor: pointer; font-family: inherit; transition: filter .15s ease, background .15s ease, transform .1s ease; }
        .yc-btn:hover { filter: brightness(1.12); }
        .yc-btn:active { transform: scale(.98); }
        .yc-tap { cursor: pointer; transition: filter .15s ease, background .15s ease; }
        .yc-tap:hover { filter: brightness(1.12); }
        .yc-scroll::-webkit-scrollbar { width: 4px; height: 4px; }
        .yc-scroll::-webkit-scrollbar-thumb { background: rgba(255,255,255,.08); border-radius: 4px; }
        .yc-hide-scroll::-webkit-scrollbar { display: none; }
        .yc-hide-scroll { scrollbar-width: none; }
        *:focus { outline: none !important; }
        *:focus-visible { outline: none !important; }
        button::-moz-focus-inner { border: 0; }
    `}</style>
);

const Chip = ({ children, color = T.gold, bg }) => (
    <span style={{
        display: 'inline-block',
        padding: '4px 10px',
        borderRadius: 999,
        background: bg || `${color}22`,
        color,
        fontSize: 10.5,
        fontWeight: 600,
        letterSpacing: '.14em',
        textTransform: 'uppercase',
    }}>{children}</span>
);

const SectionLabel = ({ children, right }) => (
    <div style={{ display: 'flex', alignItems: 'center', justifyContent: 'space-between', marginBottom: 8 }}>
        <span style={{ fontSize: 11, fontWeight: 600, letterSpacing: '.18em', color: T.gold, textTransform: 'uppercase' }}>
            {children}
        </span>
        {right}
    </div>
);

const Divider = () => (
    <div style={{
        height: 1,
        background: `linear-gradient(90deg,transparent,rgba(217,180,92,.35) 48px,rgba(217,180,92,.35) calc(100% - 48px),transparent)`,
    }} />
);

// ═══════════════════════════════════════════════════════════════════════════
//  DIGIT INPUT (used by airtime claim)
// ═══════════════════════════════════════════════════════════════════════════

const DigitInput = ({ length, prefixDigit, value, onChange, onComplete, disabled }) => {
    const boxCount = prefixDigit ? length - 1 : length;
    const refs = useRef([]);
    const editablePart = value ? (prefixDigit ? value.slice(1) : value) : '';
    const digits = Array.from({ length: boxCount }, (_, i) => editablePart[i] || '');

    const commit = (arr) => {
        const full = (prefixDigit || '') + arr.join('');
        onChange(full);
        if (arr.every(d => d !== '')) onComplete && onComplete(full);
    };

    const onKey = (e, idx) => {
        if (disabled) return;
        if (e.key === 'Backspace') {
            e.preventDefault();
            const arr = [...digits];
            if (arr[idx]) { arr[idx] = ''; commit(arr); }
            else if (idx > 0) { arr[idx - 1] = ''; commit(arr); refs.current[idx - 1]?.focus(); }
        }
    };

    const onChg = (e, idx) => {
        if (disabled) return;
        const raw = e.target.value.replace(/\D/g, '');
        if (!raw) return;
        const arr = [...digits];
        raw.split('').slice(0, boxCount - idx).forEach((ch, off) => {
            if (idx + off < boxCount) arr[idx + off] = ch;
        });
        commit(arr);
        const nextEmpty = arr.findIndex((d, i) => i >= idx && !d);
        const focusIdx = nextEmpty === -1 ? boxCount - 1 : nextEmpty;
        setTimeout(() => refs.current[focusIdx]?.focus(), 0);
    };

    const onPaste = (e) => {
        if (disabled) return;
        e.preventDefault();
        const pasted = e.clipboardData.getData('text').replace(/\D/g, '');
        if (!pasted) return;
        const arr = [...digits];
        pasted.split('').slice(0, boxCount).forEach((ch, i) => { arr[i] = ch; });
        commit(arr);
        const lastFilled = Math.min(pasted.length - 1, boxCount - 1);
        setTimeout(() => refs.current[lastFilled]?.focus(), 0);
    };

    const boxStyle = (filled) => ({
        width: 30, height: 44, borderRadius: 8, textAlign: 'center',
        fontSize: 15, fontWeight: 600,
        color: T.text, background: filled ? 'rgba(31,168,92,.1)' : 'rgba(255,255,255,.04)',
        border: filled ? `1px solid ${T.accent}` : `1px solid ${T.lineStrong}`,
        outline: 'none', fontFamily: FONT,
    });

    return (
        <div style={{ display: 'flex', gap: 6, alignItems: 'center' }}>
            {prefixDigit && (
                <input readOnly value={prefixDigit} tabIndex={-1}
                    style={{ ...boxStyle(false), background: 'rgba(217,180,92,.1)', border: `1px solid ${T.gold}55`, color: T.gold, cursor: 'default' }} />
            )}
            {digits.map((d, i) => (
                <input
                    key={i}
                    ref={el => refs.current[i] = el}
                    type="text" inputMode="numeric" maxLength={1}
                    value={d}
                    onChange={e => onChg(e, i)}
                    onKeyDown={e => onKey(e, i)}
                    onPaste={onPaste}
                    onFocus={e => e.target.select()}
                    disabled={disabled}
                    style={boxStyle(!!d)}
                />
            ))}
        </div>
    );
};

// ═══════════════════════════════════════════════════════════════════════════
//  PHONE SHELL — wraps app on desktop as a phone frame, full-bleed on mobile
// ═══════════════════════════════════════════════════════════════════════════

const PhoneShell = ({ children }) => {
    const [isMobile, setIsMobile] = useState(typeof window !== 'undefined' && window.innerWidth <= 480);
    useEffect(() => {
        const onResize = () => setIsMobile(window.innerWidth <= 480);
        window.addEventListener('resize', onResize);
        return () => window.removeEventListener('resize', onResize);
    }, []);

    if (isMobile) {
        return (
            <div style={{
                position: 'fixed',
                inset: 0,
                background: T.ground,
                color: T.text,
                fontFamily: FONT,
                display: 'flex', flexDirection: 'column',
                overflow: 'hidden',
            }}>
                {children}
            </div>
        );
    }

    return (
        <div style={{
            width: '100vw', minHeight: '100vh',
            background: `radial-gradient(80% 60% at 50% 0%, rgba(31,168,92,.08), transparent 60%), #05100a`,
            display: 'flex', alignItems: 'center', justifyContent: 'center',
            padding: '24px 16px',
            fontFamily: FONT, color: T.text,
        }}>
            <div style={{
                width: 412, height: 892, maxHeight: 'calc(100vh - 48px)',
                borderRadius: 44,
                border: '10px solid #0f1a14',
                background: T.ground,
                boxShadow: '0 40px 80px rgba(0,0,0,.55), 0 0 0 2px rgba(217,180,92,.15)',
                overflow: 'hidden',
                position: 'relative',
                display: 'flex', flexDirection: 'column',
            }}>
                {children}
            </div>
        </div>
    );
};

// ═══════════════════════════════════════════════════════════════════════════
//  HEADER + BOTTOM NAV
// ═══════════════════════════════════════════════════════════════════════════

const AppHeader = () => (
    <div style={{
        flex: 'none', display: 'flex', alignItems: 'center', gap: 10,
        padding: '12px 14px 10px',
        background: T.header,
        borderBottom: `1px solid ${T.line}`,
    }}>
        <img src={yayiMark} alt="" style={{ width: 38, height: 38, objectFit: 'contain' }} />
        <div style={{ flex: 1, minWidth: 0 }}>
            <div style={{ fontSize: 13, fontWeight: 600, letterSpacing: '.12em', color: T.text }}>YAYI GATEWAY</div>
            <div style={{ marginTop: 3, fontSize: 11, fontWeight: 500, letterSpacing: '.24em', color: T.gold }}>CONNECT</div>
        </div>
        <button className="yc-btn" style={{
            width: 44, height: 44, borderRadius: '50%', border: 'none',
            background: 'transparent', color: T.textDim,
            display: 'flex', alignItems: 'center', justifyContent: 'center',
        }} onClick={() => {}} aria-label="Search">
            <Search size={20} strokeWidth={2} />
        </button>
        <div style={{
            width: 40, height: 40, borderRadius: '50%',
            border: `1px solid ${T.gold}88`,
            background: '#17402c',
            display: 'flex', alignItems: 'center', justifyContent: 'center',
            fontSize: 13, fontWeight: 600, letterSpacing: '.02em', color: T.text,
        }}>AT</div>
    </div>
);

const BottomNav = ({ screen, go }) => {
    const items = [
        { id: 'home',     label: 'Home',     Icon: Home },
        { id: 'quests',   label: 'Quests',   Icon: Award },
        { id: 'scan',     label: 'Scan',     Icon: QrCode },
        { id: 'projects', label: 'Projects', Icon: Map },
        { id: 'hub',      label: 'Hub',      Icon: Gift },
    ];
    return (
        <div style={{
            flex: 'none',
            display: 'flex', alignItems: 'stretch',
            padding: `6px 4px calc(10px + env(safe-area-inset-bottom, 0px))`,
            background: T.header,
            borderTop: `1px solid ${T.line}`,
        }}>
            {items.map(({ id, label, Icon }) => {
                const active = screen === id;
                return (
                    <button key={id} className="yc-btn" onClick={() => go(id)} style={{
                        flex: 1, minHeight: 56, border: 'none', background: 'transparent',
                        display: 'flex', flexDirection: 'column', alignItems: 'center', justifyContent: 'center',
                        gap: 5, borderRadius: 10, padding: 0,
                    }}>
                        <span style={{
                            width: 46, height: 26, borderRadius: 13,
                            display: 'flex', alignItems: 'center', justifyContent: 'center',
                            background: active ? T.accent : 'transparent',
                            transition: 'background .18s ease',
                        }}>
                            <Icon size={19} strokeWidth={2.2} color={active ? '#04140c' : T.textDim} />
                        </span>
                        <span style={{
                            fontSize: 10.5, fontWeight: 500,
                            color: active ? T.accent : T.textDim,
                        }}>{label}</span>
                    </button>
                );
            })}
        </div>
    );
};

const Toast = ({ msg }) => msg ? (
    <div style={{
        position: 'absolute', left: 16, right: 16, bottom: 88, zIndex: 100,
        padding: '13px 14px', borderRadius: 10,
        background: 'rgba(22,51,35,.9)', backdropFilter: 'blur(8px)',
        border: `1px solid ${T.accent}77`,
        boxShadow: '0 12px 30px rgba(0,0,0,.45)',
        display: 'flex', alignItems: 'center', gap: 10,
        animation: 'yc-fade-up .28s cubic-bezier(0.16,1,0.3,1)',
    }}>
        <Award size={17} color={T.gold} strokeWidth={2.2} />
        <span style={{ fontSize: 12.5, fontWeight: 500, lineHeight: 1.35, color: T.text }}>{msg}</span>
    </div>
) : null;

// ═══════════════════════════════════════════════════════════════════════════
//  HOME SCREEN
// ═══════════════════════════════════════════════════════════════════════════

const HomeScreen = ({ points, claimed, go, openGeohunt, join }) => {
    const [heroIdx, setHeroIdx] = useState(0);
    const swipeX = useRef(null);
    const swipeY = useRef(null);
    const carouselRef = useRef(null);
    useEffect(() => {
        const t = setInterval(() => setHeroIdx(i => (i + 1) % 2), 4500);
        return () => clearInterval(t);
    }, []);
    useEffect(() => {
        const el = carouselRef.current;
        if (!el) return;
        const onStart = (e) => {
            swipeX.current = e.targetTouches[0].clientX;
            swipeY.current = e.targetTouches[0].clientY;
        };
        const onMove = (e) => {
            if (swipeX.current === null) return;
            const dx = Math.abs(e.targetTouches[0].clientX - swipeX.current);
            const dy = Math.abs(e.targetTouches[0].clientY - swipeY.current);
            if (dx > dy) e.preventDefault();
        };
        const onEnd = (e) => {
            if (swipeX.current === null) return;
            const diff = swipeX.current - e.changedTouches[0].clientX;
            if (Math.abs(diff) > 40) setHeroIdx(diff > 0 ? 1 : 0);
            swipeX.current = null;
            swipeY.current = null;
        };
        el.addEventListener('touchstart', onStart, { passive: true });
        el.addEventListener('touchmove', onMove, { passive: false });
        el.addEventListener('touchend', onEnd);
        return () => {
            el.removeEventListener('touchstart', onStart);
            el.removeEventListener('touchmove', onMove);
            el.removeEventListener('touchend', onEnd);
        };
    }, []);
    const pct = Math.min(100, Math.round(points / POINTS_GOAL * 100));
    const initials = n => n.split(' ').map(w => w[0]).join('').slice(0, 2).toUpperCase();
    const me = { name: 'You · Adebayo T.', ward: 'Ward 04 · Ayetoro I', pts: points, you: true };
    const ranked = useMemo(() => [...PEERS, me].sort((a, b) => b.pts - a.pts), [points]);
    const myRank = ranked.findIndex(r => r.you) + 1;
    const boardPreview = [
        ...ranked.slice(0, 3),
        ...(myRank > 3 ? [ranked.find(r => r.you)] : []),
    ];

    const sparkline = [34, 48, 30, 62, 55, 78, 46, 84, 60, 92, 70, 100, 82, 96];

    const tiles = [
        { label: 'QR Verification',  meta: 'Opens Geohunt',    Icon: QrCode,     color: T.accent, onClick: openGeohunt, external: true },
        { label: 'Empowerment Hub',  meta: '4 programs open',  Icon: Gift,       color: T.gold,   onClick: () => go('hub') },
        { label: 'Campaign Trivia',  meta: 'Play & win airtime', Icon: HelpCircle, color: T.accent, onClick: () => go('trivia-play'), highlight: true },
        { label: '100-Day Plan',     meta: 'Ogun 2027 brief',  Icon: FileText,   color: T.gold,   onClick: () => {} },
    ];

    return (
        <div style={{ padding: '14px 14px 22px', display: 'flex', flexDirection: 'column', gap: 14, animation: 'yc-fade .3s ease' }}>
            {/* Hero carousel */}
            <div ref={carouselRef} style={{ userSelect: 'none' }}>
                <div style={{ display: 'flex', gap: 12, transform: `translateX(calc(-${heroIdx * 100}% - ${heroIdx * 12}px))`, transition: 'transform .45s cubic-bezier(.4,0,.2,1)' }}>

                    {/* ── Slide 1: Progress. Unity. Future. ── */}
                    <div style={{
                        flex: 'none', width: '100%', borderRadius: 14, overflow: 'hidden',
                        background: `linear-gradient(120deg, ${T.heroA} 0%, ${T.heroB} 55%, ${T.heroC} 100%)`,
                        border: `1px solid rgba(217,180,92,.25)`,
                    }}>
                        <div style={{ display: 'flex', alignItems: 'stretch' }}>
                            <div style={{ flex: 1, minWidth: 0, padding: '18px 12px 18px 16px', display: 'flex', flexDirection: 'column' }}>
                                <h2 style={{ margin: 0, fontSize: 28, fontWeight: 600, lineHeight: 1.16, letterSpacing: '-.01em', color: T.text }}>
                                    Progress. Unity. Future.
                                </h2>
                                <div style={{ marginTop: 15, fontSize: 12, lineHeight: 1.4, color: 'rgba(236,243,238,.72)' }}>
                                    Sen. Solomon Olamilekan Adeola
                                </div>
                                <div style={{ marginTop: 4, fontSize: 12, fontWeight: 500, color: T.gold }}>
                                    Ogun State Governor 2027
                                </div>
                                <div style={{ display: 'flex', gap: 8, marginTop: 'auto', paddingTop: 40 }}>
                                    <button className="yc-btn" onClick={join} style={{
                                        flex: 1, minHeight: 44, padding: '6px 8px', borderRadius: 8, border: 'none',
                                        background: T.gold, color: '#101a14',
                                        fontSize: 'clamp(9px, 2.5vw, 11px)', fontWeight: 700, letterSpacing: '.03em',
                                        lineHeight: 1.2, textAlign: 'center', wordBreak: 'break-word',
                                    }}>JOIN THE MOVEMENT</button>
                                    <button className="yc-btn" onClick={() => {}} style={{
                                        flex: 1, minHeight: 44, padding: '6px 8px', borderRadius: 8, border: 'none',
                                        background: '#0d3324', color: T.text,
                                        fontSize: 'clamp(9px, 2.5vw, 11px)', fontWeight: 700, letterSpacing: '.03em',
                                        lineHeight: 1.2, textAlign: 'center', wordBreak: 'break-word',
                                    }}>OUR PLAN</button>
                                </div>
                            </div>
                            <div style={{ flex: 'none', width: 110, position: 'relative' }}>
                                <img src={adeolaPortrait} alt="Sen. Adeola"
                                    style={{ width: '100%', height: '100%', objectFit: 'cover', objectPosition: 'top center', display: 'block' }} />
                            </div>
                        </div>
                    </div>

                    {/* ── Slide 2: Y.A.Y.I Mandate ── */}
                    <div style={{
                        flex: 'none', width: '100%', borderRadius: 14, overflow: 'hidden',
                        background: `linear-gradient(150deg, ${T.heroA} 0%, ${T.heroB} 55%, ${T.heroC} 100%)`,
                        border: `1px solid rgba(217,180,92,.4)`,
                    }}>
                        <div style={{ display: 'flex', alignItems: 'stretch', position: 'relative', minHeight: 170 }}>
                            <div style={{ flex: 1, minWidth: 0, padding: '14px 8px 12px 14px', position: 'relative', zIndex: 1 }}>
                                <span style={{
                                    display: 'inline-block', padding: '4px 9px', borderRadius: 20,
                                    background: T.gold, color: '#101a14',
                                    fontSize: 8, fontWeight: 700, letterSpacing: '.06em', whiteSpace: 'nowrap',
                                }}>GATEWAY 2027 • BLUEPRINT</span>
                                <h2 style={{ margin: '7px 0 0', fontSize: 17, fontWeight: 600, lineHeight: 1.1, letterSpacing: '-.01em', color: '#fff' }}>
                                    The Y.A.Y.I Mandate
                                </h2>
                                <div style={{ marginTop: 3, fontSize: 10, lineHeight: 1.3, color: 'rgba(236,243,238,.65)' }}>
                                    Engineering Sustainable Governance for Ogun State
                                </div>
                                <div style={{ marginTop: 7, display: 'flex', flexDirection: 'column', gap: 3 }}>
                                    {[
                                        ['Y', 'YIELDING RESULTS',  'Auditable Fiscal Delivery'],
                                        ['A', 'ACCOUNTABLE',       'Open Budgets & Zero Diversion'],
                                        ['Y', 'YOUTH-CENTRIC',     'Tech Incubators & Micro-Grants'],
                                        ['I', 'INFRASTRUCTURE',    '60 Boreholes • 5,360 Solar Lights'],
                                    ].map(([letter, title, desc], idx) => (
                                        <div key={idx} style={{ display: 'flex', alignItems: 'center', gap: 7 }}>
                                            <span style={{
                                                flex: 'none', width: 18, height: 18, borderRadius: '50%',
                                                background: T.gold, color: '#101a14',
                                                fontSize: 10, fontWeight: 700, lineHeight: 1,
                                                display: 'flex', alignItems: 'center', justifyContent: 'center',
                                            }}>{letter}</span>
                                            <div style={{ minWidth: 0 }}>
                                                <div style={{ fontSize: 10, fontWeight: 600, lineHeight: 1.1, letterSpacing: '.02em', color: '#fff' }}>{title}</div>
                                                <div style={{ fontSize: 9, lineHeight: 1.1, color: 'rgba(236,243,238,.55)' }}>{desc}</div>
                                            </div>
                                        </div>
                                    ))}
                                </div>
                                <div style={{ display: 'flex', flexWrap: 'wrap', gap: 7, marginTop: 8 }}>
                                    <button className="yc-btn" onClick={() => {}} style={{
                                        minHeight: 32, padding: '0 11px', borderRadius: 8, border: 'none',
                                        background: T.gold, color: '#101a14',
                                        fontSize: 10, fontWeight: 700, letterSpacing: '.02em', whiteSpace: 'nowrap',
                                    }}>Explore Blueprint</button>
                                    <button className="yc-btn" onClick={() => go('projects')} style={{
                                        minHeight: 32, padding: '0 11px', borderRadius: 8,
                                        border: '1px solid rgba(255,255,255,.3)',
                                        background: 'rgba(255,255,255,.06)', color: T.text,
                                        fontSize: 10, fontWeight: 600, whiteSpace: 'nowrap',
                                    }}>Track Assets</button>
                                </div>
                            </div>
                            <img src={mandatePortrait} alt="Sen. Yayi" style={{
                                position: 'absolute', right: -30, bottom: -20,
                                height: '100%', width: 'auto',
                                objectFit: 'contain', display: 'block',
                            }} />
                        </div>
                    </div>
                </div>

                {/* Dots — below carousel */}
                <div style={{ display: 'flex', gap: 5, justifyContent: 'center', padding: '8px 0 0' }}>
                    {[0, 1].map(i => (
                        <span key={i} onClick={() => setHeroIdx(i)} style={{
                            width: i === heroIdx ? 16 : 5, height: 5, borderRadius: 999,
                            background: i === heroIdx ? T.gold : 'rgba(236,243,238,.3)',
                            cursor: 'pointer', transition: 'width .3s ease, background .3s ease',
                        }} />
                    ))}
                </div>
            </div>

            {/* Gateway Quest / Active Citizen Hub — whole card opens GeoQuest */}
            <div className="yc-tap" onClick={openGeohunt} style={{
                borderRadius: 12, background: T.card,
                border: `1px solid ${T.line}`, padding: 14, cursor: 'pointer', marginTop: 8,
            }}>
                <SectionLabel right={
                    <button className="yc-btn" onClick={() => go('quests')} style={{
                        minHeight: 32, border: 'none', background: 'transparent',
                        color: T.textDim, fontSize: 12, fontWeight: 500,
                        display: 'flex', alignItems: 'center', gap: 4,
                    }}>
                        All quests <ChevronRight size={13} strokeWidth={2.4} />
                    </button>
                }>
                    <span style={{ display: 'inline-flex', alignItems: 'center', gap: 6 }}>
                        <Award size={13} color={T.gold} strokeWidth={2.4} />
                        GATEWAY QUEST
                    </span>
                </SectionLabel>
                <div style={{ marginTop: 6, display: 'flex', alignItems: 'baseline', gap: 8 }}>
                    <span style={{ fontSize: 26, fontWeight: 500, color: T.text }}>{points.toLocaleString()}</span>
                    <span style={{ fontSize: 12, color: T.textDim }}>of {POINTS_GOAL.toLocaleString()} pts to Gold Citizen</span>
                </div>
                <div style={{ marginTop: 10, height: 8, borderRadius: 4, background: 'rgba(255,255,255,.08)', overflow: 'hidden' }}>
                    <div style={{
                        height: '100%', borderRadius: 4,
                        background: `linear-gradient(90deg, ${T.accent}, ${T.gold})`,
                        width: `${pct}%`, transition: 'width .5s ease',
                    }} />
                </div>
                <div style={{
                    marginTop: 12, display: 'flex', alignItems: 'center', gap: 10,
                    paddingTop: 12, borderTop: `1px solid ${T.line}`,
                }}>
                    <div style={{
                        width: 36, height: 36, borderRadius: 8,
                        background: 'rgba(31,168,92,.14)',
                        display: 'flex', alignItems: 'center', justifyContent: 'center',
                    }}>
                        <QrCode size={18} color={T.accent} strokeWidth={2.2} />
                    </div>
                    <div style={{ flex: 1, minWidth: 0 }}>
                        <div style={{ fontSize: 13, fontWeight: 500, lineHeight: 1.3, color: T.text }}>
                            Active Citizen Hub: Verify &amp; Check-In
                        </div>
                        <div style={{ marginTop: 3, fontSize: 11, lineHeight: 1.3, color: T.textDim }}>
                            {claimed.checkin ? 'Verified today · +50 earned' : 'Opens GeoQuest for ward check-ins'}
                        </div>
                    </div>
                    <button className="yc-btn" onClick={openGeohunt} style={{
                        minHeight: 36, padding: '0 12px', borderRadius: 8, border: 'none',
                        background: T.accent, color: '#04140c',
                        fontSize: 12, fontWeight: 700,
                        display: 'inline-flex', alignItems: 'center', gap: 5,
                    }}>
                        Scan <ArrowRight size={13} strokeWidth={2.6} />
                    </button>
                </div>
            </div>

            {/* Projects sparkline */}
            <div style={{
                borderRadius: 12, background: T.card,
                border: `1px solid ${T.line}`, padding: 14,
            }}>
                <div style={{ display: 'flex', alignItems: 'center', justifyContent: 'space-between' }}>
                    <span style={{ fontSize: 13, fontWeight: 500, color: T.text }}>Track boreholes &amp; solar lights</span>
                    <button className="yc-btn" onClick={() => go('projects')} style={{
                        width: 32, height: 32, borderRadius: 8, border: 'none',
                        background: 'rgba(255,255,255,.05)', color: T.textDim,
                        display: 'flex', alignItems: 'center', justifyContent: 'center',
                    }}>
                        <ArrowRight size={14} strokeWidth={2.4} style={{ transform: 'rotate(-45deg)' }} />
                    </button>
                </div>
                <div style={{ display: 'flex', gap: 18, marginTop: 12 }}>
                    <div style={{ display: 'flex', alignItems: 'center', gap: 7 }}>
                        <span style={{ width: 7, height: 7, borderRadius: '50%', background: T.accent }} />
                        <span style={{ fontSize: 13, fontWeight: 500 }}>5,360</span>
                        <span style={{ fontSize: 12, color: T.textDim }}>solar lights</span>
                    </div>
                    <div style={{ display: 'flex', alignItems: 'center', gap: 7 }}>
                        <span style={{ width: 7, height: 7, borderRadius: '50%', background: T.gold }} />
                        <span style={{ fontSize: 13, fontWeight: 500 }}>60</span>
                        <span style={{ fontSize: 12, color: T.textDim }}>boreholes</span>
                    </div>
                </div>
                <div style={{ marginTop: 12, display: 'flex', gap: 3, height: 34, alignItems: 'flex-end' }}>
                    {sparkline.map((h, i) => (
                        <span key={i} style={{
                            flex: 1, borderRadius: '2px 2px 0 0',
                            background: 'rgba(31,168,92,.55)',
                            height: `${h}%`,
                        }} />
                    ))}
                </div>
                <div style={{ marginTop: 7, fontSize: 11, color: T.textMute }}>Ward-verified deliveries, last 14 weeks</div>
            </div>

            {/* Tile grid */}
            <div style={{ display: 'grid', gridTemplateColumns: '1fr 1fr', gap: 10 }}>
                {tiles.map(({ label, meta, Icon, color, onClick, external, highlight }) => (
                    <button key={label} className="yc-btn" onClick={onClick} style={{
                        textAlign: 'left', minHeight: 96, padding: 12,
                        borderRadius: 12,
                        border: highlight ? `1px solid ${T.gold}` : `1px solid ${T.line}`,
                        background: highlight ? 'rgba(217,180,92,.06)' : T.card,
                        cursor: 'pointer',
                        display: 'flex', flexDirection: 'column', justifyContent: 'space-between', gap: 6,
                    }}>
                        <div style={{ display: 'flex', alignItems: 'center', justifyContent: 'space-between' }}>
                            <Icon size={20} color={color} strokeWidth={2.2} />
                            {external && <ArrowRight size={12} color={T.textMute} strokeWidth={2.4} style={{ transform: 'rotate(-45deg)' }} />}
                        </div>
                        <div>
                            <div style={{ fontSize: 13, fontWeight: 500, lineHeight: 1.3, color: T.text }}>{label}</div>
                            <div style={{ marginTop: 3, fontSize: 11, lineHeight: 1.2, color: T.textMute }}>{meta}</div>
                        </div>
                    </button>
                ))}
            </div>

            {/* Leaderboard preview */}
            <div style={{
                borderRadius: 12, background: T.card,
                border: `1px solid ${T.line}`, padding: 14,
            }}>
                <SectionLabel right={
                    <button className="yc-btn" onClick={() => go('quests')} style={{
                        minHeight: 32, border: 'none', background: 'transparent',
                        color: T.textDim, fontSize: 12, fontWeight: 500,
                    }}>Full board</button>
                }>
                    WARD 04 LEADERBOARD
                </SectionLabel>
                <div style={{ marginTop: 4, display: 'flex', flexDirection: 'column', gap: 2 }}>
                    {boardPreview.map((r) => {
                        const rank = ranked.indexOf(r) + 1;
                        return (
                            <div key={r.name} style={{
                                display: 'flex', alignItems: 'center', gap: 10, minHeight: 44,
                                padding: '0 8px', borderRadius: 8,
                                background: r.you ? 'rgba(31,168,92,.12)' : 'rgba(255,255,255,.03)',
                            }}>
                                <span style={{
                                    width: 20, fontSize: 12, fontWeight: 500,
                                    color: rank <= 3 ? T.gold : T.textMute,
                                }}>{rank}</span>
                                <span style={{
                                    width: 28, height: 28, borderRadius: '50%',
                                    background: 'rgba(255,255,255,.07)',
                                    display: 'flex', alignItems: 'center', justifyContent: 'center',
                                    fontSize: 11, fontWeight: 500, color: 'rgba(236,243,238,.75)',
                                }}>{initials(r.name)}</span>
                                <span style={{
                                    flex: 1, minWidth: 0,
                                    fontSize: 13, fontWeight: 500,
                                    color: r.you ? T.text : 'rgba(236,243,238,.85)',
                                }}>{r.name}</span>
                                <span style={{
                                    fontSize: 12, fontWeight: 500,
                                    color: r.you ? T.accent : 'rgba(236,243,238,.65)',
                                }}>{r.pts.toLocaleString()}</span>
                            </div>
                        );
                    })}
                </div>
            </div>
        </div>
    );
};

// ═══════════════════════════════════════════════════════════════════════════
//  QUESTS SCREEN
// ═══════════════════════════════════════════════════════════════════════════

const QuestsScreen = ({ points, claimed, claim, go, openGeohunt }) => {
    const [tab, setTab] = useState('quests');
    const initials = n => n.split(' ').map(w => w[0]).join('').slice(0, 2).toUpperCase();
    const me = { name: 'You · Adebayo T.', ward: 'Ward 04 · Ayetoro I', pts: points, you: true };
    const ranked = useMemo(() => [...PEERS, me].sort((a, b) => b.pts - a.pts), [points]);
    const myRank = ranked.findIndex(r => r.you) + 1;
    const streak = 12;

    const QUESTS = [
        { id: 'checkin', label: 'Verify & Check-In at a ward event', sub: 'Opens GeoQuest · scan agent QR at any rally',       pts: 50, Icon: QrCode,     action: openGeohunt },
        { id: 'trivia',  label: 'Campaign Trivia: 3 questions',       sub: 'Ogun projects & the 2027 plan · earn airtime',    pts: 30, Icon: HelpCircle, action: () => go('trivia-play') },
        { id: 'invite',  label: 'Invite 3 neighbours',                sub: 'Share your ward referral code',                    pts: 40, Icon: UserPlus },
        { id: 'report',  label: 'Report a project in your ward',      sub: 'Photo + location of a borehole or solar light',   pts: 60, Icon: Camera,     action: () => go('projects') },
        { id: 'watch',   label: 'Watch the 100-Day Plan brief',       sub: '3 min from the Senator',                          pts: 20, Icon: Play },
    ];

    return (
        <div style={{ padding: '14px 14px 22px', display: 'flex', flexDirection: 'column', gap: 14, animation: 'yc-fade .3s ease' }}>
            {/* Standing */}
            <div style={{
                borderRadius: 14, padding: 16,
                background: `linear-gradient(130deg, ${T.heroA}, ${T.heroC})`,
                border: `1px solid ${T.gold}38`,
            }}>
                <div style={{ display: 'flex', alignItems: 'center', justifyContent: 'space-between' }}>
                    <div>
                        <div style={{ fontSize: 11, letterSpacing: '.18em', color: T.gold, fontWeight: 500 }}>YOUR STANDING</div>
                        <div style={{ marginTop: 10, display: 'flex', alignItems: 'baseline', gap: 7 }}>
                            <span style={{ fontSize: 30, fontWeight: 500 }}>{points.toLocaleString()}</span>
                            <span style={{ fontSize: 12, color: T.textDim }}>points</span>
                        </div>
                        <div style={{ marginTop: 8, fontSize: 12, color: T.textDim }}>
                            Rank {myRank} in Ward 04 · {streak}-day streak
                        </div>
                    </div>
                    <div style={{
                        width: 66, height: 66, borderRadius: '50%',
                        border: `1px solid ${T.gold}88`,
                        background: 'rgba(217,180,92,.08)',
                        display: 'flex', flexDirection: 'column', alignItems: 'center', justifyContent: 'center',
                    }}>
                        <Award size={20} color={T.gold} strokeWidth={2.2} />
                        <span style={{ marginTop: 3, fontSize: 10, fontWeight: 500, letterSpacing: '.08em', color: T.gold }}>
                            {points >= POINTS_GOAL ? 'GOLD' : 'SILVER'}
                        </span>
                    </div>
                </div>
            </div>

            {/* Tabs */}
            <div style={{ display: 'flex', gap: 6, padding: 4, borderRadius: 10, background: 'rgba(255,255,255,.05)' }}>
                {[['quests', 'Daily quests'], ['board', 'Leaderboard']].map(([id, label]) => (
                    <button key={id} className="yc-btn" onClick={() => setTab(id)} style={{
                        flex: 1, minHeight: 40, border: 'none', borderRadius: 8,
                        fontSize: 13, fontWeight: 500,
                        background: tab === id ? T.accent : 'transparent',
                        color: tab === id ? '#04140c' : T.textDim,
                    }}>{label}</button>
                ))}
            </div>

            {tab === 'quests' && (
                <>
                    <div style={{ display: 'flex', flexDirection: 'column', gap: 10 }}>
                        {QUESTS.map(q => {
                            const done = !!claimed[q.id];
                            const Icon = q.Icon;
                            return (
                                <div key={q.id} style={{
                                    display: 'flex', alignItems: 'center', gap: 12,
                                    padding: 13, borderRadius: 12,
                                    background: T.card,
                                    border: `1px solid ${done ? T.accent + '77' : T.line}`,
                                }}>
                                    <div style={{
                                        width: 40, height: 40, flex: 'none', borderRadius: 10,
                                        background: done ? 'rgba(31,168,92,.16)' : 'rgba(255,255,255,.05)',
                                        display: 'flex', alignItems: 'center', justifyContent: 'center',
                                    }}>
                                        <Icon size={19} color={done ? T.accent : T.gold} strokeWidth={2.2} />
                                    </div>
                                    <div style={{ flex: 1, minWidth: 0 }}>
                                        <div style={{ fontSize: 13, fontWeight: 500, lineHeight: 1.35, color: done ? T.textDim : T.text }}>{q.label}</div>
                                        <div style={{ marginTop: 3, fontSize: 11, lineHeight: 1.35, color: T.textMute }}>{q.sub}</div>
                                    </div>
                                    <button className="yc-btn" onClick={() => claim(q)} style={{
                                        flex: 'none', minHeight: 38, minWidth: 64, padding: '0 12px',
                                        borderRadius: 8, border: 'none',
                                        fontSize: 12, fontWeight: 700,
                                        background: done ? T.accentDark : T.gold,
                                        color: done ? '#eafff3' : '#12180f',
                                    }}>{done ? 'Done' : `+${q.pts}`}</button>
                                </div>
                            );
                        })}
                    </div>
                    <div style={{
                        marginTop: 4, padding: 14, borderRadius: 12,
                        border: `1px dashed ${T.gold}55`,
                        background: 'rgba(217,180,92,.05)',
                    }}>
                        <div style={{ fontSize: 13, fontWeight: 500, lineHeight: 1.3, color: T.gold }}>
                            Ward bonus: {5 - Object.keys(claimed).length} quests left this week
                        </div>
                        <div style={{ marginTop: 5, fontSize: 11, lineHeight: 1.45, color: T.textDim }}>
                            Finish all 5 quests before Sunday to unlock the Gateway Ambassador badge and a slot in the empowerment ballot.
                        </div>
                    </div>
                </>
            )}

            {tab === 'board' && (
                <div style={{ display: 'flex', flexDirection: 'column', gap: 3 }}>
                    {ranked.map((r, i) => (
                        <div key={r.name} style={{
                            display: 'flex', alignItems: 'center', gap: 11,
                            minHeight: 52, padding: '0 10px', borderRadius: 10,
                            background: r.you ? 'rgba(31,168,92,.12)' : 'rgba(255,255,255,.03)',
                            border: `1px solid ${r.you ? T.accent + '77' : T.line}`,
                        }}>
                            <span style={{ width: 22, fontSize: 13, fontWeight: 500, color: i < 3 ? T.gold : T.textMute }}>{i + 1}</span>
                            <span style={{
                                width: 32, height: 32, borderRadius: '50%',
                                background: 'rgba(255,255,255,.07)',
                                display: 'flex', alignItems: 'center', justifyContent: 'center',
                                fontSize: 12, fontWeight: 500, color: 'rgba(236,243,238,.8)',
                            }}>{initials(r.name)}</span>
                            <div style={{ flex: 1, minWidth: 0 }}>
                                <div style={{ fontSize: 13, fontWeight: 500, color: r.you ? T.text : 'rgba(236,243,238,.85)' }}>{r.name}</div>
                                <div style={{ marginTop: 3, fontSize: 11, color: T.textMute }}>{r.ward}</div>
                            </div>
                            <span style={{ fontSize: 13, fontWeight: 500, color: r.you ? T.accent : 'rgba(236,243,238,.7)' }}>{r.pts.toLocaleString()}</span>
                        </div>
                    ))}
                </div>
            )}
        </div>
    );
};

// ═══════════════════════════════════════════════════════════════════════════
//  SCAN SCREEN (opens Geohunt on scan)
// ═══════════════════════════════════════════════════════════════════════════

const ScanScreen = ({ openGeohunt }) => (
    <div style={{ padding: '14px 14px 22px', display: 'flex', flexDirection: 'column', gap: 14, animation: 'yc-fade .3s ease' }}>
        <div style={{
            position: 'relative', borderRadius: 14, overflow: 'hidden',
            background: '#07120d', border: `1px solid ${T.line}`,
            height: 330, display: 'flex', alignItems: 'center', justifyContent: 'center',
        }}>
            <div style={{ position: 'absolute', inset: 0, background: 'radial-gradient(120% 80% at 50% 40%,rgba(31,168,92,.14),transparent 70%)' }} />
            <div style={{ position: 'relative', width: 212, height: 212 }}>
                {['top-left', 'top-right', 'bottom-left', 'bottom-right'].map(pos => {
                    const t = pos.includes('top'), l = pos.includes('left');
                    return (
                        <span key={pos} style={{
                            position: 'absolute',
                            left: l ? 0 : undefined, right: !l ? 0 : undefined,
                            top: t ? 0 : undefined, bottom: !t ? 0 : undefined,
                            width: 34, height: 34,
                            borderTop: t ? `2px solid ${T.gold}` : 'none',
                            borderBottom: !t ? `2px solid ${T.gold}` : 'none',
                            borderLeft: l ? `2px solid ${T.gold}` : 'none',
                            borderRight: !l ? `2px solid ${T.gold}` : 'none',
                            borderRadius: t && l ? '6px 0 0 0' : t && !l ? '0 6px 0 0' : !t && l ? '0 0 0 6px' : '0 0 6px 0',
                        }} />
                    );
                })}
                <div style={{
                    position: 'absolute', left: 8, right: 8,
                    height: 2, background: `linear-gradient(90deg,transparent,${T.accent},transparent)`,
                    boxShadow: '0 0 14px rgba(31,168,92,.8)',
                    animation: 'yc-scan 2s linear infinite',
                }} />
            </div>
            <div style={{
                position: 'absolute', left: 0, right: 0, bottom: 14,
                textAlign: 'center', fontSize: 12, lineHeight: 1.4, color: T.textDim,
            }}>
                Point at the agent QR code on the event banner
            </div>
        </div>

        <button className="yc-btn" onClick={openGeohunt} style={{
            minHeight: 52, borderRadius: 10, border: 'none',
            background: T.accent, color: '#04140c',
            fontSize: 14, fontWeight: 700, letterSpacing: '.04em',
            display: 'inline-flex', alignItems: 'center', justifyContent: 'center', gap: 10,
        }}>
            OPEN GEOHUNT <ArrowRight size={16} strokeWidth={2.6} />
        </button>

        <div>
            <div style={{ fontSize: 11, letterSpacing: '.18em', color: T.textMute, margin: '4px 0 10px', fontWeight: 500 }}>
                RECENT CHECK-INS
            </div>
            <div style={{ display: 'flex', flexDirection: 'column', gap: 8 }}>
                {RECENT_CHECKINS.map((c, i) => (
                    <div key={i} style={{
                        display: 'flex', alignItems: 'center', gap: 11,
                        padding: '11px 12px', borderRadius: 10,
                        background: 'rgba(255,255,255,.03)',
                        border: `1px solid ${T.line}`,
                    }}>
                        <MapPin size={16} color={T.gold} strokeWidth={2.2} />
                        <div style={{ flex: 1, minWidth: 0 }}>
                            <div style={{ fontSize: 12, fontWeight: 500, lineHeight: 1.3, color: T.text }}>{c.place}</div>
                            <div style={{ marginTop: 3, fontSize: 11, color: T.textMute }}>{c.when}</div>
                        </div>
                        <span style={{ fontSize: 12, fontWeight: 500, color: T.accent }}>{c.pts}</span>
                    </div>
                ))}
            </div>
        </div>
    </div>
);

// ═══════════════════════════════════════════════════════════════════════════
//  PROJECTS SCREEN
// ═══════════════════════════════════════════════════════════════════════════

const ProjectsScreen = ({ flash }) => {
    const [filter, setFilter] = useState('All');
    const filters = ['All', 'Boreholes', 'Solar', 'Roads', 'Health'];
    const shown = filter === 'All' ? PROJECTS : PROJECTS.filter(p => p.type === filter);
    const statA = filter === 'All' ? '5,360' : shown.length.toString();
    const statALabel = filter === 'All' ? 'Solar lights verified' : `${filter} projects tracked`;
    const statB = filter === 'All' ? '60' : `${shown.filter(p => p.status === 'DELIVERED').length}/${shown.length}`;
    const statBLabel = filter === 'All' ? 'Boreholes delivered' : 'Delivered in this filter';
    const pillFor = (status) => ({
        DELIVERED: { bg: 'rgba(31,168,92,.18)', color: T.accent },
        ACTIVE:    { bg: 'rgba(217,180,92,.18)', color: T.gold },
        PLANNED:   { bg: 'rgba(255,255,255,.08)', color: 'rgba(236,243,238,.65)' },
    }[status]);

    return (
        <div style={{ padding: '14px 14px 22px', display: 'flex', flexDirection: 'column', gap: 14, animation: 'yc-fade .3s ease' }}>
            <div>
                <h2 style={{ margin: 0, fontSize: 20, fontWeight: 500, lineHeight: 1.2 }}>Project tracker</h2>
                <p style={{ margin: '6px 0 0', fontSize: 12, lineHeight: 1.5, color: T.textDim }}>
                    Every borehole and solar light, ward by ward — reported by citizens, confirmed by agents.
                </p>
            </div>

            <div className="yc-hide-scroll" style={{ display: 'flex', gap: 8, overflowX: 'auto', paddingBottom: 2 }}>
                {filters.map(f => (
                    <button key={f} className="yc-btn" onClick={() => setFilter(f)} style={{
                        flex: 'none', minHeight: 38, padding: '0 14px',
                        borderRadius: 8, border: 'none',
                        fontSize: 12, fontWeight: 500,
                        background: filter === f ? T.accent : '#16241d',
                        color: filter === f ? '#04140c' : 'rgba(236,243,238,.8)',
                    }}>{f}</button>
                ))}
            </div>

            <div style={{ display: 'grid', gridTemplateColumns: '1fr 1fr', gap: 10 }}>
                <div style={{ padding: 13, borderRadius: 12, background: T.card, border: `1px solid ${T.line}` }}>
                    <div style={{ fontSize: 22, fontWeight: 500, color: T.accent }}>{statA}</div>
                    <div style={{ marginTop: 6, fontSize: 11, lineHeight: 1.3, color: T.textDim }}>{statALabel}</div>
                </div>
                <div style={{ padding: 13, borderRadius: 12, background: T.card, border: `1px solid ${T.line}` }}>
                    <div style={{ fontSize: 22, fontWeight: 500, color: T.gold }}>{statB}</div>
                    <div style={{ marginTop: 6, fontSize: 11, lineHeight: 1.3, color: T.textDim }}>{statBLabel}</div>
                </div>
            </div>

            <div style={{ display: 'flex', flexDirection: 'column', gap: 10 }}>
                {shown.map(p => {
                    const pill = pillFor(p.status);
                    return (
                        <div key={p.id} style={{
                            borderRadius: 12, background: T.card,
                            border: `1px solid ${T.line}`, overflow: 'hidden',
                        }}>
                            <div style={{ display: 'flex', gap: 12, padding: 12 }}>
                                <div style={{
                                    width: 72, height: 72, flex: 'none', borderRadius: 9,
                                    background: `linear-gradient(135deg, ${T.heroA}, ${T.heroC})`,
                                    display: 'flex', alignItems: 'center', justifyContent: 'center',
                                    color: T.gold,
                                }}>
                                    {p.type === 'Solar' ? <Sun size={30} strokeWidth={1.8} />
                                        : p.type === 'Boreholes' ? <Gift size={28} strokeWidth={1.8} />
                                        : p.type === 'Roads' ? <Map size={28} strokeWidth={1.8} />
                                        : <Star size={28} strokeWidth={1.8} />}
                                </div>
                                <div style={{ flex: 1, minWidth: 0 }}>
                                    <div style={{ display: 'flex', alignItems: 'center', gap: 8 }}>
                                        <span style={{ flex: 1, minWidth: 0, fontSize: 13, fontWeight: 500, lineHeight: 1.3 }}>{p.name}</span>
                                        <span style={{
                                            flex: 'none', padding: '4px 8px', borderRadius: 6,
                                            fontSize: 10, fontWeight: 600, letterSpacing: '.04em',
                                            background: pill.bg, color: pill.color,
                                        }}>{p.status}</span>
                                    </div>
                                    <div style={{ marginTop: 5, fontSize: 11, lineHeight: 1.4, color: T.textMute }}>{p.meta}</div>
                                    <div style={{ marginTop: 9, height: 6, borderRadius: 3, background: 'rgba(255,255,255,.08)', overflow: 'hidden' }}>
                                        <div style={{
                                            height: '100%', borderRadius: 3,
                                            background: p.status === 'DELIVERED' ? T.accent : T.gold,
                                            width: `${p.pct}%`,
                                        }} />
                                    </div>
                                    <div style={{ marginTop: 6, display: 'flex', justifyContent: 'space-between', fontSize: 10, color: T.textMute }}>
                                        <span>{p.pct}% delivered</span>
                                        <span>{p.reports} citizen reports</span>
                                    </div>
                                </div>
                            </div>
                            <button className="yc-btn" onClick={() => flash('Report queued for agent review · +60 points')} style={{
                                width: '100%', minHeight: 42, border: 'none',
                                borderTop: `1px solid ${T.line}`,
                                background: T.accentDark, color: '#eafff3',
                                fontSize: 12, fontWeight: 700,
                                display: 'flex', alignItems: 'center', justifyContent: 'center', gap: 6,
                            }}>
                                <Camera size={14} strokeWidth={2.4} />
                                Report status in my ward · +60 pts
                            </button>
                        </div>
                    );
                })}
            </div>
        </div>
    );
};

// ═══════════════════════════════════════════════════════════════════════════
//  HUB SCREEN
// ═══════════════════════════════════════════════════════════════════════════

const HubScreen = ({ points, flash }) => {
    const [view, setView] = useState('list');
    const [program, setProgram] = useState(null);

    if (view === 'form' && program) {
        return (
            <div style={{ padding: '14px 14px 22px', display: 'flex', flexDirection: 'column', gap: 14, animation: 'yc-fade .3s ease' }}>
                <div style={{ display: 'flex', alignItems: 'center', gap: 10 }}>
                    <button className="yc-btn" onClick={() => { setView('list'); setProgram(null); }} style={{
                        width: 40, height: 40, borderRadius: 8, border: 'none',
                        background: '#18271f', color: T.text,
                        display: 'flex', alignItems: 'center', justifyContent: 'center',
                    }}>
                        <ArrowLeft size={16} strokeWidth={2.4} />
                    </button>
                    <div style={{ flex: 1, minWidth: 0 }}>
                        <div style={{ fontSize: 15, fontWeight: 500, lineHeight: 1.2 }}>{program.name}</div>
                        <div style={{ marginTop: 3, fontSize: 11, color: T.textMute }}>Application · step 1 of 2</div>
                    </div>
                </div>
                <div style={{ display: 'flex', flexDirection: 'column', gap: 12 }}>
                    {[
                        ['Full name', 'Adebayo T. Oluwaseun'],
                        ['Trade or business', 'Tailoring · 4 years'],
                    ].map(([label, val]) => (
                        <div key={label}>
                            <div style={{ fontSize: 12, color: T.textDim, marginBottom: 7 }}>{label}</div>
                            <div style={{
                                minHeight: 46, display: 'flex', alignItems: 'center', padding: '0 13px',
                                border: `1px solid ${T.lineStrong}`, borderRadius: 8,
                                background: 'rgba(255,255,255,.04)', fontSize: 13, fontWeight: 500,
                            }}>{val}</div>
                        </div>
                    ))}
                    <div>
                        <div style={{ fontSize: 12, color: T.textDim, marginBottom: 7 }}>What will the support buy?</div>
                        <div style={{
                            minHeight: 82, padding: '12px 13px',
                            border: `1px solid ${T.lineStrong}`, borderRadius: 8,
                            background: 'rgba(255,255,255,.04)', fontSize: 13, lineHeight: 1.5,
                            color: 'rgba(236,243,238,.8)',
                        }}>
                            Two industrial machines so I can take school uniform contracts in Ayetoro and train three apprentices.
                        </div>
                    </div>
                    <div style={{
                        display: 'flex', alignItems: 'center', gap: 11, padding: 12,
                        borderRadius: 8, background: 'rgba(31,168,92,.08)',
                        border: `1px solid ${T.accent}44`,
                    }}>
                        <CheckCircle size={18} color={T.accent} strokeWidth={2.2} />
                        <span style={{ fontSize: 11, lineHeight: 1.45, color: 'rgba(236,243,238,.7)' }}>
                            Ward 04 verified · your check-in history counts as community reference
                        </span>
                    </div>
                    <button className="yc-btn" onClick={() => { setView('done'); flash('Application submitted · ballot entry added'); }} style={{
                        minHeight: 52, borderRadius: 10, border: 'none',
                        background: T.gold, color: '#101a14',
                        fontSize: 14, fontWeight: 700, letterSpacing: '.05em',
                    }}>SUBMIT APPLICATION</button>
                </div>
            </div>
        );
    }

    if (view === 'done') {
        return (
            <div style={{ padding: '14px 14px 22px', display: 'flex', flexDirection: 'column', gap: 14, animation: 'yc-fade .3s ease' }}>
                <div style={{
                    padding: '22px 16px', borderRadius: 14,
                    background: `linear-gradient(140deg, ${T.heroA}, ${T.heroC})`,
                    border: `1px solid ${T.accent}66`,
                    textAlign: 'center',
                }}>
                    <div style={{
                        width: 58, height: 58, margin: '0 auto', borderRadius: '50%',
                        background: 'rgba(31,168,92,.18)',
                        border: `1px solid ${T.accent}`,
                        display: 'flex', alignItems: 'center', justifyContent: 'center',
                    }}>
                        <CheckCircle size={26} color={T.accent} strokeWidth={2.2} />
                    </div>
                    <h3 style={{ margin: '14px 0 0', fontSize: 19, fontWeight: 500, lineHeight: 1.25 }}>Application received</h3>
                    <p style={{ margin: '8px 0 0', fontSize: 12, lineHeight: 1.6, color: T.textDim }}>
                        Reference YW04-8821. Ward screening holds on 28 Sep at Ayetoro I town hall — you'll get a push and an SMS.
                    </p>
                </div>
                <div style={{ display: 'flex', flexDirection: 'column', gap: 9 }}>
                    {HUB_STEPS.map((s, i) => {
                        const Icon = s.Icon;
                        return (
                            <div key={i} style={{
                                display: 'flex', alignItems: 'center', gap: 11,
                                padding: 12, borderRadius: 10,
                                background: 'rgba(255,255,255,.03)',
                                border: `1px solid ${s.done ? T.accent + '55' : T.line}`,
                            }}>
                                <Icon size={17} color={s.color} strokeWidth={2.2} />
                                <span style={{ flex: 1, fontSize: 12, fontWeight: 500, lineHeight: 1.3, color: s.done ? T.text : T.textDim }}>{s.label}</span>
                                <span style={{ fontSize: 11, color: T.textMute }}>{s.when}</span>
                            </div>
                        );
                    })}
                </div>
                <button className="yc-btn" onClick={() => { setView('list'); setProgram(null); }} style={{
                    minHeight: 46, borderRadius: 10, border: 'none',
                    background: '#18271f', color: T.text,
                    fontSize: 13, fontWeight: 700,
                }}>Back to the hub</button>
            </div>
        );
    }

    return (
        <div style={{ padding: '14px 14px 22px', display: 'flex', flexDirection: 'column', gap: 14, animation: 'yc-fade .3s ease' }}>
            <div>
                <h2 style={{ margin: 0, fontSize: 20, fontWeight: 500, lineHeight: 1.2 }}>Empowerment Hub</h2>
                <p style={{ margin: '6px 0 0', fontSize: 12, lineHeight: 1.5, color: T.textDim }}>
                    Grants, tools and training. Points move you up the ballot — they never buy a slot.
                </p>
            </div>
            <div style={{
                display: 'flex', alignItems: 'center', gap: 11, padding: 13,
                borderRadius: 12, background: 'rgba(217,180,92,.07)',
                border: `1px solid ${T.gold}44`,
            }}>
                <Ticket size={20} color={T.gold} strokeWidth={2.2} />
                <div style={{ flex: 1, minWidth: 0 }}>
                    <div style={{ fontSize: 12, fontWeight: 500, lineHeight: 1.3, color: T.gold }}>You hold 3 ballot entries</div>
                    <div style={{ marginTop: 3, fontSize: 11, lineHeight: 1.3, color: T.textDim }}>
                        Earned from {points.toLocaleString()} quest points
                    </div>
                </div>
            </div>
            <div style={{ display: 'flex', flexDirection: 'column', gap: 10 }}>
                {PROGRAMS.map(pr => {
                    const Icon = pr.Icon;
                    const isAccent = pr.tint === 'accent';
                    return (
                        <div key={pr.id} style={{
                            borderRadius: 12, background: T.card,
                            border: `1px solid ${T.line}`, padding: 13,
                        }}>
                            <div style={{ display: 'flex', alignItems: 'center', gap: 10 }}>
                                <div style={{
                                    width: 38, height: 38, flex: 'none', borderRadius: 10,
                                    background: isAccent ? 'rgba(31,168,92,.14)' : 'rgba(217,180,92,.14)',
                                    display: 'flex', alignItems: 'center', justifyContent: 'center',
                                }}>
                                    <Icon size={18} color={isAccent ? T.accent : T.gold} strokeWidth={2.2} />
                                </div>
                                <div style={{ flex: 1, minWidth: 0 }}>
                                    <div style={{ fontSize: 13, fontWeight: 500, lineHeight: 1.3 }}>{pr.name}</div>
                                    <div style={{ marginTop: 3, fontSize: 11, lineHeight: 1.3, color: T.textDim }}>{pr.meta}</div>
                                </div>
                            </div>
                            <div style={{ marginTop: 11, display: 'flex', alignItems: 'center', gap: 10 }}>
                                <div style={{ flex: 1, minWidth: 0 }}>
                                    <div style={{ height: 5, borderRadius: 3, background: 'rgba(255,255,255,.08)', overflow: 'hidden' }}>
                                        <div style={{ height: '100%', borderRadius: 3, background: T.gold, width: `${pr.pct}%` }} />
                                    </div>
                                    <div style={{ marginTop: 5, fontSize: 10, color: T.textMute }}>{pr.slots}</div>
                                </div>
                                <button className="yc-btn" onClick={() => { setProgram(pr); setView('form'); }} style={{
                                    flex: 'none', minHeight: 40, padding: '0 14px',
                                    borderRadius: 8, border: 'none',
                                    fontSize: 12, fontWeight: 700,
                                    background: T.accent, color: '#04140c',
                                }}>Apply</button>
                            </div>
                        </div>
                    );
                })}
            </div>
        </div>
    );
};

// ═══════════════════════════════════════════════════════════════════════════
//  TRIVIA — internal quiz game (triggered from Campaign Trivia tile)
// ═══════════════════════════════════════════════════════════════════════════

const TriviaPlayScreen = ({ onExit, onComplete }) => {
    const [qIdx, setQIdx] = useState(0);
    const [selected, setSelected] = useState(null);
    const [showResult, setShowResult] = useState(false);
    const [validating, setValidating] = useState(false);
    const [timeLeft, setTimeLeft] = useState(TIME_PER_QUESTION);
    const [running, setRunning] = useState(true);
    const [eliminated, setEliminated] = useState([]);
    const [audiencePoll, setAudiencePoll] = useState(null);
    const [lifelines, setLifelines] = useState({ fiftyFifty: false, askAudience: false, phoneFriend: false });
    const [runningScore, setRunningScore] = useState(0);
    const [timeBonus, setTimeBonus] = useState(null);

    const q = QUESTIONS[qIdx];

    useEffect(() => {
        if (!running || showResult) return;
        const t = setInterval(() => {
            setTimeLeft(prev => {
                if (prev <= 1) {
                    clearInterval(t);
                    handleTimeUp();
                    return 0;
                }
                return prev - 1;
            });
        }, 1000);
        return () => clearInterval(t);
    }, [running, showResult, qIdx]);

    useEffect(() => {
        if (timeBonus === null) return;
        const t = setTimeout(() => setTimeBonus(null), 1400);
        return () => clearTimeout(t);
    }, [timeBonus]);

    const handleTimeUp = () => {
        if (selected !== null) { submit(); return; }
        setRunning(false);
        setShowResult(true);
        setTimeout(() => finalize(false), 1600);
    };

    const submit = () => {
        if (validating || showResult || selected === null) return;
        setRunning(false); setValidating(true);
        setTimeout(() => {
            setValidating(false);
            setShowResult(true);
            const correct = selected === q.correct;
            setTimeout(() => finalize(correct), 1400);
        }, 1200);
    };

    const finalize = (wasCorrect) => {
        let newScore = runningScore;
        if (wasCorrect) newScore = PRIZE_STRUCTURE[Math.min(qIdx, PRIZE_STRUCTURE.length - 1)];
        setRunningScore(newScore);
        if (wasCorrect && qIdx < QUESTIONS.length - 1) {
            setQIdx(qIdx + 1);
            setSelected(null); setShowResult(false);
            setTimeLeft(TIME_PER_QUESTION); setRunning(true);
            setEliminated([]); setAudiencePoll(null);
        } else {
            onComplete(newScore);
        }
    };

    const useFiftyFifty = () => {
        if (lifelines.fiftyFifty) return;
        setLifelines(p => ({ ...p, fiftyFifty: true }));
        const wrongs = [0, 1, 2, 3].filter(i => i !== q.correct);
        setEliminated(wrongs.slice(0, 2));
        setTimeLeft(t => t + 10); setTimeBonus(10);
    };

    const useAskAudience = () => {
        if (lifelines.askAudience) return;
        setLifelines(p => ({ ...p, askAudience: true }));
        setTimeLeft(t => t + 10); setTimeBonus(10);
        const wrongs = [0, 1, 2, 3].filter(i => i !== q.correct);
        const secondHighest = wrongs[Math.floor(Math.random() * wrongs.length)];
        const rest = wrongs.filter(i => i !== secondHighest);
        const correctPct = 45 + Math.floor(Math.random() * 30);
        const secondPct = 15 + Math.floor(Math.random() * 20);
        const leftover = 100 - correctPct - secondPct;
        const thirdPct = Math.floor(leftover / 2) + Math.floor(Math.random() * (leftover / 2));
        setAudiencePoll({
            [q.correct]: correctPct,
            [secondHighest]: secondPct,
            [rest[0]]: thirdPct,
            [rest[1]]: leftover - thirdPct,
        });
    };

    const usePhoneFriend = () => {
        if (lifelines.phoneFriend) return;
        setLifelines(p => ({ ...p, phoneFriend: true }));
        setTimeLeft(t => t + 15); setTimeBonus(15);
    };

    const timerCirc = 2 * Math.PI * 42;
    const timerDash = timerCirc * (timeLeft / TIME_PER_QUESTION);
    const timerColor = timeLeft <= 10 ? '#e35d5b' : T.accent;

    return (
        <div style={{
            width: '100%', flex: 1, minHeight: 0,
            display: 'flex', flexDirection: 'column',
            background: T.ground, color: T.text,
            animation: 'yc-fade .3s ease',
        }}>
            {/* Trivia header */}
            <div style={{
                flex: 'none', display: 'flex', alignItems: 'center', gap: 10,
                padding: '12px 14px', background: T.header,
                borderBottom: `1px solid ${T.line}`,
            }}>
                <button className="yc-btn" onClick={onExit} style={{
                    width: 36, height: 36, borderRadius: 8, border: 'none',
                    background: '#18271f', color: T.text,
                    display: 'flex', alignItems: 'center', justifyContent: 'center',
                }}>
                    <ArrowLeft size={16} strokeWidth={2.4} />
                </button>
                <div style={{ flex: 1, minWidth: 0 }}>
                    <div style={{ fontSize: 11, letterSpacing: '.16em', color: T.gold, fontWeight: 500 }}>
                        CAMPAIGN TRIVIA · Q{qIdx + 1} of {QUESTIONS.length}
                    </div>
                    <div style={{ marginTop: 2, fontSize: 13, fontWeight: 500 }}>
                        Bank ₦{PRIZE_STRUCTURE[qIdx]} on this question
                    </div>
                </div>
                <div style={{
                    display: 'inline-flex', alignItems: 'center', gap: 6,
                    padding: '6px 10px', borderRadius: 999,
                    background: 'rgba(31,168,92,.14)', color: T.accent,
                    fontSize: 12, fontWeight: 700,
                }}>
                    ₦{runningScore.toLocaleString()}
                </div>
            </div>

            <div className="yc-scroll" style={{ flex: 1, overflowY: 'auto', padding: '14px 14px 22px', display: 'flex', flexDirection: 'column', gap: 14 }}>
                {/* Lifelines */}
                <div style={{
                    display: 'flex', gap: 8, padding: '8px 10px',
                    borderRadius: 999, background: T.card, border: `1px solid ${T.line}`,
                }}>
                    {[
                        { key: 'fiftyFifty',  label: '50/50',    Icon: Scissors, onUse: useFiftyFifty },
                        { key: 'askAudience', label: 'Audience', Icon: Users,    onUse: useAskAudience },
                        { key: 'phoneFriend', label: 'Phone',    Icon: Phone,    onUse: usePhoneFriend },
                    ].map(({ key, label, Icon, onUse }) => {
                        const used = lifelines[key];
                        return (
                            <button key={key} className="yc-btn" disabled={used} onClick={onUse} style={{
                                flex: 1, display: 'flex', alignItems: 'center', justifyContent: 'center', gap: 6,
                                padding: '8px 6px', borderRadius: 999, border: 'none',
                                background: used ? 'transparent' : 'rgba(255,255,255,.04)',
                                color: used ? T.textMute : T.text,
                                opacity: used ? .5 : 1, fontSize: 11.5, fontWeight: 600,
                                cursor: used ? 'not-allowed' : 'pointer',
                            }}>
                                <Icon size={14} strokeWidth={2.4} />
                                {label}
                            </button>
                        );
                    })}
                </div>

                {/* Question card */}
                <div style={{
                    background: T.card, borderRadius: 14,
                    border: `1px solid ${T.line}`, padding: '16px 14px',
                }}>
                    <div style={{ display: 'flex', gap: 6, alignItems: 'center', marginBottom: 10 }}>
                        <Chip color={T.accent} bg="rgba(31,168,92,.14)">{q.category}</Chip>
                        <Chip color={T.gold} bg="rgba(217,180,92,.14)">{q.difficulty}</Chip>
                    </div>
                    <div style={{ fontSize: 16, fontWeight: 500, lineHeight: 1.4, color: T.text, marginBottom: 16 }}>
                        {q.question}
                    </div>

                    <div style={{ display: 'flex', flexDirection: 'column', gap: 8 }}>
                        {q.options.map((opt, idx) => {
                            const isElim = eliminated.includes(idx);
                            const isSel = selected === idx;
                            const isCorrect = idx === q.correct;
                            let state = 'idle';
                            if (isElim) state = 'elim';
                            else if (validating && isSel) state = 'validating';
                            else if (isSel) state = 'selected';
                            if (showResult) {
                                if (isCorrect) state = 'correct';
                                else if (isSel) state = 'incorrect';
                            }
                            const clickable = !isElim && !showResult && !validating;
                            const styles = ({
                                idle:       { bg: 'rgba(255,255,255,.04)', border: T.line,          text: T.text,      badgeBg: 'rgba(255,255,255,.08)', badgeText: T.textDim },
                                selected:   { bg: 'rgba(31,168,92,.10)',   border: T.accent,        text: T.text,      badgeBg: T.accent,                badgeText: '#04140c' },
                                validating: { bg: 'rgba(217,180,92,.08)',  border: T.gold,          text: T.text,      badgeBg: T.gold,                  badgeText: '#12180f' },
                                correct:    { bg: 'rgba(31,168,92,.16)',   border: T.accent,        text: T.text,      badgeBg: T.accent,                badgeText: '#04140c' },
                                incorrect:  { bg: 'rgba(227,93,91,.14)',   border: '#e35d5b',       text: T.text,      badgeBg: '#e35d5b',               badgeText: '#150606' },
                                elim:       { bg: 'transparent',           border: T.line,          text: T.textMute,  badgeBg: 'rgba(255,255,255,.04)', badgeText: T.textMute },
                            })[state];
                            const poll = audiencePoll ? audiencePoll[idx] : 0;
                            return (
                                <div key={idx}
                                    onClick={() => clickable && setSelected(idx)}
                                    className={clickable ? 'yc-tap' : ''}
                                    style={{
                                        position: 'relative', overflow: 'hidden',
                                        display: 'flex', alignItems: 'center', gap: 12,
                                        padding: '12px 14px', borderRadius: 12,
                                        background: styles.bg,
                                        border: `1.5px solid ${styles.border}`,
                                        cursor: clickable ? 'pointer' : 'default',
                                        opacity: isElim ? .45 : 1,
                                    }}>
                                    {audiencePoll && (
                                        <div style={{
                                            position: 'absolute', right: 0, top: 0, bottom: 0,
                                            width: `${poll}%`,
                                            background: isCorrect ? 'rgba(31,168,92,.18)' : 'rgba(217,180,92,.10)',
                                            transition: 'width 1.2s ease-out',
                                        }} />
                                    )}
                                    <div style={{
                                        position: 'relative', zIndex: 1, flex: 'none',
                                        width: 32, height: 32, borderRadius: '50%',
                                        display: 'flex', alignItems: 'center', justifyContent: 'center',
                                        background: styles.badgeBg, color: styles.badgeText,
                                        fontSize: 13, fontWeight: 700,
                                    }}>{['A', 'B', 'C', 'D'][idx]}</div>
                                    <div style={{
                                        position: 'relative', zIndex: 1, flex: 1, minWidth: 0,
                                        fontSize: 13.5, lineHeight: 1.4, fontWeight: 500, color: styles.text,
                                    }}>{opt}</div>
                                    <div style={{ position: 'relative', zIndex: 1, display: 'flex', alignItems: 'center', gap: 6, flex: 'none' }}>
                                        {audiencePoll && <span style={{ fontSize: 12, fontWeight: 700, color: isCorrect ? T.accent : T.textDim }}>{poll}%</span>}
                                        {state === 'correct' && <Check size={16} color={T.accent} strokeWidth={3} />}
                                        {state === 'incorrect' && <XIcon size={16} color="#e35d5b" strokeWidth={3} />}
                                    </div>
                                </div>
                            );
                        })}
                    </div>

                    {/* Timer + submit */}
                    <div style={{
                        marginTop: 18, paddingTop: 16,
                        borderTop: `1px dashed ${T.lineStrong}`,
                        display: 'flex', alignItems: 'center', justifyContent: 'space-between', gap: 12,
                    }}>
                        <div style={{ display: 'flex', alignItems: 'center', gap: 12 }}>
                            <div style={{ position: 'relative', width: 66, height: 66 }}>
                                <svg width="66" height="66" viewBox="0 0 100 100">
                                    <circle cx="50" cy="50" r="42" fill="none" stroke="rgba(255,255,255,.08)" strokeWidth="8" />
                                    <circle cx="50" cy="50" r="42" fill="none" stroke={timerColor} strokeWidth="8"
                                        strokeLinecap="round"
                                        strokeDasharray={`${timerDash} ${timerCirc}`}
                                        transform="rotate(-90 50 50)"
                                        style={{ transition: 'stroke-dasharray .9s linear, stroke .3s' }} />
                                </svg>
                                <div style={{
                                    position: 'absolute', inset: 0,
                                    display: 'flex', flexDirection: 'column',
                                    alignItems: 'center', justifyContent: 'center',
                                }}>
                                    <div style={{ fontSize: 20, fontWeight: 700, lineHeight: 1, color: timerColor }}>{timeLeft}</div>
                                    <div style={{ fontSize: 8.5, fontWeight: 600, letterSpacing: '.1em', color: T.textMute, textTransform: 'uppercase', marginTop: 2 }}>seconds</div>
                                </div>
                                {timeBonus !== null && (
                                    <div style={{
                                        position: 'absolute', top: -6, right: -18,
                                        fontSize: 14, fontWeight: 700, color: T.accent,
                                        animation: 'yc-fade-up .5s ease',
                                    }}>+{timeBonus}s</div>
                                )}
                            </div>
                            <div style={{ fontSize: 12, color: T.textDim, lineHeight: 1.4 }}>
                                <div style={{ fontWeight: 600, color: T.text }}>Answer to bank</div>
                                <div style={{ fontSize: 15, fontWeight: 600, color: T.accent }}>₦{PRIZE_STRUCTURE[qIdx].toLocaleString()}</div>
                            </div>
                        </div>
                        <button className="yc-btn" onClick={submit} disabled={selected === null || validating || showResult} style={{
                            display: 'inline-flex', alignItems: 'center', gap: 8,
                            padding: '12px 20px', borderRadius: 999, border: 'none',
                            background: (selected === null || validating || showResult) ? '#18271f' : T.gold,
                            color: (selected === null || validating || showResult) ? T.textMute : '#101a14',
                            fontSize: 13, fontWeight: 700, cursor: (selected === null || validating || showResult) ? 'not-allowed' : 'pointer',
                        }}>
                            Submit <ArrowRight size={15} strokeWidth={2.6} />
                        </button>
                    </div>
                </div>
            </div>
        </div>
    );
};

// ═══════════════════════════════════════════════════════════════════════════
//  TRIVIA RESULT (airtime claim / Flutterwave)
// ═══════════════════════════════════════════════════════════════════════════

const TriviaResultScreen = ({ score, onDone }) => {
    const [nin, setNin] = useState('');
    const [phone, setPhone] = useState('');
    const [detected, setDetected] = useState(null);
    const [manual, setManual] = useState(null);
    const [status, setStatus] = useState('idle');
    const [err, setErr] = useState('');
    const active = manual || detected;
    const phoneComplete = phone.length === 11;
    const topPrize = Math.max(...PRIZE_STRUCTURE);

    const send = async () => {
        if (status === 'loading' || status === 'success') return;
        if (!phoneComplete) { setErr('Please complete all 11 phone digits.'); return; }
        if (!active) { setErr('Please select your network above.'); return; }
        setErr(''); setStatus('loading');
        try {
            const res = await fetch(`${PROXY_BASE}/api/send-airtime`, {
                method: 'POST',
                headers: { 'Content-Type': 'application/json' },
                body: JSON.stringify({ playerName: 'Yayi Connect Player', phone, nin: nin || 'N/A', amountNGN: score }),
            });
            const data = await res.json();
            if (!res.ok || data.error) throw new Error(data.error || 'Airtime transfer failed.');
            setStatus('success');
        } catch (e) {
            console.error('Airtime error:', e);
            setErr(e.message || 'Something went wrong. Please try again.');
            setStatus('error');
        }
    };

    const tone = score === topPrize
        ? { title: 'Congratulations!', msg: `You banked the top prize. Ogun rises when citizens engage.`, color: T.accent }
        : score >= 50
        ? { title: 'Nicely done!',     msg: `You banked ₦${score.toLocaleString()}. Claim it as airtime below.`, color: T.gold }
        : { title: 'Good effort',      msg: `Come back tomorrow and try again — every quest earns points.`, color: '#e35d5b' };

    return (
        <div style={{
            width: '100%', flex: 1, minHeight: 0,
            display: 'flex', flexDirection: 'column',
            background: T.ground, color: T.text,
            animation: 'yc-fade .3s ease',
        }}>
            <div style={{
                flex: 'none', display: 'flex', alignItems: 'center', gap: 10,
                padding: '12px 14px', background: T.header,
                borderBottom: `1px solid ${T.line}`,
            }}>
                <button className="yc-btn" onClick={onDone} style={{
                    width: 36, height: 36, borderRadius: 8, border: 'none',
                    background: '#18271f', color: T.text,
                    display: 'flex', alignItems: 'center', justifyContent: 'center',
                }}>
                    <ArrowLeft size={16} strokeWidth={2.4} />
                </button>
                <div style={{ flex: 1 }}>
                    <div style={{ fontSize: 11, letterSpacing: '.16em', color: T.gold, fontWeight: 500 }}>TRIVIA COMPLETE</div>
                    <div style={{ marginTop: 2, fontSize: 13, fontWeight: 500 }}>Claim your airtime</div>
                </div>
            </div>

            <div className="yc-scroll" style={{ flex: 1, overflowY: 'auto', padding: '14px 14px 22px', display: 'flex', flexDirection: 'column', gap: 14 }}>
                {/* Result banner */}
                <div style={{
                    padding: '22px 18px', borderRadius: 14, textAlign: 'center',
                    background: `linear-gradient(140deg, ${T.heroA}, ${T.heroC})`,
                    border: `1px solid ${tone.color}55`,
                }}>
                    <div style={{
                        width: 62, height: 62, margin: '0 auto', borderRadius: '50%',
                        background: `${tone.color}22`, border: `1px solid ${tone.color}`,
                        display: 'flex', alignItems: 'center', justifyContent: 'center',
                    }}>
                        {score >= 50 ? <Trophy size={28} color={tone.color} strokeWidth={2.2} />
                            : <XIcon size={28} color={tone.color} strokeWidth={2.2} />}
                    </div>
                    <h3 style={{ margin: '14px 0 6px', fontSize: 20, fontWeight: 500 }}>{tone.title}</h3>
                    <p style={{ margin: '0 0 12px', fontSize: 12, lineHeight: 1.5, color: T.textDim }}>{tone.msg}</p>
                    <div style={{
                        display: 'inline-flex', flexDirection: 'column', alignItems: 'center',
                        padding: '10px 22px', borderRadius: 14,
                        background: 'rgba(255,255,255,.05)',
                        border: `1px solid ${tone.color}44`,
                    }}>
                        <span style={{ fontSize: 10, letterSpacing: '.16em', color: T.textMute, fontWeight: 500 }}>FINAL SCORE</span>
                        <span style={{ fontSize: 26, fontWeight: 600, color: tone.color, lineHeight: 1.1, marginTop: 3 }}>₦{score.toLocaleString()}</span>
                    </div>
                </div>

                {score > 0 && (
                    <div style={{
                        background: T.card, borderRadius: 14,
                        border: `1px solid ${T.line}`, padding: 16,
                    }}>
                        <div style={{ display: 'flex', alignItems: 'center', gap: 10, marginBottom: 14 }}>
                            <div style={{
                                width: 38, height: 38, borderRadius: 10,
                                background: 'rgba(31,168,92,.14)',
                                display: 'flex', alignItems: 'center', justifyContent: 'center',
                            }}>
                                <Phone size={18} color={T.accent} strokeWidth={2.2} />
                            </div>
                            <div>
                                <div style={{ fontSize: 14, fontWeight: 500, lineHeight: 1.2 }}>Claim your airtime</div>
                                <div style={{ marginTop: 3, fontSize: 11, color: T.textMute }}>Enter your phone, we'll dispatch it instantly.</div>
                            </div>
                        </div>

                        {status === 'success' ? (
                            <div style={{
                                padding: '22px 14px', borderRadius: 12, textAlign: 'center',
                                background: 'rgba(31,168,92,.10)',
                                border: `1px solid ${T.accent}55`,
                            }}>
                                <div style={{
                                    width: 52, height: 52, margin: '0 auto 10px',
                                    borderRadius: '50%', background: T.accent,
                                    display: 'flex', alignItems: 'center', justifyContent: 'center',
                                    color: '#04140c',
                                }}><Check size={26} strokeWidth={3} /></div>
                                <div style={{ fontSize: 16, fontWeight: 600, color: T.accent, marginBottom: 6 }}>Airtime sent</div>
                                <div style={{ fontSize: 12, lineHeight: 1.6, color: T.textDim }}>
                                    <span style={{ fontWeight: 700, color: T.text }}>₦{score.toLocaleString()}</span> dispatched to<br />
                                    <span style={{ fontWeight: 700, color: T.text, letterSpacing: '1px' }}>{phone}</span>
                                    {active && (
                                        <span style={{
                                            display: 'inline-flex', marginLeft: 8, padding: '3px 10px',
                                            borderRadius: 999, background: 'rgba(255,255,255,.06)',
                                            border: `1px solid ${T.lineStrong}`,
                                            fontSize: 11, color: T.text, fontWeight: 600,
                                        }}>{active.name}</span>
                                    )}
                                </div>
                                <div style={{ marginTop: 12, fontSize: 10.5, color: T.textMute }}>Powered by Flutterwave</div>
                            </div>
                        ) : (
                            <>
                                <div style={{ marginBottom: 14 }}>
                                    <label style={{ display: 'block', fontSize: 11.5, fontWeight: 600, letterSpacing: '.06em', color: T.textDim, marginBottom: 7 }}>
                                        NIN — National Identity Number (optional)
                                    </label>
                                    <input
                                        type="text" inputMode="numeric" maxLength={11}
                                        placeholder="11-digit NIN"
                                        value={nin}
                                        onChange={e => setNin(e.target.value.replace(/\D/g, '').slice(0, 11))}
                                        disabled={status === 'loading'}
                                        style={{
                                            width: '100%', boxSizing: 'border-box',
                                            padding: '12px 14px', borderRadius: 10,
                                            background: 'rgba(255,255,255,.04)',
                                            border: `1px solid ${nin.length === 11 ? T.accent : T.lineStrong}`,
                                            color: T.text, fontSize: 14, letterSpacing: '2px',
                                            outline: 'none', fontFamily: 'ui-monospace, monospace',
                                        }} />
                                    <div style={{ marginTop: 5, fontSize: 11, color: T.textMute }}>{nin.length}/11 digits</div>
                                </div>

                                <div style={{ marginBottom: 14 }}>
                                    <div style={{ display: 'flex', alignItems: 'center', justifyContent: 'space-between', marginBottom: 7 }}>
                                        <label style={{ fontSize: 11.5, fontWeight: 600, letterSpacing: '.06em', color: phoneComplete ? T.accent : T.textDim }}>
                                            Phone Number
                                        </label>
                                        {phoneComplete && (
                                            <span style={{ display: 'inline-flex', alignItems: 'center', gap: 4, fontSize: 11.5, color: T.accent, fontWeight: 600 }}>
                                                <Check size={12} strokeWidth={3} /> Complete
                                            </span>
                                        )}
                                    </div>
                                    <DigitInput
                                        length={11} prefixDigit="0"
                                        value={phone}
                                        onChange={(v) => {
                                            setPhone(v);
                                            if (v.length >= 4) {
                                                const auto = detectNigerianNetwork(v);
                                                if (auto) { setDetected(auto); setManual(null); }
                                                else setDetected(null);
                                            } else {
                                                setDetected(null);
                                            }
                                        }}
                                        onComplete={(full) => {
                                            const auto = detectNigerianNetwork(full);
                                            if (auto) { setDetected(auto); setManual(null); }
                                            else setDetected(null);
                                        }}
                                        disabled={status === 'loading'}
                                    />
                                    <div style={{ marginTop: 6, fontSize: 11, color: T.textMute }}>Starts with 0, then 10 more digits</div>
                                </div>

                                {phone.length >= 4 && (
                                    <div style={{
                                        marginBottom: 14, padding: '12px 14px', borderRadius: 12,
                                        background: 'rgba(255,255,255,.03)',
                                        border: `1px solid ${T.line}`,
                                    }}>
                                        <div style={{ display: 'flex', alignItems: 'center', gap: 8, marginBottom: 8 }}>
                                            <span style={{ fontSize: 11, letterSpacing: '.14em', color: T.textDim, fontWeight: 600, textTransform: 'uppercase' }}>Network</span>
                                            {active && !manual && <span style={{ fontSize: 10, color: T.textMute, fontStyle: 'italic' }}>auto-detected</span>}
                                            {manual && <span style={{ fontSize: 10, color: T.textMute, fontStyle: 'italic' }}>manually selected</span>}
                                        </div>
                                        <div style={{ display: 'flex', gap: 8, flexWrap: 'wrap' }}>
                                            {NETWORK_OPTIONS.map(net => {
                                                const on = active?.code === net.code;
                                                return (
                                                    <button key={net.code} className="yc-btn"
                                                        onClick={() => {
                                                            if (status === 'loading') return;
                                                            setManual(net);
                                                            if (status === 'error') { setStatus('idle'); setErr(''); }
                                                        }}
                                                        style={{
                                                            padding: '7px 14px', borderRadius: 999,
                                                            fontSize: 12, fontWeight: 600,
                                                            background: on ? 'rgba(31,168,92,.14)' : 'rgba(255,255,255,.04)',
                                                            border: on ? `1px solid ${T.accent}` : `1px solid ${T.line}`,
                                                            color: on ? T.accent : T.textDim,
                                                        }}>{net.name}</button>
                                                );
                                            })}
                                        </div>
                                        {!active && phone.length >= 4 && (
                                            <div style={{ marginTop: 8, fontSize: 11, color: '#e35d5b' }}>
                                                Could not auto-detect. Please pick your network above.
                                            </div>
                                        )}
                                    </div>
                                )}

                                {status === 'error' && err && (
                                    <div style={{
                                        marginBottom: 12, padding: '11px 14px', borderRadius: 10,
                                        background: 'rgba(227,93,91,.10)',
                                        border: '1px solid rgba(227,93,91,.4)',
                                        color: '#f5a4a2', fontSize: 12,
                                        display: 'flex', gap: 10, alignItems: 'flex-start',
                                    }}>
                                        <XIcon size={15} strokeWidth={2.5} style={{ flex: 'none', marginTop: 2 }} />
                                        <span>{err}</span>
                                    </div>
                                )}

                                {status === 'loading' ? (
                                    <div style={{
                                        display: 'flex', alignItems: 'center', justifyContent: 'center', gap: 12,
                                        padding: 14, borderRadius: 10,
                                        background: 'rgba(31,168,92,.10)',
                                        border: `1px solid ${T.accent}55`,
                                    }}>
                                        <div style={{
                                            width: 20, height: 20, borderRadius: '50%',
                                            border: `3px solid rgba(31,168,92,.3)`,
                                            borderTopColor: T.accent,
                                            animation: 'yc-spin .8s linear infinite',
                                        }} />
                                        <span style={{ color: T.accent, fontWeight: 600, fontSize: 12 }}>
                                            Sending ₦{score.toLocaleString()} to {active?.name || ''}…
                                        </span>
                                    </div>
                                ) : (
                                    <button className="yc-btn" onClick={send} disabled={!phoneComplete || !active} style={{
                                        width: '100%', padding: '14px 18px', borderRadius: 999, border: 'none',
                                        background: (phoneComplete && active) ? T.gold : '#18271f',
                                        color: (phoneComplete && active) ? '#101a14' : T.textMute,
                                        cursor: (phoneComplete && active) ? 'pointer' : 'not-allowed',
                                        fontSize: 13.5, fontWeight: 700,
                                        display: 'flex', alignItems: 'center', justifyContent: 'center', gap: 10,
                                    }}>
                                        Send ₦{score.toLocaleString()} airtime
                                        {active && <span style={{ opacity: .85 }}>· {active.name}</span>}
                                        <ArrowRight size={15} strokeWidth={2.6} />
                                    </button>
                                )}

                                {status === 'error' && (
                                    <button className="yc-btn" onClick={() => { setStatus('idle'); setErr(''); }} style={{
                                        width: '100%', marginTop: 10, padding: '10px 18px',
                                        borderRadius: 999, border: `1px solid ${T.lineStrong}`,
                                        background: 'transparent', color: T.textDim,
                                        fontSize: 12, fontWeight: 700,
                                    }}>Try again</button>
                                )}

                                <p style={{ margin: '14px 0 0', fontSize: 10.5, textAlign: 'center', color: T.textMute }}>
                                    Powered by Flutterwave · Airtime disbursed instantly
                                </p>
                            </>
                        )}
                    </div>
                )}

                <button className="yc-btn" onClick={onDone} style={{
                    minHeight: 46, borderRadius: 10, border: 'none',
                    background: '#18271f', color: T.text,
                    fontSize: 13, fontWeight: 600,
                }}>Back to Yayi Connect</button>
            </div>
        </div>
    );
};

// ═══════════════════════════════════════════════════════════════════════════
//  MAIN APP
// ═══════════════════════════════════════════════════════════════════════════

const App = () => {
    const [screen, setScreen] = useState('home');
    const [points, setPoints] = useState(1240);
    const [claimed, setClaimed] = useState({});
    const [toast, setToast] = useState(null);
    const toastTimer = useRef(null);

    const flash = (msg) => {
        clearTimeout(toastTimer.current);
        setToast(msg);
        toastTimer.current = setTimeout(() => setToast(null), 2600);
    };

    const openGeohunt = () => {
        window.open(GEOHUNT_URL, '_blank', 'noopener,noreferrer');
        flash('Opening Geohunt in a new tab');
    };

    const claim = (q) => {
        if (claimed[q.id]) return;
        if (q.action) { q.action(); return; }
        setClaimed(c => ({ ...c, [q.id]: true }));
        setPoints(p => p + q.pts);
        flash(`+${q.pts} points — ${q.label}`);
    };

    const go = (s) => setScreen(s);
    const join = () => flash('Welcome to the movement — ward agent will call you.');

    const onTriviaComplete = (score) => {
        if (score > 0 && !claimed.trivia) {
            setClaimed(c => ({ ...c, trivia: true }));
            setPoints(p => p + 30);
        }
        setScreen('trivia-result-' + score);
    };

    return (
        <PhoneShell>
            <GlobalStyles />

            {/* Full-screen (no shell) trivia screens */}
            {screen === 'trivia-play' && (
                <TriviaPlayScreen
                    onExit={() => setScreen('home')}
                    onComplete={onTriviaComplete}
                />
            )}
            {screen.startsWith('trivia-result-') && (
                <TriviaResultScreen
                    score={parseInt(screen.replace('trivia-result-', ''), 10)}
                    onDone={() => setScreen('home')}
                />
            )}

            {/* Yayi Connect shell */}
            {!screen.startsWith('trivia') && (
                <>
                    <AppHeader />
                    <div className="yc-hide-scroll" style={{ flex: 1, overflowY: 'auto', WebkitOverflowScrolling: 'touch' }}>
                        {screen === 'home'     && <HomeScreen     points={points} claimed={claimed} go={go} openGeohunt={openGeohunt} join={join} />}
                        {screen === 'quests'   && <QuestsScreen   points={points} claimed={claimed} claim={claim} go={go} openGeohunt={openGeohunt} />}
                        {screen === 'scan'     && <ScanScreen     openGeohunt={openGeohunt} />}
                        {screen === 'projects' && <ProjectsScreen flash={flash} />}
                        {screen === 'hub'      && <HubScreen      points={points} flash={flash} />}
                    </div>
                    <Toast msg={toast} />
                    <BottomNav screen={screen} go={go} />
                </>
            )}
        </PhoneShell>
    );
};

export default App;
