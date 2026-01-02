const express = require('express');
const Student = require('../models/Student');
const auth = require('../middleware/auth');

const router = express.Router();

// Get all students
router.get('/', auth, async (req, res) => {
    try {
        const students = await Student.find().populate('busId routeId');
        res.json(students);
    } catch (error) {
        res.status(500).json({ message: 'Server error' });
    }
});

// Get student by ID
router.get('/:id', auth, async (req, res) => {
    try {
        const student = await Student.findById(req.params.id).populate('busId routeId');
        if (!student) {
            return res.status(404).json({ message: 'Student not found' });
        }
        res.json(student);
    } catch (error) {
        res.status(500).json({ message: 'Server error' });
    }
});

// Get student by user ID
router.get('/user/:userId', auth, async (req, res) => {
    try {
        const student = await Student.findOne({ userId: req.params.userId }).populate('busId routeId');
        if (!student) {
            return res.status(404).json({ message: 'Student not found' });
        }
        res.json(student);
    } catch (error) {
        res.status(500).json({ message: 'Server error' });
    }
});

// Create student
router.post('/', auth, async (req, res) => {
    try {
        const student = new Student(req.body);
        await student.save();
        res.status(201).json(student);
    } catch (error) {
        res.status(500).json({ message: 'Server error' });
    }
});

// Update student
router.put('/:id', auth, async (req, res) => {
    try {
        const student = await Student.findByIdAndUpdate(req.params.id, req.body, { new: true });
        if (!student) {
            return res.status(404).json({ message: 'Student not found' });
        }
        res.json(student);
    } catch (error) {
        res.status(500).json({ message: 'Server error' });
    }
});

// Delete student
router.delete('/:id', auth, async (req, res) => {
    try {
        const student = await Student.findByIdAndDelete(req.params.id);
        if (!student) {
            return res.status(404).json({ message: 'Student not found' });
        }
        res.json({ message: 'Student deleted' });
    } catch (error) {
        res.status(500).json({ message: 'Server error' });
    }
});

module.exports = router;
