const express = require('express');
const router = express.Router();
const User = require('../models/User');
const auth = require('../middleware/auth');
const jwt = require('jsonwebtoken');
const authController = require('../controllers/authController');

// Register a new user
router.post('/register', async (req, res) => {
  try {
    const { name, email, password, phone, address, accountType, meetingArea } = req.body;
    
    // Check if user already exists
    const existingUser = await User.findOne({ email });
    if (existingUser) {
      return res.status(400).json({ message: 'User already exists' });
    }
    
    // Prepare user object
    const userObj = {
      name,
      email,
      password,
      phone,
      address,
      accountType: accountType || 'both'
    };
    
    // If a meeting area is provided, add it to the user's meeting areas
    if (meetingArea && meetingArea.name && meetingArea.latitude && meetingArea.longitude) {
      userObj.meetingAreas = [{
        name: meetingArea.name,
        latitude: meetingArea.latitude,
        longitude: meetingArea.longitude,
        isDefault: true
      }];
    }
    
    // Create new user
    const user = new User(userObj);
    
    await user.save();
    
    // Generate token
    const token = jwt.sign(
      { userId: user._id, user },
      process.env.JWT_SECRET || 'your_jwt_secret',
      { expiresIn: '7d' }
    );
    
    res.status(201).json({
      _id: user._id,
      userId : user._id,
      name: user.name,
      email: user.email,
      role: user.role || (user.isAdmin ? 'admin' : 'user'),
      accountType: user.accountType,
      phone : user.phone,
      verificationStatus : user.verificationStatus,
      address : user.address,
      meetingAreas: user.meetingAreas,
      token
    });
  } catch (error) {
    console.error('Registration error:', error);
    res.status(400).json({ message: error.message });
  }
});

// Login user
router.post('/login', async (req, res) => {
  try {
    const { email, password, firebaseUid } = req.body;
    
    // Find user by email
    const user = await User.findOne({ email });
    if (!user) {
      return res.status(401).json({ message: 'Invalid email or password' });
    }
    

    if(firebaseUid){
      user.firebaseUid = firebaseUid;
      const token = jwt.sign(
        { userId: user._id, user },
        process.env.JWT_SECRET || 'your_jwt_secret',
        { expiresIn: '7d' }
      );
      return res.status(200).json({
        _id: user._id,
        userId : user._id,
        name: user.name,
        email: user.email,
        role: user.role || (user.isAdmin ? 'admin' : 'user'),
        accountType: user.accountType,
        phone : user.phone,
        verificationStatus : user.verificationStatus,
        address : user.address,
        meetingAreas: user.meetingAreas,
        token
      });
      
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
      { userId: user._id, user },
      process.env.JWT_SECRET || 'your_jwt_secret',
      { expiresIn: '7d' }
    );
    
    res.json({
      _id: user._id,
      userId : user._id,
      name: user.name,
      email: user.email,
      role: user.role || (user.isAdmin ? 'admin' : 'user'),
      accountType: user.accountType,
      phone : user.phone,
      verificationStatus : user.verificationStatus,
      address : user.address,
      meetingAreas: user.meetingAreas,
      token
    });
  } catch (error) {
    res.status(500).json({ message: error.message });
  }
});

router.post('/check', async (req, res) => {
  try {
    const { email } = req.body;
    
    // Find user by email
    const user = await User.findOne({ email });
    if (!user) {
      return res.status(200).json({ message: 'new' });
    }else{
      return res.status(200).json({ message: 'old' });
    }
     
  } catch (error) {
    res.status(500).json({ message: error.message });
  }
});
router.post('/login-google', async (req, res) => {
  try {
    const { email } = req.body;
    
    // Find user by email
    const user = await User.findOne({ email });
    if (!user) {
      return res.status(401).json({ message: 'Invalid email or password' });
    }
    
  
    // Only check status if it exists in the user model
    if (user.status && user.status !== 'active' && user.status !== undefined) {
      return res.status(401).json({ message: 'Account is inactive or suspended' });
    }
    
    // Generate token
    const token = jwt.sign(
      { userId: user._id, user },
      process.env.JWT_SECRET || 'your_jwt_secret',
      { expiresIn: '7d' }
    );
    
    res.json({
      _id: user._id,
      userId : user._id,
      name: user.name,
      email: user.email,
      role: user.role || (user.isAdmin ? 'admin' : 'user'),
      accountType: user.accountType,
      phone : user.phone,
      verificationStatus : user.verificationStatus,
      address : user.address,
      meetingAreas: user.meetingAreas,
      token
    });
  } catch (error) {
    res.status(500).json({ message: error.message });
  }
});

// Add new route for Google registration completion/login
router.post('/auth/google-login-complete', authController.completeGoogleRegistration);

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

router.put('/update/:userId', async (req, res) => {
  try {
    const userId = req.params.userId;
    const { updates } = req.body;

    // Find the user by ID
    const user = await User.findById(userId);
    if (!user) {
      return res.status(404).json({ message: 'User not found' });
    }
    
    // Update user fields - make sure we're using the string value from updates
    // The error occurs because we're trying to set an object to an enum field
    user.verificationStatus = updates;
    await user.save();
    
    // Return success response
    res.status(200).json({ 
      message: 'User verification status updated successfully',
      verificationStatus: user.verificationStatus
    });

  } catch(error) {
    console.error('Error updating verification status:', error);
    res.status(500).json({ message: error.message });
  }
});

// Update user profile
router.patch('/profile', auth, async (req, res) => {
  const updates = Object.keys(req.body);
  const allowedUpdates = ['name', 'email', 'password', 'phone', 'address', 'accountType', 'currentPassword', 'newPassword', 'meetingArea'];
  const isValidOperation = updates.every(update => allowedUpdates.includes(update));
  
  if (!isValidOperation) {
    return res.status(400).json({ message: 'Invalid updates' });
  }

  try {
    const user = await User.findById(req.user._id);
    
    if (!user) {
      return res.status(404).json({ message: 'User not found' });
    }
    
    // Handle password update
    if (req.body.currentPassword && req.body.newPassword) {
      const isMatch = await user.comparePassword(req.body.currentPassword);
      if (!isMatch) {
        return res.status(400).json({ message: 'Current password is incorrect' });
      }
      user.password = req.body.newPassword;
    } else {
      // Update other fields
      updates.forEach(update => {
        if (update !== 'currentPassword' && update !== 'newPassword') {
          user[update] = req.body[update];
        }
      });
    }
    
    // Handle meeting area update
    if (req.body.meetingArea) {
      const { name, latitude, longitude, isDefault } = req.body.meetingArea;
      
      if (name && latitude !== undefined && longitude !== undefined) {
        // If this area is set as default, unset default for all other areas
        if (isDefault) {
          user.meetingAreas.forEach(existingArea => {
            existingArea.isDefault = false;
          });
        }
        
        user.meetingAreas.push({
          name,
          latitude,
          longitude,
          isDefault: isDefault || false
        });
      }
    }
    
    await user.save();
    
    // Remove password from response
    const userObject = user.toObject();
    delete userObject.password;
    
    res.json(userObject);
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

// Meeting areas routes
router.post('/meeting-areas', auth, async (req, res) => {
  try {
    const user = await User.findById(req.user._id);
    
    if (!user) {
      return res.status(404).json({ message: 'User not found' });
    }
    
    const { action, areaId, area } = req.body;
    
    if (action === 'add' && area) {
      // Validate required fields
      if (!area.name || area.latitude === undefined || area.longitude === undefined) {
        return res.status(400).json({ message: 'Name, latitude, and longitude are required' });
      }
      
      // If this area is set as default, unset default for all other areas
      if (area.isDefault) {
        user.meetingAreas.forEach(existingArea => {
          existingArea.isDefault = false;
        });
      }
      
      // Add new meeting area
      user.meetingAreas.push({
        name: area.name,
        latitude: area.latitude,
        longitude: area.longitude,
        isDefault: area.isDefault || user.meetingAreas.length === 0 // Make default if it's the first one
      });
    } else if (action === 'update' && areaId && area) {
      // Find the area to update
      const meetingAreaIndex = user.meetingAreas.findIndex(a => a._id.toString() === areaId);
      
      if (meetingAreaIndex === -1) {
        return res.status(404).json({ message: 'Meeting area not found' });
      }
      
      // Update the area
      if (area.name) user.meetingAreas[meetingAreaIndex].name = area.name;
      if (area.latitude !== undefined) user.meetingAreas[meetingAreaIndex].latitude = area.latitude;
      if (area.longitude !== undefined) user.meetingAreas[meetingAreaIndex].longitude = area.longitude;
      
      // Handle default status
      if (area.isDefault) {
        // Unset default for all other areas
        user.meetingAreas.forEach((existingArea, index) => {
          existingArea.isDefault = index === meetingAreaIndex;
        });
      }
    } else if (action === 'delete' && areaId) {
      // Find the area to delete
      const meetingAreaIndex = user.meetingAreas.findIndex(a => a._id.toString() === areaId);
      
      if (meetingAreaIndex === -1) {
        return res.status(404).json({ message: 'Meeting area not found' });
      }
      
      // Check if it's the default area
      const isDefault = user.meetingAreas[meetingAreaIndex].isDefault;
      
      // Remove the area
      user.meetingAreas.splice(meetingAreaIndex, 1);
      
      // If it was the default area and there are other areas, set the first one as default
      if (isDefault && user.meetingAreas.length > 0) {
        user.meetingAreas[0].isDefault = true;
      }
    } else if (action === 'set-default' && areaId) {
      // Find the area to set as default
      const meetingAreaIndex = user.meetingAreas.findIndex(a => a._id.toString() === areaId);
      
      if (meetingAreaIndex === -1) {
        return res.status(404).json({ message: 'Meeting area not found' });
      }
      
      // Set as default and unset others
      user.meetingAreas.forEach((existingArea, index) => {
        existingArea.isDefault = index === meetingAreaIndex;
      });
    } else {
      return res.status(400).json({ message: 'Invalid action or missing required parameters' });
    }
    
    await user.save();
    
    // Return the updated user without sensitive information
    const userObject = user.toObject();
    delete userObject.password;
    
    res.json(userObject);
  } catch (error) {
    console.error('Error updating meeting areas:', error);
    res.status(500).json({ message: 'Server error' });
  }
});

module.exports = router;