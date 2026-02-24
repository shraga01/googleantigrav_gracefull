import express from 'express';
import { authenticateToken } from '../middleware/auth.js';
import User from '../models/User.js';

const router = express.Router();

// Get user profile
router.get('/', authenticateToken, async (req, res) => {
    try {
        const user = await User.findOne({ userId: req.user.userId });

        if (!user) {
            return res.status(404).json({ error: 'User not found' });
        }

        res.json({
            userId: user.userId,
            language: user.language,
            name: user.name,
            gender: user.gender,
            familyStatus: user.familyStatus,
            career: user.career,
            livingSituation: user.livingSituation,
            joys: user.joys,
            challenges: user.challenges,
            dreams: user.dreams,
            goals: user.goals,
            unlockedBadges: user.unlockedBadges || [],
            createdAt: user.createdAt,
            isAnonymous: user.isAnonymous
        });
    } catch (error) {
        console.error('Get profile error:', error);
        res.status(500).json({ error: 'Failed to get profile' });
    }
});

// Update user profile
router.put('/', authenticateToken, async (req, res) => {
    try {
        const allowedFields = [
            'language', 'name', 'gender', 'familyStatus',
            'career', 'livingSituation', 'joys', 'challenges',
            'dreams', 'goals'
        ];

        const updates = {};
        allowedFields.forEach(field => {
            if (req.body[field] !== undefined) {
                updates[field] = req.body[field];
            }
        });

        const user = await User.findOneAndUpdate(
            { userId: req.user.userId },
            { $set: updates },
            { new: true, runValidators: true, upsert: true, setDefaultsOnInsert: true }
        );

        if (!user) {
            return res.status(404).json({ error: 'User not found' });
        }

        res.json({
            userId: user.userId,
            language: user.language,
            name: user.name,
            gender: user.gender,
            familyStatus: user.familyStatus,
            career: user.career,
            livingSituation: user.livingSituation,
            joys: user.joys,
            challenges: user.challenges,
            dreams: user.dreams,
            goals: user.goals,
            unlockedBadges: user.unlockedBadges || [],
            createdAt: user.createdAt,
            isAnonymous: user.isAnonymous
        });
    } catch (error) {
        console.error('Update profile error:', error);
        res.status(500).json({ error: 'Failed to update profile' });
    }
});

export default router;
