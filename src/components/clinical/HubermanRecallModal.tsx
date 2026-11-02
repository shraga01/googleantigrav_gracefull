import React, { useState } from 'react';
import type { UserProfile, HubermanStory, Locale } from '../../types';
import { PastelCard } from '../common/PastelCard';
import { FirestoreService } from '../../services/firestoreService';
import { getDictionary } from '../../locales';
import { v4 as uuidv4 } from 'uuid';

interface HubermanRecallModalProps {
    userProfile: UserProfile;
    onClose: () => void;
    onCompleted: (story: HubermanStory) => void;
}

export const HubermanRecallModal: React.FC<HubermanRecallModalProps> = ({
    userProfile,
    onClose,
    onCompleted,
}) => {
    const locale: Locale = userProfile.locale || (userProfile.language === 'hebrew' ? 'he' : 'en');
    const t = getDictionary(locale);

    const [benefactor, setBenefactor] = useState('');
    const [context, setContext] = useState('');
    const [wordsReceived, setWordsReceived] = useState('');
    const [somaticEcho, setSomaticEcho] = useState('');
    const [isSaving, setIsSaving] = useState(false);

    const handleSave = async () => {
        if (!benefactor.trim() || !context.trim() || !wordsReceived.trim()) return;

        setIsSaving(true);
        try {
            const story: HubermanStory = {
                storyId: uuidv4(),
                userId: userProfile.userId,
                benefactor,
                context,
                wordsReceived,
                somaticEcho,
                completedAt: Date.now(),
            };

            await FirestoreService.saveHubermanStory(userProfile.userId, story);
            onCompleted(story);
            onClose();
        } catch (error) {
            console.error('Failed to save Huberman story:', error);
        } finally {
            setIsSaving(false);
        }
    };

    return (
        <div className="fixed inset-0 z-50 bg-black/40 backdrop-blur-sm flex items-center justify-center p-4 overflow-y-auto">
            <div className="w-full max-w-xl my-8">
                <PastelCard
                    variant="sky"
                    title={t.huberman.title}
                    subtitle={t.huberman.subtitle}
                    badge="Huberman Protocol"
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
                    <div className="space-y-4 pt-3 text-neutral-800">
                        <div>
                            <label className="block text-xs font-bold uppercase mb-1">
                                {t.huberman.benefactorLabel}
                            </label>
                            <input
                                type="text"
                                value={benefactor}
                                onChange={(e) => setBenefactor(e.target.value)}
                                placeholder="Colleague, partner, client, stranger"
                                className="w-full text-sm rounded-xl p-2.5 bg-white border border-sky-200 focus:outline-none focus:ring-2 focus:ring-sky-400/40"
                            />
                        </div>

                        <div>
                            <label className="block text-xs font-bold uppercase mb-1">
                                {t.huberman.contextLabel}
                            </label>
                            <textarea
                                value={context}
                                onChange={(e) => setContext(e.target.value)}
                                placeholder="What did you do, help with, or provide that mattered to them?..."
                                rows={2}
                                className="w-full text-sm rounded-xl p-2.5 bg-white border border-sky-200 focus:outline-none focus:ring-2 focus:ring-sky-400/40 resize-none"
                            />
                        </div>

                        <div>
                            <label className="block text-xs font-bold uppercase mb-1">
                                {t.huberman.wordsLabel}
                            </label>
                            <textarea
                                value={wordsReceived}
                                onChange={(e) => setWordsReceived(e.target.value)}
                                placeholder="Their exact words, tone, voice message, or facial expression..."
                                rows={2}
                                className="w-full text-sm rounded-xl p-2.5 bg-white border border-sky-200 focus:outline-none focus:ring-2 focus:ring-sky-400/40 resize-none"
                            />
                        </div>

                        <div>
                            <label className="block text-xs font-bold uppercase mb-1 text-sky-900">
                                💓 {t.huberman.somaticLabel}
                            </label>
                            <input
                                type="text"
                                value={somaticEcho}
                                onChange={(e) => setSomaticEcho(e.target.value)}
                                placeholder="Warmth in chest, lowering of heart rate, deep exhalation..."
                                className="w-full text-sm rounded-xl p-2.5 bg-white border border-sky-200 focus:outline-none focus:ring-2 focus:ring-sky-400/40"
                            />
                        </div>

                        <div className="flex items-center justify-end gap-3 pt-2">
                            <button
                                type="button"
                                onClick={onClose}
                                className="px-4 py-2 text-xs font-bold text-neutral-600 hover:text-neutral-900"
                            >
                                {t.common.cancel}
                            </button>
                            <button
                                type="button"
                                onClick={handleSave}
                                disabled={!benefactor.trim() || !context.trim() || isSaving}
                                className="px-6 py-2.5 text-xs sm:text-sm font-bold bg-sky-700 hover:bg-sky-800 text-white rounded-xl shadow-md transition-all disabled:opacity-50"
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
