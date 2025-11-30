import React, { useState } from 'react';
import { AppProvider, useApp } from './context/AppContext';
import { LanguageSelection } from './components/onboarding/LanguageSelection';
import { WelcomeScreen } from './components/onboarding/WelcomeScreen';
import { ProfileSetup } from './components/onboarding/ProfileSetup';
import { DailyPractice } from './components/daily/DailyPractice';
import { HistoryView } from './components/history/HistoryView';
import { StatsDashboard } from './components/stats/StatsDashboard';
import { SettingsMenu } from './components/settings/SettingsMenu';
import { LoadingSpinner } from './components/common/LoadingSpinner';

const AppContent: React.FC = () => {
  const { userProfile, isLoading } = useApp();
  const [onboardingStep, setOnboardingStep] = useState<'language' | 'welcome' | 'profile'>('language');
  const [currentTab, setCurrentTab] = useState<'daily' | 'history' | 'stats' | 'settings'>('daily');

  if (isLoading) {
    return <LoadingSpinner />;
  }

  // If we have a profile, show the main app
  if (userProfile) {
    return (
      <div style={{ display: 'flex', flexDirection: 'column', height: '100vh' }}>
        <div style={{ flex: 1, overflowY: 'auto' }}>
          {currentTab === 'daily' && <DailyPractice />}
          {currentTab === 'history' && <HistoryView />}
          {currentTab === 'stats' && <StatsDashboard />}
          {currentTab === 'settings' && <SettingsMenu />}
        </div>

        {/* Bottom Navigation */}
        <div style={{
          display: 'flex',
          justifyContent: 'space-around',
          padding: '12px',
          borderTop: '1px solid var(--color-border)',
          backgroundColor: 'var(--color-card-bg)',
          position: 'sticky',
          bottom: 0
        }}>
          <NavButton
            active={currentTab === 'daily'}
            onClick={() => setCurrentTab('daily')}
            icon="☀️"
            label={userProfile.language === 'hebrew' ? 'היום' : 'Today'}
          />
          <NavButton
            active={currentTab === 'history'}
            onClick={() => setCurrentTab('history')}
            icon="📖"
            label={userProfile.language === 'hebrew' ? 'יומן' : 'Journal'}
          />
          <NavButton
            active={currentTab === 'stats'}
            onClick={() => setCurrentTab('stats')}
            icon="📊"
            label={userProfile.language === 'hebrew' ? 'מדדים' : 'Stats'}
          />
          <NavButton
            active={currentTab === 'settings'}
            onClick={() => setCurrentTab('settings')}
            icon="⚙️"
            label={userProfile.language === 'hebrew' ? 'הגדרות' : 'Settings'}
          />
        </div>
      </div>
    );
  }

  // Onboarding Flow
  const handleLanguageSelected = () => setOnboardingStep('welcome');
  const handleWelcomeCompleted = () => setOnboardingStep('profile');
  const handleProfileCompleted = () => {
    // Context updates automatically, so re-render will show main app
  };

  return (
    <div className="app-container">
      {onboardingStep === 'language' && <LanguageSelection onNext={handleLanguageSelected} />}
      {onboardingStep === 'welcome' && <WelcomeScreen onNext={handleWelcomeCompleted} />}
      {onboardingStep === 'profile' && <ProfileSetup onComplete={handleProfileCompleted} />}
    </div>
  );
};

const NavButton: React.FC<{ active: boolean; onClick: () => void; icon: string; label: string }> = ({ active, onClick, icon, label }) => (
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
      fontSize: '12px'
    }}
  >
    <span style={{ fontSize: '20px', marginBottom: '4px' }}>{icon}</span>
    <span>{label}</span>
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
