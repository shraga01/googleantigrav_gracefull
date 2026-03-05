import React, { useEffect, useState } from 'react';
import { useApp } from '../../context/AppContext';
import { LLMService } from '../../services/llm';
import { StorageService } from '../../services/storage';
import { encryptEntry } from '../../services/encryption';
import type { DailyEntry } from '../../types';
import { ApiService } from '../../services/api';
import { LoadingSpinner } from '../common/LoadingSpinner';
import { RandomProfileQuestion } from './RandomProfileQuestion';
import { GradedInput } from './GradedInput';
import { ProgressBar } from './ProgressBar';
import { ScientificFactBanner } from '../common/ScientificFactBanner';
import { getRandomScientificFact } from '../../services/scientificFacts';
import { v4 as uuidv4 } from 'uuid';
import '../../styles/badges.css';
import { HomeScreen } from './HomeScreen';

interface GradeResult {
    score: number;
    status: string;
    feedback: string;
    met_criteria: string[];
    missing_criteria: string[];
    coaching_question: string | null;
}

export const DailyPractice: React.FC = () => {
    const { userProfile, googleId, isAuthenticated, refreshStreak, setNewlyUnlockedBadges } = useApp();
    const [isLoading, setIsLoading] = useState(true);
    const [openingSentence, setOpeningSentence] = useState('');
    const [suggestions, setSuggestions] = useState<string[]>([]);
    const [entries, setEntries] = useState<string[]>(['', '', '']);
    const [isCompleted, setIsCompleted] = useState(false);
    const [affirmation, setAffirmation] = useState('');
    const [showRandomQuestion, setShowRandomQuestion] = useState(false);
    const [scientificFact, setScientificFact] = useState<{ statement: string; citation: string } | null>(null);

    // New State for Sequential Flow
    const [currentStep, setCurrentStep] = useState(0);
    const [grades, setGrades] = useState<(GradeResult | null)[]>([null, null, null]);
    const [isGrading, setIsGrading] = useState(false);
    const [hasStarted, setHasStarted] = useState(false);

    const isHebrew = userProfile?.language === 'hebrew';

    useEffect(() => {
        loadDailyContent();
    }, [userProfile]);

    const loadDailyContent = async () => {
        if (!userProfile) return;

        const today = new Date().toLocaleDateString('en-CA');
        const existingEntry = StorageService.getEntryByDate(today);

        // Check local storage first
        if (existingEntry) {
            setDailyStateFromEntry(existingEntry);
            setIsLoading(false);
            return;
        }

        // If authenticated, check server state
        if (isAuthenticated) {
            try {
                const serverEntry = await ApiService.getTodayEntry();
                if (serverEntry) {
                    console.log('✅ Found existing entry on server, syncing...');
                    StorageService.saveEntry(serverEntry);
                    setDailyStateFromEntry(serverEntry);
                    setIsLoading(false);
                    return;
                }
            } catch (err) {
                console.warn('Failed to sync with server:', err);
            }
        }

        if (Math.random() < 0.3) {
            setShowRandomQuestion(true);
        }

        try {
            // Simple personalized greeting (no AI needed)
            const userName = userProfile.name || (isHebrew ? 'חבר/ה' : 'Friend');
            const greeting = isHebrew
                ? `שלום ${userName}, בואו נהרהר בשלושה רגעים ספציפיים מהיום שהביאו לך קלות או שמחה. מומלץ מאוד לתרגל בערב.`
                : `Hello ${userName}, let's reflect on three specific moments from today that brought ease or joy. It is highly recommended that you practice in the evening.`;
            setOpeningSentence(greeting);

            // Load scientific fact
            const fact = getRandomScientificFact(isHebrew ? 'hebrew' : 'english');
            setScientificFact(fact);

            // Still get AI suggestions
            const suggs = await LLMService.generateSuggestions(userProfile, []);
            setSuggestions(suggs);
        } catch (e) {
            console.error(e);
            const userName = userProfile.name || (isHebrew ? 'חבר/ה' : 'Friend');
            setOpeningSentence(isHebrew
                ? `שלום ${userName}, בואו נהרהר בשלושה רגעים ספציפיים מהיום.`
                : `Hello ${userName}, let's reflect on three specific moments from today.`);
            setSuggestions(isHebrew
                ? ['מים זורמים', 'כוס קפה או תה חמה', 'היכולת ללכת']
                : ['Running water', 'A warm cup of coffee', 'The ability to walk']);
        } finally {
            setIsLoading(false);
        }
    };

    const setDailyStateFromEntry = (entry: DailyEntry) => {
        setOpeningSentence(entry.openingSentence);
        setSuggestions(entry.suggestions);
        setIsCompleted(true);
        const content = entry.userContent.content as string;
        const parsedEntries = content.split('\n').filter(line => line.trim());
        setEntries(parsedEntries.length >= 3 ? parsedEntries : ['', '', '']);
    };

    const handleEntryChange = (value: string) => {
        const newEntries = [...entries];
        newEntries[currentStep] = value;
        setEntries(newEntries);

        // Clear grade if user edits after grading (requires re-check)
        // Only if currently graded
        if (grades[currentStep]) {
            const newGrades = [...grades];
            newGrades[currentStep] = null;
            setGrades(newGrades);
        }
    };

    const handleCheck = async () => {
        const currentText = entries[currentStep];
        if (!currentText.trim() || !userProfile) return;

        setIsGrading(true);
        try {
            const result = await LLMService.gradeEntry(currentText, userProfile);
            // Convert 0-5 score to 0-100%
            const percentScore = Math.round((result.score / 5) * 100);

            const newGrades = [...grades];
            newGrades[currentStep] = {
                score: percentScore,
                status: result.status,
                feedback: result.feedback,
                met_criteria: result.met_criteria || [],
                missing_criteria: result.missing_criteria || [],
                coaching_question: result.coaching_question || null
            };
            setGrades(newGrades);
        } catch (error) {
            console.error('Grading failed:', error);
            alert(isHebrew ? 'שגיאה בבדיקה, אנא נסה שוב' : 'Error checking entry, please try again');
        } finally {
            setIsGrading(false);
        }
    };

    const handleContinue = () => {
        if (currentStep < 2) {
            setCurrentStep(currentStep + 1);
        } else {
            handleSave();
        }
    };

    const handleSave = async () => {
        if (!userProfile) return;

        const filledEntries = entries.filter(e => e.trim().length > 0);
        if (filledEntries.length < 3) {
            // Should not happen in new flow, but safe guard
            alert(isHebrew ? 'אנא כתוב לפחות 3 דברים' : 'Please write at least 3 things');
            return;
        }

        let contentToSave = entries.join('\n');
        setIsLoading(true); // Re-use loading state for save

        if (isAuthenticated && googleId) {
            try {
                contentToSave = await encryptEntry(contentToSave, googleId);
                console.log('✅ Entry encrypted before saving');
            } catch (error) {
                console.error('❌ Encryption failed:', error);
                alert('Failed to encrypt entry. Please try again.');
                setIsLoading(false);
                return;
            }
        }

        const today = new Date().toLocaleDateString('en-CA');
        const streak = StorageService.getStreak();

        // Calculate new streak properly based on date diff
        let newCurrentStreak = 1;
        const lastPracticeDate = streak.lastPracticeDate;

        if (lastPracticeDate) {
            const todayDate = new Date(today);
            const lastDate = new Date(lastPracticeDate);
            const daysDiff = Math.floor((todayDate.getTime() - lastDate.getTime()) / (1000 * 60 * 60 * 24));

            if (daysDiff === 1) {
                newCurrentStreak = streak.currentStreak + 1;
            } else if (daysDiff === 0) {
                newCurrentStreak = streak.currentStreak; // Already practiced today
            } else {
                newCurrentStreak = 1; // Gap larger than 1 day
            }
        }

        const newStreak = {
            ...streak,
            currentStreak: newCurrentStreak,
            longestStreak: Math.max(streak.longestStreak || 0, newCurrentStreak),
            totalDaysPracticed: streak.totalDaysPracticed + 1,
            lastPracticeDate: today
        };
        StorageService.updateStreak(newStreak);

        const newEntry: DailyEntry = {
            entryId: uuidv4(),
            date: today,
            openingSentence,
            suggestions,
            userContent: {
                type: 'text',
                content: contentToSave,
                duration: 0
            },
            completedAt: Date.now(),
            streakDay: newStreak.currentStreak
        };
        StorageService.saveEntry(newEntry);

        // Sync to server if authenticated
        if (isAuthenticated) {
            ApiService.saveEntry(newEntry).then((res) => {
                refreshStreak();
                // Check if any badges were unlocked during this save
                if (res.newBadges && res.newBadges.length > 0) {
                    setNewlyUnlockedBadges(res.newBadges);
                }
            }).catch(err => {
                console.error('Failed to sync entry to server:', err);
            });
        }

        const affirm = await LLMService.generateAffirmation(userProfile);
        setAffirmation(affirm);
        setIsCompleted(true);
        setIsLoading(false);
    };

    if (isLoading) {
        return <LoadingSpinner />;
    }

    if (isCompleted) {
        return (
            <div className="flex flex-col items-center justify-center w-full h-full text-center animate-fadeIn px-4 z-10 relative">

                <div className="glass-card p-6 sm:p-10 rounded-[2rem] flex flex-col items-center shadow-2xl">
                    <div className="mb-4 flex items-center gap-2 px-5 py-2.5 rounded-full bg-orange-400/20 border border-orange-400/30">
                        <span className="material-symbols-outlined text-orange-400 text-3xl" style={{ fontVariationSettings: "'FILL' 1" }}>star</span>
                        <span className="text-white text-2xl font-black">{StorageService.getStreak().currentStreak}</span>
                        <span className="text-white/90 text-xl font-bold">{isHebrew ? 'ימים' : 'days'}</span>
                    </div>

                    <h2 className="text-white text-2xl sm:text-3xl font-black text-center mb-4 text-glow" style={{ lineHeight: '1.4' }}>
                        {affirmation || (isHebrew ? 'כל הכבוד!' : 'Well done!')}
                    </h2>
                    <p className="text-white/80 font-medium text-lg">
                        {isHebrew ? 'נתראה מחר' : 'See you tomorrow'}
                    </p>
                </div>
            </div>
        );
    }

    if (!hasStarted) {
        return (
            <>
                <div className="fixed inset-0 w-full h-full mesh-gradient pointer-events-none" style={{ zIndex: -1 }}></div>
                <HomeScreen onStartPractice={() => setHasStarted(true)} />
            </>
        );
    }

    const currentGrade = grades[currentStep];
    const isStepComplete = !!currentGrade; // Step is complete if it has a grade result
    const hasText = entries[currentStep].trim().length > 0;

    return (
        <div dir={isHebrew ? 'rtl' : 'ltr'} className="animate-fadeIn w-full max-w-xl mx-auto px-4 relative z-10 flex flex-col items-center h-full pt-4">

            {/* Random Profile Question (30% chance) */}
            {showRandomQuestion && (
                <div className="mb-6">
                    <RandomProfileQuestion
                        onComplete={() => setShowRandomQuestion(false)}
                        onSkip={() => setShowRandomQuestion(false)}
                    />
                </div>
            )}

            <div className="w-full">
                {/* The Appreciation Formula Header */}
                <div className="mb-6 text-center animate-slideDown">
                    <p className="text-white/90 text-[11px] sm:text-xs font-bold tracking-widest uppercase mb-3 text-glow">
                        {isHebrew ? 'נוסחת ההודיה' : 'The Appreciation Formula'}
                    </p>
                    <div className="text-white font-semibold tracking-wide glass-card px-4 sm:px-6 py-2.5 sm:py-3 rounded-full inline-block shadow-lg text-xs sm:text-sm leading-snug">
                        {isHebrew
                            ? <React.Fragment>מעשה ספציפי <span className="text-pink-400 font-bold mx-0.5 sm:mx-1">+</span> אדם <span className="text-pink-400 font-bold mx-0.5 sm:mx-1">+</span> איך זה עזר לך</React.Fragment>
                            : <React.Fragment>Concrete act <span className="text-pink-400 font-bold mx-0.5 sm:mx-1">+</span> Person <span className="text-pink-400 font-bold mx-0.5 sm:mx-1">+</span> How it helped</React.Fragment>
                        }
                    </div>
                </div>

                {/* Progress Bar styled closer to theme */}
                <div className="mb-4 opacity-80 backdrop-blur-sm rounded-full bg-white/10 p-2">
                    <ProgressBar
                        currentStep={currentStep}
                        grades={grades}
                    />
                </div>

                {/* Input Card */}
                <div className="animate-slideUp">
                    <GradedInput
                        index={currentStep}
                        value={entries[currentStep]}
                        onChange={handleEntryChange}
                        placeholder={isHebrew ? `רגע ${currentStep + 1} - פרט/י כאן...` : `Moment ${currentStep + 1} - Elaborate here...`}
                        exampleAnswer={suggestions[currentStep] ? (isHebrew ? `רגע ${currentStep + 1} - ${suggestions[currentStep]}` : `Moment ${currentStep + 1} - ${suggestions[currentStep]}`) : undefined}
                        gradeResult={currentGrade}
                        isLoading={isGrading}
                    />
                </div>

                {/* Action Button */}
                <div className="mt-8 w-full max-w-md mx-auto">
                    {!isStepComplete ? (
                        <button
                            onClick={handleCheck}
                            disabled={!hasText || isGrading}
                            className={`w-full h-16 rounded-full glass-card text-white text-xl font-black tracking-tight transition-all duration-300 flex items-center justify-center gap-2 ${!hasText || isGrading
                                ? 'opacity-50 cursor-not-allowed border-white/20 shadow-none'
                                : 'glass-button-glow hover:scale-[1.02] border-white/40 shadow-2xl'
                                }`}
                        >
                            <span className={`material-symbols-outlined text-2xl ${isGrading ? 'animate-spin' : ''}`} style={{ fontVariationSettings: "'FILL' 1" }}>
                                {isGrading ? 'autorenew' : 'check_circle'}
                            </span>
                            {isGrading ? (isHebrew ? 'בודק...' : 'Checking...') : (isHebrew ? 'בדיקה' : 'Check')}
                        </button>
                    ) : (
                        <button
                            onClick={handleContinue}
                            className="w-full h-16 rounded-full glass-card text-white text-xl font-black tracking-tight glass-button-glow hover:scale-[1.02] transition-all duration-300 shadow-2xl flex items-center justify-center gap-2 border-white/40"
                        >
                            <span className="material-symbols-outlined text-2xl" style={{ fontVariationSettings: "'FILL' 1" }}>
                                {currentStep < 2 ? 'arrow_forward' : 'done_all'}
                            </span>
                            {currentStep < 2 ? (isHebrew ? 'המשך' : 'Continue') : (isHebrew ? 'סיים ושמור' : 'Finish & Save')}
                        </button>
                    )}
                </div>

                {/* Scientific Fact Banner - Exact equal spacing as above */}
                {scientificFact && (
                    <div style={{ marginTop: '24px' }}>
                        <ScientificFactBanner
                            statement={scientificFact.statement}
                            citation={scientificFact.citation}
                            isHebrew={isHebrew}
                        />
                    </div>
                )}
            </div>
        </div>
    );
};
