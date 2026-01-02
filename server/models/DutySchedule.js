const mongoose = require('mongoose');

const tripInfoSchema = new mongoose.Schema({
    startTime: { type: String, required: true },
    endTime: { type: String },
    status: { type: String, enum: ['pending', 'in-progress', 'completed'], default: 'pending' },
    studentsPresent: { type: Number, default: 0 },
    totalStudents: { type: Number, required: true }
});

const dutyScheduleSchema = new mongoose.Schema({
    driverId: { type: mongoose.Schema.Types.ObjectId, ref: 'Driver', required: true },
    date: { type: Date, required: true },
    shift: { type: String, enum: ['morning', 'afternoon', 'both'], required: true },
    status: { type: String, enum: ['scheduled', 'completed', 'cancelled'], default: 'scheduled' },
    morningPickup: tripInfoSchema,
    afternoonDrop: tripInfoSchema
}, { timestamps: true });

module.exports = mongoose.model('DutySchedule', dutyScheduleSchema);
