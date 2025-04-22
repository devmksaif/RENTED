const express = require('express');
const router = express.Router();
const Product = require('../models/Product');
const auth = require('../middleware/auth');

// Get all products with filtering (public route)
router.get('/', async (req, res) => {
  try {
    const { category, minPrice, maxPrice, location, availability, rating } = req.query;
    
    // Build filter object
    const filter = {};
    
    if (category) filter.category = category;
    if (location) filter.location = { $regex: location, $options: 'i' };
    if (availability) filter.availability = availability;
    if (rating) filter.rating = { $gte: Number(rating) };
    
    // Price range filter
    if (minPrice || maxPrice) {
      filter.price = {};
      if (minPrice) filter.price.$gte = Number(minPrice);
      if (maxPrice) filter.price.$lte = Number(maxPrice);
    }
    
    const products = await Product.find(filter);
    res.json(products);
  } catch (error) {
    res.status(500).json({ message: error.message });
  }
});

// Add a search route
router.get('/search', async (req, res) => {
  try {
    const { query } = req.query;
    
    if (!query) {
      return res.status(400).json({ message: 'Search query is required' });
    }
    
    const products = await Product.find({
      $or: [
        { title: { $regex: query, $options: 'i' } },
        { description: { $regex: query, $options: 'i' } },
        { category: { $regex: query, $options: 'i' } }
      ]
    });
    
    res.json(products);
  } catch (error) {
    res.status(500).json({ message: error.message });
  }
});

// Get products by category
router.get('/category/:category', async (req, res) => {
  try {
    const products = await Product.find({ 
      category: { $regex: new RegExp(req.params.category, 'i') }
    });
    
    res.json(products);
  } catch (error) {
    res.status(500).json({ message: error.message });
  }
});

// Get featured products (top rated)
router.get('/featured', async (req, res) => {
  try {
    const products = await Product.find({ availability: 'Available' })
      .sort({ rating: -1 })
      .limit(6);
    
    res.json(products);
  } catch (error) {
    res.status(500).json({ message: error.message });
  }
});

// Get products by current user (for listings page)
router.get('/user', auth, async (req, res) => {
  try {
    const products = await Product.find({ owner: req.user._id });
    res.json(products);
  } catch (error) {
    res.status(500).json({ message: error.message });
  }
});

// Get a single product (public route)
router.get('/:id', async (req, res) => {
  try {
    const product = await Product.findById(req.params.id);
    if (!product) {
      return res.status(404).json({ message: 'Product not found' });
    }
    res.json(product);
  } catch (error) {
    res.status(500).json({ message: error.message });
  }
});

// Create a new product (protected route)
router.post('/', auth, async (req, res) => {
  const product = new Product({
    ...req.body,
    owner: req.user._id
  });

  try {
    const newProduct = await product.save();
    res.status(201).json(newProduct);
  } catch (error) {
    res.status(400).json({ message: error.message });
  }
});

// Update a product (protected route)
router.patch('/:id', auth, async (req, res) => {
  try {
    const product = await Product.findById(req.params.id);
    
    if (!product) {
      return res.status(404).json({ message: 'Product not found' });
    }
    
    // Check if user is the owner
    if (product.owner.toString() !== req.user._id.toString() && !req.user.isAdmin) {
      return res.status(403).json({ message: 'Not authorized to update this product' });
    }
    
    Object.keys(req.body).forEach(update => {
      product[update] = req.body[update];
    });
    
    const updatedProduct = await product.save();
    res.json(updatedProduct);
  } catch (error) {
    res.status(400).json({ message: error.message });
  }
});

// Delete a product (protected route)
router.delete('/:id', auth, async (req, res) => {
  try {
    const product = await Product.findById(req.params.id);
    
    if (!product) {
      return res.status(404).json({ message: 'Product not found' });
    }
    
    // Check if user is the owner
    if (product.owner.toString() !== req.user._id.toString() && !req.user.isAdmin) {
      return res.status(403).json({ message: 'Not authorized to delete this product' });
    }
    
    await product.deleteOne();
    res.json({ message: 'Product deleted' });
  } catch (error) {
    res.status(500).json({ message: error.message });
  }
});

module.exports = router;