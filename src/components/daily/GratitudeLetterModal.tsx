import React, { useState } from 'react';
import type { UserProfile, GratitudeLetter } from '../../types';
import { PastelCard } from '../common/PastelCard';
import { AiService } from '../../services/aiService';
import { FirestoreService } from '../../services/firestoreService';
import { v4 as uuidv4 } from 'uuid';

interface GratitudeLetterModalProps {
    userProfile: UserProfile;
    onClose: () => void;
    onSaved: () => void;
    isHebrew: boolean;
}

export const GratitudeLetterModal: React.FC<GratitudeLetterModalProps> = ({
    userProfile,
    onClose,
    onSaved,
    isHebrew,
}) => {
    const [recipient, setRecipient] = useState('');
    const [relationship, setRelationship] = useState('');
    const [impact, setImpact] = useState('');
    const [letterContent, setLetterContent] = useState('');
    const [deliveryMethod, setDeliveryMethod] = useState<'read_aloud' | 'empty_chair' | 'sent_direct'>('read_aloud');
    const [isGenerating, setIsGenerating] = useState(false);
    const [isSaving, setIsSaving] = useState(false);

    const handleGenerate = async () => {
        if (!recipient.trim() || !impact.trim()) return;

        setIsGenerating(true);
        try {
            const draft = await AiService.composeGratitudeLetter(recipient, relationship, impact, userProfile);
            setLetterContent(draft);
        } catch (error) {
            console.error('Failed to compose gratitude letter:', error);
        } finally {
            setIsGenerating(false);
        }
    };

    const handleSave = async () => {
        if (!recipient.trim() || !letterContent.trim()) return;

        setIsSaving(true);
        try {
            const letter: GratitudeLetter = {
                letterId: uuidv4(),
                userId: userProfile.userId,
                recipient,
                relationship,
                content: letterContent,
                impactOnLife: impact,
                virtualDeliveryMethod: deliveryMethod,
                createdAt: Date.now(),
            };

            await FirestoreService.saveGratitudeLetter(userProfile.userId, letter);
            onSaved();
        } catch (error) {
            console.error('Failed to save gratitude letter:', error);
        } finally {
            setIsSaving(false);
        }
    };

    return (
        <div className="fixed inset-0 z-50 bg-black/40 backdrop-blur-sm flex items-center justify-center p-4 overflow-y-auto">
            <div className="w-full max-w-2xl my-8">
                <PastelCard
                    variant="lavender"
                    title={isHebrew ? 'מכתב הכרת תודה וביקור וירטואלי' : 'Gratitude Visit & Empty Chair Letter'}
                    subtitle={
                        isHebrew
                            ? 'פרוטוקול זליגמן: הבעת תודה עמוקה המייצרת את קפיצת האושר הגבוהה ביותר בפסיכולוגיה חיובית'
                            : 'Seligman Protocol: Deep gratitude producing the highest single happiness spike'
                    }
                    badge={isHebrew ? 'פרוטוקול עומק' : 'Deep Protocol'}
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
                        <div className="grid grid-cols-1 sm:grid-cols-2 gap-3">
                            <div>
                                <label className="block text-xs font-bold uppercase mb-1">
                                    {isHebrew ? 'למי מיועד המכתב?' : 'Recipient Name'}
                                </label>
                                <input
                                    type="text"
                                    value={recipient}
                                    onChange={(e) => setRecipient(e.target.value)}
                                    placeholder={isHebrew ? 'שם האדם (הורה, מורה, חבר)' : 'Name (Parent, mentor, friend)'}
                                    className="w-full text-sm rounded-xl p-2.5 bg-white border border-black/10 focus:ring-2 focus:ring-purple-400/40 outline-none"
                                />
                            </div>
                            <div>
                                <label className="block text-xs font-bold uppercase mb-1">
                                    {isHebrew ? 'סוג הקשר' : 'Relationship'}
                                </label>
                                <input
                                    type="text"
                                    value={relationship}
                                    onChange={(e) => setRelationship(e.target.value)}
                                    placeholder={isHebrew ? 'למשל: מנהלת לשעבר, חבר ילדות' : 'e.g. Former manager, childhood friend'}
                                    className="w-full text-sm rounded-xl p-2.5 bg-white border border-black/10 focus:ring-2 focus:ring-purple-400/40 outline-none"
                                />
                            </div>
                        </div>

                        <div>
                            <label className="block text-xs font-bold uppercase mb-1">
                                {isHebrew ? 'מה המעשה הספציפי וכיצד הוא שינה את חייך?' : 'Specific action & life impact'}
                            </label>
                            <textarea
                                value={impact}
                                onChange={(e) => setImpact(e.target.value)}
                                placeholder={
                                    isHebrew
                                        ? 'תאר מקרה שבו אדם זה האמין בך, סייע לך או פתח בפניך דלת, וכיצד זה השפיע על מי שאתה כיום.'
                                        : 'Describe what they did, what they sacrificed, and how it shaped your trajectory.'
                                }
                                rows={3}
                                className="w-full text-sm rounded-xl p-3 bg-white border border-black/10 focus:ring-2 focus:ring-purple-400/40 outline-none resize-none"
                            />
                        </div>

                        {/* Delivery Method Selection */}
                        <div className="p-3 bg-white/70 rounded-xl border border-purple-200">
                            <label className="block text-xs font-bold uppercase mb-2 text-purple-900">
                                {isHebrew ? 'שיטת מסירת המכתב (על פי הפרוטוקול):' : 'Delivery Method (Protocol):'}
                            </label>
                            <div className="grid grid-cols-1 sm:grid-cols-3 gap-2 text-xs">
                                <button
                                    type="button"
                                    onClick={() => setDeliveryMethod('read_aloud')}
                                    className={`p-2 rounded-lg border text-start transition-all ${
                                        deliveryMethod === 'read_aloud'
                                            ? 'bg-purple-100 border-purple-400 font-bold text-purple-900'
                                            : 'bg-white border-gray-200 hover:bg-gray-50'
                                    }`}
                                >
                                    🎙️ {isHebrew ? 'קריאה פנים אל פנים' : 'Read Aloud in Person'}
                                </button>
                                <button
                                    type="button"
                                    onClick={() => setDeliveryMethod('empty_chair')}
                                    className={`p-2 rounded-lg border text-start transition-all ${
                                        deliveryMethod === 'empty_chair'
                                            ? 'bg-purple-100 border-purple-400 font-bold text-purple-900'
                                            : 'bg-white border-gray-200 hover:bg-gray-50'
                                    }`}
                                >
                                    🪑 {isHebrew ? 'כיסא ריק (וירטואלי)' : 'Virtual Empty Chair'}
                                </button>
                                <button
                                    type="button"
                                    onClick={() => setDeliveryMethod('sent_direct')}
                                    className={`p-2 rounded-lg border text-start transition-all ${
                                        deliveryMethod === 'sent_direct'
                                            ? 'bg-purple-100 border-purple-400 font-bold text-purple-900'
                                            : 'bg-white border-gray-200 hover:bg-gray-50'
                                    }`}
                                >
                                    ✉️ {isHebrew ? 'שליחה ישירה' : 'Direct Message'}
                                </button>
                            </div>
                        </div>

                        {/* Compose / Edit letter */}
                        <div>
                            <div className="flex items-center justify-between mb-1">
                                <label className="text-xs font-bold uppercase">
                                    {isHebrew ? 'נוסח המכתב:' : 'Letter Content:'}
                                </label>
                                <button
                                    type="button"
                                    onClick={handleGenerate}
                                    disabled={!recipient.trim() || !impact.trim() || isGenerating}
                                    className="text-xs font-bold text-purple-700 hover:text-purple-900 disabled:opacity-50"
                                >
                                    {isGenerating ? (isHebrew ? 'מנסח בעזרת AI...' : 'Generating...') : (isHebrew ? '✨ נסח טיוטה ראשונה' : '✨ Draft with AI')}
                                </button>
                            </div>
                            <textarea
                                value={letterContent}
                                onChange={(e) => setLetterContent(e.target.value)}
                                placeholder={isHebrew ? 'כתוב או ערוך כאן את המכתב...' : 'Write or edit your letter here...'}
                                rows={6}
                                className="w-full text-sm rounded-xl p-3 bg-white border border-black/10 focus:ring-2 focus:ring-purple-400/40 outline-none font-serif leading-relaxed"
                            />
                        </div>

                        <div className="flex items-center justify-end gap-3 pt-2">
                            <button
                                type="button"
                                onClick={onClose}
                                className="px-4 py-2 text-xs font-bold text-neutral-600 hover:text-neutral-800 rounded-xl"
                            >
                                {isHebrew ? 'ביטול' : 'Cancel'}
                            </button>
                            <button
                                type="button"
                                onClick={handleSave}
                                disabled={!letterContent.trim() || isSaving}
                                className="px-5 py-2.5 text-xs sm:text-sm font-bold text-white bg-purple-700 hover:bg-purple-800 rounded-xl shadow-md disabled:opacity-50 transition-all"
                            >
                                {isSaving ? (isHebrew ? 'שומר ב-Firestore...' : 'Saving...') : (isHebrew ? 'שמור מכתב' : 'Save Letter')}
                            </button>
                        </div>
                    </div>
                </PastelCard>
            </div>
        </div>
    );
};
