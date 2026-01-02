const mongoose = require('mongoose');

const subscriptionSchema = new mongoose.Schema({
    studentId: { type: mongoose.Schema.Types.ObjectId, ref: 'Student', required: true },
    month: { type: String, required: true },
    year: { type: Number, required: true },
    distanceKm: { type: Number, required: true },
    pricePerKm: { type: Number, required: true },
    totalAmount: { type: Number, required: true },
    status: { type: String, enum: ['pending', 'paid', 'overdue'], default: 'pending' },
    dueDate: { type: Date, required: true },
    paidDate: { type: Date }
}, { timestamps: true });

module.exports = mongoose.model('Subscription', subscriptionSchema);
