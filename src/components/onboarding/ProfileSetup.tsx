import React, { useState } from 'react';
import { useApp } from '../../context/AppContext';
import { Button } from '../common/Button';
import { Input } from '../common/Input';
import type { UserProfile } from '../../types';
import { ApiService } from '../../services/api';
import { ONBOARDING_QUESTIONS } from '../../utils/profileQuestions';

interface Props {
    onComplete: () => void;
}

export const ProfileSetup: React.FC<Props> = ({ onComplete }) => {
    const { language, updateProfile } = useApp();
    const isHebrew = language === 'hebrew';
    const [step, setStep] = useState(0);
    const [answers, setAnswers] = useState<Partial<UserProfile>>({});

    const currentQuestion = ONBOARDING_QUESTIONS[step];
    const isLastStep = step === ONBOARDING_QUESTIONS.length - 1;

    const finishSetup = (finalAnswers: Partial<UserProfile>) => {
        const firebaseUid = ApiService.getFirebaseUid();

        const newProfile: UserProfile = {
            userId: firebaseUid || `anonymous_${Date.now()}`,
            language,
            createdAt: Date.now(),
            ...finalAnswers,
        } as UserProfile;

        console.log('Creating profile with userId:', newProfile.userId);
        void updateProfile(newProfile);
        onComplete();
    };

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

    const [inputValue, setInputValue] = useState('');

    React.useEffect(() => {
        setInputValue('');
    }, [step]);

    return (
        <div dir={isHebrew ? 'rtl' : 'ltr'} className="bg-white font-display text-white antialiased overflow-hidden mesh-gradient h-[100dvh] w-full relative">
            <div className="relative flex h-[100dvh] w-full flex-col overflow-y-auto sm:max-w-md mx-auto sm:border-x sm:border-white/20 sm:shadow-2xl bg-white/5 backdrop-blur-3xl sm:backdrop-blur-sm sm:bg-white/10 p-6 pb-safe text-white">
                <div style={{ flex: 1, display: 'flex', flexDirection: 'column', justifyContent: 'center' }}>
                    <div style={{
                        marginBottom: '16px',
                        color: '#FFA500',
                        fontWeight: 600,
                        letterSpacing: '1px',
                        fontSize: '14px',
                    }}>
                        {isHebrew ? `שלב ${step + 1} מתוך ${ONBOARDING_QUESTIONS.length}` : `STEP ${step + 1} OF ${ONBOARDING_QUESTIONS.length}`}
                    </div>

                    <h2 style={{
                        marginBottom: '24px',
                        fontSize: '28px',
                        fontWeight: 700,
                        color: 'white',
                        lineHeight: 1.3,
                    }}>
                        {isHebrew ? currentQuestion.he : currentQuestion.en}
                    </h2>

                    <div style={{
                        background: 'rgba(255, 255, 255, 0.15)',
                        backdropFilter: 'blur(10px)',
                        border: '1px solid rgba(255, 255, 255, 0.3)',
                        borderRadius: '16px',
                        padding: '16px 20px',
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
                                width: '100%',
                            }}
                        />
                    </div>
                </div>

                <div style={{
                    display: 'flex',
                    gap: '12px',
                    paddingBottom: '32px',
                    paddingTop: '24px',
                }}>
                    <Button
                        variant="ghost"
                        onClick={handleSkip}
                        style={{
                            flex: 1,
                            background: 'rgba(255, 255, 255, 0.1)',
                            border: '1px solid rgba(255, 255, 255, 0.3)',
                            color: 'white',
                            borderRadius: '9999px',
                            padding: '14px 24px',
                        }}
                    >
                        {isHebrew ? 'דלג' : 'Skip'}
                    </Button>
                    <Button
                        variant="primary"
                        onClick={() => handleNext(inputValue)}
                        className="h-16 rounded-full glass-card text-white text-xl font-black tracking-tight glass-button-glow hover:scale-[1.02] transition-all duration-300 shadow-2xl flex items-center justify-center gap-2 border-none"
                    >
                        {isLastStep ? (isHebrew ? 'סיים' : 'Finish') : (isHebrew ? 'המשך' : 'Continue')}
                    </Button>
                </div>
            </div>
        </div>
    );
};
