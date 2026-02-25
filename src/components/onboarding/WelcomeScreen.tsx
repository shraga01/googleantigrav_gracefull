import React from 'react';
import { useApp } from '../../context/AppContext';
import { FluentIcon } from '../common/FluentIcon';

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
            {/* 3D Animated Icon */}
            <div style={{ marginBottom: '24px' }}>
                <FluentIcon name="Sun" size={80} />
            </div>

            {/* Title */}
            <h1 style={{
                fontSize: '32px',
                fontWeight: 700,
                color: 'white',
                marginBottom: '12px',
                textAlign: 'center',
                textShadow: '0 2px 8px rgba(0,0,0,0.3)'
            }}>
                {isHebrew ? 'ברוכים הבאים' : 'Welcome'}
            </h1>

            {/* Subtitle */}
            <p style={{
                fontSize: '16px',
                color: 'rgba(255, 255, 255, 0.8)',
                textAlign: 'center',
                maxWidth: '320px',
                marginBottom: '24px',
                lineHeight: '1.6'
            }}>
                {isHebrew
                    ? 'התחל את היום שלך עם הודיה. מצא את הטוב בכל רגע.'
                    : 'Start your day with gratitude. Find the good in every moment.'}
            </p>

            {/* Mission Statement */}
            <div style={{
                background: 'rgba(255, 255, 255, 0.1)',
                backdropFilter: 'blur(10px)',
                borderLeft: isHebrew ? 'none' : '3px solid #FFA500',
                borderRight: isHebrew ? '3px solid #FFA500' : 'none',
                padding: '16px',
                borderRadius: '12px',
                maxWidth: '340px',
                marginBottom: '32px',
                width: '100%'
            }}>
                <p style={{
                    fontSize: '13px',
                    color: 'rgba(0, 0, 0, 0.8)',
                    lineHeight: '1.7',
                    margin: 0,
                    textAlign: isHebrew ? 'right' : 'left'
                }}>
                    {isHebrew
                        ? 'המשימה שלנו היא להרים את המשקל הביולוגי והפסיכולוגי של החיים. אנו משתמשים בטכניקות הערכה מבוססות ראיות כדי לחדד מחדש את תגובת המוח ללחץ, לשפר את בריאות הלב והשינה, ולטפח תודעה עמידה ופרו-חברתית.'
                        : 'Our mission is to lift the biological and psychological weight of life. We use evidence-based appreciation techniques to rewire the brain\'s response to stress, improve heart health and sleep, and cultivate a resilient, prosocial mind.'}
                </p>
            </div>

            {/* Features */}
            <div style={{
                width: '100%',
                maxWidth: '320px',
                display: 'flex',
                flexDirection: 'column',
                gap: '12px',
                marginBottom: '40px'
            }}>
                <div style={{ display: 'flex', alignItems: 'center', gap: '12px', color: 'white' }}>
                    <FluentIcon name="Seedling" size={28} />
                    <span>{isHebrew ? 'פשוט ומהיר - רק 3 דברים ביום' : 'Simple & fast - just 3 things a day'}</span>
                </div>
                <div style={{ display: 'flex', alignItems: 'center', gap: '12px', color: 'white' }}>
                    <FluentIcon name="Sparkles" size={28} />
                    <span>{isHebrew ? 'עקוב אחר ההתקדמות שלך' : 'Track your progress & streaks'}</span>
                </div>
                <div style={{ display: 'flex', alignItems: 'center', gap: '12px', color: 'white' }}>
                    <FluentIcon name="Lock" size={28} />
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
                    background: 'linear-gradient(to right, #FFB6C1, #FF69B4)',
                    color: 'black',
                    fontSize: '18px',
                    fontWeight: 700,
                    border: 'none',
                    borderRadius: '9999px',
                    cursor: 'pointer',
                    boxShadow: '0 4px 15px rgba(255, 105, 180, 0.4)'
                }}
            >
                {isHebrew ? 'המשך' : 'Continue'}
            </button>
        </div>
    );
};
