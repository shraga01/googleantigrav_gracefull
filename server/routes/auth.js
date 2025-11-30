import express from 'express';
import jwt from 'jsonwebtoken';
import bcrypt from 'bcryptjs';
import { v4 as uuidv4 } from 'uuid';
import User from '../models/User.js';
import Streak from '../models/Streak.js';

const router = express.Router();

// Generate JWT token
const generateToken = (userId, isAnonymous = true) => {
    return jwt.sign(
        { userId, isAnonymous },
        process.env.JWT_SECRET,
        { expiresIn: '30d' }
    );
};

// Create anonymous user
router.post('/anonymous', async (req, res) => {
    try {
        const userId = uuidv4();
        const { language = 'english' } = req.body;

        const user = new User({
            userId,
            isAnonymous: true,
            language
        });

        await user.save();

        // Create initial streak record
        const streak = new Streak({ userId });
        await streak.save();

        const token = generateToken(userId, true);

        res.status(201).json({
            token,
            user: {
                userId: user.userId,
                language: user.language,
                isAnonymous: true,
                createdAt: user.createdAt
            }
        });
    } catch (error) {
        console.error('Anonymous user creation error:', error);
        res.status(500).json({ error: 'Failed to create anonymous user' });
    }
});

// Register with email/password
router.post('/register', async (req, res) => {
    try {
        const { email, password, language = 'english' } = req.body;

        if (!email || !password) {
            return res.status(400).json({ error: 'Email and password required' });
        }

        // Check if user exists
        const existingUser = await User.findOne({ email });
        if (existingUser) {
            return res.status(400).json({ error: 'Email already registered' });
        }

        const userId = uuidv4();
        const passwordHash = await bcrypt.hash(password, 10);

        const user = new User({
            userId,
            email,
            passwordHash,
            language,
            isAnonymous: false
        });

        await user.save();

        // Create initial streak record
        const streak = new Streak({ userId });
        await streak.save();

        const token = generateToken(userId, false);

        res.status(201).json({
            token,
            user: {
                userId: user.userId,
                email: user.email,
                language: user.language,
                isAnonymous: false,
                createdAt: user.createdAt
            }
        });
    } catch (error) {
        console.error('Registration error:', error);
        res.status(500).json({ error: 'Failed to register user' });
    }
});

// Login with email/password
router.post('/login', async (req, res) => {
    try {
        const { email, password } = req.body;

        if (!email || !password) {
            return res.status(400).json({ error: 'Email and password required' });
        }

        const user = await User.findOne({ email }).select('+passwordHash');
        if (!user) {
            return res.status(401).json({ error: 'Invalid credentials' });
        }

        const isValidPassword = await bcrypt.compare(password, user.passwordHash);
        if (!isValidPassword) {
            return res.status(401).json({ error: 'Invalid credentials' });
        }

        const token = generateToken(user.userId, user.isAnonymous);

        res.json({
            token,
            user: {
                userId: user.userId,
                email: user.email,
                language: user.language,
                isAnonymous: user.isAnonymous,
                createdAt: user.createdAt
            }
        });
    } catch (error) {
        console.error('Login error:', error);
        res.status(500).json({ error: 'Failed to login' });
    }
});

export default router;
