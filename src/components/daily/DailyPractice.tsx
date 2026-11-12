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
} from '../../types';
import { LoadingSpinner } from '../common/LoadingSpinner';
import { ScientificFactBanner } from '../common/ScientificFactBanner';
import { getRandomScientificFact } from '../../services/scientificFacts';
import { ThreeGoodThingsForm } from './ThreeGoodThingsForm';
import { DosingScheduleBadge } from '../clinical/DosingScheduleBadge';
import { PastelCard } from '../common/PastelCard';
import { getDictionary } from '../../locales';
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
    const { userProfile, googleId, isAuthenticated, refreshStreak } = useApp();
    const [isLoading, setIsLoading] = useState(true);
    const [isSaving, setIsSaving] = useState(false);
    const [isCompleted, setIsCompleted] = useState(false);
    const [activeProtocol] = useState<GratitudeProtocolType>('three_good_things');
    const [showDeeperTools, setShowDeeperTools] = useState(false);
    const [lastSavedAt, setLastSavedAt] = useState<number | null>(null);

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

    // Modals
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
        const loadKey = `${userProfile.userId}_${today}_${googleId || 'anon'}`;

        // Prevent re-loading & unmounting inputs on unrelated userProfile object reference updates
        if (loadedKeyRef.current === loadKey) {
            setIsLoading(false);
            return;
        }
        loadedKeyRef.current = loadKey;

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
        setLastSavedAt(Date.now());
    }, []);

    const handleSaveEntry = useCallback(async () => {
        if (!userProfile) return;

        // Verify all 3 items have concrete moment and agency attribution
        const isAllValid = items.every(
            (it) => it.act.trim().length >= 4 && it.causalReflection.trim().length >= 4
        );

        if (!isAllValid) {
            alert(
                locale === 'he'
                    ? 'אנא וודא שכל 3 הרגעים הטובים כוללים פירוט קצר וכיצד תרמת להם.'
                    : 'Please ensure all 3 moments contain your reflection and personal contribution.'
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

        // Guarantee backward-compatibility for Firestore
        const normalizedItems = items.map((it) => ({
            ...it,
            benefit: it.benefit || it.act,
            benefactor: it.benefactor || (locale === 'he' ? 'עצמי / אחרים' : 'Myself / Others'),
            affectRating: it.affectRating || 5,
        }));

        const compiledContent = normalizedItems
            .map(
                (it, i) =>
                    `[${i + 1}] ${it.act} -> Causal Agency: ${it.causalReflection} (Affect: ${it.affectRating}/7)`
            )
            .join('\n');

        const newEntry: DailyEntry = {
            entryId: uuidv4(),
            userId: userProfile.userId,
            date: today,
            protocol: activeProtocol,
            openingSentence: locale === 'he' ? 'שלושה דברים טובים' : 'Three Good Things',
            suggestions: [],
            items: normalizedItems,
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
            StorageService.clearDraft(today);

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
            <div dir={locale === 'he' ? 'rtl' : 'ltr'} className="w-full max-w-full min-w-0 py-4 animate-fadeIn text-center">
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
                        <p className="text-base text-neutral-700 max-w-sm mx-auto break-words leading-relaxed">
                            {locale === 'he'
                                ? 'התרגול היומי הושלם בהצלחה. המוח שלך חיזק את מסלולי ההערכה והשקט הנפשי.'
                                : 'Daily practice complete. Your brain has reinforced neural pathways of appreciation and calm.'}
                        </p>
                    </div>
                </PastelCard>
            </div>
        );
    }

    const allThreeFilled = items.every(
        (it) => it.act.trim().length >= 4 && it.causalReflection.trim().length >= 4
    );

    const completedCount = items.filter(
        (it) => it.act.trim().length >= 4 && it.causalReflection.trim().length >= 4
    ).length;

    return (
        <div dir={locale === 'he' ? 'rtl' : 'ltr'} className="w-full max-w-full min-w-0 space-y-4 animate-fadeIn">
            {/* Clean High-Contrast Subtitle (No duplicate "יום הודיה" heading) & Habit Progress Card */}
            <div className="flex flex-col gap-3 w-full min-w-0 pb-1">
                <p className="text-sm sm:text-base text-white/95 font-medium text-start break-words px-1 drop-shadow-xs">
                    {t.common.tagline}
                </p>
                <DosingScheduleBadge dosingSchedule={userProfile.dosingSchedule} locale={locale} />
            </div>

            {/* Evening Ritual Deep-Link Banner */}
            {isEveningRitual && (
                <div className="p-3.5 bg-purple-950 text-white rounded-2xl shadow-md flex items-center justify-between gap-3 animate-fadeIn w-full min-w-0 box-border border border-purple-400/20">
                    <div className="flex items-center gap-2.5 min-w-0 flex-1">
                        <span className="text-2xl flex-shrink-0">🌙</span>
                        <div className="text-xs min-w-0 flex-1">
                            <div className="font-extrabold text-sm text-purple-100 break-words">
                                {locale === 'he' ? 'טקס ערב לפני השינה' : 'Pre-Sleep Evening Ritual'}
                            </div>
                            <div className="text-purple-200/90 break-words">
                                {locale === 'he'
                                    ? '3 דברים טובים לשקט נפשי ושינה רגועה ומחדשת'
                                    : '3 Good Things for evening calm and restorative sleep'}
                            </div>
                        </div>
                    </div>
                    <span className="px-2.5 py-1 bg-white/20 rounded-full text-xs font-bold text-white shrink-0 ms-2">
                        {locale === 'he' ? 'פעיל' : 'Active'}
                    </span>
                </div>
            )}

            {/* Main Direct-Input 3GT Form (All 3 Textareas Accessible Directly) */}
            <ThreeGoodThingsForm
                items={items}
                userProfile={userProfile}
                empiricalContext={empiricalContext}
                lastSavedAt={lastSavedAt}
                onChange={handleItemChange}
            />

            {/* Primary Daily Completion Button */}
            <div className="pt-1 w-full">
                <button
                    type="button"
                    onClick={handleSaveEntry}
                    disabled={isSaving || !allThreeFilled}
                    className={`w-full py-3.5 px-6 text-base font-black rounded-2xl shadow-lg transition-all active:scale-[0.98] flex items-center justify-center gap-2 ${
                        allThreeFilled && !isSaving
                            ? 'bg-emerald-600 hover:bg-emerald-700 text-white shadow-emerald-900/30'
                            : 'bg-white/25 text-white/75 border border-white/25 cursor-not-allowed'
                    }`}
                >
                    {isSaving ? (
                        <span>{t.common.loading}</span>
                    ) : allThreeFilled ? (
                        <span>{locale === 'he' ? '✓ שמור והשלם תרגול יומי' : '✓ Complete Daily Practice'}</span>
                    ) : (
                        <span>
                            {locale === 'he'
                                ? `השלם את 3 הרגעים לשמירה (${completedCount}/3)`
                                : `Complete all 3 moments to save (${completedCount}/3)`}
                        </span>
                    )}
                </button>
            </div>

            {/* Secondary Clinical Tools Section (Expandable 2-Column Grid) */}
            <div className="pt-3 border-t border-white/15">
                <button
                    type="button"
                    onClick={() => setShowDeeperTools((prev) => !prev)}
                    className="w-full p-3.5 bg-white/95 hover:bg-white rounded-2xl border border-black/10 flex items-center justify-between text-start transition-all shadow-sm"
                >
                    <div className="min-w-0 flex-1">
                        <div className="font-bold text-sm text-neutral-900 truncate">
                            {t.threeGoodThings.deeperToolsTitle}
                        </div>
                        <div className="text-xs text-neutral-600 truncate">
                            {t.threeGoodThings.deeperToolsSubtitle}
                        </div>
                    </div>
                    <div className="ms-2 flex-shrink-0 text-neutral-700">
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

            {/* Scientific Fact Banner */}
            {scientificFact && (
                <div className="pt-2">
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
