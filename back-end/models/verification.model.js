const { ObjectId } = require('mongodb');

class VerificationModel {
  constructor(db) {
    this.collection = db.collection('verifications');
  }

  // Create a new verification record
  async createVerification(userId, idFrontPath, idBackPath) {
    return await this.collection.insertOne({
      userId,
      idFrontPath,
      idBackPath,
      selfieImagePath: null,
      status: 'pending_selfie', // Waiting for selfie upload
      createdAt: new Date(),
      updatedAt: new Date()
    });
  }

  // Update verification with selfie
  async updateWithSelfie(userId, selfieImagePath) {
    const result = await this.collection.updateOne(
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
  }

  // Get verification status by user ID
  async getByUserId(userId) {
    return await this.collection.findOne({ userId });
  }

  // Get verification by ID
  async getById(id) {
    return await this.collection.findOne({ _id: new ObjectId(id) });
  }

  // Update verification status
  async updateStatus(id, newStatus, adminNotes = '') {
    const result = await this.collection.updateOne(
      { _id: new ObjectId(id) },
      { 
        $set: { 
          status: newStatus,
          adminNotes,
          updatedAt: new Date()
        } 
      }
    );
    
    return result.modifiedCount > 0;
  }

  // Get all verifications with a specific status
  async getByStatus(status) {
    return await this.collection.find({ status }).toArray();
  }

  // Get all pending verifications
  async getPendingVerifications() {
    return await this.collection.find({ status: 'under_review' }).toArray();
  }
}

module.exports = VerificationModel;