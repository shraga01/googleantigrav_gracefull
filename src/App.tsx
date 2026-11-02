import React, { useState, useEffect, useCallback, Suspense, lazy } from 'react';
import { AppProvider, useApp } from './context/AppContext';
import { LanguageSelection } from './components/onboarding/LanguageSelection';
import { AuthChoice } from './components/onboarding/AuthChoice';
import { WelcomeScreen } from './components/onboarding/WelcomeScreen';
import { ProfileSetup } from './components/onboarding/ProfileSetup';
import { DailyPractice } from './components/daily/DailyPractice';
import { LoadingSpinner } from './components/common/LoadingSpinner';
import { AppHeader } from './components/layout/AppHeader';
import { BottomNav } from './components/layout/BottomNav';
import { ErrorBoundary } from './components/common/ErrorBoundary';
import { BadgeUnlockOverlay } from './components/common/BadgeUnlockOverlay';

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
  const [onboardingStep, setOnboardingStep] = useState<'language' | 'auth' | 'welcome' | 'profile'>('language');
  const [currentTab, setCurrentTab] = useState<'daily' | 'history' | 'stats' | 'settings'>('daily');
  const [hasCheckedServerProfile, setHasCheckedServerProfile] = useState(false);

  // -------------------------------------------------------------------------
  // 2. All useCallback Declarations (Physically above useEffect)
  // -------------------------------------------------------------------------
  const handleLogout = useCallback(async () => {
    try {
      await logout();
      setOnboardingStep('language');
      setHasCheckedServerProfile(false);
    } catch (error) {
      console.error('Logout failed:', error);
    }
  }, [logout]);

  const handleLanguageSelected = useCallback(() => setOnboardingStep('auth'), []);
  const handleAuthCompleted = useCallback(() => setOnboardingStep('welcome'), []);
  const handleWelcomeCompleted = useCallback(() => setOnboardingStep('profile'), []);
  const handleProfileCompleted = useCallback(() => {
    refreshProfile();
  }, [refreshProfile]);

  const handleGoogleSignIn = useCallback(async () => {
    handleAuthCompleted();
  }, [handleAuthCompleted]);

  const handleContinueAnonymously = useCallback(() => {
    handleAuthCompleted();
  }, [handleAuthCompleted]);

  const handleAuthError = useCallback((error: Error) => {
    console.error('Auth error:', error);
    alert(error.message);
  }, []);

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
          setOnboardingStep('profile');
        }
      }
    };
    void checkServerProfile();
  }, [isAuthenticated, userProfile, hasCheckedServerProfile, isLoading, fetchProfileFromServer]);


  if (isLoading) {
    return <LoadingSpinner />;
  }

  // If we have a profile, show the main app
  if (userProfile) {
    const isHebrew = userProfile.language === 'hebrew';

    const getPageTitle = () => {
      switch (currentTab) {
        case 'daily': return isHebrew ? 'יום הודיה' : 'Daily Appreciation';
        case 'history': return isHebrew ? 'יומן' : 'Journal';
        case 'stats': return isHebrew ? 'סטטיסטיקה' : 'Your Progress';
        case 'settings': return isHebrew ? 'הגדרות' : 'Settings';
        default: return 'Daily Appreciation';
      }
    };

    return (
      <div dir={isHebrew ? 'rtl' : 'ltr'} className="bg-white font-display text-slate-800 antialiased overflow-hidden mesh-gradient h-[100dvh] w-full relative">
        <div className="relative flex h-[100dvh] w-full flex-col overflow-hidden sm:max-w-md mx-auto sm:border-x sm:border-white/20 sm:shadow-2xl bg-white/5 backdrop-blur-3xl sm:backdrop-blur-sm sm:bg-white/10" style={{ paddingTop: 'env(safe-area-inset-top)' }}>
          <AppHeader
            onLogout={handleLogout}
            title={getPageTitle()}
          />

          {/* Main Content with Suspense Code-Splitting */}
          <main className="flex-1 w-full relative overflow-y-auto no-scrollbar flex flex-col">
            <Suspense fallback={<LoadingSpinner />}>
              {currentTab === 'daily' && <DailyPractice />}
              {currentTab === 'history' && <HistoryView />}
              {currentTab === 'stats' && <StatsDashboard />}
              {currentTab === 'settings' && <SettingsMenu />}
            </Suspense>
          </main>

          {/* Bottom Navigation */}
          <BottomNav currentTab={currentTab} setCurrentTab={setCurrentTab} />

          {/* Global Badge Unlock Animation Overlay */}
          <BadgeUnlockOverlay />
        </div>
      </div>
    );
  }

  return (
    <div className="h-[100dvh] overflow-hidden animate-fadeIn">
      {onboardingStep === 'language' && <LanguageSelection onNext={handleLanguageSelected} />}
      {onboardingStep === 'auth' && (
        <AuthChoice
          onGoogleSignIn={handleGoogleSignIn}
          onContinueAnonymously={handleContinueAnonymously}
          onError={handleAuthError}
        />
      )}
      {onboardingStep === 'welcome' && <WelcomeScreen onNext={handleWelcomeCompleted} />}
      {onboardingStep === 'profile' && <ProfileSetup onComplete={handleProfileCompleted} />}
    </div>
  );
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
