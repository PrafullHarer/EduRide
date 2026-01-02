// Vercel serverless function wrapper for Express app
import 'dotenv/config';
import { createRequire } from 'module';

const require = createRequire(import.meta.url);

// Set default JWT_SECRET if not provided
if (!process.env.JWT_SECRET) {
    process.env.JWT_SECRET = 'your-secret-key-change-in-production';
    console.warn('Warning: JWT_SECRET not set, using default.');
}

import express from 'express';
import cors from 'cors';

// Import DB and routes
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
const dashboardRoutes = require('../server/routes/dashboard');
const messageRoutes = require('../server/routes/messages');

const app = express();

// Middleware
app.use(cors({
    origin: process.env.FRONTEND_URL || '*',
    credentials: true
}));
app.use(express.json());

// Routes
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
app.use('/api/dashboard', dashboardRoutes);
app.use('/api/messages', messageRoutes);

// Health check
app.get('/api/health', (req, res) => {
    res.json({ status: 'ok', message: 'EduRide API is running' });
});

// Error handling middleware
app.use((err, req, res, next) => {
    console.error('Express error:', err);
    res.status(err.status || 500).json({
        message: err.message || 'Internal server error'
    });
});

// Cache DB connection promise
let dbPromise = null;

// Vercel serverless handler - must be async to properly handle DB connection
export default async function handler(req, res) {
    // Ultra-fast health check - bypasses DB and Express for warm-start pinging
    // This responds in ~50ms instead of ~2s on cold start
    if (req.url === '/api/health' && req.method === 'GET') {
        res.setHeader('Cache-Control', 'no-cache, no-store, must-revalidate');
        return res.status(200).json({
            status: 'ok',
            timestamp: Date.now(),
            message: 'EduRide API is healthy'
        });
    }

    // Connect to DB once (cached)
    if (!dbPromise) {
        dbPromise = connectDB();
    }
    await dbPromise;

    // Handle request with Express
    return app(req, res);
}
