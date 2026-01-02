const mongoose = require('mongoose');

const studentSchema = new mongoose.Schema({
    userId: { type: mongoose.Schema.Types.ObjectId, ref: 'User', required: true },
    name: { type: String, required: true },
    email: { type: String, required: true },
    phone: { type: String, default: '' },
    class: { type: String, default: '' },
    section: { type: String, default: '' },
    address: { type: String, default: '' },
    distanceKm: { type: Number, default: 0 },
    busId: { type: mongoose.Schema.Types.ObjectId, ref: 'Bus' },
    routeId: { type: mongoose.Schema.Types.ObjectId, ref: 'Route' },
    enrollmentDate: { type: Date, default: Date.now },
    status: { type: String, enum: ['active', 'inactive', 'pending'], default: 'active' }
}, { timestamps: true });

module.exports = mongoose.model('Student', studentSchema);
