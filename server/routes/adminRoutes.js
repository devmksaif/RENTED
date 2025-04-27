const express = require('express');
const router = express.Router();
const adminController = require('../controllers/adminController');
const auth = require('../middleware/auth');
const adminAuth = require('../middleware/adminAuth');

// Apply auth and admin middleware to all routes
router.use(auth);
router.use(adminAuth);

// Dashboard stats
router.get('/dashboard', adminController.getDashboardStats);

// Products management
router.get('/products', adminController.getAllProducts);
router.delete('/products/:id', adminController.deleteProduct);

// Bookings management
router.get('/bookings', adminController.getAllBookings);
router.patch('/bookings/:id/status', adminController.updateBookingStatus);

// Users management
router.get('/users', adminController.getAllUsers);

module.exports = router;