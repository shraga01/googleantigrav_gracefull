import React, { useState } from 'react';
import { useApp } from '../../context/AppContext';
import { Button } from '../common/Button';
import { Input } from '../common/Input';
import { ADDITIONAL_PROFILE_QUESTIONS } from '../onboarding/ProfileSetup';

interface Props {
    onComplete: () => void;
    onSkip: () => void;
}

export const RandomProfileQuestion: React.FC<Props> = ({ onComplete, onSkip }) => {
    const { userProfile, updateProfile } = useApp();
    const [answer, setAnswer] = useState('');

    if (!userProfile) return null;

    const isHebrew = userProfile.language === 'hebrew';

    // Get a random question that hasn't been answered yet
    const getRandomQuestion = () => {
        const unansweredQuestions = ADDITIONAL_PROFILE_QUESTIONS.filter(q => {
            const key = q.key as keyof typeof userProfile;
            return !userProfile[key];
        });

        if (unansweredQuestions.length === 0) return null;

        const randomIndex = Math.floor(Math.random() * unansweredQuestions.length);
        return unansweredQuestions[randomIndex];
    };

    const question = getRandomQuestion();

    if (!question) {
        // All questions answered, skip this
        onSkip();
        return null;
    }

    const handleSave = () => {
        if (answer.trim()) {
            const updatedProfile = {
                ...userProfile,
                [question.key]: answer
            };
            updateProfile(updatedProfile);
        }
        onComplete();
    };

    return (
        <div style={{
            position: 'fixed',
            top: 0,
            left: 0,
            right: 0,
            bottom: 0,
            backgroundColor: 'rgba(0,0,0,0.5)',
            display: 'flex',
            alignItems: 'center',
            justifyContent: 'center',
            zIndex: 1000,
            padding: '20px'
        }}>
            <div style={{
                backgroundColor: 'var(--color-card-bg)',
                borderRadius: 'var(--radius-lg)',
                padding: '24px',
                maxWidth: '500px',
                width: '100%'
            }}>
                <h3 style={{ marginBottom: '8px', color: 'var(--color-primary)' }}>
                    {isHebrew ? 'שאלה מהירה' : 'Quick Question'}
                </h3>
                <p style={{ fontSize: '14px', color: 'var(--color-text-muted)', marginBottom: '20px' }}>
                    {isHebrew ? 'עזור לנו להכיר אותך טוב יותר' : 'Help us get to know you better'}
                </p>

                <h2 style={{ marginBottom: '16px', fontSize: '20px' }}>
                    {isHebrew ? question.he : question.en}
                </h2>

                <Input
                    value={answer}
                    onChange={(e) => setAnswer(e.target.value)}
                    placeholder={isHebrew ? 'הקלד כאן...' : 'Type here...'}
                    autoFocus
                />

                <div style={{ display: 'flex', gap: '12px', marginTop: '20px' }}>
                    <Button variant="secondary" onClick={onSkip} style={{ flex: 1 }}>
                        {isHebrew ? 'דלג' : 'Skip'}
                    </Button>
                    <Button variant="primary" onClick={handleSave} style={{ flex: 1 }}>
                        {isHebrew ? 'שמור' : 'Save'}
                    </Button>
                </div>
            </div>
        </div>
    );
};
