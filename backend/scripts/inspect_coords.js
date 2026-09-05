const mongoose = require('mongoose');
const Listing = require('../models/listing');

async function inspectCoords() {
  await mongoose.connect('mongodb://127.0.0.1:27017/fairstay');
  const sample = await Listing.find().limit(5);
  for (const s of sample) {
    console.log(`Stay: "${s.title}"`);
    console.log(`  Location: ${s.location}`);
    console.log(`  Geometry:`, JSON.stringify(s.geometry));
  }
  await mongoose.connection.close();
}

inspectCoords();
