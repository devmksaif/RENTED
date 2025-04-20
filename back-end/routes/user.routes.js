const express = require('express');
const router = express.Router();
const userController = require('../controllers/user.controller');

// Create a new user
router.post('/', userController.createUser);

// Get user by ID
router.get('/:userId', userController.getUserById);

// Update user profile
router.put('/:userId', userController.updateProfile);

module.exports = router;