import React, { useState } from 'react';
import type { ThreeGoodThingsItem, UserProfile, Locale, EmpiricalHistoricalContext } from '../../types';
import { PastelCard, type PastelVariant } from '../common/PastelCard';
import { AiService, type EvaluationResult } from '../../services/aiService';
import { FirestoreService } from '../../services/firestoreService';
import { PromptEngine, TARGET_DESCRIPTIONS, LENS_DESCRIPTIONS } from '../../services/promptEngine';
import { getDictionary } from '../../locales';
import { IconCheck, IconSparkles } from '../common/SvgIcon';

interface ThreeGoodThingsFormProps {
    items: ThreeGoodThingsItem[];
    activeStep: number;
    onSelectStep: (step: number) => void;
    userProfile: UserProfile;
    empiricalContext?: EmpiricalHistoricalContext | null;
    onChange: (stepIndex: number, updated: ThreeGoodThingsItem) => void;
    onCompleted?: (result?: EvaluationResult) => void;
}

const STEP_VARIANTS: PastelVariant[] = ['peach', 'sage', 'lavender'];

export const ThreeGoodThingsForm: React.FC<ThreeGoodThingsFormProps> = ({
    items,
    activeStep,
    onSelectStep,
    userProfile,
    empiricalContext,
    onChange,
    onCompleted,
}) => {
    const locale: Locale = userProfile.locale || (userProfile.language === 'hebrew' ? 'he' : 'en');
    const t = getDictionary(locale);

    const [isEvaluating, setIsEvaluating] = useState(false);
    const [lastEvaluation, setLastEvaluation] = useState<EvaluationResult | null>(null);

    const activeItem = items[activeStep] || {
        act: '',
        benefactor: '',
        benefit: '',
        causalReflection: '',
        affectRating: 5,
    };

    const variant = STEP_VARIANTS[activeStep % STEP_VARIANTS.length];

    // Compute modular prompt engine guidance based on verified empirical context
    const promptConfig = PromptEngine.getDailyConfig(
        activeStep,
        userProfile,
        empiricalContext || undefined
    );
    const targetHint = TARGET_DESCRIPTIONS[promptConfig.target]?.[locale];
    const lensHint = LENS_DESCRIPTIONS[promptConfig.lens]?.[locale];

    // Suggestion chips for agency attribution
    const suggestionChips = locale === 'he'
        ? [
            'ביקשתי או קיבלתי עזרה בפתיחות',
            'יזמתי פנייה או שיחה',
            'עצרתי להעריך את הרגע',
        ]
        : [
            'I asked for or accepted help openly',
            'I initiated a conversation or reach-out',
            'I paused to notice and appreciate the moment',
        ];

    const handleQuestion1Change = (val: string) => {
        onChange(activeStep, {
            ...activeItem,
            act: val,
            benefit: val, // maintain Firestore schema backwards-compatibility
        });
        if (lastEvaluation) setLastEvaluation(null);
    };

    const handleQuestion2Change = (val: string) => {
        onChange(activeStep, {
            ...activeItem,
            causalReflection: val,
        });
        if (lastEvaluation) setLastEvaluation(null);
    };

    const handleChipClick = (chipText: string) => {
        const current = activeItem.causalReflection.trim();
        const nextVal = current ? `${current}, ${chipText}` : chipText;
        handleQuestion2Change(nextVal);
    };

    const handleAffectChange = (score: number) => {
        // Set affect rating across all items so completion persists the feeling scale
        items.forEach((_, idx) => {
            onChange(idx, {
                ...items[idx],
                affectRating: score,
            });
        });
    };

    const handleEvaluate = async () => {
        if (!activeItem.act.trim() || !activeItem.causalReflection.trim()) {
            return;
        }

        setIsEvaluating(true);
        try {
            let context = empiricalContext;
            if (!context && userProfile.userId) {
                try {
                    context = await FirestoreService.getEmpiricalHistoricalContext(userProfile.userId);
                } catch (err) {
                    console.warn('Could not fetch empirical context from Firestore:', err);
                }
            }

            const result = await AiService.evaluateItem(activeItem, userProfile, context || undefined);
            setLastEvaluation(result);
            if (onCompleted) {
                onCompleted(result);
            }
        } catch (error) {
            console.error('Failed to evaluate gratitude item:', error);
        } finally {
            setIsEvaluating(false);
        }
    };

    const isCurrentItemFilled =
        activeItem.act.trim().length >= 4 &&
        activeItem.causalReflection.trim().length >= 4;

    const currentFeeling = activeItem.affectRating || 5;

    return (
        <div className="w-full max-w-full min-w-0 box-border space-y-4">
            {/* 1. All 3 Good Things Overview Cards on One Screen */}
            <div className="w-full min-w-0 box-border">
                <div className="flex items-center justify-between mb-2 px-1">
                    <span className="text-sm font-bold text-neutral-800">
                        {t.threeGoodThings.overviewTitle}
                    </span>
                    <span className="text-xs font-semibold text-neutral-500">
                        {locale === 'he' ? 'לחץ על כל רגע לעריכה' : 'Tap any moment to view'}
                    </span>
                </div>

                <div className="grid grid-cols-1 sm:grid-cols-3 gap-2 w-full min-w-0 box-border">
                    {items.map((it, idx) => {
                        const isFilled = it.act.trim().length >= 4 && it.causalReflection.trim().length >= 4;
                        const isCurrent = activeStep === idx;

                        return (
                            <button
                                key={idx}
                                type="button"
                                onClick={() => onSelectStep(idx)}
                                className={`text-start p-3 rounded-2xl border transition-all w-full min-w-0 box-border ${
                                    isCurrent
                                        ? 'bg-white shadow-md border-amber-400 ring-2 ring-amber-300/60'
                                        : 'bg-white/70 hover:bg-white border-black/10'
                                }`}
                            >
                                <div className="flex items-center justify-between gap-1 mb-1 w-full min-w-0">
                                    <span className="text-xs font-bold text-neutral-900 truncate">
                                        {locale === 'he' ? `דבר טוב ${idx + 1}` : `Good Thing ${idx + 1}`}
                                    </span>
                                    {isFilled ? (
                                        <span className="inline-flex items-center gap-1 text-[11px] font-bold text-emerald-700 bg-emerald-100 px-2 py-0.5 rounded-full shrink-0">
                                            <IconCheck className="w-3.5 h-3.5 text-emerald-700" />
                                            <span>{locale === 'he' ? 'הושלם' : 'Done'}</span>
                                        </span>
                                    ) : (
                                        <span className="text-[11px] font-medium text-neutral-400 shrink-0">
                                            {isCurrent
                                                ? (locale === 'he' ? 'עורך כעת...' : 'Writing...')
                                                : (locale === 'he' ? 'טרם נכתב' : 'Pending')}
                                        </span>
                                    )}
                                </div>
                                <p className="text-xs text-neutral-600 truncate max-w-full">
                                    {it.act.trim() || (locale === 'he' ? 'לחץ כאן למילוי...' : 'Tap to write...')}
                                </p>
                            </button>
                        );
                    })}
                </div>
            </div>

            {/* 2. Active Moment Form Card (2 Warm, Human Fields) */}
            <PastelCard
                variant={variant}
                title={locale === 'he' ? `רגע טוב ${activeStep + 1} מתוך 3` : `Good Moment ${activeStep + 1} of 3`}
                subtitle={t.threeGoodThings.subtitle}
                badge={
                    <span dir="ltr" className="inline-block font-bold">
                        {activeStep + 1} / 3
                    </span>
                }
                elevated
                className="w-full max-w-full min-w-0 box-border"
            >
                <div className="space-y-4 pt-1 w-full min-w-0 box-border">
                    {/* Prompt Focus Lens (Empirical Neuroscience) */}
                    {targetHint && lensHint && (
                        <div className="w-full min-w-0 box-border p-3.5 bg-white/80 rounded-xl border border-black/5 text-sm text-neutral-700 space-y-1 break-words">
                            <div className="font-bold text-neutral-900 break-words">
                                💡 {locale === 'he' ? 'זווית התבוננות מומלצת להיום:' : 'Recommended focus lens for today:'}
                            </div>
                            <p className="leading-relaxed break-words text-neutral-600">
                                {targetHint} <span className="opacity-40">|</span> {lensHint}
                            </p>
                        </div>
                    )}

                    {/* Question 1: What was the good moment and who was part of it? */}
                    <div className="w-full min-w-0 box-border">
                        <label className="block text-sm sm:text-base font-bold text-neutral-900 mb-1.5 text-start break-words">
                            {t.threeGoodThings.moment1Label}
                        </label>
                        <textarea
                            value={activeItem.act}
                            onChange={(e) => handleQuestion1Change(e.target.value)}
                            placeholder={t.threeGoodThings.moment1Placeholder}
                            rows={3}
                            className="w-full min-w-0 box-border text-base sm:text-lg rounded-xl p-3.5 bg-white/95 border border-black/15 focus:outline-none focus:ring-2 focus:ring-amber-500/40 transition-all text-neutral-800 resize-none shadow-xs text-start leading-relaxed"
                        />
                    </div>

                    {/* Question 2: How did I contribute? (Humanized Agency without Jargon) */}
                    <div className="w-full min-w-0 box-border rounded-2xl p-4 bg-amber-50/90 border border-amber-200">
                        <label className="block text-sm sm:text-base font-black text-amber-950 mb-1 text-start break-words">
                            {t.threeGoodThings.moment2Label}
                        </label>
                        <p className="text-xs sm:text-sm text-amber-900/90 mb-3 leading-relaxed text-start break-words">
                            {t.threeGoodThings.moment2Helper}
                        </p>

                        {/* 3 Quick-Tap Suggestion Chips */}
                        <div className="mb-3 flex flex-wrap items-center gap-1.5 w-full">
                            <span className="text-xs font-bold text-amber-950/80 w-full mb-0.5">
                                {locale === 'he' ? 'רעיונות לפעולה קטנה:' : 'Helpful starters:'}
                            </span>
                            {suggestionChips.map((chip, chipIdx) => (
                                <button
                                    key={chipIdx}
                                    type="button"
                                    onClick={() => handleChipClick(chip)}
                                    className="text-xs px-2.5 py-1.5 bg-white hover:bg-amber-100 text-amber-950 rounded-lg border border-amber-300 font-medium transition-all shadow-2xs hover:scale-[1.02] active:scale-95 text-start break-words"
                                >
                                    + {chip}
                                </button>
                            ))}
                        </div>

                        <textarea
                            value={activeItem.causalReflection}
                            onChange={(e) => handleQuestion2Change(e.target.value)}
                            placeholder={t.threeGoodThings.moment2Placeholder}
                            rows={2}
                            className="w-full min-w-0 box-border text-base sm:text-lg rounded-xl p-3 bg-white border border-amber-300 focus:outline-none focus:ring-2 focus:ring-amber-500/50 transition-all text-neutral-800 resize-none shadow-xs text-start leading-relaxed"
                        />
                    </div>

                    {/* AI Reflection Feedback (Warm, 0 Numeric Grades) */}
                    {lastEvaluation && (
                        <div className="w-full min-w-0 box-border rounded-2xl p-4 bg-emerald-50 border border-emerald-300 text-sm shadow-xs space-y-1.5 break-words animate-fadeIn">
                            <div className="flex items-center gap-2 font-bold text-emerald-950">
                                <IconSparkles className="w-4 h-4 text-emerald-700" />
                                <span>{t.threeGoodThings.encouragingInsight}</span>
                            </div>
                            <p className="text-emerald-900 leading-relaxed break-words font-medium">
                                {lastEvaluation.feedback}
                            </p>
                            {lastEvaluation.recommendedEnhancement && (
                                <p className="text-emerald-800 text-xs italic break-words mt-1">
                                    💡 {lastEvaluation.recommendedEnhancement}
                                </p>
                            )}
                        </div>
                    )}

                    {/* AI Reflection Trigger Button */}
                    <div className="pt-1">
                        <button
                            type="button"
                            onClick={handleEvaluate}
                            disabled={!isCurrentItemFilled || isEvaluating}
                            className={`w-full min-w-0 box-border py-2.5 px-4 rounded-xl text-xs sm:text-sm font-bold tracking-wide transition-all duration-200 flex items-center justify-center gap-2 shadow-xs ${
                                !isCurrentItemFilled || isEvaluating
                                    ? 'bg-neutral-200 text-neutral-400 cursor-not-allowed'
                                    : 'bg-neutral-800 hover:bg-neutral-900 text-white active:scale-[0.99]'
                            }`}
                        >
                            {isEvaluating ? (
                                <span>{t.common.checking}</span>
                            ) : (
                                <span className="flex items-center gap-1.5">
                                    <IconSparkles className="w-4 h-4" />
                                    <span>
                                        {lastEvaluation
                                            ? (locale === 'he' ? 'רענן תובנה מעודדת' : 'Refresh Reflection')
                                            : (locale === 'he' ? 'קבל תובנה מעודדת מה-AI ✨' : 'Get Encouraging Reflection ✨')}
                                    </span>
                                </span>
                            )}
                        </button>
                    </div>
                </div>
            </PastelCard>

            {/* 3. Clarified 1-7 Feeling Scale (Single, Warm Question at Bottom) */}
            <div className="w-full min-w-0 box-border p-4 bg-white/90 rounded-2xl border border-black/10 shadow-xs space-y-3">
                <div className="w-full min-w-0 text-start">
                    <h4 className="text-sm sm:text-base font-bold text-neutral-900 break-words">
                        {t.threeGoodThings.feelingTitle}
                    </h4>
                    <p className="text-xs text-neutral-500 mt-0.5">
                        {locale === 'he'
                            ? 'מדידת תחושת ההקלה והרוגע בסיום הכתיבה (ללא מבחן או ציונים)'
                            : 'Tracking emotional relief and calm after writing'}
                    </p>
                </div>

                {/* 1-7 Likert Buttons in explicit LTR flex container */}
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

                {/* Endpoint Descriptions */}
                <div className="flex items-center justify-between text-xs text-neutral-600 font-medium px-1">
                    <span className="text-start">{t.threeGoodThings.feelingLow}</span>
                    <span className="text-end">{t.threeGoodThings.feelingHigh}</span>
                </div>
            </div>
        </div>
    );
};
