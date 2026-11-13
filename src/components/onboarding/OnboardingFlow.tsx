import React, { useState, useCallback, useEffect } from 'react';
import { useApp } from '../../context/AppContext';
import { WelcomeScreen } from './WelcomeScreen';
import { AccountChoiceStep } from './AccountChoiceStep';
import { ProfileSetup } from './ProfileSetup';

interface OnboardingFlowProps {
  onComplete?: () => void;
}

export const OnboardingFlow: React.FC<OnboardingFlowProps> = ({ onComplete }) => {
  // -------------------------------------------------------------------------
  // 1. All useState Hooks (Strictly physical top - React 19 TDZ Prevention)
  // -------------------------------------------------------------------------
  const { language, setLanguage } = useApp();
  const [step, setStep] = useState<1 | 2 | 3>(1);

  const isHebrew = language === 'hebrew';

  // -------------------------------------------------------------------------
  // 2. All useCallback Hooks (Physically above any useEffect)
  // -------------------------------------------------------------------------
  const handleLanguageChange = useCallback(
    (newLang: 'hebrew' | 'english') => {
      try {
        localStorage.setItem('daily_app_lang_pref', newLang);
      } catch {
        // ignore localStorage errors
      }
      setLanguage(newLang);
    },
    [setLanguage]
  );

  const handleStepNext = useCallback(() => {
    setStep((prev) => (prev < 3 ? ((prev + 1) as 2 | 3) : 3));
  }, []);

  const handleStepBack = useCallback(() => {
    setStep((prev) => (prev > 1 ? ((prev - 1) as 1 | 2) : 1));
  }, []);

  const handleFlowComplete = useCallback(() => {
    if (onComplete) {
      onComplete();
    }
  }, [onComplete]);

  // -------------------------------------------------------------------------
  // 3. All useEffect Hooks (Physically below all state and callbacks)
  // -------------------------------------------------------------------------
  useEffect(() => {
    try {
      const savedLang = localStorage.getItem('daily_app_lang_pref');
      if (savedLang === 'english' || savedLang === 'hebrew') {
        if (language !== savedLang) {
          setLanguage(savedLang);
        }
      } else {
        const navLang = typeof navigator !== 'undefined' ? (navigator.language || '') : '';
        const detected: 'english' | 'hebrew' = navLang.toLowerCase().startsWith('en') ? 'english' : 'hebrew';
        if (language !== detected) {
          setLanguage(detected);
        }
      }
    } catch {
      // ignore
    }
  }, [language, setLanguage]);

  return (
    <div
      dir={isHebrew ? 'rtl' : 'ltr'}
      className="min-h-[100dvh] w-full max-w-md mx-auto bg-gradient-to-b from-[#FFFDF9] via-[#FAF5EE] to-[#F5EFFE] antialiased text-stone-900 transition-colors duration-500 overflow-x-hidden pt-8 pb-8 px-5 flex flex-col justify-between overflow-y-auto"
    >
      {/* Top Header: Navigation, Step Progress, & Language Toggle Pill */}
      <div className="flex items-center justify-between w-full mb-3 shrink-0">
        {step > 1 ? (
          <button
            type="button"
            onClick={handleStepBack}
            className="text-stone-600 hover:text-stone-900 text-sm font-semibold flex items-center gap-1.5 transition-colors py-1.5 px-3 rounded-full bg-white/80 border border-amber-200/70 shadow-xs hover:bg-amber-50 cursor-pointer"
          >
            <span className={isHebrew ? 'rotate-180' : ''}>←</span>
            <span>{isHebrew ? 'חזרה' : 'Back'}</span>
          </button>
        ) : (
          <div className="w-16" />
        )}

        {/* Step Counter Pill */}
        <div className="inline-flex items-center px-3 py-1 rounded-full bg-white/80 border border-amber-200/70 text-xs font-semibold text-stone-600 shadow-xs">
          <span>{isHebrew ? `שלב ${step} מתוך 3` : `Step ${step} of 3`}</span>
        </div>

        {/* Header Language Toggle Pill */}
        <div className="inline-flex items-center rounded-full bg-white/90 p-1 border border-amber-200/80 shadow-xs backdrop-blur-xs">
          <button
            type="button"
            onClick={() => handleLanguageChange('hebrew')}
            className={`px-2.5 py-0.5 rounded-full text-xs font-semibold transition-all cursor-pointer ${
              isHebrew
                ? 'bg-amber-500 text-white shadow-xs'
                : 'text-stone-600 hover:text-stone-900'
            }`}
          >
            עברית 🇮🇱
          </button>
          <button
            type="button"
            onClick={() => handleLanguageChange('english')}
            className={`px-2.5 py-0.5 rounded-full text-xs font-semibold transition-all cursor-pointer ${
              !isHebrew
                ? 'bg-amber-500 text-white shadow-xs'
                : 'text-stone-600 hover:text-stone-900'
            }`}
          >
            English 🇬🇧
          </button>
        </div>
      </div>

      {/* 3-Step Flow Content */}
      {step === 1 && (
        <WelcomeScreen onNext={handleStepNext} onLanguageChange={handleLanguageChange} />
      )}
      {step === 2 && (
        <AccountChoiceStep onNext={handleStepNext} />
      )}
      {step === 3 && (
        <ProfileSetup onComplete={handleFlowComplete} onBack={handleStepBack} />
      )}
    </div>
  );
};
