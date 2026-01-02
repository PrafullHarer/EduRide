const mongoose = require('mongoose');

const paymentSchema = new mongoose.Schema({
    subscriptionId: { type: mongoose.Schema.Types.ObjectId, ref: 'Subscription', required: true },
    studentId: { type: mongoose.Schema.Types.ObjectId, ref: 'Student', required: true },
    studentName: { type: String, required: true },
    amount: { type: Number, required: true },
    method: { type: String, enum: ['card', 'upi', 'netbanking', 'cash'], required: true },
    transactionId: { type: String, required: true },
    date: { type: Date, default: Date.now },
    status: { type: String, enum: ['success', 'failed', 'pending'], default: 'pending' }
}, { timestamps: true });

module.exports = mongoose.model('Payment', paymentSchema);
