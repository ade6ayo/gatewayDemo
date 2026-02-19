import React, { useState, useEffect, useCallback, useRef } from 'react';
import xxvLogo from './assets/xxv.png';
import Image6ts from './assets/6ts.png';
import {
    Play,
    Trophy,
    Crown,
    CheckCircle,
    XCircle,
    Clock,
    Scissors,
    Users,
    Phone,
} from 'lucide-react';

const TRANSITION_VIDEO_PATH = '/answer-transition.mp4';

const LUXURY_THEME = {
    primary: 'linear-gradient(135deg, #1a1a1a 0%, #2d1810 50%, #1a1a1a 100%)',
    secondary: 'linear-gradient(45deg, #ffd700, #ffb347, #d4af37)',
    accent: '#d4af37',
    background: 'rgba(212, 175, 55, 0.15)',
    backgroundDark: 'rgba(0, 0, 0, 0.3)',
    text: '#ffffff',
    textGold: '#ffd700',
    border: 'rgba(212, 175, 55, 0.3)',
    shadow: '0 8px 32px rgba(212, 175, 55, 0.2)'
};

const globalMobileStyles = `
    .status-bar-safe {
        height: env(safe-area-inset-top, 20px);
        background: #000;
        width: 100%;
        position: sticky;
        top: 0;
        z-index: 10001;
    }
    @media (max-width: 768px) {
        .player-photo-container { width: 120px !important; height: 120px !important; }
        .header-icon { width: 30px !important; height: 30px !important; }
        .app-logo { height: 40px !important; }
    }
`;

// [ADDITION 1] Nigeria news headlines for 3D card stack widget
const NIGERIA_NEWS_HEADLINES = [
    "Ogun APC caucus endorses Tinubu, Abiodun & Adeola for 2027 governorship",
    "Senate Leader rallies Ogun West professionals for Tinubu & Adeola",
    "2027: Ogun West professionals adopt Tinubu, Senator Adeola at Abeokuta rally",
    "Senator Adeola, NIS host grassroots soccer clinic for Ogun youth",
    "Senate launches public hearing on 2026 budget — 'from budget to impact'",
    "Ogun 2027: Beyond power rotation to Adeola's economic vision",
    "Super Eagles make bold transfer moves ahead of AFCON 2026",
    "Naira strengthens against dollar in official FX market — CBN data",
    "NELFUND records 1.6M student loan applications, 983K beneficiaries so far",
    "FG launches Nigeria Industrial Policy 2025 to diversify beyond oil",
    "Troops neutralise kidnappers, rescue abducted woman in Plateau State",
    "2027: Cross River APC pledges 1.5M votes for President Tinubu",
];

// [ADDITION 1] 3D stacked card widget — mimics the card fan/deck UI from the design reference
const NewsCardWidget = React.memo(() => {
    const [activeIndex, setActiveIndex] = useState(0);
    const [expanded, setExpanded] = useState(false);
    const [animatingOut, setAnimatingOut] = useState(false);
    const VISIBLE = 4; // how many cards show in the stack

    // Auto-cycle the top card every 4.5s
    useEffect(() => {
        const t = setInterval(() => {
            setAnimatingOut(true);
            setTimeout(() => {
                setActiveIndex(prev => (prev + 1) % NIGERIA_NEWS_HEADLINES.length);
                setAnimatingOut(false);
            }, 480);
        }, 4500);
        return () => clearInterval(t);
    }, []);

    const toggleExpand = () => setExpanded(prev => !prev);

    // Cards to display: active + next VISIBLE-1 in queue
    const cardQueue = Array.from({ length: VISIBLE }, (_, i) =>
        (activeIndex + i) % NIGERIA_NEWS_HEADLINES.length
    );

    return (
        <div style={{ width: '100%', marginBottom: 16 }}>
            <style>{`
                @keyframes cardFlyOff {
                    0%   { transform: perspective(800px) rotateX(0deg) translateY(0) scale(1); opacity: 1; }
                    100% { transform: perspective(800px) rotateX(-25deg) translateY(-60px) scale(0.85); opacity: 0; }
                }
                @keyframes cardRiseUp {
                    0%   { transform: perspective(800px) rotateX(8deg) translateY(12px) scale(0.96); opacity: 0.7; }
                    100% { transform: perspective(800px) rotateX(0deg) translateY(0px) scale(1); opacity: 1; }
                }
                @keyframes stackExpand {
                    0%   { transform: perspective(800px) rotateX(0deg) translateY(0px); }
                    100% { transform: perspective(800px) rotateX(0deg) translateY(var(--expand-y)); }
                }
            `}</style>

            {/* Breaking badge row */}
            <div style={{ display: 'flex', alignItems: 'center', gap: 8, marginBottom: 8 }}>
                <div style={{
                    background: 'linear-gradient(45deg,#ffd700,#ffb347)', color: '#1a1a1a',
                    fontWeight: '900', fontSize: '0.6rem', padding: '3px 10px',
                    borderRadius: '20px', letterSpacing: '1.5px', textTransform: 'uppercase',
                }}>🇳🇬 Latest News</div>
                <div style={{ flex: 1, height: '1px', background: 'rgba(212,175,55,0.2)' }} />
                <button onClick={toggleExpand} style={{
                    background: 'none', border: `1px solid rgba(212,175,55,0.3)`, borderRadius: 20,
                    color: '#d4af37', fontSize: '0.7rem', padding: '2px 10px', cursor: 'pointer', fontWeight: 700
                }}>{expanded ? 'Collapse ▲' : 'Expand ▼'}</button>
            </div>

            {/* 3D Card Stack */}
            <div
                onClick={toggleExpand}
                style={{
                    position: 'relative',
                    width: '100%',
                    height: expanded ? `${VISIBLE * 72 + 8}px` : '88px',
                    cursor: 'pointer',
                    perspective: '800px',
                    transition: 'height 0.45s cubic-bezier(0.4,0,0.2,1)',
                    marginBottom: expanded ? '8px' : 0,
                }}
            >
                {[...cardQueue].reverse().map((headlineIdx, stackPos) => {
                    // stackPos 0 = furthest back, VISIBLE-1 = front card
                    const reversedPos = (VISIBLE - 1) - stackPos; // front=0, back=VISIBLE-1
                    const isFront = reversedPos === 0;
                    const depthFactor = reversedPos; // 0=front

                    const collapsedStyle = {
                        position: 'absolute',
                        left: 0,
                        right: 0,
                        top: `${depthFactor * 6}px`,
                        height: '72px',
                        borderRadius: '16px',
                        padding: '0 18px',
                        display: 'flex',
                        alignItems: 'center',
                        boxSizing: 'border-box',
                        background: isFront
                            ? 'linear-gradient(135deg, rgba(45,24,16,0.98) 0%, rgba(20,10,0,0.99) 100%)'
                            : `rgba(${10 + depthFactor * 12}, ${6 + depthFactor * 6}, 0, ${0.92 - depthFactor * 0.15})`,
                        border: isFront
                            ? '1.5px solid #d4af37'
                            : `1px solid rgba(212,175,55,${0.25 - depthFactor * 0.06})`,
                        boxShadow: isFront
                            ? '0 8px 32px rgba(212,175,55,0.18), 0 2px 8px rgba(0,0,0,0.5)'
                            : `0 ${4 + depthFactor * 4}px ${12 + depthFactor * 8}px rgba(0,0,0,0.4)`,
                        transform: isFront && animatingOut
                            ? undefined
                            : `perspective(800px) rotateX(${depthFactor * 3}deg) translateY(${depthFactor * 3}px) scale(${1 - depthFactor * 0.03})`,
                        animation: isFront && animatingOut ? 'cardFlyOff 0.48s ease-in forwards' :
                            isFront && !animatingOut ? 'cardRiseUp 0.48s ease-out' : 'none',
                        transition: 'transform 0.35s cubic-bezier(0.4,0,0.2,1), box-shadow 0.35s ease',
                        zIndex: VISIBLE - depthFactor,
                        transformOrigin: 'center bottom',
                    };

                    const expandedStyle = {
                        ...collapsedStyle,
                        position: 'absolute',
                        top: `${reversedPos * 76}px`,
                        transform: 'none',
                        animation: 'none',
                    };

                    return (
                        <div key={headlineIdx} style={expanded ? expandedStyle : collapsedStyle}>
                            {(isFront || expanded) && (
                                <div style={{ width: '100%' }}>
                                    {isFront && (
                                        <div style={{ fontSize: '0.6rem', color: '#ffd700', fontWeight: 700, letterSpacing: '1px', textTransform: 'uppercase', marginBottom: 4, opacity: 0.7 }}>
                                            {expanded ? `Card ${reversedPos + 1} of ${VISIBLE}` : 'TOP STORY'}
                                        </div>
                                    )}
                                    {expanded && !isFront && (
                                        <div style={{ fontSize: '0.6rem', color: 'rgba(212,175,55,0.6)', fontWeight: 700, letterSpacing: '1px', textTransform: 'uppercase', marginBottom: 4 }}>
                                            STORY {reversedPos + 1}
                                        </div>
                                    )}
                                    <div style={{
                                        color: isFront ? '#fff' : 'rgba(255,255,255,0.7)',
                                        fontSize: window.innerWidth <= 768 ? '0.78rem' : '0.85rem',
                                        fontWeight: isFront ? 600 : 400,
                                        lineHeight: 1.35,
                                        overflow: 'hidden',
                                        display: '-webkit-box',
                                        WebkitLineClamp: 2,
                                        WebkitBoxOrient: 'vertical',
                                    }}>
                                        {NIGERIA_NEWS_HEADLINES[headlineIdx]}
                                    </div>
                                </div>
                            )}
                            {!isFront && !expanded && (
                                // placeholder stripe for depth cards
                                <div style={{ width: '60%', height: '10px', borderRadius: 4, background: `rgba(212,175,55,${0.12 - depthFactor * 0.02})` }} />
                            )}
                        </div>
                    );
                })}
            </div>
        </div>
    );
});

const bannerStyles = {
    animatedBanner: {
        position: 'absolute',
        bottom: 0,
        left: 0,
        right: 0,
        height: '60px',
        background: 'linear-gradient(90deg, #1a1a1a 0%, #2d1810 50%, #1a1a1a 100%)',
        borderTop: `2px solid ${LUXURY_THEME.accent}`,
        display: 'flex',
        alignItems: 'center',
        overflow: 'hidden',
        zIndex: 9999,
        boxShadow: '0 -4px 20px rgba(212, 175, 55, 0.3)'
    },
    bannerContent: {
        animation: 'smoothScroll 35s linear infinite',
        whiteSpace: 'nowrap',
        paddingLeft: '20px'
    },
    bannerInner: {
        display: 'inline-flex',
        alignItems: 'center',
        gap: '60px',
        color: LUXURY_THEME.textGold,
        fontSize: '1.05rem',
        fontWeight: '700',
    }
};

const BannerKeyframes = React.memo(() => (
    <style>{`
        @keyframes smoothScroll {
            0% { transform: translateX(0); }
            100% { transform: translateX(-50%); }
        }
        ${globalMobileStyles}
    `}</style>
));

const AnimatedBanner = React.memo(() => {
    return (
        <>
            <BannerKeyframes />
            <div style={bannerStyles.animatedBanner}>
                <div style={bannerStyles.bannerContent}>
                    <div style={bannerStyles.bannerInner}>
                        <span>  Powered by Ogun Ma YaYi Strategic Group " YaYI 2027 </span>
                        <span>  Powered by Ogun Ma YaYi Strategic Group " YaYI 2027 </span>
                        <span>  Powered by Ogun Ma YaYi Strategic Group " YaYI 2027 </span>
                        <span>  Powered by Ogun Ma YaYi Strategic Group " YaYI 2027 </span>

                        <span>  Powered by Ogun Ma YaYi Strategic Group " YaYI 2027 </span>
                        <span>  Powered by Ogun Ma YaYi Strategic Group " YaYI 2027 </span>
                        <span>  Powered by Ogun Ma YaYi Strategic Group " YaYI 2027 </span>
                        <span>  Powered by Ogun Ma YaYi Strategic Group " YaYI 2027 </span>
                    </div>
                </div>
            </div>
        </>
    );
});

const BounceKeyframes = React.memo(() => (
    <style>{`
        @keyframes float {
            0% { transform: translateY(0px); }
            50% { transform: translateY(-10px); }
            100% { transform: translateY(0px); }
        }
        @keyframes slideInBonus {
            0% { transform: translateX(-100px); opacity: 0; }
            50% { opacity: 1; }
            100% { transform: translateX(0); opacity: 1; }
        }
        @keyframes fadeOut {
            0% { opacity: 1; }
            100% { opacity: 0; }
        }
        @keyframes blinkOption {
            0% { background-color: #1a1a1a; color: #fff; }
            50% { background-color: #ffd700; color: #000; box-shadow: 0 0 15px #ffffff; }
            100% { background-color: #1a1a1a; color: #fff; }
        }
        @keyframes typewriterEffect {
            from { width: 0; }
            to { width: 100%; }
        }
    `}</style>
));

const Confetti = () => {
    const confettiPieces = Array.from({ length: 150 }, (_, i) => ({
        id: i,
        left: `${Math.random() * 100}%`,
        animationDelay: `${Math.random() * 3}s`,
        backgroundColor: ['#FFD700', '#FF6B6B', '#4ECDC4', '#45B7D1', '#FFA07A', '#98D8C8'][Math.floor(Math.random() * 6)],
        width: `${Math.random() * 10 + 5}px`,
        height: `${Math.random() * 10 + 5}px`
    }));
    return (
        <>
            <style>{`
                @keyframes confetti-fall {
                    0% { transform: translateY(-100vh) rotate(0deg); opacity: 1; }
                    100% { transform: translateY(100vh) rotate(720deg); opacity: 0; }
                }
            `}</style>
            <div style={{ position: 'fixed', top: 0, left: 0, width: '100vw', height: '100vh', pointerEvents: 'none', zIndex: 9999, overflow: 'hidden' }}>
                {confettiPieces.map((piece) => (
                    <div key={piece.id} style={{
                        position: 'absolute', left: piece.left, top: '-20px',
                        width: piece.width, height: piece.height, backgroundColor: piece.backgroundColor,
                        animation: `confetti-fall ${3 + Math.random() * 2}s linear infinite`,
                        animationDelay: piece.animationDelay, borderRadius: '2px'
                    }} />
                ))}
            </div>
        </>
    );
};

const QUESTIONS_DATABASE = {
    nigerian: [
        { id: 1, question: "Ogun State is famously known as the 'Gateway State' because:", options: ['It has the largest airport in West Africa.', 'It is the primary land route connecting Lagos to the rest of Nigeria and West Africa.', 'It was the first state to be created in Nigeria.', 'It is the only state with a sea port in the Southwest.'], correct: 1, difficulty: 'easy', category: '.' },
        { id: 2, question: "Which iconic natural landmark in Abeokuta served as a fortress for the Egba people during the 19th-century wars?", options: ['Idanre Hills', 'Zuma Rock', 'Olumo Rock', 'Aso Rock'], correct: 2, difficulty: 'medium', category: '.' }
    ],
    worldwide: [
        { id: 3, question: "Senator Solomon Olamilekan Adeola (YAYI) currently serves as the Chairman of which influential Senate Committee?", options: ['Committee on Finance', 'Committee on Appropriations', 'Committee on Public Accounts', 'Committee on Works'], correct: 1, difficulty: 'easy', category: 'Science' },
        { id: 4, question: "Ogun State holds a unique educational record in Nigeria as the only state to:", options: ['Offer free education at all levels.', 'Have a university in every Local Government Area.', 'Operate two state-owned universities (OOU and TASUED).', 'Have the highest number of primary schools.'], correct: 2, difficulty: 'easy', category: '.' },
        { id: 5, question: "Senator Yayi represented which district for 8 years (2015–2023) before becoming the Senator for Ogun West?", options: ['Ogun Central', 'Lagos West', 'Oyo South', 'Lagos Island'], correct: 1, difficulty: 'easy', category: '.' },
        { id: 6, question: "The famous 'Ofada Rice' is named after a community located in which Ogun State Local Government Area (LGA)?", options: ['Abeokuta North', 'Ikenne', 'Obafemi Owode', 'Yewa South'], correct: 2, difficulty: 'medium', category: '.' },
        { id: 7, question: "In 2022, Senator Adeola was conferred with which National Honour for his service to the country?", options: ['Member of the Order of the Federal Republic (MFR)', 'Officer of the Order of the Niger (OON)', 'Commander of the Order of the Niger (CON)', 'Grand Commander of the Order of the Niger (GCON)'], correct: 2, difficulty: 'easy', category: 'Nigeria' },
        { id: 8, question: "Which planet in our solar system has the most moons?", options: ['Jupiter', 'Saturn', 'Uranus', 'Neptune'], correct: 1, difficulty: 'medium', category: 'Science' },
        { id: 9, question: "Which Nigerian author wrote the novel 'Things Fall Apart'?", options: ['Wole Soyinka', 'Chimamanda Ngozi Adichie', 'Chinua Achebe', 'Buchi Emecheta'], correct: 2, difficulty: 'easy', category: 'Literature' },
        { id: 10, question: "What year did Nigeria gain independence from Britain?", options: ['1957', '1960', '1963', '1966'], correct: 1, difficulty: 'medium', category: 'Nigeria' },
        { id: 11, question: "Which company developed the Android operating system?", options: ['Apple', 'Microsoft', 'Google', 'IBM'], correct: 2, difficulty: 'easy', category: 'Technology' },
        { id: 12, question: "Which African country has the largest population?", options: ['Ethiopia', 'Egypt', 'South Africa', 'Nigeria'], correct: 3, difficulty: 'easy', category: 'Geography' },
        { id: 13, question: "What is the name of the longest river in Nigeria?", options: ['River Benue', 'River Ogun', 'River Niger', 'River Osun'], correct: 2, difficulty: 'medium', category: 'Nigeria' },
        { id: 14, question: "Who is credited with inventing the World Wide Web?", options: ['Bill Gates', 'Steve Jobs', 'Tim Berners-Lee', 'Mark Zuckerberg'], correct: 2, difficulty: 'medium', category: 'Technology' },
        { id: 15, question: "Which Nigerian music genre blends traditional Yoruba music with jazz and funk?", options: ['Highlife', 'Afrobeats', 'Fuji', 'Afrobeat'], correct: 3, difficulty: 'hard', category: 'Nigeria' },
    ]
};

const GAME_CONFIG = {
    totalQuestions: 15,
    timePerQuestion: 30,
    prizeStructure: [50, 100, 150, 200, 250, 300, 350, 400, 450, 500, 600, 700, 800, 900, 1000],
    safetyNets: [2, 9, 14],
    currency: '₦'
};

const isPresenterMode = () => {
    try {
        const urlParams = new URLSearchParams(window.location.search);
        return urlParams.get('mode') === 'presenter';
    } catch (e) { return false; }
};

const broadcastGameState = (state) => {
    if (!isPresenterMode()) return;
    try {
        localStorage.setItem('quiziq-sync', JSON.stringify({ ...state, timestamp: Date.now() }));
    } catch (error) { console.error('Broadcast failed:', error); }
};

const QuizIQGame = () => {
    const [isAuthenticated, setIsAuthenticated] = useState(false);
    const [passwordInput, setPasswordInput] = useState('');
    const [showCorrectAnswers] = useState(isPresenterMode());
    const [gameState, setGameState] = useState('registration');
    const [selectedCategory, setSelectedCategory] = useState('');
    const [currentQuestions, setCurrentQuestions] = useState([]);
    const [currentQuestion, setCurrentQuestion] = useState(0);
    const [score, setScore] = useState(0);
    const [selectedAnswer, setSelectedAnswer] = useState(null);
    const [showResult, setShowResult] = useState(false);
    const [timeLeft, setTimeLeft] = useState(GAME_CONFIG.timePerQuestion);
    const [isTimerRunning, setIsTimerRunning] = useState(false);
    const [playerName, setPlayerName] = useState('');
    const [importedQuestions, setImportedQuestions] = useState({ sets: [] });
    const [slideshowImages, setSlideshowImages] = useState([]);
    const [showSafetyBanner, setShowSafetyBanner] = useState(false);
    const [currentSlide, setCurrentSlide] = useState(0);
    const [slideshowPlaying, setSlideshowPlaying] = useState(true);
    const [playedSetIds, setPlayedSetIds] = useState([]);
    const [showTimeBonus, setShowTimeBonus] = useState(false);
    const [timeBonusAmount, setTimeBonusAmount] = useState(0);
    const [audiencePoll, setAudiencePoll] = useState(null);
    const [showGuide, setShowGuide] = useState(false);
    const [nin, setNin] = useState('');
    const [phoneNumber, setPhoneNumber] = useState('');
    const [gameSettings, setGameSettings] = useState({ soundEnabled: true, timerEnabled: true, showCategories: true, currency: '₦', contactName: 'Your Name' });
    const [lifelinesUsed, setLifelinesUsed] = useState({ fiftyFifty: false, askAudience: false, phoneAFriend: false });
    const [isValidating, setIsValidating] = useState(false);
    const [eliminatedOptions, setEliminatedOptions] = useState([]);
    const [showTransition, setShowTransition] = useState(false);
    const transitionVideoRef = useRef(null);
    const [isMobile, setIsMobile] = useState(window.innerWidth <= 768);

    // [ADDITION 2] Paystack claim form state
    const [claimNIN,   setClaimNIN]   = useState('');
    const [claimPhone, setClaimPhone] = useState('');
    const [paystackLoading, setPaystackLoading] = useState(false);
    const [paystackSuccess, setPaystackSuccess] = useState(false);

    useEffect(() => {
        const handleResize = () => setIsMobile(window.innerWidth <= 768);
        window.addEventListener('resize', handleResize);
        return () => window.removeEventListener('resize', handleResize);
    }, []);

    useEffect(() => {
        const prev = document.body.style.overflow;
        document.body.style.overflow = 'auto';
        return () => { document.body.style.overflow = prev; };
    }, []);

    useEffect(() => {
        try {
            const cachedImages = localStorage.getItem('QUIZ_SLIDESHOW_DATA');
            if (cachedImages) setSlideshowImages(JSON.parse(cachedImages));
        } catch (e) { console.error("Failed to load slideshow images", e); }
    }, []);

    useEffect(() => {
        try {
            const stored = localStorage.getItem('slideshow-images');
            if (stored) setSlideshowImages(JSON.parse(stored));
        } catch (error) { console.log('No existing slideshow images'); }
    }, []);

    useEffect(() => {
        try {
            const stored = localStorage.getItem('imported-questions');
            if (stored) setImportedQuestions(JSON.parse(stored));
        } catch (error) { console.log('No existing imported questions'); }
    }, []);

    useEffect(() => {
        if (gameState !== 'slideshow' || !slideshowPlaying || slideshowImages.length === 0) return;
        const interval = setInterval(() => {
            setCurrentSlide(prev => (prev + 1) % slideshowImages.length);
        }, 5000);
        return () => clearInterval(interval);
    }, [gameState, slideshowPlaying, slideshowImages.length]);

    useEffect(() => {
        if (gameState === 'slideshow') { setCurrentSlide(0); setSlideshowPlaying(true); }
    }, [gameState]);

    useEffect(() => {
        if (isPresenterMode()) return;
        const handleStorageChange = (e) => {
            if (e.key === 'quiziq-sync' && e.newValue) {
                try {
                    const s = JSON.parse(e.newValue);
                    setGameState(s.gameState);
                    setCurrentQuestion(s.currentQuestion);
                    setSelectedAnswer(s.selectedAnswer);
                    setShowResult(s.showResult);
                    setTimeLeft(s.timeLeft);
                    setIsTimerRunning(s.isTimerRunning);
                    setScore(s.score);
                    setShowTransition(s.showTransition);
                    setEliminatedOptions(s.eliminatedOptions || []);
                    setLifelinesUsed(s.lifelinesUsed || { fiftyFifty: false, askAudience: false, phoneAFriend: false });
                    setPlayerName(s.playerName || '');
                    setSelectedCategory(s.selectedCategory || '');
                    if (s.currentQuestions) setCurrentQuestions(s.currentQuestions);
                    if (s.currentSlide !== undefined) setCurrentSlide(s.currentSlide);
                    if (s.slideshowPlaying !== undefined) setSlideshowPlaying(s.slideshowPlaying);
                    if (s.slideshowImages) setSlideshowImages(s.slideshowImages);
                    if (s.showTimeBonus !== undefined) setShowTimeBonus(s.showTimeBonus);
                    if (s.timeBonusAmount !== undefined) setTimeBonusAmount(s.timeBonusAmount);
                    if (s.audiencePoll !== undefined) setAudiencePoll(s.audiencePoll);
                    if (s.showGuide !== undefined) setShowGuide(s.showGuide);
                    if (s.isValidating !== undefined) setIsValidating(s.isValidating);
                } catch (error) { console.error('Sync parse error:', error); }
            }
        };
        window.addEventListener('storage', handleStorageChange);
        return () => window.removeEventListener('storage', handleStorageChange);
    }, []);

    useEffect(() => {
        if (!isPresenterMode()) return;
        broadcastGameState({ gameState, currentQuestion, selectedAnswer, showResult, timeLeft, isTimerRunning, score, showTransition, eliminatedOptions, lifelinesUsed, playerName, selectedCategory, currentQuestions, currentSlide, showSafetyBanner, slideshowPlaying, slideshowImages, showTimeBonus, timeBonusAmount, audiencePoll, showGuide, isValidating });
    }, [gameState, currentQuestion, selectedAnswer, showResult, timeLeft, isTimerRunning, score, showTransition, eliminatedOptions, lifelinesUsed, playerName, selectedCategory, currentQuestions, currentSlide, showSafetyBanner, slideshowPlaying, slideshowImages, showTimeBonus, timeBonusAmount, audiencePoll, showGuide, isValidating]);

    useEffect(() => {
        let interval;
        if (isPresenterMode() && isTimerRunning && timeLeft > 0 && gameSettings.timerEnabled && gameState === 'playing') {
            interval = setInterval(() => {
                setTimeLeft((prev) => {
                    if (prev <= 1) { setIsTimerRunning(false); handleTimeUp(); return 0; }
                    return prev - 1;
                });
            }, 1000);
        }
        return () => clearInterval(interval);
    }, [isTimerRunning, timeLeft, gameSettings.timerEnabled, gameState]);

    useEffect(() => {
        if (!isPresenterMode()) return;
        const handleKeyPress = (event) => {
            if (gameState === 'playing' && !showResult && !showTransition) {
                const key = event.key;
                const lowerKey = key.toLowerCase();
                const validIndices = [0, 1, 2, 3].filter(i => !eliminatedOptions.includes(i));
                if (['a', 'b', 'c', 'd'].includes(lowerKey)) {
                    handleAnswerSelect(lowerKey.charCodeAt(0) - 97);
                } else if (key === 'Enter') {
                    if (selectedAnswer !== null) triggerSubmitAnswer();
                } else if (key === 'ArrowDown' || key === 'ArrowRight') {
                    event.preventDefault();
                    const currentPos = validIndices.indexOf(selectedAnswer);
                    setSelectedAnswer(validIndices[selectedAnswer === null ? 0 : (currentPos + 1) % validIndices.length]);
                } else if (key === 'ArrowUp' || key === 'ArrowLeft') {
                    event.preventDefault();
                    const currentPos = validIndices.indexOf(selectedAnswer);
                    setSelectedAnswer(validIndices[selectedAnswer === null ? validIndices.length - 1 : (currentPos - 1 + validIndices.length) % validIndices.length]);
                }
            }
        };
        window.addEventListener('keydown', handleKeyPress);
        return () => window.removeEventListener('keydown', handleKeyPress);
    }, [gameState, showResult, selectedAnswer, showTransition, eliminatedOptions, lifelinesUsed]);

    const downloadExcelTemplate = () => {
        const csvContent = 'data:text/csv;charset=utf-8,' +
            'Question|Option A|Option B|Option C|Option D|Correct Answer (1-4)|Difficulty|Category\n' +
            'What is the capital of Nigeria?|Lagos|Abuja|Kano|Port Harcourt|2|easy|Geography\n' +
            'Which planet is closest to the Sun?|Venus|Mercury|Earth|Mars|2|easy|Science\n' +
            'Who said, "I came, I saw, I conquered"?|Napoleon|Julius Caesar|Alexander|Hannibal|2|medium|History\n';
        const encodedUri = encodeURI(csvContent);
        const link = document.createElement('a');
        link.setAttribute('href', encodedUri);
        link.setAttribute('download', 'QuizIQ_Questions_Template.csv');
        document.body.appendChild(link);
        link.click();
        document.body.removeChild(link);
    };

    const GameGuide = ({ onClose }) => (
        <>
            <style>{`
                @keyframes fadeIn { from { opacity: 0; } to { opacity: 1; } }
                .guide-scrollbar::-webkit-scrollbar { width: 8px; }
                .guide-scrollbar::-webkit-scrollbar-track { background: rgba(255,255,255,0.05); border-radius: 4px; }
                .guide-scrollbar::-webkit-scrollbar-thumb { background: rgba(255,255,255,0.3); border-radius: 4px; }
                .guide-scrollbar::-webkit-scrollbar-thumb:hover { background: rgba(255,255,255,0.5); }
            `}</style>
            <div onClick={onClose} style={{ position: 'fixed', top: 0, left: 0, right: 0, bottom: 0, background: 'rgba(0,0,0,0.5)', backdropFilter: 'blur(10px)', zIndex: 10000, display: 'flex', alignItems: 'center', justifyContent: 'center', padding: '20px', animation: 'fadeIn 0.3s ease-out' }}>
                <div style={{ background: LUXURY_THEME.background, border: `2px solid ${LUXURY_THEME.accent}`, borderRadius: '20px', maxWidth: '900px', width: '100%', maxHeight: '90vh', display: 'flex', flexDirection: 'column', boxShadow: '0 20px 60px rgba(0,0,0,0.5)' }}>
                    <div style={{ padding: '24px', borderBottom: `1px solid ${LUXURY_THEME.border}`, display: 'flex', justifyContent: 'space-between', alignItems: 'center' }}>
                        <h2 style={{ margin: 0, fontSize: '1.8rem', background: LUXURY_THEME.secondary, WebkitBackgroundClip: 'text', WebkitTextFillColor: 'transparent' }}>📖 Game Guide & Shortcuts</h2>
                        <button onClick={onClose} style={{ background: 'transparent', border: 'none', fontSize: '2rem', color: LUXURY_THEME.textGold, cursor: 'pointer', padding: '0 8px', lineHeight: 1 }}>×</button>
                    </div>
                    <div className="guide-scrollbar" style={{ flex: 1, overflowY: 'auto', padding: '24px', color: LUXURY_THEME.text }}>
                        <section style={{ marginBottom: '32px' }}>
                            <h3 style={{ color: LUXURY_THEME.textGold, marginBottom: '12px', fontSize: '1.3rem' }}>Game Modes</h3>
                            <div style={{ paddingLeft: '16px', lineHeight: 1.8 }}>
                                <p><strong>Presenter Mode:</strong> Control the game, see correct answers, use keyboard shortcuts</p>
                                <p style={{ color: '#888', fontSize: '0.9rem' }}>Access via: <code style={{ background: 'rgba(255,255,255,0.1)', padding: '2px 8px', borderRadius: '4px' }}>?mode=presenter</code></p>
                                <p style={{ marginTop: '12px' }}><strong>Audience Mode:</strong> View-only mode that syncs with presenter in real-time</p>
                                <p style={{ color: '#888', fontSize: '0.9rem' }}>Access via: <code style={{ background: 'rgba(255,255,255,0.1)', padding: '2px 8px', borderRadius: '4px' }}>?mode=audience</code></p>
                                <p style={{ marginTop: '12px', fontSize: '0.9rem', fontStyle: 'italic', color: '#888' }}>Note: On PC PROJECTIONS (Win + P) should ALWAYS be set to "EXTEND MODE".</p>
                                <p style={{ marginTop: '12px', fontSize: '0.9rem', fontStyle: 'italic', color: '#888' }}>Set Your Browser Zoom to 120/125 for best viewing experience.</p>
                                <p style={{ marginTop: '12px', fontSize: '0.9rem', fontStyle: 'italic', color: '#888' }}>Simply REFRESH the App if you urgently need to restart or go back to the homepage.</p>
                            </div>
                        </section>
                        <section style={{ marginBottom: '32px' }}>
                            <h3 style={{ color: LUXURY_THEME.textGold, marginBottom: '12px', fontSize: '1.3rem' }}>Lifelines</h3>
                            <div style={{ paddingLeft: '16px', lineHeight: 1.8 }}>
                                <p><strong>1. 50/50:</strong> Eliminates 2 wrong answers + adds <span style={{ color: '#00ff00' }}>10 seconds</span> to timer</p>
                                <p style={{ marginTop: '12px' }}><strong>2. Ask the Audience:</strong> Shows audience poll + adds <span style={{ color: '#00ff00' }}>10 seconds</span></p>
                                <p style={{ marginTop: '12px' }}><strong>3. Phone a Friend:</strong> Adds <span style={{ color: '#00ff00' }}>15 seconds</span> to timer</p>
                            </div>
                        </section>
                        <section style={{ marginBottom: '32px' }}>
                            <h3 style={{ color: LUXURY_THEME.textGold, marginBottom: '12px', fontSize: '1.3rem' }}>Keyboard Shortcuts</h3>
                            <div style={{ paddingLeft: '16px', lineHeight: 1.8 }}>
                                <div style={{ background: 'rgba(255,255,255,0.05)', padding: '12px', borderRadius: '8px', marginBottom: '12px' }}>
                                    <p style={{ margin: '4px 0' }}><kbd style={{ background: 'rgba(255,255,255,0.1)', padding: '4px 8px', borderRadius: '4px' }}>A B C D</kbd> Select option</p>
                                    <p style={{ margin: '4px 0' }}><kbd style={{ background: 'rgba(255,255,255,0.1)', padding: '4px 8px', borderRadius: '4px' }}>Enter</kbd> Submit answer</p>
                                    <p style={{ margin: '4px 0' }}><kbd style={{ background: 'rgba(255,255,255,0.1)', padding: '4px 8px', borderRadius: '4px' }}>Space</kbd> Pause/Resume timer</p>
                                    <p style={{ margin: '4px 0' }}><kbd style={{ background: 'rgba(255,255,255,0.1)', padding: '4px 8px', borderRadius: '4px' }}>Arrow keys</kbd> Navigate options</p>
                                </div>
                            </div>
                        </section>
                        <div style={{ marginTop: '40px', paddingTop: '20px', borderTop: `1px solid ${LUXURY_THEME.border}`, textAlign: 'center', color: '#888', fontSize: '0.9rem' }}>
                            <p><code>Powered by 6TechSolutions</code></p>
                            <p><code>Contact/WhatsApp: +234 909 725 3310</code></p>
                            <p><code>EMail: 6techsolutions@gmail.com</code></p>
                        </div>
                    </div>
                </div>
            </div>
        </>
    );

    const handleExcelImport = async (event) => {
        const files = Array.from(event.target.files);
        if (!files.length) return;
        const newSets = [];
        let totalQuestionsCount = 0;
        for (const file of files) {
            try {
                const text = await new Promise((resolve, reject) => {
                    const reader = new FileReader();
                    reader.onload = (e) => resolve(e.target.result);
                    reader.onerror = (e) => reject(e);
                    reader.readAsText(file);
                });
                const lines = text.split(/\r?\n/);
                const firstLine = lines[0].toLowerCase();
                const hasHeader = firstLine.includes('question') && (firstLine.includes('option') || firstLine.includes('correct'));
                const startIndex = hasHeader ? 1 : 0;
                const questions = [];
                for (let i = startIndex; i < lines.length; i++) {
                    const line = lines[i].trim();
                    if (!line) continue;
                    const cols = line.split('|').map(col => col.trim());
                    if (cols.length >= 8) {
                        questions.push({
                            id: Date.now() + Math.random() + i,
                            question: cols[0], options: [cols[1], cols[2], cols[3], cols[4]],
                            correct: Math.max(0, Math.min(3, parseInt(cols[5], 10) - 1)),
                            difficulty: (cols[6] || 'medium').toLowerCase(), category: (cols[7] || 'Imported')
                        });
                    }
                }
                if (questions.length > 0) {
                    newSets.push({ id: Date.now() + Math.random(), name: file.name.replace('.csv', '').replace('.txt', ''), questions, createdAt: new Date().toLocaleString() });
                    totalQuestionsCount += questions.length;
                }
            } catch (error) { console.error(`Error parsing file ${file.name}:`, error); }
        }
        if (newSets.length > 0) {
            const updatedSets = [...(importedQuestions.sets || []), ...newSets];
            setImportedQuestions({ sets: updatedSets });
            try {
                localStorage.setItem('imported-questions', JSON.stringify({ sets: updatedSets }));
                alert(`✅ Successfully imported ${newSets.length} file(s) with ${totalQuestionsCount} total questions!`);
            } catch (error) { alert(`Imported questions, but failed to save permanently.`); }
        } else { alert('⚠️ No valid questions found in the selected files.'); }
        event.target.value = '';
    };

    const handleImageUpload = async (event) => {
        const files = Array.from(event.target.files);
        if (!files.length) return;
        if (slideshowImages.length >= 10) { alert('Maximum 10 images allowed.'); event.target.value = ''; return; }
        const remainingSlots = 10 - slideshowImages.length;
        const filesToProcess = files.slice(0, remainingSlots);
        if (files.length > remainingSlots) alert(`Only ${remainingSlots} slots remaining.`);
        const imagePromises = filesToProcess.filter(file => file.type.startsWith('image/')).map(file => new Promise((resolve) => {
            const reader = new FileReader();
            reader.onload = (e) => resolve({ id: Date.now() + Math.random(), src: e.target.result, name: file.name });
            reader.readAsDataURL(file);
        }));
        try {
            const processedImages = await Promise.all(imagePromises);
            setSlideshowImages(prev => {
                const updatedList = [...prev, ...processedImages];
                localStorage.setItem('QUIZ_SLIDESHOW_DATA', JSON.stringify(updatedList));
                localStorage.setItem('slideshow-images', JSON.stringify(updatedList));
                return updatedList;
            });
            event.target.value = '';
        } catch (error) { alert('Failed to upload images. Please try again.'); }
    };

    const deleteImage = (imageId) => {
        const updatedImages = slideshowImages.filter(img => img.id !== imageId);
        setSlideshowImages(updatedImages);
        try { localStorage.setItem('slideshow-images', JSON.stringify(updatedImages)); } catch (error) { console.error('Failed to update storage:', error); }
    };

    const startSlideshow = () => {
        if (!isPresenterMode()) return;
        if (slideshowImages.length === 0) { alert('Please upload images first.'); return; }
        setGameState('slideshow');
    };

    const getDefaultQuestions = () => [...(QUESTIONS_DATABASE.nigerian || []), ...(QUESTIONS_DATABASE.worldwide || [])];

    const getQuestionsForCategory = (category) => {
        if (category === 'default') return getDefaultQuestions();
        if (category === 'custom') return (importedQuestions.sets || []).flatMap(set => set.questions);
        return [];
    };

    const getScoreAfterWrongAnswer = () => {
        const lastSafetyNet = GAME_CONFIG.safetyNets.filter((net) => net < currentQuestion).sort((a, b) => b - a)[0];
        return lastSafetyNet !== undefined ? GAME_CONFIG.prizeStructure[lastSafetyNet] : 0;
    };

    const handleAnswerSelect = (answerIndex) => {
        if (!isPresenterMode()) return;
        if (eliminatedOptions.includes(answerIndex)) return;
        setSelectedAnswer(answerIndex);
    };

    const handleFiftyFifty = () => {
        if (lifelinesUsed.fiftyFifty) return;
        const q = currentQuestions[currentQuestion];
        if (!q) return;
        const wrongs = [0, 1, 2, 3].filter((i) => i !== q.correct);
        setEliminatedOptions(wrongs.slice(0, 2));
        setLifelinesUsed((p) => ({ ...p, fiftyFifty: true }));
        setTimeLeft((prev) => prev + 10);
        setTimeBonusAmount(10); setShowTimeBonus(true);
        setTimeout(() => setShowTimeBonus(false), 2000);
    };

    const handleAskAudience = () => {
        if (lifelinesUsed.askAudience) return;
        setLifelinesUsed((p) => ({ ...p, askAudience: true }));
        setTimeLeft((prev) => prev + 10);
        setTimeBonusAmount(10); setShowTimeBonus(true);
        setTimeout(() => setShowTimeBonus(false), 2000);
        const q = currentQuestions[currentQuestion];
        if (!q) return;
        const correctAnswer = q.correct;
        const wrongOptions = [0, 1, 2, 3].filter(i => i !== correctAnswer);
        const secondHighest = wrongOptions[Math.floor(Math.random() * wrongOptions.length)];
        const remainingOptions = wrongOptions.filter(i => i !== secondHighest);
        const correctPercentage = 45 + Math.floor(Math.random() * 30);
        const secondPercentage = 15 + Math.floor(Math.random() * 20);
        const remaining = 100 - correctPercentage - secondPercentage;
        const thirdPercentage = Math.floor(remaining / 2) + Math.floor(Math.random() * (remaining / 2));
        setAudiencePoll({ [correctAnswer]: correctPercentage, [secondHighest]: secondPercentage, [remainingOptions[0]]: thirdPercentage, [remainingOptions[1]]: remaining - thirdPercentage });
    };

    const handlePhoneAFriend = () => {
        if (lifelinesUsed.phoneAFriend) return;
        setLifelinesUsed((p) => ({ ...p, phoneAFriend: true }));
        setTimeLeft((prev) => prev + 15);
        setTimeBonusAmount(15); setShowTimeBonus(true);
        setTimeout(() => setShowTimeBonus(false), 2000);
    };

    const handleTimeUp = () => {
        if (selectedAnswer !== null) { triggerSubmitAnswer(); return; }
        setIsTimerRunning(false);
        setShowResult(true);
        setTimeout(() => { onTransitionEnded(); }, 2000);
    };

    const triggerSubmitAnswer = () => {
        if (isValidating) return;
        if (gameState !== 'playing') return;
        setIsTimerRunning(false);
        setIsValidating(true);
        setTimeout(() => {
            setIsValidating(false);
            setShowResult(true);
            setTimeout(() => { onTransitionEnded(); }, 2000);
        }, 3000);
    };

    const onTransitionEnded = () => {
        setShowTransition(false);
        const q = currentQuestions[currentQuestion];
        const isCorrect = q && selectedAnswer === q.correct;
        if (isCorrect) {
            const newScore = GAME_CONFIG.prizeStructure[Math.min(currentQuestion, GAME_CONFIG.prizeStructure.length - 1)];
            setScore(newScore);
            if (currentQuestion < currentQuestions.length - 1) {
                const nextQuestionIdx = currentQuestion + 1;
                if (GAME_CONFIG.safetyNets.includes(nextQuestionIdx)) {
                    setShowSafetyBanner(true);
                    setTimeout(() => setShowSafetyBanner(false), 5000);
                }
                setCurrentQuestion(nextQuestionIdx);
                setSelectedAnswer(null);
                setShowResult(false);
                setTimeLeft(GAME_CONFIG.timePerQuestion);
                setIsTimerRunning(false); // keep paused while question animates in
                setEliminatedOptions([]);
                setAudiencePoll(null);
                // [ADDITION 3] auto-start timer 10s after question appears
                // (gives time for the typewriter animation to finish displaying options)
                setTimeout(() => {
                    setIsTimerRunning(true);
                }, 10000);
            } else {
                setGameState('result');
            }
        } else {
            setScore(getScoreAfterWrongAnswer());
            setGameState('result');
        }
    };

    const playNextUnplayedSet = () => {
        if (!isPresenterMode()) return;
        if (!playerName.trim()) { alert("Please enter a player name first!"); return; }
        const allSets = importedQuestions.sets || [];
        if (allSets.length === 0) { alert("No custom question sets found! Import some CSVs first."); return; }
        const unplayedSets = allSets.filter(set => !playedSetIds.includes(set.id));
        if (unplayedSets.length === 0) {
            if (window.confirm("You've played all available sets! \n\nClear history and start over?")) {
                setPlayedSetIds([]);
                setTimeout(() => playNextUnplayedSet(), 100);
            }
            return;
        }
        const randomSet = unplayedSets[Math.floor(Math.random() * unplayedSets.length)];
        setPlayedSetIds(prev => [...prev, randomSet.id]);
        setCurrentQuestions(randomSet.questions.slice(0, GAME_CONFIG.totalQuestions));
        setSelectedCategory(`custom: ${randomSet.name}`);
        setCurrentQuestion(0); setScore(0); setSelectedAnswer(null); setShowResult(false);
        setTimeLeft(GAME_CONFIG.timePerQuestion); setIsTimerRunning(false);
        setLifelinesUsed({ fiftyFifty: false, askAudience: false, phoneAFriend: false });
        setEliminatedOptions([]);
        setGameState('playing');
    };

    const resetGame = () => {
        if (!isPresenterMode()) return;
        setGameState('registration'); setCurrentQuestion(0); setScore(0); setSelectedAnswer(null);
        setShowResult(false); setTimeLeft(GAME_CONFIG.timePerQuestion); setIsTimerRunning(false);
        setLifelinesUsed({ fiftyFifty: false, askAudience: false, phoneAFriend: false });
        setEliminatedOptions([]); setPlayerName(''); setSelectedCategory(''); setCurrentQuestions([]);
    };

    const deleteQuestionSet = (setId) => {
        const updatedSets = importedQuestions.sets.filter(set => set.id !== setId);
        setImportedQuestions({ sets: updatedSets });
        try { localStorage.setItem('imported-questions', JSON.stringify({ sets: updatedSets })); } catch (error) { console.error('Failed to update storage:', error); }
    };

    const deleteAllImportedSets = () => {
        if (!importedQuestions.sets || importedQuestions.sets.length === 0) { alert("No imported question sets to delete."); return; }
        if (window.confirm("⚠️ ARE YOU SURE? \nThis will permanently delete ALL imported question sets.")) {
            setImportedQuestions({ sets: [] });
            try { localStorage.removeItem('imported-questions'); alert("All imported sets have been deleted."); } catch (error) { console.error('Failed to clear storage:', error); }
        }
    };

    const renameQuestionSet = (setId, newName) => {
        const updatedSets = importedQuestions.sets.map(set => set.id === setId ? { ...set, name: newName } : set);
        setImportedQuestions({ sets: updatedSets });
        try { localStorage.setItem('imported-questions', JSON.stringify({ sets: updatedSets })); } catch (error) { console.error('Failed to update storage:', error); }
    };

    const selectCategory = (category) => {
        if (!isPresenterMode()) return;
        setSelectedCategory(category);
        const questions = getQuestionsForCategory(category);
        const final = questions && questions.length > 0 ? questions : getDefaultQuestions();
        setCurrentQuestions(final.slice(0, GAME_CONFIG.totalQuestions));
        setGameState('menu');
    };

    const startGame = () => {
        if (!isPresenterMode()) return;
        if (!currentQuestions || currentQuestions.length === 0) { alert('No questions loaded.'); return; }
        setCurrentQuestion(0); setScore(0); setSelectedAnswer(null); setShowResult(false);
        setTimeLeft(GAME_CONFIG.timePerQuestion); setIsTimerRunning(false);
        setLifelinesUsed({ fiftyFifty: false, askAudience: false, phoneAFriend: false });
        setEliminatedOptions([]); setAudiencePoll(null);
        setGameState('playing');
        // auto-start timer after 10s so question + options finish animating in
        setTimeout(() => setIsTimerRunning(true), 10000);
    };

    // [ADDITION 2] Paystack inline payment handler
    const handlePaystackPayment = () => {
        if (!claimNIN || claimNIN.length < 11) { alert('Please enter a valid 11-digit NIN.'); return; }
        if (!claimPhone || claimPhone.length < 11) { alert('Please enter a valid 11-digit phone number.'); return; }
        setPaystackLoading(true);
        const openModal = () => {
            const handler = window.PaystackPop.setup({
                key: 'pk_live_REPLACE_WITH_YOUR_PAYSTACK_KEY',
                amount: score * 100,
                currency: 'NGN',
                ref: `QUIZIQ-${Date.now()}-${Math.random().toString(36).substr(2, 9)}`,
                metadata: {
                    custom_fields: [
                        { display_name: 'Player Name', variable_name: 'player_name', value: playerName },
                        { display_name: 'NIN',         variable_name: 'nin',         value: claimNIN   },
                        { display_name: 'Phone',       variable_name: 'phone',       value: claimPhone },
                    ]
                },
                callback: (response) => { setPaystackLoading(false); setPaystackSuccess(true); console.log('Paystack ref:', response.reference); },
                onClose: () => { setPaystackLoading(false); }
            });
            handler.openIframe();
        };
        if (!window.PaystackPop) {
            const script = document.createElement('script');
            script.src = 'https://js.paystack.co/v1/inline.js';
            script.onload = openModal;
            document.head.appendChild(script);
        } else { openModal(); }
    };

    const PrizeLadder = React.memo(({ currentQuestion, score, safetyNets, prizeStructure, currency }) => {
        const totalQuestions = prizeStructure.length;
        const reversedPrizes = [...prizeStructure].reverse();
        return (
            <div style={{ ...styles.card, padding: 0, height: isMobile ? '300px' : 'auto', display: 'flex', flexDirection: 'column', overflow: 'hidden' }}>
                <div style={{ margin: 0, padding: '7px 16px', backgroundColor: LUXURY_THEME.backgroundDark, color: LUXURY_THEME.textGold, textAlign: 'center', fontSize: '1.1rem', fontWeight: '700', borderBottom: `2px solid ${LUXURY_THEME.accent}` }}>
                    Prize Ladder
                </div>
                <div style={{ flex: 1, overflowY: 'auto', overflowX: 'hidden' }}>
                    <div style={{ padding: '0px 0' }}>
                        {reversedPrizes.map((prize, index) => {
                            const actualIndex = totalQuestions - index - 1;
                            const isSafetyNet = safetyNets.includes(actualIndex);
                            const isCurrentQuestion = actualIndex === currentQuestion;
                            const rowStyle = {
                                display: 'flex', justifyContent: 'space-between', alignItems: 'center',
                                padding: '2.3px 16px', fontSize: '0.95rem',
                                fontWeight: isSafetyNet || isCurrentQuestion ? '700' : '500',
                                background: isCurrentQuestion ? LUXURY_THEME.accent + '33' : isSafetyNet ? 'rgba(0,255,0,0.08)' : 'transparent',
                                color: isCurrentQuestion ? LUXURY_THEME.textGold : isSafetyNet ? '#9bffb0' : LUXURY_THEME.text,
                                borderLeft: isCurrentQuestion ? `4px solid ${LUXURY_THEME.textGold}` : isSafetyNet ? `4px solid #9bffb0` : '4px solid transparent',
                                borderRight: isCurrentQuestion ? `4px solid ${LUXURY_THEME.textGold}` : isSafetyNet ? `4px solid #9bffb0` : '4px solid transparent',
                                transition: 'all 0.3s ease', minHeight: '32px'
                            };
                            return (
                                <div key={actualIndex} style={rowStyle}>
                                    <span style={{ display: 'flex', alignItems: 'center', gap: 4 }}>
                                        <span style={{ minWidth: '32px' }}>Q{actualIndex + 1}</span>
                                        {isSafetyNet && <span></span>}
                                    </span>
                                    <span style={{ fontVariantNumeric: 'tabular-nums' }}>{currency}{prize.toLocaleString()}</span>
                                </div>
                            );
                        })}
                    </div>
                </div>
                <div style={{ padding: '7px 16px', backgroundColor: LUXURY_THEME.backgroundDark, borderTop: `1px solid ${LUXURY_THEME.border}`, textAlign: 'center', color: LUXURY_THEME.textGold, fontSize: '1rem', fontWeight: '700' }}>
                    Current Score: {currency}{score.toLocaleString()}
                </div>
            </div>
        );
    });

    const styles = {
        container: {
            width: '100vw',
            minHeight: '100vh',       // always fill screen but never clip
            height: 'auto',           // grow with content — no cutting off
            overflowX: 'hidden',
            overflowY: 'auto',        // always scrollable when content overflows
            background: LUXURY_THEME.primary,
            padding: isMobile ? '10px 10px 80px 10px' : '2vh 2vw 70px 2vw',
            boxSizing: 'border-box',
            fontFamily: "'Product Sans', 'Georgia', serif",
            position: 'relative',
            color: LUXURY_THEME.text,
            display: 'flex',
            flexDirection: 'column',
        },
        centerArea: { maxWidth: isMobile ? '100%' : '90vw', margin: '0 auto', width: '100%', display: 'flex', flexDirection: 'column', alignItems: 'stretch' },
        header: { display: 'flex', justifyContent: 'space-between', alignItems: isMobile ? 'flex-start' : 'center', flexDirection: isMobile ? 'column' : 'row', gap: 12, flexWrap: 'wrap' },
        lifelineBar: { display: 'flex', gap: 12, alignItems: 'center', justifyContent: 'center', marginTop: '1vh', flexWrap: 'wrap' },
        lifelineBtn: (used) => ({
            display: 'flex', alignItems: 'center', gap: 6, padding: isMobile ? '8px 10px' : '10px 12px',
            borderRadius: 10, cursor: used ? 'not-allowed' : 'pointer',
            background: used ? 'rgba(255,0,0,0.08)' : 'rgba(0,128,0,0.08)',
            border: `1px solid ${used ? 'rgba(255,0,0,0.35)' : 'rgba(0,128,0,0.35)'}`,
            color: used ? '#ff9999' : '#b7ffb7', minWidth: isMobile ? '30%' : 140,
            justifyContent: 'center', fontWeight: 700, fontSize: 'clamp(0.7rem, 1.5vw, 1rem)'
        }),
        mainFlex: { display: 'flex', gap: 22, alignItems: 'stretch', flex: 1, marginTop: '2vh', minHeight: 0, flexDirection: isMobile ? 'column' : 'row' },
        leftMain: { flex: 3, minHeight: 0, display: 'flex', flexDirection: 'column' },
        rightSide: { flex: 1, minWidth: isMobile ? '100%' : '20vw', minHeight: 0, marginTop: isMobile ? '20px' : '0' },
        card: { backgroundColor: LUXURY_THEME.background, backdropFilter: 'blur(12px)', borderRadius: 16, padding: isMobile ? '15px' : '2vh 2vw', marginBottom: '1vh', border: `2px solid ${LUXURY_THEME.border}`, boxShadow: LUXURY_THEME.shadow, overflow: 'auto' },
        questionText: { fontSize: isMobile ? '1.2rem' : 'clamp(1.2rem, 2.5vw, 1.5rem)', marginBottom: '1vh', lineHeight: 1.4 },
        optionBtn: (disabled, selected) => ({
            display: 'flex', alignItems: 'center', justifyContent: 'space-between',
            padding: isMobile ? '12px' : '1.5vh 2vw', borderRadius: 12, marginBottom: '1vh',
            cursor: disabled ? 'not-allowed' : 'pointer',
            background: selected ? 'rgba(212,175,55,0.12)' : 'rgba(0,0,0,0.35)',
            border: selected ? `2px solid ${LUXURY_THEME.textGold}` : `1px solid rgba(255,255,255,0.06)`,
            opacity: disabled ? 0.5 : 1, fontSize: isMobile ? '0.95rem' : 'clamp(0.9rem, 1.8vw, 1.1rem)'
        }),
        timerBar: { height: '1.2vh', borderRadius: 8, background: 'rgba(255,255,255,0.06)', overflow: 'hidden' },
        timerFill: (pct) => ({ width: `${pct}%`, height: '100%', background: 'linear-gradient(90deg,#ffd700,#ffb347)', transition: 'width 0.9s linear' }),
    };

    // ─── RENDER: Registration ───────────────────────────────────────────────────
    if (gameState === 'registration') {
        return (
            <div style={styles.container}>
                <div style={{ height: 'env(safe-area-inset-top)', backgroundColor: '#000', width: '100%' }} />
                <div style={styles.centerArea}>
                    <div style={styles.header}>
                        <div><img src={xxvLogo} alt="XXV Logo" style={{ width: isMobile ? 90 : 150, height: isMobile ? 90 : 150, objectFit: 'contain' }} /></div>
                        <img src={Image6ts} alt="6tsTNC" style={{ width: isMobile ? 90 : 150, height: isMobile ? 90 : 150, objectFit: 'contain' }} />
                    </div>
                    <div style={{ ...styles.card, maxWidth: 600, marginTop: isMobile ? '16px' : '32px', marginLeft: 'auto', marginRight: 'auto', width: '100%' }}>
                        <h3 style={{ color: LUXURY_THEME.textGold }}>Enter Player Name</h3>
                        <input autoFocus type="text" placeholder="Player name..." value={playerName}
                               onChange={(e) => setPlayerName(e.target.value)}
                               onKeyDown={(e) => e.key === 'Enter' && playerName.trim() && setGameState('category-selection')}
                               style={{ width: 'auto', padding: '20px 30px', borderRadius: 10, border: `1px solid ${LUXURY_THEME.border}`, backgroundColor: 'rgba(0,0,0,0.45)', color: LUXURY_THEME.text, fontSize: 16, marginTop: -2, marginBottom: 12 }}
                        />
                        <div style={{ display: 'flex', gap: 12 }}>
                            <button onClick={() => { if (!isPresenterMode()) return; if (playerName.trim()) setGameState('category-selection'); }} disabled={!playerName.trim()}
                                    style={{ flex: 1, padding: '12px 14px', borderRadius: 10, background: 'linear-gradient(90deg,#ffd700,#ffb347)', border: 'none', cursor: playerName.trim() ? 'pointer' : 'not-allowed', fontWeight: 700 }}>
                                Start Game
                            </button>
                            <button onClick={() => { if (!isPresenterMode()) return; setPlayerName('Guest'); setGameState('category-selection'); }}
                                    style={{ padding: '12px 14px', borderRadius: 10, background: 'rgba(255,255,255,0.03)', border: `1px solid ${LUXURY_THEME.border}` }}>
                                Guest
                            </button>
                        </div>
                    </div>
                </div>
                {!isPresenterMode() && (
                    <div style={{ position: 'absolute', top: '20px', left: '50%', transform: 'translateX(-50%)', zIndex: 1000, pointerEvents: 'none', textAlign: 'center' }}>
                        <h2 style={{ fontSize: '3rem', color: '#d4af37', textTransform: 'uppercase', fontWeight: '900', letterSpacing: '15px', opacity: 0.25, margin: 0 }}>Audience</h2>
                    </div>
                )}
                <video src={TRANSITION_VIDEO_PATH} preload="auto" style={{ display: 'none' }} />
                <AnimatedBanner />
            </div>
        );
    }

    // ─── RENDER: Category Selection ─────────────────────────────────────────────
    // BUG FIX: The original file was missing the closing </div> for styles.centerArea,
    // which caused a JSX parse error at the start of the 'menu' block.
    if (gameState === 'category-selection') {
        return (
            <div style={styles.container}>
                <div style={{ height: 'env(safe-area-inset-top)', backgroundColor: '#000', width: '100%' }} />
                <div style={styles.centerArea}>
                    <div style={styles.header}>
                        <div>
                            <h1 style={{ margin: 0, fontSize: '2rem', background: LUXURY_THEME.secondary, WebkitBackgroundClip: 'text', WebkitTextFillColor: 'transparent' }}>Choose Category</h1>
                            <div style={{ color: 'rgba(255,255,255,0.9)' }}>Welcome {playerName}</div>
                        </div>
                        <div>
                            <button onClick={() => setGameState('registration')} style={{ padding: '8px 12px', borderRadius: 8 }}>Back</button>
                        </div>
                    </div>
                    {/* [ADDITION 1] Shuffling news card widget */}
                    <NewsCardWidget />
                    <div style={{ marginTop: 18 }}>
                        <div style={{ ...styles.card, cursor: 'pointer', display: 'flex', flexDirection: isMobile ? 'column' : 'row', alignItems: 'center', gap: 20, padding: isMobile ? '20px' : '24px 32px' }}
                             onClick={() => { selectCategory('default'); setTimeout(() => startGame(), 100); }}>
                            <div style={{ fontSize: 48, flexShrink: 0 }}>🌍</div>
                            <div style={{ flex: 1 }}>
                                <h3 style={{ color: LUXURY_THEME.textGold, marginTop: 0, marginBottom: 8, fontSize: '1.2rem' }}>Default + Custom Questions</h3>
                                <p style={{ color: 'rgba(255,255,255,0.75)', margin: 0, fontSize: '0.9rem' }}>Mixed Nigerian &amp; Global question set. CSV imports included.</p>
                                <div style={{ marginTop: 10, color: '#bcd', fontWeight: 600, fontSize: '0.85rem' }}>
                                    {getDefaultQuestions().length} default questions • {(importedQuestions.sets || []).length} custom sets loaded
                                </div>
                            </div>
                            <div style={{ padding: '10px 20px', borderRadius: 10, background: 'linear-gradient(90deg,#ffd700,#ffb347)', color: '#1a1a1a', fontWeight: 800, fontSize: '0.95rem', flexShrink: 0 }}>
                                Select →
                            </div>
                        </div>
                    </div>
                    {!isPresenterMode() && (
                        <div style={{ position: 'absolute', top: '20px', left: '50%', transform: 'translateX(-50%)', zIndex: 1000, pointerEvents: 'none', textAlign: 'center' }}>
                            <h2 style={{ fontSize: '3rem', color: '#d4af37', textTransform: 'uppercase', fontWeight: '900', letterSpacing: '15px', opacity: 0.25, margin: 0 }}>Audience</h2>
                        </div>
                    )}
                    {showGuide && <GameGuide onClose={() => setShowGuide(false)} />}
                </div>{/* ← closes styles.centerArea — this was the missing div! */}
                <AnimatedBanner />
            </div>
        );
    }

    // ─── RENDER: Menu ───────────────────────────────────────────────────────────
    if (gameState === 'menu') {
        return (
            <div style={styles.container}>
                <div style={{ height: 'env(safe-area-inset-top)', backgroundColor: '#000', width: '100%' }} />
                <div style={styles.centerArea}>
                    <div style={styles.header}>
                        <div>
                            <h1 style={{ margin: 0, fontSize: '2rem', background: LUXURY_THEME.secondary, WebkitBackgroundClip: 'text', WebkitTextFillColor: 'transparent' }}>Choose Question Set</h1>
                            <div style={{ color: 'rgba(255,255,255,0.9)' }}>Welcome {playerName}</div>
                        </div>
                        <div>
                            <button onClick={deleteAllImportedSets} style={{ padding: '8px 12px', borderRadius: 8, marginRight: 10 }}>Delete All Question Sets!</button>
                            <button onClick={() => setGameState('category-selection')} style={{ padding: '8px 12px', borderRadius: 8 }}>Back</button>
                        </div>
                    </div>
                    {/* [ADDITION 1] Shuffling news card widget */}
                    <NewsCardWidget />
                    <div style={{ ...styles.card, marginTop: 18 }}>
                        <h3 style={{ borderBottom: `1px solid ${LUXURY_THEME.border}`, paddingBottom: 10, color: LUXURY_THEME.textGold, marginBottom: 20 }}>Available Question Sets</h3>
                        <div style={{ display: 'grid', gridTemplateColumns: 'repeat(auto-fill, minmax(320px, 1fr))', gap: 20, maxHeight: '60vh', overflowY: 'auto', paddingRight: 10 }}>
                            <div style={{ ...styles.card, display: 'flex', flexDirection: 'column', border: `2px solid ${LUXURY_THEME.accent}`, minHeight: 280 }}>
                                <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center', marginBottom: 10 }}>
                                    <div style={{ fontWeight: 'bold', fontSize: '1.1rem', color: LUXURY_THEME.textGold }}>🌍 Default Set</div>
                                    <div style={{ fontSize: '0.8rem', background: 'rgba(212,175,55,0.2)', padding: '4px 10px', borderRadius: 6, color: LUXURY_THEME.textGold }}>Built-in</div>
                                </div>
                                <div style={{ fontSize: '0.75rem', color: '#888', marginBottom: 12 }}>{getDefaultQuestions().length} questions • Mixed Nigerian + Global</div>
                                <div style={{ flex: 1, fontSize: '0.85rem', color: '#aaa', marginBottom: 15, background: 'rgba(0,0,0,0.3)', padding: 12, borderRadius: 8, maxHeight: 140, overflowY: 'auto' }}>
                                    <div style={{ marginBottom: 8, fontStyle: 'italic', color: '#bbb' }}>Preview:</div>
                                    {getDefaultQuestions().slice(0, 3).map((q, i) => (
                                        <div key={i} style={{ marginBottom: 6, paddingLeft: 8, borderLeft: '2px solid rgba(255,255,255,0.2)' }}>
                                            • {q.question.length > 10 ? q.question.substring(0, 10) + '...' : q.question}
                                        </div>
                                    ))}
                                    {getDefaultQuestions().length > 3 && <div style={{ marginTop: 8, color: LUXURY_THEME.accent, fontSize: '0.8rem' }}>+ {getDefaultQuestions().length - 3} more questions</div>}
                                </div>
                                <button onClick={() => { selectCategory('default'); setTimeout(() => startGame(), 100); }}
                                        style={{ padding: '12px', borderRadius: 8, background: 'linear-gradient(90deg,#ffd700,#ffb347)', border: 'none', fontWeight: 'bold', cursor: 'pointer', color: '#1a1a1a', fontSize: '1rem', display: 'flex', alignItems: 'center', justifyContent: 'center', gap: 8 }}>
                                    <Play size={18} /> Play Default Set
                                </button>
                            </div>
                            {(importedQuestions.sets || []).map((set) => (
                                <div key={set.id} style={{ ...styles.card, display: 'flex', flexDirection: 'column', border: `2px solid ${LUXURY_THEME.accent}`, minHeight: 280 }}>
                                    <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center', marginBottom: 10 }}>
                                        <div style={{ fontWeight: 'bold', fontSize: '1.1rem', color: LUXURY_THEME.textGold }}>📚 {set.name}</div>
                                    </div>
                                    <div style={{ fontSize: '0.75rem', color: '#888', marginBottom: 12 }}>{set.questions.length} questions • Created: {set.createdAt}</div>
                                    <div style={{ flex: 1, fontSize: '0.85rem', color: '#aaa', marginBottom: 15, background: 'rgba(0,0,0,0.3)', padding: 12, borderRadius: 8, maxHeight: 140, overflowY: 'auto' }}>
                                        <div style={{ marginBottom: 8, fontStyle: 'italic', color: '#bbb' }}>Preview:</div>
                                        {set.questions.slice(0, 3).map((q, i) => (
                                            <div key={i} style={{ marginBottom: 6, paddingLeft: 8, borderLeft: '2px solid rgba(255,255,255,0.2)' }}>
                                                • {q.question.length > 10 ? q.question.substring(0, 10) + '...' : q.question}
                                            </div>
                                        ))}
                                        {set.questions.length > 3 && <div style={{ marginTop: 8, color: LUXURY_THEME.accent, fontSize: '0.8rem' }}>+ {set.questions.length - 3} more questions</div>}
                                    </div>
                                    <div style={{ display: 'flex', gap: 8 }}>
                                        <button onClick={() => { setCurrentQuestions(set.questions.slice(0, GAME_CONFIG.totalQuestions)); setSelectedCategory(`custom: ${set.name}`); setPlayedSetIds(prev => [...prev, set.id]); setTimeout(() => startGame(), 100); }}
                                                style={{ flex: 1, padding: '10px', borderRadius: 8, background: 'linear-gradient(90deg,#ffd700,#ffb347)', border: 'none', fontWeight: 'bold', cursor: 'pointer', color: '#1a1a1a', fontSize: '1rem', display: 'flex', alignItems: 'center', justifyContent: 'center', gap: 6 }}>
                                            <Play size={16} /> Play
                                        </button>
                                        <button title="Rename Set" onClick={(e) => { e.stopPropagation(); const n = prompt("Rename this set:", set.name); if (n && n.trim()) renameQuestionSet(set.id, n.trim()); }}
                                                style={{ padding: '10px 14px', borderRadius: 8, background: 'rgba(255,255,255,0.05)', border: '1px solid rgba(255,255,255,0.2)', cursor: 'pointer', fontSize: '1.1rem' }}>✏️</button>
                                        <button title="Delete Set" onClick={(e) => { e.stopPropagation(); if (window.confirm(`Delete "${set.name}"?`)) deleteQuestionSet(set.id); }}
                                                style={{ padding: '10px 14px', borderRadius: 8, background: 'rgba(255,0,0,0.1)', border: '1px solid rgba(255,0,0,0.3)', cursor: 'pointer', fontSize: '1.1rem' }}>🗑️</button>
                                    </div>
                                </div>
                            ))}
                            {(importedQuestions.sets || []).length === 0 && (
                                <div style={{ ...styles.card, display: 'flex', flexDirection: 'column', alignItems: 'center', justifyContent: 'center', minHeight: 280, border: '2px dashed rgba(255,255,255,0.2)' }}>
                                    <div style={{ fontSize: '3rem', marginBottom: 12 }}>📂</div>
                                    <div style={{ color: '#888', fontSize: '0.95rem', textAlign: 'center', marginBottom: 12 }}>No custom question sets yet</div>
                                    <label style={{ padding: '8px 16px', borderRadius: 8, background: 'rgba(255,255,255,0.05)', border: '1px solid rgba(255,255,255,0.2)', color: '#bbb', cursor: 'pointer', display: 'inline-block' }}>
                                        Upload CSV
                                        <input type="file" accept=".csv,.txt" multiple onChange={handleExcelImport} style={{ display: 'none' }} />
                                    </label>
                                </div>
                            )}
                        </div>
                    </div>
                </div>
                {!isPresenterMode() && (
                    <div style={{ position: 'absolute', top: '20px', left: '50%', transform: 'translateX(-50%)', zIndex: 1000, pointerEvents: 'none', textAlign: 'center' }}>
                        <h2 style={{ fontSize: '3rem', color: '#d4af37', textTransform: 'uppercase', fontWeight: '900', letterSpacing: '15px', opacity: 0.25, margin: 0 }}>Audience</h2>
                    </div>
                )}
                <AnimatedBanner />
            </div>
        );
    }

    // ─── RENDER: Playing ────────────────────────────────────────────────────────
    if (gameState === 'playing') {
        const q = currentQuestions[currentQuestion] || { question: 'Question not found', options: ['', '', '', ''], correct: 0 };
        const isUrgent = timeLeft <= 10;
        const clockStyle = {
            fontSize: isUrgent ? '5rem' : '3rem', fontWeight: '800',
            color: isUrgent ? '#ff4d4d' : LUXURY_THEME.textGold,
            textShadow: isUrgent ? '0 0 30px rgba(255,0,0,0.6)' : '0 2px 10px rgba(0,0,0,0.3)',
            transition: 'all 0.5s cubic-bezier(0.175, 0.885, 0.32, 1.275)', textAlign: 'center', lineHeight: 1
        };
        const potentialSecure = GAME_CONFIG.prizeStructure[currentQuestion];
        const dropAmount = getScoreAfterWrongAnswer();
        return (
            <div style={styles.container}>
                <BounceKeyframes />
                <div style={styles.centerArea}>
                    {showSafetyBanner && (
                        <div style={{ position: 'absolute', top: '50%', left: '50%', transform: 'translate(-50%, -50%)', zIndex: 9998, width: '80%', maxWidth: '1000px', height: '80%', maxHeight: '500px', background: 'rgba(0,0,0,0.85)', backdropFilter: 'blur(10px)', border: `2px solid ${LUXURY_THEME.textGold}`, borderRadius: '20px', padding: '40px', textAlign: 'center', boxShadow: '0 0 50px rgba(212,175,55,0.5)', display: 'flex', flexDirection: 'column', justifyContent: 'center', alignItems: 'center' }}>
                            <div style={{ fontSize: '4rem', marginBottom: '20px' }}>🔒</div>
                            <h2 style={{ color: LUXURY_THEME.textGold, textTransform: 'uppercase', fontSize: '2.5rem', margin: '0 0 20px 0', letterSpacing: '4px' }}>Safety Net Announcement</h2>
                            <div style={{ fontSize: '1.6rem', opacity: 0.9, lineHeight: 1.4 }}>
                                Right answer secures <strong>{GAME_CONFIG.currency}{potentialSecure.toLocaleString()}</strong>. (Wrong answer drops you to {GAME_CONFIG.currency}{dropAmount.toLocaleString()})
                            </div>
                        </div>
                    )}
                    <div style={styles.header}>
                        <div>
                            <h1 style={{ margin: 0, fontSize: '1.6rem', background: LUXURY_THEME.secondary, WebkitBackgroundClip: 'text', WebkitTextFillColor: 'transparent' }}>
                                Question {currentQuestion + 1} / {currentQuestions.length}
                            </h1>
                            <div style={{ color: 'rgba(255,255,255,0.9)' }}>{playerName} • Score: {GAME_CONFIG.currency}{score}</div>
                        </div>
                        <div style={{ display: 'flex', justifyContent: 'center', margin: '20px 0' }}>
                            <div style={styles.lifelineBar}>
                                <div title="50/50" onClick={() => isPresenterMode() && handleFiftyFifty()} style={{ ...styles.lifelineBtn(lifelinesUsed.fiftyFifty), cursor: !isPresenterMode() || lifelinesUsed.fiftyFifty ? 'not-allowed' : 'pointer' }}>
                                    <Scissors size={18} /> <span>50/50</span>
                                </div>
                                <div title="Ask Audience" onClick={() => isPresenterMode() && handleAskAudience()} style={{ ...styles.lifelineBtn(lifelinesUsed.askAudience), cursor: !isPresenterMode() || lifelinesUsed.askAudience ? 'not-allowed' : 'pointer' }}>
                                    <Users size={18} /> <span>Ask Audience</span>
                                </div>
                                <div title="Phone a Friend" onClick={() => isPresenterMode() && handlePhoneAFriend()} style={{ ...styles.lifelineBtn(lifelinesUsed.phoneAFriend), cursor: !isPresenterMode() || lifelinesUsed.phoneAFriend ? 'not-allowed' : 'pointer' }}>
                                    <Phone size={18} /> <span>Phone a Friend</span>
                                </div>
                            </div>
                        </div>
                    </div>
                    <div style={styles.mainFlex}>
                        <div style={styles.leftMain}>
                            <div style={styles.card}>
                                <div style={styles.questionText}>{q.question}</div>
                                <div style={{ color: 'rgba(255,255,255,0.75)', marginBottom: 12 }}>{q.category || 'General'} • {q.difficulty}</div>
                                <div>
                                    {(q.options || []).map((opt, idx) => {
                                        const isElim = eliminatedOptions.includes(idx);
                                        const isSelected = selectedAnswer === idx;
                                        const isCorrect = idx === q.correct;
                                        const hasAudiencePoll = audiencePoll !== null;
                                        const pollPercentage = hasAudiencePoll ? audiencePoll[idx] : 0;
                                        const isTopOption = hasAudiencePoll && pollPercentage >= 15;
                                        const pollColor = isTopOption ? 'rgba(0,255,0,0.15)' : 'rgba(255,255,255,0.08)';
                                        let backgroundStyle = isSelected ? `${LUXURY_THEME.border}` : 'rgba(0,0,0,0.3)';
                                        let borderStyle = isSelected ? `2px solid ${LUXURY_THEME.textGold}` : 'rgba(0,0,0,0.45)';
                                        let animStyle = 'none';
                                        if (isValidating && isSelected) { animStyle = 'blinkOption 1s linear infinite'; borderStyle = '2px solid #fff'; }
                                        if (showResult) {
                                            if (isCorrect) { backgroundStyle = 'linear-gradient(90deg, #004d00, #006400)'; borderStyle = '2px solid #00ff00'; }
                                            else if (isSelected && !isCorrect) { backgroundStyle = 'linear-gradient(90deg, #8b0000, #a00000)'; borderStyle = '2px solid #ff0000'; }
                                            else { backgroundStyle = 'rgba(0,0,0,0.3)'; borderStyle = '1px solid rgba(255,255,255,0.05)'; }
                                        }
                                        return (
                                            <div key={`question-${currentQuestion}-option-${idx}`}
                                                 onClick={() => { if (isElim || showResult || showTransition || isValidating) return; setSelectedAnswer(idx); }}
                                                 style={{ ...styles.optionBtn(isElim, isSelected), position: 'relative', overflow: 'hidden', background: backgroundStyle, border: borderStyle, animation: animStyle, animationFillMode: 'both', transition: 'background 0.3s', transform: 'none', margin: '0 0 1vh 0' }}>
                                                {hasAudiencePoll && (
                                                    <div style={{ position: 'absolute', right: 0, top: 0, bottom: 0, width: `${pollPercentage}%`, background: pollColor, transition: 'width 1.5s ease-out', zIndex: 0, borderRadius: '0 12px 12px 0' }} />
                                                )}
                                                <div style={{ display: 'flex', alignItems: 'center', gap: 12, position: 'relative', zIndex: 1 }}>
                                                    <div style={{ width: 36, height: 36, borderRadius: 8, display: 'flex', alignItems: 'center', justifyContent: 'center', background: 'rgba(255,255,255,0.03)', flexShrink: 0, color: (isValidating && isSelected) ? '#000' : 'inherit' }}>
                                                        {['A', 'B', 'C', 'D'][idx]}
                                                    </div>
                                                    <div style={{ overflow: 'hidden', whiteSpace: 'nowrap', width: (showResult || isValidating) ? '100%' : '0', animation: (showResult || isValidating) ? 'none' : 'typewriterEffect 1.5s steps(30) forwards', animationDelay: `${idx * 3}s`, animationFillMode: 'forwards', color: (isValidating && isSelected) ? '#000' : 'inherit' }}>
                                                        {opt}
                                                    </div>
                                                </div>
                                                <div style={{ display: 'flex', alignItems: 'center', gap: 8, position: 'relative', zIndex: 1 }}>
                                                    {hasAudiencePoll && (<span style={{ fontSize: '0.9rem', fontWeight: '700', color: isTopOption ? '#00ff00' : 'rgba(255,255,255,0.5)', minWidth: '45px', textAlign: 'right' }}>{pollPercentage}%</span>)}
                                                    {isCorrect && isPresenterMode() && <Crown size={18} color={LUXURY_THEME.textGold} />}
                                                </div>
                                            </div>
                                        );
                                    })}
                                </div>
                                <div style={{ marginTop: 20, padding: '20px 0', borderTop: '1px solid rgba(255,255,255,0.1)', display: 'flex', flexDirection: 'column', alignItems: 'center' }}>
                                    <div style={{ fontSize: '0.9rem', textTransform: 'uppercase', letterSpacing: '2px', color: '#888', marginBottom: 10 }}>Time Remaining</div>
                                    <div style={{ display: 'flex', alignItems: 'center', justifyContent: 'center', width: '100%', position: 'relative' }}>
                                        <div style={{ position: 'relative', display: 'inline-block' }}>
                                            <div style={clockStyle}>{timeLeft}</div>
                                            {showTimeBonus && (
                                                <div style={{ position: 'absolute', top: '15%', left: '-80px', fontSize: '2rem', fontWeight: '800', color: '#00ff00', textShadow: '0 0 20px rgba(0,255,0,0.8)', animation: 'slideInBonus 0.8s ease-out, fadeOut 0.5s ease-out 1.5s', zIndex: 10 }}>
                                                    +{timeBonusAmount}s
                                                </div>
                                            )}
                                        </div>
                                        {isPresenterMode() && (
                                            <button onClick={() => triggerSubmitAnswer()} disabled={selectedAnswer === null || showTransition}
                                                    style={{ position: 'absolute', right: 0, padding: '12px 18px', borderRadius: 10, background: selectedAnswer === null ? 'rgba(255,255,255,0.04)' : `${LUXURY_THEME.secondary}`, border: 'none', cursor: selectedAnswer === null ? 'not-allowed' : 'pointer', fontWeight: 700, color: selectedAnswer === null ? '#aaa' : '#000' }}>
                                                Submit Answer
                                            </button>
                                        )}
                                    </div>
                                    <div style={{ color: isUrgent ? '#ff4d4d' : 'rgba(255,255,255,0.6)', fontSize: '0.9rem', marginTop: 8 }}>
                                        {timeLeft === 0 ? "TIME'S UP!" : "SECONDS"}
                                    </div>
                                </div>
                            </div>
                        </div>
                        <div style={styles.rightSide}>
                            <PrizeLadder currentQuestion={currentQuestion} score={score} safetyNets={GAME_CONFIG.safetyNets} prizeStructure={GAME_CONFIG.prizeStructure} currency={GAME_CONFIG.currency} />
                            <div style={{ marginTop: 12 }}>
                                <NewsCardWidget />
                            </div>
                        </div>
                    </div>
                </div>
                <AnimatedBanner />
            </div>
        );
    }

    // ─── RENDER: Result ─────────────────────────────────────────────────────────
    if (gameState === 'result') {
        const isWinner = score === 1000;
        return (
            <div style={styles.container}>
                <BounceKeyframes />
                {isWinner && <Confetti />}
                <div style={styles.centerArea}>
                    <div style={{ display: 'flex', justifyContent: 'flex-end', alignItems: 'center', flexWrap: 'wrap', gap: 8, paddingBottom: 12 }}>
                        <button onClick={() => { if (!isPresenterMode()) return; setPlayerName(''); setGameState('play_next'); }} style={{ padding: '8px 14px', borderRadius: 8, background: 'rgba(255,255,255,0.08)', border: `1px solid ${LUXURY_THEME.border}`, color: '#fff', cursor: 'pointer', fontWeight: 600 }}>Play Next Game</button>
                        <button onClick={() => resetGame()} style={{ padding: '8px 14px', borderRadius: 8, background: 'rgba(255,255,255,0.08)', border: `1px solid ${LUXURY_THEME.border}`, color: '#fff', cursor: 'pointer', fontWeight: 600 }}>Restart Game</button>
                        <button onClick={() => startSlideshow()} style={{ padding: '8px 14px', borderRadius: 8, background: 'rgba(255,255,255,0.08)', border: `1px solid ${LUXURY_THEME.border}`, color: '#fff', cursor: 'pointer', fontWeight: 600 }}>Start Slideshow</button>
                    </div>
                    <div style={{ ...styles.card, marginTop: 8, display: 'flex', flexDirection: 'column', alignItems: 'center', textAlign: 'center', paddingTop: 32, paddingBottom: 32 }}>
                        <div style={{ fontSize: '6rem', marginBottom: 20, animation: 'float 3s ease-in-out infinite' }}>
                            {score === 1000 ? '🤑' : score >= 250 ? '😉' : '😔'}
                        </div>
                        <h3 style={{ color: LUXURY_THEME.textGold, fontSize: '2rem', margin: '10px 0' }}>
                            {score === 1000 ? 'Congratulations!' : score >= 250 ? 'Great Job!' : 'Game Over'}
                        </h3>
                        <p style={{ color: 'rgba(255,255,255,0.9)', fontSize: '1.2rem', maxWidth: 600, lineHeight: 1.5 }}>
                            {score === 1000 ? `Incredible job, ${playerName}! You've secured the top prize!` : score >= 2500 ? `Great work, ${playerName}! You're taking home ${GAME_CONFIG.currency}${score.toLocaleString()}` : `Good effort, ${playerName}. Try again next time.`}
                        </p>
                        <div style={{ marginTop: 20, padding: '15px 30px', border: `1px solid ${LUXURY_THEME.accent}`, borderRadius: 12 }}>
                            <span style={{ color: '#aaa' }}>Final Score:</span>
                            <div style={{ fontSize: '2rem', fontWeight: 'bold', color: LUXURY_THEME.textGold }}>{GAME_CONFIG.currency}{score.toLocaleString()}</div>
                        </div>

                        {/* [ADDITION 2] Paystack prize claim — only shown when score > 0 */}
                        {score > 0 && (
                            <div style={{ marginTop: 28, width: '100%', maxWidth: 480, background: 'rgba(212,175,55,0.07)', border: `1px solid ${LUXURY_THEME.border}`, borderRadius: 14, padding: '22px 24px', textAlign: 'left' }}>
                                <h3 style={{ color: LUXURY_THEME.textGold, margin: '0 0 6px 0', fontSize: '1.1rem' }}>🏦 Claim Your Prize</h3>
                                <p style={{ color: 'rgba(255,255,255,0.55)', fontSize: '0.82rem', margin: '0 0 16px 0' }}>
                                    Enter your details to receive your {GAME_CONFIG.currency}{score.toLocaleString()} via Paystack.
                                </p>
                                {paystackSuccess ? (
                                    <div style={{ textAlign: 'center', padding: '20px 0' }}>
                                        <div style={{ fontSize: '2.5rem', marginBottom: 8 }}>🎉</div>
                                        <div style={{ color: '#00ff00', fontWeight: 'bold', fontSize: '1.1rem' }}>Payment Successful!</div>
                                        <div style={{ color: 'rgba(255,255,255,0.6)', fontSize: '0.85rem', marginTop: 6 }}>{GAME_CONFIG.currency}{score.toLocaleString()} processed for {playerName}</div>
                                    </div>
                                ) : (
                                    <>
                                        <div style={{ marginBottom: 10 }}>
                                            <label style={{ color: 'rgba(255,255,255,0.6)', fontSize: '0.78rem', display: 'block', marginBottom: 4 }}>NIN (11 digits)</label>
                                            <input type="text" inputMode="numeric" maxLength={11} placeholder="12345678901" value={claimNIN}
                                                   onChange={e => setClaimNIN(e.target.value.replace(/\D/g, ''))}
                                                   style={{ width: '100%', padding: '10px 12px', borderRadius: 8, border: `1px solid ${LUXURY_THEME.border}`, backgroundColor: 'rgba(0,0,0,0.4)', color: '#fff', fontSize: '0.95rem', boxSizing: 'border-box' }} />
                                        </div>
                                        <div style={{ marginBottom: 10 }}>
                                            <label style={{ color: 'rgba(255,255,255,0.6)', fontSize: '0.78rem', display: 'block', marginBottom: 4 }}>Phone Number</label>
                                            <input type="tel" inputMode="numeric" maxLength={11} placeholder="08012345678" value={claimPhone}
                                                   onChange={e => setClaimPhone(e.target.value.replace(/\D/g, ''))}
                                                   style={{ width: '100%', padding: '10px 12px', borderRadius: 8, border: `1px solid ${LUXURY_THEME.border}`, backgroundColor: 'rgba(0,0,0,0.4)', color: '#fff', fontSize: '0.95rem', boxSizing: 'border-box' }} />
                                        </div>
                                        <button onClick={handlePaystackPayment} disabled={paystackLoading}
                                                style={{ width: '100%', padding: '13px', borderRadius: 10, background: paystackLoading ? 'rgba(255,255,255,0.1)' : 'linear-gradient(90deg,#ffd700,#ffb347)', border: 'none', cursor: paystackLoading ? 'wait' : 'pointer', fontWeight: '800', fontSize: '1rem', color: paystackLoading ? '#888' : '#1a1a1a', display: 'flex', alignItems: 'center', justifyContent: 'center', gap: 8 }}>
                                            {paystackLoading ? '⏳ Opening payment...' : `💳 Receive ${GAME_CONFIG.currency}${score.toLocaleString()}`}
                                        </button>
                                        <p style={{ color: 'rgba(255,255,255,0.3)', fontSize: '0.7rem', textAlign: 'center', margin: '10px 0 0 0' }}>Secured by Paystack · NGN payments</p>
                                    </>
                                )}
                            </div>
                        )}
                    </div>
                </div>
                <AnimatedBanner />
            </div>
        );
    }

    // ─── RENDER: Play Next ──────────────────────────────────────────────────────
    if (gameState === 'play_next') {
        return (
            <div style={styles.container}>
                <div style={styles.centerArea}>
                    <div style={styles.header}>
                        <div><img src={xxvLogo} alt="XXV Logo" style={{ width: isMobile ? 100 : 150, height: isMobile ? 100 : 150, objectFit: 'contain' }} /></div>
                        <img src={Image6ts} alt="6ts" style={{ width: isMobile ? 100 : 150, height: isMobile ? 100 : 150, objectFit: 'contain' }} />
                    </div>
                    <div style={{ ...styles.card, maxWidth: 1500, marginBottom: 'auto', marginTop: 120, marginLeft: 'auto', marginRight: 'auto' }}>
                        <h3 style={{ color: LUXURY_THEME.textGold }}>Enter Player Name</h3>
                        <input autoFocus type="text" placeholder="Player name..." value={playerName}
                               onChange={(e) => setPlayerName(e.target.value)}
                               onKeyDown={(e) => e.key === 'Enter' && playerName.trim() && playNextUnplayedSet()}
                               style={{ width: 'auto', padding: '20px 30px', borderRadius: 10, border: `1px solid ${LUXURY_THEME.border}`, backgroundColor: 'rgba(0,0,0,0.45)', color: LUXURY_THEME.text, fontSize: 16, marginTop: -2, marginBottom: 12 }}
                        />
                        <div style={{ display: 'flex', gap: 12 }}>
                            <button onClick={() => { if (!isPresenterMode()) return; setPlayerName(''); playNextUnplayedSet(); }} disabled={!playerName.trim()}
                                    style={{ flex: 1, padding: '12px 14px', borderRadius: 10, background: 'linear-gradient(90deg,#ffd700,#ffb347)', border: 'none', cursor: playerName.trim() ? 'pointer' : 'not-allowed', fontWeight: 700 }}>
                                Proceed to Next Game
                            </button>
                        </div>
                    </div>
                </div>
                <AnimatedBanner />
            </div>
        );
    }

    // ─── RENDER: Slideshow ──────────────────────────────────────────────────────
    if (gameState === 'slideshow') {
        return (
            <div style={{ ...styles.container, padding: 0, background: '#000' }}>
                <div style={{ position: 'relative', width: '100vw', height: '100vh', display: 'flex', alignItems: 'center', justifyContent: 'center' }}>
                    {isPresenterMode() && (
                        <button onClick={() => setGameState('registration')}
                                style={{ position: 'absolute', top: '30px', right: '30px', zIndex: 10000, padding: '14px 30px', background: 'rgba(255,255,255,0.1)', backdropFilter: 'blur(10px)', border: `1px solid ${LUXURY_THEME.accent}`, color: LUXURY_THEME.textGold, borderRadius: '30px', cursor: 'pointer', fontWeight: 'bold' }}>
                            ✕ Exit Slideshow
                        </button>
                    )}
                    {slideshowImages.length > 0 && (
                        <img src={slideshowImages[currentSlide].src} alt="Slideshow"
                             style={{ maxWidth: '100%', maxHeight: '100%', objectFit: 'contain', transition: 'opacity 0.5s ease-in-out' }} />
                    )}
                </div>
                <AnimatedBanner />
            </div>
        );
    }

    return null;
};

export default QuizIQGame;