import React, { useEffect, useState, useCallback } from 'react';
import { useApp } from '../../context/AppContext';
import {
    ALL_BADGES,
    getBadgeIconClass,
    getBadgeNumber,
    getBadgeFluentIcon,
} from '../../utils/badgeUtils';
import { FluentIcon } from './FluentIcon';
import '../../styles/badges.css';

export const BadgeUnlockOverlay: React.FC = () => {
    const { newlyUnlockedBadges, setNewlyUnlockedBadges, userProfile, language } = useApp();
    const [animatingOut, setAnimatingOut] = useState(false);

    const activeBadgeCode = newlyUnlockedBadges[0] ?? null;

    const handleDismiss = useCallback(() => {
        setNewlyUnlockedBadges(newlyUnlockedBadges.slice(1));
        setAnimatingOut(false);
    }, [newlyUnlockedBadges, setNewlyUnlockedBadges]);

    useEffect(() => {
        if (!activeBadgeCode) return;
        const timer1 = setTimeout(() => setAnimatingOut(true), 2800);
        const timer2 = setTimeout(() => handleDismiss(), 3500);
        return () => {
            clearTimeout(timer1);
            clearTimeout(timer2);
        };
    }, [activeBadgeCode, handleDismiss]);

    if (!activeBadgeCode) return null;

    const badgeDef = ALL_BADGES.find((b) => b.code === activeBadgeCode);
    if (!badgeDef) return null;

    const iconClass = getBadgeIconClass(activeBadgeCode);
    const number = getBadgeNumber(activeBadgeCode);
    const fluentIconName = getBadgeFluentIcon(activeBadgeCode);
    const isHebrew = language === 'hebrew' || userProfile?.language === 'hebrew';

    return (
        <div
            className={`badge-overlay-backdrop ${animatingOut ? 'fading-out' : ''}`}
            style={{ pointerEvents: 'auto' }}
            onClick={handleDismiss}
        >
            <div className="badge-overlay-particles" />

            <div
                className={`badge-overlay-content bg-white rounded-3xl p-6 max-w-xs w-full mx-4 text-center shadow-2xl border-2 border-amber-300 relative ${
                    animatingOut ? 'badge-overlay-animating-out' : ''
                }`}
                onClick={(e) => e.stopPropagation()}
                dir={isHebrew ? 'rtl' : 'ltr'}
            >
                {/* Top-corner close button (✕) */}
                <button
                    type="button"
                    onClick={handleDismiss}
                    className="absolute top-4 end-4 w-8 h-8 flex items-center justify-center rounded-full text-stone-400 hover:text-stone-600 hover:bg-stone-100 transition-colors cursor-pointer"
                    aria-label={isHebrew ? 'סגור' : 'Close'}
                >
                    <span className="text-xl font-bold leading-none">✕</span>
                </button>

                {/* Header badge */}
                <div className="inline-flex items-center gap-1 px-3 py-1 rounded-full bg-amber-100 border border-amber-200 text-amber-800 text-xs font-bold tracking-wide mb-1">
                    {isHebrew ? '🎉 הישג חדש נפתח!' : '🎉 New Achievement Unlocked!'}
                </div>

                {/* Badge icon */}
                <div
                    className={`badge-icon ${iconClass} badge-unlocked badge-overlay-glow w-20 h-20 aspect-square rounded-2xl mx-auto my-4`}
                    style={{ width: '5rem', height: '5rem' }}
                >
                    {fluentIconName ? (
                        <div
                            style={{
                                position: 'absolute',
                                display: 'flex',
                                alignItems: 'center',
                                justifyContent: 'center',
                                width: '100%',
                                height: '100%',
                            }}
                        >
                            <FluentIcon name={fluentIconName} size={48} />
                        </div>
                    ) : number ? (
                        <span className="badge-number" style={{ fontSize: '2rem' }}>
                            {number}
                        </span>
                    ) : null}
                </div>

                {/* Badge Name & Description */}
                <h2 className="text-2xl font-extrabold text-stone-900 mb-1">
                    {isHebrew ? badgeDef.name : (badgeDef.nameEn || badgeDef.name)}
                </h2>
                <p className="text-sm text-stone-600 mb-5">
                    {isHebrew ? badgeDef.description : (badgeDef.descriptionEn || badgeDef.description)}
                </p>

                {/* Primary CTA button */}
                <button
                    type="button"
                    onClick={handleDismiss}
                    className="w-full py-3.5 rounded-2xl bg-gradient-to-l from-amber-500 to-orange-500 text-white font-bold shadow-md hover:from-amber-600 hover:to-orange-600 active:scale-95 transition-all cursor-pointer"
                >
                    {isHebrew ? 'איזה כיף! המשך ✓' : 'Awesome! Continue ✓'}
                </button>
            </div>
        </div>
    );
};
