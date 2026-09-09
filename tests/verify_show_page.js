const axios = require('axios');

async function testShowPage() {
  try {
    const listRes = await axios.get('http://localhost:8080/api/listings');
    const firstListing = listRes.data && listRes.data.data && listRes.data.data[0];
    const listingId = firstListing ? firstListing._id : '6a9be408df22c2e92d847049';
    const url = `http://localhost:8080/listings/${listingId}`;
    console.log(`Checking interactive listing show page at ${url}...\n`);

    const res = await axios.get(url);
    console.log('Status Code:', res.status);
    console.log('✅ Has 5-Photo Mosaic Bento Grid:', res.data.includes('photo-bento-grid') || res.data.includes('gallery-grid'));
    console.log('✅ Has Lightbox Fullscreen Modal:', res.data.includes('galleryModal'));
    console.log('✅ Has Interactive Guest Stepper:', res.data.includes('guestPickerDropdown'));
    console.log('✅ Has All Amenities Modal:', res.data.includes('allAmenitiesModal'));
    console.log('✅ Has Contact Host Modal:', res.data.includes('contactHostModal'));
    console.log('✅ Has AI Concierge Trigger Button:', res.data.includes('askAiAboutStayBtn'));
    console.log('✅ Has Rating Breakdown Bars:', res.data.includes('rating-bar-container'));
    console.log('✅ Has Sticky Jump Nav Bar:', res.data.includes('show-nav-sticky'));
    console.log('✅ Has Open in Google Maps Link:', res.data.includes('Open Google Maps') || res.data.includes('maps.google.com'));
    console.log('✅ Has Nearby Landmarks Chips:', res.data.includes('landmark-chip'));
  } catch (err) {
    console.error('Error fetching show page:', err.message);
  }
}

testShowPage();
