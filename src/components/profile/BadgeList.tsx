import React, { useState } from 'react';
import type { Badge } from '../../types/badges';
import '../../styles/badges.css';
import { FluentIcon } from '../common/FluentIcon';
import type { FluentIconName } from '../common/FluentIcon';


// Map badge codes to their CSS class for 3D icon styling
export const getBadgeIconClass = (code: string): string => {
    const classMap: Record<string, string> = {
        'first_step': 'badge-icon-first-step',
        'perfect_day': 'badge-icon-perfect-day',
        'week_champion': 'badge-icon-week-champion',
        'streak_14': 'badge-icon-streak-14',
        'streak_21': 'badge-icon-streak-21',
        'streak_28': 'badge-icon-streak-28',
        'milestone_10': 'badge-icon-milestone-10',
        'milestone_25': 'badge-icon-milestone-25',
        'milestone_50': 'badge-icon-milestone-50',
        'milestone_100': 'badge-icon-milestone-100',
        'community_sharer': 'badge-icon-community-sharer',
        'friend_recruiter': 'badge-icon-friend-recruiter',
    };
    return classMap[code] || 'badge-icon';
};

// Get the number to display inside badge
export const getBadgeNumber = (code: string): string | null => {
    const numberMap: Record<string, string> = {
        'first_step': '1',
        'week_champion': '7',
        'streak_14': '14',
        'streak_21': '21',
        'streak_28': '28',
        'milestone_10': '10',
        'milestone_25': '25',
        'milestone_50': '50',
        'milestone_100': '100',
    };
    return numberMap[code] || null;
};

// Map badge codes to FluentIcon names
export const getBadgeFluentIcon = (code: string): FluentIconName | null => {
    switch (code) {
        case 'first_step': return 'Coin';
        case 'perfect_day': return 'Star';
        case 'week_champion': return 'Crown';
        case 'community_sharer': return 'Handshake';
        case 'friend_recruiter': return 'People';
        default: return null;
    }
};

// Badge Icon with 3D styling
const BadgeIcon: React.FC<{ badge: Badge; isUnlocked: boolean }> = ({ badge, isUnlocked }) => {
    const iconClass = getBadgeIconClass(badge.code);
    const number = getBadgeNumber(badge.code);
    const fluentIconName = getBadgeFluentIcon(badge.code);

    return (
        <div className={`badge-icon ${iconClass} ${!isUnlocked ? 'badge-locked' : 'badge-unlocked'}`}>
            {fluentIconName ? (
                <div style={{ position: 'absolute', display: 'flex', alignItems: 'center', justifyContent: 'center', width: '100%', height: '100%' }}>
                    <FluentIcon name={fluentIconName} size={48} />
                </div>
            ) : number ? (
                <span className="badge-number">{number}</span>
            ) : null}
        </div>
    );
};

export const ALL_BADGES: Badge[] = [
    { _id: '1', code: 'first_step', name: 'סיום ראשון', nameEn: 'First Complete', description: 'השלמת את היום הראשון שלך!', descriptionEn: 'Completed your first day!', icon: '1', category: 'milestone', isUnlocked: false, awardedAt: undefined, order: 1 },
    { _id: '2', code: 'perfect_day', name: 'יום מושלם', nameEn: 'Perfect Day', description: 'קיבלת ציון 100 ביום אחד', descriptionEn: '100% score in one day', icon: '⭐', category: 'quality', isUnlocked: false, order: 2 },
    { _id: '3', code: 'week_champion', name: 'אלוף שבועי', nameEn: 'Week Champion', description: 'רצף של 7 ימים', descriptionEn: '7 day streak', icon: '7', category: 'streak', isUnlocked: false, order: 3 },
    { _id: '4', code: 'streak_14', name: 'רצף 14', nameEn: 'Streak 14', description: 'רצף של 14 ימים', descriptionEn: '14 day streak', icon: '14', category: 'streak', isUnlocked: false, order: 4 },
    { _id: '5', code: 'streak_21', name: 'רצף 21', nameEn: 'Streak 21', description: 'רצף של 21 ימים', descriptionEn: '21 day streak', icon: '21', category: 'streak', isUnlocked: false, order: 5 },
    { _id: '6', code: 'streak_28', name: 'רצף 28', nameEn: 'Streak 28', description: 'רצף של 28 ימים', descriptionEn: '28 day streak', icon: '28', category: 'streak', isUnlocked: false, order: 6 },
    { _id: '7', code: 'milestone_10', name: '10 רשומות', nameEn: '10 Entries', description: 'כתבת 10 רשומות', descriptionEn: 'Wrote 10 entries', icon: '10', category: 'milestone', isUnlocked: false, order: 7 },
    { _id: '8', code: 'milestone_25', name: '25 רשומות', nameEn: '25 Entries', description: 'כתבת 25 רשומות', descriptionEn: 'Wrote 25 entries', icon: '25', category: 'milestone', isUnlocked: false, order: 8 },
    { _id: '9', code: 'milestone_50', name: '50 רשומות', nameEn: '50 Entries', description: 'כתבת 50 רשומות', descriptionEn: 'Wrote 50 entries', icon: '50', category: 'milestone', isUnlocked: false, order: 9 },
    { _id: '10', code: 'milestone_100', name: '100 רשומות', nameEn: '100 Entries', description: 'כתבת 100 רשומות', descriptionEn: 'Wrote 100 entries', icon: '100', category: 'milestone', isUnlocked: false, order: 10 },
    { _id: '11', code: 'community_sharer', name: 'משתף בקהילה', nameEn: 'Community Sharer', description: 'שיתפת רשומה', descriptionEn: 'Shared an entry', icon: '🤝', category: 'social', isUnlocked: false, order: 11 },
    { _id: '12', code: 'friend_recruiter', name: 'מגייס חברים', nameEn: 'Friend Recruiter', description: 'הזמנת חבר', descriptionEn: 'Invited a friend', icon: '👥', category: 'social', isUnlocked: false, order: 12 },
];

interface BadgeListProps {
    unlockedBadgeCodes: string[];
    isLoading?: boolean;
    isHebrew?: boolean;
}

export const BadgeList: React.FC<BadgeListProps> = ({ unlockedBadgeCodes, isLoading, isHebrew }) => {
    const [selectedBadge, setSelectedBadge] = useState<Badge | null>(null);

    // Map the boolean state of all badges based on what the user has actually unlocked
    const badges = ALL_BADGES.map((b) => ({
        ...b,
        isUnlocked: unlockedBadgeCodes.includes(b.code)
    }));

    if (isLoading) {
        return (
            <div className="w-full">
                <h3 style={{ fontSize: '1.25rem', fontWeight: 'bold', color: 'white', textAlign: 'center', marginBottom: '1.5rem' }}>
                    {isHebrew ? 'הישגים' : 'Achievements'}
                </h3>
                <div className="badge-grid-3" style={{ opacity: 0.5 }}>
                    {[...Array(6)].map((_, i) => (
                        <div key={i} className="badge-glass-card" style={{ aspectRatio: '1', padding: '1rem' }} />
                    ))}
                </div>
            </div>
        );
    }

    const sortedBadges = [...badges].sort((a, b) => a.order - b.order);
    const row1 = sortedBadges.filter(b => ['first_step', 'perfect_day', 'week_champion'].includes(b.code));
    const row2 = sortedBadges.filter(b => ['streak_14', 'streak_21', 'streak_28'].includes(b.code));
    const row3 = sortedBadges.filter(b => b.code.startsWith('milestone_'));
    const row4 = sortedBadges.filter(b => ['community_sharer', 'friend_recruiter'].includes(b.code));

    const renderBadgeCard = (badge: Badge) => (
        <div
            key={badge.code}
            onClick={() => setSelectedBadge(badge)}
            className={`badge-glass-card ${!badge.isUnlocked ? 'locked' : ''}`}
            style={{
                aspectRatio: '1',
                display: 'flex',
                flexDirection: 'column',
                alignItems: 'center',
                justifyContent: 'center',
                padding: '0.75rem',
                cursor: 'pointer'
            }}
        >
            <BadgeIcon badge={badge} isUnlocked={badge.isUnlocked} />
            <div className="badge-name">
                {isHebrew ? badge.name : (badge.nameEn || badge.name)}
            </div>
        </div>
    );

    return (
        <div style={{ direction: isHebrew ? 'rtl' : 'ltr' }}>
            <h3 style={{ fontSize: '1.25rem', fontWeight: 'bold', color: 'white', textAlign: 'center', marginBottom: '1rem' }}>
                {isHebrew ? 'הישגים' : 'Achievements'}
            </h3>
            <p style={{ color: 'rgba(255,255,255,0.7)', textAlign: 'center', fontSize: '0.875rem', marginBottom: '1rem' }}>
                {isHebrew ? 'המשיכו לתרגל כדי לפתוח תגים חדשים!' : 'Keep practicing to unlock badges!'}
            </p>

            <div className="badge-grid-3" style={{ marginBottom: '0.75rem' }}>
                {row1.map(renderBadgeCard)}
            </div>
            <div className="badge-grid-3" style={{ marginBottom: '0.75rem' }}>
                {row2.map(renderBadgeCard)}
            </div>
            <div className="badge-grid-4" style={{ marginBottom: '0.75rem' }}>
                {row3.map(renderBadgeCard)}
            </div>
            <div className="badge-grid-2">
                {row4.map(renderBadgeCard)}
            </div>

            {/* Badge Detail Modal */}
            {selectedBadge && (
                <div
                    onClick={() => setSelectedBadge(null)}
                    style={{
                        position: 'fixed',
                        inset: 0,
                        zIndex: 50,
                        display: 'flex',
                        alignItems: 'center',
                        justifyContent: 'center',
                        padding: '1rem',
                        backgroundColor: 'rgba(0,0,0,0.7)',
                        backdropFilter: 'blur(8px)'
                    }}
                >
                    <div
                        onClick={e => e.stopPropagation()}
                        className="badge-glass-card"
                        style={{
                            width: '100%',
                            maxWidth: '280px',
                            padding: '2rem',
                            textAlign: 'center',
                            position: 'relative'
                        }}
                    >
                        <div style={{ display: 'flex', justifyContent: 'center', marginBottom: '1.5rem' }}>
                            <BadgeIcon badge={selectedBadge} isUnlocked={selectedBadge.isUnlocked} />
                        </div>
                        <h4 style={{ fontSize: '1.25rem', fontWeight: 'bold', color: 'white', marginBottom: '0.75rem' }}>
                            {isHebrew ? selectedBadge.name : (selectedBadge.nameEn || selectedBadge.name)}
                        </h4>
                        <p style={{ color: 'rgba(255,255,255,0.8)', fontSize: '0.875rem', marginBottom: '1rem' }}>
                            {isHebrew ? selectedBadge.description : (selectedBadge.descriptionEn || selectedBadge.description)}
                        </p>
                        <div style={{
                            fontSize: '0.75rem',
                            fontWeight: 'bold',
                            padding: '0.5rem 1rem',
                            borderRadius: '9999px',
                            display: 'inline-block',
                            color: selectedBadge.isUnlocked ? '#86efac' : 'rgba(255,255,255,0.5)',
                            backgroundColor: selectedBadge.isUnlocked ? 'rgba(34,197,94,0.2)' : 'rgba(255,255,255,0.1)',
                            border: selectedBadge.isUnlocked ? '1px solid rgba(74,222,128,0.3)' : 'none'
                        }}>
                            {selectedBadge.isUnlocked
                                ? `✓ ${isHebrew ? 'נפתח' : 'Unlocked'}`
                                : `🔒 ${isHebrew ? 'נעול' : 'Locked'}`
                            }
                        </div>
                        <button
                            onClick={() => setSelectedBadge(null)}
                            style={{
                                position: 'absolute',
                                top: '0.75rem',
                                right: '0.75rem',
                                color: 'rgba(255,255,255,0.6)',
                                background: 'none',
                                border: 'none',
                                cursor: 'pointer',
                                fontSize: '1.25rem'
                            }}
                        >
                            ✕
                        </button>
                    </div>
                </div>
            )}
        </div>
    );
};
