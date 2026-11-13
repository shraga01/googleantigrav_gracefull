import React, { useState, useEffect, useCallback, useRef } from 'react';
import { useApp } from '../../context/AppContext';
import { StorageService } from '../../services/storage';
import { FirestoreService } from '../../services/firestoreService';
import type {
    DailyEntry,
    ThreeGoodThingsItem,
    GratitudeProtocolType,
    Locale,
    EmpiricalHistoricalContext,
    UserProfile,
} from '../../types';
import { LoadingSpinner } from '../common/LoadingSpinner';
import { getRandomScientificFact } from '../../services/scientificFacts';
import { ThreeGoodThingsForm } from './ThreeGoodThingsForm';
import { DosingScheduleBadge } from '../clinical/DosingScheduleBadge';
import { PastelCard } from '../common/PastelCard';
import { getDictionary } from '../../locales';
import { evaluateBadges } from '../../utils/badgeUtils';
import { v4 as uuidv4 } from 'uuid';
import { IconChevronDown, IconChevronUp } from '../common/SvgIcon';

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
    // 1. All useState & useRef Declarations (Strictly physical top - TDZ Prevention)
    // -------------------------------------------------------------------------
    const {
        userProfile,
        googleId,
        isAuthenticated,
        refreshStreak,
        updateProfile,
        setNewlyUnlockedBadges,
    } = useApp();
    const [isLoading, setIsLoading] = useState(true);
    const [isSaving, setIsSaving] = useState(false);
    const [isCompleted, setIsCompleted] = useState(false);
    const [activeProtocol] = useState<GratitudeProtocolType>('three_good_things');
    const [activeStep, setActiveStep] = useState<0 | 1 | 2>(0);
    const [validationError, setValidationError] = useState<string | null>(null);
    const [showDeeperTools, setShowDeeperTools] = useState(false);
    const [lastSavedAt, setLastSavedAt] = useState<number | null>(null);
    const [streakCount, setStreakCount] = useState<number>(
        () => StorageService.reconcileStreakFromEntries().currentStreak || 1
    );

    // Empirical historical context loaded directly from Firestore
    const [empiricalContext, setEmpiricalContext] = useState<EmpiricalHistoricalContext | null>(null);

    // Three Good Things structured items (hydrated immediately from local draft if present)
    const [items, setItems] = useState<ThreeGoodThingsItem[]>(() => {
        const today = new Date().toLocaleDateString('en-CA');
        const draft = StorageService.getDraft(today);
        if (draft) return draft;
        return [
            { act: '', benefactor: '', benefit: '', causalReflection: '', affectRating: 5 },
            { act: '', benefactor: '', benefit: '', causalReflection: '', affectRating: 5 },
            { act: '', benefactor: '', benefit: '', causalReflection: '', affectRating: 5 },
        ];
    });

    // Clinical protocol modals
    const [showLetterModal, setShowLetterModal] = useState(false);
    const [showVirtualVisitModal, setShowVirtualVisitModal] = useState(false);
    const [showGQ6Modal, setShowGQ6Modal] = useState(false);
    const [showHubermanModal, setShowHubermanModal] = useState(false);
    const [showSubtractionModal, setShowSubtractionModal] = useState(false);
    const [subtractionReflection, setSubtractionReflection] = useState<string | undefined>(undefined);

    const [isEveningRitual] = useState<boolean>(() => {
        if (typeof window === 'undefined') return false;
        return new URLSearchParams(window.location.search).get('mode') === 'evening_ritual';
    });
    const [scientificFact, setScientificFact] = useState<{ statement: string; citation: string } | null>(null);

    // Guard to prevent background profile updates from unmounting active inputs / resetting IME focus
    const loadedKeyRef = useRef<string | null>(null);
    const stepCardRef = useRef<HTMLElement | null>(null);

    const locale: Locale = userProfile?.locale || (userProfile?.language === 'hebrew' ? 'he' : 'en');
    const isHebrew = locale === 'he';
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
        const loadKey = `${userProfile.userId}_${today}_${googleId || 'anon'}`;

        // Prevent re-loading & unmounting inputs on unrelated userProfile object reference updates
        if (loadedKeyRef.current === loadKey) {
            setIsLoading(false);
            return;
        }
        loadedKeyRef.current = loadKey;

        setIsLoading(true);

        try {
            setStreakCount(StorageService.reconcileStreakFromEntries().currentStreak || 1);

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

            // Check local completed entry fallback
            const localEntry = StorageService.getEntryByDate(today);
            if (localEntry) {
                setDailyStateFromEntry(localEntry);
                setIsLoading(false);
                return;
            }

            // Check draft fallback
            const localDraft = StorageService.getDraft(today);
            if (localDraft) {
                setItems(localDraft);
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
        const today = new Date().toLocaleDateString('en-CA');
        setItems((prev) => {
            const next = [...prev];
            next[index] = updatedItem;
            StorageService.saveDraft(today, next);
            return next;
        });
        setValidationError(null);
        setLastSavedAt(Date.now());
    }, []);

    const handleStepChange = useCallback((nextStep: 0 | 1 | 2) => {
        setValidationError(null);
        setActiveStep(nextStep);
    }, []);

    const persistEntry = useCallback(
        async (itemsToSave: ThreeGoodThingsItem[]) => {
            if (!userProfile) return;

            setIsSaving(true);
            const today = new Date().toLocaleDateString('en-CA');

            // Guardrail #4: Never inject fabricated strings into Firestore
            const normalizedItems: ThreeGoodThingsItem[] = itemsToSave.map((it) => ({
                ...it,
                act: it.act.trim(),
                benefit: (it.benefit || it.act).trim(),
                benefactor: it.benefactor || '',
                causalReflection: it.causalReflection.trim(),
                affectRating: it.affectRating || 5,
            }));

            const compiledContent = normalizedItems
                .filter((it) => it.act.length > 0)
                .map(
                    (it, i) =>
                        `[${i + 1}] ${it.act}${it.causalReflection ? ` -> Strength: ${it.causalReflection}` : ''} (Wellbeing: ${it.affectRating}/7)`
                )
                .join('\n');

            const existingEntry = StorageService.getEntryByDate(today);
            const entryId = existingEntry?.entryId || uuidv4();

            const newEntry: DailyEntry = {
                entryId,
                userId: userProfile.userId,
                date: today,
                protocol: activeProtocol,
                openingSentence: isHebrew ? 'שלושה דברים טובים' : 'Three Good Things',
                suggestions: [],
                items: normalizedItems,
                mentalSubtractionReflection: subtractionReflection,
                userContent: {
                    type: 'text',
                    content: compiledContent,
                },
                completedAt: Date.now(),
                streakDay: 1,
                qualityScore: normalizedItems.every((it) => it.act.length >= 3) ? 95 : 80,
            };

            try {
                // Save entry to localStorage first so reconcileStreakFromEntries inspects the saved entry
                StorageService.saveEntry(newEntry);

                // Reconcile streak empirically from entries (prevents double-incrementing totalDaysPracticed on same-day edits)
                const reconciledStreak = StorageService.reconcileStreakFromEntries();
                newEntry.streakDay = reconciledStreak.currentStreak;
                StorageService.saveEntry(newEntry);

                StorageService.clearDraft(today);
                setStreakCount(reconciledStreak.currentStreak);

                // Evaluate badges empirically across entries and reconciled streak
                const allEntries = StorageService.getEntries();
                const existingBadgeCodes = userProfile.unlockedBadges?.map((b) => b.code) || [];
                const { newlyUnlockedCodes } = evaluateBadges(
                    allEntries,
                    reconciledStreak,
                    existingBadgeCodes
                );

                if (newlyUnlockedCodes.length > 0) {
                    const now = Date.now();
                    const newBadgeEntries = newlyUnlockedCodes.map((code) => ({
                        code,
                        awardedAt: now,
                    }));
                    const updatedBadges = [...(userProfile.unlockedBadges || []), ...newBadgeEntries];
                    const updatedProfile: UserProfile = {
                        ...userProfile,
                        unlockedBadges: updatedBadges,
                    };
                    StorageService.saveUserProfile(updatedProfile);
                    void updateProfile(updatedProfile);
                    setNewlyUnlockedBadges(newlyUnlockedCodes);
                }

                if (isAuthenticated && googleId) {
                    await FirestoreService.saveEntry(googleId, newEntry);
                    await FirestoreService.updateStreak(googleId, reconciledStreak);
                    await refreshStreak();
                }

                setIsCompleted(true);
            } catch (error) {
                console.error('Failed to save daily entry:', error);
                setValidationError(
                    isHebrew ? 'שגיאה בשמירת התרגול, נסה שוב.' : 'Error saving practice, please try again.'
                );
            } finally {
                setIsSaving(false);
            }
        },
        [
            userProfile,
            activeProtocol,
            isHebrew,
            subtractionReflection,
            isAuthenticated,
            googleId,
            refreshStreak,
            updateProfile,
            setNewlyUnlockedBadges,
        ]
    );

    const handlePrimaryCtaClick = useCallback(async () => {
        if (activeStep === 2) {
            // Step 2 -> verify all 3 moments have at least 3 chars (or jump to first empty one)
            const firstEmptyIndex = items.findIndex((it) => (it?.act || '').trim().length < 3);
            if (firstEmptyIndex !== -1) {
                setActiveStep(firstEmptyIndex as 0 | 1 | 2);
                setValidationError(
                    isHebrew
                        ? `אנא השלם גם את רגע ${firstEmptyIndex + 1} לפני השלמת התרגול`
                        : `Please also complete Moment ${firstEmptyIndex + 1} before finishing`
                );
                setTimeout(() => {
                    stepCardRef.current?.scrollIntoView({ behavior: 'smooth', block: 'start' });
                }, 60);
                return;
            }
        } else {
            const currentAct = (items[activeStep]?.act || '').trim();
            if (currentAct.length < 3) {
                setValidationError(
                    isHebrew
                        ? 'אנא כתוב כמה מילים על הרגע הטוב לפני שממשיכים ✨'
                        : 'Please write a few words about this good moment before continuing ✨'
                );
                return;
            }
        }

        const today = new Date().toLocaleDateString('en-CA');
        StorageService.saveDraft(today, items);
        setLastSavedAt(Date.now());
        setValidationError(null);

        if (activeStep < 2) {
            const nextStep = (activeStep + 1) as 1 | 2;
            setActiveStep(nextStep);
            setTimeout(() => {
                stepCardRef.current?.scrollIntoView({ behavior: 'smooth', block: 'start' });
            }, 60);
            return;
        }

        await persistEntry(items);
    }, [activeStep, items, isHebrew, persistEntry]);

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
            <div dir={isHebrew ? 'rtl' : 'ltr'} className="w-full max-w-full min-w-0 py-4 animate-fadeIn text-center">
                <PastelCard
                    variant="sage"
                    title={t.common.wellDone}
                    subtitle={t.common.seeYouTomorrow}
                    badge={t.common.verified}
                    elevated
                >
                    <div className="py-6 space-y-4">
                        <div className="inline-flex items-center gap-2 px-5 py-2.5 rounded-full bg-amber-100 text-amber-900 border border-amber-300 font-bold text-lg">
                            <span>🔥</span>
                            <span>
                                {streakCount} {t.common.daysStreak}
                            </span>
                        </div>
                        <p className="text-base text-stone-700 max-w-sm mx-auto break-words leading-relaxed">
                            {isHebrew
                                ? 'התרגול היומי הושלם בהצלחה. המוח שלך חיזק את מסלולי ההערכה והשקט הנפשי.'
                                : 'Daily practice complete. Your brain has reinforced neural pathways of appreciation and calm.'}
                        </p>
                    </div>
                </PastelCard>
            </div>
        );
    }

    const showMoodScale = activeStep === 2;

    return (
        <div dir={isHebrew ? 'rtl' : 'ltr'} className="w-full max-w-full min-w-0 space-y-4 animate-fadeIn">
            {/* 21-Day Habit Progress Card */}
            <DosingScheduleBadge
                dosingSchedule={userProfile.dosingSchedule}
                streakCount={streakCount}
                locale={locale}
            />

            {/* Evening Ritual Deep-Link Banner */}
            {isEveningRitual && (
                <div className="p-3.5 bg-amber-900 text-amber-50 rounded-2xl shadow-sm flex items-center justify-between gap-3 animate-fadeIn w-full min-w-0 box-border border border-amber-700/40">
                    <div className="flex items-center gap-2.5 min-w-0 flex-1">
                        <span className="text-2xl flex-shrink-0">🌙</span>
                        <div className="text-xs min-w-0 flex-1 text-start">
                            <div className="font-bold text-sm text-amber-100 break-words">
                                {isHebrew ? 'טקס ערב לפני השינה' : 'Pre-Sleep Evening Ritual'}
                            </div>
                            <div className="text-amber-200/90 break-words">
                                {isHebrew
                                    ? '3 דברים טובים לשקט נפשי ושינה רגועה ומחדשת'
                                    : '3 Good Things for evening calm and restorative sleep'}
                            </div>
                        </div>
                    </div>
                    <span className="px-2.5 py-1 bg-white/15 rounded-full text-xs font-bold text-white shrink-0 ms-2">
                        {isHebrew ? 'פעיל' : 'Active'}
                    </span>
                </div>
            )}

            {/* Phase 1, 2 & 3: Interactive 3-Step Wizard Form + Gated Mood Scale */}
            <ThreeGoodThingsForm
                items={items}
                activeStep={activeStep}
                showMoodScale={showMoodScale}
                userProfile={userProfile}
                empiricalContext={empiricalContext}
                lastSavedAt={lastSavedAt}
                validationError={validationError}
                stepCardRef={stepCardRef}
                onStepChange={handleStepChange}
                onChange={handleItemChange}
            />

            {/* Primary Gradient CTA Button */}
            <div className="pt-1 space-y-2 w-full">
                {activeStep === 2 ? (
                    <button
                        type="button"
                        onClick={() => void handlePrimaryCtaClick()}
                        disabled={isSaving}
                        className="w-full py-4 px-6 rounded-2xl bg-gradient-to-l from-amber-500 via-orange-500 to-rose-500 text-white font-bold text-base shadow-lg shadow-amber-500/25 active:scale-[0.98] hover:shadow-xl transition-all flex items-center justify-center gap-2 disabled:opacity-60 cursor-pointer"
                    >
                        <span>{isSaving ? t.common.loading : t.threeGoodThings.completePracticeBtn}</span>
                    </button>
                ) : (
                    <button
                        type="button"
                        onClick={() => void handlePrimaryCtaClick()}
                        disabled={isSaving}
                        className="w-full py-4 px-6 rounded-2xl bg-gradient-to-l from-amber-500 via-orange-500 to-rose-500 text-white font-bold text-base shadow-lg shadow-amber-500/25 active:scale-[0.98] hover:shadow-xl transition-all flex items-center justify-center gap-2 disabled:opacity-60 cursor-pointer"
                    >
                        <span>
                            {isSaving
                                ? t.common.loading
                                : activeStep === 0
                                ? t.threeGoodThings.nextMomentBtnStep1
                                : t.threeGoodThings.nextMomentBtnStep2}
                        </span>
                    </button>
                )}
            </div>

            {/* Research Wisdom Card (Prof. Martin Seligman) */}
            <section
                data-purpose="scientific-insight"
                className="bg-gradient-to-br from-indigo-50/80 via-purple-50/45 to-amber-50/60 rounded-2xl p-4 border border-indigo-100/80 text-stone-700 w-full box-border text-start"
            >
                <div className="flex items-center gap-2 mb-1.5">
                    <span className="text-sm">💡</span>
                    <h4 className="text-xs font-bold text-indigo-950">
                        {t.threeGoodThings.seligmanTitle}
                    </h4>
                </div>
                <p className="text-xs leading-relaxed text-indigo-950/85">
                    {t.threeGoodThings.seligmanBody}
                </p>
                {scientificFact && (
                    <p className="text-[11px] leading-relaxed text-indigo-900/75 mt-2 pt-2 border-t border-indigo-100/80">
                        {scientificFact.statement} <span className="italic">— {scientificFact.citation}</span>
                    </p>
                )}
            </section>

            {/* Secondary Deeper Clinical Tools Section */}
            <div className="pt-2 border-t border-amber-200/50">
                <button
                    type="button"
                    onClick={() => setShowDeeperTools((prev) => !prev)}
                    className="w-full p-3.5 bg-white/90 hover:bg-white rounded-2xl border border-amber-100 flex items-center justify-between text-start transition-all shadow-xs"
                >
                    <div className="min-w-0 flex-1">
                        <div className="font-bold text-sm text-stone-800 truncate">
                            {t.threeGoodThings.deeperToolsTitle}
                        </div>
                        <div className="text-xs text-stone-500 truncate">
                            {t.threeGoodThings.deeperToolsSubtitle}
                        </div>
                    </div>
                    <div className="ms-2 flex-shrink-0 text-stone-600">
                        {showDeeperTools ? <IconChevronUp className="w-5 h-5" /> : <IconChevronDown className="w-5 h-5" />}
                    </div>
                </button>

                {showDeeperTools && (
                    <div className="grid grid-cols-2 gap-2.5 w-full pt-3 animate-fadeIn">
                        <button
                            type="button"
                            onClick={() => setShowLetterModal(true)}
                            className="p-3 text-start bg-rose-50 hover:bg-rose-100 text-rose-950 rounded-xl border border-rose-200 transition-all shadow-xs"
                        >
                            <div className="text-lg mb-1">✉️</div>
                            <div className="font-bold text-xs">{t.letters.title}</div>
                        </button>

                        <button
                            type="button"
                            onClick={() => setShowGQ6Modal(true)}
                            className="p-3 text-start bg-amber-50 hover:bg-amber-100 text-amber-950 rounded-xl border border-amber-200 transition-all shadow-xs"
                        >
                            <div className="text-lg mb-1">📊</div>
                            <div className="font-bold text-xs">{t.gq6.title}</div>
                        </button>

                        <button
                            type="button"
                            onClick={() => setShowVirtualVisitModal(true)}
                            className="p-3 text-start bg-purple-50 hover:bg-purple-100 text-purple-950 rounded-xl border border-purple-200 transition-all shadow-xs"
                        >
                            <div className="text-lg mb-1">🪑</div>
                            <div className="font-bold text-xs">{t.emptyChair.title}</div>
                        </button>

                        <button
                            type="button"
                            onClick={() => setShowHubermanModal(true)}
                            className="p-3 text-start bg-blue-50 hover:bg-blue-100 text-blue-950 rounded-xl border border-blue-200 transition-all shadow-xs"
                        >
                            <div className="text-lg mb-1">🧠</div>
                            <div className="font-bold text-xs">{t.huberman.title}</div>
                        </button>

                        <button
                            type="button"
                            onClick={() => setShowSubtractionModal(true)}
                            className="p-3 text-start bg-emerald-50 hover:bg-emerald-100 text-emerald-950 rounded-xl border border-emerald-200 transition-all shadow-xs col-span-2"
                        >
                            <div className="text-lg mb-1">⏳</div>
                            <div className="font-bold text-xs">{t.mentalSubtraction.title}</div>
                        </button>
                    </div>
                )}
            </div>

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
                        isHebrew={isHebrew}
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
                        isHebrew={isHebrew}
                    />
                )}
            </React.Suspense>
        </div>
    );
};
