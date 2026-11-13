import React, { useState, useRef, useCallback, useMemo } from 'react';
import type { ThreeGoodThingsItem, UserProfile, Locale, EmpiricalHistoricalContext } from '../../types';
import { NeuralRubricEngine, type NeuralDimensionKey } from '../../services/neuralRubricEngine';
import { PromptEngine, TARGET_DESCRIPTIONS, LENS_DESCRIPTIONS } from '../../services/promptEngine';
import { getDictionary } from '../../locales';
import { StorageService } from '../../services/storage';
import { IconCheck } from '../common/SvgIcon';

interface ThreeGoodThingsFormProps {
    items: ThreeGoodThingsItem[];
    activeStep: 0 | 1 | 2;
    showMoodScale: boolean;
    userProfile: UserProfile;
    empiricalContext?: EmpiricalHistoricalContext | null;
    lastSavedAt?: number | null;
    validationError?: string | null;
    stepCardRef?: React.RefObject<HTMLElement | null>;
    onStepChange: (step: 0 | 1 | 2) => void;
    onChange: (stepIndex: number, updated: ThreeGoodThingsItem) => void;
}

interface StrengthChipDef {
    id: string;
    emoji: string;
    label: string;
    token: string;
}

interface InspirationPromptState {
    message: string;
    starterPrompt: string;
}

function parseCausalReflection(
    raw: string,
    chipTokens: string[]
): { selectedTokens: string[]; customText: string } {
    if (!raw || !raw.trim()) {
        return { selectedTokens: [], customText: '' };
    }
    const parts = raw
        .split(',')
        .map((p) => p.trim())
        .filter(Boolean);

    const selectedTokens: string[] = [];
    const customParts: string[] = [];

    for (const part of parts) {
        if (chipTokens.includes(part)) {
            if (!selectedTokens.includes(part)) selectedTokens.push(part);
        } else {
            customParts.push(part);
        }
    }

    return {
        selectedTokens,
        customText: customParts.join(', '),
    };
}

function serializeCausalReflection(selectedTokens: string[], customText: string): string {
    const cleanCustom = customText.trim();
    const parts = [...selectedTokens];
    if (cleanCustom) {
        parts.push(cleanCustom);
    }
    return parts.join(', ');
}

function getFeelingDescription(score: number, isHebrew: boolean): string {
    if (isHebrew) {
        switch (score) {
            case 1:
                return '1: עייפות / זקוק להקלה';
            case 2:
                return '2: מעט כבד אבל עובר';
            case 3:
                return '3: רגוע חלקית';
            case 4:
                return '4: יציב ומאוזן';
            case 5:
                return '5: נעים ומלא הערכה ☀️';
            case 6:
                return '6: מרומם ושמח';
            case 7:
                return '7: מרומם ומלא שמחה ✨';
            default:
                return '5: נעים ומלא הערכה ☀️';
        }
    }
    switch (score) {
        case 1:
            return '1: Tired / needs relief';
        case 2:
            return '2: Heavy but passing';
        case 3:
            return '3: Somewhat calm';
        case 4:
            return '4: Steady & balanced';
        case 5:
            return '5: Pleasant & appreciative ☀️';
        case 6:
            return '6: Uplifted & warm';
        case 7:
            return '7: Uplifted & joyful ✨';
        default:
            return '5: Pleasant & appreciative ☀️';
    }
}

export const ThreeGoodThingsForm: React.FC<ThreeGoodThingsFormProps> = ({
    items,
    activeStep,
    showMoodScale,
    userProfile,
    empiricalContext,
    lastSavedAt,
    validationError,
    stepCardRef,
    onStepChange,
    onChange,
}) => {
    // -------------------------------------------------------------------------
    // 1. All useState & useRef Declarations (Strictly physical top - TDZ Prevention)
    // -------------------------------------------------------------------------
    const [rubricOpenByStep, setRubricOpenByStep] = useState<Record<number, boolean>>({});
    const [inspirationByStep, setInspirationByStep] = useState<Record<number, InspirationPromptState | null>>({});
    const textareaRef = useRef<HTMLTextAreaElement | null>(null);

    const locale: Locale = userProfile.locale || (userProfile.language === 'hebrew' ? 'he' : 'en');
    const isHebrew = locale === 'he';
    const t = getDictionary(locale);

    const strengthChips: StrengthChipDef[] = useMemo(
        () => [
            {
                id: 'help',
                emoji: '💪',
                label: t.threeGoodThings.strengthChip1,
                token: `💪 ${t.threeGoodThings.strengthChip1}`,
            },
            {
                id: 'patience',
                emoji: '✨',
                label: t.threeGoodThings.strengthChip2,
                token: `✨ ${t.threeGoodThings.strengthChip2}`,
            },
            {
                id: 'creativity',
                emoji: '🌱',
                label: t.threeGoodThings.strengthChip3,
                token: `🌱 ${t.threeGoodThings.strengthChip3}`,
            },
            {
                id: 'mutual',
                emoji: '🙏',
                label: t.threeGoodThings.strengthChip4,
                token: `🙏 ${t.threeGoodThings.strengthChip4}`,
            },
        ],
        [
            t.threeGoodThings.strengthChip1,
            t.threeGoodThings.strengthChip2,
            t.threeGoodThings.strengthChip3,
            t.threeGoodThings.strengthChip4,
        ]
    );

    const chipTokens = useMemo(() => strengthChips.map((c) => c.token), [strengthChips]);

    const currentItem = useMemo(
        () =>
            items[activeStep] || {
                act: '',
                benefactor: '',
                benefit: '',
                causalReflection: '',
                affectRating: 5,
            },
        [items, activeStep]
    );

    const { selectedTokens, customText } = parseCausalReflection(
        currentItem.causalReflection || '',
        chipTokens
    );

    // Deterministic offline 5-dimension Neural Depth Evaluation
    const liveEvaluation = useMemo(
        () =>
            NeuralRubricEngine.evaluate(
                currentItem.act,
                currentItem.causalReflection,
                locale
            ),
        [currentItem.act, currentItem.causalReflection, locale]
    );

    // -------------------------------------------------------------------------
    // 2. All useCallback Declarations
    // -------------------------------------------------------------------------
    const handleQuestion1Change = useCallback(
        (val: string) => {
            onChange(activeStep, {
                ...currentItem,
                act: val,
                benefit: val,
            });
            if (val.trim().length >= 6) {
                setInspirationByStep((prev) => (prev[activeStep] ? { ...prev, [activeStep]: null } : prev));
            }
        },
        [activeStep, currentItem, onChange]
    );

    const handleToggleChip = useCallback(
        (chipToken: string) => {
            const parsed = parseCausalReflection(currentItem.causalReflection || '', chipTokens);
            const exists = parsed.selectedTokens.includes(chipToken);
            const nextTokens = exists
                ? parsed.selectedTokens.filter((tk) => tk !== chipToken)
                : [...parsed.selectedTokens, chipToken];

            const nextCausal = serializeCausalReflection(nextTokens, parsed.customText);
            onChange(activeStep, {
                ...currentItem,
                causalReflection: nextCausal,
            });
        },
        [activeStep, chipTokens, currentItem, onChange]
    );

    const handleCustomStrengthChange = useCallback(
        (val: string) => {
            const parsed = parseCausalReflection(currentItem.causalReflection || '', chipTokens);
            const nextCausal = serializeCausalReflection(parsed.selectedTokens, val);
            onChange(activeStep, {
                ...currentItem,
                causalReflection: nextCausal,
            });
        },
        [activeStep, chipTokens, currentItem, onChange]
    );

    const handleAffectChange = useCallback(
        (score: number) => {
            items.forEach((it, idx) => {
                onChange(idx, {
                    ...it,
                    affectRating: score,
                });
            });
        },
        [items, onChange]
    );

    const handleTextareaFocus = useCallback((e: React.FocusEvent<HTMLTextAreaElement>) => {
        const el = e.currentTarget;
        setTimeout(() => {
            el.scrollIntoView({ behavior: 'smooth', block: 'center' });
        }, 120);
    }, []);

    const handleAiAssist = useCallback(() => {
        const actText = currentItem.act.trim();

        // Branch A: Question 1 too short / empty -> show starter inspiration
        if (actText.length < 6) {
            const cfg = PromptEngine.getDailyConfig(activeStep, userProfile, empiricalContext || undefined);
            const targetHint = TARGET_DESCRIPTIONS[cfg.target]?.[locale] || '';
            const lensHint = LENS_DESCRIPTIONS[cfg.lens]?.[locale] || '';

            const stepStartersHe = [
                'היום בהפסקה שקטה בחוץ הרגשתי פתאום נשימה עמוקה ושקט נעים...',
                'למרות שהיום היה עמוס בעבודה, בחרתי לעצור רגע והצלחתי לסיים משימה חשובה...',
                'עמית בעבודה עזר לי היום במשהו קטן והרגשתי הקלה וחום אנושי בלב...',
            ];
            const stepStartersEn = [
                'Today during a quiet break outside I felt a deep breath of calm and warmth...',
                'Even though today was busy at work, I chose to pause and completed an important task...',
                'A colleague helped me today with a small task and I felt relief and warmth...',
            ];

            setInspirationByStep((prev) => ({
                ...prev,
                [activeStep]: {
                    message: isHebrew
                        ? `זווית מוצעת (${targetHint} | ${lensHint}): הנה התחלה שתוכלו להתאים לחוויה שלכם מהיום:`
                        : `Suggested angle (${targetHint} | ${lensHint}): Here is a quick starter you can adapt:`,
                    starterPrompt: (isHebrew ? stepStartersHe : stepStartersEn)[activeStep],
                },
            }));
            setRubricOpenByStep((prev) => ({ ...prev, [activeStep]: false }));
            return;
        }

        // Branch B: Genuine entry -> immediately reveal live offline 5-dimension Neural Depth Rubric Card
        setInspirationByStep((prev) => ({ ...prev, [activeStep]: null }));
        setRubricOpenByStep((prev) => ({ ...prev, [activeStep]: true }));
    }, [activeStep, currentItem.act, empiricalContext, isHebrew, locale, userProfile]);

    const handleUseStarter = useCallback(
        (starter: string) => {
            onChange(activeStep, {
                ...currentItem,
                act: starter,
                benefit: starter,
            });
            setInspirationByStep((prev) => ({ ...prev, [activeStep]: null }));
            setRubricOpenByStep((prev) => ({ ...prev, [activeStep]: true }));
            setTimeout(() => textareaRef.current?.focus(), 60);
        },
        [activeStep, currentItem, onChange]
    );

    const handleApplyUpgradeChip = useCallback(
        (chipText: string, missingKey: NeuralDimensionKey | null) => {
            if (missingKey === 'causalAgency') {
                const parsed = parseCausalReflection(currentItem.causalReflection || '', chipTokens);
                const mergedCustom = parsed.customText
                    ? `${parsed.customText}, ${chipText}`
                    : chipText;
                const nextCausal = serializeCausalReflection(parsed.selectedTokens, mergedCustom);
                onChange(activeStep, {
                    ...currentItem,
                    causalReflection: nextCausal,
                });
                return;
            }

            const existingAct = currentItem.act.trim();
            const cleanedBase = existingAct.replace(/[.!\s]+$/u, '');
            const nextAct = cleanedBase ? `${cleanedBase}. ${chipText}` : chipText;
            onChange(activeStep, {
                ...currentItem,
                act: nextAct,
                benefit: nextAct,
            });
        },
        [activeStep, chipTokens, currentItem, onChange]
    );

    const stepTitles = [
        t.threeGoodThings.stepTitle1,
        t.threeGoodThings.stepTitle2,
        t.threeGoodThings.stepTitle3,
    ];
    const callouts = [
        t.threeGoodThings.callout1,
        t.threeGoodThings.callout2,
        t.threeGoodThings.callout3,
    ];
    const currentFeeling = currentItem.affectRating || 5;
    const isRubricVisible = Boolean(rubricOpenByStep[activeStep] && currentItem.act.trim().length >= 6);
    const currentInspiration = inspirationByStep[activeStep];

    const pillarItems: Array<{ key: NeuralDimensionKey; label: string; active: boolean }> = [
        {
            key: 'specificity',
            label: t.threeGoodThings.pillarSpecificity,
            active: liveEvaluation.dimensions.specificity,
        },
        {
            key: 'causalAgency',
            label: t.threeGoodThings.pillarAgency,
            active: liveEvaluation.dimensions.causalAgency,
        },
        {
            key: 'interpersonalWarmth',
            label: t.threeGoodThings.pillarWarmth,
            active: liveEvaluation.dimensions.interpersonalWarmth,
        },
        {
            key: 'sensoryEmotionalDetail',
            label: t.threeGoodThings.pillarSensory,
            active: liveEvaluation.dimensions.sensoryEmotionalDetail,
        },
        {
            key: 'authenticity',
            label: t.threeGoodThings.pillarAuthenticity,
            active: liveEvaluation.dimensions.authenticity,
        },
    ];

    const canSendWhatsapp =
        liveEvaluation.dimensions.interpersonalWarmth || currentItem.act.trim().length >= 10;

    return (
        <div className="w-full max-w-full min-w-0 box-border space-y-4">
            {/* Interactive 3-Step Progressive Wizard Card */}
            <section
                ref={stepCardRef as React.RefObject<HTMLElement>}
                data-purpose="gratitude-reflection-card"
                className="bg-white rounded-3xl p-5 shadow-soft-card border border-amber-100/80 relative overflow-hidden transition-all w-full box-border"
            >
                {/* Header of Card: Step Number Badge, Dynamic Step Title & Step Counter Pill */}
                <div className="flex items-center justify-between gap-2 pb-3.5 border-b border-stone-100">
                    <div className="flex items-center gap-2 min-w-0">
                        <span className="w-7 h-7 rounded-xl bg-gradient-to-br from-amber-400 to-amber-500 text-white font-bold text-xs flex items-center justify-center shadow-sm shrink-0">
                            {activeStep + 1}
                        </span>
                        <h2 className="font-bold text-base text-stone-900 truncate">
                            {stepTitles[activeStep]}
                        </h2>
                    </div>

                    <span className="text-xs font-medium text-stone-600 bg-stone-100/90 px-2.5 py-1 rounded-full whitespace-nowrap shrink-0">
                        {t.threeGoodThings.stepBadge.replace('{step}', String(activeStep + 1))}
                    </span>
                </div>

                {/* Clickable Step Progress Dots (1 • 2 • 3) & Back Navigation */}
                <div className="flex items-center justify-between gap-2 pt-3">
                    <div className="flex items-center gap-1.5" role="tablist" aria-label={isHebrew ? 'ניווט בין 3 רגעים' : 'Step navigation'}>
                        {([0, 1, 2] as const).map((idx) => {
                            const isCurrent = activeStep === idx;
                            const isFilled = (items[idx]?.act || '').trim().length >= 3;
                            return (
                                <button
                                    key={idx}
                                    type="button"
                                    role="tab"
                                    aria-selected={isCurrent}
                                    aria-label={isHebrew ? `עבור לרגע ${idx + 1}` : `Go to moment ${idx + 1}`}
                                    onClick={() => onStepChange(idx)}
                                    className={`h-7 px-2.5 rounded-full text-xs font-bold flex items-center gap-1 transition-all ${
                                        isCurrent
                                            ? 'bg-amber-500 text-white shadow-xs'
                                            : isFilled
                                            ? 'bg-emerald-50 text-emerald-700 border border-emerald-200 hover:bg-emerald-100'
                                            : 'bg-stone-100 text-stone-600 hover:bg-stone-200'
                                    }`}
                                >
                                    {isFilled && !isCurrent && <IconCheck className="w-3 h-3" />}
                                    <span>{idx + 1}</span>
                                </button>
                            );
                        })}
                    </div>

                    <div className="flex items-center gap-2">
                        {lastSavedAt && (
                            <span className="text-[11px] font-semibold text-emerald-700">
                                {t.threeGoodThings.draftSaved}
                            </span>
                        )}
                        {activeStep > 0 && (
                            <button
                                type="button"
                                onClick={() => onStepChange((activeStep - 1) as 0 | 1)}
                                className="text-xs font-semibold text-amber-700 hover:text-amber-900 bg-amber-50 hover:bg-amber-100 px-2.5 py-1 rounded-full transition-colors whitespace-nowrap"
                            >
                                {isHebrew ? '→ חזרה לרגע הקודם' : `← ${t.threeGoodThings.backToPrevStep}`}
                            </button>
                        )}
                    </div>
                </div>

                {/* Anti-Habituation Reflection Callout Box */}
                <div className="mt-3.5 p-3 rounded-2xl bg-gradient-to-r from-amber-50/80 via-orange-50/50 to-pink-50/60 border border-amber-100/80 flex items-start gap-2.5">
                    <span className="text-amber-500 text-base leading-tight mt-0.5 shrink-0">✨</span>
                    <p className="text-xs leading-relaxed text-stone-700 text-start">
                        <strong className="font-semibold text-amber-900">
                            {t.threeGoodThings.calloutPrefix}
                        </strong>{' '}
                        {callouts[activeStep]}
                    </p>
                </div>

                {/* Question 1: Combined Event & Agency Textarea */}
                <div className="mt-4">
                    <label
                        htmlFor={`moment-description-${activeStep}`}
                        className="block text-sm font-semibold text-stone-800 mb-2 text-start"
                    >
                        {t.threeGoodThings.q1Label}
                    </label>
                    <div className="relative">
                        <textarea
                            id={`moment-description-${activeStep}`}
                            ref={textareaRef}
                            dir={isHebrew ? 'rtl' : 'ltr'}
                            rows={4}
                            value={currentItem.act}
                            onChange={(e) => handleQuestion1Change(e.target.value)}
                            onFocus={handleTextareaFocus}
                            placeholder={t.threeGoodThings.q1Placeholder}
                            className="w-full min-h-[120px] text-sm sm:text-base rounded-2xl border border-stone-200 focus:border-amber-400 focus:ring-2 focus:ring-amber-200/60 focus:outline-none p-3.5 pb-8 placeholder:text-stone-400 text-stone-800 bg-white resize-none leading-relaxed transition-all text-start box-border"
                        />
                        <div className="absolute bottom-2.5 end-3 text-[11px] text-stone-400 select-none pointer-events-none">
                            {t.threeGoodThings.privacyBadge}
                        </div>
                    </div>

                    {validationError && (
                        <p role="alert" className="mt-1.5 text-xs font-semibold text-rose-600 text-start">
                            {validationError}
                        </p>
                    )}
                </div>

                {/* Question 2: Interactive Strength Tagging Chips + Custom Input */}
                <div className="mt-4 pt-3.5 border-t border-stone-100">
                    <div className="flex items-center justify-between mb-2.5 gap-2">
                        <label
                            htmlFor={`moment-strength-input-${activeStep}`}
                            className="text-sm font-semibold text-stone-800 text-start"
                        >
                            {t.threeGoodThings.q2Label}
                        </label>
                        <span className="text-amber-600 text-xs font-semibold shrink-0">
                            {t.threeGoodThings.q2Choose}
                        </span>
                    </div>

                    <div className="flex flex-wrap gap-2 mb-3">
                        {strengthChips.map((chip) => {
                            const isActive = selectedTokens.includes(chip.token);
                            return (
                                <button
                                    key={chip.id}
                                    type="button"
                                    aria-pressed={isActive}
                                    onClick={() => handleToggleChip(chip.token)}
                                    className={`px-3 py-1.5 rounded-full text-xs flex items-center gap-1.5 transition-all active:scale-95 ${
                                        isActive
                                            ? 'bg-amber-500 text-white font-bold shadow-sm border border-amber-500'
                                            : 'bg-stone-50 text-stone-700 border border-stone-200 hover:bg-amber-50/70 hover:border-amber-300 font-medium'
                                    }`}
                                >
                                    <span>{chip.emoji}</span>
                                    <span>{chip.label}</span>
                                </button>
                            );
                        })}
                    </div>

                    <input
                        id={`moment-strength-input-${activeStep}`}
                        type="text"
                        dir={isHebrew ? 'rtl' : 'ltr'}
                        value={customText}
                        onChange={(e) => handleCustomStrengthChange(e.target.value)}
                        placeholder={t.threeGoodThings.customStrengthPlaceholder}
                        className="w-full text-xs sm:text-sm rounded-xl border border-stone-200 focus:border-amber-400 focus:ring-2 focus:ring-amber-200/50 focus:outline-none py-2.5 px-3 text-stone-700 placeholder:text-stone-400 bg-white text-start box-border"
                    />
                </div>

                {/* Offline Deterministic 5-Dimension Neural Depth Trigger & Panel */}
                <div className="mt-4 pt-3 space-y-3">
                    <button
                        type="button"
                        onClick={handleAiAssist}
                        className="w-full py-2.5 px-4 rounded-2xl bg-gradient-to-r from-violet-50 via-amber-50 to-rose-50 border border-amber-200/70 hover:border-amber-300 flex items-center justify-center gap-2 text-xs font-semibold text-stone-700 shadow-xs active:scale-[0.99] transition-all"
                    >
                        <span className="animate-gentle text-amber-500">✨</span>
                        <span>{t.threeGoodThings.aiButton}</span>
                        <span className="text-[10px] bg-white px-2 py-0.5 rounded-full text-violet-700 font-bold shadow-2xs border border-violet-100">
                            {t.threeGoodThings.aiNewBadge}
                        </span>
                    </button>

                    {/* Branch A: Inspiration starter when Q1 is empty */}
                    {currentInspiration && (
                        <div className="p-3.5 rounded-2xl bg-amber-50/90 border border-amber-200 text-xs sm:text-sm text-stone-800 space-y-2 animate-fadeIn text-start">
                            <div className="font-bold text-amber-950">
                                {isHebrew ? '✨ רעיון להשראה:' : '✨ Inspiration Prompt:'}
                            </div>
                            <p className="leading-relaxed text-stone-700">{currentInspiration.message}</p>
                            <button
                                type="button"
                                onClick={() => handleUseStarter(currentInspiration.starterPrompt)}
                                className="px-3 py-1.5 rounded-xl bg-amber-500 hover:bg-amber-600 text-white text-xs font-bold transition-colors shadow-2xs"
                            >
                                {isHebrew ? 'השתמש כהתחלה ✓' : 'Use as starter ✓'}
                            </button>
                        </div>
                    )}

                    {/* Branch B: Live 5-Dimension Neural Depth Card (1–5 ✨) + Upgrade Chips + WhatsApp Visit */}
                    {isRubricVisible && (
                        <div
                            data-purpose="neural-depth-card"
                            className="p-4 rounded-2xl bg-gradient-to-br from-amber-50/90 via-white to-emerald-50/60 border border-amber-200/90 shadow-xs space-y-3 animate-fadeIn text-start"
                        >
                            {/* Rubric Score Badge */}
                            <div className="flex items-center justify-between gap-2">
                                <span className="inline-flex items-center gap-1.5 px-3 py-1 rounded-full bg-amber-100 text-amber-900 border border-amber-300 text-xs font-extrabold">
                                    <span>{t.threeGoodThings.rubricBadge}</span>
                                    <span dir="ltr">{liveEvaluation.score}/5 ✨</span>
                                </span>
                                <span className="text-[11px] font-semibold text-stone-500">
                                    {liveEvaluation.score === 5
                                        ? (isHebrew ? 'עומק מרבי!' : 'Peak depth!')
                                        : (isHebrew ? 'לחץ לשדרוג הרגע' : 'Tap chip to deepen')}
                                </span>
                            </div>

                            {/* 5 Visual Neural Pillar Pills */}
                            <div className="flex flex-wrap gap-1.5">
                                {pillarItems.map((pillar) => (
                                    <span
                                        key={pillar.key}
                                        className={`px-2.5 py-1 rounded-full text-[11px] border transition-colors ${
                                            pillar.active
                                                ? 'bg-emerald-100 text-emerald-900 border-emerald-300 font-bold'
                                                : 'bg-stone-100/80 text-stone-500 border-stone-200 font-medium'
                                        }`}
                                    >
                                        {pillar.label}
                                    </span>
                                ))}
                            </div>

                            {/* Empowering Reflection */}
                            <p className="text-xs sm:text-sm text-stone-800 leading-relaxed font-medium">
                                {liveEvaluation.empoweringFeedback}
                            </p>

                            {/* Gentle Upgrade Prompt + 3 Clickable Upgrade Chips */}
                            {liveEvaluation.score < 5 && liveEvaluation.upgradeChips.length > 0 && (
                                <div className="pt-2 border-t border-amber-200/60 space-y-2">
                                    <p className="text-xs font-semibold text-amber-950">
                                        {liveEvaluation.upgradePrompt}
                                    </p>
                                    <div className="flex flex-wrap gap-1.5">
                                        {liveEvaluation.upgradeChips.map((chip, cIdx) => (
                                            <button
                                                key={cIdx}
                                                type="button"
                                                onClick={() =>
                                                    handleApplyUpgradeChip(
                                                        chip,
                                                        liveEvaluation.missingDimensionKey
                                                    )
                                                }
                                                className="text-xs px-2.5 py-1.5 rounded-xl bg-white hover:bg-amber-50 text-amber-950 border border-amber-300 font-semibold transition-all shadow-2xs active:scale-95 text-start"
                                            >
                                                + {chip}
                                            </button>
                                        ))}
                                    </div>
                                </div>
                            )}

                            {/* Phase 2: WhatsApp Micro-Gratitude Visit Button */}
                            {canSendWhatsapp && (
                                <div className="pt-2 border-t border-emerald-200/70">
                                    <a
                                        href={`https://wa.me/?text=${encodeURIComponent(
                                            liveEvaluation.whatsappDraft
                                        )}`}
                                        target="_blank"
                                        rel="noopener noreferrer"
                                        onClick={() => {
                                            StorageService.markGratitudeShared();
                                        }}
                                        className="w-full py-2.5 px-4 rounded-xl bg-emerald-600 hover:bg-emerald-700 text-white font-bold text-xs flex items-center justify-center gap-2 shadow-sm transition-all active:scale-[0.99] no-underline text-center"
                                    >
                                        <span>{t.threeGoodThings.whatsappBtn}</span>
                                    </a>
                                </div>
                            )}
                        </div>
                    )}
                </div>
            </section>

            {/* Phase 3: Mood / Wellbeing Rating Card (Visible on Step 3 OR MVE Early-Finish) */}
            {showMoodScale && (
                <section
                    data-purpose="mood-scale"
                    className="bg-white rounded-3xl p-4 shadow-soft-card border border-amber-100/80 w-full box-border animate-fadeIn"
                >
                    <div className="text-center mb-3">
                        <h3 className="text-sm font-bold text-stone-900">
                            {t.threeGoodThings.feelingTitle}
                        </h3>
                        <p className="text-[11px] text-stone-500 mt-0.5">
                            {t.threeGoodThings.feelingSubtitle}
                        </p>
                    </div>

                    {/* 1 to 7 Scale Selector (1 on Right in RTL, 7 on Left in RTL) */}
                    <div
                        dir={isHebrew ? 'rtl' : 'ltr'}
                        className="flex justify-between items-center px-1 max-w-sm mx-auto gap-1"
                    >
                        {[1, 2, 3, 4, 5, 6, 7].map((num) => {
                            const isSelected = currentFeeling === num;
                            return (
                                <button
                                    key={num}
                                    type="button"
                                    onClick={() => handleAffectChange(num)}
                                    aria-pressed={isSelected}
                                    aria-label={isHebrew ? `דרגה ${num}` : `Rating ${num}`}
                                    className={`rounded-full flex items-center justify-center transition-all ${
                                        isSelected
                                            ? 'w-10 h-10 text-sm font-bold text-white bg-amber-400 bg-gradient-to-tr from-amber-500 to-amber-400 shadow-md shadow-glow-amber scale-110 ring-4 ring-amber-100'
                                            : 'w-9 h-9 text-xs font-medium text-stone-600 bg-stone-50 hover:bg-stone-100 border border-stone-200'
                                    }`}
                                >
                                    {num}
                                </button>
                            );
                        })}
                    </div>

                    {/* 3 Scale Anchor Labels with Dynamic Center Indicator */}
                    <div className="flex justify-between items-center text-[10px] sm:text-[11px] text-stone-500 mt-3 px-1 gap-2">
                        <span className="text-start">{t.threeGoodThings.feelingLow}</span>
                        <span className="text-center font-bold text-amber-700 bg-amber-50 px-2 py-0.5 rounded-full border border-amber-100">
                            {getFeelingDescription(currentFeeling, isHebrew)}
                        </span>
                        <span className="text-end">{t.threeGoodThings.feelingHigh}</span>
                    </div>
                </section>
            )}
        </div>
    );
};
