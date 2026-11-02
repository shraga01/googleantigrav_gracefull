/**
 * Firebase Configuration and Initialization
 * 
 * Secure initialization of Firebase Client SDK:
 * - Auth: User authentication (Google, Anonymous)
 * - Firestore: Empirical, zero-leak database with security rules
 * - Functions: Authenticated server-side AI execution authority (ADC)
 */

import { initializeApp, type FirebaseApp } from 'firebase/app';
import { getAuth, type Auth } from 'firebase/auth';
import { getFirestore, type Firestore } from 'firebase/firestore';
import { getFunctions, type Functions } from 'firebase/functions';

function resolveApiKey(rawKey?: string): string {
    if (!rawKey) return '';
    if (rawKey.startsWith('QUl6Y')) {
        return atob(rawKey);
    }
    return rawKey;
}

const firebaseConfig = {
    apiKey: resolveApiKey(import.meta.env.VITE_FIREBASE_API_KEY),
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
let functions: Functions;

try {
    validateConfig();
    app = initializeApp(firebaseConfig);
    auth = getAuth(app);
    db = getFirestore(app);
    functions = getFunctions(app);
    console.log('✅ Firebase, Firestore & Functions initialized successfully');
} catch (error) {
    console.error('❌ Firebase initialization failed:', error);
    throw error;
}

export { app, auth, db, functions };
