const mongoose = require('mongoose');

const reviewSchema = new mongoose.Schema({
  product: {
    type: mongoose.Schema.Types.ObjectId,
    ref: 'Product',
    required: true
  },
  user: {
    type: mongoose.Schema.Types.ObjectId,
    ref: 'User',
    required: true
  },
  rating: {
    type: Number,
    required: true,
    min: 1,
    max: 5
  },
  comment: {
    type: String,
    required: true,
    trim: true
  },
  booking: {
    type: mongoose.Schema.Types.ObjectId,
    ref: 'Booking'
  }
}, {
  timestamps: true
});

// Update product rating when a review is added or modified
reviewSchema.post('save', async function() {
  const Review = this.constructor;
  const Product = mongoose.model('Product');
  
  // Calculate average rating
  const stats = await Review.aggregate([
    { $match: { product: this.product } },
    { $group: { 
      _id: '$product', 
      avgRating: { $avg: '$rating' },
      numReviews: { $sum: 1 }
    }}
  ]);
  
  // Update product with new rating data
  if (stats.length > 0) {
    await Product.findByIdAndUpdate(this.product, {
      rating: stats[0].avgRating,
      reviews: stats[0].numReviews
    });
  } else {
    await Product.findByIdAndUpdate(this.product, {
      rating: 0,
      reviews: 0
    });
  }
});

const Review = mongoose.model('Review', reviewSchema);

module.exports = Review;