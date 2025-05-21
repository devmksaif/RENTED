const express = require('express');
const router = express.Router();
const Booking = require('../models/Booking');
const Product = require('../models/Product');
const auth = require('../middleware/auth');
const Notification = require('../models/Notification');
const User = require('../models/User').default;

// Get all bookings for a user
router.get('/user', auth, async (req, res) => {
  try {
    const bookings = await Booking.find({ user: req.user._id })
      .populate('product')
      .sort({ createdAt: -1 });
    res.json(bookings);
  } catch (error) {
    res.status(500).json({ message: error.message });
  }
});

// Get all bookings for a product owner
router.get('/owner', auth, async (req, res) => {
  try {
    // Find all products owned by the user
    const products = await Product.find({ owner: req.user._id });
    const productIds = products.map(product => product._id);
    
    // Find all bookings for these products
    const bookings = await Booking.find({ product: { $in: productIds } })
      .populate('product')
      .populate('user', 'name email phone')
      .sort({ createdAt: -1 });
    
    res.json(bookings);
  } catch (error) {
    res.status(500).json({ message: error.message });
  }
});

// Get a specific booking
router.get('/:id', auth, async (req, res) => {
  try {
    const booking = await Booking.findById(req.params.id)
      .populate('product')
      .populate('user', 'name email phone');
    
    if (!booking) {
      return res.status(404).json({ message: 'Booking not found' });
    }
    
    // Check if user is authorized to view this booking
    const product = await Product.findById(booking.product._id);
    if (booking.user._id.toString() !== req.user._id.toString() && 
        product.owner.toString() !== req.user._id.toString() && 
        !req.user.isAdmin) {
      return res.status(403).json({ message: 'Not authorized to view this booking' });
    }
    
    res.json(booking);
  } catch (error) {
    res.status(500).json({ message: error.message });
  }
});

// Update the create booking route
router.post('/create', auth, async (req, res) => {
  try {
    const { productId, startDate, endDate, quantity, totalPrice, paymentMethod, meetingArea } = req.body;
    
    // Validate dates
    const start = new Date(startDate);
    const end = new Date(endDate);
    
    if (start >= end) {
      return res.status(400).json({ message: 'End date must be after start date' });
    }
    
    if (start < new Date()) {
      return res.status(400).json({ message: 'Start date cannot be in the past' });
    }
    
    // Check if product exists and is available
    const product = await Product.findById(productId);
    if (!product) {
      return res.status(404).json({ message: 'Product not found' });
    }
    
    if (product.availability !== 'Available') {
      return res.status(400).json({ message: 'Product is not available for booking' });
    }
    
    // Check for conflicting bookings
    const conflictingBookings = await Booking.find({
      product: productId,
      status: { $in: ['Pending', 'Confirmed'] },
      $or: [
        { startDate: { $lte: end }, endDate: { $gte: start } }
      ]
    });
    
    if (conflictingBookings.length > 0) {
      return res.status(400).json({ message: 'Product is already booked for the selected dates' });
    }
    
    // Calculate total price if not provided
    let calculatedTotalPrice = totalPrice;
    if (!calculatedTotalPrice) {
      const days = Math.ceil((end - start) / (1000 * 60 * 60 * 24));
      calculatedTotalPrice = days * product.price * (quantity || 1);
    }
    
    // Validate meeting area if provided
    if (meetingArea && (!meetingArea.name || meetingArea.latitude === undefined || meetingArea.longitude === undefined)) {
      return res.status(400).json({ message: 'Invalid meeting area data' });
    }
    
    // Create booking
    const bookingData = {
      product: productId,
      user: req.user._id,
      startDate,
      endDate,
      quantity: quantity || 1,
      totalPrice: calculatedTotalPrice,
      status: 'Pending',
      paymentStatus: paymentMethod === 'cash-on-delivery' ? 'Pending' : 'Pending',
      paymentMethod: paymentMethod || 'cash-on-delivery'
    };
    
    // Add meeting area if provided
    if (meetingArea && meetingArea.name) {
      bookingData.meetingArea = {
        name: meetingArea.name,
        latitude: meetingArea.latitude,
        longitude: meetingArea.longitude
      };
    } else {
      // If no meeting area is provided, check if user has a default meeting area
      const user = await User.findById(req.user._id);
      const defaultMeetingArea = user.meetingAreas && user.meetingAreas.find(area => area.isDefault);
      
      if (defaultMeetingArea) {
        bookingData.meetingArea = {
          name: defaultMeetingArea.name,
          latitude: defaultMeetingArea.latitude,
          longitude: defaultMeetingArea.longitude
        };
      }
    }
    
    const booking = new Booking(bookingData);
    const newBooking = await booking.save();
    
    // Update product availability
    product.availability = 'Booked';
    await product.save();
    
    // Create notification for product owner
    const notification = new Notification({
      recipient: product.owner,
      type: 'booking',
      title: 'New Booking Request',
      message: `You have a new booking request for "${product.title}"`,
      relatedTo: {
        model: 'Booking',
        id: newBooking._id
      }
    });
    
    await notification.save();
    
    res.status(201).json(newBooking);
  } catch (error) {
    console.error('Error creating booking:', error);
    res.status(400).json({ message: error.message });
  }
});

// Update booking status
router.patch('/:id/status', auth, async (req, res) => {
  try {
    const { status } = req.body;
    
    if (!['Pending', 'Confirmed', 'Completed', 'Cancelled'].includes(status)) {
      return res.status(400).json({ message: 'Invalid status' });
    }
    
    const booking = await Booking.findById(req.params.id);
    if (!booking) {
      return res.status(404).json({ message: 'Booking not found' });
    }
    
    // Check if user is authorized to update this booking
    const product = await Product.findById(booking.product);
    if (product.owner.toString() !== req.user._id.toString() && !req.user.isAdmin) {
      return res.status(403).json({ message: 'Not authorized to update this booking' });
    }
    
    booking.status = status;
    
    // If booking is cancelled or completed, make product available again
    if (status === 'Cancelled' || status === 'Completed') {
      product.availability = 'Available';
      await product.save();
    }
    
    const updatedBooking = await booking.save();
    res.json(updatedBooking);
  } catch (error) {
    res.status(400).json({ message: error.message });
  }
});

// Update payment status
router.patch('/:id/payment', auth, async (req, res) => {
  try {
    const { paymentStatus } = req.body;
    
    if (!['Pending', 'Paid', 'Refunded'].includes(paymentStatus)) {
      return res.status(400).json({ message: 'Invalid payment status' });
    }
    
    const booking = await Booking.findById(req.params.id);
    if (!booking) {
      return res.status(404).json({ message: 'Booking not found' });
    }
    
    // Check if user is authorized to update this booking
    if (booking.user.toString() !== req.user._id.toString() && !req.user.isAdmin) {
      return res.status(403).json({ message: 'Not authorized to update this booking' });
    }
    
    booking.paymentStatus = paymentStatus;
    
    // If payment is made, automatically confirm the booking
    if (paymentStatus === 'Paid' && booking.status === 'Pending') {
      booking.status = 'Confirmed';
    }
    
    const updatedBooking = await booking.save();
    res.json(updatedBooking);
  } catch (error) {
    res.status(400).json({ message: error.message });
  }
});

// Cancel a booking (by the renter)
router.delete('/:id', auth, async (req, res) => {
  try {
    const booking = await Booking.findById(req.params.id);
    if (!booking) {
      return res.status(404).json({ message: 'Booking not found' });
    }
    
    // Check if user is authorized to cancel this booking
    if (booking.user.toString() !== req.user._id.toString() && !req.user.isAdmin) {
      return res.status(403).json({ message: 'Not authorized to cancel this booking' });
    }
    
    // Only allow cancellation of pending or confirmed bookings
    if (!['Pending', 'Confirmed'].includes(booking.status)) {
      return res.status(400).json({ message: `Cannot cancel a booking with status: ${booking.status}` });
    }
    
    booking.status = 'Cancelled';
    await booking.save();
    
    // Make product available again
    const product = await Product.findById(booking.product);
    product.availability = 'Available';
    await product.save();
    
    res.json({ message: 'Booking cancelled successfully' });
  } catch (error) {
    res.status(500).json({ message: error.message });
  }
});

// Add this route to complete a booking
router.patch('/:id/complete', auth, async (req, res) => {
  try {
    const booking = await Booking.findById(req.params.id);
    
    if (!booking) {
      return res.status(404).json({ message: 'Booking not found' });
    }
    
    // Check if product belongs to the user
    const product = await Product.findById(booking.product);
    if (!product) {
      return res.status(404).json({ message: 'Product not found' });
    }
    
    if (product.owner.toString() !== req.user._id.toString() && !req.user.isAdmin) {
      return res.status(403).json({ message: 'Not authorized to complete this booking' });
    }
    
    // Check if booking is in the right state
    if (booking.status !== 'Confirmed') {
      return res.status(400).json({ message: 'Only confirmed bookings can be completed' });
    }
    
    booking.status = 'Completed';
    await booking.save();
    
    // Update product availability
    product.availability = 'Available';
    await product.save();
    
    // Create notification for renter
    const notification = new Notification({
      recipient: booking.user,
      type: 'booking',
      title: 'Booking Completed',
      message: `Your booking for "${product.title}" has been marked as completed. Please leave a review!`,
      relatedTo: {
        model: 'Booking',
        id: booking._id
      }
    });
    
    await notification.save();
    
    res.json(booking);
  } catch (error) {
    res.status(500).json({ message: error.message });
  }
});

// Add this route to process payments
const Payment = require('../models/Payment');

// Process payment for bookings
router.post('/payment', auth, async (req, res) => {
  try {
    const { bookingIds, paymentMethod, amount } = req.body;
    
    if (!bookingIds || !bookingIds.length) {
      return res.status(400).json({ message: 'No bookings specified' });
    }
    
    // Validate all bookings exist and belong to the user
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
    const ownerNotifications = bookings.map(booking => {
      return {
        recipient: booking.product.owner,
        type: 'payment',
        title: paymentMethod === 'cash-on-delivery' ? 'New Cash on Delivery Order' : 'New Payment Received',
        message: `A ${paymentMethod === 'cash-on-delivery' ? 'cash on delivery order' : 'payment'} has been made for "${booking.product.title}"`,
        relatedTo: {
          model: 'Booking',
          id: booking._id
        }
      };
    });
    
    if (ownerNotifications.length) {
      await Notification.insertMany(ownerNotifications);
    }
    
    res.status(201).json(savedPayment);
  } catch (error) {
    console.error('Payment processing error:', error);
    res.status(500).json({ message: 'Failed to process payment' });
  }
});

module.exports = router;