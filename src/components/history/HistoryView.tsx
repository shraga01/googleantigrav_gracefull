import React, { useEffect, useState } from 'react';
import { StorageService } from '../../services/storage';
import type { DailyEntry } from '../../types';
import { useApp } from '../../context/AppContext';
import { ApiService } from '../../services/api';
import { DiaryCalendar } from './DiaryCalendar';
import { EntryDetailModal } from './EntryDetailModal';

export const HistoryView: React.FC = () => {
    const { userProfile, googleId, isAuthenticated } = useApp();
    const [entries, setEntries] = useState<DailyEntry[]>([]);
    const [selectedEntry, setSelectedEntry] = useState<DailyEntry | null>(null);

    const isHebrew = userProfile?.language === 'hebrew';

    useEffect(() => {
        const loadEntries = async () => {
            setEntries(StorageService.getEntries());

            if (isAuthenticated) {
                try {
                    const serverEntries = await ApiService.getEntries();
                    if (serverEntries.length > 0) {
                        serverEntries.forEach((entry: DailyEntry) => StorageService.saveEntry(entry));
                        setEntries(StorageService.getEntries());
                    }
                } catch (error) {
                    console.error('Failed to sync history:', error);
                }
            }
        };

        void loadEntries();
    }, [isAuthenticated]);

    if (entries.length === 0) {
        return (
            <div className="flex flex-col items-center justify-center min-h-[60vh] text-center p-6">
                <div className="text-6xl mb-4">📖</div>
                <p className="text-lg font-medium text-stone-600">
                    {isHebrew ? 'עדיין אין היסטוריה. התחל לתרגל!' : 'No history yet. Start practicing!'}
                </p>
            </div>
        );
    }

    return (
        <div className="animate-fadeIn max-w-2xl mx-auto pb-20">
            {/* Calendar Grid */}
            <DiaryCalendar
                entries={entries}
                onSelectEntry={setSelectedEntry}
                isHebrew={isHebrew}
            />

            {/* Selected Entry Detail Modal */}
            {selectedEntry && (
                <EntryDetailModal
                    entry={selectedEntry}
                    onClose={() => setSelectedEntry(null)}
                    googleId={googleId}
                    isAuthenticated={isAuthenticated}
                />
            )}

            {/* Hint if nothing selected */}
            {!selectedEntry && (
                <p className="text-center text-stone-600 text-sm mt-4 font-medium">
                    {isHebrew ? 'לחץ על יום כדי לצפות בזיכרון' : 'Tap a completed day to reflect'}
                </p>
            )}
        </div>
    );
};
