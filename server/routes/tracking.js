const express = require('express');
const Bus = require('../models/Bus');
const auth = require('../middleware/auth');

const router = express.Router();

// Update bus location (called by driver)
router.post('/location', auth, async (req, res) => {
    try {
        const { busId, lat, lng, heading, speed } = req.body;

        const bus = await Bus.findByIdAndUpdate(
            busId,
            {
                currentLocation: {
                    lat,
                    lng,
                    heading,
                    speed,
                    updatedAt: new Date()
                },
                isTracking: true
            },
            { new: true }
        );

        if (!bus) {
            return res.status(404).json({ message: 'Bus not found' });
        }

        // Emit to socket (handled by main server)
        if (req.app.get('io')) {
            req.app.get('io').emit('bus-location-update', {
                busId: bus._id,
                busNumber: bus.busNumber,
                location: bus.currentLocation
            });
        }

        res.json({ success: true, location: bus.currentLocation });
    } catch (error) {
        console.error('Location update error:', error);
        res.status(500).json({ message: 'Server error' });
    }
});

// Stop tracking
router.post('/stop', auth, async (req, res) => {
    try {
        const { busId } = req.body;

        await Bus.findByIdAndUpdate(busId, { isTracking: false });

        if (req.app.get('io')) {
            req.app.get('io').emit('bus-tracking-stopped', { busId });
        }

        res.json({ success: true });
    } catch (error) {
        res.status(500).json({ message: 'Server error' });
    }
});

// Get current location of a bus
router.get('/bus/:busId', auth, async (req, res) => {
    try {
        const bus = await Bus.findById(req.params.busId).select('busNumber currentLocation isTracking');
        if (!bus) {
            return res.status(404).json({ message: 'Bus not found' });
        }
        // Short cache for real-time data (10 seconds with 5s stale grace)
        res.set('Cache-Control', 's-maxage=10, stale-while-revalidate=5');
        res.json(bus);
    } catch (error) {
        res.status(500).json({ message: 'Server error' });
    }
});

// Get all buses with current locations
router.get('/all', auth, async (req, res) => {
    try {
        const buses = await Bus.find({ isTracking: true })
            .select('busNumber registrationNumber currentLocation isTracking routeId')
            .populate('routeId', 'name');
        res.json(buses);
    } catch (error) {
        res.status(500).json({ message: 'Server error' });
    }
});

module.exports = router;
