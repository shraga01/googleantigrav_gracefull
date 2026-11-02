import React, { useState, useEffect, useCallback } from 'react';
import { useApp } from '../../context/AppContext';
import { StorageService } from '../../services/storage';
import { FirestoreService } from '../../services/firestoreService';
import type { DailyEntry, GratitudeItem, GratitudeProtocolType } from '../../types';
import { LoadingSpinner } from '../common/LoadingSpinner';
import { ScientificFactBanner } from '../common/ScientificFactBanner';
import { getRandomScientificFact } from '../../services/scientificFacts';
import { ThreeGoodThingsForm } from './ThreeGoodThingsForm';
import { GratitudeLetterModal } from './GratitudeLetterModal';
import { MentalSubtractionModal } from './MentalSubtractionModal';
import { PastelCard } from '../common/PastelCard';
import { v4 as uuidv4 } from 'uuid';

export const DailyPractice: React.FC = () => {
    // -------------------------------------------------------------------------
    // 1. All useState Declarations (Strictly physical top)
    // -------------------------------------------------------------------------
    const { userProfile, googleId, isAuthenticated, refreshStreak } = useApp();
    const [isLoading, setIsLoading] = useState(true);
    const [isSaving, setIsSaving] = useState(false);
    const [isCompleted, setIsCompleted] = useState(false);
    const [activeProtocol, setActiveProtocol] = useState<GratitudeProtocolType>('three_good_things');
    const [currentStep, setCurrentStep] = useState(0);

    // Three Good Things structured items (with mandatory agency attribution)
    const [items, setItems] = useState<GratitudeItem[]>([
        { act: '', benefactor: '', benefit: '', agencyAttribution: '' },
        { act: '', benefactor: '', benefit: '', agencyAttribution: '' },
        { act: '', benefactor: '', benefit: '', agencyAttribution: '' },
    ]);

    // Modals
    const [showLetterModal, setShowLetterModal] = useState(false);
    const [showSubtractionModal, setShowSubtractionModal] = useState(false);
    const [subtractionReflection, setSubtractionReflection] = useState<string | undefined>(undefined);

    const [scientificFact, setScientificFact] = useState<{ statement: string; citation: string } | null>(null);

    const isHebrew = userProfile?.language === 'hebrew';

    // -------------------------------------------------------------------------
    // 2. All useCallback Declarations (Physically above useEffect)
    // -------------------------------------------------------------------------
    const setDailyStateFromEntry = useCallback((entry: DailyEntry) => {
        if (entry.items && entry.items.length === 3) {
            setItems(entry.items);
        }
        if (entry.mentalSubtractionReflection) {
            setSubtractionReflection(entry.mentalSubtractionReflection);
        }
        setIsCompleted(true);
    }, []);

    const loadDailyContent = useCallback(async () => {
        if (!userProfile) return;

        const today = new Date().toLocaleDateString('en-CA');
        setIsLoading(true);

        try {
            // Check Firestore first if authenticated
            if (isAuthenticated && googleId) {
                const firestoreEntry = await FirestoreService.getEntryByDate(googleId, today);
                if (firestoreEntry) {
                    setDailyStateFromEntry(firestoreEntry);
                    StorageService.saveEntry(firestoreEntry);
                    setIsLoading(false);
                    return;
                }
            }

            // Check local fallback
            const localEntry = StorageService.getEntryByDate(today);
            if (localEntry) {
                setDailyStateFromEntry(localEntry);
                setIsLoading(false);
                return;
            }

            // Load scientific fact
            const fact = getRandomScientificFact(isHebrew ? 'hebrew' : 'english');
            setScientificFact(fact);
        } catch (error) {
            console.error('Error loading daily practice:', error);
        } finally {
            setIsLoading(false);
        }
    }, [userProfile, isAuthenticated, googleId, isHebrew, setDailyStateFromEntry]);

    const handleItemChange = useCallback((index: number, updatedItem: GratitudeItem) => {
        setItems((prev) => {
            const next = [...prev];
            next[index] = updatedItem;
            return next;
        });
    }, []);

    const handleItemCompleted = useCallback((stepIndex: number) => {
        if (stepIndex < 2) {
            setCurrentStep((prev) => Math.min(prev + 1, 2));
        }
    }, []);

    const handleSaveEntry = useCallback(async () => {
        if (!userProfile) return;

        // Verify all 3 items have act, benefit, and mandatory agency attribution
        const isAllValid = items.every(
            (it) =>
                it.act.trim().length >= 4 &&
                it.benefit.trim().length >= 4 &&
                it.agencyAttribution.trim().length >= 4
        );

        if (!isAllValid) {
            alert(
                isHebrew
                    ? 'אנא וודא שכל 3 הרגעים כוללים פירוט קונקרטי, תועלת וסוכנות אישית.'
                    : 'Please ensure all 3 items contain concrete details, benefit, and agency attribution.'
            );
            return;
        }

        setIsSaving(true);
        const today = new Date().toLocaleDateString('en-CA');
        const currentStreakData = StorageService.getStreak();

        let newCurrentStreak = 1;
        const lastPracticeDate = currentStreakData.lastPracticeDate;

        if (lastPracticeDate) {
            const todayDate = new Date(today);
            const lastDate = new Date(lastPracticeDate);
            const daysDiff = Math.floor(
                (todayDate.getTime() - lastDate.getTime()) / (1000 * 60 * 60 * 24)
            );

            if (daysDiff === 1) {
                newCurrentStreak = currentStreakData.currentStreak + 1;
            } else if (daysDiff === 0) {
                newCurrentStreak = currentStreakData.currentStreak;
            } else {
                newCurrentStreak = 1;
            }
        }

        const updatedStreak = {
            ...currentStreakData,
            currentStreak: newCurrentStreak,
            longestStreak: Math.max(currentStreakData.longestStreak || 0, newCurrentStreak),
            totalDaysPracticed: currentStreakData.totalDaysPracticed + 1,
            lastPracticeDate: today,
        };

        const compiledContent = items
            .map(
                (it, i) =>
                    `[${i + 1}] ${it.act} (${it.benefactor || 'Self'}) -> ${it.benefit} | Agency: ${it.agencyAttribution}`
            )
            .join('\n');

        const newEntry: DailyEntry = {
            entryId: uuidv4(),
            userId: userProfile.userId,
            date: today,
            protocol: activeProtocol,
            openingSentence: isHebrew ? 'שלושה דברים טובים עם ייחוס סיבתי' : 'Three Good Things with Agency Attribution',
            suggestions: [],
            items,
            mentalSubtractionReflection: subtractionReflection,
            userContent: {
                type: 'text',
                content: compiledContent,
            },
            completedAt: Date.now(),
            streakDay: newCurrentStreak,
            qualityScore: 95,
        };

        try {
            StorageService.updateStreak(updatedStreak);
            StorageService.saveEntry(newEntry);

            if (isAuthenticated && googleId) {
                await FirestoreService.saveEntry(googleId, newEntry);
                await FirestoreService.updateStreak(googleId, updatedStreak);
                await refreshStreak();
            }

            setIsCompleted(true);
        } catch (error) {
            console.error('Failed to save daily entry:', error);
            alert(isHebrew ? 'שגיאה בשמירת התרגול' : 'Error saving practice');
        } finally {
            setIsSaving(false);
        }
    }, [userProfile, items, isHebrew, activeProtocol, subtractionReflection, isAuthenticated, googleId, refreshStreak]);

    // -------------------------------------------------------------------------
    // 3. All useEffect Declarations (Strictly physical bottom)
    // -------------------------------------------------------------------------
    useEffect(() => {
        void loadDailyContent();
    }, [loadDailyContent]);

    // -------------------------------------------------------------------------
    // Render States
    // -------------------------------------------------------------------------
    if (isLoading) {
        return <LoadingSpinner />;
    }

    if (isCompleted) {
        return (
            <div dir={isHebrew ? 'rtl' : 'ltr'} className="max-w-xl mx-auto px-4 py-8 animate-fadeIn text-center">
                <PastelCard
                    variant="sage"
                    title={isHebrew ? 'התרגול היומי הושלם בהצלחה' : 'Daily Practice Completed'}
                    subtitle={
                        isHebrew
                            ? 'חיזקת את מסלולי הוויסות העצביים והכרת התודה. נתראה מחר!'
                            : 'You have actively strengthened your neural pathways. See you tomorrow!'
                    }
                    badge={isHebrew ? 'תרגול בוצע' : 'Practiced'}
                    elevated
                >
                    <div className="py-6 space-y-4">
                        <div className="inline-flex items-center gap-2 px-5 py-2.5 rounded-full bg-emerald-100 text-emerald-900 border border-emerald-300 font-bold text-lg">
                            <span>🔥</span>
                            <span>{StorageService.getStreak().currentStreak}</span>
                            <span>{isHebrew ? 'ימי תרגול רצופים' : 'Days Streak'}</span>
                        </div>
                        <p className="text-sm text-neutral-600 max-w-md mx-auto leading-relaxed">
                            {isHebrew
                                ? 'מחקרים מצביעים כי תרגול "שלושה דברים טובים" הכולל סוכנות אישית מוריד את תסמיני השחיקה ב-22% ומשפר את איכות השינה כבר בשבועות הראשונים.'
                                : 'Studies show that Three Good Things with agency attribution decreases burnout symptoms by 22% and improves sleep depth within the first weeks.'}
                        </p>
                    </div>
                </PastelCard>
            </div>
        );
    }

    if (!userProfile) {
        return null;
    }

    return (
        <div dir={isHebrew ? 'rtl' : 'ltr'} className="w-full max-w-2xl mx-auto px-4 py-6 space-y-6 animate-fadeIn">
            {/* Protocol Selector Tabs */}
            <div className="flex items-center justify-center gap-2 pb-2 overflow-x-auto">
                <button
                    type="button"
                    onClick={() => setActiveProtocol('three_good_things')}
                    className={`px-4 py-2 rounded-xl text-xs sm:text-sm font-bold transition-all ${
                        activeProtocol === 'three_good_things'
                            ? 'bg-amber-100 text-amber-900 border border-amber-300 shadow-sm'
                            : 'bg-white/80 text-neutral-600 hover:bg-neutral-100'
                    }`}
                >
                    ✨ {isHebrew ? 'שלושה דברים טובים' : 'Three Good Things'}
                </button>
                <button
                    type="button"
                    onClick={() => setShowLetterModal(true)}
                    className="px-4 py-2 rounded-xl text-xs sm:text-sm font-bold bg-white/80 text-neutral-600 hover:bg-purple-50 hover:text-purple-800 transition-all border border-transparent hover:border-purple-200"
                >
                    ✉️ {isHebrew ? 'מכתב הכרת תודה' : 'Gratitude Letter'}
                </button>
                <button
                    type="button"
                    onClick={() => setShowSubtractionModal(true)}
                    className="px-4 py-2 rounded-xl text-xs sm:text-sm font-bold bg-white/80 text-neutral-600 hover:bg-sky-50 hover:text-sky-800 transition-all border border-transparent hover:border-sky-200"
                >
                    🌌 {isHebrew ? 'חיסור מנטלי' : 'Mental Subtraction'}
                </button>
            </div>

            {/* Stepper Navigation */}
            <div className="flex items-center justify-between px-2">
                <span className="text-xs font-bold text-neutral-500 uppercase tracking-wider">
                    {isHebrew ? `רגע ${currentStep + 1} מתוך 3` : `Step ${currentStep + 1} of 3`}
                </span>
                <div className="flex gap-2">
                    {[0, 1, 2].map((idx) => (
                        <button
                            key={idx}
                            type="button"
                            onClick={() => setCurrentStep(idx)}
                            className={`w-8 h-8 rounded-full text-xs font-bold transition-all ${
                                currentStep === idx
                                    ? 'bg-neutral-800 text-white shadow-md scale-105'
                                    : items[idx].act.trim().length > 0
                                    ? 'bg-emerald-100 text-emerald-800 border border-emerald-300'
                                    : 'bg-neutral-200 text-neutral-500'
                            }`}
                        >
                            {idx + 1}
                        </button>
                    ))}
                </div>
            </div>

            {/* Main Structured Form */}
            <ThreeGoodThingsForm
                stepIndex={currentStep}
                userProfile={userProfile}
                item={items[currentStep]}
                onChange={(updated) => handleItemChange(currentStep, updated)}
                onCompleted={() => handleItemCompleted(currentStep)}
                isHebrew={isHebrew}
            />

            {/* Step Controls */}
            <div className="flex items-center justify-between gap-4 pt-2">
                <button
                    type="button"
                    onClick={() => setCurrentStep((prev) => Math.max(prev - 1, 0))}
                    disabled={currentStep === 0}
                    className="px-4 py-2 text-xs font-bold text-neutral-600 hover:text-neutral-900 disabled:opacity-30 rounded-xl"
                >
                    {isHebrew ? '← הקודם' : '← Previous'}
                </button>

                {currentStep < 2 ? (
                    <button
                        type="button"
                        onClick={() => setCurrentStep((prev) => Math.min(prev + 1, 2))}
                        className="px-6 py-2.5 text-xs sm:text-sm font-bold bg-neutral-800 hover:bg-neutral-900 text-white rounded-xl shadow-md transition-all"
                    >
                        {isHebrew ? 'הבא →' : 'Next →'}
                    </button>
                ) : (
                    <button
                        type="button"
                        onClick={handleSaveEntry}
                        disabled={isSaving}
                        className="px-8 py-3 text-xs sm:text-sm font-black bg-emerald-700 hover:bg-emerald-800 text-white rounded-xl shadow-lg transition-all active:scale-[0.98] disabled:opacity-50"
                    >
                        {isSaving
                            ? isHebrew ? 'שומר ב-Firestore...' : 'Saving...'
                            : isHebrew ? '✓ סיים תרגול יומי' : '✓ Complete Daily Practice'}
                    </button>
                )}
            </div>

            {/* Scientific Fact Banner */}
            {scientificFact && (
                <div className="pt-4">
                    <ScientificFactBanner
                        statement={scientificFact.statement}
                        citation={scientificFact.citation}
                        isHebrew={isHebrew}
                    />
                </div>
            )}

            {/* Modals for Complementary Protocols */}
            {showLetterModal && (
                <GratitudeLetterModal
                    userProfile={userProfile}
                    onClose={() => setShowLetterModal(false)}
                    onSaved={() => setShowLetterModal(false)}
                    isHebrew={isHebrew}
                />
            )}

            {showSubtractionModal && (
                <MentalSubtractionModal
                    userProfile={userProfile}
                    onClose={() => setShowSubtractionModal(false)}
                    onCompleted={(reflection) => setSubtractionReflection(reflection)}
                    isHebrew={isHebrew}
                />
            )}
        </div>
    );
};
