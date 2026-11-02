import React, { useState } from 'react';
import type { ThreeGoodThingsItem, UserProfile, Locale, EmpiricalHistoricalContext } from '../../types';
import { PastelCard, type PastelVariant } from '../common/PastelCard';
import { AiService, type EvaluationResult } from '../../services/aiService';
import { FirestoreService } from '../../services/firestoreService';
import { PromptEngine, TARGET_DESCRIPTIONS, LENS_DESCRIPTIONS } from '../../services/promptEngine';
import { getDictionary } from '../../locales';

interface ThreeGoodThingsFormProps {
    stepIndex: number; // 0, 1, 2
    userProfile: UserProfile;
    item: ThreeGoodThingsItem;
    empiricalContext?: EmpiricalHistoricalContext | null;
    onChange: (updated: ThreeGoodThingsItem) => void;
    onCompleted?: (result?: EvaluationResult) => void;
}

const STEP_VARIANTS: PastelVariant[] = ['peach', 'sage', 'lavender'];

export const ThreeGoodThingsForm: React.FC<ThreeGoodThingsFormProps> = ({
    stepIndex,
    userProfile,
    item,
    empiricalContext,
    onChange,
    onCompleted,
}) => {
    const locale: Locale = userProfile.locale || (userProfile.language === 'hebrew' ? 'he' : 'en');
    const t = getDictionary(locale);

    const [isEvaluating, setIsEvaluating] = useState(false);
    const [lastEvaluation, setLastEvaluation] = useState<EvaluationResult | null>(null);

    const variant = STEP_VARIANTS[stepIndex % STEP_VARIANTS.length];

    // Compute modular prompt engine guidance based on verified empirical context
    const promptConfig = PromptEngine.getDailyConfig(
        stepIndex,
        userProfile,
        empiricalContext || undefined
    );
    const targetHint = TARGET_DESCRIPTIONS[promptConfig.target]?.[locale];
    const lensHint = LENS_DESCRIPTIONS[promptConfig.lens]?.[locale];

    const handleFieldChange = (field: keyof ThreeGoodThingsItem, val: string | number) => {
        onChange({
            ...item,
            [field]: val,
        });
        if (lastEvaluation) {
            setLastEvaluation(null);
        }
    };

    const handleEvaluate = async () => {
        if (!item.act.trim() || !item.benefit.trim() || !item.causalReflection.trim()) {
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

            const result = await AiService.evaluateItem(item, userProfile, context || undefined);
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

    const isFormFilled =
        item.act.trim().length >= 4 &&
        item.benefit.trim().length >= 4 &&
        item.causalReflection.trim().length >= 4;

    return (
        <PastelCard
            variant={variant}
            title={t.threeGoodThings.title}
            subtitle={t.threeGoodThings.subtitle}
            badge={t.threeGoodThings.stepBadge.replace('{step}', String(stepIndex + 1))}
            elevated
            className="w-full mb-6"
        >
            <div className="space-y-4 pt-2">
                {/* Empirical Neuroscience Focus Prompt */}
                {targetHint && lensHint && (
                    <div className="p-3 bg-white/70 rounded-xl border border-black/5 text-xs text-neutral-600 space-y-1">
                        <div className="font-bold text-neutral-800">
                            💡 {locale === 'he' ? 'זווית התבוננות מומלצת להיום:' : 'Recommended focus lens for today:'}
                        </div>
                        <p className="leading-relaxed">
                            {targetHint} <span className="opacity-40">|</span> {lensHint}
                        </p>
                    </div>
                )}

                {/* Field 1: Concrete Act */}
                <div>
                    <label className="block text-xs font-bold uppercase tracking-wider mb-1 opacity-80">
                        {t.threeGoodThings.actLabel}
                    </label>
                    <textarea
                        value={item.act}
                        onChange={(e) => handleFieldChange('act', e.target.value)}
                        placeholder={t.threeGoodThings.actPlaceholder}
                        rows={2}
                        className="w-full text-sm rounded-xl p-3 bg-white/90 border border-black/10 focus:outline-none focus:ring-2 focus:ring-amber-500/30 transition-all text-neutral-800 resize-none shadow-xs"
                    />
                </div>

                {/* Field 2 & 3: Benefactor & Benefit */}
                <div className="grid grid-cols-1 sm:grid-cols-2 gap-3">
                    <div>
                        <label className="block text-xs font-bold uppercase tracking-wider mb-1 opacity-80">
                            {t.threeGoodThings.benefactorLabel}
                        </label>
                        <input
                            type="text"
                            value={item.benefactor || ''}
                            onChange={(e) => handleFieldChange('benefactor', e.target.value)}
                            placeholder={t.threeGoodThings.benefactorPlaceholder}
                            className="w-full text-sm rounded-xl p-2.5 bg-white/90 border border-black/10 focus:outline-none focus:ring-2 focus:ring-amber-500/30 transition-all text-neutral-800 shadow-xs"
                        />
                    </div>

                    <div>
                        <label className="block text-xs font-bold uppercase tracking-wider mb-1 opacity-80">
                            {t.threeGoodThings.benefitLabel}
                        </label>
                        <input
                            type="text"
                            value={item.benefit}
                            onChange={(e) => handleFieldChange('benefit', e.target.value)}
                            placeholder={t.threeGoodThings.benefitPlaceholder}
                            className="w-full text-sm rounded-xl p-2.5 bg-white/90 border border-black/10 focus:outline-none focus:ring-2 focus:ring-amber-500/30 transition-all text-neutral-800 shadow-xs"
                        />
                    </div>
                </div>

                {/* Field 4: Mandatory Causal Reflection (Agency Attribution) */}
                <div className="rounded-xl p-3.5 bg-amber-50/80 border border-amber-200">
                    <label className="block text-xs font-black uppercase tracking-wider mb-1 text-amber-950">
                        {t.threeGoodThings.agencyLabel}
                    </label>
                    <p className="text-xs text-amber-900/90 mb-2 leading-relaxed">
                        {t.threeGoodThings.agencyHelper}
                    </p>
                    <textarea
                        value={item.causalReflection}
                        onChange={(e) => handleFieldChange('causalReflection', e.target.value)}
                        placeholder={t.threeGoodThings.agencyPlaceholder}
                        rows={2}
                        className="w-full text-sm rounded-xl p-3 bg-white border border-amber-300 focus:outline-none focus:ring-2 focus:ring-amber-500/40 transition-all text-neutral-800 resize-none shadow-xs"
                    />
                </div>

                {/* Field 5: Affect Rating (1-7 Likert) */}
                <div className="p-3 bg-white/80 rounded-xl border border-black/5 shadow-xs space-y-1.5">
                    <div className="flex items-center justify-between text-xs font-bold text-neutral-700">
                        <span>{t.threeGoodThings.affectLabel}</span>
                        <span className="text-amber-800 text-sm font-black">{item.affectRating || 5} / 7</span>
                    </div>
                    <div className="flex items-center justify-between gap-1">
                        {[1, 2, 3, 4, 5, 6, 7].map((num) => (
                            <button
                                key={num}
                                type="button"
                                onClick={() => handleFieldChange('affectRating', num)}
                                className={`w-8 h-8 rounded-lg text-xs font-bold transition-all ${
                                    (item.affectRating || 5) === num
                                        ? 'bg-amber-600 text-white shadow-sm scale-105'
                                        : 'bg-neutral-100 hover:bg-neutral-200 text-neutral-700'
                                }`}
                            >
                                {num}
                            </button>
                        ))}
                    </div>
                </div>

                {/* Evaluation Feedback */}
                {lastEvaluation && (
                    <div className="rounded-xl p-3.5 bg-white/95 border border-emerald-300 text-xs shadow-xs space-y-1">
                        <div className="flex items-center justify-between font-bold text-emerald-800">
                            <span>Clinical Quality Score:</span>
                            <span className="text-sm px-2 py-0.5 rounded-full bg-emerald-100 text-emerald-900">
                                {lastEvaluation.totalScore} / 100
                            </span>
                        </div>
                        <p className="text-neutral-700">{lastEvaluation.feedback}</p>
                        {lastEvaluation.recommendedEnhancement && (
                            <p className="text-amber-800 italic mt-1 font-medium">
                                💡 {lastEvaluation.recommendedEnhancement}
                            </p>
                        )}
                    </div>
                )}

                {/* Evaluation Trigger Button */}
                <button
                    type="button"
                    onClick={handleEvaluate}
                    disabled={!isFormFilled || isEvaluating}
                    className={`w-full py-2.5 px-4 rounded-xl text-xs sm:text-sm font-bold tracking-wide transition-all duration-200 flex items-center justify-center gap-2 shadow-xs ${
                        !isFormFilled || isEvaluating
                            ? 'bg-neutral-200 text-neutral-400 cursor-not-allowed'
                            : 'bg-neutral-800 hover:bg-neutral-900 text-white active:scale-[0.99]'
                    }`}
                >
                    {isEvaluating ? (
                        <span>{t.common.checking}</span>
                    ) : (
                        <span>
                            {lastEvaluation ? t.common.verified : t.common.check}
                        </span>
                    )}
                </button>
            </div>
        </PastelCard>
    );
};
