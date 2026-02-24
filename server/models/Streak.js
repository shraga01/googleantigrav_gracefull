import mongoose from 'mongoose';

const streakSchema = new mongoose.Schema({
    userId: {
        type: String,
        required: true,
        unique: true,
        index: true
    },
    currentStreak: {
        type: Number,
        default: 0
    },
    longestStreak: {
        type: Number,
        default: 0
    },
    totalDaysPracticed: {
        type: Number,
        default: 0
    },
    practiceDates: {
        type: [String], // Array of YYYY-MM-DD strings
        default: []
    },
    lastPracticeDate: {
        type: String, // Format: YYYY-MM-DD
        default: null
    }
}, {
    timestamps: true
});

// Method to update streak after new entry
streakSchema.methods.updateStreak = function (newEntryDate) {
    if (!this.practiceDates) {
        this.practiceDates = [];
    }

    // Only add if not already in the array
    if (!this.practiceDates.includes(newEntryDate)) {
        this.practiceDates.push(newEntryDate);
        this.totalDaysPracticed += 1;
        this.lastPracticeDate = newEntryDate;

        // Keep array sorted chronologically
        this.practiceDates.sort();

        // Calculate legacy streaks just to maintain backwards compatibility 
        // with old frontend hooks until they are fully migrated
        const today = new Date(newEntryDate);
        const lastDate = this.lastPracticeDate ? new Date(this.lastPracticeDate) : null;

        if (!lastDate || this.practiceDates.length === 1) {
            this.currentStreak = 1;
            this.longestStreak = 1;
        } else {
            const daysDiff = Math.floor((today - lastDate) / (1000 * 60 * 60 * 24));
            if (daysDiff === 1) {
                this.currentStreak += 1;
                this.longestStreak = Math.max(this.longestStreak, this.currentStreak);
            } else if (daysDiff > 1) {
                this.currentStreak = 1;
            }
        }
    }

    return this;
};

const Streak = mongoose.model('Streak', streakSchema);

export default Streak;
