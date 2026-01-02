const express = require('express');
const Route = require('../models/Route');
const auth = require('../middleware/auth');

const router = express.Router();

// Get all routes
router.get('/', auth, async (req, res) => {
    try {
        const routes = await Route.find().populate('busId');
        res.json(routes);
    } catch (error) {
        res.status(500).json({ message: 'Server error' });
    }
});

// Get route by ID
router.get('/:id', auth, async (req, res) => {
    try {
        const route = await Route.findById(req.params.id).populate('busId');
        if (!route) {
            return res.status(404).json({ message: 'Route not found' });
        }
        res.json(route);
    } catch (error) {
        res.status(500).json({ message: 'Server error' });
    }
});

// Create route
router.post('/', auth, async (req, res) => {
    try {
        console.log('Creating route with data:', JSON.stringify(req.body, null, 2));
        const route = new Route(req.body);
        await route.save();
        res.status(201).json(route);
    } catch (error) {
        console.error('Route creation error:', error);
        res.status(500).json({ message: error.message || 'Server error' });
    }
});

// Update route
router.put('/:id', auth, async (req, res) => {
    try {
        const route = await Route.findByIdAndUpdate(req.params.id, req.body, { new: true });
        if (!route) {
            return res.status(404).json({ message: 'Route not found' });
        }
        res.json(route);
    } catch (error) {
        res.status(500).json({ message: 'Server error' });
    }
});

// Delete route
router.delete('/:id', auth, async (req, res) => {
    try {
        const route = await Route.findByIdAndDelete(req.params.id);
        if (!route) {
            return res.status(404).json({ message: 'Route not found' });
        }
        res.json({ message: 'Route deleted' });
    } catch (error) {
        res.status(500).json({ message: 'Server error' });
    }
});

module.exports = router;
