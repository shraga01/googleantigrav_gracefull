import React from 'react';
import { useApp } from '../../context/AppContext';

interface WelcomeScreenProps {
    onNext: () => void;
}

export const WelcomeScreen: React.FC<WelcomeScreenProps> = ({ onNext }) => {
    const { language } = useApp();
    const isHebrew = language === 'hebrew';

    return (
        <div
            dir={isHebrew ? 'rtl' : 'ltr'}
            style={{
                minHeight: '100vh',
                display: 'flex',
                flexDirection: 'column',
                alignItems: 'center',
                justifyContent: 'center',
                padding: '24px'
            }}
        >
            {/* Icon */}
            <div style={{ fontSize: '80px', marginBottom: '24px' }}>☀️</div>

            {/* Title */}
            <h1 style={{
                fontSize: '28px',
                fontWeight: 700,
                color: '#2C3E50',
                marginBottom: '12px',
                textAlign: 'center'
            }}>
                {isHebrew ? 'ברוכים הבאים' : 'Welcome'}
            </h1>

            {/* Subtitle */}
            <p style={{
                fontSize: '16px',
                color: '#6B7280',
                textAlign: 'center',
                maxWidth: '320px',
                marginBottom: '32px',
                lineHeight: '1.6'
            }}>
                {isHebrew
                    ? 'התחל את היום שלך עם הודיה. מצא את הטוב בכל רגע.'
                    : 'Start your day with gratitude. Find the good in every moment.'}
            </p>

            {/* Features */}
            <div style={{
                width: '100%',
                maxWidth: '320px',
                display: 'flex',
                flexDirection: 'column',
                gap: '12px',
                marginBottom: '40px'
            }}>
                <div style={{ display: 'flex', alignItems: 'center', gap: '12px', color: '#374151' }}>
                    <span style={{ fontSize: '24px' }}>🌱</span>
                    <span>{isHebrew ? 'פשוט ומהיר - רק 3 דברים ביום' : 'Simple & fast - just 3 things a day'}</span>
                </div>
                <div style={{ display: 'flex', alignItems: 'center', gap: '12px', color: '#374151' }}>
                    <span style={{ fontSize: '24px' }}>✨</span>
                    <span>{isHebrew ? 'עקוב אחר ההתקדמות שלך' : 'Track your progress & streaks'}</span>
                </div>
                <div style={{ display: 'flex', alignItems: 'center', gap: '12px', color: '#374151' }}>
                    <span style={{ fontSize: '24px' }}>🔒</span>
                    <span>{isHebrew ? 'פרטי ומאובטח' : 'Private & encrypted'}</span>
                </div>
            </div>

            {/* Continue Button */}
            <button
                onClick={onNext}
                style={{
                    width: '100%',
                    maxWidth: '320px',
                    padding: '16px',
                    backgroundColor: '#9FB397',
                    color: 'white',
                    fontSize: '18px',
                    fontWeight: 600,
                    border: 'none',
                    borderRadius: '16px',
                    cursor: 'pointer'
                }}
            >
                {isHebrew ? 'המשך' : 'Continue'}
            </button>
        </div>
    );
};
