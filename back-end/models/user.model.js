const { ObjectId } = require('mongodb');

class UserModel {
  constructor(db) {
    this.collection = db.collection('users');
  }

  // Create a new user
  async createUser(userData) {
    return await this.collection.insertOne({
      ...userData,
      isVerified: false,
      createdAt: new Date(),
      updatedAt: new Date()
    });
  }

  // Get user by ID
  async getById(id) {
    return await this.collection.findOne({ _id: new ObjectId(id) });
  }

  // Get user by email
  async getByEmail(email) {
    return await this.collection.findOne({ email });
  }

  // Update user verification status
  async updateVerificationStatus(userId, isVerified) {
    const result = await this.collection.updateOne(
      { _id: new ObjectId(userId) },
      { 
        $set: { 
          isVerified,
          updatedAt: new Date()
        } 
      }
    );
    
    return result.modifiedCount > 0;
  }

  // Update user profile
  async updateProfile(userId, profileData) {
    const result = await this.collection.updateOne(
      { _id: new ObjectId(userId) },
      { 
        $set: { 
          ...profileData,
          updatedAt: new Date()
        } 
      }
    );
    
    return result.modifiedCount > 0;
  }
}

module.exports = UserModel;