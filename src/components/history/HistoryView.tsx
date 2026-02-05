import React, { useEffect, useState } from 'react';
import { StorageService } from '../../services/storage';
// import { decryptEntry } from '../../services/encryption'; // logic moved to Modal
import type { DailyEntry } from '../../types';
import { useApp } from '../../context/AppContext';
import { ApiService } from '../../services/api';
import { DiaryCalendar } from './DiaryCalendar';
import { EntryDetailModal } from './EntryDetailModal';

export const HistoryView: React.FC = () => {
    console.log('HistoryView Loaded: v-detail-modal-refactor');
    const { userProfile, googleId, isAuthenticated } = useApp();
    const [entries, setEntries] = useState<DailyEntry[]>([]);
    const [selectedEntry, setSelectedEntry] = useState<DailyEntry | null>(null);

    const isHebrew = userProfile?.language === 'hebrew';

    useEffect(() => {
        const loadEntries = async () => {
            // 1. Load from local storage first (instant)
            setEntries(StorageService.getEntries());

            // 2. If authenticated, sync from server (background)
            if (isAuthenticated) {
                try {
                    const serverEntries = await ApiService.getEntries();
                    if (serverEntries.length > 0) {
                        console.log('🔄 Syncing entries from server:', serverEntries.length);
                        // Save each entry to local storage (updates existing ones)
                        serverEntries.forEach((entry: DailyEntry) => StorageService.saveEntry(entry));

                        // Reload from storage to update UI
                        setEntries(StorageService.getEntries());
                    }
                } catch (error) {
                    console.error('Failed to sync history:', error);
                }
            }
        };

        loadEntries();
    }, [isAuthenticated]);

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
        <div className="animate-fadeIn max-w-2xl mx-auto pb-20">
            <h2 style={{
                fontSize: '24px',
                fontWeight: 700,
                color: 'var(--color-text-primary)',
                marginBottom: '24px',
                textAlign: 'center',
                textShadow: 'none'
            }}>
                {isHebrew ? 'יומן הוקרת תודה' : 'Appreciation Journal'}
            </h2>

            {/* Calendar Grid */}
            <DiaryCalendar
                entries={entries}
                onSelectEntry={setSelectedEntry}
                isHebrew={isHebrew}
            />

            {/* Selected Entry Detail Modal / View - Compact Version */}
            {selectedEntry && (
                <EntryDetailModal
                    entry={selectedEntry}
                    onClose={() => setSelectedEntry(null)}
                    googleId={googleId}
                    isAuthenticated={isAuthenticated}
                    isHebrew={isHebrew}
                />
            )}

            {/* Hint if nothing selected */}
            {!selectedEntry && (
                <p className="text-center text-gray-400 text-sm mt-4 animate-pulse">
                    {isHebrew ? 'לחץ על יום כדי לצפות בזיכרון' : 'Tap a completed day to reflect'}
                </p>
            )}
        </div>
    );
};
