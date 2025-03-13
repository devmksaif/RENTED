const express = require('express');
const { MongoClient } = require('mongodb');

const app = express();
const PORT = 3000;

// MongoDB connection URL (Change this based on your setup)
const mongoURI = 'mongodb://localhost:27017'; // Local MongoDB
const dbName = 'mydatabase'; // Change this to your database name

// Connect to MongoDB
async function connectDB() {
  const client = new MongoClient(mongoURI);
  
  try {
    await client.connect();
    console.log('✅ Connected to MongoDB');
    
    const db = client.db(dbName);
    return db;
  } catch (err) {
    console.error('❌ Error connecting to MongoDB:', err);
  }
}

app.get('/', async (req, res) => {
  const db = await connectDB();
  const collection = db.collection('users');

  const users = await collection.find().toArray();
  res.json(users);
});

app.listen(PORT, () => console.log(`🚀 Server running on http://localhost:${PORT}`));
