import React from 'react';
import { useApp } from '../../context/AppContext';

interface Props {
    onNext: () => void;
}

export const LanguageSelection: React.FC<Props> = ({ onNext }) => {
    const { setLanguage } = useApp();

    const handleSelect = (lang: 'hebrew' | 'english') => {
        setLanguage(lang);
        onNext();
    };

    const CardStyle: React.CSSProperties = {
        padding: '32px',
        backgroundColor: 'white',
        borderRadius: 'var(--radius-lg)',
        boxShadow: 'var(--shadow-md)',
        cursor: 'pointer',
        textAlign: 'center',
        width: '100%',
        maxWidth: '280px',
        transition: 'transform var(--transition-fast), box-shadow var(--transition-fast)',
        border: '1px solid transparent',
        display: 'flex',
        flexDirection: 'column',
        alignItems: 'center',
        gap: '12px'
    };

    return (
        <div style={{
            display: 'flex',
            flexDirection: 'column',
            alignItems: 'center',
            justifyContent: 'center',
            minHeight: '100vh',
            padding: 'var(--spacing-lg)',
            gap: 'var(--spacing-xl)',
            backgroundColor: 'var(--color-background)'
        }}>
            <h1 style={{
                fontSize: 'var(--font-size-xl)',
                textAlign: 'center',
                color: 'var(--color-text-main)',
                lineHeight: '1.5'
            }}>
                Choose your language<br />
                <span style={{ color: 'var(--color-primary)' }}>בחר את השפה שלך</span>
            </h1>

            <div style={{ display: 'flex', gap: 'var(--spacing-md)', flexWrap: 'wrap', justifyContent: 'center', width: '100%' }}>
                <div
                    onClick={() => handleSelect('english')}
                    style={CardStyle}
                    className="hover-card"
                >
                    <span style={{ fontSize: '48px' }}>🇬🇧</span>
                    <span style={{ fontSize: '20px', fontWeight: 600, color: 'var(--color-text-main)' }}>English</span>
                </div>

                <div
                    onClick={() => handleSelect('hebrew')}
                    style={CardStyle}
                    className="hover-card"
                >
                    <span style={{ fontSize: '48px' }}>🇮🇱</span>
                    <span style={{ fontSize: '20px', fontWeight: 600, color: 'var(--color-text-main)' }}>עברית</span>
                </div>
            </div>
        </div>
    );
};
