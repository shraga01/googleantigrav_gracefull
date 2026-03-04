import React, { useState, useRef, useEffect } from 'react';
import { useApp } from '../../context/AppContext';
import { FluentIcon } from '../common/FluentIcon';

interface LanguageSelectionProps {
    onNext: () => void;
}

const LANGUAGES = [
    { code: 'english', flag: '🇬🇧', nativeName: 'English', subtitle: 'Continue in English' },
    { code: 'hebrew', flag: '🇮🇱', nativeName: 'עברית', subtitle: 'המשך בעברית' },
    { code: 'arabic', flag: '🇸🇦', nativeName: 'العربية', subtitle: 'تابع بالعربية' },
    { code: 'russian', flag: '🇷🇺', nativeName: 'Русский', subtitle: 'Продолжить на русском' },
    { code: 'french', flag: '🇫🇷', nativeName: 'Français', subtitle: 'Continuer en français' },
    { code: 'spanish', flag: '🇪🇸', nativeName: 'Español', subtitle: 'Continuar en español' },
    { code: 'amharic', flag: '🇪🇹', nativeName: 'አማርኛ', subtitle: 'በአማርኛ ቀጥል' },
];

export const LanguageSelection: React.FC<LanguageSelectionProps> = ({ onNext }) => {
    const { setLanguage } = useApp();
    const [isOpen, setIsOpen] = useState(false);
    const [selected, setSelected] = useState(LANGUAGES[0]);
    const dropdownRef = useRef<HTMLDivElement>(null);

    // Close dropdown on outside click
    useEffect(() => {
        const handleClick = (e: MouseEvent) => {
            if (dropdownRef.current && !dropdownRef.current.contains(e.target as Node)) {
                setIsOpen(false);
            }
        };
        document.addEventListener('mousedown', handleClick);
        return () => document.removeEventListener('mousedown', handleClick);
    }, []);

    const handleContinue = () => {
        setLanguage(selected.code as 'english' | 'hebrew');
        onNext();
    };

    return (
        <div className="bg-white font-display text-white antialiased overflow-hidden mesh-gradient min-h-screen w-full relative">
            <div className="relative flex min-h-[100dvh] w-full flex-col items-center justify-center overflow-auto max-w-md mx-auto sm:border-x sm:border-white/20 sm:shadow-2xl bg-white/5 backdrop-blur-3xl sm:backdrop-blur-sm sm:bg-white/10 p-6 pb-safe text-white">
                {/* 3D Animated Globe Icon */}
                <div style={{ marginBottom: '24px' }}>
                    <FluentIcon name="Globe" size={80} />
                </div>

                {/* Title */}
                <h1 style={{
                    fontFamily: "'Playfair Display', serif",
                    fontSize: '32px',
                    fontWeight: 700,
                    color: 'white',
                    marginBottom: '8px',
                    textAlign: 'center',
                    textShadow: '0 2px 8px rgba(0,0,0,0.3)'
                }}>
                    Daily Appreciation
                </h1>
                <p style={{
                    fontSize: '16px',
                    color: 'rgba(255, 255, 255, 0.8)',
                    marginBottom: '40px',
                    textAlign: 'center'
                }}>
                    Choose your language / בחר שפה
                </p>

                {/* Language Dropdown Selector */}
                <div ref={dropdownRef} style={{
                    width: '100%',
                    maxWidth: '320px',
                    position: 'relative',
                    marginBottom: '32px'
                }}>
                    {/* Currently Selected Language Button */}
                    <button
                        onClick={() => setIsOpen(!isOpen)}
                        style={{
                            width: '100%',
                            display: 'flex',
                            alignItems: 'center',
                            justifyContent: 'space-between',
                            padding: '16px 20px',
                            background: 'rgba(255, 255, 255, 0.15)',
                            backdropFilter: 'blur(10px)',
                            border: '1.5px solid rgba(255, 255, 255, 0.35)',
                            borderRadius: isOpen ? '16px 16px 0 0' : '16px',
                            cursor: 'pointer',
                            transition: 'all 0.2s ease',
                            color: 'white'
                        }}
                    >
                        <div style={{ display: 'flex', alignItems: 'center', gap: '12px' }}>
                            <span style={{ fontSize: '28px' }}>{selected.flag}</span>
                            <div style={{ textAlign: 'left' }}>
                                <div style={{ fontSize: '18px', fontWeight: 600 }}>{selected.nativeName}</div>
                                <div style={{ fontSize: '13px', color: 'rgba(255,255,255,0.6)' }}>{selected.subtitle}</div>
                            </div>
                        </div>
                        <svg width="20" height="20" viewBox="0 0 24 24" fill="white"
                            style={{ transform: isOpen ? 'rotate(180deg)' : 'rotate(0deg)', transition: 'transform 0.2s' }}>
                            <path d="M7 10l5 5 5-5z" />
                        </svg>
                    </button>

                    {/* Dropdown Options */}
                    {isOpen && (
                        <div style={{
                            position: 'absolute',
                            top: '100%',
                            left: 0,
                            right: 0,
                            background: 'rgba(0, 0, 0, 0.65)',
                            backdropFilter: 'blur(16px)',
                            borderRadius: '0 0 16px 16px',
                            border: '1.5px solid rgba(255,255,255,0.08)',
                            borderTop: 'none',
                            maxHeight: '260px',
                            overflowY: 'auto',
                            boxShadow: '0 8px 30px rgba(0, 0, 0, 0.4)',
                            zIndex: 50
                        }}>
                            {LANGUAGES.map((lang) => (
                                <button
                                    key={lang.code}
                                    onClick={() => {
                                        setSelected(lang);
                                        setIsOpen(false);
                                    }}
                                    style={{
                                        width: '100%',
                                        display: 'flex',
                                        alignItems: 'center',
                                        gap: '12px',
                                        padding: '12px 20px',
                                        background: selected.code === lang.code ? 'rgba(138,43,226,0.08)' : 'transparent',
                                        border: 'none',
                                        borderBottom: '1px solid rgba(255,255,255,0.05)',
                                        cursor: 'pointer',
                                        color: 'white',
                                        textAlign: 'left',
                                        transition: 'background 0.15s ease'
                                    }}
                                >
                                    <span style={{ fontSize: '24px' }}>{lang.flag}</span>
                                    <div>
                                        <div style={{
                                            fontSize: '15px',
                                            fontWeight: selected.code === lang.code ? 600 : 400,
                                            color: selected.code === lang.code ? '#d81b60' : 'white'
                                        }}>
                                            {lang.nativeName}
                                        </div>
                                    </div>
                                    {selected.code === lang.code && (
                                        <span style={{ marginLeft: 'auto', color: '#d81b60', fontWeight: 700 }}>✓</span>
                                    )}
                                </button>
                            ))}
                        </div>
                    )}
                </div>

                {/* Continue Button */}
                <button
                    onClick={handleContinue}
                    className="w-full h-16 rounded-full glass-card text-white text-xl font-black tracking-tight glass-button-glow hover:scale-[1.02] transition-all duration-300 shadow-2xl flex items-center justify-center gap-2 mt-auto sm:mt-8"
                >
                    {selected.code === 'hebrew' ? 'המשך' : 'Continue'}
                </button>
            </div>
        </div>
    );
};
