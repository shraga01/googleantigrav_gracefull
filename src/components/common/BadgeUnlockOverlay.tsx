import React, { useEffect, useState } from 'react';
import { useApp } from '../../context/AppContext';
import { ALL_BADGES, getBadgeIconClass, getBadgeNumber, getBadgeFluentIcon } from '../profile/BadgeList';
import { FluentIcon } from './FluentIcon';
import '../../styles/badges.css';

export const BadgeUnlockOverlay: React.FC = () => {
    const { newlyUnlockedBadges, setNewlyUnlockedBadges, userProfile } = useApp();
    const [currentBadgeCode, setCurrentBadgeCode] = useState<string | null>(null);
    const [animatingOut, setAnimatingOut] = useState(false);

    useEffect(() => {
        if (newlyUnlockedBadges.length > 0 && !currentBadgeCode) {
            // Start showing the first badge in the queue
            setCurrentBadgeCode(newlyUnlockedBadges[0]);
            setAnimatingOut(false);

            // Wait 2 seconds, then start exit animation to the bottom nav
            const timer1 = setTimeout(() => {
                setAnimatingOut(true);
            }, 2000);

            // Wait another 0.8s for the flydown animation to finish, then clear and check next in queue
            const timer2 = setTimeout(() => {
                setCurrentBadgeCode(null);
                setAnimatingOut(false);
                setNewlyUnlockedBadges(newlyUnlockedBadges.slice(1));
            }, 2800);

            return () => {
                clearTimeout(timer1);
                clearTimeout(timer2);
            };
        }
    }, [newlyUnlockedBadges, currentBadgeCode, setNewlyUnlockedBadges]);

    if (!currentBadgeCode) return null;

    const badgeDef = ALL_BADGES.find(b => b.code === currentBadgeCode);
    if (!badgeDef) return null;

    const iconClass = getBadgeIconClass(currentBadgeCode);
    const number = getBadgeNumber(currentBadgeCode);
    const fluentIconName = getBadgeFluentIcon(currentBadgeCode);
    const isHebrew = userProfile?.language === 'hebrew';

    return (
        <div className={`badge-overlay-backdrop ${animatingOut ? 'fading-out' : ''}`}>
            {/* The particle explosion wrapper */}
            <div className="badge-overlay-particles"></div>

            <div className={`badge-overlay-content ${animatingOut ? 'badge-overlay-animating-out' : ''}`} dir={isHebrew ? 'rtl' : 'ltr'}>
                <div style={{ marginBottom: '2rem', textAlign: 'center' }}>
                    <h2 style={{ fontSize: '2.5rem', fontWeight: 'bold', color: 'white', textShadow: '0 4px 15px rgba(0,0,0,0.5)', marginBottom: '0.5rem' }}>
                        {isHebrew ? 'הישג חדש!' : 'New Badge!'}
                    </h2>
                    <p style={{ fontSize: '1.5rem', color: '#ffeb3b', fontWeight: 'bold', textShadow: '0 2px 8px rgba(0,0,0,0.5)' }}>
                        {isHebrew ? badgeDef.name : (badgeDef.nameEn || badgeDef.name)}
                    </p>
                </div>

                <div className={`badge-icon ${iconClass} badge-unlocked badge-overlay-glow`} style={{ width: '8rem', height: '8rem', margin: '2rem' }}>
                    {fluentIconName ? (
                        <div style={{ position: 'absolute', display: 'flex', alignItems: 'center', justifyContent: 'center', width: '100%', height: '100%' }}>
                            <FluentIcon name={fluentIconName} size={84} />
                        </div>
                    ) : number ? (
                        <span className="badge-number" style={{ fontSize: '3rem' }}>{number}</span>
                    ) : null}
                </div>
            </div>
        </div>
    );
};
