/**
 * Firebase Configuration and Initialization
 * 
 * Secure initialization of Firebase Client SDK:
 * - Auth: User authentication (Google, Anonymous)
 * - Firestore: Empirical, zero-leak database with security rules
 */

import { initializeApp, type FirebaseApp } from 'firebase/app';
import { getAuth, type Auth } from 'firebase/auth';
import { getFirestore, type Firestore } from 'firebase/firestore';

const firebaseConfig = {
    apiKey: import.meta.env.VITE_FIREBASE_API_KEY,
    authDomain: import.meta.env.VITE_FIREBASE_AUTH_DOMAIN,
    projectId: import.meta.env.VITE_FIREBASE_PROJECT_ID,
    storageBucket: import.meta.env.VITE_FIREBASE_STORAGE_BUCKET,
    messagingSenderId: import.meta.env.VITE_FIREBASE_MESSAGING_SENDER_ID,
    appId: import.meta.env.VITE_FIREBASE_APP_ID,
};

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
            'Please verify your environment variables.'
        );
    }
}

let app: FirebaseApp;
let auth: Auth;
let db: Firestore;

try {
    validateConfig();
    app = initializeApp(firebaseConfig);
    auth = getAuth(app);
    db = getFirestore(app);
    console.log('✅ Firebase and Firestore initialized successfully');
} catch (error) {
    console.error('❌ Firebase initialization failed:', error);
    throw error;
}

export { app, auth, db };
