const express = require('express');
const DutySchedule = require('../models/DutySchedule');
const auth = require('../middleware/auth');

const router = express.Router();

// Get all schedules
router.get('/', auth, async (req, res) => {
    try {
        const schedules = await DutySchedule.find().populate('driverId').sort({ date: -1 });
        res.json(schedules);
    } catch (error) {
        res.status(500).json({ message: 'Server error' });
    }
});

// Get today's schedule for a driver
router.get('/today/:driverId', auth, async (req, res) => {
    try {
        const today = new Date();
        today.setHours(0, 0, 0, 0);
        const tomorrow = new Date(today);
        tomorrow.setDate(tomorrow.getDate() + 1);

        const schedule = await DutySchedule.findOne({
            driverId: req.params.driverId,
            date: { $gte: today, $lt: tomorrow }
        });
        res.json(schedule);
    } catch (error) {
        res.status(500).json({ message: 'Server error' });
    }
});

// Create schedule
router.post('/', auth, async (req, res) => {
    try {
        const schedule = new DutySchedule(req.body);
        await schedule.save();
        res.status(201).json(schedule);
    } catch (error) {
        res.status(500).json({ message: 'Server error' });
    }
});

// Update schedule (for starting/completing trips)
router.put('/:id', auth, async (req, res) => {
    try {
        const schedule = await DutySchedule.findByIdAndUpdate(req.params.id, req.body, { new: true });
        if (!schedule) {
            return res.status(404).json({ message: 'Schedule not found' });
        }
        res.json(schedule);
    } catch (error) {
        res.status(500).json({ message: 'Server error' });
    }
});

module.exports = router;
