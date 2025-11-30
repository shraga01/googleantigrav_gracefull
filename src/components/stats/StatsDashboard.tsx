import React from 'react';
import { StorageService } from '../../services/storage';
import { useApp } from '../../context/AppContext';

export const StatsDashboard: React.FC = () => {
    const { userProfile } = useApp();
    const streak = StorageService.getStreak();
    const isHebrew = userProfile?.language === 'hebrew';

    return (
        <div style={{ padding: '20px', maxWidth: '600px', margin: '0 auto' }}>
            <h2 style={{ marginBottom: '20px', color: 'var(--color-primary)' }}>
                {isHebrew ? 'סטטיסטיקה' : 'Your Progress'}
            </h2>

            <div style={{ display: 'grid', gridTemplateColumns: '1fr 1fr', gap: '16px', marginBottom: '30px' }}>
                <div style={{
                    padding: '20px',
                    backgroundColor: 'var(--color-primary-light)',
                    borderRadius: 'var(--radius-lg)',
                    textAlign: 'center'
                }}>
                    <div style={{ fontSize: '32px', fontWeight: 'bold', color: 'var(--color-primary)' }}>
                        🔥 {streak.currentStreak}
                    </div>
                    <div style={{ fontSize: '14px', color: 'var(--color-text-muted)' }}>
                        {isHebrew ? 'רצף נוכחי' : 'Current Streak'}
                    </div>
                </div>

                <div style={{
                    padding: '20px',
                    backgroundColor: 'var(--color-secondary)',
                    borderRadius: 'var(--radius-lg)',
                    textAlign: 'center'
                }}>
                    <div style={{ fontSize: '32px', fontWeight: 'bold', color: 'var(--color-text-main)' }}>
                        {streak.totalDaysPracticed}
                    </div>
                    <div style={{ fontSize: '14px', color: 'var(--color-text-muted)' }}>
                        {isHebrew ? 'סה"כ ימים' : 'Total Days'}
                    </div>
                </div>
            </div>

            <div style={{
                padding: '20px',
                border: '1px solid var(--color-border)',
                borderRadius: 'var(--radius-md)'
            }}>
                <div style={{ display: 'flex', justifyContent: 'space-between', marginBottom: '8px' }}>
                    <span>{isHebrew ? 'רצף שיא' : 'Longest Streak'}</span>
                    <span style={{ fontWeight: 'bold' }}>{streak.longestStreak}</span>
                </div>
                <div style={{ display: 'flex', justifyContent: 'space-between' }}>
                    <span>{isHebrew ? 'תרגול אחרון' : 'Last Practice'}</span>
                    <span style={{ fontWeight: 'bold' }}>{streak.lastPracticeDate || '-'}</span>
                </div>
            </div>
        </div>
    );
};
