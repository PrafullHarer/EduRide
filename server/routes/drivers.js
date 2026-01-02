const express = require('express');
const Driver = require('../models/Driver');
const DutySchedule = require('../models/DutySchedule');
const auth = require('../middleware/auth');

const router = express.Router();

// Get all drivers
router.get('/', auth, async (req, res) => {
    try {
        const drivers = await Driver.find().populate('busId');
        res.json(drivers);
    } catch (error) {
        res.status(500).json({ message: 'Server error' });
    }
});

// Get driver by ID
router.get('/:id', auth, async (req, res) => {
    try {
        const driver = await Driver.findById(req.params.id).populate('busId');
        if (!driver) {
            return res.status(404).json({ message: 'Driver not found' });
        }
        res.json(driver);
    } catch (error) {
        res.status(500).json({ message: 'Server error' });
    }
});

// Get driver by user ID
router.get('/user/:userId', auth, async (req, res) => {
    try {
        const driver = await Driver.findOne({ userId: req.params.userId }).populate('busId');
        if (!driver) {
            return res.status(404).json({ message: 'Driver not found' });
        }
        res.json(driver);
    } catch (error) {
        res.status(500).json({ message: 'Server error' });
    }
});

// Get driver duty schedules
router.get('/:id/schedules', auth, async (req, res) => {
    try {
        const schedules = await DutySchedule.find({ driverId: req.params.id }).sort({ date: -1 });
        res.json(schedules);
    } catch (error) {
        res.status(500).json({ message: 'Server error' });
    }
});

// Create driver
router.post('/', auth, async (req, res) => {
    try {
        const driver = new Driver(req.body);
        await driver.save();
        res.status(201).json(driver);
    } catch (error) {
        res.status(500).json({ message: 'Server error' });
    }
});

// Update driver
router.put('/:id', auth, async (req, res) => {
    try {
        const driver = await Driver.findByIdAndUpdate(req.params.id, req.body, { new: true });
        if (!driver) {
            return res.status(404).json({ message: 'Driver not found' });
        }
        res.json(driver);
    } catch (error) {
        res.status(500).json({ message: 'Server error' });
    }
});

// Delete driver
router.delete('/:id', auth, async (req, res) => {
    try {
        const driver = await Driver.findByIdAndDelete(req.params.id);
        if (!driver) {
            return res.status(404).json({ message: 'Driver not found' });
        }
        res.json({ message: 'Driver deleted' });
    } catch (error) {
        res.status(500).json({ message: 'Server error' });
    }
});

module.exports = router;
