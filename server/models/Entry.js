import mongoose from 'mongoose';

const entrySchema = new mongoose.Schema({
    entryId: {
        type: String,
        required: true,
        unique: true,
        index: true
    },
    userId: {
        type: String,
        required: true,
        index: true
    },
    date: {
        type: String, // Format: YYYY-MM-DD
        required: true,
        index: true
    },
    openingSentence: {
        type: String,
        required: true
    },
    suggestions: [{
        type: String
    }],
    userContent: {
        type: {
            type: String,
            enum: ['text', 'audio'],
            required: true
        },
        content: {
            type: String, // Text or base64 audio
            required: true
        },
        duration: Number // For audio entries
    },
    completedAt: {
        type: Number,
        required: true
    },
    streakDay: {
        type: Number,
        required: true
    }
}, {
    timestamps: true
});

// Compound index for efficient user + date queries
entrySchema.index({ userId: 1, date: -1 });

const Entry = mongoose.model('Entry', entrySchema);

export default Entry;
