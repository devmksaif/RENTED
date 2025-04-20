const express = require('express');
const router = express.Router();
const Booking = require('../models/Booking');
const Product = require('../models/Product');
const auth = require('../middleware/auth');

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

// Create a new booking
router.post('/', auth, async (req, res) => {
  try {
    const { productId, startDate, endDate } = req.body;
    
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
    
    // Calculate total price (days * daily price)
    const days = Math.ceil((end - start) / (1000 * 60 * 60 * 24));
    const totalPrice = days * product.price;
    
    // Create booking
    const booking = new Booking({
      product: productId,
      user: req.user._id,
      startDate,
      endDate,
      totalPrice,
      status: 'Pending',
      paymentStatus: 'Pending'
    });
    
    const newBooking = await booking.save();
    
    // Update product availability
    product.availability = 'Booked';
    await product.save();
    
    res.status(201).json(newBooking);
  } catch (error) {
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

module.exports = router;