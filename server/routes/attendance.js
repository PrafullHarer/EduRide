const express = require('express');
const Attendance = require('../models/Attendance');
const auth = require('../middleware/auth');

const router = express.Router();

// Save/Update attendance for multiple students on a date
router.post('/bulk', auth, async (req, res) => {
    try {
        const { date, records, isHoliday } = req.body;
        // records: [{ studentId, morning, evening }]

        const attendanceDate = new Date(date);
        attendanceDate.setHours(0, 0, 0, 0);

        const operations = records.map(record => ({
            updateOne: {
                filter: { studentId: record.studentId, date: attendanceDate },
                update: {
                    $set: {
                        morning: isHoliday ? false : record.morning,
                        evening: isHoliday ? false : record.evening,
                        isHoliday: isHoliday || false,
                        markedBy: req.user.id
                    }
                },
                upsert: true
            }
        }));

        await Attendance.bulkWrite(operations);
        res.json({ message: 'Attendance saved successfully', count: records.length });
    } catch (error) {
        console.error('Bulk attendance error:', error);
        res.status(500).json({ message: 'Server error' });
    }
});

// Get attendance for a student for a month
router.get('/student/:studentId/month/:year/:month', auth, async (req, res) => {
    try {
        const { studentId, year, month } = req.params;

        const startDate = new Date(parseInt(year), parseInt(month) - 1, 1);
        const endDate = new Date(parseInt(year), parseInt(month), 0, 23, 59, 59);

        const attendance = await Attendance.find({
            studentId,
            date: { $gte: startDate, $lte: endDate }
        }).sort({ date: 1 });

        res.json(attendance);
    } catch (error) {
        console.error('Get attendance error:', error);
        res.status(500).json({ message: 'Server error' });
    }
});

// Get attendance for a date (all students)
router.get('/date/:date', auth, async (req, res) => {
    try {
        const date = new Date(req.params.date);
        date.setHours(0, 0, 0, 0);

        const attendance = await Attendance.find({ date }).populate('studentId', 'name');
        res.json(attendance);
    } catch (error) {
        console.error('Get date attendance error:', error);
        res.status(500).json({ message: 'Server error' });
    }
});

// Get attendance for multiple students on a date
router.post('/date', auth, async (req, res) => {
    try {
        const { date, studentIds } = req.body;
        const attendanceDate = new Date(date);
        attendanceDate.setHours(0, 0, 0, 0);

        const attendance = await Attendance.find({
            studentId: { $in: studentIds },
            date: attendanceDate
        });

        // Convert to a map for easy lookup
        const attendanceMap = {};
        attendance.forEach(a => {
            attendanceMap[a.studentId.toString()] = {
                morning: a.morning,
                evening: a.evening,
                isHoliday: a.isHoliday
            };
        });

        res.json(attendanceMap);
    } catch (error) {
        console.error('Get attendance by date error:', error);
        res.status(500).json({ message: 'Server error' });
    }
});

module.exports = router;
