// Vercel serverless function wrapper for Express app
import 'dotenv/config';
import { createRequire } from 'module';

// Create require function for CommonJS modules in server/
const require = createRequire(import.meta.url);

// Set default JWT_SECRET if not provided
if (!process.env.JWT_SECRET) {
    process.env.JWT_SECRET = 'your-secret-key-change-in-production';
    console.warn('Warning: JWT_SECRET not set, using default. Set JWT_SECRET in Vercel environment variables.');
}

import express from 'express';
import cors from 'cors';

// Import CommonJS modules from server directory using require
const connectDB = require('../server/config/db');
const authRoutes = require('../server/routes/auth');
const studentRoutes = require('../server/routes/students');
const busRoutes = require('../server/routes/buses');
const routeRoutes = require('../server/routes/routes');
const driverRoutes = require('../server/routes/drivers');
const subscriptionRoutes = require('../server/routes/subscriptions');
const paymentRoutes = require('../server/routes/payments');
const analyticsRoutes = require('../server/routes/analytics');
const scheduleRoutes = require('../server/routes/schedules');
const trackingRoutes = require('../server/routes/tracking');

const app = express();

// Middleware
app.use(cors({
    origin: process.env.FRONTEND_URL || '*',
    credentials: true
}));
app.use(express.json());

// Routes - Vercel rewrite preserves the /api prefix
app.use('/api/auth', authRoutes);
app.use('/api/students', studentRoutes);
app.use('/api/buses', busRoutes);
app.use('/api/routes', routeRoutes);
app.use('/api/drivers', driverRoutes);
app.use('/api/subscriptions', subscriptionRoutes);
app.use('/api/payments', paymentRoutes);
app.use('/api/analytics', analyticsRoutes);
app.use('/api/schedules', scheduleRoutes);
app.use('/api/tracking', trackingRoutes);

// Health check
app.get('/api/health', (req, res) => {
    res.json({ status: 'ok', message: 'School Bus Buddy API is running' });
});

// Error handling middleware
app.use((err, req, res, next) => {
    console.error('Express error:', err);
    res.status(err.status || 500).json({
        message: err.message || 'Internal server error',
        ...(process.env.NODE_ENV === 'development' && { stack: err.stack })
    });
});

// Initialize DB connection once
let dbInitPromise = null;
const initDB = async () => {
    if (!dbInitPromise) {
        dbInitPromise = connectDB().catch(err => {
            console.error('DB connection error:', err);
            dbInitPromise = null; // Reset on error to allow retry
            throw err;
        });
    }
    return dbInitPromise;
};

// Vercel serverless function handler
export default async function handler(req, res) {
    try {
        // Log incoming request for debugging
        console.log(`[API] ${req.method} ${req.url}`);

        // Check environment variables
        if (!process.env.MONGODB_URI) {
            console.error('MONGODB_URI is not set!');
            return res.status(500).json({ message: 'Server configuration error: MONGODB_URI missing' });
        }

        // Connect to DB (connection is cached for serverless)
        await initDB();

        // Handle the request with Express
        app(req, res);
    } catch (error) {
        console.error('Server error:', error.message, error.stack);
        if (!res.headersSent) {
            res.status(500).json({
                message: 'Internal server error',
                error: error.message,
                hint: 'Check Vercel logs for details'
            });
        }
    }
}
