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
import { SunIcon, BookIcon, ChartIcon, SettingsIcon } from './components/common/Icons';

const AppContent: React.FC = () => {
  const { userProfile, isLoading } = useApp();
  const [onboardingStep, setOnboardingStep] = useState<'language' | 'auth' | 'welcome' | 'profile'>('language');
  const [currentTab, setCurrentTab] = useState<'daily' | 'history' | 'stats' | 'settings'>('daily');

  if (isLoading) {
    return <LoadingSpinner />;
  }

  // If we have a profile, show the main app
  if (userProfile) {
    return (
      <div style={{ display: 'flex', flexDirection: 'column', height: '100vh', backgroundColor: 'var(--color-background)' }}>
        <div style={{ flex: 1, overflowY: 'auto', paddingBottom: '80px' }}>
          {currentTab === 'daily' && <DailyPractice />}
          {currentTab === 'history' && <HistoryView />}
          {currentTab === 'stats' && <StatsDashboard />}
          {currentTab === 'settings' && <SettingsMenu />}
        </div>

        {/* Bottom Navigation */}
        <div style={{
          display: 'flex',
          justifyContent: 'space-around',
          padding: '12px 16px 32px 16px',
          borderTop: '1px solid var(--color-border)',
          backgroundColor: 'var(--color-card-bg)',
          position: 'fixed',
          bottom: 0,
          left: 0,
          right: 0,
          boxShadow: 'var(--shadow-lg)'
        }}>
          <NavButton
            active={currentTab === 'daily'}
            onClick={() => setCurrentTab('daily')}
            icon={<SunIcon size={24} />}
            label={userProfile.language === 'hebrew' ? 'היום' : 'Today'}
          />
          <NavButton
            active={currentTab === 'history'}
            onClick={() => setCurrentTab('history')}
            icon={<BookIcon size={24} />}
            label={userProfile.language === 'hebrew' ? 'יומן' : 'Journal'}
          />
          <NavButton
            active={currentTab === 'stats'}
            onClick={() => setCurrentTab('stats')}
            icon={<ChartIcon size={24} />}
            label={userProfile.language === 'hebrew' ? 'מדדים' : 'Stats'}
          />
          <NavButton
            active={currentTab === 'settings'}
            onClick={() => setCurrentTab('settings')}
            icon={<SettingsIcon size={24} />}
            label={userProfile.language === 'hebrew' ? 'הגדרות' : 'Settings'}
          />
        </div>
      </div>
    );
  }

  // Onboarding Flow
  const handleLanguageSelected = () => setOnboardingStep('auth');
  const handleAuthCompleted = () => setOnboardingStep('welcome');
  const handleWelcomeCompleted = () => setOnboardingStep('profile');
  const handleProfileCompleted = () => {
    // Context updates automatically, so re-render will show main app
  };

  const handleGoogleSignIn = async () => {
    // User signed in with Google, proceed to welcome screen
    handleAuthCompleted();
  };

  const handleContinueAnonymously = () => {
    // User chose anonymous mode, proceed to welcome screen
    handleAuthCompleted();
  };

  const handleAuthError = (error: Error) => {
    console.error('Auth error:', error);
    alert(error.message);
  };

  return (
    <div className="app-container" style={{ height: '100vh', overflow: 'hidden' }}>
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

const NavButton: React.FC<{ active: boolean; onClick: () => void; icon: React.ReactNode; label: string }> = ({ active, onClick, icon, label }) => (
  <button
    onClick={onClick}
    style={{
      background: 'none',
      border: 'none',
      display: 'flex',
      flexDirection: 'column',
      alignItems: 'center',
      color: active ? 'var(--color-primary)' : 'var(--color-text-muted)',
      cursor: 'pointer',
      fontSize: 'var(--font-size-xs)',
      padding: '8px',
      gap: '4px',
      transition: 'color var(--transition-fast)',
      boxShadow: 'none',
      transform: 'none'
    }}
  >
    <div style={{
      transition: 'transform var(--transition-fast)',
      transform: active ? 'scale(1.1)' : 'scale(1)'
    }}>
      {icon}
    </div>
    <span style={{ fontWeight: active ? 600 : 400 }}>{label}</span>
  </button>
);

const App: React.FC = () => {
  return (
    <AppProvider>
      <AppContent />
    </AppProvider>
  );
};

export default App;
