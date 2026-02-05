import React, { useState } from 'react';
import { signInWithGoogle, getUserGoogleId } from '../../services/auth';
import { useApp } from '../../context/AppContext';

interface AuthChoiceProps {
    onGoogleSignIn: () => void;
    onContinueAnonymously: () => void;
    onError: (error: Error) => void;
}

export const AuthChoice: React.FC<AuthChoiceProps> = ({
    onGoogleSignIn,
    onContinueAnonymously,
    onError
}) => {
    const { language, setGoogleId } = useApp();
    const [isLoading, setIsLoading] = useState(false);
    const isHebrew = language === 'hebrew';

    const handleGoogleSignIn = async () => {
        setIsLoading(true);
        try {
            await signInWithGoogle();
            const googleId = getUserGoogleId();
            if (googleId) {
                setGoogleId(googleId);
            }
            onGoogleSignIn();
        } catch (error) {
            onError(error as Error);
        } finally {
            setIsLoading(false);
        }
    };

    return (
        <div
            dir={isHebrew ? 'rtl' : 'ltr'}
            style={{
                minHeight: '100vh',
                display: 'flex',
                flexDirection: 'column',
                alignItems: 'center',
                justifyContent: 'center',
                padding: '24px'
            }}
        >
            {/* Icon */}
            <div style={{ fontSize: '64px', marginBottom: '20px' }}>🔐</div>

            {/* Title */}
            <h1 style={{
                fontSize: '28px',
                fontWeight: 700,
                color: 'black',
                marginBottom: '8px',
                textAlign: 'center'
            }}>
                {isHebrew ? 'שמור על הפרטיות שלך' : 'Protect Your Privacy'}
            </h1>

            {/* Subtitle */}
            <p style={{
                fontSize: '15px',
                color: 'rgba(0, 0, 0, 0.7)',
                textAlign: 'center',
                maxWidth: '320px',
                marginBottom: '32px'
            }}>
                {isHebrew
                    ? 'התחבר עם Google לגיבוי מוצפן, או המשך כאורח'
                    : 'Sign in with Google for encrypted backup, or continue as guest'}
            </p>

            {/* Google Sign In Button */}
            <button
                onClick={handleGoogleSignIn}
                disabled={isLoading}
                style={{
                    width: '100%',
                    maxWidth: '320px',
                    padding: '14px 20px',
                    background: 'rgba(255, 255, 255, 0.95)',
                    border: 'none',
                    borderRadius: '16px',
                    display: 'flex',
                    alignItems: 'center',
                    justifyContent: 'center',
                    gap: '12px',
                    cursor: 'pointer',
                    marginBottom: '12px',
                    boxShadow: '0 4px 15px rgba(0, 0, 0, 0.2)'
                }}
            >
                {isLoading ? (
                    <div style={{
                        width: '20px',
                        height: '20px',
                        border: '2px solid #E5E7EB',
                        borderTop: '2px solid #1F2937',
                        borderRadius: '50%',
                        animation: 'spin 1s linear infinite'
                    }}></div>
                ) : (
                    <>
                        <svg width="20" height="20" viewBox="0 0 24 24">
                            <path fill="#4285F4" d="M22.56 12.25c0-.78-.07-1.53-.2-2.25H12v4.26h5.92c-.26 1.37-1.04 2.53-2.21 3.31v2.77h3.57c2.08-1.92 3.28-4.74 3.28-8.09z" />
                            <path fill="#34A853" d="M12 23c2.97 0 5.46-.98 7.28-2.66l-3.57-2.77c-.98.66-2.23 1.06-3.71 1.06-2.86 0-5.29-1.93-6.16-4.53H2.18v2.84C3.99 20.53 7.7 23 12 23z" />
                            <path fill="#FBBC05" d="M5.84 14.09c-.22-.66-.35-1.36-.35-2.09s.13-1.43.35-2.09V7.07H2.18C1.43 8.55 1 10.22 1 12s.43 3.45 1.18 4.93l2.85-2.22.81-.62z" />
                            <path fill="#EA4335" d="M12 5.38c1.62 0 3.06.56 4.21 1.64l3.15-3.15C17.45 2.09 14.97 1 12 1 7.7 1 3.99 3.47 2.18 7.07l3.66 2.84c.87-2.6 3.3-4.53 6.16-4.53z" />
                        </svg>
                        <span style={{ fontWeight: 600, color: '#374151' }}>
                            {isHebrew ? 'התחבר עם Google' : 'Sign in with Google'}
                        </span>
                    </>
                )}
            </button>

            {/* Privacy Badge */}
            <div style={{
                display: 'flex',
                alignItems: 'center',
                gap: '8px',
                fontSize: '14px',
                color: 'rgba(0, 0, 0, 0.7)',
                marginBottom: '24px'
            }}>
                <span>🔒</span>
                <span>{isHebrew ? 'ההערכות שלך יוצפנו' : 'Your entries will be encrypted'}</span>
            </div>

            {/* Divider */}
            <div style={{
                display: 'flex',
                alignItems: 'center',
                gap: '16px',
                width: '100%',
                maxWidth: '320px',
                marginBottom: '24px'
            }}>
                <div style={{ flex: 1, height: '1px', backgroundColor: 'rgba(0, 0, 0, 0.2)' }}></div>
                <span style={{ color: 'rgba(0, 0, 0, 0.5)', fontSize: '14px' }}>{isHebrew ? 'או' : 'or'}</span>
                <div style={{ flex: 1, height: '1px', backgroundColor: 'rgba(0, 0, 0, 0.2)' }}></div>
            </div>

            {/* Continue Anonymous */}
            <button
                onClick={onContinueAnonymously}
                style={{
                    background: 'transparent',
                    border: '1px solid rgba(0, 0, 0, 0.3)',
                    color: 'rgba(0, 0, 0, 0.8)',
                    fontSize: '16px',
                    fontWeight: 500,
                    cursor: 'pointer',
                    padding: '12px 24px',
                    borderRadius: '9999px'
                }}
            >
                {isHebrew ? 'המשך כאורח' : 'Continue as Guest'}
            </button>

            <p style={{
                fontSize: '13px',
                color: 'rgba(0, 0, 0, 0.5)',
                marginTop: '12px',
                textAlign: 'center',
                maxWidth: '280px'
            }}>
                {isHebrew
                    ? 'הנתונים יישמרו רק במכשיר שלך'
                    : 'Data will only be stored on your device'}
            </p>
        </div>
    );
};
