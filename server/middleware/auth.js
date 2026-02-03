import admin from 'firebase-admin';

// Initialize Firebase Admin SDK
// When running on Cloud Run, it automatically uses the default credentials
if (!admin.apps.length) {
    admin.initializeApp({
        projectId: 'daily-appreciation-app-275bf'
    });
}

export const authenticateToken = async (req, res, next) => {
    const authHeader = req.headers['authorization'];
    const token = authHeader && authHeader.split(' ')[1]; // Bearer TOKEN

    if (!token) {
        console.log('Auth: No token provided');
        return res.status(401).json({ error: 'Access token required' });
    }

    try {
        // Verify Firebase ID token
        const decodedToken = await admin.auth().verifyIdToken(token);
        req.user = {
            userId: decodedToken.uid,
            email: decodedToken.email,
            isAnonymous: decodedToken.firebase?.sign_in_provider === 'anonymous'
        };
        console.log('Auth: Token verified for user:', decodedToken.uid);
        next();
    } catch (error) {
        console.error('Auth: Token verification failed:', error.message);
        return res.status(403).json({ error: 'Invalid or expired token' });
    }
};
