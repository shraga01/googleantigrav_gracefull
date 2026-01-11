import React from 'react';
import { useApp } from '../../context/AppContext';
import { Button } from '../common/Button';
import { SunIcon } from '../common/Icons';

interface Props {
    onNext: () => void;
}

export const WelcomeScreen: React.FC<Props> = ({ onNext }) => {
    const { language } = useApp();
    const isHebrew = language === 'hebrew';

    const content = {
        english: {
            title: "Welcome",
            text: [
                "There's only one reason you're suffering - you're focused on yourself.",
                "You cannot suffer and appreciate simultaneously.",
                "Let's practice appreciation together."
            ],
            button: "Start Journey"
        },
        hebrew: {
            title: "ברוכים הבאים",
            text: [
                "יש רק סיבה אחת לסבל שלך - ההתמקדות בעצמך.",
                "אי אפשר לסבול ולהוקיר תודה בו זמנית.",
                "בואו נתרגל הוקרת תודה יחד."
            ],
            button: "התחל מסע"
        }
    };

    const t = isHebrew ? content.hebrew : content.english;

    return (
        <div style={{
            display: 'flex',
            flexDirection: 'column',
            alignItems: 'center',
            justifyContent: 'center',
            height: '100vh',
            padding: 'var(--spacing-xl)',
            textAlign: 'center',
            backgroundColor: 'var(--color-primary-light)',
            color: 'var(--color-text-main)'
        }}>
            <div style={{
                color: 'var(--color-primary)',
                marginBottom: 'var(--spacing-lg)',
                padding: 'var(--spacing-md)',
                backgroundColor: 'white',
                borderRadius: 'var(--radius-full)',
                boxShadow: 'var(--shadow-md)'
            }}>
                <SunIcon size={48} />
            </div>

            <h1 style={{
                color: 'var(--color-text-main)',
                marginBottom: 'var(--spacing-xl)',
                fontSize: 'var(--font-size-xxl)',
                fontWeight: 800
            }}>
                {t.title}
            </h1>

            <div style={{
                marginBottom: 'var(--spacing-xxl)',
                fontSize: 'var(--font-size-lg)',
                lineHeight: '1.8',
                maxWidth: '600px',
                color: 'var(--color-text-muted)'
            }}>
                {t.text.map((line, i) => (
                    <p key={i} style={{ marginBottom: 'var(--spacing-md)' }}>{line}</p>
                ))}
            </div>

            <Button onClick={onNext} fullWidth style={{ maxWidth: '300px' }}>
                {t.button}
            </Button>
        </div>
    );
};
