const express = require('express');
const Student = require('../models/Student');
const Subscription = require('../models/Subscription');
const auth = require('../middleware/auth');

const router = express.Router();

// GET /api/dashboard/student - Combined endpoint for student dashboard
// Reduces multiple API calls to a single request for faster page loads
router.get('/student', auth, async (req, res) => {
    try {
        // Get student by user ID (from JWT token)
        const student = await Student.findOne({ userId: req.user.id })
            .populate('busId', 'busNumber model registrationNumber currentLocation isTracking')
            .populate('routeId', 'name stops');

        if (!student) {
            return res.status(404).json({ message: 'Student not found' });
        }

        // Get current subscription (most recent)
        const subscriptions = await Subscription.find({ studentId: student._id })
            .sort({ year: -1, month: -1 })
            .limit(1);

        const subscription = subscriptions[0] || null;

        // Calculate monthly fee
        const PRICE_PER_KM = 150;
        const monthlyFee = Math.round((student.distanceKm || 0) * PRICE_PER_KM);

        // Cache for 1 minute - balance between freshness and performance
        res.set('Cache-Control', 's-maxage=60, stale-while-revalidate=30');

        res.json({
            student: {
                _id: student._id,
                name: student.name,
                distanceKm: student.distanceKm,
                grade: student.grade,
                section: student.section,
                parentName: student.parentName,
                parentPhone: student.parentPhone,
            },
            bus: student.busId ? {
                _id: student.busId._id,
                busNumber: student.busId.busNumber,
                model: student.busId.model,
                currentLocation: student.busId.currentLocation,
                isTracking: student.busId.isTracking,
            } : null,
            route: student.routeId ? {
                _id: student.routeId._id,
                name: student.routeId.name,
                stops: student.routeId.stops,
            } : null,
            subscription: subscription ? {
                _id: subscription._id,
                month: subscription.month,
                year: subscription.year,
                totalAmount: subscription.totalAmount,
                status: subscription.status,
                dueDate: subscription.dueDate,
                paidDate: subscription.paidDate,
            } : null,
            billing: {
                monthlyFee,
                pricePerKm: PRICE_PER_KM,
                distanceKm: student.distanceKm || 0,
            }
        });
    } catch (error) {
        console.error('Dashboard API error:', error);
        res.status(500).json({ message: 'Server error' });
    }
});

module.exports = router;
