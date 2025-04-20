const { MongoClient, ObjectId } = require('mongodb');

// MongoDB connection URL
const mongoURI = 'mongodb://localhost:27017';
const dbName = 'rented';
const collectionName = 'verifications';

// Connect to MongoDB
async function connectDB() {
  const client = new MongoClient(mongoURI);
  
  try {
    await client.connect();
    console.log('✅ Connected to MongoDB');
    
    const db = client.db(dbName);
    return { db, client };
  } catch (err) {
    console.error('❌ Error connecting to MongoDB:', err);
    throw err;
  }
}

// Create a new verification record
async function createVerification(userId, idFrontPath, idBackPath) {
  const { db, client } = await connectDB();
  
  try {
    const collection = db.collection(collectionName);
    
    const result = await collection.insertOne({
      userId,
      idFrontPath,
      idBackPath,
      selfieImagePath: null,
      status: 'pending_selfie', // Waiting for selfie upload
      createdAt: new Date(),
      updatedAt: new Date()
    });
    
    return result.insertedId;
  } finally {
    await client.close();
  }
}

// Update verification with selfie
async function updateVerificationWithSelfie(userId, selfieImagePath) {
  const { db, client } = await connectDB();
  
  try {
    const collection = db.collection(collectionName);
    
    const result = await collection.updateOne(
      { userId, status: 'pending_selfie' },
      { 
        $set: { 
          selfieImagePath,
          status: 'under_review', // Now under admin review
          updatedAt: new Date()
        } 
      }
    );
    
    return result.modifiedCount > 0;
  } finally {
    await client.close();
  }
}

// Get verification status
async function getVerificationStatus(userId) {
  const { db, client } = await connectDB();
  
  try {
    const collection = db.collection(collectionName);
    
    const verification = await collection.findOne({ userId });
    
    if (!verification) {
      return { exists: false };
    }
    
    return {
      exists: true,
      status: verification.status,
      createdAt: verification.createdAt,
      updatedAt: verification.updatedAt
    };
  } finally {
    await client.close();
  }
}

// Admin: Update verification status
async function updateVerificationStatus(verificationId, newStatus, adminNotes = '') {
  const { db, client } = await connectDB();
  
  try {
    const collection = db.collection(collectionName);
    
    const result = await collection.updateOne(
      { _id: new ObjectId(verificationId) },
      { 
        $set: { 
          status: newStatus,
          adminNotes,
          updatedAt: new Date()
        } 
      }
    );
    
    return result.modifiedCount > 0;
  } finally {
    await client.close();
  }
}

// Admin: Get all pending verifications
async function getPendingVerifications() {
  const { db, client } = await connectDB();
  
  try {
    const collection = db.collection(collectionName);
    
    return await collection.find({ status: 'under_review' }).toArray();
  } finally {
    await client.close();
  }
}

module.exports = {
  createVerification,
  updateVerificationWithSelfie,
  getVerificationStatus,
  updateVerificationStatus,
  getPendingVerifications
};