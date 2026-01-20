import React, { useEffect, useState } from 'react';
import { useApp } from '../../context/AppContext';
import { LLMService } from '../../services/llm';
import { StorageService } from '../../services/storage';
import { encryptEntry } from '../../services/encryption';
import type { DailyEntry } from '../../types';
import { LoadingSpinner } from '../common/LoadingSpinner';
import { RandomProfileQuestion } from './RandomProfileQuestion';
import { v4 as uuidv4 } from 'uuid';

export const DailyPractice: React.FC = () => {
    const { userProfile, googleId, isAuthenticated } = useApp();
    const [isLoading, setIsLoading] = useState(true);
    const [openingSentence, setOpeningSentence] = useState('');
    const [suggestions, setSuggestions] = useState<string[]>([]);
    const [entries, setEntries] = useState<string[]>(['', '', '']);
    const [isCompleted, setIsCompleted] = useState(false);
    const [affirmation, setAffirmation] = useState('');
    const [showRandomQuestion, setShowRandomQuestion] = useState(false);

    const isHebrew = userProfile?.language === 'hebrew';

    useEffect(() => {
        loadDailyContent();
    }, [userProfile]);

    const loadDailyContent = async () => {
        if (!userProfile) return;

        const today = new Date().toLocaleDateString('en-CA');
        const existingEntry = StorageService.getEntryByDate(today);

        if (existingEntry) {
            setOpeningSentence(existingEntry.openingSentence);
            setSuggestions(existingEntry.suggestions);
            setIsCompleted(true);
            const content = existingEntry.userContent.content as string;
            const parsedEntries = content.split('\n').filter(line => line.trim());
            setEntries(parsedEntries.length >= 3 ? parsedEntries : ['', '', '']);
            setIsLoading(false);
            return;
        }

        if (Math.random() < 0.3) {
            setShowRandomQuestion(true);
        }

        try {
            const [sentence, suggs] = await Promise.all([
                LLMService.generateOpeningSentence(userProfile, []),
                LLMService.generateSuggestions(userProfile, [])
            ]);
            setOpeningSentence(sentence);
            setSuggestions(suggs);
        } catch (e) {
            console.error(e);
            setOpeningSentence(isHebrew ? 'היום הוא הזדמנות חדשה להבחין בחסד.' : 'Today is a new opportunity to notice grace.');
            setSuggestions(isHebrew
                ? ['מים זורמים', 'כוס קפה או תה חמה', 'היכולת ללכת']
                : ['Running water', 'A warm cup of coffee', 'The ability to walk']);
        } finally {
            setIsLoading(false);
        }
    };

    const handleEntryChange = (index: number, value: string) => {
        const newEntries = [...entries];
        newEntries[index] = value;
        setEntries(newEntries);
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
        <>
            {showRandomQuestion && (
                <RandomProfileQuestion
                    onComplete={() => setShowRandomQuestion(false)}
                    onSkip={() => setShowRandomQuestion(false)}
                />
            )}

            <div className="animate-fadeIn pt-2 sm:pt-4">
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
                        <div key={index} className="input-card">
                            <input
                                type="text"
                                value={entry}
                                onChange={(e) => handleEntryChange(index, e.target.value)}
                                placeholder={suggestions[index] || (isHebrew ? `דבר ${index + 1}...` : `Thing ${index + 1}...`)}
                                dir={isHebrew ? 'rtl' : 'ltr'}
                            />
                        </div>
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
        </>
    );
};
