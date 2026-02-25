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
  const { userProfile, isLoading, isAuthenticated, logout, refreshProfile, fetchProfileFromServer } = useApp();

  // Track which step of the onboarding flow ONLY when actually onboarding
  const [onboardingStep, setOnboardingStep] = useState<'language' | 'auth' | 'welcome' | 'profile'>('language');
  const [currentTab, setCurrentTab] = useState<'daily' | 'history' | 'stats' | 'settings'>('daily');

  // Track if we've already checked for server profile after auth
  const [hasCheckedServerProfile, setHasCheckedServerProfile] = useState(false);

  // When user becomes authenticated, check if they have a profile on the server
  React.useEffect(() => {
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
    checkServerProfile();
  }, [isAuthenticated, userProfile, hasCheckedServerProfile, isLoading, fetchProfileFromServer]);

  // Reset state when user logs out
  React.useEffect(() => {
    if (!isAuthenticated && !isLoading) {
      setOnboardingStep('language');
      setHasCheckedServerProfile(false);
    }
  }, [isAuthenticated, isLoading]);

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

    return (
      <div dir={isHebrew ? 'rtl' : 'ltr'} className="min-h-screen relative pb-24">
        <AppHeader
          onLogout={handleLogout}
        />

        {/* Main Content */}
        <main className="container-main page-content">
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
    );
  }

  // Onboarding Flow handlers
  const handleLanguageSelected = () => setOnboardingStep('auth');
  const handleAuthCompleted = () => setOnboardingStep('welcome');
  const handleWelcomeCompleted = () => setOnboardingStep('profile');
  const handleProfileCompleted = () => {
    refreshProfile();
  };

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
    <div className="min-h-screen animate-fadeIn">
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
