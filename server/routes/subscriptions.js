const express = require('express');
const Student = require('../models/Student');
const Subscription = require('../models/Subscription');
const auth = require('../middleware/auth');

const router = express.Router();

// ... (existing routes)

// Generate bill for a student
router.post('/generate', auth, async (req, res) => {
    try {
        const { studentId, month, year } = req.body;
        const student = await Student.findById(studentId);
        if (!student) return res.status(404).json({ message: 'Student not found' });

        // Check if already exists
        const existing = await Subscription.findOne({ studentId, month, year });
        if (existing) {
            return res.status(400).json({ message: 'Bill already generated for this month' });
        }

        const pricePerKm = 150; // Fixed rate as per dashboard.js logic
        const totalAmount = Math.round((student.distanceKm || 0) * pricePerKm);

        // Default Due Date: 7 days from now
        const dueDate = new Date();
        dueDate.setDate(dueDate.getDate() + 7);

        const subscription = new Subscription({
            studentId,
            month,
            year,
            distanceKm: student.distanceKm || 0,
            pricePerKm,
            totalAmount,
            status: 'pending',
            dueDate
        });

        await subscription.save();
        res.status(201).json(subscription);
    } catch (error) {
        console.error('Generate Bill Error:', error);
        res.status(500).json({ message: 'Server error' });
    }
});

// Generate bills for ALL active students
router.post('/generate-all', auth, async (req, res) => {
    try {
        const { month, year } = req.body;
        // Find students who are active OR have no status field (legacy)
        const students = await Student.find({
            $or: [
                { status: 'active' },
                { status: { $exists: false } }
            ]
        });

        let createdCount = 0;
        const pricePerKm = 150; // Fixed rate
        const dueDate = new Date();
        dueDate.setDate(dueDate.getDate() + 7); // Default due date 7 days from now

        for (const student of students) {
            // Check if already exists
            const existing = await Subscription.findOne({ studentId: student._id, month, year });
            if (!existing) {
                const totalAmount = Math.round((student.distanceKm || 0) * pricePerKm);

                await Subscription.create({
                    studentId: student._id,
                    month,
                    year,
                    distanceKm: student.distanceKm || 0,
                    pricePerKm,
                    totalAmount,
                    status: 'pending',
                    dueDate
                });
                createdCount++;
            }
        }

        res.json({ message: `Successfully generated ${createdCount} bills for ${month} ${year}`, count: createdCount });
    } catch (error) {
        console.error('Bulk Generate Error:', error);
        res.status(500).json({ message: 'Server error' });
    }
});

module.exports = router;

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
