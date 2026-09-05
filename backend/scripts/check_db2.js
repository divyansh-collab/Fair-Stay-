const mongoose = require('mongoose');
const Listing = require('../models/listing');

async function checkListings() {
  await mongoose.connect('mongodb://127.0.0.1:27017/fairstay');
  const count = await Listing.countDocuments();
  console.log('Total listings in fairstay:', count);
  const goa = await Listing.findOne({ location: /Goa/i });
  const manali = await Listing.findOne({ location: /Manali/i });
  const jaipur = await Listing.findOne({ location: /Jaipur/i });
  const kerala = await Listing.findOne({ location: /Munnar|Kerala/i });
  console.log('Goa Stay:', goa?.title, '| Image:', goa?.image?.url);
  console.log('Manali Stay:', manali?.title, '| Image:', manali?.image?.url);
  console.log('Jaipur Stay:', jaipur?.title, '| Image:', jaipur?.image?.url);
  console.log('Kerala Stay:', kerala?.title, '| Image:', kerala?.image?.url);
  process.exit(0);
}

checkListings();
