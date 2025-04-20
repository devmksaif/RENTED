const multer = require('multer');
const path = require('path');
const fs = require('fs');
const VerificationModel = require('../models/verification.model');
const UserModel = require('../models/user.model');

// Configure storage for uploaded files
const storage = multer.diskStorage({
  destination: (req, file, cb) => {
    const dir = path.join(__dirname, '..', 'uploads', 'verification');
    if (!fs.existsSync(dir)) {
      fs.mkdirSync(dir, { recursive: true });
    }
    cb(null, dir);
  },
  filename: (req, file, cb) => {
    cb(null, `${Date.now()}-${file.originalname}`);
  }
});

// Configure multer
const upload = multer({ 
  storage,
  limits: { fileSize: 5 * 1024 * 1024 }, // 5MB limit
  fileFilter: (req, file, cb) => {
    // Accept only images
    if (file.mimetype.startsWith('image/')) {
      cb(null, true);
    } else {
      cb(new Error('Only image files are allowed!'), false);
    }
  }
});

// Multer middleware for ID uploads
const uploadID = upload.fields([
  { name: 'idFront', maxCount: 1 },
  { name: 'idBack', maxCount: 1 }
]);

// Multer middleware for selfie upload
const uploadSelfie = upload.single('selfie');

// Controller methods
const verificationController = {
  // Upload ID images
  uploadID: (req, res) => {
    uploadID(req, res, async (err) => {
      if (err) {
        return res.status(400).json({ 
          success: false, 
          message: err.message || 'Error uploading files' 
        });
      }

      try {
        if (!req.files || !req.files.idFront || !req.files.idBack) {
          return res.status(400).json({ 
            success: false, 
            message: 'Both front and back ID images are required' 
          });
        }

        const userId = req.body.userId; // In a real app, this would come from authenticated user
        if (!userId) {
          return res.status(400).json({ 
            success: false, 
            message: 'User ID is required' 
          });
        }

        // Connect to DB
        const { db, client } = await req.app.locals.connectDB();
        const verificationModel = new VerificationModel(db);

        // Create verification record
        const result = await verificationModel.createVerification(
          userId,
          req.files.idFront[0].path,
          req.files.idBack[0].path
        );

        await client.close();

        return res.status(200).json({ 
          success: true, 
          message: 'ID verification images uploaded successfully',
          data: {
            verificationId: result.insertedId,
            idFront: req.files.idFront[0].filename,
            idBack: req.files.idBack[0].filename
          }
        });
      } catch (error) {
        console.error('Error in uploadID:', error);
        return res.status(500).json({ 
          success: false, 
          message: 'Server error' 
        });
      }
    });
  },

  // Upload selfie
  uploadSelfie: (req, res) => {
    uploadSelfie(req, res, async (err) => {
      if (err) {
        return res.status(400).json({ 
          success: false, 
          message: err.message || 'Error uploading selfie' 
        });
      }

      try {
        if (!req.file) {
          return res.status(400).json({ 
            success: false, 
            message: 'Selfie image is required' 
          });
        }

        const userId = req.body.userId; // In a real app, this would come from authenticated user
        if (!userId) {
          return res.status(400).json({ 
            success: false, 
            message: 'User ID is required' 
          });
        }

        // Connect to DB
        const { db, client } = await req.app.locals.connectDB();
        const verificationModel = new VerificationModel(db);

        // Update verification with selfie
        const updated = await verificationModel.updateWithSelfie(
          userId,
          req.file.path
        );

        await client.close();

        if (!updated) {
          return res.status(404).json({ 
            success: false, 
            message: 'No pending verification found for this user' 
          });
        }

        return res.status(200).json({ 
          success: true, 
          message: 'Selfie uploaded successfully',
          data: {
            selfie: req.file.filename
          }
        });
      } catch (error) {
        console.error('Error in uploadSelfie:', error);
        return res.status(500).json({ 
          success: false, 
          message: 'Server error' 
        });
      }
    });
  },

  // Get verification status
  getStatus: async (req, res) => {
    try {
      const userId = req.params.userId;
      
      // Connect to DB
      const { db, client } = await req.app.locals.connectDB();
      const verificationModel = new VerificationModel(db);
      
      // Get verification status
      const verification = await verificationModel.getByUserId(userId);
      
      await client.close();
      
      if (!verification) {
        return res.status(404).json({ 
          success: false, 
          message: 'No verification found for this user' 
        });
      }
      
      return res.status(200).json({
        success: true,
        data: {
          userId,
          verificationId: verification._id,
          status: verification.status,
          createdAt: verification.createdAt,
          updatedAt: verification.updatedAt
        }
      });
    } catch (error) {
      console.error('Error in getStatus:', error);
      return res.status(500).json({ 
        success: false, 
        message: 'Server error' 
      });
    }
  },

  // Admin: Update verification status
  updateStatus: async (req, res) => {
    try {
      const { verificationId, status, adminNotes } = req.body;
      
      if (!verificationId || !status) {
        return res.status(400).json({ 
          success: false, 
          message: 'Verification ID and status are required' 
        });
      }
      
      // Connect to DB
      const { db, client } = await req.app.locals.connectDB();
      const verificationModel = new VerificationModel(db);
      const userModel = new UserModel(db);
      
      // Get verification to get user ID
      const verification = await verificationModel.getById(verificationId);
      
      if (!verification) {
        await client.close();
        return res.status(404).json({ 
          success: false, 
          message: 'Verification not found' 
        });
      }
      
      // Update verification status
      const updated = await verificationModel.updateStatus(
        verificationId,
        status,
        adminNotes
      );
      
      // If approved, update user verification status
      if (status === 'approved') {
        await userModel.updateVerificationStatus(verification.userId, true);
      }
      
      await client.close();
      
      if (!updated) {
        return res.status(500).json({ 
          success: false, 
          message: 'Failed to update verification status' 
        });
      }
      
      return res.status(200).json({
        success: true,
        message: 'Verification status updated successfully'
      });
    } catch (error) {
      console.error('Error in updateStatus:', error);
      return res.status(500).json({ 
        success: false, 
        message: 'Server error' 
      });
    }
  },

  // Admin: Get all pending verifications
  getPendingVerifications: async (req, res) => {
    try {
      // Connect to DB
      const { db, client } = await req.app.locals.connectDB();
      const verificationModel = new VerificationModel(db);
      
      // Get pending verifications
      const verifications = await verificationModel.getPendingVerifications();
      
      await client.close();
      
      return res.status(200).json({
        success: true,
        data: verifications
      });
    } catch (error) {
      console.error('Error in getPendingVerifications:', error);
      return res.status(500).json({ 
        success: false, 
        message: 'Server error' 
      });
    }
  }
};

module.exports = verificationController;