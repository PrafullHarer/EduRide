// Vercel serverless function wrapper for Express app
require('dotenv').config();

// Set default JWT_SECRET if not provided
if (!process.env.JWT_SECRET) {
    process.env.JWT_SECRET = process.env.JWT_SECRET || 'your-secret-key-change-in-production';
    console.warn('Warning: JWT_SECRET not set, using default. Set JWT_SECRET in Vercel environment variables.');
}

const express = require('express');
const cors = require('cors');
const connectDB = require('../server/config/db');

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
module.exports = async (req, res) => {
    try {
        // Connect to DB (connection is cached for serverless)
        await initDB();
        
        // Handle the request with Express
        app(req, res);
    } catch (error) {
        console.error('Server error:', error);
        if (!res.headersSent) {
            res.status(500).json({ 
                message: 'Internal server error',
                error: process.env.NODE_ENV === 'development' ? error.message : undefined
            });
        }
    }
};

