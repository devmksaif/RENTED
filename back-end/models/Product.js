const mongoose = require('mongoose');

const productSchema = new mongoose.Schema({
  title: {
    type: String,
    required: true,
    trim: true
  },
  description: {
    type: String,
    required: true,
    trim: true
  },
  price: {
    type: Number,
    required: true,
    min: 0
  },
  category: {
    type: String,
    required: true,
    trim: true
  },
  location: {
    type: String,
    required: true,
    trim: true
  },
  image: {
    type: String,
    default: 'https://via.placeholder.com/300x200'
  },
  images: {
    type: [String],
    default: []
  },
  owner: {
    type: mongoose.Schema.Types.ObjectId,
    ref: 'User',
    required: true
  },
  availability: {
    type: String,
    enum: ['Available', 'Unavailable', 'Maintenance', 'Booked'],
    default: 'Available'
  },
  rating: {
    type: Number,
    default: 0,
    min: 0,
    max: 5
  },
  reviews: {
    type: Number,
    default: 0
  },
  features: {
    type: [String],
    default: []
  },
  condition: {
    type: String,
    enum: ['New', 'Like New', 'Good', 'Fair', 'Poor'],
    default: 'Good'
  },
  deposit: {
    type: Number,
    default: 0
  },
  minRentalDays: {
    type: Number,
    default: 1
  },
  maxRentalDays: {
    type: Number,
    default: 30
  },
  featured: {
    type: Boolean,
    default: false
  }
}, {
  timestamps: true
});

// Add a virtual for calculating average rating
productSchema.virtual('averageRating').get(function() {
  return this.reviews > 0 ? this.rating : 0;
});

// Add text index for better search
productSchema.index({ 
  title: 'text', 
  description: 'text', 
  category: 'text',
  location: 'text'
});

const Product = mongoose.model('Product', productSchema);

module.exports = Product;