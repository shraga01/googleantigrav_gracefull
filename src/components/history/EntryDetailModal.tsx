import React, { useEffect, useState } from 'react';
import type { DailyEntry, Locale } from '../../types';
import { decryptEntry } from '../../services/encryption';
import { NeuralRubricEngine } from '../../services/neuralRubricEngine';
import { useApp } from '../../context/AppContext';

const looksEncrypted = (content: string): boolean => {
    if (content.length > 40 && /^[A-Za-z0-9+/=]+$/.test(content.trim())) {
        return true;
    }
    return false;
};

const DecryptedContent: React.FC<{ content: string; googleId: string | null; isAuthenticated: boolean }> = ({
    content,
    googleId,
    isAuthenticated,
}) => {
    const [decrypted, setDecrypted] = useState<string>('');
    const [isDecrypting, setIsDecrypting] = useState(true);

    useEffect(() => {
        const decrypt = async () => {
            if (!looksEncrypted(content)) {
                setDecrypted(content);
                setIsDecrypting(false);
                return;
            }

            if (isAuthenticated && googleId) {
                try {
                    const decryptedText = await decryptEntry(content, googleId);
                    setDecrypted(decryptedText);
                } catch (err) {
                    console.error('Decryption failed:', err);
                    setDecrypted('🔒 This entry was encrypted with a different account key');
                }
            } else {
                setDecrypted('🔒 Sign in to view this entry');
            }
            setIsDecrypting(false);
        };

        void decrypt();
    }, [content, googleId, isAuthenticated]);

    if (isDecrypting) {
        return <div className="italic text-stone-500">Decrypting...</div>;
    }

    const lines = decrypted
        .split('\n')
        .map((l) => l.trim())
        .filter((l) => l.length > 0)
        .map((l) => l.replace(/^[0-9]+[.\-)\s]+/, ''));

    return (
        <div className="leading-relaxed text-stone-800">
            {lines.map((line, i) => (
                <div key={i} className="flex gap-2 items-start py-1.5 border-b border-stone-100 last:border-0 ps-1">
                    <span className="font-bold text-amber-700 min-w-[20px] select-none text-center">
                        {i + 1}.
                    </span>
                    <span className="flex-1 text-stone-700">{line}</span>
                </div>
            ))}
        </div>
    );
};

interface EntryDetailModalProps {
    entry: DailyEntry;
    onClose: () => void;
    googleId: string | null;
    isAuthenticated: boolean;
}

export const EntryDetailModal: React.FC<EntryDetailModalProps> = ({
    entry,
    onClose,
    googleId,
    isAuthenticated,
}) => {
    const { userProfile } = useApp();
    const locale: Locale =
        userProfile?.locale || (userProfile?.language === 'hebrew' ? 'he' : 'en');
    const isHebrew = locale === 'he';

    const structuredItems = (entry.items || []).filter((it) => it.act && it.act.trim().length > 0);

    return (
        <div
            className="fixed inset-0 z-50 flex items-center justify-center p-4 bg-black/60 backdrop-blur-sm animate-fadeIn"
            onClick={onClose}
        >
            <div
                dir={isHebrew ? 'rtl' : 'ltr'}
                className="bg-white border border-amber-100 rounded-3xl w-full max-w-md overflow-hidden shadow-2xl animate-scaleIn text-start"
                onClick={(e) => e.stopPropagation()}
            >
                {/* Header: Date + Close */}
                <div className="flex justify-between items-center p-4 border-b border-amber-100 bg-[#FFFDF9]">
                    <div className="text-stone-900 font-bold">{entry.date}</div>
                    <button
                        type="button"
                        onClick={onClose}
                        aria-label={isHebrew ? 'סגור' : 'Close'}
                        className="text-stone-500 hover:text-stone-900 p-1.5 rounded-full hover:bg-amber-50 transition-colors"
                    >
                        <span className="text-xl leading-none">×</span>
                    </button>
                </div>

                {/* Content Scrollable Area */}
                <div className="p-4 max-h-[65vh] overflow-y-auto space-y-3">
                    {/* Streak Badge */}
                    <div className="flex items-center gap-2 justify-center pb-1">
                        <span className="text-2xl">
                            {entry.qualityScore && entry.qualityScore >= 80 ? '⭐' : '✅'}
                        </span>
                        <div className="bg-amber-100 text-amber-900 px-3 py-1 rounded-full text-xs font-bold border border-amber-200">
                            🔥 {isHebrew ? `יום ${entry.streakDay}` : `Day ${entry.streakDay}`}
                        </div>
                    </div>

                    {/* Structured Moments + Neural Depth Score + WhatsApp Follow-up */}
                    {structuredItems.length > 0 ? (
                        <div className="space-y-2.5">
                            {structuredItems.map((it, idx) => {
                                const evalResult = NeuralRubricEngine.evaluate(
                                    it.act,
                                    it.causalReflection || '',
                                    locale
                                );
                                return (
                                    <div
                                        key={idx}
                                        className="p-3 rounded-2xl bg-[#FFFDF9] border border-amber-100 space-y-2 text-sm"
                                    >
                                        <div className="flex items-center justify-between gap-2">
                                            <span className="font-bold text-amber-900 text-xs">
                                                {isHebrew ? `רגע ${idx + 1}` : `Moment ${idx + 1}`}
                                            </span>
                                            <span
                                                dir="ltr"
                                                className="text-[11px] font-bold px-2 py-0.5 rounded-full bg-amber-100 text-amber-900"
                                            >
                                                {evalResult.score}/5 ✨
                                            </span>
                                        </div>
                                        <p className="text-stone-800 leading-relaxed break-words">
                                            {it.act}
                                        </p>
                                        {it.causalReflection && (
                                            <p className="text-xs text-stone-600">
                                                ✨ {it.causalReflection}
                                            </p>
                                        )}
                                        {evalResult.dimensions.interpersonalWarmth && (
                                            <a
                                                href={`https://wa.me/?text=${encodeURIComponent(
                                                    evalResult.whatsappDraft
                                                )}`}
                                                target="_blank"
                                                rel="noopener noreferrer"
                                                className="inline-flex items-center gap-1.5 text-[11px] font-bold text-emerald-700 hover:text-emerald-800 bg-emerald-50 hover:bg-emerald-100 px-2.5 py-1 rounded-lg border border-emerald-200 transition-colors"
                                            >
                                                <span>💌</span>
                                                <span>
                                                    {isHebrew ? 'שלח תודה ב-WhatsApp' : 'Send WhatsApp Thank-You'}
                                                </span>
                                            </a>
                                        )}
                                    </div>
                                );
                            })}
                        </div>
                    ) : (
                        <div className="bg-stone-50 rounded-2xl p-3 border border-stone-200 text-sm min-h-[100px]">
                            {entry.userContent.type === 'text' ? (
                                <DecryptedContent
                                    content={entry.userContent.content}
                                    googleId={googleId}
                                    isAuthenticated={isAuthenticated}
                                />
                            ) : (
                                <div>
                                    <audio controls src={entry.userContent.content} className="w-full h-8" />
                                    <div className="text-xs text-stone-500 mt-1">
                                        {Math.round(entry.userContent.duration || 0)}s
                                    </div>
                                </div>
                            )}
                        </div>
                    )}
                </div>
            </div>
        </div>
    );
};
