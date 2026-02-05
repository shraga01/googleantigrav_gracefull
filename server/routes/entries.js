import express from 'express';
import { authenticateToken } from '../middleware/auth.js';
import Entry from '../models/Entry.js';
import Streak from '../models/Streak.js';

const router = express.Router();

// Get all entries for user
router.get('/', authenticateToken, async (req, res) => {
    try {
        const entries = await Entry.find({ userId: req.user.userId })
            .sort({ date: -1 })
            .lean();

        res.json(entries);
    } catch (error) {
        console.error('Get entries error:', error);
        res.status(500).json({ error: 'Failed to get entries' });
    }
});

// Get entry by date
router.get('/:date', authenticateToken, async (req, res) => {
    try {
        const entry = await Entry.findOne({
            userId: req.user.userId,
            date: req.params.date
        }).lean();

        if (!entry) {
            return res.status(404).json({ error: 'Entry not found' });
        }

        res.json(entry);
    } catch (error) {
        console.error('Get entry error:', error);
        res.status(500).json({ error: 'Failed to get entry' });
    }
});

// Create new entry
router.post('/', authenticateToken, async (req, res) => {
    try {
        const {
            entryId,
            date,
            openingSentence,
            suggestions,
            userContent,
            completedAt,
            streakDay
        } = req.body;

        // Validate required fields
        if (!entryId || !date || !openingSentence || !userContent) {
            return res.status(400).json({ error: 'Missing required fields' });
        }

        // Check if entry already exists for this date
        const existingEntry = await Entry.findOne({
            userId: req.user.userId,
            date
        });

        if (existingEntry) {
            return res.status(400).json({ error: 'Entry already exists for this date' });
        }

        // Update streak FIRST to get the correct streakDay for this entry
        let streak = await Streak.findOne({ userId: req.user.userId });
        if (!streak) {
            streak = new Streak({ userId: req.user.userId });
        }

        streak.updateStreak(date);
        await streak.save();

        const entry = new Entry({
            entryId,
            userId: req.user.userId,
            date,
            openingSentence,
            suggestions,
            userContent,
            completedAt,
            streakDay: streak.currentStreak // Use the updated streak from server
        });

        await entry.save();

        res.status(201).json(entry);
    } catch (error) {
        console.error('Create entry error:', error);
        res.status(500).json({ error: 'Failed to create entry' });
    }
});

export default router;
