const mongoose = require('mongoose');

const driverSchema = new mongoose.Schema({
    userId: { type: mongoose.Schema.Types.ObjectId, ref: 'User', required: true },
    name: { type: String, required: true },
    email: { type: String, required: true },
    phone: { type: String, default: '' },
    licenseNumber: { type: String, default: 'PENDING' },
    busId: { type: mongoose.Schema.Types.ObjectId, ref: 'Bus' },
    status: { type: String, enum: ['on-duty', 'off-duty', 'on-leave'], default: 'off-duty' },
    joinDate: { type: Date, default: Date.now },
    experience: { type: Number, default: 0 }
}, { timestamps: true });

module.exports = mongoose.model('Driver', driverSchema);
