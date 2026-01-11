/**
 * Firebase Authentication Middleware
 * 
 * Verifies Firebase ID tokens from the frontend.
 * Attaches user information to the request object.
 */

import { auth } from '../config/firebase.js';

/**
 * Middleware to verify Firebase ID token
 * Expects token in Authorization header: "Bearer <token>"
 */
export const verifyFirebaseToken = async (req, res, next) => {
    try {
        // Get token from Authorization header
        const authHeader = req.headers.authorization;

        if (!authHeader || !authHeader.startsWith('Bearer ')) {
            return res.status(401).json({ error: 'No token provided' });
        }

        const token = authHeader.split('Bearer ')[1];

        // Verify the token with Firebase Admin
        const decodedToken = await auth.verifyIdToken(token);

        // Attach user info to request
        req.firebaseUser = {
            uid: decodedToken.uid,
            email: decodedToken.email,
            emailVerified: decodedToken.email_verified,
        };

        next();
    } catch (error) {
        console.error('Token verification failed:', error);

        if (error.code === 'auth/id-token-expired') {
            return res.status(401).json({ error: 'Token expired' });
        }

        return res.status(401).json({ error: 'Invalid token' });
    }
};

/**
 * Optional authentication middleware
 * Verifies token if present, but allows request to continue if not
 */
export const optionalFirebaseAuth = async (req, res, next) => {
    try {
        const authHeader = req.headers.authorization;

        if (authHeader && authHeader.startsWith('Bearer ')) {
            const token = authHeader.split('Bearer ')[1];
            const decodedToken = await auth.verifyIdToken(token);

            req.firebaseUser = {
                uid: decodedToken.uid,
                email: decodedToken.email,
                emailVerified: decodedToken.email_verified,
            };
        }

        next();
    } catch (error) {
        // Token invalid, but continue anyway
        next();
    }
};
