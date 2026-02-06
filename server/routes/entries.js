import express from 'express';
import { authenticateToken } from '../middleware/auth.js';
import Streak from '../models/Streak.js';

const router = express.Router();

// Get entries - returns empty (entries are not stored for privacy)
router.get('/', authenticateToken, async (req, res) => {
    // Entries are not stored on server for privacy
    // Frontend uses local storage only
    res.json([]);
});

// Get entry by date - returns 404 (entries are not stored)
router.get('/:date', authenticateToken, async (req, res) => {
    // Entries are not stored on server for privacy
    res.status(404).json({ error: 'Entries are stored locally only for privacy' });
});

// Record entry completion - only updates streak, does NOT save entry content
router.post('/', authenticateToken, async (req, res) => {
    try {
        const { date } = req.body;

        if (!date) {
            return res.status(400).json({ error: 'Date is required' });
        }

        // Update streak only (no entry content saved for privacy)
        let streak = await Streak.findOne({ userId: req.user.userId });
        if (!streak) {
            streak = new Streak({ userId: req.user.userId });
        }

        // Check if already practiced today
        if (streak.lastPracticeDate === date) {
            return res.json({
                success: true,
                message: 'Already practiced today',
                streak: {
                    currentStreak: streak.currentStreak,
                    longestStreak: streak.longestStreak,
                    totalDaysPracticed: streak.totalDaysPracticed
                }
            });
        }

        streak.updateStreak(date);
        await streak.save();

        res.status(201).json({
            success: true,
            message: 'Entry recorded (content not stored for privacy)',
            streak: {
                currentStreak: streak.currentStreak,
                longestStreak: streak.longestStreak,
                totalDaysPracticed: streak.totalDaysPracticed
            }
        });
    } catch (error) {
        console.error('Record entry error:', error);
        res.status(500).json({ error: 'Failed to record entry' });
    }
});

export default router;

