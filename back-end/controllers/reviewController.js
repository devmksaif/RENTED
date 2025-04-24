const Review = require('../models/Review');
const Booking = require('../models/Booking');
const Product = require('../models/Product');
const Notification = require('../models/Notification');

// Create a new review
exports.createReview = async (req, res) => {
  try {
    const { productId, rating, comment, bookingId } = req.body;
    
    // Check if product exists
    const product = await Product.findById(productId);
    if (!product) {
      return res.status(404).json({ message: 'Product not found' });
    }
    
    // If booking ID is provided, verify it
    if (bookingId) {
      const booking = await Booking.findById(bookingId);
      
      if (!booking) {
        return res.status(404).json({ message: 'Booking not found' });
      }
      
      // Check if booking belongs to user
      if (booking.user.toString() !== req.user._id.toString()) {
        return res.status(403).json({ message: 'Not authorized to review this booking' });
      }
      
      // Check if booking is completed
      if (booking.status !== 'Completed') {
        return res.status(400).json({ message: 'Can only review completed bookings' });
      }
      
      // Check if user has already reviewed this booking
      const existingReview = await Review.findOne({ 
        user: req.user._id,
        booking: bookingId
      });
      
      if (existingReview) {
        return res.status(400).json({ message: 'You have already reviewed this booking' });
      }
    }
    
    // Create the review
    const review = new Review({
      product: productId,
      user: req.user._id,
      rating,
      comment,
      booking: bookingId || null
    });
    
    await review.save();
    
    // Create notification for product owner
    const notification = new Notification({
      recipient: product.owner,
      type: 'system',
      title: 'New Review',
      message: `Your product "${product.title}" has received a new ${rating}-star review.`,
      relatedTo: {
        model: 'Product',
        id: product._id
      }
    });
    
    await notification.save();
    
    res.status(201).json(review);
    
  } catch (error) {
    res.status(400).json({ message: error.message });
  }
};

// Get reviews for a product
exports.getProductReviews = async (req, res) => {
  try {
    const { productId } = req.params;
    
    const reviews = await Review.find({ product: productId })
      .populate('user', 'name')
      .sort({ createdAt: -1 });
      
    res.json(reviews);
  } catch (error) {
    res.status(500).json({ message: error.message });
  }
};

// Get reviews by a user
exports.getUserReviews = async (req, res) => {
  try {
    const reviews = await Review.find({ user: req.user._id })
      .populate('product')
      .sort({ createdAt: -1 });
      
    res.json(reviews);
  } catch (error) {
    res.status(500).json({ message: error.message });
  }
};

// Update a review
exports.updateReview = async (req, res) => {
  try {
    const { rating, comment } = req.body;
    
    const review = await Review.findById(req.params.id);
    if (!review) {
      return res.status(404).json({ message: 'Review not found' });
    }
    
    // Check if user is the author
    if (review.user.toString() !== req.user._id.toString()) {
      return res.status(403).json({ message: 'Not authorized to update this review' });
    }
    
    review.rating = rating;
    review.comment = comment;
    
    await review.save();
    
    res.json(review);
  } catch (error) {
    res.status(400).json({ message: error.message });
  }
};

// Delete a review
exports.deleteReview = async (req, res) => {
  try {
    const review = await Review.findById(req.params.id);
    if (!review) {
      return res.status(404).json({ message: 'Review not found' });
    }
    
    // Check if user is the author or admin
    if (review.user.toString() !== req.user._id.toString() && !req.user.isAdmin) {
      return res.status(403).json({ message: 'Not authorized to delete this review' });
    }
    
    await review.deleteOne();
    
    res.json({ message: 'Review deleted' });
  } catch (error) {
    res.status(500).json({ message: error.message });
  }
};