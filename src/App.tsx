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

const AppContent: React.FC = () => {
  const { userProfile, isLoading, isAuthenticated, logout, refreshProfile, setLanguage, fetchProfileFromServer } = useApp();

  // Track which step of the onboarding flow ONLY when actually onboarding
  // This resets naturally when the component unmounts or when we have a profile
  const [onboardingStep, setOnboardingStep] = useState<'language' | 'auth' | 'welcome' | 'profile'>('language');
  const [currentTab, setCurrentTab] = useState<'daily' | 'history' | 'stats' | 'settings'>('daily');
  const [menuOpen, setMenuOpen] = useState(false);

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
            width: '50px',
            height: '50px',
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
            <span style={{ fontSize: '12px', marginBottom: '1px' }}>⭐</span>
            <span style={{ fontSize: '11px', fontWeight: 700, lineHeight: 1 }}>
              {isHebrew ? `יום ${streak.currentStreak}` : `Day ${streak.currentStreak}`}
            </span>
          </div>

          {/* Hamburger Menu */}
          <div style={{
            position: 'absolute',
            top: '16px',
            right: isHebrew ? 'auto' : '16px',
            left: isHebrew ? '16px' : 'auto',
            zIndex: 30
          }}>
            {/* Hamburger Icon */}
            <button
              onClick={() => setMenuOpen(!menuOpen)}
              style={{
                width: '50px',
                height: '50px',
                borderRadius: '50%',
                background: 'rgba(255, 255, 255, 0.15)',
                backdropFilter: 'blur(10px)',
                border: '1px solid rgba(255, 255, 255, 0.3)',
                cursor: 'pointer',
                display: 'flex',
                flexDirection: 'column',
                alignItems: 'center',
                justifyContent: 'center',
                gap: '5px'
              }}
            >
              <span style={{ width: '22px', height: '2px', background: 'white', borderRadius: '1px' }} />
              <span style={{ width: '22px', height: '2px', background: 'white', borderRadius: '1px' }} />
              <span style={{ width: '22px', height: '2px', background: 'white', borderRadius: '1px' }} />
            </button>

            {/* Dropdown Menu */}
            {menuOpen && (
              <div style={{
                position: 'absolute',
                top: '58px',
                right: isHebrew ? 'auto' : '0',
                left: isHebrew ? '0' : 'auto',
                background: 'rgba(255, 255, 255, 0.95)',
                backdropFilter: 'blur(10px)',
                borderRadius: '12px',
                boxShadow: '0 4px 20px rgba(0, 0, 0, 0.15)',
                minWidth: '180px',
                overflow: 'hidden'
              }}>
                {/* User Info */}
                <div style={{
                  padding: '12px 16px',
                  borderBottom: '1px solid rgba(0, 0, 0, 0.1)',
                  display: 'flex',
                  alignItems: 'center',
                  gap: '10px'
                }}>
                  <div style={{
                    width: '32px',
                    height: '32px',
                    borderRadius: '50%',
                    background: 'linear-gradient(135deg, #8A2BE2, #FF69B4)',
                    display: 'flex',
                    alignItems: 'center',
                    justifyContent: 'center',
                    color: 'white',
                    fontSize: '14px',
                    fontWeight: 700
                  }}>
                    {userProfile.name?.charAt(0).toUpperCase() || '👤'}
                  </div>
                  <span style={{ color: '#333', fontSize: '14px', fontWeight: 500 }}>
                    {userProfile.name || (isHebrew ? 'משתמש' : 'User')}
                  </span>
                </div>

                {/* Navigation Items */}
                <button
                  onClick={() => { setCurrentTab('daily'); setMenuOpen(false); }}
                  style={{
                    width: '100%',
                    padding: '12px 16px',
                    background: currentTab === 'daily' ? 'rgba(138, 43, 226, 0.1)' : 'transparent',
                    border: 'none',
                    cursor: 'pointer',
                    display: 'flex',
                    alignItems: 'center',
                    gap: '10px',
                    fontSize: '14px',
                    color: currentTab === 'daily' ? '#8A2BE2' : '#333',
                    fontWeight: currentTab === 'daily' ? 600 : 400
                  }}
                >
                  <span>☀️</span>
                  <span>{isHebrew ? 'היום' : 'Today'}</span>
                </button>

                <button
                  onClick={() => { setCurrentTab('history'); setMenuOpen(false); }}
                  style={{
                    width: '100%',
                    padding: '12px 16px',
                    background: currentTab === 'history' ? 'rgba(138, 43, 226, 0.1)' : 'transparent',
                    border: 'none',
                    cursor: 'pointer',
                    display: 'flex',
                    alignItems: 'center',
                    gap: '10px',
                    fontSize: '14px',
                    color: currentTab === 'history' ? '#8A2BE2' : '#333',
                    fontWeight: currentTab === 'history' ? 600 : 400
                  }}
                >
                  <span>📖</span>
                  <span>{isHebrew ? 'יומן' : 'Journal'}</span>
                </button>

                <button
                  onClick={() => { setCurrentTab('stats'); setMenuOpen(false); }}
                  style={{
                    width: '100%',
                    padding: '12px 16px',
                    background: currentTab === 'stats' ? 'rgba(138, 43, 226, 0.1)' : 'transparent',
                    border: 'none',
                    cursor: 'pointer',
                    display: 'flex',
                    alignItems: 'center',
                    gap: '10px',
                    fontSize: '14px',
                    color: currentTab === 'stats' ? '#8A2BE2' : '#333',
                    fontWeight: currentTab === 'stats' ? 600 : 400
                  }}
                >
                  <span>📊</span>
                  <span>{isHebrew ? 'מדדים' : 'Stats'}</span>
                </button>

                <button
                  onClick={() => { setCurrentTab('settings'); setMenuOpen(false); }}
                  style={{
                    width: '100%',
                    padding: '12px 16px',
                    background: currentTab === 'settings' ? 'rgba(138, 43, 226, 0.1)' : 'transparent',
                    border: 'none',
                    borderBottom: '1px solid rgba(0, 0, 0, 0.1)',
                    cursor: 'pointer',
                    display: 'flex',
                    alignItems: 'center',
                    gap: '10px',
                    fontSize: '14px',
                    color: currentTab === 'settings' ? '#8A2BE2' : '#333',
                    fontWeight: currentTab === 'settings' ? 600 : 400
                  }}
                >
                  <span>⚙️</span>
                  <span>{isHebrew ? 'הגדרות' : 'Settings'}</span>
                </button>

                {/* Language Toggle */}
                <button
                  onClick={() => {
                    setLanguage(isHebrew ? 'english' : 'hebrew');
                    setMenuOpen(false);
                  }}
                  style={{
                    width: '100%',
                    padding: '12px 16px',
                    background: 'transparent',
                    border: 'none',
                    cursor: 'pointer',
                    display: 'flex',
                    alignItems: 'center',
                    gap: '10px',
                    fontSize: '14px',
                    color: '#333'
                  }}
                >
                  <span>{isHebrew ? '🇺🇸' : '🇮🇱'}</span>
                  <span>{isHebrew ? 'English' : 'עברית'}</span>
                </button>

                {/* Sign Out */}
                <button
                  onClick={() => {
                    handleLogout();
                    setMenuOpen(false);
                  }}
                  style={{
                    width: '100%',
                    padding: '12px 16px',
                    background: 'transparent',
                    border: 'none',
                    borderTop: '1px solid rgba(0, 0, 0, 0.1)',
                    cursor: 'pointer',
                    display: 'flex',
                    alignItems: 'center',
                    gap: '10px',
                    fontSize: '14px',
                    color: '#e53e3e'
                  }}
                >
                  <span>🚪</span>
                  <span>{isHebrew ? 'התנתק' : 'Sign Out'}</span>
                </button>
              </div>
            )}
          </div>

          {/* Centered Titles */}
          <div style={{
            width: '100%',
            display: 'flex',
            flexDirection: 'column',
            alignItems: 'center',
            justifyContent: 'center',
            paddingTop: '48px'
          }}>
            <h2 className="title-english" style={{
              fontFamily: "'Playfair Display', serif",
              fontSize: '24px',
              fontWeight: 600,
              color: 'var(--color-text-primary)', // Updated for Light Theme
              textShadow: 'none',
              letterSpacing: '0.05em',
              marginTop: '4px'
            }}>
              Daily Appreciation
            </h2>
          </div>
        </header >

        {/* Main Content */}
        < main className="container-main page-content" >
          {currentTab === 'daily' && <DailyPractice />}
          {currentTab === 'history' && <HistoryView />}
          {currentTab === 'stats' && <StatsDashboard />}
          {currentTab === 'settings' && <SettingsMenu />}
        </main >
      </div >
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
