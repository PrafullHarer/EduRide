const mongoose = require('mongoose');

const busSchema = new mongoose.Schema({
    busNumber: { type: String, required: true, unique: true },
    registrationNumber: { type: String, required: true, unique: true },
    capacity: { type: Number, required: true },
    currentStudents: { type: Number, default: 0 },
    driverId: { type: mongoose.Schema.Types.ObjectId, ref: 'Driver' },
    routeId: { type: mongoose.Schema.Types.ObjectId, ref: 'Route' },
    status: { type: String, enum: ['active', 'maintenance', 'inactive'], default: 'active' },
    model: { type: String, required: true },
    year: { type: Number, required: true },
    currentLocation: {
        lat: { type: Number },
        lng: { type: Number },
        heading: { type: Number },
        speed: { type: Number },
        updatedAt: { type: Date }
    },
    isTracking: { type: Boolean, default: false }
}, { timestamps: true });

module.exports = mongoose.model('Bus', busSchema);
