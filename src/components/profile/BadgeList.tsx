import React, { useState } from 'react';
import type { Badge } from '../../types/badges';
import '../../styles/badges.css';
import { FluentIcon } from '../common/FluentIcon';
import {
    ALL_BADGES,
    getBadgeIconClass,
    getBadgeNumber,
    getBadgeFluentIcon,
} from '../../utils/badgeUtils';

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

interface BadgeListProps {
    unlockedBadgeCodes: string[];
    isLoading?: boolean;
    isHebrew?: boolean;
}

export const BadgeList: React.FC<BadgeListProps> = ({ unlockedBadgeCodes, isLoading, isHebrew }) => {
    const [selectedBadge, setSelectedBadge] = useState<Badge | null>(null);

    const badges = ALL_BADGES.map((b) => ({
        ...b,
        isUnlocked: unlockedBadgeCodes.includes(b.code),
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
