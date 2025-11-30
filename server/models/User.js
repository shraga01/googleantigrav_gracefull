import mongoose from 'mongoose';

const userSchema = new mongoose.Schema({
    userId: {
        type: String,
        required: true,
        unique: true,
        index: true
    },
    isAnonymous: {
        type: Boolean,
        default: true
    },
    email: {
        type: String,
        sparse: true, // Allow null but enforce uniqueness when present
        lowercase: true,
        trim: true
    },
    passwordHash: {
        type: String,
        select: false // Don't include in queries by default
    },
    language: {
        type: String,
        enum: ['english', 'hebrew'],
        default: 'english'
    },
    name: String,
    gender: String,
    familyStatus: String,
    career: String,
    livingSituation: String,
    joys: String,
    challenges: String,
    dreams: String,
    goals: String,
    createdAt: {
        type: Number,
        default: () => Date.now()
    },
    lastActive: {
        type: Number,
        default: () => Date.now()
    }
}, {
    timestamps: true
});

// Update lastActive on any query
userSchema.pre('save', function (next) {
    this.lastActive = Date.now();
    next();
});

const User = mongoose.model('User', userSchema);

export default User;
