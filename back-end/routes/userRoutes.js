const express = require('express');
const router = express.Router();
const User = require('../models/User');
const auth = require('../middleware/auth');
const jwt = require('jsonwebtoken');

// Register a new user
router.post('/register', async (req, res) => {
  try {
    const { name, email, password, phone, address } = req.body;
    
    // Check if user already exists
    const existingUser = await User.findOne({ email });
    if (existingUser) {
      return res.status(400).json({ message: 'User already exists' });
    }
    
    // Create new user
    const user = new User({
      name,
      email,
      password,
      phone,
      address
    });
    
    await user.save();
    
    // Generate token
    const token = jwt.sign(
      { userId: user._id },
      process.env.JWT_SECRET || 'your_jwt_secret',
      { expiresIn: '7d' }
    );
    
    res.status(201).json({
      _id: user._id,
      name: user.name,
      email: user.email,
      isAdmin: user.isAdmin,
      role: user.isAdmin ? 'admin' : 'user', // Add role for frontend
      token
    });
  } catch (error) {
    res.status(400).json({ message: error.message });
  }
});

// Login user
router.post('/login', async (req, res) => {
  try {
    const { email, password } = req.body;
    
    // Find user by email
    const user = await User.findOne({ email });
    if (!user) {
      return res.status(401).json({ message: 'Invalid email or password' });
    }
    
    // Check password
    const isMatch = await user.comparePassword(password);
    if (!isMatch) {
      return res.status(401).json({ message: 'Invalid email or password' });
    }
    
    // Only check status if it exists in the user model
    if (user.status && user.status !== 'active' && user.status !== undefined) {
      return res.status(401).json({ message: 'Account is inactive or suspended' });
    }
    
    // Generate token
    const token = jwt.sign(
      { userId: user._id },
      process.env.JWT_SECRET || 'your_jwt_secret',
      { expiresIn: '7d' }
    );
    
    res.json({
      _id: user._id,
      name: user.name,
      email: user.email,
      role: user.role || (user.isAdmin ? 'admin' : 'user'),
      token
    });
  } catch (error) {
    res.status(500).json({ message: error.message });
  }
});

// Get user profile
router.get('/profile', auth, async (req, res) => {
  try {
    const user = await User.findById(req.user._id).select('-password');
    if (!user) {
      return res.status(404).json({ message: 'User not found' });
    }
    res.json(user);
  } catch (error) {
    res.status(500).json({ message: error.message });
  }
});

// Update user profile
router.patch('/profile', auth, async (req, res) => {
  const updates = Object.keys(req.body);
  const allowedUpdates = ['name', 'email', 'password', 'phone', 'address'];
  const isValidOperation = updates.every(update => allowedUpdates.includes(update));
  
  if (!isValidOperation) {
    return res.status(400).json({ message: 'Invalid updates' });
  }
  
  try {
    const user = await User.findById(req.user._id);
    
    if (!user) {
      return res.status(404).json({ message: 'User not found' });
    }
    
    updates.forEach(update => {
      user[update] = req.body[update];
    });
    
    await user.save();
    
    res.json({
      _id: user._id,
      name: user.name,
      email: user.email,
      isAdmin: user.isAdmin,
      phone: user.phone,
      address: user.address
    });
  } catch (error) {
    res.status(400).json({ message: error.message });
  }
});

// Add forgot password route
router.post('/forgot-password', async (req, res) => {
  try {
    const { email } = req.body;
    
    const user = await User.findOne({ email });
    if (!user) {
      return res.status(404).json({ message: 'User not found' });
    }
    
    // In a real app, you would send an email with a reset link
    // For now, we'll just return a success message
    
    res.json({ message: 'Password reset instructions sent to your email' });
  } catch (error) {
    res.status(500).json({ message: error.message });
  }
});

// Reset password (admin only)
router.post('/reset-password', async (req, res) => {
  try {
    const { email, newPassword, adminKey } = req.body;
    
    // Simple admin key verification - in production, use a more secure approach
    if (adminKey !== 'RENTED_ADMIN_KEY') {
      return res.status(403).json({ message: 'Invalid admin key' });
    }
    
    const user = await User.findOne({ email });
    if (!user) {
      return res.status(404).json({ message: 'User not found' });
    }
    
    // Update password
    user.password = newPassword;
    await user.save();
    
    res.json({ message: 'Password reset successful' });
  } catch (error) {
    res.status(500).json({ message: error.message });
  }
});

// Create admin user (development only - remove in production)
router.post('/create-admin', async (req, res) => {
  try {
    const { name, email, password, adminKey } = req.body;
    
    // Verify admin key
    if (adminKey !== 'RENTED_ADMIN_KEY') {
      return res.status(403).json({ message: 'Invalid admin key' });
    }
    
    // Check if user already exists
    const existingUser = await User.findOne({ email });
    if (existingUser) {
      return res.status(400).json({ message: 'User already exists' });
    }
    
    // Create new admin user
    const user = new User({
      name,
      email,
      password,
      role: 'admin'
    });
    
    await user.save();
    
    // Generate token
    const token = jwt.sign(
      { userId: user._id },
      process.env.JWT_SECRET || 'your_jwt_secret',
      { expiresIn: '7d' }
    );
    
    res.status(201).json({
      _id: user._id,
      name: user.name,
      email: user.email,
      role: 'admin',
      token
    });
  } catch (error) {
    res.status(400).json({ message: error.message });
  }
});

// Move module.exports to the end after all routes are defined
// Remove this line from its current position
// module.exports = router;

// Login user with debug
router.post('/login-debug', async (req, res) => {
  try {
    const { email, password } = req.body;
    console.log(`Login attempt for email: ${email}`);
    
    // Find user by email
    const user = await User.findOne({ email });
    if (!user) {
      console.log('User not found');
      return res.status(401).json({ message: 'Invalid email or password' });
    }
    
    console.log('User found:', {
      id: user._id,
      email: user.email,
      role: user.role,
      status: user.status,
      passwordLength: user.password.length
    });
    
    // Check password
    const isMatch = await user.comparePassword(password);
    console.log('Password match:', isMatch);
    
    if (!isMatch) {
      return res.status(401).json({ message: 'Invalid email or password' });
    }
    
    // Check if user is active
    if (user.status !== 'active') {
      console.log('User not active:', user.status);
      return res.status(401).json({ message: 'Account is inactive or suspended' });
    }
    
    // Generate token
    const token = jwt.sign(
      { userId: user._id },
      process.env.JWT_SECRET || 'your_jwt_secret',
      { expiresIn: '7d' }
    );
    
    res.json({
      _id: user._id,
      name: user.name,
      email: user.email,
      role: user.role || (user.isAdmin ? 'admin' : 'user'),
      token
    });
  } catch (error) {
    console.error('Login error:', error);
    res.status(500).json({ message: error.message });
  }
});

// Add this line at the very end of the file
module.exports = router;