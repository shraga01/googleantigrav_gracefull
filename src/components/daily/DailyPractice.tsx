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
import { ScientificFactBanner } from '../common/ScientificFactBanner';
import { getRandomScientificFact } from '../../services/scientificFacts';
import { v4 as uuidv4 } from 'uuid';

export const DailyPractice: React.FC = () => {
    const { userProfile, googleId, isAuthenticated, refreshStreak } = useApp();
    const [isLoading, setIsLoading] = useState(true);
    const [openingSentence, setOpeningSentence] = useState('');
    const [suggestions, setSuggestions] = useState<string[]>([]);
    const [entries, setEntries] = useState<string[]>(['', '', '']);
    const [isCompleted, setIsCompleted] = useState(false);
    const [affirmation, setAffirmation] = useState('');
    const [showRandomQuestion, setShowRandomQuestion] = useState(false);
    const [scientificFact, setScientificFact] = useState<{ statement: string; citation: string } | null>(null);
    const [showFactBanner, setShowFactBanner] = useState(false);

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

            // Load scientific fact (only if not dismissed today)
            const today = new Date().toLocaleDateString('en-CA');
            const dismissedFactDate = sessionStorage.getItem('scientific-fact-dismissed');
            if (dismissedFactDate !== today) {
                const fact = getRandomScientificFact(isHebrew ? 'hebrew' : 'english');
                setScientificFact(fact);
                setShowFactBanner(true);
            }

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

    const handleEntryChange = (index: number, value: string) => {
        const newEntries = [...entries];
        newEntries[index] = value;
        setEntries(newEntries);
    };

    const handleDismissFactBanner = () => {
        const today = new Date().toLocaleDateString('en-CA');
        sessionStorage.setItem('scientific-fact-dismissed', today);
        setShowFactBanner(false);
    };

    const handleSave = async () => {
        if (!userProfile) return;

        const filledEntries = entries.filter(e => e.trim().length > 0);
        if (filledEntries.length < 3) {
            alert(isHebrew ? 'אנא כתוב לפחות 3 דברים' : 'Please write at least 3 things');
            return;
        }

        let contentToSave = entries.join('\n');

        if (isAuthenticated && googleId) {
            try {
                contentToSave = await encryptEntry(contentToSave, googleId);
                console.log('✅ Entry encrypted before saving');
            } catch (error) {
                console.error('❌ Encryption failed:', error);
                alert('Failed to encrypt entry. Please try again.');
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
            ApiService.saveEntry(newEntry).then(() => {
                refreshStreak();
            }).catch(err => {
                console.error('Failed to sync entry to server:', err);
            });
        }

        const affirm = await LLMService.generateAffirmation(userProfile);
        setAffirmation(affirm);
        setIsCompleted(true);
    };

    if (isLoading) {
        return <LoadingSpinner />;
    }

    if (isCompleted) {
        return (
            <div className="flex flex-col items-center justify-center min-h-[50vh] sm:min-h-[60vh] text-center animate-fadeIn">
                <div className="text-5xl sm:text-6xl mb-4">🎉</div>
                <div className="streak-pill mb-4 sm:mb-6" style={{ display: 'flex', alignItems: 'center', gap: '6px', padding: '8px 16px' }}>
                    <span className="text-xl sm:text-2xl">✨</span>
                    <span className="streak-number">{StorageService.getStreak().currentStreak}</span>
                    <span className="streak-label">{isHebrew ? 'ימים' : 'days'}</span>
                </div>
                <h2 className="title-main text-center mb-3 sm:mb-4 px-4">
                    {affirmation || (isHebrew ? 'כל הכבוד!' : 'Well done!')}
                </h2>
                <p className="subtitle">
                    {isHebrew ? 'נתראה מחר' : 'See you tomorrow'}
                </p>
            </div>
        );
    }

    return (
        <div dir={isHebrew ? 'rtl' : 'ltr'} className="animate-fadeIn">
            {/* Random Profile Question (30% chance) */}
            {showRandomQuestion && (
                <RandomProfileQuestion
                    onComplete={() => setShowRandomQuestion(false)}
                    onSkip={() => setShowRandomQuestion(false)}
                />
            )}

            {/* Scientific Fact Banner */}
            {showFactBanner && scientificFact && (
                <ScientificFactBanner
                    statement={scientificFact.statement}
                    citation={scientificFact.citation}
                    onDismiss={handleDismissFactBanner}
                    isHebrew={isHebrew}
                />
            )}

            <div className="pt-2 sm:pt-4">
                {/* Headlines */}
                <section className="text-center section-spacing">
                    <h1 className="title-main mb-3 sm:mb-4">
                        {openingSentence}
                    </h1>
                    <p className="subtitle" style={{ marginBottom: '8px' }}>
                        {isHebrew ? 'כתוב שלושה דברים ספציפיים להעריך:' : 'Write three SPECIFIC things to appreciate:'}
                    </p>
                    {/* Specificity hint */}
                    <p style={{
                        fontSize: '13px',
                        color: '#6B7280',
                        maxWidth: '300px',
                        margin: '0 auto',
                        lineHeight: '1.4'
                    }}>
                        {isHebrew
                            ? '💡 הנוסחה: מעשה קונקרטי + אדם + איך זה הקל עליך'
                            : '💡 Formula: Concrete act + Person + How it helped you'}
                    </p>
                </section>

                {/* Input Cards */}
                <section className="flex flex-col content-spacing" style={{ gap: 'clamp(0.75rem, 2vw, 1rem)' }}>
                    {entries.map((entry, index) => (
                        <GradedInput
                            key={index}
                            index={index}
                            value={entry}
                            onChange={(value) => handleEntryChange(index, value)}
                            placeholder={suggestions[index] || (isHebrew ? `דבר ${index + 1}...` : `Thing ${index + 1}...`)}
                        />
                    ))}
                </section>

                {/* Save Button */}
                <section className="mt-8 sm:mt-12 mb-6 sm:mb-10">
                    <button
                        onClick={handleSave}
                        className="save-btn"
                        disabled={entries.filter(e => e.trim()).length < 3}
                    >
                        {isHebrew ? 'שמור' : 'Save'}
                    </button>
                </section>
            </div>
        </div>
    );
};
