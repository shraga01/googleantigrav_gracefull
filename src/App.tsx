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
import { StorageService } from './services/storage';

// Navigation Icons - responsive sizes handled in CSS
const SunIcon = () => (
  <svg viewBox="0 0 24 24" fill="currentColor">
    <circle cx="12" cy="12" r="5" />
    <path d="M12 1v2M12 21v2M4.22 4.22l1.42 1.42M18.36 18.36l1.42 1.42M1 12h2M21 12h2M4.22 19.78l1.42-1.42M18.36 5.64l1.42-1.42" />
  </svg>
);

const BookIcon = () => (
  <svg viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2">
    <path d="M4 19.5A2.5 2.5 0 0 1 6.5 17H20" />
    <path d="M6.5 2H20v20H6.5A2.5 2.5 0 0 1 4 19.5v-15A2.5 2.5 0 0 1 6.5 2z" />
  </svg>
);

const ChartIcon = () => (
  <svg viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2">
    <rect x="3" y="12" width="4" height="9" />
    <rect x="10" y="6" width="4" height="15" />
    <rect x="17" y="3" width="4" height="18" />
  </svg>
);

const SettingsIcon = () => (
  <svg viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2">
    <circle cx="12" cy="12" r="3" />
    <path d="M19.4 15a1.65 1.65 0 0 0 .33 1.82l.06.06a2 2 0 0 1 0 2.83 2 2 0 0 1-2.83 0l-.06-.06a1.65 1.65 0 0 0-1.82-.33 1.65 1.65 0 0 0-1 1.51V21a2 2 0 0 1-2 2 2 2 0 0 1-2-2v-.09A1.65 1.65 0 0 0 9 19.4a1.65 1.65 0 0 0-1.82.33l-.06.06a2 2 0 0 1-2.83 0 2 2 0 0 1 0-2.83l.06-.06a1.65 1.65 0 0 0 .33-1.82 1.65 1.65 0 0 0-1.51-1H3a2 2 0 0 1-2-2 2 2 0 0 1 2-2h.09A1.65 1.65 0 0 0 4.6 9a1.65 1.65 0 0 0-.33-1.82l-.06-.06a2 2 0 0 1 0-2.83 2 2 0 0 1 2.83 0l.06.06a1.65 1.65 0 0 0 1.82.33H9a1.65 1.65 0 0 0 1-1.51V3a2 2 0 0 1 2-2 2 2 0 0 1 2 2v.09a1.65 1.65 0 0 0 1 1.51 1.65 1.65 0 0 0 1.82-.33l.06-.06a2 2 0 0 1 2.83 0 2 2 0 0 1 0 2.83l-.06.06a1.65 1.65 0 0 0-.33 1.82V9a1.65 1.65 0 0 0 1.51 1H21a2 2 0 0 1 2 2 2 2 0 0 1-2 2h-.09a1.65 1.65 0 0 0-1.51 1z" />
  </svg>
);

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

    return (
      <div dir={isHebrew ? 'rtl' : 'ltr'} className="min-h-screen">
        {/* Header - Explicit inline styles for guaranteed horizontal alignment */}
        <header style={{
          display: 'flex',
          flexDirection: 'row',
          justifyContent: 'space-between',
          alignItems: 'center',
          width: '100%',
          padding: '20px 20px 12px 20px'
        }}>
          {/* Streak Pill */}
          <div className="streak-pill" style={{ display: 'flex', alignItems: 'center', gap: '6px', padding: '6px 12px' }}>
            <span style={{ fontSize: '16px' }}>✨</span>
            <span style={{ fontWeight: 700, fontSize: '16px' }}>{streak.currentStreak}</span>
            <span style={{ fontSize: '14px', fontWeight: 500 }}>{isHebrew ? 'יום' : 'day'}</span>
          </div>
          {/* Title */}
          <div className="title-english" style={{ fontFamily: "'Playfair Display', serif", fontSize: '24px', fontWeight: 600 }}>
            Daily Appreciation
          </div>
          {/* Sign Out Button */}
          <button
            onClick={handleLogout}
            style={{
              padding: '6px 12px',
              fontSize: '13px',
              cursor: 'pointer',
              background: 'transparent',
              border: '1px solid var(--color-border)',
              borderRadius: 'var(--radius-sm)',
              color: 'var(--color-text-muted)'
            }}
          >
            {isHebrew ? 'התנתק' : 'Sign Out'}
          </button>
        </header>

        {/* Main Content */}
        <main className="container-main page-content">
          {currentTab === 'daily' && <DailyPractice />}
          {currentTab === 'history' && <HistoryView />}
          {currentTab === 'stats' && <StatsDashboard />}
          {currentTab === 'settings' && <SettingsMenu />}
        </main>

        {/* Bottom Navigation */}
        <nav className="nav-container">
          <div
            className={`nav-item ${currentTab === 'settings' ? 'active' : ''}`}
            onClick={() => setCurrentTab('settings')}
          >
            <SettingsIcon />
            <span>{isHebrew ? 'הגדרות' : 'Settings'}</span>
          </div>
          <div
            className={`nav-item ${currentTab === 'stats' ? 'active' : ''}`}
            onClick={() => setCurrentTab('stats')}
          >
            <ChartIcon />
            <span>{isHebrew ? 'מדדים' : 'Stats'}</span>
          </div>
          <div
            className={`nav-item ${currentTab === 'history' ? 'active' : ''}`}
            onClick={() => setCurrentTab('history')}
          >
            <BookIcon />
            <span>{isHebrew ? 'יומן' : 'Journal'}</span>
          </div>
          <div
            className={`nav-item ${currentTab === 'daily' ? 'active' : ''}`}
            onClick={() => setCurrentTab('daily')}
          >
            <SunIcon />
            <span>{isHebrew ? 'היום' : 'Today'}</span>
          </div>
        </nav>
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
    <AppProvider>
      <AppContent />
    </AppProvider>
  );
};

export default App;
