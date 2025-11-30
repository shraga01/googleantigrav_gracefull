import React from 'react';
import { useApp } from '../../context/AppContext';
import { Button } from '../common/Button';

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
            padding: '32px',
            textAlign: 'center',
            backgroundColor: 'var(--color-primary-light)'
        }}>
            <h1 style={{ color: 'var(--color-primary)', marginBottom: '32px' }}>{t.title}</h1>

            <div style={{ marginBottom: '48px', fontSize: '18px', lineHeight: '1.6' }}>
                {t.text.map((line, i) => (
                    <p key={i} style={{ marginBottom: '16px' }}>{line}</p>
                ))}
            </div>

            <Button onClick={onNext} fullWidth style={{ maxWidth: '300px' }}>
                {t.button}
            </Button>
        </div>
    );
};
