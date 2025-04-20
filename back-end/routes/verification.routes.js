const express = require('express');
const router = express.Router();
const verificationController = require('../controllers/verification.controller');

// Upload ID images
router.post('/id', verificationController.uploadID);

// Upload selfie
router.post('/selfie', verificationController.uploadSelfie);

// Get verification status
router.get('/status/:userId', verificationController.getStatus);

// Admin routes
router.put('/admin/update-status', verificationController.updateStatus);
router.get('/admin/pending', verificationController.getPendingVerifications);

module.exports = router;