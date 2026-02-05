import React, { useEffect, useState } from 'react';
import type { DailyEntry } from '../../types';
import { decryptEntry } from '../../services/encryption';

// Helper to detect if content looks encrypted (base64-like)
const looksEncrypted = (content: string): boolean => {
    // Check if it looks like base64 encoded (mostly alphanumeric with +/= and long)
    if (content.length > 40 && /^[A-Za-z0-9+/=]+$/.test(content.trim())) {
        return true;
    }
    return false;
};

// Component to handle decryption of a single entry
const DecryptedContent: React.FC<{ content: string; googleId: string | null; isAuthenticated: boolean }> = ({ content, googleId, isAuthenticated }) => {
    const [decrypted, setDecrypted] = useState<string>('');
    const [isDecrypting, setIsDecrypting] = useState(true);

    useEffect(() => {
        const decrypt = async () => {
            // If content doesn't look encrypted, show as-is
            if (!looksEncrypted(content)) {
                setDecrypted(content);
                setIsDecrypting(false);
                return;
            }

            // Try to decrypt
            if (isAuthenticated && googleId) {
                try {
                    const decryptedText = await decryptEntry(content, googleId);
                    setDecrypted(decryptedText);
                } catch (err) {
                    console.error('Decryption failed:', err);
                    // Content is encrypted but we can't decrypt it
                    setDecrypted('🔒 This entry was encrypted with a different account key');
                }
            } else {
                setDecrypted('🔒 Sign in to view this entry');
            }
            setIsDecrypting(false);
        };

        decrypt();
    }, [content, googleId, isAuthenticated]);

    if (isDecrypting) {
        return <div style={{ fontStyle: 'italic', color: 'rgba(255,255,255,0.6)' }}>Decrypting...</div>;
    }

    return (
        <div style={{ whiteSpace: 'pre-wrap', lineHeight: 1.6, color: 'var(--color-text-primary)' }}>
            {decrypted.split('\n').map((line, i) => (
                <div key={i} style={{ padding: '4px 0' }}>{line}</div>
            ))}
        </div>
    );
};

interface EntryDetailModalProps {
    entry: DailyEntry;
    onClose: () => void;
    googleId: string | null;
    isAuthenticated: boolean;
    isHebrew: boolean;
}

export const EntryDetailModal: React.FC<EntryDetailModalProps> = ({ entry, onClose, googleId, isAuthenticated, isHebrew }) => {
    return (
        <div className="fixed inset-0 z-50 flex items-center justify-center p-4 bg-black/60 backdrop-blur-sm animate-fadeIn"
            onClick={onClose}>

            {/* Compact Card - Light Theme Style */}
            <div className="bg-white/90 border border-gray-200 rounded-2xl w-full max-w-sm overflow-hidden shadow-2xl animate-scaleIn backdrop-blur-md"
                onClick={e => e.stopPropagation()}>

                {/* Header: Date + Close */}
                <div className="flex justify-between items-center p-4 border-b border-gray-100 bg-gray-50/50">
                    <div>
                        <div className="text-gray-800 font-medium">{entry.date}</div>
                    </div>
                    <button
                        onClick={onClose}
                        className="text-gray-400 hover:text-gray-800 p-1 rounded-full hover:bg-gray-100 transition-colors"
                    >
                        <span className="text-xl leading-none">×</span>
                    </button>
                </div>

                {/* Content Scrollable Area */}
                <div className="p-4 max-h-[60vh] overflow-y-auto">
                    {/* Score Badge */}
                    <div className="flex items-center gap-2 mb-4 justify-center">
                        <span className="text-3xl filter drop-shadow-md">
                            {entry.qualityScore && entry.qualityScore >= 80 ? '⭐' : '✅'}
                        </span>
                        <div className="bg-amber-500/20 text-amber-300 px-3 py-1 rounded-full text-sm font-bold border border-amber-500/30 shadow-sm">
                            🔥 Day {entry.streakDay}
                        </div>
                    </div>

                    <h3 className="text-gray-800 font-bold text-lg mb-4 text-center leading-snug">
                        {entry.openingSentence}
                    </h3>

                    <div className="bg-gray-50 rounded-xl p-3 border border-gray-200 text-sm shadow-inner">
                        {entry.userContent.type === 'text' ? (
                            <DecryptedContent
                                content={entry.userContent.content as string}
                                googleId={googleId}
                                isAuthenticated={isAuthenticated}
                            />
                        ) : (
                            <div>
                                <audio controls src={entry.userContent.content as string} className="w-full h-8" />
                                <div className="text-xs text-white/50 mt-1">
                                    {Math.round(entry.userContent.duration || 0)}s
                                </div>
                            </div>
                        )}
                    </div>

                    {entry.suggestions && entry.suggestions.length > 0 && (
                        <div className="mt-4 pt-3 border-t border-gray-200">
                            <h4 className="text-[10px] uppercase tracking-wider text-gray-400 mb-2 text-center">
                                {isHebrew ? 'הצעות' : 'Prompts'}
                            </h4>
                            <div className="flex flex-wrap justify-center gap-1">
                                {entry.suggestions.map((s, i) => (
                                    <span key={i} className="text-[10px] text-gray-500 bg-gray-100 px-2 py-0.5 rounded border border-gray-200">
                                        {s}
                                    </span>
                                ))}
                            </div>
                        </div>
                    )}
                </div>
            </div>
        </div>
    );
};
