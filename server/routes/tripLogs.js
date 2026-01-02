const express = require('express');
const TripLog = require('../models/TripLog');
const auth = require('../middleware/auth');

const router = express.Router();

// Complete a trip (create log entry)
router.post('/', auth, async (req, res) => {
    try {
        const { driverId, busId, routeId, date, shift, studentsCount, notes } = req.body;

        const tripDate = new Date(date);
        tripDate.setHours(0, 0, 0, 0);

        // Check if trip already completed for this date/shift
        const existing = await TripLog.findOne({
            driverId,
            date: tripDate,
            shift
        });

        if (existing) {
            return res.status(400).json({ message: 'Trip already completed for this shift' });
        }

        const tripLog = new TripLog({
            driverId,
            busId,
            routeId,
            date: tripDate,
            shift,
            completedAt: new Date(),
            studentsCount: studentsCount || 0,
            notes
        });

        await tripLog.save();
        res.status(201).json(tripLog);
    } catch (error) {
        console.error('Create trip log error:', error);
        res.status(500).json({ message: 'Server error' });
    }
});

// Get trip logs for a driver
router.get('/driver/:driverId', auth, async (req, res) => {
    try {
        const { driverId } = req.params;
        const { limit = 30 } = req.query;

        const logs = await TripLog.find({ driverId })
            .populate('busId', 'busNumber')
            .populate('routeId', 'name')
            .sort({ date: -1, shift: -1 })
            .limit(parseInt(limit));

        res.json(logs);
    } catch (error) {
        console.error('Get trip logs error:', error);
        res.status(500).json({ message: 'Server error' });
    }
});

// Get today's trip status for a driver
router.get('/driver/:driverId/today', auth, async (req, res) => {
    try {
        const { driverId } = req.params;

        const today = new Date();
        today.setHours(0, 0, 0, 0);

        const logs = await TripLog.find({
            driverId,
            date: today
        });

        const result = {
            morning: logs.find(l => l.shift === 'morning') || null,
            evening: logs.find(l => l.shift === 'evening') || null
        };

        res.json(result);
    } catch (error) {
        console.error('Get today trip status error:', error);
        res.status(500).json({ message: 'Server error' });
    }
});

module.exports = router;
