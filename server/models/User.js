const mongoose = require('mongoose');
const bcrypt = require('bcryptjs');

const meetingAreaSchema = new mongoose.Schema({
  name: {
    type: String,
    required: true,
    trim: true
  },
  latitude: {
    type: Number,
    required: true
  },
  longitude: {
    type: Number,
    required: true
  },
  isDefault: {
    type: Boolean,
    default: false
  }
}, { _id: true });

const userSchema = new mongoose.Schema({
  name: {
    type: String,
    required: true,
    trim: true
  },
  email: {
    type: String,
    required: true,
    unique: true,
    trim: true,
    lowercase: true
  },
  password: {
    type: String,
    required: false,
    default : '',
    
  },
  phone: {
    type: String,
    trim: true
  },
  accountType: {
    type: String,
    enum: ['renter', 'rentee', 'both'],
    default: 'both'
  },
  address: {
    type: String,
    trim: true
  },
  meetingAreas: [meetingAreaSchema],
  role: {
    type: String,
    enum: ['user', 'admin'],
    default: 'user'
  },
  status: {
    type: String,
    enum: ['active', 'inactive', 'suspended'],
    default: 'active'
  },
  verificationStatus: {
    type: String,
    enum: ['pending', 'verified', 'rejected', 'still'],
    default: 'still'
  },
  // Add firebaseUid for linking with Firebase Authentication
  firebaseUid: {
    type: String,
    unique: true, // Ensure uniqueness for Firebase users
    sparse: true // Allows multiple documents to have null firebaseUid
  }
}, {
  timestamps: true
});

// Pre-save hook to hash password
userSchema.pre('save', async function(next) {
  const user = this;
  
  // Only hash the password if it's modified or new
  if (!user.isModified('password')) return next();
  
  try {
    // Generate salt
    const salt = await bcrypt.genSalt(10);
    // Hash password
    user.password = await bcrypt.hash(user.password, salt);
    next();
  } catch (error) {
    next(error);
  }
});

// Method to compare password
// Add this method to your User schema if it's not already there
userSchema.methods.comparePassword = async function(candidatePassword) {
  try {
    // Use bcrypt.compare to properly compare passwords
    return await bcrypt.compare(candidatePassword, this.password);
  } catch (error) {
    throw error;
  }
};

const User = mongoose.model('User', userSchema);

module.exports = User;