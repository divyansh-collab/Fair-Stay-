const mongoose = require('mongoose');
const Listing = require('../models/listing');

async function checkListings() {
  await mongoose.connect('mongodb://127.0.0.1:27017/FairStay');
  const count = await Listing.countDocuments();
  console.log('Total listings:', count);
  const sample = await Listing.findOne();
  console.log('Sample location:', sample?.location);
  console.log('Sample image:', sample?.image);
  process.exit(0);
}

checkListings();
