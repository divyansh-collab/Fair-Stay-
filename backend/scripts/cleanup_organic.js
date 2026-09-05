const mongoose = require('mongoose');
const Listing = require('../models/listing');
const Review = require('../models/review');

async function purgeNonOrganic() {
  await mongoose.connect('mongodb://127.0.0.1:27017/fairstay');
  console.log('Connected to MongoDB. Scanning for non-organic stays...\n');

  const beforeTotal = await Listing.countDocuments();
  console.log(`Total listings before cleanup: ${beforeTotal}`);

  // Find all stays that do NOT have a Google Places API photo URL
  const nonOrganicListings = await Listing.find({
    $or: [
      { 'image.url': { $not: /maps\.googleapis\.com\/maps\/api\/place\/photo/ } },
      { 'image.url': { $regex: /unsplash\.com/i } },
      { 'image.filename': { $regex: /^(varanasi_|prayagraj_|haridwar_|rishikesh_|nashik_|custom_image)/ } },
    ],
  });

  console.log(`Identified ${nonOrganicListings.length} non-organic / seed listings to purge.`);

  for (const listing of nonOrganicListings) {
    if (listing.reviews && listing.reviews.length > 0) {
      await Review.deleteMany({ _id: { $in: listing.reviews } });
    }
    await Listing.findByIdAndDelete(listing._id);
    console.log(`🗑️ Removed: "${listing.title}" (${listing.location})`);
  }

  // Verify remaining listings are 100% organic Google Places
  const organicListings = await Listing.find();
  console.log(`\n🎉 Cleanup Complete!`);
  console.log(`Total 100% Organic Listings Remaining: ${organicListings.length}`);

  // Corridor breakdown
  const corridors = ['Varanasi', 'Prayagraj', 'Haridwar', 'Rishikesh', 'Nashik', 'Ayodhya', 'Mathura'];
  for (const c of corridors) {
    const count = organicListings.filter(l => l.location.toLowerCase().includes(c.toLowerCase())).length;
    console.log(`   • ${c} Corridor: ${count} organic stays`);
  }

  await mongoose.connection.close();
}

purgeNonOrganic();
