import express from 'express';
import { authenticateToken } from '../middleware/auth.js';
import Streak from '../models/Streak.js';

const router = express.Router();

// Get streak data
router.get('/', authenticateToken, async (req, res) => {
    try {
        let streak = await Streak.findOne({ userId: req.user.userId });

        if (!streak) {
            // Create initial streak if doesn't exist
            streak = new Streak({ userId: req.user.userId });
            await streak.save();
        }

        res.json({
            currentStreak: streak.currentStreak,
            longestStreak: streak.longestStreak,
            totalDaysPracticed: streak.totalDaysPracticed,
            lastPracticeDate: streak.lastPracticeDate
        });
    } catch (error) {
        console.error('Get streak error:', error);
        res.status(500).json({ error: 'Failed to get streak' });
    }
});

export default router;
