import React, { useState } from 'react';
import { useApp } from '../../context/AppContext';
import { FluentIcon } from '../common/FluentIcon';

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

    // Calculate Weekly Consistency Level
    const calculateConsistency = () => {
        if (!streak.practiceDates || streak.practiceDates.length === 0) {
            return { level: 0, textEn: 'Building Habit...', textHe: 'בונה הרגל...', icon: <FluentIcon name="Seedling" size={20} /> };
        }

        const now = new Date();
        const sevenDaysAgo = new Date(now.getTime() - 7 * 24 * 60 * 60 * 1000);

        let countLast7Days = 0;
        for (const dateStr of streak.practiceDates) {
            const date = new Date(dateStr);
            if (date >= sevenDaysAgo && date <= now) {
                countLast7Days++;
            }
        }

        if (countLast7Days >= 5) {
            return { level: 3, textEn: 'Weekly Master', textHe: 'מאסטר שבועי', icon: <FluentIcon name="Fire" size={20} /> };
        } else if (countLast7Days >= 3) {
            return { level: 2, textEn: 'Consistent', textHe: 'עקבי', icon: <FluentIcon name="Star" size={20} /> };
        } else {
            return { level: 1, textEn: 'Building Habit', textHe: 'בונה הרגל', icon: <FluentIcon name="Sparkles" size={20} /> };
        }
    };

    const consistency = calculateConsistency();

    return (
        <header style={{
            position: 'relative',
            width: '100%',
            padding: '16px 16px 12px 16px',
            zIndex: 10
        }}>
            {/* Left Side: Stats (Consistency & Total Days) */}
            <div style={{
                position: 'absolute',
                top: '16px',
                left: isHebrew ? 'auto' : '16px',
                right: isHebrew ? '16px' : 'auto',
                zIndex: 20,
                display: 'flex',
                flexDirection: 'row',
                alignItems: 'center',
                gap: '8px'
            }}>
                {/* Total Days counter */}
                <div style={{
                    display: 'flex',
                    alignItems: 'center',
                    gap: '6px',
                    background: 'rgba(255, 255, 255, 0.15)',
                    padding: '4px 10px',
                    borderRadius: '12px',
                    backdropFilter: 'blur(4px)'
                }}>
                    <div style={{ display: 'flex', alignItems: 'center' }}>
                        <FluentIcon name="Star" size={16} />
                    </div>
                    <span style={{ fontSize: '12px', fontWeight: 600, color: 'white' }}>
                        {isHebrew ? `${streak.totalDaysPracticed || 0} ימים סה"כ` : `${streak.totalDaysPracticed || 0} Total Days`}
                    </span>
                </div>

                {/* Consistency Level */}
                <div style={{
                    display: 'flex',
                    flexDirection: 'row',
                    alignItems: 'center',
                    gap: '6px',
                    background: 'rgba(255, 255, 255, 0.15)',
                    padding: '4px 10px',
                    borderRadius: '12px',
                    backdropFilter: 'blur(4px)'
                }}>
                    <span style={{ display: 'flex', alignItems: 'center', height: '20px' }}>{consistency.icon}</span>
                    <span style={{
                        fontSize: '12px',
                        fontWeight: 600,
                        color: 'white'
                    }}>
                        {isHebrew ? consistency.textHe : consistency.textEn}
                    </span>
                </div>
            </div>

            {/* Hamburger Menu */}
            <div style={{
                position: 'absolute',
                top: '16px',
                right: isHebrew ? 'auto' : '16px',
                left: isHebrew ? '16px' : 'auto',
                zIndex: 30
            }}>
                {/* Profile Avatar Button */}
                <button
                    onClick={() => setMenuOpen(!menuOpen)}
                    style={{
                        width: '40px',
                        height: '40px',
                        background: 'transparent',
                        border: 'none',
                        cursor: 'pointer',
                        display: 'flex',
                        alignItems: 'center',
                        justifyContent: 'center',
                        transition: 'transform 0.2s',
                        transform: menuOpen ? 'scale(0.95)' : 'scale(1)',
                        color: 'white'
                    }}
                >
                    <div style={{ display: 'flex', alignItems: 'center', justifyContent: 'center' }}>
                        <FluentIcon name="User" size={28} />
                    </div>
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
                            is3D={false}
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
                            <div style={{ display: 'flex', alignItems: 'center' }}>
                                <FluentIcon name="Logout" size={20} style={{ filter: 'grayscale(1) brightness(0.8) sepia(1) hue-rotate(-50deg) saturate(3)' }} />
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

// Icons are now rendered via FluentIcon using actual 3D PNG/GIF assets

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
            <div className={`nav-icon-3d small ${iconType}`} style={{ display: 'flex', alignItems: 'center', justifyContent: 'center' }}>
                {icon === 'Settings' && <FluentIcon name="Settings" size={16} />}
                {icon === 'Logout' && <FluentIcon name="Logout" size={16} />}
                {icon === 'Language' && <FluentIcon name="Globe" size={16} />}
            </div>
        ) : (
            <div style={{ display: 'flex', alignItems: 'center', justifyContent: 'center' }}>
                {icon === 'Settings' && <FluentIcon name="Settings" size={20} />}
                {icon === 'Logout' && <FluentIcon name="Logout" size={20} />}
                {icon === 'Language' && <FluentIcon name="Globe" size={20} />}
            </div>
        )}
        <span>{label}</span>
    </button>
);
