const express = require('express');
const Subscription = require('../models/Subscription');
const auth = require('../middleware/auth');

const router = express.Router();

// Get all subscriptions
router.get('/', auth, async (req, res) => {
    try {
        const subscriptions = await Subscription.find().populate('studentId');
        res.json(subscriptions);
    } catch (error) {
        res.status(500).json({ message: 'Server error' });
    }
});

// Get subscriptions by student ID
router.get('/student/:studentId', auth, async (req, res) => {
    try {
        const subscriptions = await Subscription.find({ studentId: req.params.studentId }).sort({ year: -1, month: -1 });
        // Cache for 2 minutes - subscription data changes infrequently
        res.set('Cache-Control', 's-maxage=120, stale-while-revalidate=30');
        res.json(subscriptions);
    } catch (error) {
        res.status(500).json({ message: 'Server error' });
    }
});

// Get subscription by ID
router.get('/:id', auth, async (req, res) => {
    try {
        const subscription = await Subscription.findById(req.params.id).populate('studentId');
        if (!subscription) {
            return res.status(404).json({ message: 'Subscription not found' });
        }
        res.json(subscription);
    } catch (error) {
        res.status(500).json({ message: 'Server error' });
    }
});

// Create subscription
router.post('/', auth, async (req, res) => {
    try {
        const subscription = new Subscription(req.body);
        await subscription.save();
        res.status(201).json(subscription);
    } catch (error) {
        res.status(500).json({ message: 'Server error' });
    }
});

// Update subscription
router.put('/:id', auth, async (req, res) => {
    try {
        const subscription = await Subscription.findByIdAndUpdate(req.params.id, req.body, { new: true });
        if (!subscription) {
            return res.status(404).json({ message: 'Subscription not found' });
        }
        res.json(subscription);
    } catch (error) {
        res.status(500).json({ message: 'Server error' });
    }
});

// Delete subscription
router.delete('/:id', auth, async (req, res) => {
    try {
        const subscription = await Subscription.findByIdAndDelete(req.params.id);
        if (!subscription) {
            return res.status(404).json({ message: 'Subscription not found' });
        }
        res.json({ message: 'Subscription deleted' });
    } catch (error) {
        res.status(500).json({ message: 'Server error' });
    }
});

module.exports = router;
