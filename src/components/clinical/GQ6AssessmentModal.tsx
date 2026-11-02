import React, { useState } from 'react';
import type { UserProfile, GQ6Assessment, Locale } from '../../types';
import { PastelCard } from '../common/PastelCard';
import { FirestoreService } from '../../services/firestoreService';
import { getDictionary } from '../../locales';
import { v4 as uuidv4 } from 'uuid';

interface GQ6AssessmentModalProps {
    userProfile: UserProfile;
    onClose: () => void;
    onCompleted: (assessment: GQ6Assessment) => void;
}

export const GQ6AssessmentModal: React.FC<GQ6AssessmentModalProps> = ({
    userProfile,
    onClose,
    onCompleted,
}) => {
    const locale: Locale = userProfile.locale || (userProfile.language === 'hebrew' ? 'he' : 'en');
    const t = getDictionary(locale);

    const questions = [
        t.gq6.q1,
        t.gq6.q2,
        t.gq6.q3, // Reverse scored
        t.gq6.q4,
        t.gq6.q5,
        t.gq6.q6, // Reverse scored
    ];

    const [scores, setScores] = useState<number[]>([4, 4, 4, 4, 4, 4]);
    const [isSaving, setIsSaving] = useState(false);

    const handleScoreChange = (qIndex: number, val: number) => {
        setScores((prev) => {
            const next = [...prev];
            next[qIndex] = val;
            return next;
        });
    };

    // Calculate score: item 3 and item 6 are reverse scored (8 - score)
    const reverseItem3 = 8 - scores[2];
    const reverseItem6 = 8 - scores[5];
    const totalScore = scores[0] + scores[1] + reverseItem3 + scores[3] + scores[4] + reverseItem6;

    const handleSave = async () => {
        setIsSaving(true);
        try {
            const assessment: GQ6Assessment = {
                assessmentId: uuidv4(),
                userId: userProfile.userId,
                timepoint: 'T1_baseline',
                items: [scores[0], scores[1], scores[2], scores[3], scores[4], scores[5]],
                reverseItem3,
                reverseItem6,
                totalScore,
                completedAt: Date.now(),
            };

            await FirestoreService.saveGQ6Assessment(userProfile.userId, assessment);
            onCompleted(assessment);
            onClose();
        } catch (error) {
            console.error('Failed to save GQ-6 assessment:', error);
        } finally {
            setIsSaving(false);
        }
    };

    return (
        <div className="fixed inset-0 z-50 bg-black/40 backdrop-blur-sm flex items-center justify-center p-4 overflow-y-auto">
            <div className="w-full max-w-2xl my-8">
                <PastelCard
                    variant="peach"
                    title={t.gq6.title}
                    subtitle={t.gq6.subtitle}
                    badge="GQ-6"
                    elevated
                    action={
                        <button
                            type="button"
                            onClick={onClose}
                            className="p-1.5 text-neutral-500 hover:text-neutral-800 transition-colors"
                        >
                            ✕
                        </button>
                    }
                >
                    <div className="space-y-6 pt-3 text-neutral-800">
                        {questions.map((questionText, idx) => (
                            <div key={idx} className="p-3.5 bg-white/80 rounded-xl border border-black/5 shadow-xs space-y-2">
                                <div className="flex items-start justify-between gap-2">
                                    <p className="text-xs sm:text-sm font-semibold leading-relaxed">
                                        <span className="font-bold opacity-70 me-1.5">{idx + 1}.</span>
                                        {questionText}
                                        {(idx === 2 || idx === 5) && (
                                            <span className="text-[10px] font-bold text-amber-700 ms-2 px-1.5 py-0.5 rounded-full bg-amber-100">
                                                {locale === 'he' ? 'ציון הפוך' : 'Reverse Scored'}
                                            </span>
                                        )}
                                    </p>
                                </div>

                                <div className="flex items-center justify-between gap-1 pt-1">
                                    <span className="text-[10px] text-neutral-400 font-medium">1</span>
                                    <div className="flex items-center gap-1 sm:gap-2">
                                        {[1, 2, 3, 4, 5, 6, 7].map((num) => (
                                            <button
                                                key={num}
                                                type="button"
                                                onClick={() => handleScoreChange(idx, num)}
                                                className={`w-7 h-7 sm:w-8 sm:h-8 rounded-lg text-xs font-bold transition-all ${
                                                    scores[idx] === num
                                                        ? 'bg-amber-600 text-white shadow-sm scale-105'
                                                        : 'bg-neutral-100 hover:bg-neutral-200 text-neutral-700'
                                                }`}
                                            >
                                                {num}
                                            </button>
                                        ))}
                                    </div>
                                    <span className="text-[10px] text-neutral-400 font-medium">7</span>
                                </div>
                            </div>
                        ))}

                        {/* Summary & Save */}
                        <div className="flex flex-col sm:flex-row items-center justify-between gap-4 pt-2 p-3 bg-amber-50/70 rounded-xl border border-amber-200">
                            <div>
                                <span className="text-xs font-bold uppercase text-amber-900 block">
                                    {t.gq6.scoreLabel}
                                </span>
                                <span className="text-2xl font-black text-amber-950">
                                    {totalScore} <span className="text-xs font-semibold text-amber-800">/ 42</span>
                                </span>
                            </div>

                            <button
                                type="button"
                                onClick={handleSave}
                                disabled={isSaving}
                                className="w-full sm:w-auto px-6 py-2.5 bg-amber-700 hover:bg-amber-800 text-white text-xs sm:text-sm font-bold rounded-xl shadow-md transition-all disabled:opacity-50"
                            >
                                {isSaving ? t.common.loading : t.common.save}
                            </button>
                        </div>
                    </div>
                </PastelCard>
            </div>
        </div>
    );
};
