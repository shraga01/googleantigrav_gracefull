/**
 * Firebase Configuration and Initialization
 * 
 * This file initializes Firebase with the configuration from environment variables.
 * Only authentication is enabled - we use minimal permissions for privacy.
 */

import { initializeApp, type FirebaseApp } from 'firebase/app';
import { getAuth, type Auth } from 'firebase/auth';

// Firebase configuration from environment variables
const firebaseConfig = {
    apiKey: import.meta.env.VITE_FIREBASE_API_KEY,
    authDomain: import.meta.env.VITE_FIREBASE_AUTH_DOMAIN,
    projectId: import.meta.env.VITE_FIREBASE_PROJECT_ID,
    storageBucket: import.meta.env.VITE_FIREBASE_STORAGE_BUCKET,
    messagingSenderId: import.meta.env.VITE_FIREBASE_MESSAGING_SENDER_ID,
    appId: import.meta.env.VITE_FIREBASE_APP_ID,
};

// Validate configuration
function validateConfig(): void {
    const requiredKeys = [
        'VITE_FIREBASE_API_KEY',
        'VITE_FIREBASE_AUTH_DOMAIN',
        'VITE_FIREBASE_PROJECT_ID',
    ];

    const missing = requiredKeys.filter((key) => !import.meta.env[key]);

    if (missing.length > 0) {
        throw new Error(
            `Missing Firebase configuration: ${missing.join(', ')}. ` +
            'Please check your .env file and FIREBASE_SETUP.md guide.'
        );
    }
}

// Initialize Firebase
let app: FirebaseApp;
let auth: Auth;

try {
    validateConfig();
    app = initializeApp(firebaseConfig);
    auth = getAuth(app);
    console.log('✅ Firebase initialized successfully');
} catch (error) {
    console.error('❌ Firebase initialization failed:', error);
    throw error;
}

export { app, auth };
