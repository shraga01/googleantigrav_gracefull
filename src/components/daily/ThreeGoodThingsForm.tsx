import React, { useState } from 'react';
import type { GratitudeItem, UserProfile } from '../../types';
import { PastelCard, type PastelVariant } from '../common/PastelCard';
import { AiService, type EvaluationResult } from '../../services/aiService';

interface ThreeGoodThingsFormProps {
    stepIndex: number; // 0, 1, 2
    userProfile: UserProfile;
    item: GratitudeItem;
    onChange: (updated: GratitudeItem) => void;
    onCompleted: (result: EvaluationResult) => void;
    isHebrew: boolean;
}

const STEP_VARIANTS: PastelVariant[] = ['peach', 'sage', 'lavender'];

export const ThreeGoodThingsForm: React.FC<ThreeGoodThingsFormProps> = ({
    stepIndex,
    userProfile,
    item,
    onChange,
    onCompleted,
    isHebrew,
}) => {
    const [isEvaluating, setIsEvaluating] = useState(false);
    const [lastEvaluation, setLastEvaluation] = useState<EvaluationResult | null>(null);

    const variant = STEP_VARIANTS[stepIndex % STEP_VARIANTS.length];

    const handleFieldChange = (field: keyof GratitudeItem, val: string) => {
        onChange({
            ...item,
            [field]: val,
        });
        if (lastEvaluation) {
            setLastEvaluation(null); // Invalidate on edit
        }
    };

    const handleEvaluate = async () => {
        if (!item.act.trim() || !item.benefit.trim() || !item.agencyAttribution.trim()) {
            return;
        }

        setIsEvaluating(true);
        try {
            const result = await AiService.evaluateItem(item, userProfile);
            setLastEvaluation(result);
            onCompleted(result);
        } catch (error) {
            console.error('Failed to evaluate gratitude item:', error);
        } finally {
            setIsEvaluating(false);
        }
    };

    const isFormFilled =
        item.act.trim().length >= 4 &&
        item.benefit.trim().length >= 4 &&
        item.agencyAttribution.trim().length >= 4;

    return (
        <PastelCard
            variant={variant}
            title={
                isHebrew
                    ? `רגע חיובי ${stepIndex + 1} מתוך 3: שלושה דברים טובים`
                    : `Positive Moment ${stepIndex + 1} of 3: Three Good Things`
            }
            subtitle={
                isHebrew
                    ? 'פרוטוקול זליגמן: פירוט קונקרטי בצירוף סוכנות אישית וייחוס סיבתי'
                    : 'Seligman Protocol: Concrete specificity paired with personal agency'
            }
            badge={isHebrew ? `שלב ${stepIndex + 1}/3` : `Step ${stepIndex + 1}/3`}
            elevated
            className="w-full mb-6"
        >
            <div className="space-y-4 pt-2">
                {/* Field 1: Concrete Act */}
                <div>
                    <label className="block text-xs font-bold uppercase tracking-wider mb-1 opacity-80">
                        {isHebrew ? '1. מה קרה היום באופן ספציפי? (מעשה קונקרטי)' : '1. What specifically happened today? (Concrete act)'}
                    </label>
                    <textarea
                        value={item.act}
                        onChange={(e) => handleFieldChange('act', e.target.value)}
                        placeholder={
                            isHebrew
                                ? 'לדוגמה: עמיתי לעבודה דני נשאר איתי חצי שעה נוספת לסייע במצגת'
                                : 'e.g. My colleague Danny stayed 30 extra minutes to help with the presentation'
                        }
                        rows={2}
                        className="w-full text-sm rounded-xl p-3 bg-white/90 border border-black/10 focus:outline-none focus:ring-2 focus:ring-amber-500/30 transition-all text-neutral-800 resize-none shadow-sm"
                    />
                </div>

                {/* Field 2: Benefactor */}
                <div className="grid grid-cols-1 sm:grid-cols-2 gap-3">
                    <div>
                        <label className="block text-xs font-bold uppercase tracking-wider mb-1 opacity-80">
                            {isHebrew ? '2. מי היה מעורב?' : '2. Who was involved?'}
                        </label>
                        <input
                            type="text"
                            value={item.benefactor || ''}
                            onChange={(e) => handleFieldChange('benefactor', e.target.value)}
                            placeholder={isHebrew ? 'שם האדם או "אני בעצמי"' : 'Person name or "Myself"'}
                            className="w-full text-sm rounded-xl p-2.5 bg-white/90 border border-black/10 focus:outline-none focus:ring-2 focus:ring-amber-500/30 transition-all text-neutral-800 shadow-sm"
                        />
                    </div>

                    {/* Field 3: Benefit */}
                    <div>
                        <label className="block text-xs font-bold uppercase tracking-wider mb-1 opacity-80">
                            {isHebrew ? '3. כיצד זה היטיב או הקל עליך?' : '3. How did it benefit or ease you?'}
                        </label>
                        <input
                            type="text"
                            value={item.benefit}
                            onChange={(e) => handleFieldChange('benefit', e.target.value)}
                            placeholder={
                                isHebrew
                                    ? 'הספקתי לחזור הביתה לארוחת ערב ברוגע'
                                    : 'Saved me hours and let me relax at home'
                            }
                            className="w-full text-sm rounded-xl p-2.5 bg-white/90 border border-black/10 focus:outline-none focus:ring-2 focus:ring-amber-500/30 transition-all text-neutral-800 shadow-sm"
                        />
                    </div>
                </div>

                {/* Field 4: Mandatory Agency Attribution */}
                <div className="rounded-xl p-3.5 bg-amber-50/70 border border-amber-200/80">
                    <label className="block text-xs font-black uppercase tracking-wider mb-1 text-amber-900">
                        {isHebrew
                            ? '⭐ 4. ייחוס סיבתי וסוכנות אישית (שדה חובה במחקר)'
                            : '⭐ 4. Agency Attribution (Mandatory Research Requirement)'}
                    </label>
                    <p className="text-xs text-amber-800/90 mb-2 leading-relaxed">
                        {isHebrew
                            ? 'מדוע האירוע הטוב התרחש? מה היה חלקך (פנייה, פתיחות, הכנה) או התנאי שאפשר זאת?'
                            : 'Why did this good event occur? What was your personal role or contribution?'}
                    </p>
                    <textarea
                        value={item.agencyAttribution}
                        onChange={(e) => handleFieldChange('agencyAttribution', e.target.value)}
                        placeholder={
                            isHebrew
                                ? 'לדוגמה: ידעתי לבקש עזרה בזמן במקום להיסגר, ויצרתי איתו יחסי אמון בשבועות האחרונים'
                                : 'e.g. I was humble enough to ask for help early and have cultivated trust with him'
                        }
                        rows={2}
                        className="w-full text-sm rounded-xl p-3 bg-white border border-amber-300/80 focus:outline-none focus:ring-2 focus:ring-amber-500/40 transition-all text-neutral-800 resize-none shadow-sm"
                    />
                </div>

                {/* Evaluation Feedback if present */}
                {lastEvaluation && (
                    <div className="rounded-xl p-3.5 bg-white/95 border border-emerald-300 text-xs shadow-sm space-y-1">
                        <div className="flex items-center justify-between font-bold text-emerald-800">
                            <span>{isHebrew ? 'ציון איכות פרוטוקול:' : 'Protocol Quality Score:'}</span>
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
                    className={`w-full py-2.5 px-4 rounded-xl text-xs sm:text-sm font-bold tracking-wide transition-all duration-200 flex items-center justify-center gap-2 shadow-sm ${
                        !isFormFilled || isEvaluating
                            ? 'bg-neutral-200 text-neutral-400 cursor-not-allowed'
                            : 'bg-neutral-800 hover:bg-neutral-900 text-white active:scale-[0.99]'
                    }`}
                >
                    {isEvaluating ? (
                        <span>{isHebrew ? 'מאמת ייחוס סיבתי ומדייק...' : 'Verifying Agency Attribution...'}</span>
                    ) : (
                        <span>
                            {lastEvaluation
                                ? isHebrew ? '✓ אומת בהצלחה (לחץ לבדיקה חוזרת)' : '✓ Verified (Click to re-verify)'
                                : isHebrew ? 'בדוק דיוק מדעי וסוכנות' : 'Verify Clinical Quality & Agency'}
                        </span>
                    )}
                </button>
            </div>
        </PastelCard>
    );
};
