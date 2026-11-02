import React, { useState } from 'react';
import type { UserProfile, VirtualGratitudeVisit, Locale } from '../../types';
import { PastelCard } from '../common/PastelCard';
import { FirestoreService } from '../../services/firestoreService';
import { getDictionary } from '../../locales';
import { v4 as uuidv4 } from 'uuid';

interface VirtualGratitudeVisitModalProps {
    userProfile: UserProfile;
    onClose: () => void;
    onCompleted: (visit: VirtualGratitudeVisit) => void;
}

export const VirtualGratitudeVisitModal: React.FC<VirtualGratitudeVisitModalProps> = ({
    userProfile,
    onClose,
    onCompleted,
}) => {
    const locale: Locale = userProfile.locale || (userProfile.language === 'hebrew' ? 'he' : 'en');
    const t = getDictionary(locale);

    const [currentPosition, setCurrentPosition] = useState<1 | 2 | 3>(1);
    const [recipient, setRecipient] = useState('');
    const [pos1Notes, setPos1Notes] = useState('');
    const [pos2Notes, setPos2Notes] = useState('');
    const [pos3Notes, setPos3Notes] = useState('');
    const [isSaving, setIsSaving] = useState(false);

    const handleSave = async () => {
        if (!recipient.trim()) return;

        setIsSaving(true);
        try {
            const visit: VirtualGratitudeVisit = {
                visitId: uuidv4(),
                userId: userProfile.userId,
                recipient,
                position1_selfExpressing: pos1Notes,
                position2_otherResponding: pos2Notes,
                position3_selfIntegration: pos3Notes,
                completedAt: Date.now(),
            };

            await FirestoreService.saveVirtualGratitudeVisit(userProfile.userId, visit);
            onCompleted(visit);
            onClose();
        } catch (error) {
            console.error('Failed to save virtual visit:', error);
        } finally {
            setIsSaving(false);
        }
    };

    return (
        <div className="fixed inset-0 z-50 bg-black/40 backdrop-blur-sm flex items-center justify-center p-4 overflow-y-auto">
            <div className="w-full max-w-2xl my-8">
                <PastelCard
                    variant="lavender"
                    title={t.emptyChair.title}
                    subtitle="Gestalt Empty Chair Technique: Neural Altruism & Emotional Completion"
                    badge={`Position ${currentPosition}/3`}
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
                    <div className="space-y-5 pt-3 text-neutral-800">
                        {/* Recipient Input */}
                        <div>
                            <label className="block text-xs font-bold uppercase mb-1">
                                {t.letters.recipientLabel}
                            </label>
                            <input
                                type="text"
                                value={recipient}
                                onChange={(e) => setRecipient(e.target.value)}
                                placeholder="Name of mentor, parent, friend, or past self"
                                className="w-full text-sm rounded-xl p-2.5 bg-white border border-purple-200 focus:outline-none focus:ring-2 focus:ring-purple-400/40"
                            />
                        </div>

                        {/* Step Navigator */}
                        <div className="grid grid-cols-3 gap-2">
                            {[1, 2, 3].map((pos) => (
                                <button
                                    key={pos}
                                    type="button"
                                    onClick={() => setCurrentPosition(pos as 1 | 2 | 3)}
                                    className={`p-2 rounded-xl text-xs font-bold transition-all text-center border ${
                                        currentPosition === pos
                                            ? 'bg-purple-700 text-white border-purple-800 shadow-sm'
                                            : 'bg-white text-purple-900 border-purple-100 hover:bg-purple-50'
                                    }`}
                                >
                                    {pos === 1 ? '1. Express' : pos === 2 ? '2. Embody' : '3. Integrate'}
                                </button>
                            ))}
                        </div>

                        {/* Position 1: Self Expressing */}
                        {currentPosition === 1 && (
                            <div className="p-4 bg-white/90 rounded-xl border border-purple-100 space-y-3">
                                <div>
                                    <h4 className="text-sm font-bold text-purple-950">{t.emptyChair.pos1Title}</h4>
                                    <p className="text-xs text-neutral-600 mt-0.5 leading-relaxed">
                                        {t.emptyChair.pos1Desc}
                                    </p>
                                </div>
                                <textarea
                                    value={pos1Notes}
                                    onChange={(e) => setPos1Notes(e.target.value)}
                                    placeholder="Write or record what you are speaking to the empty chair..."
                                    rows={4}
                                    className="w-full text-sm rounded-xl p-3 bg-neutral-50 border border-neutral-200 focus:outline-none focus:ring-2 focus:ring-purple-400/30 resize-none"
                                />
                            </div>
                        )}

                        {/* Position 2: Other Responding */}
                        {currentPosition === 2 && (
                            <div className="p-4 bg-white/90 rounded-xl border border-purple-100 space-y-3">
                                <div>
                                    <h4 className="text-sm font-bold text-purple-950">{t.emptyChair.pos2Title}</h4>
                                    <p className="text-xs text-neutral-600 mt-0.5 leading-relaxed">
                                        {t.emptyChair.pos2Desc}
                                    </p>
                                </div>
                                <textarea
                                    value={pos2Notes}
                                    onChange={(e) => setPos2Notes(e.target.value)}
                                    placeholder="Speaking as them: How does it feel to hear this? What do they want you to know?..."
                                    rows={4}
                                    className="w-full text-sm rounded-xl p-3 bg-neutral-50 border border-neutral-200 focus:outline-none focus:ring-2 focus:ring-purple-400/30 resize-none"
                                />
                            </div>
                        )}

                        {/* Position 3: Self Integration */}
                        {currentPosition === 3 && (
                            <div className="p-4 bg-white/90 rounded-xl border border-purple-100 space-y-3">
                                <div>
                                    <h4 className="text-sm font-bold text-purple-950">{t.emptyChair.pos3Title}</h4>
                                    <p className="text-xs text-neutral-600 mt-0.5 leading-relaxed">
                                        {t.emptyChair.pos3Desc}
                                    </p>
                                </div>
                                <textarea
                                    value={pos3Notes}
                                    onChange={(e) => setPos3Notes(e.target.value)}
                                    placeholder="Reflect on the somatic shift: Warmth in chest, released breath, emotional closure..."
                                    rows={4}
                                    className="w-full text-sm rounded-xl p-3 bg-neutral-50 border border-neutral-200 focus:outline-none focus:ring-2 focus:ring-purple-400/30 resize-none"
                                />
                            </div>
                        )}

                        {/* Action Buttons */}
                        <div className="flex items-center justify-between pt-2">
                            <button
                                type="button"
                                onClick={() => setCurrentPosition((prev) => Math.max(prev - 1, 1) as 1 | 2 | 3)}
                                disabled={currentPosition === 1}
                                className="px-4 py-2 text-xs font-bold text-neutral-600 hover:text-neutral-900 disabled:opacity-30"
                            >
                                {t.common.previous}
                            </button>

                            {currentPosition < 3 ? (
                                <button
                                    type="button"
                                    onClick={() => setCurrentPosition((prev) => Math.min(prev + 1, 3) as 1 | 2 | 3)}
                                    className="px-6 py-2.5 text-xs sm:text-sm font-bold bg-purple-700 hover:bg-purple-800 text-white rounded-xl shadow-md transition-all"
                                >
                                    {t.common.next}
                                </button>
                            ) : (
                                <button
                                    type="button"
                                    onClick={handleSave}
                                    disabled={!recipient.trim() || isSaving}
                                    className="px-6 py-2.5 text-xs sm:text-sm font-bold bg-purple-700 hover:bg-purple-800 text-white rounded-xl shadow-md transition-all disabled:opacity-50"
                                >
                                    {isSaving ? t.common.loading : t.common.save}
                                </button>
                            )}
                        </div>
                    </div>
                </PastelCard>
            </div>
        </div>
    );
};
