import React from 'react';
import { useApp } from '../../context/AppContext';

interface LanguageSelectionProps {
    onNext: () => void;
}

export const LanguageSelection: React.FC<LanguageSelectionProps> = ({ onNext }) => {
    const { setLanguage } = useApp();

    const handleSelection = (lang: 'english' | 'hebrew') => {
        setLanguage(lang);
        onNext();
    };

    return (
        <div style={{
            minHeight: '100vh',
            display: 'flex',
            flexDirection: 'column',
            alignItems: 'center',
            justifyContent: 'center',
            padding: '24px'
        }}>
            {/* Logo/Icon */}
            <div style={{ fontSize: '64px', marginBottom: '24px' }}>🌅</div>

            {/* Title */}
            <h1 style={{
                fontFamily: "'Playfair Display', serif",
                fontSize: '32px',
                fontWeight: 700,
                color: 'white',
                marginBottom: '8px',
                textAlign: 'center',
                textShadow: '0 2px 4px rgba(0,0,0,0.3)'
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

            {/* Language Cards - Stacked Vertically */}
            <div style={{
                width: '100%',
                maxWidth: '320px',
                display: 'flex',
                flexDirection: 'column',
                gap: '16px'
            }}>
                {/* English */}
                <button
                    onClick={() => handleSelection('english')}
                    style={{
                        width: '100%',
                        display: 'flex',
                        alignItems: 'center',
                        justifyContent: 'space-between',
                        padding: '16px 20px',
                        background: 'rgba(255, 255, 255, 0.15)',
                        backdropFilter: 'blur(10px)',
                        border: '1px solid rgba(255, 255, 255, 0.3)',
                        borderRadius: '16px',
                        cursor: 'pointer',
                        transition: 'all 0.2s ease'
                    }}
                >
                    <div style={{ display: 'flex', alignItems: 'center', gap: '12px' }}>
                        <span style={{ fontSize: '32px' }}>🇬🇧</span>
                        <div style={{ textAlign: 'left' }}>
                            <div style={{ fontSize: '18px', fontWeight: 600, color: 'white' }}>English</div>
                            <div style={{ fontSize: '14px', color: 'rgba(255, 255, 255, 0.7)' }}>Continue in English</div>
                        </div>
                    </div>
                    <svg width="24" height="24" viewBox="0 0 24 24" fill="none" stroke="rgba(255, 255, 255, 0.7)" strokeWidth="2">
                        <path strokeLinecap="round" strokeLinejoin="round" d="M9 5l7 7-7 7" />
                    </svg>
                </button>

                {/* Hebrew */}
                <button
                    onClick={() => handleSelection('hebrew')}
                    dir="rtl"
                    style={{
                        width: '100%',
                        display: 'flex',
                        alignItems: 'center',
                        justifyContent: 'space-between',
                        padding: '16px 20px',
                        background: 'rgba(255, 255, 255, 0.15)',
                        backdropFilter: 'blur(10px)',
                        border: '1px solid rgba(255, 255, 255, 0.3)',
                        borderRadius: '16px',
                        cursor: 'pointer',
                        transition: 'all 0.2s ease'
                    }}
                >
                    <div style={{ display: 'flex', alignItems: 'center', gap: '12px' }}>
                        <span style={{ fontSize: '32px' }}>🇮🇱</span>
                        <div style={{ textAlign: 'right' }}>
                            <div style={{ fontSize: '18px', fontWeight: 600, color: 'white' }}>עברית</div>
                            <div style={{ fontSize: '14px', color: 'rgba(255, 255, 255, 0.7)' }}>המשך בעברית</div>
                        </div>
                    </div>
                    <svg width="24" height="24" viewBox="0 0 24 24" fill="none" stroke="rgba(255, 255, 255, 0.7)" strokeWidth="2" style={{ transform: 'rotate(180deg)' }}>
                        <path strokeLinecap="round" strokeLinejoin="round" d="M9 5l7 7-7 7" />
                    </svg>
                </button>
            </div>
        </div>
    );
};
