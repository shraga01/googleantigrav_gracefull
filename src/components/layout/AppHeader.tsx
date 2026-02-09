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
            {/* Streak Badge - Fire 3D Icon */}
            <div style={{
                position: 'absolute',
                top: '12px',
                left: isHebrew ? 'auto' : '16px',
                right: isHebrew ? '16px' : 'auto',
                zIndex: 20,
                display: 'flex',
                flexDirection: 'column',
                alignItems: 'center'
            }}>
                <div className="nav-icon-3d nav-icon-streak" style={{ width: '42px', height: '42px' }}>
                    <HeaderIcons.Fire />
                </div>
                <span style={{
                    fontSize: '10px',
                    fontWeight: 800,
                    color: '#FF4500',
                    marginTop: '2px',
                    background: 'rgba(255,255,255,0.8)',
                    padding: '1px 6px',
                    borderRadius: '10px',
                    backdropFilter: 'blur(4px)'
                }}>
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

                        {/* Navigation Items - Settings Only */}
                        {/* Navigation Items - Settings Only */}
                        <MenuButton
                            icon="Settings"
                            is3D={true}
                            iconType="nav-icon-settings"
                            label={isHebrew ? 'הגדרות' : 'Settings'}
                            isActive={currentTab === 'settings'}
                            onClick={() => { setCurrentTab('settings'); setMenuOpen(false); }}
                            hasBorder
                        />

                        {/* Language Toggle */}
                        <MenuButton
                            icon="Language"
                            is3D={true}
                            iconType="nav-icon-language"
                            label={isHebrew ? 'Switch to English' : 'החלף לעברית'}
                            isActive={false}
                            onClick={() => {
                                setLanguage(isHebrew ? 'english' : 'hebrew');
                                setMenuOpen(false);
                            }}
                        />


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
                                gap: '12px',
                                fontSize: '14px',
                                color: '#e53e3e'
                            }}
                        >
                            <div className="nav-icon-3d small nav-icon-logout">
                                <HeaderIcons.Logout />
                            </div>
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
                    fontSize: isHebrew ? '42px' : '36px',
                    fontWeight: isHebrew ? 900 : 800,
                    color: '#FFFFFF',
                    textShadow: '0 2px 4px rgba(0,0,0,0.2)',
                    letterSpacing: isHebrew ? '0' : '0.05em',
                    marginTop: '4px',
                    textAlign: 'center',
                    lineHeight: 1.2
                }}>
                    {isHebrew ? 'יום הודיה' : 'Daily Appreciation'}
                </h2>
            </div>
        </header>
    );
};

// SVG Icons for Header
const HeaderIcons = {
    Settings: () => (
        <svg viewBox="0 0 24 24" fill="currentColor">
            <path d="M19.14 12.94c.04-.3.06-.61.06-.94 0-.32-.02-.64-.07-.94l2.03-1.58c.18-.14.23-.41.12-.61l-1.92-3.32c-.12-.22-.37-.29-.59-.22l-2.39.96c-.5-.38-1.03-.7-1.62-.94l-.36-2.54c-.04-.24-.24-.41-.48-.41h-3.84c-.24 0-.43.17-.47.41l-.36 2.54c-.59.24-1.13.57-1.62.94l-2.39-.96c-.22-.08-.47 0-.59.22L2.74 8.87c-.12.21-.08.47.12.61l2.03 1.58c-.05.3-.09.63-.09.94s.02.64.07.94l-2.03 1.58c-.18.14-.23.41-.12.61l1.92 3.32c.12.22.37.29.59.22l2.39-.96c.5.38 1.03.7 1.62.94l.36 2.54c.05.24.24.41.48.41h3.84c.24 0 .44-.17.47-.41l.36-2.54c.59-.24 1.13-.56 1.62-.94l2.39.96c.22.08.47 0 .59-.22l1.92-3.32c.12-.22.07-.47-.12-.61l-2.01-1.58zM12 15.6c-1.98 0-3.6-1.62-3.6-3.6s1.62-3.6 3.6-3.6 3.6 1.62 3.6 3.6-1.62 3.6-3.6 3.6z" />
        </svg>
    ),
    Logout: () => (
        <svg viewBox="0 0 24 24" fill="currentColor">
            <path d="M10.09 15.59L11.5 17l5-5-5-5-1.41 1.41L12.67 11H3v2h9.67l-2.58 2.59zM19 3H5c-1.11 0-2 .9-2 2v4h2V5h14v14H5v-4H3v4c0 1.1.89 2 2 2h14c1.1 0 2-.9 2-2V5c0-1.1-.9-2-2-2z" />
        </svg>
    ),
    Fire: () => (
        <svg viewBox="0 0 24 24" fill="currentColor">
            <path d="M13.5.67s.74 2.65.74 4.8c0 2.06-1.35 3.73-3.41 3.73-2.07 0-3.63-1.67-3.63-3.73l.03-.36C5.21 7.51 4 10.62 4 14c0 4.42 3.58 8 8 8s8-3.58 8-8C20 8.61 17.41 3.8 13.5.67zM11.71 19c-1.78 0-3.22-1.4-3.22-3.14 0-1.62 1.05-2.76 2.81-3.12 1.77-.36 3.6-1.21 4.62-2.58.39 1.29.59 2.65.59 4.04 0 2.65-2.15 4.8-4.8 4.8z" />
        </svg>
    ),
    Globe: () => (
        <svg viewBox="0 0 24 24" fill="currentColor">
            <path d="M11.99 2C6.47 2 2 6.48 2 12s4.47 10 9.99 10C17.52 22 22 17.52 22 12S17.52 2 11.99 2zm6.93 6h-2.95c-.32-1.25-.78-2.45-1.38-3.56 1.84.63 3.37 1.91 4.33 3.56zM12 4.04c.83 1.2 1.48 2.53 1.91 3.96h-3.82c.43-1.43 1.08-2.76 1.91-3.96zM4.26 14C4.1 13.36 4 12.69 4 12s.1-1.36.26-2h3.38c-.08.66-.14 1.32-.14 2 0 .68.06 1.34.14 2H4.26zm.82 2h2.95c.32 1.25.78 2.45 1.38 3.56-1.84-.63-3.37-1.9-4.33-3.56zm2.95-8H5.08c.96-1.66 2.49-2.93 4.33-3.56C8.81 5.55 8.35 6.75 8.03 8zM12 19.96c-.83-1.2-1.48-2.53-1.91-3.96h3.82c-.43 1.43-1.08 2.76-1.91 3.96zM14.34 14H9.66c-.09-.66-.16-1.32-.16-2 0-.68.07-1.35.16-2h4.68c.09.65.16 1.32.16 2 0 .68-.07 1.34-.16 2zm.25 5.56c.6-1.11 1.06-2.31 1.38-3.56h2.95c-.96 1.65-2.49 2.93-4.33 3.56zM16.36 14c.08-.66.14-1.32.14-2 0-.68-.06-1.34-.14-2h3.38c.16.64.26 1.31.26 2s-.1 1.36-.26 2h-3.38z" />
        </svg>
    )
};

// Helper component for menu buttons
interface MenuButtonProps {
    icon: string;
    label: string;
    isActive: boolean;
    onClick: () => void;
    hasBorder?: boolean;
    is3D?: boolean;
    iconType?: string;
}

const MenuButton: React.FC<MenuButtonProps> = ({ icon, label, isActive, onClick, hasBorder, is3D, iconType }) => (
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
            gap: '12px',
            fontSize: '14px',
            color: isActive ? '#8A2BE2' : '#333',
            fontWeight: isActive ? 600 : 400
        }}
    >
        {is3D ? (
            <div className={`nav-icon-3d small ${iconType}`}>
                {icon === 'Settings' && <HeaderIcons.Settings />}
                {icon === 'Logout' && <HeaderIcons.Logout />}
                {icon === 'Language' && <HeaderIcons.Globe />}
            </div>
        ) : (
            <span>{icon}</span>
        )}
        <span>{label}</span>
    </button>
);
