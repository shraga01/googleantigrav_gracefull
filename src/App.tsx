import React, { useState } from 'react';
import { AppProvider, useApp } from './context/AppContext';
import { LanguageSelection } from './components/onboarding/LanguageSelection';
import { AuthChoice } from './components/onboarding/AuthChoice';
import { WelcomeScreen } from './components/onboarding/WelcomeScreen';
import { ProfileSetup } from './components/onboarding/ProfileSetup';
import { DailyPractice } from './components/daily/DailyPractice';
import { HistoryView } from './components/history/HistoryView';
import { StatsDashboard } from './components/stats/StatsDashboard';
import { SettingsMenu } from './components/settings/SettingsMenu';
import { LoadingSpinner } from './components/common/LoadingSpinner';
import { AppHeader } from './components/layout/AppHeader';
import { BottomNav } from './components/layout/BottomNav';
import { ErrorBoundary } from './components/common/ErrorBoundary';
import { BadgeUnlockOverlay } from './components/common/BadgeUnlockOverlay';

const AppContent: React.FC = () => {
  const { userProfile, isLoading, logout } = useApp();
  const [onboardingStep, setOnboardingStep] = useState<'language' | 'auth' | 'welcome' | 'profile'>('language');
  const [currentTab, setCurrentTab] = useState<'daily' | 'history' | 'stats' | 'settings'>('daily');

  const handleLogout = async () => {
    try {
      await logout();
    } catch (error) {
      console.error('Logout failed:', error);
    }
  };

  if (isLoading) {
    return <LoadingSpinner />;
  }

  // If we have a profile, show the main app
  if (userProfile) {
    const isHebrew = userProfile.language === 'hebrew';
    const streak = StorageService.getStreak();

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

          {/* Main Content */}
          <main className="flex-1 w-full relative overflow-y-auto no-scrollbar flex flex-col">
            {currentTab === 'daily' && <DailyPractice />}
            {currentTab === 'history' && <HistoryView />}
            {currentTab === 'stats' && <StatsDashboard />}
            {currentTab === 'settings' && <SettingsMenu />}
          </main>

          {/* Bottom Navigation */}
          <BottomNav currentTab={currentTab} setCurrentTab={setCurrentTab} />

          {/* Global Badge Unlock Animation Overlay */}
          <BadgeUnlockOverlay />
        </div>
      </div>
    );
  }

  // Onboarding Flow
  const handleLanguageSelected = () => setOnboardingStep('auth');
  const handleAuthCompleted = () => setOnboardingStep('welcome');
  const handleWelcomeCompleted = () => setOnboardingStep('profile');
  const handleProfileCompleted = () => { };

  const handleGoogleSignIn = async () => {
    handleAuthCompleted();
  };

  const handleContinueAnonymously = () => {
    handleAuthCompleted();
  };

  const handleAuthError = (error: Error) => {
    console.error('Auth error:', error);
    alert(error.message);
  };

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
    <AppProvider>
      <AppContent />
    </AppProvider>
  );
};

export default App;
