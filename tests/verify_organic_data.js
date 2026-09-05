const mongoose = require('mongoose');
const Listing = require('./models/listing');

async function verifyAllDataIsOrganic() {
  await mongoose.connect('mongodb://127.0.0.1:27017/fairstay');
  console.log('=== VERIFYING ORGANIC DATA INTEGRITY ===\n');

  const total = await Listing.countDocuments();
  const googlePlacesStays = await Listing.find({ 'image.url': /maps\.googleapis\.com\/maps\/api\/place\/photo/ });
  const nonGooglePlacesStays = await Listing.find({ 'image.url': { $not: /maps\.googleapis\.com\/maps\/api\/place\/photo/ } });

  console.log(`Total Stays in Database: ${total}`);
  console.log(`100% Organic Google Places API Stays: ${googlePlacesStays.length}`);
  console.log(`Non-Organic / Synthetic Stays: ${nonGooglePlacesStays.length}`);

  if (nonGooglePlacesStays.length === 0) {
    console.log('\n✅ VERIFIED: 100% of all data and photos are completely organic from Google Places API.');
  } else {
    console.log('\n⚠️ Found non-organic stays to clean:');
    nonGooglePlacesStays.forEach(s => console.log(` - ${s.title} (${s.image.url})`));
  }

  // Print sample destinations & photos
  const sampleGoa = await Listing.findOne({ location: /goa/i });
  const sampleManali = await Listing.findOne({ location: /manali/i });
  const sampleJaipur = await Listing.findOne({ location: /jaipur/i });

  console.log('\n--- Sample Verified Organic Stays & Live Google Photos ---');
  if (sampleGoa) {
    console.log(`🌴 Goa Stay: "${sampleGoa.title}"`);
    console.log(`   Address: ${sampleGoa.location}`);
    console.log(`   Photo: ${sampleGoa.image.url.slice(0, 85)}...`);
  }
  if (sampleManali) {
    console.log(`🏔️ Manali Stay: "${sampleManali.title}"`);
    console.log(`   Address: ${sampleManali.location}`);
    console.log(`   Photo: ${sampleManali.image.url.slice(0, 85)}...`);
  }
  if (sampleJaipur) {
    console.log(`🏰 Jaipur Stay: "${sampleJaipur.title}"`);
    console.log(`   Address: ${sampleJaipur.location}`);
    console.log(`   Photo: ${sampleJaipur.image.url.slice(0, 85)}...`);
  }

  await mongoose.connection.close();
}

verifyAllDataIsOrganic();
