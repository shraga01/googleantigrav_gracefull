/**
 * Authentication Service
 * 
 * Handles Google Sign-In with minimal permissions (email only).
 * Provides auth state management and user information.
 */

import {
    GoogleAuthProvider,
    signInWithPopup,
    signOut as firebaseSignOut,
    onAuthStateChanged,
    type User,
    type UserCredential,
} from 'firebase/auth';
import { Capacitor } from '@capacitor/core';
import { auth } from './firebase';

// Configure Google provider with minimal scopes
const googleProvider = new GoogleAuthProvider();
googleProvider.setCustomParameters({
    prompt: 'select_account', // Always show account selection
});

// Request only email scope (not profile, photos, etc.)
googleProvider.addScope('email');

/**
 * Sign in with Google using popup
 * Returns user credential with minimal data.
 * NOTE: signInWithRedirect and getRedirectResult are strictly banned across the codebase.
 */
export async function signInWithGoogle(): Promise<UserCredential> {
    try {
        const result = await signInWithPopup(auth, googleProvider);
        console.log('✅ Google sign-in successful');
        return result;
    } catch (error: any) { // eslint-disable-line @typescript-eslint/no-explicit-any
        console.error('❌ Google sign-in failed:', error);

        // On native Android APK (Capacitor), catch popup errors gracefully without redirecting to firebaseapp.com
        if (Capacitor.isNativePlatform()) {
            const isHebrew = typeof document !== 'undefined' && document.documentElement.lang === 'he';
            const nativeNotice = isHebrew
                ? 'האפליקציה פועלת במצב מקומי ומאובטח במכשירך. כל הנתונים נשמרים בטלפון וניתנים לגיבוי ושחזור מקובץ בתפריט ההגדרות.'
                : 'The app is running in secure local mode on your device. Your data is stored on this phone and can be backed up and restored via Settings.';

            if (typeof alert !== 'undefined') {
                alert(nativeNotice);
            }
            throw new Error(nativeNotice);
        }

        // Handle specific error cases for web
        if (error.code === 'auth/popup-closed-by-user') {
            throw new Error('Sign-in cancelled');
        } else if (error.code === 'auth/popup-blocked') {
            throw new Error('Popup blocked. Please allow popups for this site.');
        } else {
            throw new Error('Failed to sign in with Google');
        }
    }
}

/**
 * Sign out current user
 */
export async function signOut(): Promise<void> {
    try {
        await firebaseSignOut(auth);
        console.log('✅ Signed out successfully');
    } catch (error) {
        console.error('❌ Sign out failed:', error);
        throw new Error('Failed to sign out');
    }
}

/**
 * Get current authenticated user
 */
export function getCurrentUser(): User | null {
    return auth.currentUser;
}

/**
 * Listen to authentication state changes
 * Returns unsubscribe function
 */
export function onAuthChange(callback: (user: User | null) => void): () => void {
    return onAuthStateChanged(auth, callback);
}

/**
 * Get user's Google ID (for encryption key derivation)
 * This is safe to use as it's a stable, unique identifier
 */
export function getUserGoogleId(): string | null {
    const user = getCurrentUser();
    return user?.uid || null;
}

/**
 * Get user's email
 */
export function getUserEmail(): string | null {
    const user = getCurrentUser();
    return user?.email || null;
}

/**
 * Check if user is authenticated
 */
export function isAuthenticated(): boolean {
    return getCurrentUser() !== null;
}
