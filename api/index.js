// Vercel serverless function wrapper for Express app
require('dotenv').config();
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
    res.json({ status: 'ok', message: 'School Bus Buddy API is running' });
});

// Vercel serverless function handler
module.exports = async (req, res) => {
    try {
        // Connect to DB (connection is cached for serverless)
        await connectDB();
        
        // Handle the request with Express
        return app(req, res);
    } catch (error) {
        console.error('Server error:', error);
        return res.status(500).json({ message: 'Internal server error' });
    }
};

