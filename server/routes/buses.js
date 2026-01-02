const express = require('express');
const Bus = require('../models/Bus');
const Driver = require('../models/Driver');
const auth = require('../middleware/auth');

const router = express.Router();

// Get all buses
router.get('/', auth, async (req, res) => {
    try {
        const buses = await Bus.find().populate('driverId routeId');
        res.json(buses);
    } catch (error) {
        res.status(500).json({ message: 'Server error' });
    }
});

// Get bus by ID
router.get('/:id', auth, async (req, res) => {
    try {
        const bus = await Bus.findById(req.params.id).populate('driverId routeId');
        if (!bus) {
            return res.status(404).json({ message: 'Bus not found' });
        }
        res.json(bus);
    } catch (error) {
        res.status(500).json({ message: 'Server error' });
    }
});

// Create bus
router.post('/', auth, async (req, res) => {
    try {
        const bus = new Bus(req.body);
        await bus.save();

        // Sync Driver
        if (bus.driverId) {
            await Driver.findByIdAndUpdate(bus.driverId, { busId: bus._id });
        }

        res.status(201).json(bus);
    } catch (error) {
        res.status(500).json({ message: 'Server error' });
    }
});

// Update bus
router.put('/:id', auth, async (req, res) => {
    try {
        const { driverId } = req.body;

        // Handle Driver Sync if driverId is being changed
        if (driverId !== undefined) {
            const oldBus = await Bus.findById(req.params.id);
            if (oldBus) {
                // If removing driver or changing driver
                if (oldBus.driverId && oldBus.driverId.toString() !== driverId) {
                    await Driver.findByIdAndUpdate(oldBus.driverId, { busId: null });
                }

                // If adding new driver
                if (driverId) {
                    await Driver.findByIdAndUpdate(driverId, { busId: req.params.id });
                }
            }
        }

        const bus = await Bus.findByIdAndUpdate(req.params.id, req.body, { new: true });
        if (!bus) {
            return res.status(404).json({ message: 'Bus not found' });
        }
        res.json(bus);
    } catch (error) {
        console.error('Update Bus Error:', error);
        res.status(500).json({ message: 'Server error' });
    }
});

// Delete bus
router.delete('/:id', auth, async (req, res) => {
    try {
        const bus = await Bus.findByIdAndDelete(req.params.id);
        if (!bus) {
            return res.status(404).json({ message: 'Bus not found' });
        }

        // Clear driver association
        if (bus.driverId) {
            await Driver.findByIdAndUpdate(bus.driverId, { busId: null });
        }

        res.json({ message: 'Bus deleted' });
    } catch (error) {
        res.status(500).json({ message: 'Server error' });
    }
});

module.exports = router;
