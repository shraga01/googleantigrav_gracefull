import React from 'react';
import { StorageService } from '../../services/storage';
import { useApp } from '../../context/AppContext';
import { BadgeList } from '../profile/BadgeList';

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
                    textAlign: 'center',
                    display: 'flex',
                    flexDirection: 'column',
                    alignItems: 'center',
                    justifyContent: 'center',
                    gap: '10px'
                }}>
                    <div style={{ display: 'flex', alignItems: 'center', justifyContent: 'center', gap: '8px' }}>
                        <div style={{ fontSize: '32px', fontWeight: 'bold', color: 'var(--color-primary)' }}>
                            {streak.currentStreak}
                        </div>
                        <div className="nav-icon-3d nav-icon-streak" style={{ width: '40px', height: '40px', boxShadow: '0 4px 10px rgba(0,0,0,0.15)' }}>
                            <svg viewBox="0 0 24 24" fill="currentColor" style={{ width: '24px', height: '24px', color: 'white', filter: 'drop-shadow(0 2px 2px rgba(0,0,0,0.2))', zIndex: 2 }}>
                                <path d="M13.5.67s.74 2.65.74 4.8c0 2.06-1.35 3.73-3.41 3.73-2.07 0-3.63-1.67-3.63-3.73l.03-.36C5.21 7.51 4 10.62 4 14c0 4.42 3.58 8 8 8s8-3.58 8-8C20 8.61 17.41 3.8 13.5.67zM11.71 19c-1.78 0-3.22-1.4-3.22-3.14 0-1.62 1.05-2.76 2.81-3.12 1.77-.36 3.6-1.21 4.62-2.58.39 1.29.59 2.65.59 4.04 0 2.65-2.15 4.8-4.8 4.8z" />
                            </svg>
                        </div>
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
                borderRadius: 'var(--radius-md)',
                marginBottom: '30px'
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

            {/* Badges Section */}
            <div style={{
                background: 'linear-gradient(135deg, #667eea 0%, #764ba2 50%, #f64f59 100%)',
                borderRadius: 'var(--radius-lg)',
                padding: '1.5rem',
                marginTop: '1rem'
            }}>
                <BadgeList
                    unlockedBadgeCodes={userProfile?.unlockedBadges?.map(b => b.code) || []}
                    isLoading={false}
                    isHebrew={isHebrew}
                />
            </div>
        </div>
    );
};

