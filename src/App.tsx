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
  const { userProfile, isLoading, isAuthenticated, logout, refreshProfile, setLanguage, fetchProfileFromServer } = useApp();

  // Track which step of the onboarding flow ONLY when actually onboarding
  // This resets naturally when the component unmounts or when we have a profile
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
          // Profile is now loaded into context, main app will render
        } else {
          console.log('No profile on server, user needs to complete profile setup');
          // Skip to profile setup since they're already authenticated
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
      // State will reset via the useEffect above
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
    const { streak } = useApp();

    return (
      <div dir={isHebrew ? 'rtl' : 'ltr'} className="min-h-screen">
        {/* Header */}
        <header style={{
          position: 'relative',
          width: '100%',
          padding: '16px 16px 12px 16px',
          zIndex: 10
        }}>
          {/* Streak Badge - Gold gradient circle */}
          <div style={{
            position: 'absolute',
            top: '16px',
            left: isHebrew ? 'auto' : '16px',
            right: isHebrew ? '16px' : 'auto',
            width: '64px',
            height: '64px',
            borderRadius: '50%',
            background: 'linear-gradient(to bottom right, #FFD700, #FFA500)',
            border: '2px solid white',
            boxShadow: '0 4px 15px rgba(0, 0, 0, 0.2)',
            display: 'flex',
            flexDirection: 'column',
            alignItems: 'center',
            justifyContent: 'center',
            color: 'white',
            zIndex: 20
          }}>
            <span style={{ fontSize: '14px', marginBottom: '2px' }}>⭐</span>
            <span style={{ fontSize: '14px', fontWeight: 700, lineHeight: 1 }}>
              {isHebrew ? `יום ${streak.currentStreak}` : `Day ${streak.currentStreak}`}
            </span>
          </div>

          {/* Language Button */}
          <button
            onClick={() => setLanguage(isHebrew ? 'english' : 'hebrew')}
            style={{
              position: 'absolute',
              top: '16px',
              right: isHebrew ? 'auto' : '100px', // Next to Sign Out
              left: isHebrew ? '100px' : 'auto',
              padding: '6px 12px',
              fontSize: '13px',
              cursor: 'pointer',
              background: 'rgba(255, 255, 255, 0.15)',
              backdropFilter: 'blur(10px)',
              border: '1px solid rgba(255, 255, 255, 0.3)',
              borderRadius: '20px',
              color: 'rgba(255, 255, 255, 0.8)',
              zIndex: 20
            }}
          >
            {isHebrew ? '🇺🇸 EN' : '🇮🇱 HE'}
          </button>

          {/* Sign Out Button - Top right */}
          <button
            onClick={handleLogout}
            style={{
              position: 'absolute',
              top: '16px',
              right: isHebrew ? 'auto' : '16px',
              left: isHebrew ? '16px' : 'auto',
              padding: '6px 12px',
              fontSize: '13px',
              cursor: 'pointer',
              background: 'rgba(255, 255, 255, 0.15)',
              backdropFilter: 'blur(10px)',
              border: '1px solid rgba(255, 255, 255, 0.3)',
              borderRadius: '20px',
              color: 'rgba(255, 255, 255, 0.8)',
              zIndex: 20
            }}
          >
            {isHebrew ? 'התנתק' : 'Sign Out'}
          </button>

          {/* Centered Titles */}
          <div style={{
            width: '100%',
            display: 'flex',
            flexDirection: 'column',
            alignItems: 'center',
            justifyContent: 'center',
            paddingTop: '8px'
          }}>
            <h1 className="title-hebrew" style={{
              fontSize: '32px',
              fontWeight: 700,
              color: 'white',
              textShadow: '2px 2px 4px rgba(0,0,0,0.3)',
              margin: 0
            }}>
              {isHebrew ? 'יום הודיה' : 'Gratitude Day'}
            </h1>
            <h2 className="title-english" style={{
              fontFamily: "'Playfair Display', serif",
              fontSize: '24px',
              fontWeight: 600,
              color: 'white',
              textShadow: '0 2px 4px rgba(0,0,0,0.5)',
              letterSpacing: '0.05em',
              marginTop: '4px'
            }}>
              Daily Appreciation
            </h2>
          </div>
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
  const handleProfileCompleted = () => {
    // Refresh profile to trigger AppContext reload and show main app
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
    <AppProvider>
      <AppContent />
    </AppProvider>
  );
};

export default App;
