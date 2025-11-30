import React from 'react';
import { useApp } from '../../context/AppContext';
import { Button } from '../common/Button';

interface Props {
    onNext: () => void;
}

export const LanguageSelection: React.FC<Props> = ({ onNext }) => {
    const { setLanguage } = useApp();

    const handleSelect = (lang: 'hebrew' | 'english') => {
        setLanguage(lang);
        onNext();
    };

    return (
        <div style={{
            display: 'flex',
            flexDirection: 'column',
            alignItems: 'center',
            justifyContent: 'center',
            height: '100vh',
            padding: '20px',
            gap: '20px'
        }}>
            <h1 style={{ fontSize: '24px', marginBottom: '40px', textAlign: 'center' }}>
                Choose your language<br />
                בחר את השפה שלך
            </h1>

            <Button
                fullWidth
                onClick={() => handleSelect('english')}
                style={{ maxWidth: '300px' }}
            >
                English
            </Button>

            <Button
                fullWidth
                onClick={() => handleSelect('hebrew')}
                style={{ maxWidth: '300px', fontFamily: 'sans-serif' }}
            >
                עברית
            </Button>
        </div>
    );
};
