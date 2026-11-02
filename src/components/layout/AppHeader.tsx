import React, { useState } from 'react';
import { useApp } from '../../context/AppContext';
import { FluentIcon } from '../common/FluentIcon';

interface AppHeaderProps {
    onLogout: () => void;
    title: string;
}

export const AppHeader: React.FC<AppHeaderProps> = ({ onLogout, title }) => {
    const { userProfile, setLanguage } = useApp();
    const [menuOpen, setMenuOpen] = useState(false);

    if (!userProfile) return null;

    const isHebrew = userProfile.language === 'hebrew';

    return (
        <header className="flex items-center p-6 justify-between z-40 w-full shrink-0 relative">
            <button className="w-10 h-10 flex items-center justify-center rounded-full glass-card text-white hover:bg-white/20 transition-colors shadow-lg">
                <span className="material-symbols-outlined">arrow_back</span>
            </button>
            <h1 className="text-2xl font-extrabold tracking-tight text-white text-glow text-center">
                {title}
            </h1>
            <div className="relative">
                <button
                    onClick={() => setMenuOpen(!menuOpen)}
                    className="w-10 h-10 flex items-center justify-center rounded-full glass-card text-white hover:bg-white/20 transition-colors shadow-lg"
                >
                    <span className="material-symbols-outlined">info</span>
                </button>

                {/* Dropdown Menu from previous implementation */}
                {menuOpen && (
                    <div style={{
                        position: 'absolute',
                        top: '50px',
                        right: isHebrew ? 'auto' : '0',
                        left: isHebrew ? '0' : 'auto',
                        background: 'rgba(255, 255, 255, 0.95)',
                        backdropFilter: 'blur(10px)',
                        borderRadius: '12px',
                        boxShadow: '0 4px 20px rgba(0, 0, 0, 0.15)',
                        minWidth: '220px',
                        overflow: 'hidden',
                        zIndex: 50
                    }}>
                        <div style={{ padding: '12px 16px', borderBottom: '1px solid rgba(0, 0, 0, 0.1)', display: 'flex', alignItems: 'center', gap: '10px' }}>
                            <div style={{ width: '32px', height: '32px', borderRadius: '50%', background: 'linear-gradient(135deg, #8A2BE2, #FF69B4)', display: 'flex', alignItems: 'center', justifyContent: 'center', color: 'white', fontSize: '14px', fontWeight: 700 }}>
                                {userProfile.name?.charAt(0).toUpperCase() || '👤'}
                            </div>
                            <span style={{ color: '#333', fontSize: '14px', fontWeight: 500 }}>
                                {userProfile.name || (isHebrew ? 'משתמש' : 'User')}
                            </span>
                        </div>

                        <div style={{ padding: '8px 0', borderBottom: '1px solid rgba(0,0,0,0.1)' }}>
                            <button onClick={() => { setLanguage('english'); setMenuOpen(false); }} style={{ width: '100%', padding: '10px 16px', border: 'none', background: !isHebrew ? 'rgba(43,108,238,0.1)' : 'transparent', textAlign: 'left', cursor: 'pointer', display: 'flex', justifyContent: 'space-between', alignItems: 'center' }}>
                                <span style={{ color: '#333', fontWeight: !isHebrew ? 600 : 400 }}>🇬🇧 English</span>
                                {!isHebrew && <span style={{ color: '#2b6cee' }}>✓</span>}
                            </button>
                            <button onClick={() => { setLanguage('hebrew'); setMenuOpen(false); }} style={{ width: '100%', padding: '10px 16px', border: 'none', background: isHebrew ? 'rgba(43,108,238,0.1)' : 'transparent', textAlign: 'left', cursor: 'pointer', display: 'flex', justifyContent: 'space-between', alignItems: 'center' }}>
                                <span style={{ color: '#333', fontWeight: isHebrew ? 600 : 400 }}>🇮🇱 עברית</span>
                                {isHebrew && <span style={{ color: '#2b6cee' }}>✓</span>}
                            </button>
                        </div>

                        <button
                            onClick={() => { onLogout(); setMenuOpen(false); }}
                            style={{ width: '100%', padding: '12px 16px', background: 'transparent', border: 'none', cursor: 'pointer', display: 'flex', alignItems: 'center', gap: '12px', fontSize: '14px', color: '#e53e3e' }}
                        >
                            <FluentIcon name="Logout" size={20} style={{ filter: 'grayscale(1) brightness(0.8) sepia(1) hue-rotate(-50deg) saturate(3)' }} />
                            <span>{isHebrew ? 'התנתק' : 'Sign Out'}</span>
                        </button>
                    </div>
                )}
            </div>
        </header>
    );
};

