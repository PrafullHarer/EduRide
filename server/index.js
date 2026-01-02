require('dotenv').config();
const express = require('express');
const cors = require('cors');
const http = require('http');
const { Server } = require('socket.io');
const connectDB = require('./config/db');

// Import routes
const authRoutes = require('./routes/auth');
const studentRoutes = require('./routes/students');
const busRoutes = require('./routes/buses');
const routeRoutes = require('./routes/routes');
const driverRoutes = require('./routes/drivers');
const subscriptionRoutes = require('./routes/subscriptions');
const paymentRoutes = require('./routes/payments');
const analyticsRoutes = require('./routes/analytics');
const scheduleRoutes = require('./routes/schedules');
const trackingRoutes = require('./routes/tracking');
const dashboardRoutes = require('./routes/dashboard');
const messageRoutes = require('./routes/messages');

const app = express();
const server = http.createServer(app);

// Socket.IO setup
const io = new Server(server, {
    cors: {
        origin: ['http://localhost:8080', 'http://localhost:8081', 'http://localhost:5173'],
        methods: ['GET', 'POST']
    }
});

// Make io accessible to routes
app.set('io', io);

// Socket.IO connection handling
io.on('connection', (socket) => {
    console.log('Client connected:', socket.id);

    // Join room for specific bus tracking
    socket.on('subscribe-bus', (busId) => {
        socket.join(`bus-${busId}`);
        console.log(`Socket ${socket.id} subscribed to bus ${busId}`);
    });

    // Subscribe to all buses (for admin)
    socket.on('subscribe-all-buses', () => {
        socket.join('all-buses');
        console.log(`Socket ${socket.id} subscribed to all buses`);
    });

    socket.on('disconnect', () => {
        console.log('Client disconnected:', socket.id);
    });
});

// Connect to MongoDB
connectDB();

// Middleware
app.use(cors());
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
    res.json({ status: 'ok', message: 'School Bus Buddy API is running' });
});

const PORT = process.env.PORT || 5000;

server.listen(PORT, () => {
    console.log(`Server running on port ${PORT}`);
    console.log('Socket.IO ready for real-time tracking');
});
