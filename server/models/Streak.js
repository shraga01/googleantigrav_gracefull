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
    lastPracticeDate: {
        type: String, // Format: YYYY-MM-DD
        default: null
    }
}, {
    timestamps: true
});

// Method to update streak after new entry
streakSchema.methods.updateStreak = function (newEntryDate) {
    const today = new Date(newEntryDate);
    const lastDate = this.lastPracticeDate ? new Date(this.lastPracticeDate) : null;

    if (!lastDate) {
        // First entry
        this.currentStreak = 1;
        this.longestStreak = 1;
        this.totalDaysPracticed = 1;
    } else {
        const daysDiff = Math.floor((today - lastDate) / (1000 * 60 * 60 * 24));

        if (daysDiff === 1) {
            // Consecutive day
            this.currentStreak += 1;
            this.longestStreak = Math.max(this.longestStreak, this.currentStreak);
        } else if (daysDiff > 1) {
            // Streak broken
            this.currentStreak = 1;
        }
        // If daysDiff === 0, same day, don't increment

        if (daysDiff >= 1) {
            this.totalDaysPracticed += 1;
        }
    }

    this.lastPracticeDate = newEntryDate;
    return this;
};

const Streak = mongoose.model('Streak', streakSchema);

export default Streak;
