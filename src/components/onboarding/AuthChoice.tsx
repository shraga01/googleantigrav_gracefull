import React from 'react';
import { GoogleSignInButton } from '../auth/GoogleSignInButton';

interface Props {
    onGoogleSignIn: () => void;
    onContinueAnonymously: () => void;
    onError: (error: Error) => void;
}

export const AuthChoice: React.FC<Props> = ({ onGoogleSignIn, onContinueAnonymously, onError }) => {
    return (
        <div style={{
            display: 'flex',
            flexDirection: 'column',
            alignItems: 'center',
            justifyContent: 'center',
            minHeight: '100vh',
            padding: 'var(--spacing-lg)',
            gap: 'var(--spacing-xl)',
            backgroundColor: 'var(--color-background)'
        }}>
            <h1 style={{
                fontSize: 'var(--font-size-xl)',
                textAlign: 'center',
                color: 'var(--color-text-main)',
                marginBottom: 'var(--spacing-md)'
            }}>
                Sign in or continue
            </h1>

            <div style={{
                fontSize: 'var(--font-size-sm)',
                color: 'var(--color-text-muted)',
                textAlign: 'center',
                maxWidth: '400px',
                marginBottom: 'var(--spacing-lg)',
                lineHeight: '1.6'
            }}>
                🔒 <strong>Sign in with Google</strong> to sync your entries across devices with end-to-end encryption.
                <br /><br />
                Or continue anonymously (data stored locally only).
            </div>

            <GoogleSignInButton
                onSuccess={onGoogleSignIn}
                onError={onError}
            />

            <button
                onClick={onContinueAnonymously}
                style={{
                    backgroundColor: 'transparent',
                    border: 'none',
                    color: 'var(--color-text-muted)',
                    fontSize: 'var(--font-size-sm)',
                    cursor: 'pointer',
                    textDecoration: 'underline',
                    padding: 'var(--spacing-sm)',
                    boxShadow: 'none',
                    transform: 'none'
                }}
            >
                Continue anonymously
            </button>

            <div style={{
                marginTop: 'var(--spacing-xl)',
                fontSize: 'var(--font-size-xs)',
                color: 'var(--color-text-muted)',
                textAlign: 'center',
                maxWidth: '500px'
            }}>
                <strong>Privacy guarantee:</strong> We only collect your email for login. Your journal entries are encrypted on your device before being sent to the server. We cannot read your content.
            </div>
        </div>
    );
};
