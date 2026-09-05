const Listing = require('../models/listing');
const mongoose = require('mongoose');
const axios = require('axios');

async function checkPhotos() {
  await mongoose.connect('mongodb://127.0.0.1:27017/fairstay');
  const allStays = await Listing.find();
  const googlePlacesStays = allStays.filter(s => s.image && s.image.url && s.image.url.includes('maps.googleapis.com'));
  const unsplashStays = allStays.filter(s => s.image && s.image.url && s.image.url.includes('unsplash.com'));

  console.log(`Total Stays in DB: ${allStays.length}`);
  console.log(`Google Places API Stays: ${googlePlacesStays.length}`);
  console.log(`Curated Unsplash CDN Stays: ${unsplashStays.length}`);

  if (googlePlacesStays.length > 0) {
    const sample = googlePlacesStays[0];
    console.log(`\nSample Google Places Stay: "${sample.title}"`);
    console.log(`Sample Photo URL: ${sample.image.url.slice(0, 80)}...`);

    try {
      const res = await axios.get(sample.image.url, { maxRedirects: 2 });
      console.log(`Photo API response: HTTP ${res.status}, Content-Type: ${res.headers['content-type']}`);
    } catch (e) {
      console.log(`Photo API check:`, e.message);
    }
  }

  await mongoose.connection.close();
}

checkPhotos();
