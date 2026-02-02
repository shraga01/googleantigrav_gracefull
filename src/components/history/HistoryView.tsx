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
                    // If decryption fails, the content might be plain text (old entries)
                    // Try to show it as-is if it looks like normal text
                    if (content && !content.includes('==') && content.length < 200) {
                        setDecrypted(content);
                    } else {
                        setDecrypted('🔒 Unable to decrypt this entry');
                    }
                }
            } else {
                setDecrypted(content);
            }
            setIsDecrypting(false);
        };

        decrypt();
    }, [content, googleId, isAuthenticated]);

    if (isDecrypting) {
        return <div style={{ fontStyle: 'italic', color: 'rgba(255,255,255,0.6)' }}>Decrypting...</div>;
    }

    if (error) {
        return <div style={{ color: 'rgba(255,255,255,0.7)' }}>{decrypted}</div>;
    }

    return (
        <div style={{ whiteSpace: 'pre-wrap', lineHeight: 1.6, color: 'white' }}>
            {decrypted.split('\n').map((line, i) => (
                <div key={i} style={{ padding: '4px 0' }}>{line}</div>
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
            <div style={{
                display: 'flex',
                flexDirection: 'column',
                alignItems: 'center',
                justifyContent: 'center',
                minHeight: '60vh',
                textAlign: 'center',
                padding: '24px'
            }}>
                <div style={{ fontSize: '64px', marginBottom: '16px' }}>📖</div>
                <p style={{ fontSize: '18px', color: 'rgba(255,255,255,0.7)' }}>
                    {isHebrew ? 'עדיין אין היסטוריה. התחל לתרגל!' : 'No history yet. Start practicing!'}
                </p>
            </div>
        );
    }

    return (
        <div className="animate-fadeIn">
            <h2 style={{
                fontSize: '24px',
                fontWeight: 700,
                color: 'white',
                marginBottom: '24px',
                textAlign: 'center',
                textShadow: '0 2px 4px rgba(0,0,0,0.3)'
            }}>
                {isHebrew ? 'יומן הוקרת תודה' : 'Appreciation Journal'}
            </h2>

            <div style={{ display: 'flex', flexDirection: 'column', gap: '16px' }}>
                {entries.map((entry) => (
                    <div
                        key={entry.entryId}
                        style={{
                            background: 'rgba(255, 255, 255, 0.15)',
                            backdropFilter: 'blur(10px)',
                            border: '1px solid rgba(255, 255, 255, 0.2)',
                            borderRadius: '16px',
                            padding: '20px'
                        }}
                    >
                        {/* Header */}
                        <div style={{
                            display: 'flex',
                            justifyContent: 'space-between',
                            alignItems: 'center',
                            marginBottom: '12px'
                        }}>
                            <span style={{ fontSize: '14px', color: 'rgba(255,255,255,0.7)' }}>{entry.date}</span>
                            <span style={{
                                fontSize: '14px',
                                background: 'linear-gradient(135deg, #FFA500, #FFD700)',
                                color: 'white',
                                padding: '4px 12px',
                                borderRadius: '9999px',
                                fontWeight: 600
                            }}>
                                🔥 {entry.streakDay}
                            </span>
                        </div>

                        {/* Opening sentence */}
                        <div style={{
                            fontWeight: 600,
                            color: 'white',
                            marginBottom: '12px',
                            textShadow: '0 1px 2px rgba(0,0,0,0.2)'
                        }}>
                            {entry.openingSentence}
                        </div>

                        {/* Content */}
                        <div style={{
                            background: 'rgba(255, 255, 255, 0.1)',
                            borderRadius: '12px',
                            padding: '16px',
                            borderLeft: isHebrew ? 'none' : '4px solid #FFA500',
                            borderRight: isHebrew ? '4px solid #FFA500' : 'none'
                        }}>
                            {entry.userContent.type === 'text' ? (
                                <DecryptedContent
                                    content={entry.userContent.content as string}
                                    googleId={googleId}
                                    isAuthenticated={isAuthenticated}
                                />
                            ) : (
                                <div>
                                    <audio controls src={entry.userContent.content as string} style={{ width: '100%' }} />
                                    <div style={{ fontSize: '12px', color: 'rgba(255,255,255,0.6)', marginTop: '8px' }}>
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
