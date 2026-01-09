import React, { useState, useEffect, useCallback, useRef } from 'react';
import xxvLogo from './assets/xxv.png';
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
    `}</style>
));

const AnimatedBanner = React.memo(() => {
    return (
        <>
            <BannerKeyframes />
            <div style={bannerStyles.animatedBanner}>
                <div style={bannerStyles.bannerContent}>
                    <div style={bannerStyles.bannerInner}>
                        <span>  We build intelligent automations, websites, and fully-custom applications for individuals or businesses ready to innovate and scale.  </span>
                        <span>  Powered by 6 Tech Solutions  </span>
                        <span>  Contact/WhatsApp: 0909 725 3310  </span>
                        <span>  Gadget Savers NG ✅ Save 30% on Smartphones, Laptops, Cameras & so much more ( 🇺🇸 USA pre-orders)</span>
                        <span> ✅ Pay 70% now, balance on delivery </span>
                        <span> ✅ Business bulk deals + financing </span>
                        <span> ✅ We Ship Anything 🇺🇸 USA → 🇳🇬 Ibadan </span>
                        <span>  "Tech You Love, Prices You Deserve." </span>
                        <span>  Contact/WhatsApp: 0909 725 3310  </span>


                        <span>  We build intelligent automations, websites, and fully-custom applications for individuals or businesses ready to innovate and scale.  </span>
                        <span>  Powered by 6 Tech Solutions  </span>
                        <span>  Contact/WhatsApp: 0909 725 3310  </span>
                        <span>  Gadget Savers NG ✅ Save 30% on Smartphones, Laptops, Cameras & so much more ( 🇺🇸 USA pre-orders)</span>
                        <span> ✅ Pay 70% now, balance on delivery </span>
                        <span> ✅ Business bulk deals + financing </span>
                        <span> ✅ We Ship Anything 🇺🇸 USA → 🇳🇬 Ibadan </span>
                        <span>  "Tech You Love, Prices You Deserve." </span>
                        <span>  Contact/WhatsApp: 0909 725 3310  </span>
                    </div>
                </div>
            </div>
        </>
    );
});

const BounceKeyframes = React.memo(() => (
    <style>{`
        @keyframes bounceIn {
            0% { transform: scale(0.3); opacity: 0; }
            50% { transform: scale(1.05); opacity: 1; }
            70% { transform: scale(0.9); }
            100% { transform: scale(1); }
        }
        @keyframes float {
            0% { transform: translateY(0px); }
            50% { transform: translateY(-10px); }
            100% { transform: translateY(0px); }
        }
    `}</style>
));

const QUESTIONS_DATABASE = {
    nigerian: [
        {
            id: 1,
            question: 'What is the capital of Nigeria?',
            options: ['Lagos', 'Abuja', 'Kano', 'Port Harcourt'],
            correct: 1,
            difficulty: 'easy',
            category: 'Geography'
        },
        {
            id: 2,
            question: "Who wrote 'Things Fall Apart'?",
            options: ['Wole Soyinka', 'Chinua Achebe', 'Ken Saro-Wiwa', 'Buchi Emecheta'],
            correct: 1,
            difficulty: 'medium',
            category: 'Literature'
        }
    ],
    worldwide: [
        {
            id: 3,
            question: 'Which planet is closest to the Sun?',
            options: ['Venus', 'Mercury', 'Earth', 'Mars'],
            correct: 1,
            difficulty: 'easy',
            category: 'Science'
        },
        {
            id: 4,
            question: "What does 'www' stand for?",
            options: ['World Wide Web', 'World Wide Wire', 'Web Wide World', 'Wide World Web'],
            correct: 0,
            difficulty: 'easy',
            category: 'Technology'
        },
        {
            id: 5,
            question: "Which Nigerian city is commonly referred to as the 'Centre of Excellence'?",
            options: ['Abuja', 'Ibadan', 'Lagos', 'Benin City'],
            correct: 2,
            difficulty: 'easy',
            category: 'Nigeria'
        },
        {
            id: 6,
            question: "Who was the first woman to win a Nobel Prize?",
            options: ['Marie Curie', 'Rosalind Franklin', 'Jane Goodall', 'Ada Lovelace'],
            correct: 0,
            difficulty: 'medium',
            category: 'History'
        },
        {
            id: 7,
            question: "What is the official currency of Nigeria?",
            options: ['Cedi', 'Naira', 'Shilling', 'Franc'],
            correct: 1,
            difficulty: 'easy',
            category: 'Nigeria'
        },
        {
            id: 8,
            question: "Which planet in our solar system has the most moons?",
            options: ['Jupiter', 'Saturn', 'Uranus', 'Neptune'],
            correct: 1,
            difficulty: 'medium',
            category: 'Science'
        },
        {
            id: 9,
            question: "Which Nigerian author wrote the novel 'Things Fall Apart'?",
            options: ['Wole Soyinka', 'Chimamanda Ngozi Adichie', 'Chinua Achebe', 'Buchi Emecheta'],
            correct: 2,
            difficulty: 'easy',
            category: 'Literature'
        },
        {
            id: 10,
            question: "What year did Nigeria gain independence from Britain?",
            options: ['1957', '1960', '1963', '1966'],
            correct: 1,
            difficulty: 'medium',
            category: 'Nigeria'
        },
        {
            id: 11,
            question: "Which company developed the Android operating system?",
            options: ['Apple', 'Microsoft', 'Google', 'IBM'],
            correct: 2,
            difficulty: 'easy',
            category: 'Technology'
        },
        {
            id: 12,
            question: "Which African country has the largest population?",
            options: ['Ethiopia', 'Egypt', 'South Africa', 'Nigeria'],
            correct: 3,
            difficulty: 'easy',
            category: 'Geography'
        },
        {
            id: 13,
            question: "What is the name of the longest river in Nigeria?",
            options: ['River Benue', 'River Ogun', 'River Niger', 'River Osun'],
            correct: 2,
            difficulty: 'medium',
            category: 'Nigeria'
        },
        {
            id: 14,
            question: "Who is credited with inventing the World Wide Web?",
            options: ['Bill Gates', 'Steve Jobs', 'Tim Berners-Lee', 'Mark Zuckerberg'],
            correct: 2,
            difficulty: 'medium',
            category: 'Technology'
        },
        {
            id: 15,
            question: "Which Nigerian music genre blends traditional Yoruba music with jazz and funk?",
            options: ['Highlife', 'Afrobeats', 'Fuji', 'Afrobeat'],
            correct: 3,
            difficulty: 'hard',
            category: 'Nigeria'
        },
    ]
};

const GAME_CONFIG = {
    totalQuestions: 15,
    timePerQuestion: 30,
    prizeStructure: [500, 1000, 1500, 2000, 2500, 3000, 3500, 4000, 4500, 5000, 6000, 7000, 8000, 9000, 10000],
    safetyNets: [4, 9, 14],
    currency: '₦'
};

// Helper to detect presenter mode via URL parameter
const isPresenterMode = () => {
    try {
        const urlParams = new URLSearchParams(window.location.search);
        return urlParams.get('mode') === 'presenter';
    } catch (e) {
        return false;
    }
};

// Cross-tab synchronization using localStorage
const broadcastGameState = (state) => {
    if (!isPresenterMode()) return; // Only presenter broadcasts
    try {
        localStorage.setItem('quiziq-sync', JSON.stringify({
            ...state,
            timestamp: Date.now()
        }));
    } catch (error) {
        console.error('Broadcast failed:', error);
    }
};

const QuizIQGame = () => {
    // presenter view
    const [isAuthenticated, setIsAuthenticated] = useState(false);
    const [passwordInput, setPasswordInput] = useState('');
    const ADMIN_PASSWORD = "h256t";
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

    const [gameSettings, setGameSettings] = useState({
        soundEnabled: true,
        timerEnabled: true,
        showCategories: true,
        currency: '₦',
        contactName: 'Your Name',
    });

    const [lifelinesUsed, setLifelinesUsed] = useState({
        fiftyFifty: false,
        askAudience: false,
        phoneAFriend: false
    });

    const [eliminatedOptions, setEliminatedOptions] = useState([]);

    // transition video overlay state
    const [showTransition, setShowTransition] = useState(false);
    const transitionVideoRef = useRef(null);

    // Prevent page scroll while component mounted (one-screen app)
    useEffect(() => {
        const prev = document.body.style.overflow;
        document.body.style.overflow = 'hidden';
        return () => {
            document.body.style.overflow = prev;
        };
    }, []);

    useEffect(() => {
        try {
            const cachedImages = localStorage.getItem('QUIZ_SLIDESHOW_DATA');
            if (cachedImages) {
                setSlideshowImages(JSON.parse(cachedImages));
            }
        } catch (e) {
            console.error("Failed to load slideshow images", e);
        }
    }, []);

    useEffect(() => {
        const loadSlideshowImages = () => {
            try {
                const stored = localStorage.getItem('slideshow-images');
                if (stored) {
                    setSlideshowImages(JSON.parse(stored));
                }
            } catch (error) {
                console.log('No existing slideshow images');
            }
        };
        loadSlideshowImages();
    }, []);

    useEffect(() => {
        const loadImportedQuestions = () => {
            try {
                const stored = localStorage.getItem('imported-questions');
                if (stored) {
                    setImportedQuestions(JSON.parse(stored));
                }
            } catch (error) {
                console.log('No existing imported questions');
            }
        };
        loadImportedQuestions();
    }, []);

    useEffect(() => {
        if (gameState !== 'slideshow' || !slideshowPlaying || slideshowImages.length === 0) return;

        const interval = setInterval(() => {
            setCurrentSlide(prev => (prev + 1) % slideshowImages.length);
        }, 5000); // 5 seconds per image

        return () => clearInterval(interval);
    }, [gameState, slideshowPlaying, slideshowImages.length]);


    useEffect(() => {
        if (gameState === 'slideshow') {
            setCurrentSlide(0);
            setSlideshowPlaying(true);
        }
    }, [gameState]);

    // Listen to presenter broadcasts (audience only)
    useEffect(() => {
        if (isPresenterMode()) return; 

        const handleStorageChange = (e) => {
            if (e.key === 'quiziq-sync' && e.newValue) {
                try {
                    const syncedState = JSON.parse(e.newValue);

                    // Update all state from presenter
                    setGameState(syncedState.gameState);
                    setCurrentQuestion(syncedState.currentQuestion);
                    setSelectedAnswer(syncedState.selectedAnswer);
                    setShowResult(syncedState.showResult);
                    setTimeLeft(syncedState.timeLeft);
                    setIsTimerRunning(syncedState.isTimerRunning);
                    setScore(syncedState.score);
                    setShowTransition(syncedState.showTransition);
                    setEliminatedOptions(syncedState.eliminatedOptions || []);
                    setLifelinesUsed(syncedState.lifelinesUsed || { fiftyFifty: false, askAudience: false, phoneAFriend: false });
                    setPlayerName(syncedState.playerName || '');
                    setSelectedCategory(syncedState.selectedCategory || '');

                    // Sync questions if available
                    if (syncedState.currentQuestions) {
                        setCurrentQuestions(syncedState.currentQuestions);
                    }

                    // Sync slideshow - ADD THESE LINES
                    if (syncedState.currentSlide !== undefined) {
                        setCurrentSlide(syncedState.currentSlide);
                    }
                    if (syncedState.slideshowPlaying !== undefined) {
                        setSlideshowPlaying(syncedState.slideshowPlaying);
                    }
                    if (syncedState.slideshowImages) {
                        setSlideshowImages(syncedState.slideshowImages);
                    }

                } catch (error) {
                    console.error('Sync parse error:', error);
                }
            }
        };

        window.addEventListener('storage', handleStorageChange);
        return () => window.removeEventListener('storage', handleStorageChange);
    }, []);

// Broadcast state changes (presenter only)
    useEffect(() => {
        if (!isPresenterMode()) return;

        broadcastGameState({
            gameState,
            currentQuestion,
            selectedAnswer,
            showResult,
            timeLeft,
            isTimerRunning,
            score,
            showTransition,
            eliminatedOptions,
            lifelinesUsed,
            playerName,
            selectedCategory,
            currentQuestions,
            currentSlide,
            showSafetyBanner,
            slideshowPlaying,
            slideshowImages
        });
    }, [gameState, currentQuestion, selectedAnswer, showResult, timeLeft, isTimerRunning, score, showTransition, eliminatedOptions, lifelinesUsed, playerName, selectedCategory, currentQuestions, currentSlide, showSafetyBanner, slideshowPlaying, slideshowImages]);
    useEffect(() => {
        let interval;
        // Only presenter controls the timer
        if (isPresenterMode() && isTimerRunning && timeLeft > 0 && gameSettings.timerEnabled && gameState === 'playing') {
            interval = setInterval(() => {
                setTimeLeft((prev) => {
                    if (prev <= 1) {
                        // time up
                        setIsTimerRunning(false);
                        handleTimeUp();
                        return 0;
                    }
                    return prev - 1;
                });
            }, 1000);
        }
        return () => clearInterval(interval);
    }, [isTimerRunning, timeLeft, gameSettings.timerEnabled, gameState]);


    // keyboard controls
    useEffect(() => {
        if (!isPresenterMode()) return;

        const handleKeyPress = (event) => {
            if (gameState === 'playing' && !showResult && !showTransition) {
                const key = event.key;
                const lowerKey = key.toLowerCase();

                // calculate valid indices (skipping those removed by 50/50)
                const validIndices = [0, 1, 2, 3].filter(i => !eliminatedOptions.includes(i));

                if (['a', 'b', 'c', 'd'].includes(lowerKey)) {
                    const idx = lowerKey.charCodeAt(0) - 97;
                    handleAnswerSelect(idx);
                }
                else if (key === 'Enter') {
                    if (selectedAnswer !== null) {
                        triggerSubmitAnswer();
                    }
                }
                else if (key === ' ') {
                    event.preventDefault();
                    setIsTimerRunning(prev => !prev);
                }
                else if (key === 'ArrowDown' || key === 'ArrowRight') {
                    event.preventDefault();
                    let nextIndex;
                    if (selectedAnswer === null) {
                        nextIndex = validIndices[0];
                    } else {
                        const currentPos = validIndices.indexOf(selectedAnswer);
                        const nextPos = (currentPos + 1) % validIndices.length;
                        nextIndex = validIndices[nextPos];
                    }
                    setSelectedAnswer(nextIndex);
                }
                else if (key === 'ArrowUp' || key === 'ArrowLeft') {
                    event.preventDefault();
                    let prevIndex;
                    if (selectedAnswer === null) {
                        prevIndex = validIndices[validIndices.length - 1];
                    } else {
                        const currentPos = validIndices.indexOf(selectedAnswer);
                        const prevPos = (currentPos - 1 + validIndices.length) % validIndices.length;
                        prevIndex = validIndices[prevPos];
                    }
                    setSelectedAnswer(prevIndex);
                }
            }
        };

        window.addEventListener('keydown', handleKeyPress);
        return () => window.removeEventListener('keydown', handleKeyPress);
    }, [gameState, showResult, selectedAnswer, showTransition, eliminatedOptions, lifelinesUsed]);


    // --- CSV template download & import
    const downloadExcelTemplate = () => {
        const csvContent =
            'data:text/csv;charset=utf-8,' +
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

    const handleExcelImport = async (event) => {
        const files = Array.from(event.target.files);
        if (!files.length) return;

        const newSets = [];
        let totalQuestionsCount = 0;

        // Process files sequentially
        for (const file of files) {
            try {
                // Read file content wrapped in a Promise
                const text = await new Promise((resolve, reject) => {
                    const reader = new FileReader();
                    reader.onload = (e) => resolve(e.target.result);
                    reader.onerror = (e) => reject(e);
                    reader.readAsText(file);
                });

                const lines = text.split(/\r?\n/);

                // Check header
                const firstLine = lines[0].toLowerCase();
                const hasHeader = firstLine.includes('question') && (firstLine.includes('option') || firstLine.includes('correct'));
                const startIndex = hasHeader ? 1 : 0;

                const questions = [];
                for (let i = startIndex; i < lines.length; i++) {
                    const line = lines[i].trim();
                    if (!line) continue;

                    const cols = line.split('|').map(col => col.trim());
                    // 8 columns required
                    if (cols.length >= 8) {
                        questions.push({
                            id: Date.now() + Math.random() + i, // Ensure unique ID
                            question: cols[0],
                            options: [cols[1], cols[2], cols[3], cols[4]],
                            correct: Math.max(0, Math.min(3, parseInt(cols[5], 10) - 1)),
                            difficulty: (cols[6] || 'medium').toLowerCase(),
                            category: (cols[7] || 'Imported')
                        });
                    }
                }

                if (questions.length > 0) {
                    newSets.push({
                        id: Date.now() + Math.random(), // Unique ID for the set
                        name: file.name.replace('.csv', '').replace('.txt', ''),
                        questions: questions,
                        createdAt: new Date().toLocaleString()
                    });
                    totalQuestionsCount += questions.length;
                }
            } catch (error) {
                console.error(`Error parsing file ${file.name}:`, error);
            }
        }

        if (newSets.length > 0) {
            const updatedSets = [...(importedQuestions.sets || []), ...newSets];
            setImportedQuestions({ sets: updatedSets });

            try {
                localStorage.setItem('imported-questions', JSON.stringify({ sets: updatedSets }));
                alert(`✅ Successfully imported ${newSets.length} file(s) with ${totalQuestionsCount} total questions!`);
            } catch (error) {
                console.error('Failed to save to storage:', error);
                alert(`Imported questions, but failed to save permanently.`);
            }
        } else {
            alert('⚠️ No valid questions found in the selected files.');
        }

        event.target.value = ''; // Reset input to allow re-uploading same files
    };


    const handleImageUpload = async (event) => {
        const files = Array.from(event.target.files);

        if (!files.length) return;

        if (slideshowImages.length >= 10) {
            alert('Maximum 10 images allowed. Please delete some images first.');
            event.target.value = '';
            return;
        }

        const remainingSlots = 10 - slideshowImages.length;
        const filesToProcess = files.slice(0, remainingSlots);

        if (files.length > remainingSlots) {
            alert(`Only ${remainingSlots} slots remaining. Uploading first ${remainingSlots} images.`);
        }

        const imagePromises = filesToProcess
            .filter(file => file.type.startsWith('image/'))
            .map(file => {
                return new Promise((resolve) => {
                    const reader = new FileReader();
                    reader.onload = (e) => {
                        resolve({
                            id: Date.now() + Math.random(),
                            src: e.target.result,
                            name: file.name
                        });
                    };
                    reader.readAsDataURL(file);
                });
            });

        try {
            const processedImages = await Promise.all(imagePromises);

            setSlideshowImages(prev => {
                const updatedList = [...prev, ...processedImages];

                // Save to localStorage
                localStorage.setItem('QUIZ_SLIDESHOW_DATA', JSON.stringify(updatedList));
                localStorage.setItem('slideshow-images', JSON.stringify(updatedList));

                return updatedList;
            });

            event.target.value = ''; // Reset input
        } catch (error) {
            console.error("Error processing images:", error);
            alert('Failed to upload images. Please try again.');
        }
    };

    const deleteImage = (imageId) => {
        const updatedImages = slideshowImages.filter(img => img.id !== imageId);
        setSlideshowImages(updatedImages);

        try {
            localStorage.setItem('slideshow-images', JSON.stringify(updatedImages));
        } catch (error) {
            console.error('Failed to update storage:', error);
        }
    };

    const startSlideshow = () => {
        if (!isPresenterMode()) return; // Only presenter can start
        if (slideshowImages.length === 0) {
            alert('Please upload images first before starting slideshow.');
            return;
        }
        setGameState('slideshow');
    };


    const getDefaultQuestions = () => {
        const combined = [...(QUESTIONS_DATABASE.nigerian || []), ...(QUESTIONS_DATABASE.worldwide || [])];
        return combined;
    };

    const getQuestionsForCategory = (category) => {
        if (category === 'default') {
            return getDefaultQuestions();
        }
        if (category === 'custom') {
            const allQuestions = (importedQuestions.sets || []).flatMap(set => set.questions);
            return allQuestions;
        }
        return [];
    };

    const getScoreAfterWrongAnswer = () => {
        const lastSafetyNet = GAME_CONFIG.safetyNets
            .filter((net) => net < currentQuestion)
            .sort((a, b) => b - a)[0]; // Get the highest safety net passed

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
        const correct = q.correct;
        const wrongs = [0, 1, 2, 3].filter((i) => i !== correct);
        const toEliminate = wrongs.slice(0, 2);
        setEliminatedOptions(toEliminate);
        setLifelinesUsed((p) => ({ ...p, fiftyFifty: true }));
    };

    // placeholders for other lifelines
    const handleAskAudience = () => {
        if (lifelinesUsed.askAudience) return;
        setLifelinesUsed((p) => ({ ...p, askAudience: true }));
        // add simulated percentages here
    };
    const handlePhoneAFriend = () => {
        if (lifelinesUsed.phoneAFriend) return;
        setLifelinesUsed((p) => ({ ...p, phoneAFriend: true }));
        //can add a suggestion popup here
    };


    const handleTimeUp = () => {

        if (selectedAnswer !== null) {
            triggerSubmitAnswer();
            return;
        }
        setShowResult(true);
        setShowTransition(true);


        setIsTimerRunning(false);
    };


    const triggerSubmitAnswer = () => {
        if (showTransition) return;
        if (gameState !== 'playing') return;

        setIsTimerRunning(false);
        setShowResult(true);
        setShowTransition(true);

    };


    const onTransitionEnded = () => {
        setShowTransition(false);
        const q = currentQuestions[currentQuestion];
        const isCorrect = q && selectedAnswer === q.correct;

        if (isCorrect) {
            const newScore = GAME_CONFIG.prizeStructure[Math.min(currentQuestion, GAME_CONFIG.prizeStructure.length - 1)];
            setScore(newScore);

            // move to next or finish
            if (currentQuestion < currentQuestions.length - 1) {
                const nextQuestionIdx = currentQuestion + 1; // Calculate next index

                // Check if next question is a safety net
                if (GAME_CONFIG.safetyNets.includes(nextQuestionIdx)) {
                    setShowSafetyBanner(true);
                    setTimeout(() => setShowSafetyBanner(false), 5000); // Hide after 5 seconds
                }

                setCurrentQuestion(nextQuestionIdx);
                setSelectedAnswer(null);
                setShowResult(false);
                setTimeLeft(GAME_CONFIG.timePerQuestion);
                setIsTimerRunning(false);
                setEliminatedOptions([]);
            } else {
                setGameState('result');
            }
        } else {
            // wrong answer or timeout
            setScore(getScoreAfterWrongAnswer());
            setGameState('result');
        }
    };

    const playNextUnplayedSet = () => {
        if (!isPresenterMode()) return;

        // 1. Get all available custom sets
        const allSets = importedQuestions.sets || [];
        if (allSets.length === 0) {
            alert("No custom question sets found! Import some CSVs first.");
            return;
        }

        // 2. Filter out sets we have already played
        const unplayedSets = allSets.filter(set => !playedSetIds.includes(set.id));

        // 3. Check availability
        if (unplayedSets.length === 0) {
            if (window.confirm("You've played all available sets! \n\nClear history and start over?")) {
                setPlayedSetIds([]); // Reset history
                // Recursively call to pick one from the fresh batch
                setTimeout(() => playNextUnplayedSet(), 100);
            }
            return;
        }

        // 4. Shuffle: Pick a random one from the remaining unplayed sets
        const randomSet = unplayedSets[Math.floor(Math.random() * unplayedSets.length)];

        // 5. Load it and Start
        setPlayedSetIds(prev => [...prev, randomSet.id]); // Mark as played
        setCurrentQuestions(randomSet.questions.slice(0, GAME_CONFIG.totalQuestions));
        setSelectedCategory(`custom: ${randomSet.name}`);
        setPlayerName(prev => prev); // Keep same player name

        // Reset Game State immediately
        setCurrentQuestion(0);
        setScore(0);
        setSelectedAnswer(null);
        setShowResult(false);
        setTimeLeft(GAME_CONFIG.timePerQuestion);
        setIsTimerRunning(false);
        setLifelinesUsed({ fiftyFifty: false, askAudience: false, phoneAFriend: false });
        setEliminatedOptions([]);
        setGameState('playing');
    };

    // reset & select category
    const resetGame = () => {
        if (!isPresenterMode()) return; // Only presenter can reset
        setGameState('registration');
        setCurrentQuestion(0);
        setScore(0);
        setSelectedAnswer(null);
        setShowResult(false);
        setTimeLeft(GAME_CONFIG.timePerQuestion);
        setIsTimerRunning(false);
        setLifelinesUsed({ fiftyFifty: false, askAudience: false, phoneAFriend: false });
        setEliminatedOptions([]);
        setPlayerName('');
        setSelectedCategory('');
        setCurrentQuestions([]);
    };
    const deleteQuestionSet = (setId) => {
        const updatedSets = importedQuestions.sets.filter(set => set.id !== setId);
        setImportedQuestions({ sets: updatedSets });


        try {
            localStorage.setItem('imported-questions', JSON.stringify({ sets: updatedSets }));
        } catch (error) {
            console.error('Failed to update storage:', error);
        }
    };
    const deleteAllImportedSets = () => {
        if (!importedQuestions.sets || importedQuestions.sets.length === 0) {
            alert("No imported question sets to delete.");
            return;
        }

        if (window.confirm("⚠️ ARE YOU SURE? \nThis will permanently delete ALL imported question sets. This action cannot be undone.")) {
            // Clear state
            setImportedQuestions({ sets: [] });

            // Clear local storage
            try {
                localStorage.removeItem('imported-questions');
                alert("All imported sets have been deleted.");
            } catch (error) {
                console.error('Failed to clear storage:', error);
            }
        }
    };
    const renameQuestionSet = (setId, newName) => {
        const updatedSets = importedQuestions.sets.map(set =>
                set.id === setId ? { ...set, name: newName } : set
        );
        setImportedQuestions({ sets: updatedSets });

        try {
            localStorage.setItem('imported-questions', JSON.stringify({ sets: updatedSets }));
        } catch (error) {
            console.error('Failed to update storage:', error);
        }
    };

    const selectCategory = (category) => {
        if (!isPresenterMode()) return; // Only presenter can select
        setSelectedCategory(category);
        const questions = getQuestionsForCategory(category);
        const final = questions && questions.length > 0 ? questions : getDefaultQuestions();
        setCurrentQuestions(final.slice(0, GAME_CONFIG.totalQuestions));
        setGameState('menu');
    };

    const startGame = () => {
        if (!isPresenterMode()) return; // Only presenter can start
        if (!currentQuestions || currentQuestions.length === 0) {
            alert('No questions loaded. Import CSV under Custom or choose Default.');
            return;
        }
        setCurrentQuestion(0);
        setScore(0);
        setSelectedAnswer(null);
        setShowResult(false);
        setTimeLeft(GAME_CONFIG.timePerQuestion);
        setIsTimerRunning(false);
        setLifelinesUsed({ fiftyFifty: false, askAudience: false, phoneAFriend: false });
        setEliminatedOptions([]);
        setGameState('playing');
    };

    const PrizeLadder = React.memo(({ currentQuestion, score, safetyNets, prizeStructure, currency }) => {
        const totalQuestions = prizeStructure.length;

        const reversedPrizes = [...prizeStructure].reverse();

        return (
            <div style={{
                ...styles.card,
                padding: 0,
                height: 'auto',
                display: 'flex',
                flexDirection: 'column',
                overflow: 'hidden'
            }}>
                {/* Header */}
                <div style={{
                    margin: 0,
                    padding: '7px 16px',
                    backgroundColor: LUXURY_THEME.backgroundDark,
                    color: LUXURY_THEME.textGold,
                    textAlign: 'center',
                    fontSize: '1.1rem',
                    fontWeight: '700',
                    borderBottom: `2px solid ${LUXURY_THEME.accent}`
                }}>
                    Prize Ladder
                </div>

                {/* Scrollable Prize List */}
                <div style={{
                    flex: 1,
                    overflowY: 'auto',
                    overflowX: 'hidden'
                }}>
                    <div style={{ padding: '0px 0' }}>
                        {reversedPrizes.map((prize, index) => {
                            const actualIndex = totalQuestions - index - 1;
                            const questionNumber = actualIndex + 1;
                            const isSafetyNet = safetyNets.includes(actualIndex);
                            const isCurrentQuestion = actualIndex === currentQuestion;

                            const rowStyle = {
                                display: 'flex',
                                justifyContent: 'space-between',
                                alignItems: 'center',
                                padding: '2.3px 16px',
                                fontSize: '0.95rem',
                                fontWeight: isSafetyNet || isCurrentQuestion ? '700' : '500',
                                background: isCurrentQuestion
                                    ? LUXURY_THEME.accent + '33'
                                    : isSafetyNet
                                        ? 'rgba(0, 255, 0, 0.08)'
                                        : 'transparent',
                                color: isCurrentQuestion
                                    ? LUXURY_THEME.textGold
                                    : isSafetyNet
                                        ? '#9bffb0'
                                        : LUXURY_THEME.text,
                                borderLeft: isCurrentQuestion
                                    ? `4px solid ${LUXURY_THEME.textGold}`
                                    : isSafetyNet
                                        ? `4px solid #9bffb0`
                                        : '4px solid transparent',
                                transition: 'all 0.3s ease',
                                minHeight: '32px'
                            };

                            return (
                                <div key={actualIndex} style={rowStyle}>
                                <span style={{ display: 'flex', alignItems: 'center', gap: 4 }}>
                                    <span style={{ minWidth: '32px' }}>Q{questionNumber}</span>
                                    {isSafetyNet && <span></span>}
                                </span>
                                    <span style={{ fontVariantNumeric: 'tabular-nums' }}>
                                    {currency}{prize.toLocaleString()}
                                </span>
                                </div>
                            );
                        })}
                    </div>
                </div>

                {/* Footer - Current Score */}
                <div style={{
                    padding: '7px 16px',
                    backgroundColor: LUXURY_THEME.backgroundDark,
                    borderTop: `1px solid ${LUXURY_THEME.border}`,
                    textAlign: 'center',
                    color: LUXURY_THEME.textGold,
                    fontSize: '1rem',
                    fontWeight: '700'
                }}>
                    Current Score: {currency}{score.toLocaleString()}
                </div>
            </div>
        );
    });


    // UI styles (no-scroll)
    const styles = {
        container: {
            width: '100vw',
            height: '100vh',
            overflow: 'hidden',
            background: LUXURY_THEME.primary,
            padding: '2vh 2vw',
            marginBottom: 12,
            paddingBottom: 65,
            boxSizing: 'border-box',
            fontFamily: "'Product Sans', 'Georgia', serif",
            position: 'relative',
            color: LUXURY_THEME.text,
            display: 'flex',
            flexDirection: 'column',
            justifyContent: 'space-between'
        },
        centerArea: {
            maxWidth: '90vw',
            margin: '0 auto',
            width: '100%',
            display: 'flex',
            flexDirection: 'column',
            alignItems: 'stretch',
            flex: 1,
            minHeight: 0
        },
        header: {
            display: 'flex',
            justifyContent: 'space-between',
            alignItems: 'center',
            gap: 12,
            flexWrap: 'wrap'
        },
        lifelineBar: {
            display: 'flex',
            gap: 12,
            alignItems: 'center',
            justifyContent: 'center',
            marginTop: '1vh',
            flexWrap: 'wrap'
        },
        lifelineBtn: (used) => ({
            display: 'flex',
            alignItems: 'center',
            gap: 8,
            padding: '10px 12px',
            borderRadius: 10,
            cursor: used ? 'not-allowed' : 'pointer',
            background: used ? 'rgba(255, 0, 0, 0.08)' : 'rgba(0, 128, 0, 0.08)',
            border: `1px solid ${used ? 'rgba(255,0,0,0.35)' : 'rgba(0,128,0,0.35)'}`,
            color: used ? '#ff9999' : '#b7ffb7',
            minWidth: 140,
            justifyContent: 'center',
            fontWeight: 700,
            fontSize: 'clamp(0.75rem, 1.5vw, 1rem)'
        }),
        mainFlex: {
            display: 'flex',
            gap: 22,
            alignItems: 'stretch',
            flex: 1,
            marginTop: '2vh',
            minHeight: 0
        },
        leftMain: {
            flex: 3,
            minHeight: 0,
            display: 'flex',
            flexDirection: 'column'
        },
        rightSide: {
            flex: 1,
            minWidth: '20vw',
            minHeight: 0
        },
        card: {
            backgroundColor: LUXURY_THEME.background,
            backdropFilter: 'blur(12px)',
            borderRadius: 16,
            padding: '2vh 2vw',
            marginBottom: '1vh',
            border: `2px solid ${LUXURY_THEME.border}`,
            boxShadow: LUXURY_THEME.shadow,
            overflow: 'auto'
        },
        questionText: {
            fontSize: 'clamp(1.2rem, 2.5vw, 1.5rem)', // Responsive font
            marginBottom: '1vh'
        },
        optionBtn: (disabled, selected) => ({
            display: 'flex',
            alignItems: 'center',
            justifyContent: 'space-between',
            padding: '1.5vh 2vw',
            borderRadius: 12,
            marginBottom: '1vh',
            cursor: disabled ? 'not-allowed' : 'pointer',
            background: selected ? 'rgba(212,175,55,0.12)' : 'rgba(0,0,0,0.35)',
            border: selected ? `2px solid ${LUXURY_THEME.textGold}` : `1px solid rgba(255,255,255,0.06)`,
            opacity: disabled ? 0.5 : 1,
            fontSize: 'clamp(0.9rem, 1.8vw, 1.1rem)'
        }),
        timerBar: {
            height: '1.2vh',
            borderRadius: 8,
            background: 'rgba(255,255,255,0.06)',
            overflow: 'hidden'
        },
        timerFill: (pct) => ({
            width: `${pct}%`,
            height: '100%',
            background: 'linear-gradient(90deg,#ffd700,#ffb347)',
            transition: 'width 0.9s linear'
        }),
    };

    if (isPresenterMode() && !isAuthenticated) {
        return (
            <div style={{ ...styles.container, display: 'flex', alignItems: 'center', justifyContent: 'center' }}>
                <div style={{ ...styles.card, width: '400px', textAlign: 'center', padding: '40px' }}>
                    <img src={xxvLogo} alt="Logo" style={{ width: 150, marginBottom: 0 }} />
                    <h2 style={{ color: LUXURY_THEME.textGold, marginBottom: 20 }}>Admin Access</h2>
                    <input
                        type="password"
                        placeholder="Enter Password"
                        value={passwordInput}
                        onChange={(e) => setPasswordInput(e.target.value)}
                        onKeyDown={(e) => e.key === 'Enter' && (passwordInput === ADMIN_PASSWORD ? setIsAuthenticated(true) : alert('Wrong Password'))}
                        style={{
                            width: '90%',
                            padding: '15px',
                            borderRadius: '8px',
                            background: 'rgba(0,0,0,0.5)',
                            color: '#fff',
                            border: `1px solid ${LUXURY_THEME.border}`,
                            marginBottom: '20px'
                        }}
                    />
                    <button
                        onClick={() => passwordInput === ADMIN_PASSWORD ? setIsAuthenticated(true) : alert('Wrong Password')}
                        style={{
                            width: '100%',
                            padding: '12px',
                            background: LUXURY_THEME.secondary,
                            border: 'none',
                            borderRadius: '8px',
                            fontWeight: 'bold',
                            cursor: 'pointer'
                        }}
                    >
                        Get Access
                    </button>
                </div>
                <AnimatedBanner />
            </div>
        );
    }

    // Render: Registration
    if (gameState === 'registration') {
        return (
            <div style={styles.container}>
                <div style={{ ...styles.centerArea }}>
                    <div style={styles.header}>
                        <div>
                            <img
                                src={xxvLogo}
                                alt="XXV Logo"
                                style={{
                                    width: 150,
                                    height: 150,
                                    objectFit: 'contain'
                                }}
                            />
                        </div>
                        <div style={{ textAlign: 'right' }}>
                            <h1 style={{ margin: 0, fontSize: '2.2rem', background: LUXURY_THEME.secondary, WebkitBackgroundClip: 'text', WebkitTextFillColor: 'transparent' }}>
                                QuizIQ
                            </h1>
                            <div style={{ color: 'rgba(255,255,255,0.85)' }}>by 6 Tech Solutions</div>
                        </div>
                    </div>

                    <div style={{ ...styles.card, maxWidth: 1500, marginBottom: 'auto', marginTop: 120, marginLeft: 'auto', marginRight: 'auto' }}>
                        <h3 style={{ color: LUXURY_THEME.textGold }}>Enter Player Name</h3>
                        <input
                            autoFocus
                            type="text"
                            placeholder="Player name..."
                            value={playerName}
                            onChange={(e) => setPlayerName(e.target.value)}
                            onKeyDown={(e) => e.key === 'Enter' && playerName.trim() && setGameState('category-selection')}
                            style={{
                                width: 'auto',
                                padding: '20px 30px',
                                borderRadius: 10,
                                border: `1px solid ${LUXURY_THEME.border}`,
                                backgroundColor: 'rgba(0,0,0,0.45)',
                                color: LUXURY_THEME.text,
                                fontSize: 16,
                                marginTop: -2,
                                marginBottom: 12
                            }}
                        />
                        <div style={{ display: 'flex', gap: 12 }}>
                            <button
                                onClick={() => {
                                    if (!isPresenterMode()) return; // Audience can't click
                                    if (playerName.trim()) setGameState('category-selection');
                                }}
                                disabled={!playerName.trim()}
                                style={{ flex: 1, padding: '12px 14px', borderRadius: 10, background: 'linear-gradient(90deg,#ffd700,#ffb347)', border: 'none', cursor: playerName.trim() ? 'pointer' : 'not-allowed', fontWeight: 700 }}
                            >
                                Continue
                            </button>
                            <button
                                onClick={() => {
                                    if (!isPresenterMode()) return;
                                    setPlayerName('Guest');
                                    setGameState('category-selection');
                                }}
                                style={{ padding: '12px 14px', borderRadius: 10, background: 'rgba(255,255,255,0.03)', border: `1px solid ${LUXURY_THEME.border}` }}
                            >
                                Guest
                            </button>
                        </div>
                    </div>
                </div>

                {/* floating audience label, only for Audience screen*/}
                {!isPresenterMode() && (gameState === 'registration') && (
                    <div style={{
                        position: 'absolute',
                        top: '20px',
                        left: '50%',
                        transform: 'translateX(-50%)',
                        zIndex: 1000,
                        pointerEvents: 'none',
                        textAlign: 'center'
                    }}>
                        <h2 style={{
                            fontSize: '3rem',      // Very large for the lounge screen
                            color: '#d4af37',        // Using the gold accent
                            textTransform: 'uppercase',
                            fontWeight: '900',
                            letterSpacing: '15px',   // Spaced out for a premium feel
                            opacity: 0.25,           // Subtle watermark effect
                            margin: 0
                        }}>
                            Audience
                        </h2>
                    </div>
                )}

                <video src={TRANSITION_VIDEO_PATH} preload="auto" style={{ display: 'none' }} />

                <AnimatedBanner />
            </div>
        );
    }


    if (gameState === 'category-selection') {
        return (
            <div style={styles.container}>
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

                    <div style={{ display: 'grid', gridTemplateColumns: 'repeat(2, 1fr)', gap: 20, marginTop: 18 }}>
                        <div style={{ ...styles.card, cursor: 'pointer', display: 'flex', flexDirection: 'column', minHeight: 120 }} onClick={() => selectCategory('default')}>
                            <div style={{ fontSize: 36 }}>🌍 </div>
                            <h3 style={{ color: LUXURY_THEME.textGold, marginTop: 12, marginBottom: 8 }}>Default</h3>
                            <p style={{ color: 'rgba(255,255,255,0.85)', flex: 1 }}>Mixed Nigerian + Global question set (default sample).</p>
                            <div style={{ marginTop: 12, color: '#bcd', fontWeight: 600 }}>{getDefaultQuestions().length} default questions, {(importedQuestions.sets || []).length} custom question sets </div>
                        </div>

                        <div style={{ ...styles.card, cursor: 'pointer', display: 'flex', flexDirection: 'column', minHeight: 120 }} onClick={() => selectCategory('custom')}>
                            <div style={{ fontSize: 36 }}>📁</div>
                            <h3 style={{ color: LUXURY_THEME.textGold, marginTop: 12, marginBottom: 8 }}>Custom Questions (CSV)</h3>
                            <p style={{ color: 'rgba(255,255,255,0.85)', flex: 1 }}>Gallery of your CSV files.</p>
                            <div style={{ marginTop: 12, color: '#bcd', fontWeight: 600 }}>{(importedQuestions.sets || []).length} custom question sets </div>
                        </div>

                        <div style={{ ...styles.card, display: 'flex', flexDirection: 'column', minHeight: 120 }}>
                            <div style={{ fontSize: 36 }}>📥</div>
                            <h3 style={{ color: LUXURY_THEME.textGold, marginTop: 12, marginBottom: 8 }}>Import Questions</h3>
                            <p style={{ color: 'rgba(255,255,255,0.8)', flex: 1, fontSize: '0.95rem' }}>
                                Upload CSV with pipe-delimited format: Question | Options A-D | Correct Answer (1-4) | Difficulty | Category
                            </p>
                            <div style={{ display: 'flex', gap: 8, marginTop: 12, flexWrap: 'wrap' }}>
                                <button onClick={downloadExcelTemplate} style={{ padding: '8px 12px', borderRadius: 8, cursor: 'pointer', background: 'rgba(0,128,0,0.15)', border: '1px solid rgba(0,255,0,0.3)', color: '#9bffb0', fontSize: '0.85rem' }}>📥 Download Template</button>
                                <label style={{ padding: '8px 12px', borderRadius: 8, border: '1px solid rgba(255,255,255,0.2)', cursor: 'pointer', background: 'rgba(255,255,255,0.05)', fontSize: '0.85rem' }}>
                                    📂 Upload CSV
                                    <input type="file" accept=".csv,.txt" multiple onChange={handleExcelImport} style={{ display: 'none' }} />
                                </label>
                                <button onClick={() => {
                                    const sample = [{
                                        id: Date.now(),
                                        question: 'Sample: Sky color?',
                                        options: ['Red','Green','Blue','Yellow'],
                                        correct: 2,
                                        difficulty: 'easy',
                                        category: 'General'
                                    }];
                                    const newSet = {
                                        id: Date.now(),
                                        name: 'Sample Question Set',
                                        questions: sample,
                                        createdAt: new Date().toLocaleString()
                                    };
                                    const updatedSets = [...(importedQuestions.sets||[]), newSet];
                                    setImportedQuestions({ sets: updatedSets });

                                    // Save to storage
                                    try {
                                        localStorage.setItem('imported-questions', JSON.stringify({ sets: updatedSets }));
                                        alert('Sample set imported and saved!');
                                    } catch (error) {
                                        alert('Sample set imported but may not persist.');
                                    }
                                }} style={{ padding: '8px 12px', borderRadius: 8, background: 'rgba(255,255,255,0.05)', border: '1px solid rgba(255,255,255,0.2)', cursor: 'pointer', fontSize: '0.85rem' }}>▶️ Load Sample</button>
                            </div>
                        </div>

                        <div style={{ ...styles.card, display: 'flex', flexDirection: 'column', minHeight: 120 }}>
                            <div style={{ fontSize: 36 }}>🖼️</div>
                            <h3 style={{ color: LUXURY_THEME.textGold, marginTop: 12, marginBottom: 8 }}>Slideshows</h3>
                            <p style={{ color: 'rgba(255,255,255,0.8)', marginBottom: 12, fontSize: '0.95rem' }}>
                                Upload images for slideshow display. (Max: 10 images)
                            </p>

                            <div style={{ flex: 1, overflowY: 'auto', maxHeight: 120, marginBottom: 12 }}>
                                {slideshowImages.length === 0 ? (
                                    <div style={{ color: 'rgba(255,255,255,0.5)', fontSize: '0.9rem', fontStyle: 'italic' }}>No images uploaded yet</div>
                                ) : (
                                    <div style={{ display: 'flex', flexWrap: 'wrap', gap: 8 }}>
                                        {slideshowImages.map(img => (
                                            <div key={img.id} style={{ position: 'relative', width: 60, height: 60, borderRadius: 6, overflow: 'hidden', border: '1px solid rgba(255,255,255,0.2)' }}>
                                                <img src={img.src} alt={img.name} style={{ width: '100%', height: '100%', objectFit: 'cover' }} />
                                                <button
                                                    onClick={() => deleteImage(img.id)}
                                                    style={{ position: 'absolute', top: 2, right: 2, width: 18, height: 18, borderRadius: '50%', background: 'rgba(255,0,0,0.8)', border: 'none', cursor: 'pointer', display: 'flex', alignItems: 'center', justifyContent: 'center', color: '#fff', fontSize: 10, fontWeight: 'bold', padding: 0 }}
                                                >×</button>
                                            </div>
                                        ))}
                                    </div>
                                )}
                            </div>

                            <div style={{ display: 'flex', gap: 8, marginTop: 12, flexWrap: 'wrap' }}>
                                <label style={{ padding: '8px 12px', borderRadius: 8, cursor: 'pointer', background: 'rgba(255,255,255,0.05)', border: '1px solid rgba(255,255,255,0.2)', fontSize: '0.85rem' }}>
                                    📤 Upload Images ({slideshowImages.length}/10)
                                    <input type="file" accept="image/*" multiple onChange={handleImageUpload} style={{ display: 'none' }} />
                                </label>
                                <button
                                    onClick={startSlideshow}
                                    disabled={slideshowImages.length === 0}
                                    style={{
                                        padding: '8px 12px',
                                        borderRadius: 8,
                                        border: '1px solid rgba(255,255,255,0.2)',
                                        cursor: slideshowImages.length === 0 ? 'not-allowed' : 'pointer',
                                        background: slideshowImages.length === 0 ? 'rgba(100,100,100,0.3)' : 'rgba(0,128,0,0.15)',
                                        color: slideshowImages.length === 0 ? '#888' : '#9bffb0',
                                        fontSize: '0.85rem',
                                        opacity: slideshowImages.length === 0 ? 0.5 : 1
                                    }}
                                >
                                    ▶️ Play Slideshow
                                </button>
                            </div>
                        </div>
                    </div>
                </div>

                {/* floating audience label, only for Audience screen*/}
                {!isPresenterMode() && (gameState === 'category-selection') && (
                    <div style={{
                        position: 'absolute',
                        top: '20px',
                        left: '50%',
                        transform: 'translateX(-50%)',
                        zIndex: 1000,
                        pointerEvents: 'none',
                        textAlign: 'center'
                    }}>
                        <h2 style={{
                            fontSize: '3rem',      // Very large for the lounge screen
                            color: '#d4af37',        // Using the gold accent
                            textTransform: 'uppercase',
                            fontWeight: '900',
                            letterSpacing: '15px',   // Spaced out for a premium feel
                            opacity: 0.25,           // Subtle watermark effect
                            margin: 0
                        }}>
                            Audience
                        </h2>
                    </div>
                )}

                <AnimatedBanner />
            </div>
        );
    }

    if (gameState === 'menu') {
        return (
            <div style={styles.container}>
                <div style={styles.centerArea}>
                    <div style={styles.header}>
                        <div>
                            <h1 style={{ margin: 0, fontSize: '2rem', background: LUXURY_THEME.secondary, WebkitBackgroundClip: 'text', WebkitTextFillColor: 'transparent' }}>Choose Question Set</h1>
                            <div style={{ color: 'rgba(255,255,255,0.9)' }}>Welcome {playerName}</div>
                        </div>
                        <div>
                            <button
                                onClick={deleteAllImportedSets} style={{ padding: '8px 12px', borderRadius: 8, marginRight: 10 }}
                            >
                                Delete All Question Sets!
                            </button>
                            <button onClick={() => setGameState('category-selection')} style={{ padding: '8px 12px', borderRadius: 8 }}
                            >
                                Back
                            </button>
                        </div>
                    </div>

                    <div style={{ ...styles.card, marginTop: 18 }}>
                        <h3 style={{ borderBottom: `1px solid ${LUXURY_THEME.border}`, paddingBottom: 10, color: LUXURY_THEME.textGold, marginBottom: 20 }}>Available Question Sets</h3>

                        <div style={{ display: 'grid', gridTemplateColumns: 'repeat(auto-fill, minmax(320px, 1fr))', gap: 20, maxHeight: '60vh', overflowY: 'auto', paddingRight: 10 }}>

                            {/* 1. Default Set Card */}
                            <div style={{
                                ...styles.card,
                                display: 'flex',
                                flexDirection: 'column',
                                border: `2px solid ${LUXURY_THEME.accent}`,
                                minHeight: 280
                            }}>
                                <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center', marginBottom: 10 }}>
                                    <div style={{ fontWeight: 'bold', fontSize: '1.1rem', color: LUXURY_THEME.textGold }}>🌍 Default Set</div>
                                    <div style={{ fontSize: '0.8rem', background: 'rgba(212,175,55,0.2)', padding: '4px 10px', borderRadius: 6, color: LUXURY_THEME.textGold }}>Built-in</div>
                                </div>

                                <div style={{ fontSize: '0.75rem', color: '#888', marginBottom: 12 }}>
                                    {getDefaultQuestions().length} questions • Mixed Nigerian + Global
                                </div>

                                <div style={{
                                    flex: 1,
                                    fontSize: '0.85rem',
                                    color: '#aaa',
                                    marginBottom: 15,
                                    background: 'rgba(0,0,0,0.3)',
                                    padding: 12,
                                    borderRadius: 8,
                                    maxHeight: 140,
                                    overflowY: 'auto'
                                }}>
                                    <div style={{ marginBottom: 8, fontStyle: 'italic', color: '#bbb' }}>Preview:</div>
                                    {getDefaultQuestions().slice (0, 3).map((q, i) => (
                                        <div key={i} style={{
                                            marginBottom: 6,
                                            paddingLeft: 8,
                                            borderLeft: '2px solid rgba(255,255,255,0.2)'
                                        }}>
                                            • {q.question.length > 10 ? q.question.substring(0, 10) + '...' : q.question}
                                        </div>
                                    ))}
                                    {getDefaultQuestions().length > 3 && (
                                        <div style={{ marginTop: 8, color: LUXURY_THEME.accent, fontSize: '0.8rem' }}>
                                            + {getDefaultQuestions().length - 3} more questions
                                        </div>
                                    )}
                                </div>

                                <button
                                    onClick={() => {
                                        selectCategory('default');
                                        // Immediately start game after selecting default
                                        setTimeout(() => startGame(), 100);
                                    }}
                                    style={{
                                        padding: '12px',
                                        borderRadius: 8,
                                        background: 'linear-gradient(90deg,#ffd700,#ffb347)',
                                        border: 'none',
                                        fontWeight: 'bold',
                                        cursor: 'pointer',
                                        color: '#1a1a1a',
                                        fontSize: '1rem',
                                        display: 'flex',
                                        alignItems: 'center',
                                        justifyContent: 'center',
                                        gap: 8
                                    }}
                                >
                                    <Play size={18} /> Play Default Set
                                </button>
                            </div>

                            {/* 2. Imported Question Sets */}
                            {(importedQuestions.sets || []).map((set) => (
                                <div key={set.id} style={{
                                    ...styles.card,
                                    display: 'flex',
                                    flexDirection: 'column',
                                    border: `1px solid ${LUXURY_THEME.border}`,
                                    minHeight: 280
                                }}>
                                    <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'flex-start', marginBottom: 10 }}>
                                        <div style={{ fontWeight: 'bold', fontSize: '1.1rem', color: '#fff', flex: 1 }}>
                                            📚 {set.name}
                                        </div>
                                    </div>

                                    <div style={{ fontSize: '0.75rem', color: '#888', marginBottom: 12 }}>
                                        {set.questions.length} questions • Created: {set.createdAt}
                                    </div>

                                    <div style={{
                                        flex: 1,
                                        fontSize: '0.85rem',
                                        color: '#aaa',
                                        marginBottom: 15,
                                        background: 'rgba(0,0,0,0.3)',
                                        padding: 12,
                                        borderRadius: 8,
                                        maxHeight: 140,
                                        overflowY: 'auto'
                                    }}>
                                        <div style={{ marginBottom: 8, fontStyle: 'italic', color: '#bbb' }}>Preview:</div>
                                        {set.questions.slice(0, 3).map((q, i) => (
                                            <div key={i} style={{
                                                marginBottom: 6,
                                                paddingLeft: 8,
                                                borderLeft: '2px solid rgba(255,255,255,0.2)'
                                            }}>
                                                • {q.question.length > 10 ? q.question.substring(0, 10) + '...' : q.question}
                                            </div>
                                        ))}
                                        {set.questions.length > 3 && (
                                            <div style={{ marginTop: 8, color: '#bbb', fontSize: '0.8rem' }}>
                                                + {set.questions.length - 3} more questions
                                            </div>
                                        )}
                                    </div>

                                    <div style={{ display: 'flex', gap: 8 }}>
                                        <button
                                            onClick={() => {
                                                setCurrentQuestions(set.questions.slice(0, GAME_CONFIG.totalQuestions));
                                                setSelectedCategory(`custom: ${set.name}`);

                                                // mark as played
                                                setPlayedSetIds(prev => [...prev, set.id]);

                                                setTimeout(() => startGame(), 100);
                                            }}
                                            style={{
                                                flex: 1,
                                                padding: '10px',
                                                borderRadius: 8,
                                                background: 'rgba(0,128,0,0.15)',
                                                border: `1px solid rgba(0,255,0,0.3)`,
                                                fontWeight: 'bold',
                                                cursor: 'pointer',
                                                color: '#9bffb0',
                                                display: 'flex',
                                                alignItems: 'center',
                                                justifyContent: 'center',
                                                gap: 6
                                            }}
                                        >
                                            <Play size={16} /> Play
                                        </button>

                                        <button
                                            title="Rename Set"
                                            onClick={(e) => {
                                                e.stopPropagation();
                                                const newName = prompt("Rename this set:", set.name);
                                                if (newName && newName.trim()) renameQuestionSet(set.id, newName.trim());
                                            }}
                                            style={{
                                                padding: '10px 14px',
                                                borderRadius: 8,
                                                background: 'rgba(255,255,255,0.05)',
                                                border: '1px solid rgba(255,255,255,0.2)',
                                                cursor: 'pointer',
                                                fontSize: '1.1rem'
                                            }}
                                        >
                                            ✏️
                                        </button>

                                        <button
                                            title="Delete Set"
                                            onClick={(e) => {
                                                e.stopPropagation();
                                                if(window.confirm(`Delete "${set.name}"?`)) deleteQuestionSet(set.id);
                                            }}
                                            style={{
                                                padding: '10px 14px',
                                                borderRadius: 8,
                                                background: 'rgba(255,0,0,0.1)',
                                                border: '1px solid rgba(255,0,0,0.3)',
                                                cursor: 'pointer',
                                                fontSize: '1.1rem'
                                            }}
                                        >
                                            🗑️
                                        </button>
                                    </div>
                                </div>
                            ))}

                            {/* Empty State if no imported sets */}
                            {(importedQuestions.sets || []).length === 0 && (
                                <div style={{
                                    ...styles.card,
                                    display: 'flex',
                                    flexDirection: 'column',
                                    alignItems: 'center',
                                    justifyContent: 'center',
                                    minHeight: 280,
                                    border: '2px dashed rgba(255,255,255,0.2)'
                                }}>
                                    <div style={{ fontSize: '3rem', marginBottom: 12 }}>📂</div>
                                    <div style={{ color: '#888', fontSize: '0.95rem', textAlign: 'center', marginBottom: 12 }}>
                                        No custom question sets yet
                                    </div>
                                    <label
                                        style={{
                                            padding: '8px 16px',
                                            borderRadius: 8,
                                            background: 'rgba(255,255,255,0.05)',
                                            border: '1px solid rgba(255,255,255,0.2)',
                                            color: '#bbb',
                                            cursor: 'pointer',
                                            display: 'inline-block'
                                        }}
                                    >
                                        Upload CSV
                                        <input
                                            type="file"
                                            accept=".csv,.txt"
                                            multiple
                                            onChange={handleExcelImport}
                                            style={{ display: 'none' }}
                                        />
                                    </label>
                                </div>
                            )}
                        </div>
                    </div>
                </div>

                {/* floating audience label, only for Audience screen*/}
                {!isPresenterMode() && (gameState === 'menu') && (
                    <div style={{
                        position: 'absolute',
                        top: '20px',
                        left: '50%',
                        transform: 'translateX(-50%)',
                        zIndex: 1000,
                        pointerEvents: 'none',
                        textAlign: 'center'
                    }}>
                        <h2 style={{
                            fontSize: '3rem',      // Very large for the lounge screen
                            color: '#d4af37',        // Using the gold accent
                            textTransform: 'uppercase',
                            fontWeight: '900',
                            letterSpacing: '15px',   // Spaced out for a premium feel
                            opacity: 0.25,           // Subtle watermark effect
                            margin: 0
                        }}>
                            Audience
                        </h2>
                    </div>
                )}
                <AnimatedBanner />
            </div>
        );
    }

    // Playing - main screen
    if (gameState === 'playing') {
        const q = currentQuestions[currentQuestion] || { question: 'Question not found', options: ['', '', '', ''], correct: 0 };

        // 1. Logic for the "Big Clock" animation
        const isUrgent = timeLeft <= 5;
        const clockStyle = {
            fontSize: isUrgent ? '5rem' : '3rem',
            fontWeight: '800',
            color: isUrgent ? '#ff4d4d' : LUXURY_THEME.textGold,
            textShadow: isUrgent ? '0 0 30px rgba(255,0,0,0.6)' : '0 2px 10px rgba(0,0,0,0.3)',
            transition: 'all 0.5s cubic-bezier(0.175, 0.885, 0.32, 1.275)',
            textAlign: 'center',
            lineHeight: 1
        };

        // 2. Logic for Smart Timer Button
        const isStart = timeLeft === GAME_CONFIG.timePerQuestion;
        const timerBtnText = isTimerRunning ? 'Pause Timer' : (isStart ? 'Start Timer' : 'Resume Timer');

        // Custom Pause Icon
        const pauseIcon = (
            <div style={{ display: 'flex', gap: 4 }}>
                <div style={{ width: 4, height: 16, background: '#1a1a1a', borderRadius: 2 }}></div>
                <div style={{ width: 4, height: 16, background: '#1a1a1a', borderRadius: 2 }}></div>
            </div>
        );

        const isSafetyNet = GAME_CONFIG.safetyNets.includes(currentQuestion);
        const potentialSecure = GAME_CONFIG.prizeStructure[currentQuestion];
        const dropAmount = getScoreAfterWrongAnswer();

        // transition screen
        return (
            <div style={styles.container}>


                <div style={styles.centerArea}>

                    {/*transition video overlay */}
                    {showTransition && (
                        <div style={{ position: 'absolute', inset: 0, zIndex: 9999, display: 'flex', alignItems: 'center', justifyContent: 'center', background: 'rgba(0,0,0,0.6)',  paddingBottom: '80px' }}>
                            <video ref={transitionVideoRef} src={TRANSITION_VIDEO_PATH} style={{ maxWidth: '90%', maxHeight: '90%', borderRadius: 12 }} autoPlay muted={!isPresenterMode()} onEnded={() => onTransitionEnded()} />
                        </div>
                    )}

                    {showSafetyBanner && (
                        <div style={{
                            position: 'absolute',
                            top: '50%',
                            left: '50%',
                            transform: 'translate(-50%, -50%)',
                            zIndex: 9998, // Below video, above game
                            width: '80%',
                            maxWidth: '1000px',
                            height: '80%',
                            maxHeight: '500px',
                            background: 'rgba(0, 0, 0, 0.85)', // Dark transparent background
                            backdropFilter: 'blur(10px)',
                            border: `2px solid ${LUXURY_THEME.textGold}`,
                            borderRadius: '20px',
                            padding: '40px',
                            textAlign: 'center',
                            boxShadow: '0 0 50px rgba(212, 175, 55, 0.5)',
                            display: 'flex',
                            flexDirection: 'column',
                            justifyContent: 'center',
                            alignItems: 'center',
                            animation: 'bounceIn 0.8s cubic-bezier(0.175, 0.885, 0.32, 1.275)'
                        }}>
                            <div style={{ fontSize: '4rem', marginBottom: '20px' }}>🔒</div>
                            <h2 style={{
                                color: LUXURY_THEME.textGold,
                                textTransform: 'uppercase',
                                fontSize: '2.5rem',
                                margin: '0 0 20px 0',
                                letterSpacing: '4px'
                            }}>
                                Safety Net Announcement
                            </h2>
                            <div style={{fontSize: '1.6rem', opacity: 0.9, lineHeight: 1.4}}>
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

                        {/* Lifelines */}
                        <div style={{ display: 'flex', justifyContent: 'center', margin: '20px 0' }}>
                            <div style={styles.lifelineBar}>
                                <div title="50/50" onClick={() => isPresenterMode() && handleFiftyFifty()} style={{...styles.lifelineBtn(lifelinesUsed.fiftyFifty), cursor: !isPresenterMode() || lifelinesUsed.fiftyFifty ? 'not-allowed' : 'pointer'}}>
                                    <Scissors size={18} /> <span>50/50</span>
                                </div>
                                <div title="Ask Audience" onClick={() => isPresenterMode() && handleAskAudience()} style={{...styles.lifelineBtn(lifelinesUsed.askAudience), cursor: !isPresenterMode() || lifelinesUsed.askAudience ? 'not-allowed' : 'pointer'}}>
                                    <Users size={18} /> <span>Ask Audience</span>
                                </div>
                                <div title="Phone a Friend" onClick={() => isPresenterMode() && handlePhoneAFriend()} style={{...styles.lifelineBtn(lifelinesUsed.phoneAFriend), cursor: !isPresenterMode() || lifelinesUsed.phoneAFriend ? 'not-allowed' : 'pointer'}}>
                                    <Phone size={18} /> <span>Phone a Friend</span>
                                </div>
                            </div>
                        </div>

                        {/* Smart Timer Button */}
                        <div>
                            <button
                                onClick={() => isPresenterMode() && setIsTimerRunning(!isTimerRunning)}
                                style={{
                                    padding: '12px 24px', borderRadius: 10, border: 'none', fontWeight: '800',
                                    cursor: isPresenterMode() ? 'pointer' : 'not-allowed', fontSize: '1rem',
                                    background: LUXURY_THEME.secondary,
                                    color: '#1a1a1a',
                                    boxShadow: '0 0 20px rgba(212, 175, 55, 0.4)',
                                    display: 'flex', alignItems: 'center', gap: 10, minWidth: 160, justifyContent: 'center',
                                    transform: 'scale(1)', transition: 'transform 0.1s',
                                    opacity: isPresenterMode() ? 1 : 0.6
                                }}
                                onMouseDown={(e) => isPresenterMode() && (e.currentTarget.style.transform = 'scale(0.95)')}
                                onMouseUp={(e) => isPresenterMode() && (e.currentTarget.style.transform = 'scale(1)')}
                            >
                                {isTimerRunning ? pauseIcon : <Play size={20} fill="#1a1a1a" />}
                                {timerBtnText}
                            </button>
                        </div>
                    </div>

                    <div style={styles.mainFlex}>
                        <div style={styles.leftMain}>
                            <div style={styles.card}>
                                {/* Question Text */}
                                <div style={styles.questionText}>{q.question}</div>
                                <div style={{ color: 'rgba(255,255,255,0.75)', marginBottom: 12 }}>{q.category || 'General'} • {q.difficulty}</div>

                                {/* Options */}
                                <div>
                                    {(q.options || []).map((opt, idx) => {
                                        const isElim = eliminatedOptions.includes(idx);
                                        const isSelected = selectedAnswer === idx;
                                        const showCorrect = showCorrectAnswers && idx === q.correct && !showResult && !showTransition;
                                        const showCheck = showResult && idx === q.correct;
                                        const showCross = showResult && selectedAnswer === idx && idx !== q.correct;
                                        return (
                                            <div key={idx} onClick={() => { if (isElim || showResult || showTransition) return; setSelectedAnswer(idx); }} style={styles.optionBtn(isElim, isSelected)}>
                                                <div style={{ display: 'flex', alignItems: 'center', gap: 12 }}>
                                                    <div style={{ width: 36, height: 36, borderRadius: 8, display: 'flex', alignItems: 'center', justifyContent: 'center', background: 'rgba(255,255,255,0.03)' }}>{['A', 'B', 'C', 'D'][idx]}</div>
                                                    <div style={{ opacity: isElim ? 0.5 : 1 }}>{opt}</div>
                                                </div>
                                                <div style={{ display: 'flex', alignItems: 'center', gap: 8 }}>
                                                    {showCorrect && <Crown size={18} color={LUXURY_THEME.textGold} />}
                                                    {showResult && showCheck && <CheckCircle size={20} color="#28a745" />}
                                                    {showResult && showCross && <XCircle size={20} color="#ff4d4d" />}
                                                </div>
                                            </div>
                                        );
                                    })}
                                </div>

                                {/* Big Clock Section */}
                                <div style={{ marginTop: 20, padding: '20px 0', borderTop: '1px solid rgba(255,255,255,0.1)', display: 'flex', flexDirection: 'column', alignItems: 'center' }}>
                                    <div style={{ fontSize: '0.9rem', textTransform: 'uppercase', letterSpacing: '2px', color: '#888', marginBottom: 10 }}>Time Remaining</div>

                                    <div style={clockStyle}>
                                        {timeLeft}
                                    </div>

                                    <div style={{ color: isUrgent ? '#ff4d4d' : 'rgba(255,255,255,0.6)', fontSize: '0.9rem', marginTop: 8 }}>
                                        {timeLeft === 0 ? "TIME'S UP!" : "SECONDS"}
                                    </div>
                                </div>

                                {isPresenterMode() && (
                                    <div style={{ marginTop: 14, display: 'flex', justifyContent: 'flex-end' }}>
                                        <button onClick={() => triggerSubmitAnswer()} disabled={selectedAnswer === null || showTransition}
                                                style={{
                                                    padding: '12px 18px', borderRadius: 10,
                                                    background: selectedAnswer === null ? 'rgba(255,255,255,0.04)' : 'linear-gradient(90deg,#ffd700,#ffb347)',
                                                    border: 'none', cursor: selectedAnswer === null ? 'not-allowed' : 'pointer', fontWeight: 700, color: selectedAnswer === null ? '#aaa' : '#000'
                                                }}
                                        >
                                            Submit Answer
                                        </button>
                                    </div>
                                )}
                            </div>
                        </div>

                        {/* Right-side Prize Ladder */}
                        <div style={styles.rightSide}>
                            <PrizeLadder currentQuestion={currentQuestion} score={score} safetyNets={GAME_CONFIG.safetyNets} prizeStructure={GAME_CONFIG.prizeStructure} currency={GAME_CONFIG.currency} />
                        </div>
                    </div>
                </div>
                <AnimatedBanner />
            </div>
        );
    }

    // Result screen
    if (gameState === 'result') {
        const isWinner = score === 10000; //change logic here if you want easier winning criteria

        return (
            <div style={styles.container}>
                <BounceKeyframes />
                <div style={styles.centerArea}>
                    <div style={styles.header}>
                        <div>
                            <h1 style={{ margin: 0, fontSize: '2rem', background: LUXURY_THEME.secondary, WebkitBackgroundClip: 'text', WebkitTextFillColor: 'transparent' }}></h1>
                        </div>
                        <div>
                            <button
                                onClick={() => setGameState('play_next')} style={{ padding: '8px 12px', borderRadius: 8, marginRight: 10,}}
                            >
                                Play Next Game
                            </button>
                            <button
                                onClick={() => resetGame()} style={{ padding: '8px 12px', borderRadius: 8, marginRight: 10 }}
                            >
                                Restart Game
                            </button>
                            <button onClick={() => startSlideshow()} style={{ padding: '8px 12px', borderRadius: 8, marginRight: 10 }}
                            >
                                Start Slideshow
                            </button>
                        </div>
                    </div>

                    <div style={{ ...styles.card, marginTop: 18, display: 'flex', flexDirection: 'column', alignItems: 'center', textAlign: 'center', paddingTop: 40, paddingBottom: 40 }}>

                        <div style={{
                            fontSize: '6rem',
                            marginBottom: 20,
                            animation: 'bounceIn 1s ease-out forwards, float 3s ease-in-out infinite 1s'
                        }}>
                            {isWinner ? '🤑' : '😔'}
                        </div>

                        <h3 style={{ color: LUXURY_THEME.textGold, fontSize: '2rem', margin: '10px 0' }}>
                            {isWinner ? 'Congratulations!' : 'Game Over'}
                        </h3>

                        <p style={{ color: 'rgba(255,255,255,0.9)', fontSize: '1.2rem', maxWidth: 600, lineHeight: 1.5 }}>
                            {isWinner
                                ? `Incredible job, ${playerName}! You've secured the top prize!`
                                : `Don't give up, ${playerName}. You gave it a good shot! Try again next time.`
                            }
                        </p>

                        <div style={{
                            marginTop: 20,
                            padding: '15px 30px',
                            background: 'rgba(212, 175, 55, 0.1)',
                            border: `1px solid ${LUXURY_THEME.accent}`,
                            borderRadius: 12
                        }}>
                            <span style={{ color: '#aaa' }}>Final Score:</span>
                            <div style={{ fontSize: '2rem', fontWeight: 'bold', color: LUXURY_THEME.textGold }}>
                                {GAME_CONFIG.currency}{score.toLocaleString()}
                            </div>
                        </div>
                    </div>
                </div>

                <AnimatedBanner />
            </div>
        );
    }

//new "Next Player" transition screen
    if (gameState === 'play_next') {
        return (
            <div style={styles.container}>
                <div style={{ ...styles.centerArea }}>
                    <div style={styles.header}>
                        <div>
                            <img
                                src={xxvLogo}
                                alt="XXV Logo"
                                style={{
                                    width: 150,
                                    height: 150,
                                    objectFit: 'contain'
                                }}
                            />
                        </div>
                        <div style={{ textAlign: 'right' }}>
                            <h1 style={{ margin: 0, fontSize: '2.2rem', background: LUXURY_THEME.secondary, WebkitBackgroundClip: 'text', WebkitTextFillColor: 'transparent' }}>
                                QuizIQ
                            </h1>
                            <div style={{ color: 'rgba(255,255,255,0.85)' }}>by 6 Tech Solutions</div>
                        </div>
                    </div>

                    <div style={{ ...styles.card, maxWidth: 1500, marginBottom: 'auto', marginTop: 120, marginLeft: 'auto', marginRight: 'auto' }}>
                        <h3 style={{ color: LUXURY_THEME.textGold }}>Enter Player Name</h3>
                        <input
                            autoFocus
                            type="text"
                            placeholder="Player name..."
                            value={playerName}
                            onChange={(e) => setPlayerName(e.target.value)}
                            onKeyDown={(e) => e.key === 'Enter' && playNextUnplayedSet()}
                            style={{
                                width: 'auto',
                                padding: '20px 30px',
                                borderRadius: 10,
                                border: `1px solid ${LUXURY_THEME.border}`,
                                backgroundColor: 'rgba(0,0,0,0.45)',
                                color: LUXURY_THEME.text,
                                fontSize: 16,
                                marginTop: -2,
                                marginBottom: 12
                            }}
                        />
                        <div style={{ display: 'flex', gap: 12 }}>
                            <button
                                onClick={() => {
                                    if (!isPresenterMode()) return;
                                    setPlayerName('');
                                    playNextUnplayedSet();
                                }}
                                style={{ flex: 1, padding: '12px 14px', borderRadius: 10, background: 'linear-gradient(90deg,#ffd700,#ffb347)', border: 'none', cursor: playerName.trim() ? 'pointer' : 'not-allowed', fontWeight: 700 }}
                            >
                                Proceed to Next Game
                            </button>
                            <button
                                onClick={() => {
                                    if (!isPresenterMode()) return;
                                    setPlayerName('');
                                    playNextUnplayedSet();
                                }}
                                style={{ padding: '12px 14px', borderRadius: 10, background: 'rgba(255,255,255,0.03)', border: `1px solid ${LUXURY_THEME.border}` }}
                            >
                                Guest
                            </button>
                        </div>
                    </div>
                </div>
                <AnimatedBanner />
            </div>
        );
    }



    // Slideshow screen
    if (gameState === 'slideshow') {
        return (
            <div style={{ ...styles.container, padding: 0, background: '#000' }}>
                <div style={{ position: 'relative', width: '100vw', height: '100vh', display: 'flex', alignItems: 'center', justifyContent: 'center' }}>


                    {isPresenterMode() && (
                        <button
                            onClick={() => setGameState('registration')}
                            style={{
                                position: 'absolute',
                                top: '30px',
                                right: '30px',
                                zIndex: 10000,
                                padding: '14px 30px',
                                background: 'rgba(255,255,255,0.1)',
                                backdropFilter: 'blur(10px)',
                                border: `1px solid ${LUXURY_THEME.accent}`,
                                color: LUXURY_THEME.textGold,
                                borderRadius: '30px',
                                cursor: 'pointer',
                                fontWeight: 'bold'
                            }}
                        >
                            ✕ Exit Slideshow
                        </button>
                    )}



                    {slideshowImages.length > 0 && (
                        <img
                            src={slideshowImages[currentSlide].src}
                            alt="Slideshow"
                            style={{
                                maxWidth: '100%',
                                maxHeight: '100%',
                                objectFit: 'contain',
                                transition: 'opacity 0.5s ease-in-out'
                            }}
                        />
                    )}
                </div>

                <AnimatedBanner />
            </div>
        );
    }
    return null;
};

export default QuizIQGame;
