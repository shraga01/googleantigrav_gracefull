import React, { useState, useEffect, useCallback } from 'react';
import { useApp } from '../../context/AppContext';
import { StorageService } from '../../services/storage';
import { FirestoreService } from '../../services/firestoreService';
import type {
    DailyEntry,
    ThreeGoodThingsItem,
    GratitudeProtocolType,
    Locale,
    EmpiricalHistoricalContext,
} from '../../types';
import { LoadingSpinner } from '../common/LoadingSpinner';
import { ScientificFactBanner } from '../common/ScientificFactBanner';
import { getRandomScientificFact } from '../../services/scientificFacts';
import { ThreeGoodThingsForm } from './ThreeGoodThingsForm';
import { DosingScheduleBadge } from '../clinical/DosingScheduleBadge';
import { PastelCard } from '../common/PastelCard';
import { getDictionary } from '../../locales';
import { v4 as uuidv4 } from 'uuid';

// Lazy-loaded clinical modals for code-splitting and bundle optimization
const GratitudeLetterModal = React.lazy(() =>
    import('./GratitudeLetterModal').then((m) => ({ default: m.GratitudeLetterModal }))
);
const MentalSubtractionModal = React.lazy(() =>
    import('./MentalSubtractionModal').then((m) => ({ default: m.MentalSubtractionModal }))
);
const GQ6AssessmentModal = React.lazy(() =>
    import('../clinical/GQ6AssessmentModal').then((m) => ({ default: m.GQ6AssessmentModal }))
);
const VirtualGratitudeVisitModal = React.lazy(() =>
    import('../clinical/VirtualGratitudeVisitModal').then((m) => ({ default: m.VirtualGratitudeVisitModal }))
);
const HubermanRecallModal = React.lazy(() =>
    import('../clinical/HubermanRecallModal').then((m) => ({ default: m.HubermanRecallModal }))
);

export const DailyPractice: React.FC = () => {
    // -------------------------------------------------------------------------
    // 1. All useState Declarations (Strictly physical top - TDZ Prevention)
    // -------------------------------------------------------------------------
    const { userProfile, googleId, isAuthenticated, refreshStreak } = useApp();
    const [isLoading, setIsLoading] = useState(true);
    const [isSaving, setIsSaving] = useState(false);
    const [isCompleted, setIsCompleted] = useState(false);
    const [activeProtocol, setActiveProtocol] = useState<GratitudeProtocolType>('three_good_things');
    const [currentStep, setCurrentStep] = useState(0);

    // Empirical historical context loaded directly from Firestore
    const [empiricalContext, setEmpiricalContext] = useState<EmpiricalHistoricalContext | null>(null);

    // Three Good Things structured items (with mandatory causal/agency attribution & 1-7 affect rating)
    const [items, setItems] = useState<ThreeGoodThingsItem[]>([
        { act: '', benefactor: '', benefit: '', causalReflection: '', affectRating: 5 },
        { act: '', benefactor: '', benefit: '', causalReflection: '', affectRating: 5 },
        { act: '', benefactor: '', benefit: '', causalReflection: '', affectRating: 5 },
    ]);

    // Modals
    const [showLetterModal, setShowLetterModal] = useState(false);
    const [showVirtualVisitModal, setShowVirtualVisitModal] = useState(false);
    const [showGQ6Modal, setShowGQ6Modal] = useState(false);
    const [showHubermanModal, setShowHubermanModal] = useState(false);
    const [showSubtractionModal, setShowSubtractionModal] = useState(false);
    const [subtractionReflection, setSubtractionReflection] = useState<string | undefined>(undefined);

    const [scientificFact, setScientificFact] = useState<{ statement: string; citation: string } | null>(null);

    const locale: Locale = userProfile?.locale || (userProfile?.language === 'hebrew' ? 'he' : 'en');
    const t = getDictionary(locale);

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
            // Load empirical Firestore historical context
            if (isAuthenticated && googleId) {
                try {
                    const ctx = await FirestoreService.getEmpiricalHistoricalContext(googleId);
                    setEmpiricalContext(ctx);
                } catch (ctxError) {
                    console.warn('Failed to fetch empirical context from Firestore:', ctxError);
                }

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
            const fact = getRandomScientificFact(locale === 'he' ? 'hebrew' : 'english');
            setScientificFact(fact);
        } catch (error) {
            console.error('Error loading daily practice:', error);
        } finally {
            setIsLoading(false);
        }
    }, [userProfile, isAuthenticated, googleId, locale, setDailyStateFromEntry]);

    const handleItemChange = useCallback((index: number, updatedItem: ThreeGoodThingsItem) => {
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

        // Verify all 3 items have act, benefit, and mandatory causal reflection (agency attribution)
        const isAllValid = items.every(
            (it) =>
                it.act.trim().length >= 4 &&
                it.benefit.trim().length >= 4 &&
                it.causalReflection.trim().length >= 4
        );

        if (!isAllValid) {
            alert(
                locale === 'he'
                    ? 'אנא וודא שכל 3 הרגעים כוללים פירוט קונקרטי, תועלת וסוכנות אישית (ייחוס סיבתי).'
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
                    `[${i + 1}] ${it.act} (${it.benefactor || 'Self'}) -> ${it.benefit} | Causal Agency: ${it.causalReflection} (Affect: ${it.affectRating}/7)`
            )
            .join('\n');

        const newEntry: DailyEntry = {
            entryId: uuidv4(),
            userId: userProfile.userId,
            date: today,
            protocol: activeProtocol,
            openingSentence: locale === 'he' ? 'שלושה דברים טובים עם ייחוס סיבתי' : 'Three Good Things with Causal Attribution',
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
            alert(locale === 'he' ? 'שגיאה בשמירת התרגול' : 'Error saving practice');
        } finally {
            setIsSaving(false);
        }
    }, [userProfile, items, locale, activeProtocol, subtractionReflection, isAuthenticated, googleId, refreshStreak]);

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

    if (!userProfile) {
        return null;
    }

    if (isCompleted) {
        return (
            <div dir={locale === 'he' ? 'rtl' : 'ltr'} className="max-w-xl mx-auto px-4 py-8 animate-fadeIn text-center">
                <PastelCard
                    variant="sage"
                    title={t.common.wellDone}
                    subtitle={t.common.seeYouTomorrow}
                    badge={t.common.verified}
                    elevated
                >
                    <div className="py-6 space-y-4">
                        <div className="inline-flex items-center gap-2 px-5 py-2.5 rounded-full bg-emerald-100 text-emerald-900 border border-emerald-300 font-bold text-lg">
                            <span>🔥</span>
                            <span>{t.common.daysStreak}</span>
                        </div>
                        <p className="text-sm text-neutral-600 max-w-sm mx-auto">
                            {locale === 'he'
                                ? 'התרגול היומי הושלם בהצלחה. המוח שלך חיזק את מסלולי ההערכה והסוכנות האישית.'
                                : 'Daily practice complete. Your medial prefrontal cortex has reinforced neural pathways of appreciation and agency.'}
                        </p>
                    </div>
                </PastelCard>
            </div>
        );
    }

    return (
        <div dir={locale === 'he' ? 'rtl' : 'ltr'} className="max-w-2xl mx-auto px-4 py-6 space-y-6 animate-fadeIn pb-24">
            {/* Header & Neuroscience Dosing Badge */}
            <div className="flex flex-col sm:flex-row sm:items-center sm:justify-between gap-4 pb-2 border-b border-black/5">
                <div>
                    <h1 className="text-2xl font-black text-neutral-900 tracking-tight">
                        {t.common.appName}
                    </h1>
                    <p className="text-xs text-neutral-500 font-medium mt-0.5">
                        {t.common.tagline}
                    </p>
                </div>
                <DosingScheduleBadge dosingSchedule={userProfile.dosingSchedule} locale={locale} />
            </div>

            {/* Protocol Switcher Pills */}
            <div className="flex items-center gap-2 overflow-x-auto no-scrollbar py-1">
                <button
                    type="button"
                    onClick={() => setActiveProtocol('three_good_things')}
                    className={`px-3.5 py-1.5 rounded-full text-xs font-bold transition-all shrink-0 ${
                        activeProtocol === 'three_good_things'
                            ? 'bg-neutral-900 text-white shadow-sm'
                            : 'bg-neutral-100 hover:bg-neutral-200 text-neutral-700'
                    }`}
                >
                    {t.nav.daily} (3GT)
                </button>

                <button
                    type="button"
                    onClick={() => setShowGQ6Modal(true)}
                    className="px-3.5 py-1.5 rounded-full text-xs font-bold bg-amber-50 hover:bg-amber-100 text-amber-900 border border-amber-200 transition-all shrink-0"
                >
                    📊 {t.gq6.title}
                </button>

                <button
                    type="button"
                    onClick={() => setShowLetterModal(true)}
                    className="px-3.5 py-1.5 rounded-full text-xs font-bold bg-rose-50 hover:bg-rose-100 text-rose-900 border border-rose-200 transition-all shrink-0"
                >
                    ✉️ {t.letters.title}
                </button>

                <button
                    type="button"
                    onClick={() => setShowVirtualVisitModal(true)}
                    className="px-3.5 py-1.5 rounded-full text-xs font-bold bg-purple-50 hover:bg-purple-100 text-purple-900 border border-purple-200 transition-all shrink-0"
                >
                    🪑 {t.emptyChair.title}
                </button>

                <button
                    type="button"
                    onClick={() => setShowHubermanModal(true)}
                    className="px-3.5 py-1.5 rounded-full text-xs font-bold bg-blue-50 hover:bg-blue-100 text-blue-900 border border-blue-200 transition-all shrink-0"
                >
                    🧠 {t.huberman.title}
                </button>

                <button
                    type="button"
                    onClick={() => setShowSubtractionModal(true)}
                    className="px-3.5 py-1.5 rounded-full text-xs font-bold bg-emerald-50 hover:bg-emerald-100 text-emerald-900 border border-emerald-200 transition-all shrink-0"
                >
                    ⏳ {t.mentalSubtraction.title}
                </button>
            </div>

            {/* Main Structured 3GT Form with Mandatory Causal Reflection & Affect Rating */}
            <ThreeGoodThingsForm
                stepIndex={currentStep}
                userProfile={userProfile}
                item={items[currentStep]}
                empiricalContext={empiricalContext}
                onChange={(updated) => handleItemChange(currentStep, updated)}
                onCompleted={() => handleItemCompleted(currentStep)}
            />

            {/* Step Controls */}
            <div className="flex items-center justify-between gap-4 pt-2">
                <button
                    type="button"
                    onClick={() => setCurrentStep((prev) => Math.max(prev - 1, 0))}
                    disabled={currentStep === 0}
                    className="px-4 py-2 text-xs font-bold text-neutral-600 hover:text-neutral-900 disabled:opacity-30 rounded-xl"
                >
                    {t.common.previous}
                </button>

                {currentStep < 2 ? (
                    <button
                        type="button"
                        onClick={() => setCurrentStep((prev) => Math.min(prev + 1, 2))}
                        className="px-6 py-2.5 text-xs sm:text-sm font-bold bg-neutral-800 hover:bg-neutral-900 text-white rounded-xl shadow-md transition-all"
                    >
                        {t.common.next}
                    </button>
                ) : (
                    <button
                        type="button"
                        onClick={handleSaveEntry}
                        disabled={isSaving}
                        className="px-8 py-3 text-xs sm:text-sm font-black bg-emerald-700 hover:bg-emerald-800 text-white rounded-xl shadow-lg transition-all active:scale-[0.98] disabled:opacity-50"
                    >
                        {isSaving ? t.common.loading : `✓ ${t.common.complete}`}
                    </button>
                )}
            </div>

            {/* Scientific Fact Banner */}
            {scientificFact && (
                <div className="pt-4">
                    <ScientificFactBanner
                        statement={scientificFact.statement}
                        citation={scientificFact.citation}
                        isHebrew={locale === 'he'}
                    />
                </div>
            )}

            {/* Clinical Protocols Modals (Code-Split via Suspense) */}
            <React.Suspense fallback={<LoadingSpinner />}>
                {showGQ6Modal && (
                    <GQ6AssessmentModal
                        userProfile={userProfile}
                        onClose={() => setShowGQ6Modal(false)}
                        onCompleted={() => setShowGQ6Modal(false)}
                    />
                )}

                {showLetterModal && (
                    <GratitudeLetterModal
                        userProfile={userProfile}
                        onClose={() => setShowLetterModal(false)}
                        onSaved={() => setShowLetterModal(false)}
                        isHebrew={locale === 'he'}
                    />
                )}

                {showVirtualVisitModal && (
                    <VirtualGratitudeVisitModal
                        userProfile={userProfile}
                        onClose={() => setShowVirtualVisitModal(false)}
                        onCompleted={() => setShowVirtualVisitModal(false)}
                    />
                )}

                {showHubermanModal && (
                    <HubermanRecallModal
                        userProfile={userProfile}
                        onClose={() => setShowHubermanModal(false)}
                        onCompleted={() => setShowHubermanModal(false)}
                    />
                )}

                {showSubtractionModal && (
                    <MentalSubtractionModal
                        userProfile={userProfile}
                        onClose={() => setShowSubtractionModal(false)}
                        onCompleted={(reflection) => setSubtractionReflection(reflection)}
                        isHebrew={locale === 'he'}
                    />
                )}
            </React.Suspense>
        </div>
    );
};
