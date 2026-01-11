import React, { useEffect, useState } from 'react';
import { StorageService } from '../../services/storage';
import type { DailyEntry } from '../../types';
import { useApp } from '../../context/AppContext';

export const HistoryView: React.FC = () => {
    const { userProfile } = useApp();
    const [entries, setEntries] = useState<DailyEntry[]>([]);

    useEffect(() => {
        setEntries(StorageService.getEntries());
    }, []);

    const isHebrew = userProfile?.language === 'hebrew';

    if (entries.length === 0) {
        return (
            <div style={{ padding: '40px', textAlign: 'center', color: 'var(--color-text-muted)' }}>
                {isHebrew ? 'עדיין אין היסטוריה. התחל לתרגל!' : 'No history yet. Start practicing!'}
            </div>
        );
    }

    return (
        <div style={{ padding: 'var(--spacing-lg)', maxWidth: '600px', margin: '0 auto', paddingBottom: '100px' }}>
            <h2 style={{
                marginBottom: 'var(--spacing-lg)',
                color: 'var(--color-primary)',
                fontSize: 'var(--font-size-xl)',
                fontWeight: 800
            }}>
                {isHebrew ? 'יומן הוקרת תודה' : 'Appreciation Journal'}
            </h2>

            <div style={{ display: 'flex', flexDirection: 'column', gap: 'var(--spacing-md)' }}>
                {entries.map((entry) => (
                    <div key={entry.entryId} style={{
                        padding: 'var(--spacing-lg)',
                        backgroundColor: 'white',
                        borderRadius: 'var(--radius-md)',
                        border: 'none',
                        boxShadow: 'var(--shadow-sm)',
                        transition: 'transform var(--transition-fast)',
                    }}>
                        <div style={{
                            fontSize: 'var(--font-size-sm)',
                            color: 'var(--color-text-muted)',
                            marginBottom: 'var(--spacing-xs)',
                            display: 'flex',
                            justifyContent: 'space-between'
                        }}>
                            <span>{entry.date}</span>
                            <span>🔥 {entry.streakDay}</span>
                        </div>

                        <div style={{
                            fontWeight: 600,
                            marginBottom: 'var(--spacing-md)',
                            fontSize: 'var(--font-size-md)',
                            color: 'var(--color-text-main)'
                        }}>
                            {entry.openingSentence}
                        </div>

                        <div style={{
                            padding: 'var(--spacing-md)',
                            backgroundColor: 'var(--color-background)',
                            borderRadius: 'var(--radius-sm)',
                            borderLeft: '2px solid var(--color-primary)'
                        }}>
                            {entry.userContent.type === 'text' ? (
                                <div style={{ whiteSpace: 'pre-wrap', lineHeight: '1.6', fontSize: 'var(--font-size-md)' }}>
                                    {entry.userContent.content}
                                </div>
                            ) : (
                                <div>
                                    <audio controls src={entry.userContent.content as string} style={{ width: '100%' }} />
                                    <div style={{ fontSize: '12px', color: 'var(--color-text-muted)', marginTop: '4px' }}>
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
