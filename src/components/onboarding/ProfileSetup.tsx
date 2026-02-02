import React, { useState } from 'react';
import { useApp } from '../../context/AppContext';
import { Button } from '../common/Button';
import { Input } from '../common/Input';
import type { UserProfile } from '../../types';
import { ApiService } from '../../services/api';

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
        // Use Firebase UID as userId for proper user identification
        const firebaseUid = ApiService.getFirebaseUid();

        const newProfile: UserProfile = {
            userId: firebaseUid || `anonymous_${Date.now()}`,
            language,
            createdAt: Date.now(),
            ...finalAnswers
        } as UserProfile;

        console.log('Creating profile with userId:', newProfile.userId);
        updateProfile(newProfile, true); // true = sync to server
        onComplete();
    };

    const [inputValue, setInputValue] = useState('');

    // Reset input when step changes
    React.useEffect(() => {
        setInputValue('');
    }, [step]);

    return (
        <div
            dir={isHebrew ? 'rtl' : 'ltr'}
            style={{
                display: 'flex',
                flexDirection: 'column',
                minHeight: '100vh',
                padding: '24px',
                maxWidth: '600px',
                margin: '0 auto'
            }}
        >
            <div style={{ flex: 1, display: 'flex', flexDirection: 'column', justifyContent: 'center' }}>
                {/* Step indicator */}
                <div style={{
                    marginBottom: '16px',
                    color: '#FFA500',
                    fontWeight: 600,
                    letterSpacing: '1px',
                    fontSize: '14px'
                }}>
                    {isHebrew ? `שלב ${step + 1} מתוך ${ONBOARDING_QUESTIONS.length}` : `STEP ${step + 1} OF ${ONBOARDING_QUESTIONS.length}`}
                </div>

                {/* Question */}
                <h2 style={{
                    marginBottom: '24px',
                    fontSize: '28px',
                    fontWeight: 700,
                    color: 'white',
                    textShadow: '0 2px 4px rgba(0,0,0,0.3)',
                    lineHeight: 1.3
                }}>
                    {isHebrew ? currentQuestion.he : currentQuestion.en}
                </h2>

                {/* Input */}
                <div style={{
                    background: 'rgba(255, 255, 255, 0.15)',
                    backdropFilter: 'blur(10px)',
                    border: '1px solid rgba(255, 255, 255, 0.3)',
                    borderRadius: '16px',
                    padding: '16px 20px'
                }}>
                    <Input
                        value={inputValue}
                        onChange={(e) => setInputValue(e.target.value)}
                        placeholder={isHebrew ? 'הקלד כאן...' : 'Type here...'}
                        autoFocus
                        style={{
                            fontSize: '18px',
                            padding: '12px 0',
                            background: 'transparent',
                            border: 'none',
                            color: 'white',
                            width: '100%'
                        }}
                    />
                </div>
            </div>

            {/* Buttons */}
            <div style={{
                display: 'flex',
                gap: '12px',
                paddingBottom: '32px',
                paddingTop: '24px'
            }}>
                <Button
                    variant="ghost"
                    onClick={handleSkip}
                    style={{
                        flex: 1,
                        background: 'rgba(255, 255, 255, 0.1)',
                        border: '1px solid rgba(255, 255, 255, 0.3)',
                        color: 'rgba(255, 255, 255, 0.8)',
                        borderRadius: '9999px',
                        padding: '14px 24px'
                    }}
                >
                    {isHebrew ? 'דלג' : 'Skip'}
                </Button>
                <Button
                    variant="primary"
                    onClick={() => handleNext(inputValue)}
                    style={{
                        flex: 2,
                        background: 'linear-gradient(to right, #FFB6C1, #FF69B4)',
                        color: 'white',
                        borderRadius: '9999px',
                        padding: '14px 24px',
                        fontWeight: 700,
                        boxShadow: '0 4px 15px rgba(255, 105, 180, 0.4)'
                    }}
                >
                    {isLastStep ? (isHebrew ? 'סיים' : 'Finish') : (isHebrew ? 'המשך' : 'Continue')}
                </Button>
            </div>
        </div>
    );
};
