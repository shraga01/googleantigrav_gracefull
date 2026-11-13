import React, { useState, useEffect, useCallback, Suspense, lazy } from 'react';
import { AppProvider, useApp } from './context/AppContext';
import { OnboardingFlow } from './components/onboarding/OnboardingFlow';
import { DailyPractice } from './components/daily/DailyPractice';
import { LoadingSpinner } from './components/common/LoadingSpinner';
import { AppHeader } from './components/layout/AppHeader';
import { BottomNav } from './components/layout/BottomNav';
import { ErrorBoundary } from './components/common/ErrorBoundary';
import { BadgeUnlockOverlay } from './components/common/BadgeUnlockOverlay';
import { ReminderEngine } from './services/reminderEngine';
import { getDictionary } from './locales';
import type { Locale } from './types';

// Code-split heavy tab views
const HistoryView = lazy(() =>
  import('./components/history/HistoryView').then((m) => ({ default: m.HistoryView }))
);
const StatsDashboard = lazy(() =>
  import('./components/stats/StatsDashboard').then((m) => ({ default: m.StatsDashboard }))
);
const SettingsMenu = lazy(() =>
  import('./components/settings/SettingsMenu').then((m) => ({ default: m.SettingsMenu }))
);

const AppContent: React.FC = () => {
  // -------------------------------------------------------------------------
  // 1. All useState Declarations (Strictly physical top - TDZ Prevention)
  // -------------------------------------------------------------------------
  const { userProfile, isLoading, isAuthenticated, logout, refreshProfile, fetchProfileFromServer } = useApp();
  const [currentTab, setCurrentTab] = useState<'daily' | 'history' | 'stats' | 'settings'>('daily');
  const [hasCheckedServerProfile, setHasCheckedServerProfile] = useState(false);
  const [isEveningRitualMode] = useState<boolean>(() => {
    if (typeof window === 'undefined') return false;
    return new URLSearchParams(window.location.search).get('mode') === 'evening_ritual';
  });

  // -------------------------------------------------------------------------
  // 2. All useCallback Declarations (Physically above useEffect)
  // -------------------------------------------------------------------------
  const handleLogout = useCallback(async () => {
    try {
      await logout();
      setHasCheckedServerProfile(false);
    } catch (error) {
      console.error('Logout failed:', error);
    }
  }, [logout]);

  const handleBack = useCallback(() => {
    if (currentTab !== 'daily') {
      setCurrentTab('daily');
    } else if (typeof window !== 'undefined') {
      window.scrollTo({ top: 0, behavior: 'smooth' });
    }
  }, [currentTab]);

  const handleOnboardingComplete = useCallback(() => {
    refreshProfile();
  }, [refreshProfile]);

  // -------------------------------------------------------------------------
  // 3. All useEffect Declarations (Strictly physical bottom)
  // -------------------------------------------------------------------------
  useEffect(() => {
    const checkServerProfile = async () => {
      if (isAuthenticated && !userProfile && !hasCheckedServerProfile && !isLoading) {
        console.log('User authenticated but no local profile, checking server...');
        setHasCheckedServerProfile(true);
        const serverProfile = await fetchProfileFromServer();
        if (serverProfile) {
          console.log('Found profile on server, skipping onboarding');
        } else {
          console.log('No profile on server, user needs to complete profile setup');
        }
      }
    };
    void checkServerProfile();
  }, [isAuthenticated, userProfile, hasCheckedServerProfile, isLoading, fetchProfileFromServer]);

  if (isLoading) {
    return <LoadingSpinner />;
  }

  // If we have a profile, show the Stitch Warm Cream & Amber main app
  if (userProfile) {
    const locale: Locale = userProfile.locale || (userProfile.language === 'hebrew' ? 'he' : 'en');
    const isHebrew = locale === 'he';
    const isSunset = ReminderEngine.isDigitalSunsetActive(userProfile);
    const t = getDictionary(locale);

    const getHeaderMeta = () => {
      if (isEveningRitualMode && currentTab === 'daily') {
        return {
          title: isHebrew ? 'טקס ערב 🌙' : 'Evening Ritual 🌙',
          subtitle: t.common.tagline,
        };
      }
      switch (currentTab) {
        case 'daily':
          return {
            title: t.common.appName,
            subtitle: t.common.tagline,
          };
        case 'history':
          return {
            title: t.nav.journal,
            subtitle: isHebrew ? 'הרגעים הטובים שנשמרו לאורך הדרך' : 'Saved moments along your journey',
          };
        case 'stats':
          return {
            title: t.nav.stats,
            subtitle: isHebrew ? 'מעקב הרגלים וחוסן נפשי' : 'Habit streaks & wellbeing progress',
          };
        case 'settings':
          return {
            title: t.nav.settings,
            subtitle: isHebrew ? 'התאמה אישית ותזכורות ערב' : 'Preferences & evening reminders',
          };
        default:
          return {
            title: t.common.appName,
            subtitle: t.common.tagline,
          };
      }
    };

    const headerMeta = getHeaderMeta();

    return (
      <div
        dir={isHebrew ? 'rtl' : 'ltr'}
        className={`font-sans text-stone-900 antialiased min-h-[100dvh] w-full relative transition-colors duration-700 overflow-x-hidden ${
          isSunset
            ? 'bg-[#FAF4ED]'
            : 'bg-gradient-to-b from-[#FFFDF9] via-[#FAF5EE] to-[#F5EFFE]'
        }`}
      >
        <div
          className="relative flex min-h-[100dvh] w-full max-w-full sm:max-w-[440px] mx-auto flex-col sm:border-x sm:border-amber-100/80 sm:shadow-2xl bg-white/40 overflow-x-hidden box-border"
          style={{
            paddingTop: 'env(safe-area-inset-top)',
            paddingBottom: 'env(safe-area-inset-bottom)',
          }}
        >
          <AppHeader
            onLogout={handleLogout}
            onBack={handleBack}
            title={headerMeta.title}
            subtitle={headerMeta.subtitle}
          />

          {/* Main Content with Suspense Code-Splitting & pb-28 clearance for BottomNav */}
          <main className="flex-1 w-full max-w-full relative overflow-y-auto overflow-x-hidden px-4 sm:px-5 pt-1 pb-28 flex flex-col min-w-0 box-border">
            <Suspense fallback={<LoadingSpinner />}>
              {currentTab === 'daily' && <DailyPractice />}
              {currentTab === 'history' && <HistoryView />}
              {currentTab === 'stats' && <StatsDashboard />}
              {currentTab === 'settings' && <SettingsMenu />}
            </Suspense>
          </main>

          {/* Sticky/Fixed 4-Tab Bottom Navigation */}
          <BottomNav currentTab={currentTab} setCurrentTab={setCurrentTab} />

          {/* Global Badge Unlock Animation Overlay */}
          <BadgeUnlockOverlay />
        </div>
      </div>
    );
  }

  return <OnboardingFlow onComplete={handleOnboardingComplete} />;
};

const App: React.FC = () => {
  return (
    <ErrorBoundary>
      <AppProvider>
        <AppContent />
      </AppProvider>
    </ErrorBoundary>
  );
};

export default App;
