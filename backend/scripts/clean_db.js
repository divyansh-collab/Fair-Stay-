const mongoose = require('mongoose');
const Listing = require('../models/listing');

async function cleanDB() {
  await mongoose.connect('mongodb://127.0.0.1:27017/fairstay');
  const allStays = await Listing.find({});
  let removed = 0;
  for (const s of allStays) {
    if (!s.image || !s.image.url || !s.image.url.includes('maps.googleapis.com')) {
      console.log('Removing non-organic stay:', s.title, s.image);
      await Listing.findByIdAndDelete(s._id);
      removed++;
    }
  }
  console.log(`Removed ${removed} non-organic stays.`);
  const total = await Listing.countDocuments();
  console.log('Final Total 100% Organic Google Places Stays:', total);
  await mongoose.connection.close();
}

cleanDB();
