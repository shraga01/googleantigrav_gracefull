import React, { useState, useCallback } from 'react';
import { useApp } from '../../context/AppContext';
import { ApiService } from '../../services/api';
import type { UserProfile, DosingSchedule } from '../../types';

interface ProfileSetupProps {
  onComplete: () => void;
  onBack?: () => void;
}

export const ProfileSetup: React.FC<ProfileSetupProps> = ({ onComplete }) => {
  // -------------------------------------------------------------------------
  // 1. All useState Hooks (Strictly physical top - React 19 TDZ Prevention)
  // -------------------------------------------------------------------------
  const { language, updateProfile } = useApp();
  const isHebrew = language === 'hebrew';

  const [name, setName] = useState('');
  const [addressingStyle, setAddressingStyle] = useState<'female' | 'male' | 'neutral' | null>(null);
  const [isSubmitting, setIsSubmitting] = useState(false);

  // -------------------------------------------------------------------------
  // 2. All useCallback Hooks (Physically above any useEffect)
  // -------------------------------------------------------------------------
  const buildDosingSchedule = useCallback((): DosingSchedule => {
    return {
      phase: 'onboarding_daily_21',
      startDate: new Date().toISOString(),
      currentDay: 1,
      targetWeeklyFrequency: 7,
      weeklyCompletedCount: 0,
      lastPracticeDate: null,
    };
  }, []);

  const handleSaveAndStart = useCallback(async () => {
    if (isSubmitting) return;
    setIsSubmitting(true);
    try {
      const firebaseUid = ApiService.getFirebaseUid();
      const newProfile: UserProfile = {
        userId: firebaseUid || `user_${Date.now()}`,
        ...(name.trim() ? { name: name.trim() } : {}),
        ...(addressingStyle ? { gender: addressingStyle } : {}),
        language,
        locale: isHebrew ? 'he' : 'en',
        dosingSchedule: buildDosingSchedule(),
        unlockedBadges: [],
        createdAt: Date.now(),
      };

      await updateProfile(newProfile);
      onComplete();
    } catch (err) {
      console.error('Failed to save profile:', err);
    } finally {
      setIsSubmitting(false);
    }
  }, [isSubmitting, name, addressingStyle, language, isHebrew, buildDosingSchedule, updateProfile, onComplete]);

  const handleContinueAsGuest = useCallback(async () => {
    if (isSubmitting) return;
    setIsSubmitting(true);
    try {
      const firebaseUid = ApiService.getFirebaseUid();
      const guestProfile: UserProfile = {
        userId: firebaseUid || `guest_${Date.now()}`,
        language,
        locale: isHebrew ? 'he' : 'en',
        dosingSchedule: buildDosingSchedule(),
        unlockedBadges: [],
        createdAt: Date.now(),
      };

      await updateProfile(guestProfile);
      onComplete();
    } catch (err) {
      console.error('Failed to create guest profile:', err);
    } finally {
      setIsSubmitting(false);
    }
  }, [isSubmitting, language, isHebrew, buildDosingSchedule, updateProfile, onComplete]);

  const addressingOptions: { key: 'female' | 'male' | 'neutral'; label: string }[] = isHebrew
    ? [
        { key: 'female', label: 'נקבה' },
        { key: 'male', label: 'זכר' },
        { key: 'neutral', label: 'ללא העדפה' },
      ]
    : [
        { key: 'female', label: 'Female' },
        { key: 'male', label: 'Male' },
        { key: 'neutral', label: 'No preference' },
      ];

  return (
    <div className="flex flex-col flex-1 justify-center w-full my-auto">
      {/* Unified Personalization Card: bg-white rounded-3xl p-6 shadow-soft-card border border-amber-100 */}
      <div className="bg-white rounded-3xl p-6 shadow-soft-card border border-amber-100 w-full">
        {/* Badge: 'התאמה אישית קצרה' */}
        <div className="inline-flex items-center gap-1.5 px-3 py-1 rounded-full text-xs font-semibold bg-amber-50 text-amber-800 border border-amber-200/80 mb-4">
          <span>✨</span>
          <span>{isHebrew ? 'התאמה אישית קצרה' : 'Quick Personalization'}</span>
        </div>

        {/* Heading: 'איך תרצה/י שנפנה אליך?' */}
        <h2 className="text-2xl font-extrabold text-stone-900 mb-6 text-start leading-snug tracking-tight">
          {isHebrew ? 'איך תרצה/י שנפנה אליך?' : 'How would you like us to address you?'}
        </h2>

        {/* Name input */}
        <div className="mb-5">
          <label htmlFor="user-name" className="text-sm font-semibold text-stone-700 mb-2 block text-start">
            {isHebrew ? 'שם פרטי (אופציונלי)' : 'First Name (Optional)'}
          </label>
          <input
            id="user-name"
            type="text"
            value={name}
            onChange={(e) => setName(e.target.value)}
            placeholder={isHebrew ? 'השם הפרטי שלך (או כינוי)...' : 'Your first name (or nickname)...'}
            className="w-full px-4 py-3.5 rounded-2xl bg-[#FBF9F5] border border-amber-200/80 text-stone-900 placeholder-stone-400 focus:outline-none focus:ring-2 focus:ring-amber-400 focus:bg-white transition-all text-base text-start"
            autoComplete="given-name"
          />
        </div>

        {/* Addressing style pills */}
        <div className="mb-6">
          <span className="text-sm font-semibold text-stone-700 mb-2.5 block text-start">
            {isHebrew ? 'לשון פנייה מועדפת (אופציונלי):' : 'Preferred addressing style (optional):'}
          </span>
          <div className="grid grid-cols-3 gap-2.5 w-full">
            {addressingOptions.map((opt) => {
              const isSelected = addressingStyle === opt.key;
              return (
                <button
                  key={opt.key}
                  type="button"
                  onClick={() => setAddressingStyle(isSelected ? null : opt.key)}
                  className={`py-2.5 px-2 rounded-xl text-sm font-medium border transition-all text-center cursor-pointer ${
                    isSelected
                      ? 'bg-amber-500 text-white border-amber-500 shadow-xs font-semibold'
                      : 'bg-[#FBF9F5] text-stone-700 border-amber-200/70 hover:bg-amber-50'
                  }`}
                >
                  {opt.label}
                </button>
              );
            })}
          </div>
        </div>

        {/* Primary button: 'התחל לתרגל הכרת תודה ✨' */}
        <button
          type="button"
          onClick={handleSaveAndStart}
          disabled={isSubmitting}
          className="w-full py-4 rounded-2xl bg-gradient-to-r from-amber-500 to-orange-500 hover:from-amber-600 hover:to-orange-600 active:scale-[0.99] disabled:opacity-50 text-white text-base font-bold shadow-soft-card flex items-center justify-center gap-2 transition-all cursor-pointer"
        >
          <span>{isHebrew ? 'התחל לתרגל הכרת תודה ✨' : 'Start Practicing Gratitude ✨'}</span>
        </button>

        {/* Secondary link: 'המשך כאורח/ת ללא שם' */}
        <button
          type="button"
          onClick={handleContinueAsGuest}
          disabled={isSubmitting}
          className="w-full text-center mt-4 text-sm font-medium text-stone-500 hover:text-stone-800 underline underline-offset-4 cursor-pointer transition-colors block"
        >
          {isHebrew ? 'המשך כאורח/ת ללא שם' : 'Continue as guest without a name'}
        </button>
      </div>
    </div>
  );
};
