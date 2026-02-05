import React, { useState, useEffect } from 'react';
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
    const [question, setQuestion] = useState<typeof ADDITIONAL_PROFILE_QUESTIONS[0] | null>(null);

    const isHebrew = userProfile?.language === 'hebrew';

    useEffect(() => {
        if (!userProfile) return;

        // Check if already asked today
        const today = new Date().toLocaleDateString('en-CA');
        const lastAsked = localStorage.getItem('last_random_question_date');

        if (lastAsked === today) {
            onSkip();
            return;
        }

        // Get a random question that hasn't been answered yet
        const unansweredQuestions = ADDITIONAL_PROFILE_QUESTIONS.filter(q => {
            const key = q.key as keyof typeof userProfile;
            return !userProfile[key];
        });

        if (unansweredQuestions.length === 0) {
            onSkip();
            return;
        }

        const randomIndex = Math.floor(Math.random() * unansweredQuestions.length);
        setQuestion(unansweredQuestions[randomIndex]);
    }, [userProfile]); // Dependencies empty or minimal to avoid re-running

    if (!question || !userProfile) return null;

    const handleSave = () => {
        if (answer.trim()) {
            const updatedProfile = {
                ...userProfile,
                [question.key]: answer
            };
            updateProfile(updatedProfile);

            // Mark as asked today only if answered? Or even if skipped?
            // User asked for "no more one question a day", implying regardless of outcome.
            const today = new Date().toLocaleDateString('en-CA');
            localStorage.setItem('last_random_question_date', today);
        }
        onComplete();
    };

    const handleSkip = () => {
        const today = new Date().toLocaleDateString('en-CA');
        localStorage.setItem('last_random_question_date', today);
        onSkip();
    };

    return (
        <div style={{
            position: 'fixed',
            top: 0,
            left: 0,
            right: 0,
            bottom: 0,
            backgroundColor: 'rgba(0,0,0,0.6)',
            backdropFilter: 'blur(5px)',
            display: 'flex',
            alignItems: 'center',
            justifyContent: 'center',
            zIndex: 1000,
            padding: '20px',
            animation: 'fadeIn 0.3s ease-out'
        }}>
            <div style={{
                background: 'rgba(255, 255, 255, 0.15)',
                backdropFilter: 'blur(20px)',
                borderRadius: '24px',
                padding: '32px',
                maxWidth: '500px',
                width: '100%',
                border: '1px solid rgba(255, 255, 255, 0.3)',
                boxShadow: '0 8px 32px rgba(0, 0, 0, 0.2)',
                color: 'black',
                textAlign: 'center'
            }}>
                <div style={{ fontSize: '40px', marginBottom: '16px' }}>🤔</div>

                <h3 style={{
                    marginBottom: '8px',
                    color: 'rgba(0, 0, 0, 0.7)',
                    fontSize: '14px',
                    textTransform: 'uppercase',
                    letterSpacing: '1px'
                }}>
                    {isHebrew ? 'שאלה יומית' : 'Daily Insight'}
                </h3>

                <h2 style={{
                    marginBottom: '24px',
                    fontSize: '24px',
                    fontWeight: 600,
                    lineHeight: 1.4
                }}>
                    {isHebrew ? question.he : question.en}
                </h2>

                <div style={{ marginBottom: '24px' }}>
                    <Input
                        value={answer}
                        onChange={(e) => setAnswer(e.target.value)}
                        placeholder={isHebrew ? 'התשובה שלך...' : 'Your thoughts...'}
                        autoFocus
                        style={{
                            background: 'rgba(255, 255, 255, 0.2)',
                            border: '1px solid rgba(255, 255, 255, 0.3)',
                            color: 'black'
                        }}
                    />
                </div>

                <div style={{ display: 'flex', gap: '12px' }}>
                    <Button
                        variant="secondary"
                        onClick={handleSkip}
                        style={{
                            flex: 1,
                            background: 'rgba(255, 255, 255, 0.1)',
                            border: '1px solid rgba(255, 255, 255, 0.2)',
                            color: 'black'
                        }}
                    >
                        {isHebrew ? 'דלג' : 'Skip'}
                    </Button>
                    <Button
                        variant="primary"
                        onClick={handleSave}
                        style={{
                            flex: 1,
                            background: 'linear-gradient(135deg, #6366f1 0%, #a855f7 100%)',
                            border: 'none',
                            color: 'black'
                        }}
                    >
                        {isHebrew ? 'שמור' : 'Save'}
                    </Button>
                </div>
            </div>
        </div>
    );
};
