require('dotenv').config();
const mongoose = require('mongoose');

async function testAtlas() {
  const uri = process.env.ATLAS_URI || process.env.MONGO_URL;
  console.log('Connecting to MongoDB Atlas Cluster0...');
  try {
    await mongoose.connect(uri, { serverSelectionTimeoutMS: 5000 });
    console.log('🎉 MongoDB Atlas Connected successfully!');
    const collections = await mongoose.connection.db.listCollections().toArray();
    console.log('Collections in FairStay Atlas DB:', collections.map(c => c.name));
    await mongoose.connection.close();
  } catch (err) {
    console.warn('⚠️ Atlas connection note (IP Whitelist check):', err.message);
  }
}

testAtlas();
