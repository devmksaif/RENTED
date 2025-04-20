const UserModel = require('../models/user.model');

const userController = {
  // Create a new user
  createUser: async (req, res) => {
    try {
      const userData = req.body;
      
      if (!userData.email || !userData.name) {
        return res.status(400).json({ 
          success: false, 
          message: 'Email and name are required' 
        });
      }
      
      // Connect to DB
      const { db, client } = await req.app.locals.connectDB();
      const userModel = new UserModel(db);
      
      // Check if user already exists
      const existingUser = await userModel.getByEmail(userData.email);
      
      if (existingUser) {
        await client.close();
        return res.status(400).json({ 
          success: false, 
          message: 'User with this email already exists' 
        });
      }
      
      // Create user
      const result = await userModel.createUser(userData);
      
      await client.close();
      
      return res.status(201).json({
        success: true,
        message: 'User created successfully',
        data: {
          userId: result.insertedId
        }
      });
    } catch (error) {
      console.error('Error in createUser:', error);
      return res.status(500).json({ 
        success: false, 
        message: 'Server error' 
      });
    }
  },

  // Get user by ID
  getUserById: async (req, res) => {
    try {
      const userId = req.params.userId;
      
      // Connect to DB
      const { db, client } = await req.app.locals.connectDB();
      const userModel = new UserModel(db);
      
      // Get user
      const user = await userModel.getById(userId);
      
      await client.close();
      
      if (!user) {
        return res.status(404).json({ 
          success: false, 
          message: 'User not found' 
        });
      }
      
      // Remove sensitive information
      delete user.password;
      
      return res.status(200).json({
        success: true,
        data: user
      });
    } catch (error) {
      console.error('Error in getUserById:', error);
      return res.status(500).json({ 
        success: false, 
        message: 'Server error' 
      });
    }
  },

  // Update user profile
  updateProfile: async (req, res) => {
    try {
      const userId = req.params.userId;
      const profileData = req.body;
      
      // Connect to DB
      const { db, client } = await req.app.locals.connectDB();
      const userModel = new UserModel(db);
      
      // Update profile
      const updated = await userModel.updateProfile(userId, profileData);
      
      await client.close();
      
      if (!updated) {
        return res.status(404).json({ 
          success: false, 
          message: 'User not found or no changes made' 
        });
      }
      
      return res.status(200).json({
        success: true,
        message: 'Profile updated successfully'
      });
    } catch (error) {
      console.error('Error in updateProfile:', error);
      return res.status(500).json({ 
        success: false, 
        message: 'Server error' 
      });
    }
  }
};

module.exports = userController;