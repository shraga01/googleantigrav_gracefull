import React, { useState, useCallback } from 'react';
import { useApp } from '../../context/AppContext';
import { signInWithGoogle, getUserGoogleId } from '../../services/auth';

interface AccountChoiceStepProps {
  onNext: () => void;
}

export const AccountChoiceStep: React.FC<AccountChoiceStepProps> = ({ onNext }) => {
  // -------------------------------------------------------------------------
  // 1. All useState Hooks (Strictly physical top - React 19 TDZ Prevention)
  // -------------------------------------------------------------------------
  const { language, setGoogleId } = useApp();
  const [isLoading, setIsLoading] = useState(false);
  const [inlineNotice, setInlineNotice] = useState<string | null>(null);

  const isHebrew = language === 'hebrew';

  // -------------------------------------------------------------------------
  // 2. All useCallback Hooks (Physically above any useEffect)
  // -------------------------------------------------------------------------
  const handleGoogleSignIn = useCallback(async () => {
    setIsLoading(true);
    setInlineNotice(null);
    try {
      await signInWithGoogle();
      const googleId = getUserGoogleId();
      if (googleId) {
        setGoogleId(googleId);
      }
      onNext();
    } catch (error) {
      const err = error as Error;
      // On native APK or popup error, show styled inline notice inside card with button to continue to Step 3
      const fallbackMsg = isHebrew
        ? 'האפליקציה פועלת במצב מקומי ומאובטח במכשירך. כל הנתונים נשמרים בטלפון וניתנים לגיבוי ושחזור מקובץ בתפריט ההגדרות.'
        : 'The app is running in secure local mode on your device. Your data is stored on this phone and can be backed up and restored via Settings.';

      setInlineNotice(err.message || fallbackMsg);
    } finally {
      setIsLoading(false);
    }
  }, [isHebrew, setGoogleId, onNext]);

  return (
    <div className="flex flex-col flex-1 justify-center w-full my-auto">
      {/* Warm Stitch Card */}
      <div className="bg-white rounded-3xl p-6 shadow-soft-card border border-amber-100/90 w-full text-center">
        {/* Shield / Cloud Emblem */}
        <div className="w-16 h-16 rounded-2xl bg-gradient-to-br from-amber-400 to-orange-500 shadow-glow-amber flex items-center justify-center mx-auto mb-4 text-white">
          <svg
            className="w-9 h-9"
            viewBox="0 0 24 24"
            fill="none"
            stroke="currentColor"
            strokeWidth="2"
            strokeLinecap="round"
            strokeLinejoin="round"
            aria-hidden="true"
          >
            {/* Shield with Cloud */}
            <path d="M12 22s8-4 8-10V5l-8-3-8 3v7c0 6 8 10 8 10z" />
            <path d="M9 12a3 3 0 0 1 5.8-1 2.5 2.5 0 0 1 1.2 4.5H8.5A2.5 2.5 0 0 1 9 12z" />
          </svg>
        </div>

        {/* Security Badge */}
        <div className="inline-flex items-center gap-1.5 px-3 py-1 rounded-full text-xs font-semibold bg-amber-50 text-amber-800 border border-amber-200/80 mb-3">
          <span>🛡️</span>
          <span>{isHebrew ? 'פרטיות ואבטחה מלאה' : 'Complete Privacy & Security'}</span>
        </div>

        {/* Title */}
        <h2 className="text-2xl font-extrabold text-stone-900 mb-2 tracking-tight">
          {isHebrew ? 'שמירה וגיבוי היומן האישי' : 'Journal Security & Backup'}
        </h2>

        {/* Subtitle explaining Google Cloud vs. Private Device */}
        <p className="text-stone-600 text-sm leading-relaxed mb-6 px-1 text-center">
          {isHebrew
            ? 'היומן שלך מוגן ואישי. בחר/י כיצד לשמור את הרגעים היקרים שלך — בסנכרון ענן מאובטח עם Google, או בשמירה פרטית במכשיר בלבד.'
            : 'Your journal is strictly private. Choose how to protect your moments — with secure Google Cloud sync, or stored privately on this device only.'}
        </p>

        {/* Options Overview Box */}
        <div className="bg-[#FAF7F2] rounded-2xl p-4 border border-amber-200/70 mb-5 text-start space-y-3">
          <div className="flex items-start gap-2.5">
            <span className="text-base shrink-0">☁️</span>
            <div className="text-xs text-stone-700 leading-snug">
              <span className="font-bold text-stone-900 block mb-0.5">
                {isHebrew ? 'גיבוי ענן מאובטח (Google)' : 'Secure Cloud Backup (Google)'}
              </span>
              {isHebrew
                ? 'שמירה אוטומטית בענן, סנכרון רציף ושחזור פשוט בעת החלפת מכשיר.'
                : 'Automatic cloud backup, seamless sync, and easy restore when switching phones.'}
            </div>
          </div>
          <div className="border-t border-amber-200/60 pt-2.5 flex items-start gap-2.5">
            <span className="text-base shrink-0">📱</span>
            <div className="text-xs text-stone-700 leading-snug">
              <span className="font-bold text-stone-900 block mb-0.5">
                {isHebrew ? 'שמירה פרטית במכשיר בלבד' : 'Private On-Device Only'}
              </span>
              {isHebrew
                ? 'הנתונים נשמרים רק בטלפון שלך. ניתן לייצא קובץ גיבוי ידני בכל עת.'
                : 'Data stays exclusively on your phone. You can export a manual backup file anytime.'}
            </div>
          </div>
        </div>

        {/* Styled inline notice if error or native platform */}
        {inlineNotice && (
          <div
            role="status"
            className="mb-5 p-4 rounded-2xl bg-amber-50/95 border border-amber-300 text-stone-800 text-xs text-start shadow-xs animate-fadeIn"
          >
            <div className="flex items-center gap-2 font-bold text-amber-900 mb-1.5">
              <span>ℹ️</span>
              <span>{isHebrew ? 'הודעת מערכת' : 'System Notice'}</span>
            </div>
            <p className="leading-relaxed mb-3 text-stone-700">{inlineNotice}</p>
            <button
              type="button"
              onClick={onNext}
              className="w-full py-2.5 px-4 rounded-xl bg-gradient-to-r from-amber-500 to-orange-500 text-white font-bold text-xs shadow-xs hover:from-amber-600 hover:to-orange-600 transition-all cursor-pointer flex items-center justify-center gap-1.5"
            >
              <span>{isHebrew ? 'המשך להגדרת פרופיל במצב מקומי ›' : 'Continue to Profile Setup in Local Mode ›'}</span>
            </button>
          </div>
        )}

        {/* Option A: Google Sign-in button */}
        <button
          type="button"
          onClick={handleGoogleSignIn}
          disabled={isLoading}
          className="w-full py-4 px-4 rounded-2xl bg-white hover:bg-stone-50 active:scale-[0.99] border-2 border-amber-200 text-stone-800 font-bold text-base shadow-xs flex items-center justify-center gap-3 transition-all cursor-pointer disabled:opacity-60 mb-3"
        >
          {isLoading ? (
            <div className="w-5 h-5 border-2 border-amber-500 border-t-transparent rounded-full animate-spin" />
          ) : (
            <>
              {/* Google G icon */}
              <svg width="20" height="20" viewBox="0 0 24 24" aria-hidden="true">
                <path
                  fill="#4285F4"
                  d="M22.56 12.25c0-.78-.07-1.53-.2-2.25H12v4.26h5.92c-.26 1.37-1.04 2.53-2.21 3.31v2.77h3.57c2.08-1.92 3.28-4.74 3.28-8.09z"
                />
                <path
                  fill="#34A853"
                  d="M12 23c2.97 0 5.46-.98 7.28-2.66l-3.57-2.77c-.98.66-2.23 1.06-3.71 1.06-2.86 0-5.29-1.93-6.16-4.53H2.18v2.84C3.99 20.53 7.7 23 12 23z"
                />
                <path
                  fill="#FBBC05"
                  d="M5.84 14.09c-.22-.66-.35-1.36-.35-2.09s.13-1.43.35-2.09V7.07H2.18C1.43 8.55 1 10.22 1 12s.43 3.45 1.18 4.93l2.85-2.22.81-.62z"
                />
                <path
                  fill="#EA4335"
                  d="M12 5.38c1.62 0 3.06.56 4.21 1.64l3.15-3.15C17.45 2.09 14.97 1 12 1 7.7 1 3.99 3.47 2.18 7.07l3.66 2.84c.87-2.6 3.3-4.53 6.16-4.53z"
                />
              </svg>
              <span>{isHebrew ? 'התחברות עם Google' : 'Sign in with Google'}</span>
            </>
          )}
        </button>

        {/* Divider */}
        <div className="flex items-center gap-3 my-3">
          <div className="flex-1 h-px bg-amber-200/70" />
          <span className="text-xs font-semibold text-stone-400 uppercase">
            {isHebrew ? 'או' : 'or'}
          </span>
          <div className="flex-1 h-px bg-amber-200/70" />
        </div>

        {/* Option B: Continue privately on device */}
        <button
          type="button"
          onClick={onNext}
          className="w-full py-3.5 px-4 rounded-2xl bg-amber-50/70 hover:bg-amber-100/90 active:scale-[0.99] text-stone-800 font-bold text-sm border border-amber-200/80 transition-all shadow-xs flex items-center justify-center gap-1.5 cursor-pointer"
        >
          <span>{isHebrew ? 'המשך באופן פרטי על המכשיר ›' : 'Continue Privately on Device ›'}</span>
        </button>

        {/* Trust badge footer */}
        <p className="mt-4 text-[11px] text-stone-500 text-center leading-normal">
          {isHebrew
            ? '🔒 ללא פרסומות, ללא מעקב מסחרי — היומן שייך אך ורק לך.'
            : '🔒 Zero ads, zero commercial tracking — your journal belongs only to you.'}
        </p>
      </div>
    </div>
  );
};
