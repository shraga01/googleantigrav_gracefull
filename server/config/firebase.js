/**
 * Firebase Admin SDK Initialization
 * 
 * This initializes Firebase Admin for server-side token verification.
 * The service account key is loaded from the JSON file.
 */

import admin from 'firebase-admin';
import { readFileSync } from 'fs';
import { fileURLToPath } from 'url';
import { dirname, join } from 'path';

const __filename = fileURLToPath(import.meta.url);
const __dirname = dirname(__filename);

// Load service account key
const serviceAccount = JSON.parse(
    readFileSync(join(__dirname, 'firebase-service-account.json'), 'utf8')
);

// Initialize Firebase Admin
if (!admin.apps.length) {
    admin.initializeApp({
        credential: admin.credential.cert(serviceAccount),
    });
    console.log('✅ Firebase Admin initialized');
}

export const auth = admin.auth();
export default admin;
