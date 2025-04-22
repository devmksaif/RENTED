const Payment = require('../models/Payment');
const Booking = require('../models/Booking');
const Notification = require('../models/Notification');
const Product = require('../models/Product');

// Process a new payment
exports.processPayment = async (req, res) => {
  try {
    const { bookingId, paymentMethod, cardDetails } = req.body;
    
    // Find the booking
    const booking = await Booking.findById(bookingId);
    if (!booking) {
      return res.status(404).json({ message: 'Booking not found' });
    }
    
    // Check if booking belongs to user
    if (booking.user.toString() !== req.user._id.toString()) {
      return res.status(403).json({ message: 'Not authorized to pay for this booking' });
    }
    
    // Check if booking is already paid
    if (booking.paymentStatus === 'Paid') {
      return res.status(400).json({ message: 'This booking is already paid' });
    }
    
    // In a real application, you would integrate with a payment gateway here
    // For this example, we'll simulate a successful payment
    
    // Create a new payment record
    const payment = new Payment({
      booking: bookingId,
      user: req.user._id,
      amount: booking.totalPrice,
      paymentMethod,
      transactionId: 'sim_' + Math.random().toString(36).substring(2, 15),
      status: 'completed'
    });
    
    await payment.save();
    
    // Update booking payment status
    booking.paymentStatus = 'Paid';
    await booking.save();
    
    // Update product availability
    const product = await Product.findById(booking.product);
    product.availability = 'Booked';
    await product.save();
    
    // Create notification for product owner
    const notification = new Notification({
      recipient: product.owner,
      type: 'payment',
      title: 'New Payment Received',
      message: `Payment for booking #${booking._id.toString().slice(-6)} has been completed.`,
      relatedTo: {
        model: 'Booking',
        id: booking._id
      }
    });
    
    await notification.save();
    
    res.status(200).json({ 
      success: true, 
      payment,
      message: 'Payment processed successfully'
    });
    
  } catch (error) {
    console.error('Payment processing error:', error);
    res.status(500).json({ message: 'Payment processing failed', error: error.message });
  }
};

// Get payment history for a user
exports.getPaymentHistory = async (req, res) => {
  try {
    const payments = await Payment.find({ user: req.user._id })
      .populate({
        path: 'booking',
        populate: { path: 'product' }
      })
      .sort({ createdAt: -1 });
      
    res.json(payments);
  } catch (error) {
    res.status(500).json({ message: error.message });
  }
};

// Get payment details
exports.getPaymentDetails = async (req, res) => {
  try {
    const payment = await Payment.findById(req.params.id)
      .populate({
        path: 'booking',
        populate: { path: 'product' }
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
};

// Request refund
exports.requestRefund = async (req, res) => {
  try {
    const { paymentId, reason } = req.body;
    
    const payment = await Payment.findById(paymentId);
    if (!payment) {
      return res.status(404).json({ message: 'Payment not found' });
    }
    
    // Check if user is authorized
    if (payment.user.toString() !== req.user._id.toString()) {
      return res.status(403).json({ message: 'Not authorized to request refund for this payment' });
    }
    
    // Check if payment is eligible for refund
    if (payment.status !== 'completed') {
      return res.status(400).json({ message: 'Only completed payments can be refunded' });
    }
    
    // In a real application, you would process the refund through a payment gateway
    // For this example, we'll simulate a refund request
    
    payment.status = 'refunded';
    await payment.save();
    
    // Update booking status
    const booking = await Booking.findById(payment.booking);
    booking.status = 'Cancelled';
    booking.paymentStatus = 'Refunded';
    await booking.save();
    
    // Update product availability
    const product = await Product.findById(booking.product);
    product.availability = 'Available';
    await product.save();
    
    // Create notification for product owner
    const notification = new Notification({
      recipient: product.owner,
      type: 'payment',
      title: 'Refund Processed',
      message: `A refund has been processed for booking #${booking._id.toString().slice(-6)}. Reason: ${reason}`,
      relatedTo: {
        model: 'Booking',
        id: booking._id
      }
    });
    
    await notification.save();
    
    res.status(200).json({ 
      success: true, 
      message: 'Refund processed successfully'
    });
    
  } catch (error) {
    res.status(500).json({ message: error.message });
  }
};