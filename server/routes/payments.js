const express = require('express');
const Payment = require('../models/Payment');
const Subscription = require('../models/Subscription');
const auth = require('../middleware/auth');

const router = express.Router();

// Get all payments
router.get('/', auth, async (req, res) => {
    try {
        const payments = await Payment.find().populate('studentId subscriptionId').sort({ date: -1 });
        res.json(payments);
    } catch (error) {
        res.status(500).json({ message: 'Server error' });
    }
});

// Get payments by student ID
router.get('/student/:studentId', auth, async (req, res) => {
    try {
        const payments = await Payment.find({ studentId: req.params.studentId }).sort({ date: -1 });
        res.json(payments);
    } catch (error) {
        res.status(500).json({ message: 'Server error' });
    }
});

// Get payment by ID
router.get('/:id', auth, async (req, res) => {
    try {
        const payment = await Payment.findById(req.params.id).populate('studentId subscriptionId');
        if (!payment) {
            return res.status(404).json({ message: 'Payment not found' });
        }
        res.json(payment);
    } catch (error) {
        res.status(500).json({ message: 'Server error' });
    }
});

// Create payment and update subscription
router.post('/', auth, async (req, res) => {
    try {
        const payment = new Payment(req.body);
        await payment.save();

        // Update subscription status to paid
        if (payment.status === 'success' && payment.subscriptionId) {
            await Subscription.findByIdAndUpdate(payment.subscriptionId, {
                status: 'paid',
                paidDate: new Date()
            });
        }

        res.status(201).json(payment);
    } catch (error) {
        res.status(500).json({ message: 'Server error' });
    }
});

// Update payment
router.put('/:id', auth, async (req, res) => {
    try {
        const payment = await Payment.findByIdAndUpdate(req.params.id, req.body, { new: true });
        if (!payment) {
            return res.status(404).json({ message: 'Payment not found' });
        }
        res.json(payment);
    } catch (error) {
        res.status(500).json({ message: 'Server error' });
    }
});

module.exports = router;
