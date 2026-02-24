import express from 'express';
import { authenticateToken } from '../middleware/auth.js';
import Streak from '../models/Streak.js';
import User from '../models/User.js';

const router = express.Router();

const BADGES = [
    { code: 'first_step', condition: (streak) => streak.totalDaysPracticed >= 1 },
    { code: 'week_champion', condition: (streak) => streak.currentStreak >= 7 },
    { code: 'streak_14', condition: (streak) => streak.currentStreak >= 14 },
    { code: 'streak_21', condition: (streak) => streak.currentStreak >= 21 },
    { code: 'streak_28', condition: (streak) => streak.currentStreak >= 28 },
    { code: 'milestone_10', condition: (streak) => streak.totalDaysPracticed >= 10 },
    { code: 'milestone_25', condition: (streak) => streak.totalDaysPracticed >= 25 },
    { code: 'milestone_50', condition: (streak) => streak.totalDaysPracticed >= 50 },
    { code: 'milestone_100', condition: (streak) => streak.totalDaysPracticed >= 100 },
];

async function evaluateBadges(userId, streakParams) {
    const user = await User.findOne({ userId });
    if (!user) return { newlyUnlocked: [], allUnlocked: [] };

    // Initialize array if undefined
    if (!user.unlockedBadges) {
        user.unlockedBadges = [];
    }

    const currentBadges = user.unlockedBadges.map(b => b.code);
    const newlyUnlocked = [];

    for (const badge of BADGES) {
        if (!currentBadges.includes(badge.code) && badge.condition(streakParams)) {
            newlyUnlocked.push(badge.code);
            user.unlockedBadges.push({ code: badge.code, awardedAt: Date.now() });
        }
    }

    if (newlyUnlocked.length > 0) {
        await user.save();
    }

    return {
        newlyUnlocked,
        allUnlocked: user.unlockedBadges
    };
}

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
            const badgeEvaluation = await evaluateBadges(req.user.userId, streak);
            return res.json({
                success: true,
                message: 'Already practiced today',
                streak: {
                    currentStreak: streak.currentStreak,
                    longestStreak: streak.longestStreak,
                    totalDaysPracticed: streak.totalDaysPracticed,
                    practiceDates: streak.practiceDates || []
                },
                newBadges: badgeEvaluation.newlyUnlocked,
                allBadges: badgeEvaluation.allUnlocked
            });
        }

        streak.updateStreak(date);
        await streak.save();

        const badgeEvaluation = await evaluateBadges(req.user.userId, streak);

        res.status(201).json({
            success: true,
            message: 'Entry recorded (content not stored for privacy)',
            streak: {
                currentStreak: streak.currentStreak,
                longestStreak: streak.longestStreak,
                totalDaysPracticed: streak.totalDaysPracticed,
                practiceDates: streak.practiceDates || []
            },
            newBadges: badgeEvaluation.newlyUnlocked,
            allBadges: badgeEvaluation.allUnlocked
        });
    } catch (error) {
        console.error('Record entry error:', error);
        res.status(500).json({ error: 'Failed to record entry' });
    }
});

export default router;

