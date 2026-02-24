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
import { FluentIcon } from '../common/FluentIcon';

interface GradeResult {
    score: number;
    feedback: string;
    improvedVersion?: string;
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
            // Convert 0-3 score to 0-100%
            const percentScore = Math.round((result.score / 3) * 100);

            const newGrades = [...grades];
            newGrades[currentStep] = {
                score: percentScore,
                feedback: result.feedback,
                improvedVersion: result.improvedVersion
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
        const newStreak = {
            ...streak,
            currentStreak: streak.currentStreak + 1,
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
            <div className="flex flex-col items-center justify-center min-h-[50vh] sm:min-h-[60vh] text-center animate-fadeIn px-4">
                <div className="streak-pill mt-4 mb-4" style={{ display: 'flex', alignItems: 'center', gap: '8px', padding: '10px 20px' }}>
                    <FluentIcon name="Star" size={28} />
                    <span className="streak-number text-2xl font-bold font-sans">{StorageService.getStreak().currentStreak}</span>
                    <span className="streak-label text-xl font-bold font-sans">{isHebrew ? 'ימים' : 'days'}</span>
                </div>

                {/* Extra vertical spacing added here */}
                <div style={{ height: '32px' }}></div>

                <h2 className="title-main text-center mb-4 sm:mb-6 px-4" style={{ lineHeight: '1.4' }}>
                    {affirmation || (isHebrew ? 'כל הכבוד!' : 'Well done!')}
                </h2>
                <p className="subtitle mt-2">
                    {isHebrew ? 'נתראה מחר' : 'See you tomorrow'}
                </p>
            </div>
        );
    }

    const currentGrade = grades[currentStep];
    const isStepComplete = !!currentGrade; // Step is complete if it has a grade result
    const hasText = entries[currentStep].trim().length > 0;

    return (
        <div dir={isHebrew ? 'rtl' : 'ltr'} className="animate-fadeIn max-w-xl mx-auto">
            {/* Random Profile Question (30% chance) */}
            {showRandomQuestion && (
                <RandomProfileQuestion
                    onComplete={() => setShowRandomQuestion(false)}
                    onSkip={() => setShowRandomQuestion(false)}
                />
            )}



            <div className="pt-2 sm:pt-4 pb-24">
                {/* Progress Bar */}
                <ProgressBar
                    currentStep={currentStep}
                    grades={grades}
                />

                {/* Question Section */}
                <section className="text-center section-spacing mb-6">
                    <h1 className="title-main mb-2">
                        {isHebrew ? `רגע ${currentStep + 1}` : `Moment ${currentStep + 1}`}
                    </h1>
                </section>

                {/* Input Card */}
                <div className="animate-slideUp">
                    <GradedInput
                        index={currentStep}
                        value={entries[currentStep]}
                        onChange={handleEntryChange}
                        placeholder={isHebrew ? 'פרט/י כאן...' : 'Elaborate here...'}
                        exampleAnswer={suggestions[currentStep]}
                        gradeResult={currentGrade}
                        isLoading={isGrading}
                    />
                </div>

                {/* Action Button - Equal spacing matching input margin */}
                <div style={{ marginTop: '24px' }}>
                    {!isStepComplete ? (
                        <button
                            onClick={handleCheck}
                            disabled={!hasText || isGrading}
                            className={!hasText || isGrading ? '' : 'animate-pulseOnHover'}
                            style={{
                                width: '100%',
                                padding: '16px',
                                background: (!hasText || isGrading)
                                    ? 'rgba(255, 182, 193, 0.25)'  // Soft, cohesive disabled state instead of gray
                                    : 'linear-gradient(to right, #FFB6C1, #FF69B4)',
                                color: (!hasText || isGrading) ? '#d280a5' : 'black',
                                fontSize: '18px',
                                fontWeight: 700,
                                border: (!hasText || isGrading) ? '2px dashed rgba(255, 182, 193, 0.4)' : 'none',
                                borderRadius: '9999px',
                                cursor: (!hasText || isGrading) ? 'not-allowed' : 'pointer',
                                boxShadow: (!hasText || isGrading)
                                    ? 'none'
                                    : '0 4px 15px rgba(255, 105, 180, 0.4)',
                                transition: 'all 0.3s ease',
                                display: 'flex',
                                alignItems: 'center',
                                justifyContent: 'center',
                                gap: '12px'
                            }}
                        >
                            <span>{isGrading ? (isHebrew ? 'בודק...' : 'Checking...') : (isHebrew ? 'בדיקה' : 'Check')}</span>
                            <div className={`badge-icon ${isGrading ? 'badge-icon-loading' : 'badge-icon-check'} badge-unlocked`} style={{ transform: 'scale(0.4)', margin: '-20px', filter: (!hasText && !isGrading) ? 'grayscale(0.8) opacity(0.5)' : 'none' }}>
                                <FluentIcon name={isGrading ? "Loading" : "Check"} size={40} />
                            </div>
                        </button>
                    ) : (
                        <button
                            onClick={handleContinue}
                            style={{
                                width: '100%',
                                padding: '16px',
                                background: 'linear-gradient(to right, #FFB6C1, #FF69B4)',
                                color: 'black',
                                fontSize: '18px',
                                fontWeight: 700,
                                border: 'none',
                                borderRadius: '9999px',
                                cursor: 'pointer',
                                boxShadow: '0 4px 15px rgba(255, 105, 180, 0.4)',
                                display: 'flex',
                                alignItems: 'center',
                                justifyContent: 'center',
                                gap: '12px'
                            }}
                        >
                            <span>{currentStep < 2 ? (isHebrew ? 'המשך' : 'Continue') : (isHebrew ? 'סיים ושמור' : 'Finish & Save')}</span>
                            <div className="badge-icon badge-icon-continue badge-unlocked" style={{ transform: 'scale(0.4)', margin: '-20px' }}>
                                <FluentIcon name="Sparkles" size={40} />
                            </div>
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
