const express = require('express');
const router = express.Router();
const Payment = require('../models/Payment');
const Booking = require('../models/Booking');
const Notification = require('../models/Notification');
const auth = require('../middleware/auth');

// Apply auth middleware to all routes
router.use(auth);

// Update the payment processing route

// Process a payment
router.post('/process', async (req, res) => {
  try {
    const { bookingIds, paymentMethod, amount } = req.body;
    
    if (!bookingIds || !Array.isArray(bookingIds) || bookingIds.length === 0) {
      return res.status(400).json({ message: 'No bookings specified' });
    }
    
    // Validate bookings exist and belong to user
    const bookings = await Booking.find({
      _id: { $in: bookingIds },
      user: req.user._id
    }).populate('product');
    
    if (bookings.length !== bookingIds.length) {
      return res.status(400).json({ message: 'One or more bookings are invalid or do not belong to you' });
    }
    
    // Create payment record
    const payment = new Payment({
      user: req.user._id,
      bookings: bookingIds,
      amount,
      paymentMethod,
      status: paymentMethod === 'cash-on-delivery' ? 'Pending' : 'Completed'
    });
    
    const savedPayment = await payment.save();
    
    // Update booking payment status
    const paymentStatus = paymentMethod === 'cash-on-delivery' ? 'Pending' : 'Paid';
    const bookingStatus = paymentMethod === 'cash-on-delivery' ? 'Pending' : 'Confirmed';
    
    await Promise.all(bookings.map(booking => {
      booking.paymentStatus = paymentStatus;
      booking.status = bookingStatus;
      booking.paymentMethod = paymentMethod;
      return booking.save();
    }));
    
    // Create notifications for product owners
    const ownerNotifications = [];
    
    for (const booking of bookings) {
      if (booking.product && booking.product.owner) {
        ownerNotifications.push({
          recipient: booking.product.owner,
          type: 'payment',
          title: paymentMethod === 'cash-on-delivery' ? 'New Cash on Delivery Order' : 'New Payment Received',
          message: `A ${paymentMethod === 'cash-on-delivery' ? 'cash on delivery order' : 'payment'} has been made for "${booking.product.title}"`,
          relatedTo: {
            model: 'Booking',
            id: booking._id
          }
        });
      }
    }
    
    if (ownerNotifications.length) {
      await Notification.insertMany(ownerNotifications);
    }
    
    res.status(201).json(savedPayment);
  } catch (error) {
    console.error('Payment processing error:', error);
    res.status(500).json({ message: 'Failed to process payment' });
  }
});

// Get payment history
router.get('/history', async (req, res) => {
  try {
    const payments = await Payment.find({ user: req.user._id })
      .populate({
        path: 'bookings',
        populate: {
          path: 'product'
        }
      })
      .sort({ createdAt: -1 });
    
    res.json(payments);
  } catch (error) {
    res.status(500).json({ message: error.message });
  }
});

// Get payment details
router.get('/:id', async (req, res) => {
  try {
    const payment = await Payment.findById(req.params.id)
      .populate({
        path: 'bookings',
        populate: {
          path: 'product'
        }
      });
    
    if (!payment) {
      return res.status(404).json({ message: 'Payment not found' });
    }
    
    // Check if user is authorized to view this payment
    if (payment.user.toString() !== req.user._id.toString() && !req.user.isAdmin) {
      return res.status(403).json({ message: 'Not authorized to view this payment' });
    }
    
    res.json(payment);
  } catch (error) {
    res.status(500).json({ message: error.message });
  }
});

// Request refund
router.post('/refund', async (req, res) => {
  try {
    const { paymentId, reason } = req.body;
    
    const payment = await Payment.findById(paymentId);
    if (!payment) {
      return res.status(404).json({ message: 'Payment not found' });
    }
    
    // Check if user is authorized
    if (payment.user.toString() !== req.user._id.toString()) {
      return res.status(403).json({ message: 'Not authorized to request refund' });
    }
    
    // Check if payment is eligible for refund
    if (payment.status !== 'Completed') {
      return res.status(400).json({ message: 'Payment is not eligible for refund' });
    }
    
    // In a real app, you would process the refund through payment gateway
    payment.status = 'Refunded';
    payment.refundReason = reason;
    payment.refundDate = Date.now();
    
    await payment.save();
    
    // Update booking payment status
    for (const bookingId of payment.bookings) {
      const booking = await Booking.findById(bookingId);
      if (booking) {
        booking.paymentStatus = 'Refunded';
        booking.status = 'Cancelled';
        await booking.save();
      }
    }
    
    res.json(payment);
  } catch (error) {
    res.status(400).json({ message: error.message });
  }
});

module.exports = router;