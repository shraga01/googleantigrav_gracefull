import React, { useCallback } from 'react';
import { useApp } from '../../context/AppContext';

interface WelcomeScreenProps {
  onNext: () => void;
  onLanguageChange?: (lang: 'hebrew' | 'english') => void;
}

export const WelcomeScreen: React.FC<WelcomeScreenProps> = ({ onNext, onLanguageChange }) => {
  // -------------------------------------------------------------------------
  // 1. App Context & State
  // -------------------------------------------------------------------------
  const { language, setLanguage } = useApp();
  const isHebrew = language === 'hebrew';

  // -------------------------------------------------------------------------
  // 2. All useCallback Hooks (React 19 TDZ Prevention)
  // -------------------------------------------------------------------------
  const handleLanguageSelect = useCallback(
    (lang: 'hebrew' | 'english') => {
      try {
        localStorage.setItem('daily_app_lang_pref', lang);
      } catch {
        // ignore localStorage errors
      }
      if (onLanguageChange) {
        onLanguageChange(lang);
      } else {
        setLanguage(lang);
      }
    },
    [onLanguageChange, setLanguage]
  );

  return (
    <div className="flex flex-col flex-1 justify-between w-full">
      <div className="flex flex-col items-center w-full">
        {/* Hero Emblem: Sun & Heart-Sprout SVG */}
        <div className="w-20 h-20 rounded-3xl bg-gradient-to-br from-amber-400 to-orange-500 shadow-glow-amber flex items-center justify-center mx-auto mb-5 transition-transform hover:scale-105 duration-300">
          <svg
            className="w-11 h-11 text-white drop-shadow-sm"
            viewBox="0 0 48 48"
            fill="none"
            xmlns="http://www.w3.org/2000/svg"
            aria-hidden="true"
          >
            {/* Sun Rays */}
            <path
              d="M24 3v4m0 34v4M3 24h4m34 0h4M9.15 9.15l2.83 2.83m24.04 24.04 2.83 2.83M9.15 38.85l2.83-2.83m24.04-24.04 2.83-2.83"
              stroke="white"
              strokeWidth="2.2"
              strokeLinecap="round"
              opacity="0.85"
            />
            {/* Sun Disc Atmosphere */}
            <circle
              cx="24"
              cy="24"
              r="10.5"
              fill="white"
              fillOpacity="0.22"
              stroke="white"
              strokeWidth="1.8"
            />
            {/* Sprout Stem */}
            <path
              d="M24 34c0-5.5-2.5-9-5.5-10m5.5 10c0-6 3.5-9 7.5-10.5"
              stroke="white"
              strokeWidth="2.4"
              strokeLinecap="round"
            />
            {/* Heart-Sprout Left Leaf */}
            <path
              d="M18.5 24c-2.4-2.8-1.5-6 1.3-6 2.4 0 4.2 2.8 4.2 6-1.5 0-3.8-.4-5.5 0z"
              fill="white"
              fillOpacity="0.95"
            />
            {/* Heart-Sprout Right Leaf */}
            <path
              d="M29.5 23.5c2.4-2.8 1.5-6-1.3-6-2.4 0-4.2 2.8-4.2 6 1.5 0 3.8-.4 5.5 0z"
              fill="white"
              fillOpacity="0.95"
            />
            {/* Heart Center Apex */}
            <path
              d="M24 18c-.8-1.5-2.2-1.5-2.8-.7-.7.9-.3 2.3 1.4 3.4.9.6 1.4 1.1 1.4 1.1s.5-.5 1.4-1.1c1.7-1.1 2.1-2.5 1.4-3.4-.6-.8-2-.8-2.8.7z"
              fill="white"
            />
          </svg>
        </div>

        {/* Title */}
        <h1 className="text-3xl font-extrabold text-stone-900 text-center tracking-tight">
          {isHebrew ? 'הכרת תודה יומית' : 'Daily Appreciation'}
        </h1>

        {/* Subtitle */}
        <p className="text-amber-800 font-medium text-base text-center mt-2 px-2 leading-relaxed">
          {isHebrew
            ? 'עוצרים, נושמים ומעריכים — 3 דקות בערב לשינוי מוכח בחוסן הנפשי'
            : 'Pause, breathe and appreciate — 3 minutes in the evening for proven mental resilience'}
        </p>

        {/* Prominent Language Choice Card */}
        <div className="bg-white rounded-3xl p-4 shadow-soft-card border border-amber-100/90 my-3.5 w-full">
          <div className="flex items-center justify-between mb-2.5 px-1">
            <span className="text-xs font-bold text-stone-500 uppercase tracking-wider">
              {isHebrew ? 'שפת הממשק' : 'Language'}
            </span>
            <span className="text-xs text-amber-700 font-semibold">
              {isHebrew ? '🇮🇱 עברית נבחרה' : '🇬🇧 English Selected'}
            </span>
          </div>
          <div className="grid grid-cols-2 gap-2.5 w-full">
            <button
              type="button"
              onClick={() => handleLanguageSelect('hebrew')}
              className={`py-3 px-3 rounded-2xl font-bold text-sm transition-all flex items-center justify-center gap-2 cursor-pointer ${
                isHebrew
                  ? 'bg-gradient-to-r from-amber-500 to-orange-500 text-white shadow-md ring-2 ring-amber-300'
                  : 'bg-[#FBF9F5] hover:bg-amber-50 text-stone-700 border border-amber-200/70'
              }`}
            >
              <span className="text-base">🇮🇱</span>
              <span>עברית</span>
              {isHebrew && <span className="text-xs font-black">✓</span>}
            </button>
            <button
              type="button"
              onClick={() => handleLanguageSelect('english')}
              className={`py-3 px-3 rounded-2xl font-bold text-sm transition-all flex items-center justify-center gap-2 cursor-pointer ${
                !isHebrew
                  ? 'bg-gradient-to-r from-amber-500 to-orange-500 text-white shadow-md ring-2 ring-amber-300'
                  : 'bg-[#FBF9F5] hover:bg-amber-50 text-stone-700 border border-amber-200/70'
              }`}
            >
              <span className="text-base">🇬🇧</span>
              <span>English</span>
              {!isHebrew && <span className="text-xs font-black">✓</span>}
            </button>
          </div>
        </div>

        {/* Scientific Card: bg-white rounded-3xl p-5 shadow-soft-card border border-amber-100/90 mb-3 w-full */}
        <div className="bg-white rounded-3xl p-5 shadow-soft-card border border-amber-100/90 mb-3 w-full">
          <div className="flex items-center gap-2 mb-2 text-amber-700 text-xs font-bold">
            <svg
              className="w-4 h-4 text-amber-500 shrink-0"
              viewBox="0 0 24 24"
              fill="none"
              stroke="currentColor"
              strokeWidth="2"
              strokeLinecap="round"
              strokeLinejoin="round"
            >
              <path d="M12 2v4M12 18v4M4.93 4.93l2.83 2.83M16.24 16.24l2.83 2.83M2 12h4M18 12h4M4.93 19.07l2.83-2.83M16.24 7.76l2.83-2.83" />
            </svg>
            <span>{isHebrew ? 'ביסוס מדעי קליני' : 'Clinically Validated Science'}</span>
          </div>
          <p className="text-stone-700 text-sm leading-relaxed text-start">
            {isHebrew
              ? 'מחקרים קליניים (פרופ\' מרטין זליגמן) והדמיות מוחיות מוכיחים כי תיעוד יומי של שלושה רגעים טובים והחלק שלנו בהם מחווט מחדש את המוח לאופטימיות, מפחית מתח לפני השינה ומחזק את החוסן הנפשי לאורך זמן.'
              : 'Clinical studies (Prof. Martin Seligman) and neuroimaging show that daily recording of three good things and our role in them rewires the brain for optimism, reduces pre-sleep stress, and strengthens mental resilience over time.'}
          </p>
        </div>

        {/* 3 Feature Pills */}
        <div className="w-full flex flex-col gap-2.5 my-1">
          {/* Feature 1 */}
          <div className="bg-white/90 backdrop-blur-xs rounded-2xl p-3.5 border border-amber-100/80 shadow-xs flex items-center gap-3.5 text-start">
            <div className="w-10 h-10 rounded-xl bg-amber-50 border border-amber-200/60 flex items-center justify-center shrink-0 text-amber-600">
              <svg
                className="w-5 h-5 text-amber-600"
                viewBox="0 0 24 24"
                fill="none"
                stroke="currentColor"
                strokeWidth="2"
                strokeLinecap="round"
                strokeLinejoin="round"
              >
                <circle cx="12" cy="12" r="9" />
                <polyline points="12 6 12 12 16 14" />
              </svg>
            </div>
            <div className="flex-1 min-w-0">
              <div className="font-bold text-stone-900 text-sm">
                {isHebrew ? 'פשוט וממוקד — 3 רגעים ביום' : 'Simple & Focused — 3 moments a day'}
              </div>
              <div className="text-stone-600 text-xs mt-0.5 leading-snug">
                {isHebrew
                  ? 'תהליך מונחה וקצר שמותאם לשגרת הערב שלך'
                  : 'A short guided process tailored for your evening routine'}
              </div>
            </div>
          </div>

          {/* Feature 2 */}
          <div className="bg-white/90 backdrop-blur-xs rounded-2xl p-3.5 border border-amber-100/80 shadow-xs flex items-center gap-3.5 text-start">
            <div className="w-10 h-10 rounded-xl bg-amber-50 border border-amber-200/60 flex items-center justify-center shrink-0 text-amber-600">
              <svg
                className="w-5 h-5 text-amber-600"
                viewBox="0 0 24 24"
                fill="none"
                stroke="currentColor"
                strokeWidth="2"
                strokeLinecap="round"
                strokeLinejoin="round"
              >
                <path d="M12 2a5 5 0 0 0-5 5c0 1.5.7 2.8 1.8 3.7A6 6 0 0 0 5 16a5 5 0 0 0 5 5v1h4v-1a5 5 0 0 0 5-5 6 6 0 0 0-3.8-5.3A5 5 0 0 0 17 7a5 5 0 0 0-5-5z" />
                <path d="M12 8v4" />
                <path d="M9.5 14h5" />
              </svg>
            </div>
            <div className="flex-1 min-w-0">
              <div className="font-bold text-stone-900 text-sm">
                {isHebrew ? 'מדד הטמעה מוחית ומעקב התקדמות' : 'Neural Encoding Score & Progress Tracking'}
              </div>
              <div className="text-stone-600 text-xs mt-0.5 leading-snug">
                {isHebrew
                  ? 'משוב חכם שמעמיק את ההשפעה החיובית על הזיכרון'
                  : 'Smart feedback deepening positive memory consolidation'}
              </div>
            </div>
          </div>

          {/* Feature 3 */}
          <div className="bg-white/90 backdrop-blur-xs rounded-2xl p-3.5 border border-amber-100/80 shadow-xs flex items-center gap-3.5 text-start">
            <div className="w-10 h-10 rounded-xl bg-amber-50 border border-amber-200/60 flex items-center justify-center shrink-0 text-amber-600">
              <svg
                className="w-5 h-5 text-amber-600"
                viewBox="0 0 24 24"
                fill="none"
                stroke="currentColor"
                strokeWidth="2"
                strokeLinecap="round"
                strokeLinejoin="round"
              >
                <path d="M12 22s8-4 8-10V5l-8-3-8 3v7c0 6 8 10 8 10z" />
                <circle cx="12" cy="11" r="1.5" />
                <path d="M12 12.5V15" />
              </svg>
            </div>
            <div className="flex-1 min-w-0">
              <div className="font-bold text-stone-900 text-sm">
                {isHebrew ? 'פרטי, אישי ובטוח על המכשיר שלך' : 'Private, Personal & Safe on Your Device'}
              </div>
              <div className="text-stone-600 text-xs mt-0.5 leading-snug">
                {isHebrew
                  ? 'היומן שלך נשמר באופן פרטי ומאובטח במכשיר'
                  : 'Your journal stays strictly private and secure on your device'}
              </div>
            </div>
          </div>
        </div>
      </div>

      {/* Primary CTA: 'בואו נתחיל ›' */}
      <div className="w-full pt-4">
        <button
          type="button"
          onClick={onNext}
          className="w-full py-4 rounded-2xl bg-gradient-to-r from-amber-500 to-orange-500 hover:from-amber-600 hover:to-orange-600 active:scale-[0.99] text-white text-lg font-bold shadow-soft-card flex items-center justify-center gap-2 transition-all cursor-pointer"
        >
          <span>{isHebrew ? 'בואו נתחיל ›' : 'Let’s Begin ›'}</span>
        </button>
      </div>
    </div>
  );
};
