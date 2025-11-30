import React, { useState } from 'react';
import { useApp } from '../../context/AppContext';
import { Button } from '../common/Button';
import { Input } from '../common/Input';
import type { UserProfile } from '../../types';
import { v4 as uuidv4 } from 'uuid';

interface Props {
    onComplete: () => void;
}

// Only 3 basic questions for onboarding
const ONBOARDING_QUESTIONS = [
    { id: 'name', key: 'name', en: 'What is your name?', he: 'מה שמך?' },
    { id: 'gender', key: 'gender', en: 'Gender (optional)', he: 'מגדר (אופציונלי)' },
    { id: 'familyStatus', key: 'familyStatus', en: 'What is your family status?', he: 'מה מצב המשפחה שלך?' },
];

// Additional questions that will appear randomly during daily practice
export const ADDITIONAL_PROFILE_QUESTIONS = [
    { id: 'career', key: 'career', en: 'What do you do for work?', he: 'במה אתה עוסק?' },
    { id: 'living', key: 'livingSituation', en: 'What is your living situation?', he: 'מה מצב המגורים שלך?' },
    { id: 'joys', key: 'joys', en: 'What brings you joy?', he: 'מה משמח אותך?' },
    { id: 'challenges', key: 'challenges', en: 'What challenges are you facing?', he: 'עם אילו אתגרים אתה מתמודד?' },
    { id: 'dreams', key: 'dreams', en: 'What are your dreams and aspirations?', he: 'מה החלומות והשאיפות שלך?' },
    { id: 'goals', key: 'goals', en: 'What are your current goals?', he: 'מה המטרות הנוכחיות שלך?' },
];

export const ProfileSetup: React.FC<Props> = ({ onComplete }) => {
    const { language, updateProfile } = useApp();
    const isHebrew = language === 'hebrew';
    const [step, setStep] = useState(0);
    const [answers, setAnswers] = useState<Partial<UserProfile>>({});

    const currentQuestion = ONBOARDING_QUESTIONS[step];
    const isLastStep = step === ONBOARDING_QUESTIONS.length - 1;

    const handleNext = (value: string) => {
        const newAnswers = { ...answers, [currentQuestion.key]: value };
        setAnswers(newAnswers);

        if (isLastStep) {
            finishSetup(newAnswers);
        } else {
            setStep(step + 1);
        }
    };

    const handleSkip = () => {
        if (isLastStep) {
            finishSetup(answers);
        } else {
            setStep(step + 1);
        }
    };

    const finishSetup = (finalAnswers: Partial<UserProfile>) => {
        const newProfile: UserProfile = {
            userId: uuidv4(),
            language,
            createdAt: Date.now(),
            ...finalAnswers
        } as UserProfile;

        updateProfile(newProfile);
        onComplete();
    };

    const [inputValue, setInputValue] = useState('');

    // Reset input when step changes
    React.useEffect(() => {
        setInputValue('');
    }, [step]);

    return (
        <div style={{
            display: 'flex',
            flexDirection: 'column',
            height: '100vh',
            padding: '20px',
            maxWidth: '600px',
            margin: '0 auto'
        }}>
            <div style={{ flex: 1, display: 'flex', flexDirection: 'column', justifyContent: 'center' }}>
                <div style={{ marginBottom: '10px', color: 'var(--color-text-muted)' }}>
                    {step + 1} / {ONBOARDING_QUESTIONS.length}
                </div>

                <h2 style={{ marginBottom: '24px', fontSize: '24px' }}>
                    {isHebrew ? currentQuestion.he : currentQuestion.en}
                </h2>

                <Input
                    value={inputValue}
                    onChange={(e) => setInputValue(e.target.value)}
                    placeholder={isHebrew ? 'הקלד כאן...' : 'Type here...'}
                    autoFocus
                />
            </div>

            <div style={{ display: 'flex', gap: '16px', paddingBottom: '20px' }}>
                <Button
                    variant="secondary"
                    onClick={handleSkip}
                    style={{ flex: 1 }}
                >
                    {isHebrew ? 'דלג' : 'Skip'}
                </Button>
                <Button
                    variant="primary"
                    onClick={() => handleNext(inputValue)}
                    style={{ flex: 1 }}
                >
                    {isLastStep ? (isHebrew ? 'סיים' : 'Finish') : (isHebrew ? 'המשך' : 'Continue')}
                </Button>
            </div>
        </div>
    );
};
