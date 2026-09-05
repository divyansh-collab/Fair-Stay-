const mongoose = require('mongoose');
const Listing = require('../models/listing');

async function getPhotos() {
  await mongoose.connect('mongodb://127.0.0.1:27017/FairStay');
  const goa = await Listing.findOne({ location: /Goa/i });
  const manali = await Listing.findOne({ location: /Manali/i });
  const jaipur = await Listing.findOne({ location: /Jaipur/i });
  const kerala = await Listing.findOne({ location: /Munnar|Kerala/i });
  const udaipur = await Listing.findOne({ location: /Udaipur/i });
  const prayagraj = await Listing.findOne({ location: /Prayagraj/i });

  console.log('Goa:', goa?.image?.url);
  console.log('Manali:', manali?.image?.url);
  console.log('Jaipur:', jaipur?.image?.url);
  console.log('Kerala:', kerala?.image?.url);
  console.log('Udaipur:', udaipur?.image?.url);
  console.log('Prayagraj:', prayagraj?.image?.url);
  process.exit(0);
}

getPhotos();
