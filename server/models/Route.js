const mongoose = require('mongoose');

const routeStopSchema = new mongoose.Schema({
    name: { type: String, required: true },
    order: { type: Number, required: true },
    distanceFromStart: { type: Number, default: 0 },
    estimatedArrival: { type: String, default: '' },
    lat: { type: Number },
    lng: { type: Number }
});

const routeSchema = new mongoose.Schema({
    name: { type: String, required: true },
    startPoint: { type: String, required: true },
    endPoint: { type: String, required: true },
    stops: [routeStopSchema],
    totalDistanceKm: { type: Number, default: 0 },
    estimatedTime: { type: String, default: '' },
    busId: { type: mongoose.Schema.Types.ObjectId, ref: 'Bus' }
}, { timestamps: true });

module.exports = mongoose.model('Route', routeSchema);
