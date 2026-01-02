const express = require('express');
const Student = require('../models/Student');
const Bus = require('../models/Bus');
const Route = require('../models/Route');
const Driver = require('../models/Driver');
const Subscription = require('../models/Subscription');
const Payment = require('../models/Payment');
const auth = require('../middleware/auth');

const router = express.Router();

// Get analytics data
router.get('/', auth, async (req, res) => {
    try {
        const currentMonth = new Date().toLocaleString('default', { month: 'long' });
        const currentYear = new Date().getFullYear();

        const [
            totalStudents,
            activeStudents,
            totalBuses,
            activeBuses,
            totalDrivers,
            activeDrivers,
            totalRoutes,
            pendingSubscriptions,
            overdueSubscriptions,
            monthlyPayments
        ] = await Promise.all([
            Student.countDocuments(),
            Student.countDocuments({ status: 'active' }),
            Bus.countDocuments(),
            Bus.countDocuments({ status: 'active' }),
            Driver.countDocuments(),
            Driver.countDocuments({ status: 'on-duty' }),
            Route.countDocuments(),
            Subscription.countDocuments({ status: 'pending' }),
            Subscription.countDocuments({ status: 'overdue' }),
            Payment.find({
                status: 'success',
                date: {
                    $gte: new Date(currentYear, new Date().getMonth(), 1),
                    $lt: new Date(currentYear, new Date().getMonth() + 1, 1)
                }
            })
        ]);

        const monthlyRevenue = monthlyPayments.reduce((sum, p) => sum + p.amount, 0);

        res.json({
            totalStudents,
            activeStudents,
            totalBuses,
            activeBuses,
            totalDrivers,
            activeDrivers,
            totalRoutes,
            monthlyRevenue,
            pendingPayments: pendingSubscriptions,
            overduePayments: overdueSubscriptions
        });
    } catch (error) {
        console.error('Analytics error:', error);
        res.status(500).json({ message: 'Server error' });
    }
});

module.exports = router;
