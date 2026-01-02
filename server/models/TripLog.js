const mongoose = require('mongoose');

const TripLogSchema = new mongoose.Schema({
    driverId: {
        type: mongoose.Schema.Types.ObjectId,
        ref: 'Driver',
        required: true
    },
    busId: {
        type: mongoose.Schema.Types.ObjectId,
        ref: 'Bus'
    },
    routeId: {
        type: mongoose.Schema.Types.ObjectId,
        ref: 'Route'
    },
    date: {
        type: Date,
        required: true
    },
    shift: {
        type: String,
        enum: ['morning', 'evening'],
        required: true
    },
    completedAt: {
        type: Date,
        required: true
    },
    studentsCount: {
        type: Number,
        default: 0
    },
    status: {
        type: String,
        enum: ['completed', 'cancelled', 'partial'],
        default: 'completed'
    },
    notes: {
        type: String
    }
}, {
    timestamps: true
});

// Compound index for efficient querying
TripLogSchema.index({ driverId: 1, date: -1 });
TripLogSchema.index({ driverId: 1, date: 1, shift: 1 }, { unique: true });

module.exports = mongoose.model('TripLog', TripLogSchema);
