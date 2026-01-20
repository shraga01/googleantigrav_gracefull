import React, { useEffect, useState } from 'react';
import { StorageService } from '../../services/storage';
import { decryptEntry } from '../../services/encryption';
import type { DailyEntry } from '../../types';
import { useApp } from '../../context/AppContext';

// Component to handle decryption of a single entry
const DecryptedContent: React.FC<{ content: string; googleId: string | null; isAuthenticated: boolean }> = ({ content, googleId, isAuthenticated }) => {
    const [decrypted, setDecrypted] = useState<string>('');
    const [isDecrypting, setIsDecrypting] = useState(true);
    const [error, setError] = useState(false);

    useEffect(() => {
        const decrypt = async () => {
            if (isAuthenticated && googleId) {
                try {
                    const decryptedText = await decryptEntry(content, googleId);
                    setDecrypted(decryptedText);
                } catch (err) {
                    console.error('Decryption failed:', err);
                    setError(true);
                    setDecrypted('🔒 Unable to decrypt this entry');
                }
            } else {
                setDecrypted(content);
            }
            setIsDecrypting(false);
        };

        decrypt();
    }, [content, googleId, isAuthenticated]);

    if (isDecrypting) {
        return <div className="italic text-gray-400">Decrypting...</div>;
    }

    if (error) {
        return <div className="text-gray-400">{decrypted}</div>;
    }

    return (
        <div className="whitespace-pre-wrap leading-relaxed text-gray-800">
            {decrypted.split('\n').map((line, i) => (
                <div key={i} className="py-1">{line}</div>
            ))}
        </div>
    );
};

export const HistoryView: React.FC = () => {
    const { userProfile, googleId, isAuthenticated } = useApp();
    const [entries, setEntries] = useState<DailyEntry[]>([]);

    const isHebrew = userProfile?.language === 'hebrew';

    useEffect(() => {
        setEntries(StorageService.getEntries());
    }, []);

    if (entries.length === 0) {
        return (
            <div className="flex flex-col items-center justify-center min-h-[60vh] text-center px-6">
                <div className="text-6xl mb-4">📖</div>
                <p className="text-lg text-gray-500">
                    {isHebrew ? 'עדיין אין היסטוריה. התחל לתרגל!' : 'No history yet. Start practicing!'}
                </p>
            </div>
        );
    }

    return (
        <div className="animate-fadeIn">
            <h2 className="text-2xl font-bold text-gray-800 mb-6 text-center">
                {isHebrew ? 'יומן הוקרת תודה' : 'Appreciation Journal'}
            </h2>

            <div className="space-y-4">
                {entries.map((entry) => (
                    <div key={entry.entryId} className="card card-sage">
                        {/* Header */}
                        <div className="flex justify-between items-center mb-3">
                            <span className="text-sm text-gray-500">{entry.date}</span>
                            <span className="streak-pill text-sm px-2 py-0.5 rounded-full">
                                🔥 {entry.streakDay}
                            </span>
                        </div>

                        {/* Opening sentence */}
                        <div className="font-semibold text-gray-700 mb-3">
                            {entry.openingSentence}
                        </div>

                        {/* Content */}
                        <div className="bg-white/50 rounded-xl p-4 border-l-4 border-olive-btn">
                            {entry.userContent.type === 'text' ? (
                                <DecryptedContent
                                    content={entry.userContent.content as string}
                                    googleId={googleId}
                                    isAuthenticated={isAuthenticated}
                                />
                            ) : (
                                <div>
                                    <audio controls src={entry.userContent.content as string} className="w-full" />
                                    <div className="text-xs text-gray-500 mt-2">
                                        Duration: {Math.round(entry.userContent.duration || 0)}s
                                    </div>
                                </div>
                            )}
                        </div>
                    </div>
                ))}
            </div>
        </div>
    );
};
