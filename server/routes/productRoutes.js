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
    
    if (category) {
      filter.category = { $in: [category] };
    }
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
        { category: { $elemMatch: { $regex: query, $options: 'i' } } }
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
      category: { $in: [new RegExp(req.params.category, 'i')] }
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

// Add this route for geographic search
// Update the geographic search route
router.get('/nearby', async (req, res) => {
  try {
    const { lat, lng, radius = 10, category, minPrice, maxPrice, availability, rating } = req.query;
    
    if (!lat || !lng) {
      return res.status(400).json({ message: 'Latitude and longitude are required' });
    }
    
    // Convert coordinates to numbers
    const latitude = parseFloat(lat);
    const longitude = parseFloat(lng);
    const searchRadius = parseFloat(radius); // in kilometers
    
    if (isNaN(latitude) || isNaN(longitude) || isNaN(searchRadius)) {
      return res.status(400).json({ message: 'Invalid coordinates or radius' });
    }
    
    // Build the filter
    const filter = {
      // Geospatial query
      geoLocation: {
        $near: {
          $geometry: {
            type: 'Point',
            coordinates: [longitude, latitude] // MongoDB uses [longitude, latitude] format
          },
          $maxDistance: searchRadius * 1000 // Convert km to meters
        }
      }
    };
    
    // Add optional filters
    if (category) {
      filter.category = { $in: [category] };
    }
    if (availability) filter.availability = availability;
    if (rating) filter.rating = { $gte: Number(rating) };
    
    // Price range filter
    if (minPrice || maxPrice) {
      filter.price = {};
      if (minPrice) filter.price.$gte = Number(minPrice);
      if (maxPrice) filter.price.$lte = Number(maxPrice);
    }
    
    // Find products near the given coordinates
    const products = await Product.find(filter).limit(100); // Limit to 100 results for performance
    
    res.json(products);
  } catch (error) {
    console.error('Error finding nearby products:', error);
    res.status(500).json({ message: error.message });
  }
});

// Create a new product (protected route)
router.post('/', auth, async (req, res) => {
  try {
    const productData = { ...req.body, owner: req.user._id };
    
    // Handle geolocation if coordinates are provided
    if (req.body.longitude && req.body.latitude) {
      productData.geoLocation = {
        type: 'Point',
        coordinates: [parseFloat(req.body.longitude), parseFloat(req.body.latitude)]
      };
      
      // Remove non-schema properties
      delete productData.longitude;
      delete productData.latitude;
    }
    
    // Add console log here to see the category data before creating the product
    console.log('Category data before creation:', productData.category, typeof productData.category);

    const product = new Product(productData);
    const newProduct = await product.save();
    
    res.status(201).json(newProduct);
  } catch (error) {
    console.error('Error creating product:', error);
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
    
    const updateData = { ...req.body };
    
    // Handle geolocation update if coordinates are provided
    if (req.body.longitude && req.body.latitude) {
      updateData.geoLocation = {
        type: 'Point',
        coordinates: [parseFloat(req.body.longitude), parseFloat(req.body.latitude)]
      };
      
      // Remove non-schema properties from update
      delete updateData.longitude;
      delete updateData.latitude;
    }
    
    // Apply updates
    Object.keys(updateData).forEach(update => {
      product[update] = updateData[update];
    });
    
    // Add console log here to see the category data before saving the updated product
    console.log('Category data before update save:', product.category, typeof product.category);

    const updatedProduct = await product.save();
    res.json(updatedProduct);
  } catch (error) {
    console.error('Error updating product:', error);
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