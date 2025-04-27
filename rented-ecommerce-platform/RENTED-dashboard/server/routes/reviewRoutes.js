const express = require('express');
const router = express.Router();
const reviewController = require('../controllers/reviewController');
const auth = require('../middleware/auth');

// Get reviews for a product (public route)
router.get('/product/:productId', reviewController.getProductReviews);

// Protected routes
router.use(auth);

// Create a new review
router.post('/', reviewController.createReview);

// Get reviews by current user
router.get('/user', reviewController.getUserReviews);

// Update a review
router.patch('/:id', reviewController.updateReview);

// Delete a review
router.delete('/:id', reviewController.deleteReview);

module.exports = router;