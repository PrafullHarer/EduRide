// Vercel serverless function wrapper for Express app
// Simplified pattern - connect DB at module load, export app directly

import 'dotenv/config';
import { createRequire } from 'module';

const require = createRequire(import.meta.url);

// Set default JWT_SECRET if not provided
if (!process.env.JWT_SECRET) {
    process.env.JWT_SECRET = 'your-secret-key-change-in-production';
    console.warn('Warning: JWT_SECRET not set, using default.');
}

// Import and connect DB at module load (not per-request)
const connectDB = require('../server/config/db');
connectDB(); // Connect immediately when module loads

import express from 'express';
import cors from 'cors';

// Import routes
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

// Export app directly for Vercel serverless function (simpler, faster pattern)
export default app;
