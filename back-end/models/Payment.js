const mongoose = require('mongoose');

const paymentSchema = new mongoose.Schema({
  user: {
    type: mongoose.Schema.Types.ObjectId,
    ref: 'User',
    required: true
  },
  bookings: [{
    type: mongoose.Schema.Types.ObjectId,
    ref: 'Booking'
  }],
  amount: {
    type: Number,
    required: true
  },
  paymentMethod: {
    type: String,
    required: true,
    enum: ['credit-card', 'paypal', 'apple-pay', 'google-pay', 'cash-on-delivery'],
    default: 'cash-on-delivery'
  },
  status: {
    type: String,
    required: true,
    enum: ['Pending', 'Completed', 'Failed', 'Refunded'],
    default: 'Pending'
  },
  transactionId: {
    type: String
  },
  refundReason: {
    type: String
  },
  refundDate: {
    type: Date
  },
  deliveryAddress: {
    type: String
  },
  createdAt: {
    type: Date,
    default: Date.now
  }
});

const Payment = mongoose.model('Payment', paymentSchema);

module.exports = Payment;