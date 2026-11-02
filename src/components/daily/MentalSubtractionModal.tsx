import React, { useState } from 'react';
import type { UserProfile } from '../../types';
import { PastelCard } from '../common/PastelCard';
import { AiService } from '../../services/aiService';

interface MentalSubtractionModalProps {
    userProfile: UserProfile;
    onClose: () => void;
    onCompleted: (reflection: string) => void;
    isHebrew: boolean;
}

export const MentalSubtractionModal: React.FC<MentalSubtractionModalProps> = ({
    userProfile,
    onClose,
    onCompleted,
    isHebrew,
}) => {
    const [blessing, setBlessing] = useState('');
    const [promptThought, setPromptThought] = useState('');
    const [reflection, setReflection] = useState('');
    const [isThinking, setIsThinking] = useState(false);

    const handleGenerateThought = async () => {
        if (!blessing.trim()) return;

        setIsThinking(true);
        try {
            const prompt = await AiService.generateMentalSubtractionPrompt(blessing, userProfile);
            setPromptThought(prompt);
        } catch (error) {
            console.error('Failed to generate mental subtraction prompt:', error);
        } finally {
            setIsThinking(false);
        }
    };

    const handleFinish = () => {
        if (!reflection.trim()) return;
        onCompleted(reflection);
        onClose();
    };

    return (
        <div className="fixed inset-0 z-50 bg-black/40 backdrop-blur-sm flex items-center justify-center p-4 overflow-y-auto">
            <div className="w-full max-w-xl my-8">
                <PastelCard
                    variant="sky"
                    title={isHebrew ? 'תרגיל חיסור מנטלי (Mental Subtraction)' : 'Mental Subtraction Exercise'}
                    subtitle={
                        isHebrew
                            ? 'מניעת הסתגלות הדונית: דמיון החיים ללא הטוב הקיים מעורר הערכה עצבית מחודשת'
                            : 'Countering hedonic adaptation: Visualizing the counterfactual absence of a blessing'
                    }
                    badge={isHebrew ? 'איפוס הדוני' : 'Hedonic Reset'}
                    elevated
                    action={
                        <button
                            onClick={onClose}
                            className="p-1 rounded-full text-neutral-500 hover:text-neutral-800 transition-colors"
                        >
                            ✕
                        </button>
                    }
                >
                    <div className="space-y-4 pt-3 text-neutral-800">
                        <div>
                            <label className="block text-xs font-bold uppercase mb-1">
                                {isHebrew
                                    ? 'בחר ברכה או הישג שקל לקחת כמובן מאליו:'
                                    : 'Identify a blessing or condition you might take for granted:'}
                            </label>
                            <div className="flex gap-2">
                                <input
                                    type="text"
                                    value={blessing}
                                    onChange={(e) => setBlessing(e.target.value)}
                                    placeholder={
                                        isHebrew
                                            ? 'למשל: מקום העבודה שלי, הדירה, בן/בת הזוג, הבריאות'
                                            : 'e.g. My current job, apartment, partner, health'
                                    }
                                    className="flex-1 text-sm rounded-xl p-2.5 bg-white border border-black/10 focus:ring-2 focus:ring-sky-400/40 outline-none"
                                />
                                <button
                                    type="button"
                                    onClick={handleGenerateThought}
                                    disabled={!blessing.trim() || isThinking}
                                    className="px-4 py-2 bg-sky-700 hover:bg-sky-800 text-white rounded-xl text-xs font-bold shadow-sm disabled:opacity-50 transition-all flex-shrink-0"
                                >
                                    {isThinking ? (isHebrew ? 'מייצר...' : 'Thinking...') : (isHebrew ? 'הפעל דמיון' : 'Generate')}
                                </button>
                            </div>
                        </div>

                        {promptThought && (
                            <div className="p-3.5 bg-sky-50 rounded-xl border border-sky-200 text-xs sm:text-sm text-sky-950 font-medium leading-relaxed animate-fadeIn">
                                🌌 {promptThought}
                            </div>
                        )}

                        <div>
                            <label className="block text-xs font-bold uppercase mb-1">
                                {isHebrew ? 'ההרהור שלך: כיצד החיים היו נראים ללא זאת, ומה אתה מרגיש כעת?' : 'Your Reflection:'}
                            </label>
                            <textarea
                                value={reflection}
                                onChange={(e) => setReflection(e.target.value)}
                                placeholder={
                                    isHebrew
                                        ? 'תאר בכנות את החסר שהיה נוצר, ואת תחושת ההקלה וההודיה שהדבר קיים כעת בחייך...'
                                        : 'Describe the void that would exist, and the renewed gratitude returning to reality...'
                                }
                                rows={4}
                                className="w-full text-sm rounded-xl p-3 bg-white border border-black/10 focus:ring-2 focus:ring-sky-400/40 outline-none resize-none"
                            />
                        </div>

                        <div className="flex items-center justify-end gap-3 pt-2">
                            <button
                                type="button"
                                onClick={onClose}
                                className="px-4 py-2 text-xs font-bold text-neutral-600 hover:text-neutral-800 rounded-xl"
                            >
                                {isHebrew ? 'סגור' : 'Close'}
                            </button>
                            <button
                                type="button"
                                onClick={handleFinish}
                                disabled={!reflection.trim()}
                                className="px-5 py-2.5 text-xs sm:text-sm font-bold text-white bg-sky-700 hover:bg-sky-800 rounded-xl shadow-md disabled:opacity-50 transition-all"
                            >
                                {isHebrew ? 'אמץ הרהור זה' : 'Save Reflection'}
                            </button>
                        </div>
                    </div>
                </PastelCard>
            </div>
        </div>
    );
};
