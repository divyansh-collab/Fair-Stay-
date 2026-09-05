require('dotenv').config({ path: require('path').join(__dirname, '..', '..', '.env') });
const mongoose = require('mongoose');
const { fetchStaysFromGooglePlaces } = require('../utils/fetchPlaces');

async function runSync() {
  const localDbUrl = 'mongodb://127.0.0.1:27017/fairstay';
  await mongoose.connect(localDbUrl);
  console.log('Connected to MongoDB. Starting Google Places API sync...');

  const result = await fetchStaysFromGooglePlaces();
  console.log('Sync Result:', JSON.stringify(result, null, 2));

  await mongoose.connection.close();
}

runSync();
