import express from 'express';
import cors from 'cors';
import dotenv from 'dotenv';
import mongoose from 'mongoose';
import authRoutes from './routes/auth.js';
import profileRoutes from './routes/profile.js';
import entryRoutes from './routes/entries.js';
import streakRoutes from './routes/streak.js';

dotenv.config();

const app = express();
const PORT = process.env.PORT || 3001;

// Allowed origins for CORS
const allowedOrigins = [
    'http://localhost:5173',                       // Local dev
    'https://daily-appreciation-app-dev.web.app',  // Firebase Hosting dev
    'https://daily-appreciation-app.web.app',      // Firebase Hosting prod
    'https://daily-appreciation-app-275bf.web.app' // Firebase default domain
];

// Middleware
app.use(cors({
    origin: function (origin, callback) {
        // Allow requests with no origin (like mobile apps or curl requests)
        if (!origin) return callback(null, true);

        if (allowedOrigins.indexOf(origin) !== -1) {
            callback(null, true);
        } else {
            console.log('CORS blocked origin:', origin);
            callback(new Error('Not allowed by CORS'));
        }
    },
    credentials: true
}));
app.use(express.json({ limit: '10mb' })); // Increased limit for audio blobs
app.use(express.urlencoded({ extended: true, limit: '10mb' }));

// MongoDB Connection
mongoose.connect(process.env.MONGODB_URI)
    .then(() => console.log('✅ Connected to MongoDB'))
    .catch((err) => console.error('❌ MongoDB connection error:', err));

// Routes
app.use('/api/auth', authRoutes);
app.use('/api/profile', profileRoutes);
app.use('/api/entries', entryRoutes);
app.use('/api/streak', streakRoutes);

// Health check
app.get('/health', (req, res) => {
    res.json({ status: 'ok', timestamp: new Date().toISOString() });
});

// Error handling middleware
app.use((err, req, res, next) => {
    console.error(err.stack);
    res.status(500).json({
        error: 'Something went wrong!',
        message: process.env.NODE_ENV === 'development' ? err.message : undefined
    });
});

// Start server
app.listen(PORT, () => {
    console.log(`🚀 Server running on http://localhost:${PORT}`);
});
