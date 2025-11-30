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
        <div style={{ padding: '20px', maxWidth: '600px', margin: '0 auto', paddingBottom: '80px' }}>
            <h2 style={{ marginBottom: '20px', color: 'var(--color-primary)' }}>
                {isHebrew ? 'יומן הוקרת תודה' : 'Appreciation Journal'}
            </h2>

            <div style={{ display: 'flex', flexDirection: 'column', gap: '16px' }}>
                {entries.map((entry) => (
                    <div key={entry.entryId} style={{
                        padding: '16px',
                        backgroundColor: 'var(--color-card-bg)',
                        borderRadius: 'var(--radius-md)',
                        border: '1px solid var(--color-border)',
                        boxShadow: '0 2px 4px rgba(0,0,0,0.05)'
                    }}>
                        <div style={{ fontSize: '14px', color: 'var(--color-text-muted)', marginBottom: '8px' }}>
                            {entry.date}
                        </div>

                        <div style={{ fontWeight: 500, marginBottom: '12px', fontSize: '16px' }}>
                            {entry.openingSentence}
                        </div>

                        <div style={{ padding: '12px', backgroundColor: 'var(--color-secondary)', borderRadius: 'var(--radius-sm)' }}>
                            {entry.userContent.type === 'text' ? (
                                <div style={{ whiteSpace: 'pre-wrap' }}>{entry.userContent.content}</div>
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
