import React, { useState } from 'react';
import { useApp } from '../../context/AppContext';

interface AppHeaderProps {
    currentTab: 'daily' | 'history' | 'stats' | 'settings';
    setCurrentTab: (tab: 'daily' | 'history' | 'stats' | 'settings') => void;
    onLogout: () => void;
}

export const AppHeader: React.FC<AppHeaderProps> = ({ currentTab, setCurrentTab, onLogout }) => {
    const { userProfile, streak, setLanguage } = useApp();
    const [menuOpen, setMenuOpen] = useState(false);

    if (!userProfile) return null;

    const isHebrew = userProfile.language === 'hebrew';

    return (
        <header style={{
            position: 'relative',
            width: '100%',
            padding: '16px 16px 12px 16px',
            zIndex: 10
        }}>
            {/* Streak Badge - Gold gradient circle */}
            <div style={{
                position: 'absolute',
                top: '16px',
                left: isHebrew ? 'auto' : '16px',
                right: isHebrew ? '16px' : 'auto',
                width: '50px',
                height: '50px',
                borderRadius: '50%',
                background: 'linear-gradient(to bottom right, #FFD700, #FFA500)',
                border: '2px solid white',
                boxShadow: '0 4px 15px rgba(0, 0, 0, 0.2)',
                display: 'flex',
                flexDirection: 'column',
                alignItems: 'center',
                justifyContent: 'center',
                color: 'white',
                zIndex: 20
            }}>
                <span style={{ fontSize: '12px', marginBottom: '1px' }}>⭐</span>
                <span style={{ fontSize: '11px', fontWeight: 700, lineHeight: 1 }}>
                    {isHebrew ? `יום ${streak.currentStreak}` : `Day ${streak.currentStreak}`}
                </span>
            </div>

            {/* Hamburger Menu */}
            <div style={{
                position: 'absolute',
                top: '16px',
                right: isHebrew ? 'auto' : '16px',
                left: isHebrew ? '16px' : 'auto',
                zIndex: 30
            }}>
                {/* Hamburger Icon */}
                <button
                    onClick={() => setMenuOpen(!menuOpen)}
                    style={{
                        width: '50px',
                        height: '50px',
                        borderRadius: '50%',
                        background: 'rgba(255, 255, 255, 0.15)',
                        backdropFilter: 'blur(10px)',
                        border: '1px solid rgba(255, 255, 255, 0.3)',
                        cursor: 'pointer',
                        display: 'flex',
                        flexDirection: 'column',
                        alignItems: 'center',
                        justifyContent: 'center',
                        gap: '5px'
                    }}
                >
                    <span style={{ width: '22px', height: '2px', background: 'white', borderRadius: '1px' }} />
                    <span style={{ width: '22px', height: '2px', background: 'white', borderRadius: '1px' }} />
                    <span style={{ width: '22px', height: '2px', background: 'white', borderRadius: '1px' }} />
                </button>

                {/* Dropdown Menu */}
                {menuOpen && (
                    <div style={{
                        position: 'absolute',
                        top: '58px',
                        right: isHebrew ? 'auto' : '0',
                        left: isHebrew ? '0' : 'auto',
                        background: 'rgba(255, 255, 255, 0.95)',
                        backdropFilter: 'blur(10px)',
                        borderRadius: '12px',
                        boxShadow: '0 4px 20px rgba(0, 0, 0, 0.15)',
                        minWidth: '180px',
                        overflow: 'hidden'
                    }}>
                        {/* User Info */}
                        <div style={{
                            padding: '12px 16px',
                            borderBottom: '1px solid rgba(0, 0, 0, 0.1)',
                            display: 'flex',
                            alignItems: 'center',
                            gap: '10px'
                        }}>
                            <div style={{
                                width: '32px',
                                height: '32px',
                                borderRadius: '50%',
                                background: 'linear-gradient(135deg, #8A2BE2, #FF69B4)',
                                display: 'flex',
                                alignItems: 'center',
                                justifyContent: 'center',
                                color: 'white',
                                fontSize: '14px',
                                fontWeight: 700
                            }}>
                                {userProfile.name?.charAt(0).toUpperCase() || '👤'}
                            </div>
                            <span style={{ color: '#333', fontSize: '14px', fontWeight: 500 }}>
                                {userProfile.name || (isHebrew ? 'משתמש' : 'User')}
                            </span>
                        </div>

                        {/* Navigation Items */}
                        <MenuButton
                            icon="☀️"
                            label={isHebrew ? 'היום' : 'Today'}
                            isActive={currentTab === 'daily'}
                            onClick={() => { setCurrentTab('daily'); setMenuOpen(false); }}
                        />
                        <MenuButton
                            icon="📖"
                            label={isHebrew ? 'יומן' : 'Journal'}
                            isActive={currentTab === 'history'}
                            onClick={() => { setCurrentTab('history'); setMenuOpen(false); }}
                        />
                        <MenuButton
                            icon="📊"
                            label={isHebrew ? 'מדדים' : 'Stats'}
                            isActive={currentTab === 'stats'}
                            onClick={() => { setCurrentTab('stats'); setMenuOpen(false); }}
                        />
                        <MenuButton
                            icon="⚙️"
                            label={isHebrew ? 'הגדרות' : 'Settings'}
                            isActive={currentTab === 'settings'}
                            onClick={() => { setCurrentTab('settings'); setMenuOpen(false); }}
                            hasBorder
                        />

                        {/* Language Toggle */}
                        <button
                            onClick={() => {
                                setLanguage(isHebrew ? 'english' : 'hebrew');
                                setMenuOpen(false);
                            }}
                            style={{
                                width: '100%',
                                padding: '12px 16px',
                                background: 'transparent',
                                border: 'none',
                                cursor: 'pointer',
                                display: 'flex',
                                alignItems: 'center',
                                gap: '10px',
                                fontSize: '14px',
                                color: '#333'
                            }}
                        >
                            <span>{isHebrew ? '🇺🇸' : '🇮🇱'}</span>
                            <span>{isHebrew ? 'English' : 'עברית'}</span>
                        </button>

                        {/* Sign Out */}
                        <button
                            onClick={() => {
                                onLogout();
                                setMenuOpen(false);
                            }}
                            style={{
                                width: '100%',
                                padding: '12px 16px',
                                background: 'transparent',
                                border: 'none',
                                borderTop: '1px solid rgba(0, 0, 0, 0.1)',
                                cursor: 'pointer',
                                display: 'flex',
                                alignItems: 'center',
                                gap: '10px',
                                fontSize: '14px',
                                color: '#e53e3e'
                            }}
                        >
                            <span>🚪</span>
                            <span>{isHebrew ? 'התנתק' : 'Sign Out'}</span>
                        </button>
                    </div>
                )}
            </div>

            {/* Centered Titles */}
            <div style={{
                width: '100%',
                display: 'flex',
                flexDirection: 'column',
                alignItems: 'center',
                justifyContent: 'center',
                paddingTop: '48px'
            }}>
                <h2 className="title-english" style={{
                    fontFamily: "'Playfair Display', serif",
                    fontSize: '24px',
                    fontWeight: 600,
                    color: 'var(--color-text-primary)',
                    textShadow: 'none',
                    letterSpacing: '0.05em',
                    marginTop: '4px'
                }}>
                    Daily Appreciation
                </h2>
            </div>
        </header>
    );
};

// Helper component for menu buttons
interface MenuButtonProps {
    icon: string;
    label: string;
    isActive: boolean;
    onClick: () => void;
    hasBorder?: boolean;
}

const MenuButton: React.FC<MenuButtonProps> = ({ icon, label, isActive, onClick, hasBorder }) => (
    <button
        onClick={onClick}
        style={{
            width: '100%',
            padding: '12px 16px',
            background: isActive ? 'rgba(138, 43, 226, 0.1)' : 'transparent',
            border: 'none',
            borderBottom: hasBorder ? '1px solid rgba(0, 0, 0, 0.1)' : 'none',
            cursor: 'pointer',
            display: 'flex',
            alignItems: 'center',
            gap: '10px',
            fontSize: '14px',
            color: isActive ? '#8A2BE2' : '#333',
            fontWeight: isActive ? 600 : 400
        }}
    >
        <span>{icon}</span>
        <span>{label}</span>
    </button>
);
