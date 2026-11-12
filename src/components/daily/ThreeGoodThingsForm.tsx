import React, { useState, useRef, useCallback } from 'react';
import type { ThreeGoodThingsItem, UserProfile, Locale, EmpiricalHistoricalContext } from '../../types';
import { PastelCard, type PastelVariant } from '../common/PastelCard';
import { AiService, type EvaluationResult } from '../../services/aiService';
import { FirestoreService } from '../../services/firestoreService';
import { PromptEngine, TARGET_DESCRIPTIONS, LENS_DESCRIPTIONS } from '../../services/promptEngine';
import { getDictionary } from '../../locales';
import { IconCheck, IconSparkles } from '../common/SvgIcon';

interface ThreeGoodThingsFormProps {
    items: ThreeGoodThingsItem[];
    userProfile: UserProfile;
    empiricalContext?: EmpiricalHistoricalContext | null;
    lastSavedAt?: number | null;
    onChange: (stepIndex: number, updated: ThreeGoodThingsItem) => void;
}

const STEP_VARIANTS: PastelVariant[] = ['peach', 'sage', 'lavender'];

export const ThreeGoodThingsForm: React.FC<ThreeGoodThingsFormProps> = ({
    items,
    userProfile,
    empiricalContext,
    lastSavedAt,
    onChange,
}) => {
    // -------------------------------------------------------------------------
    // 1. All useState & useRef Declarations (Strictly physical top - TDZ Prevention)
    // -------------------------------------------------------------------------
    const [evaluatingIndex, setEvaluatingIndex] = useState<number | null>(null);
    const [evaluations, setEvaluations] = useState<Record<number, EvaluationResult | null>>({});

    const textareaRefs = useRef<Array<HTMLTextAreaElement | null>>([null, null, null]);

    const locale: Locale = userProfile.locale || (userProfile.language === 'hebrew' ? 'he' : 'en');
    const isHebrew = locale === 'he';
    const t = getDictionary(locale);

    const suggestionChips = isHebrew
        ? [t.threeGoodThings.chip1, t.threeGoodThings.chip2, t.threeGoodThings.chip3]
        : [t.threeGoodThings.chip1, t.threeGoodThings.chip2, t.threeGoodThings.chip3];

    // -------------------------------------------------------------------------
    // 2. All useCallback Declarations
    // -------------------------------------------------------------------------
    const handleJumpToBox = useCallback((idx: number) => {
        const el = textareaRefs.current[idx];
        if (el) {
            el.focus();
            el.scrollIntoView({ behavior: 'smooth', block: 'center' });
        }
    }, []);

    const handleQuestion1Change = useCallback(
        (idx: number, val: string) => {
            const current = items[idx];
            onChange(idx, {
                ...current,
                act: val,
                benefit: val, // preserve Firestore schema compatibility
            });
            setEvaluations((prev) => (prev[idx] ? { ...prev, [idx]: null } : prev));
        },
        [items, onChange]
    );

    const handleQuestion2Change = useCallback(
        (idx: number, val: string) => {
            const current = items[idx];
            onChange(idx, {
                ...current,
                causalReflection: val,
            });
            setEvaluations((prev) => (prev[idx] ? { ...prev, [idx]: null } : prev));
        },
        [items, onChange]
    );

    const handleChipClick = useCallback(
        (idx: number, chipText: string) => {
            const currentText = (items[idx]?.causalReflection || '').trim();
            const nextVal = currentText ? `${currentText}, ${chipText}` : chipText;
            handleQuestion2Change(idx, nextVal);
        },
        [items, handleQuestion2Change]
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

    const handleEvaluate = useCallback(
        async (idx: number) => {
            const targetItem = items[idx];
            if (!targetItem || !targetItem.act.trim() || !targetItem.causalReflection.trim()) {
                return;
            }

            setEvaluatingIndex(idx);
            try {
                let context = empiricalContext;
                if (!context && userProfile.userId) {
                    try {
                        context = await FirestoreService.getEmpiricalHistoricalContext(userProfile.userId);
                    } catch (err) {
                        console.warn('Could not fetch empirical context from Firestore:', err);
                    }
                }

                const result = await AiService.evaluateItem(targetItem, userProfile, context || undefined);
                setEvaluations((prev) => ({ ...prev, [idx]: result }));
            } catch (error) {
                console.error('Failed to evaluate gratitude item:', error);
            } finally {
                setEvaluatingIndex(null);
            }
        },
        [items, empiricalContext, userProfile]
    );

    const handleInputFocus = useCallback((e: React.FocusEvent<HTMLTextAreaElement>) => {
        const target = e.currentTarget;
        // Slight delay gives Samsung soft keyboard time to resize viewport before centering
        setTimeout(() => {
            target.scrollIntoView({ behavior: 'smooth', block: 'center' });
        }, 120);
    }, []);

    const currentFeeling = items[0]?.affectRating || 5;

    return (
        <div className="w-full max-w-full min-w-0 box-border space-y-4">
            {/* High-Contrast Overview Header & Quick Jump Status Pills */}
            <div className="w-full min-w-0 box-border px-1 space-y-2">
                <div className="flex flex-wrap items-center justify-between gap-2">
                    <h2 className="text-base sm:text-lg font-bold text-white drop-shadow-xs">
                        {t.threeGoodThings.overviewTitle}
                    </h2>
                    {lastSavedAt && (
                        <span className="text-xs font-semibold text-emerald-200 bg-emerald-950/50 border border-emerald-400/30 px-2.5 py-0.5 rounded-full">
                            {t.threeGoodThings.draftSaved}
                        </span>
                    )}
                </div>

                <p className="text-sm text-purple-100/95 font-medium">
                    {t.threeGoodThings.overviewHelper}
                </p>

                {/* Quick Status / Jump Pills (tap focuses direct textarea inside matching card) */}
                <div className="grid grid-cols-3 gap-2 w-full pt-0.5">
                    {items.map((it, idx) => {
                        const isDone = it.act.trim().length >= 4 && it.causalReflection.trim().length >= 4;
                        return (
                            <button
                                key={idx}
                                type="button"
                                onClick={() => handleJumpToBox(idx)}
                                className={`py-2 px-2.5 rounded-xl text-xs font-bold border transition-all flex items-center justify-center gap-1.5 shadow-xs ${
                                    isDone
                                        ? 'bg-emerald-500/90 text-white border-emerald-300'
                                        : 'bg-white/20 hover:bg-white/30 text-white border-white/30'
                                }`}
                            >
                                {isDone && <IconCheck className="w-3.5 h-3.5 text-white" />}
                                <span>{isHebrew ? `רגע ${idx + 1}` : `Moment ${idx + 1}`}</span>
                            </button>
                        );
                    })}
                </div>
            </div>

            {/* All 3 Gratitude Cards Rendered Directly with Accessible <textarea> Inputs */}
            <div className="space-y-4 w-full min-w-0 box-border">
                {items.map((item, idx) => {
                    const variant = STEP_VARIANTS[idx % STEP_VARIANTS.length];
                    const isItemFilled =
                        item.act.trim().length >= 4 && item.causalReflection.trim().length >= 4;
                    const evaluation = evaluations[idx];
                    const isEvaluating = evaluatingIndex === idx;

                    const promptConfig = PromptEngine.getDailyConfig(
                        idx,
                        userProfile,
                        empiricalContext || undefined
                    );
                    const targetHint = TARGET_DESCRIPTIONS[promptConfig.target]?.[locale];
                    const lensHint = LENS_DESCRIPTIONS[promptConfig.lens]?.[locale];

                    return (
                        <PastelCard
                            key={idx}
                            variant={variant}
                            title={isHebrew ? `דבר טוב ${idx + 1}` : `Good Thing ${idx + 1}`}
                            subtitle={idx === 0 ? t.threeGoodThings.subtitle : undefined}
                            badge={
                                isItemFilled ? (
                                    <span className="inline-flex items-center gap-1 text-emerald-800 font-bold">
                                        <IconCheck className="w-3.5 h-3.5 text-emerald-700" />
                                        <span>{isHebrew ? 'מוכן' : 'Ready'}</span>
                                    </span>
                                ) : (
                                    <span dir="ltr" className="inline-block font-bold">
                                        {idx + 1} / 3
                                    </span>
                                )
                            }
                            elevated
                            className="w-full max-w-full min-w-0 box-border"
                        >
                            <div className="space-y-4 pt-1 w-full min-w-0 box-border">
                                {/* Focus Lens Suggestion (concise) */}
                                {targetHint && lensHint && (
                                    <div className="w-full min-w-0 box-border p-3 bg-white/80 rounded-xl border border-black/5 text-xs sm:text-sm text-neutral-700 space-y-0.5 break-words">
                                        <div className="font-bold text-neutral-900">
                                            💡 {isHebrew ? 'זווית מומלצת:' : 'Focus lens:'}{' '}
                                            <span className="font-normal text-neutral-700">
                                                {targetHint} | {lensHint}
                                            </span>
                                        </div>
                                    </div>
                                )}

                                {/* Question 1: Direct Accessible <textarea> */}
                                <div className="w-full min-w-0 box-border">
                                    <label
                                        htmlFor={`gratitude-q1-${idx}`}
                                        className="block text-sm sm:text-base font-bold text-neutral-900 mb-1.5 text-start break-words"
                                    >
                                        {t.threeGoodThings.moment1Label}
                                    </label>
                                    <textarea
                                        id={`gratitude-q1-${idx}`}
                                        ref={(el) => {
                                            textareaRefs.current[idx] = el;
                                        }}
                                        dir={isHebrew ? 'rtl' : 'ltr'}
                                        value={item.act}
                                        onChange={(e) => handleQuestion1Change(idx, e.target.value)}
                                        onFocus={handleInputFocus}
                                        placeholder={t.threeGoodThings.moment1Placeholder}
                                        rows={2}
                                        className="w-full min-w-0 box-border text-base sm:text-lg rounded-xl p-3 bg-white border border-black/15 focus:outline-none focus:ring-2 focus:ring-amber-500/40 transition-all text-neutral-900 placeholder:text-neutral-400 resize-y shadow-xs text-start leading-relaxed"
                                    />
                                </div>

                                {/* Question 2: My Part (Humanized Agency + Quick Suggestion Chips) */}
                                <div className="w-full min-w-0 box-border rounded-2xl p-3.5 bg-amber-50/95 border border-amber-200 space-y-2.5">
                                    <div>
                                        <label
                                            htmlFor={`gratitude-q2-${idx}`}
                                            className="block text-sm sm:text-base font-bold text-amber-950 mb-1 text-start break-words"
                                        >
                                            {t.threeGoodThings.moment2Label}
                                        </label>
                                        <p className="text-xs sm:text-sm text-amber-900/90 leading-relaxed text-start break-words">
                                            {t.threeGoodThings.moment2Helper}
                                        </p>
                                    </div>

                                    {/* 3 Quick-Tap Suggestion Chips */}
                                    <div className="flex flex-wrap items-center gap-1.5 w-full">
                                        {suggestionChips.map((chip, chipIdx) => (
                                            <button
                                                key={chipIdx}
                                                type="button"
                                                onClick={() => handleChipClick(idx, chip)}
                                                className="text-xs px-2.5 py-1.5 bg-white hover:bg-amber-100 text-amber-950 rounded-lg border border-amber-300 font-medium transition-all shadow-2xs active:scale-95 text-start break-words"
                                            >
                                                + {chip}
                                            </button>
                                        ))}
                                    </div>

                                    <textarea
                                        id={`gratitude-q2-${idx}`}
                                        dir={isHebrew ? 'rtl' : 'ltr'}
                                        value={item.causalReflection}
                                        onChange={(e) => handleQuestion2Change(idx, e.target.value)}
                                        onFocus={handleInputFocus}
                                        placeholder={t.threeGoodThings.moment2Placeholder}
                                        rows={2}
                                        className="w-full min-w-0 box-border text-base sm:text-lg rounded-xl p-3 bg-white border border-amber-300 focus:outline-none focus:ring-2 focus:ring-amber-500/50 transition-all text-neutral-900 placeholder:text-neutral-400 resize-y shadow-xs text-start leading-relaxed"
                                    />
                                </div>

                                {/* Warm Encouraging AI Reflection (Zero Numeric Grades) */}
                                {evaluation && (
                                    <div className="w-full min-w-0 box-border rounded-2xl p-3.5 bg-emerald-50 border border-emerald-300 text-sm shadow-xs space-y-1 break-words animate-fadeIn">
                                        <div className="flex items-center gap-2 font-bold text-emerald-950">
                                            <IconSparkles className="w-4 h-4 text-emerald-700" />
                                            <span>{t.threeGoodThings.encouragingInsight}</span>
                                        </div>
                                        <p className="text-emerald-900 leading-relaxed break-words font-medium">
                                            {evaluation.feedback}
                                        </p>
                                        {evaluation.recommendedEnhancement && (
                                            <p className="text-emerald-800 text-xs italic break-words mt-1">
                                                💡 {evaluation.recommendedEnhancement}
                                            </p>
                                        )}
                                    </div>
                                )}

                                {/* Optional Encouraging AI Reflection Trigger */}
                                {isItemFilled && (
                                    <button
                                        type="button"
                                        onClick={() => void handleEvaluate(idx)}
                                        disabled={isEvaluating}
                                        className="w-full min-w-0 box-border py-2 px-3 rounded-xl text-xs font-bold tracking-wide transition-all flex items-center justify-center gap-1.5 bg-neutral-900 hover:bg-black text-white shadow-xs disabled:opacity-60"
                                    >
                                        <IconSparkles className="w-3.5 h-3.5" />
                                        <span>
                                            {isEvaluating
                                                ? t.common.checking
                                                : evaluation
                                                ? (isHebrew ? 'רענן תובנה מעודדת' : 'Refresh Reflection')
                                                : (isHebrew ? 'קבל תובנה מעודדת ✨' : 'Get Encouraging Reflection ✨')}
                                        </span>
                                    </button>
                                )}
                            </div>
                        </PastelCard>
                    );
                })}
            </div>

            {/* Clarified End-of-Practice 1-7 Feeling Scale */}
            <div className="w-full min-w-0 box-border p-4 bg-white/95 rounded-2xl border border-black/10 shadow-sm space-y-3">
                <div className="w-full min-w-0 text-start">
                    <h4 className="text-sm sm:text-base font-bold text-neutral-900 break-words">
                        {t.threeGoodThings.feelingTitle}
                    </h4>
                    <p className="text-xs text-neutral-600 mt-0.5">
                        {isHebrew
                            ? 'מדידת תחושת ההקלה והרוגע בסיום הכתיבה'
                            : 'Tracking emotional relief and calm after writing'}
                    </p>
                </div>

                {/* 1-7 Likert Buttons in explicit LTR container */}
                <div dir="ltr" className="w-full flex items-center justify-between gap-1.5 py-1">
                    {[1, 2, 3, 4, 5, 6, 7].map((num) => (
                        <button
                            key={num}
                            type="button"
                            onClick={() => handleAffectChange(num)}
                            className={`flex-1 min-w-[34px] max-w-[48px] h-11 rounded-xl text-sm font-bold transition-all flex items-center justify-center ${
                                currentFeeling === num
                                    ? 'bg-amber-600 text-white shadow-md scale-105'
                                    : 'bg-neutral-100 hover:bg-neutral-200 text-neutral-800'
                            }`}
                        >
                            {num}
                        </button>
                    ))}
                </div>

                <div className="flex items-center justify-between text-xs text-neutral-700 font-medium px-1">
                    <span className="text-start">{t.threeGoodThings.feelingLow}</span>
                    <span className="text-end">{t.threeGoodThings.feelingHigh}</span>
                </div>
            </div>
        </div>
    );
};
