const axios = require('axios');

async function testShowPage() {
  const url = 'http://localhost:8080/listings/6a9883c55789ef28395fd6b7';
  console.log(`Checking interactive listing show page at ${url}...\n`);

  try {
    const res = await axios.get(url);
    console.log('Status Code:', res.status);
    console.log('✅ Has 5-Photo Mosaic Grid:', res.data.includes('gallery-grid'));
    console.log('✅ Has Lightbox Fullscreen Modal:', res.data.includes('galleryModal'));
    console.log('✅ Has Interactive Guest Stepper:', res.data.includes('guestPickerDropdown'));
    console.log('✅ Has All Amenities Modal:', res.data.includes('allAmenitiesModal'));
    console.log('✅ Has Contact Host Modal:', res.data.includes('contactHostModal'));
    console.log('✅ Has AI Concierge Trigger Button:', res.data.includes('askAiAboutStayBtn'));
    console.log('✅ Has Rating Breakdown Bars:', res.data.includes('rating-bar-container'));
    console.log('✅ Has Sticky Jump Nav Bar:', res.data.includes('show-nav-sticky'));
    console.log('✅ Has Open in Google Maps Link:', res.data.includes('Open Google Maps'));
    console.log('✅ Has Nearby Landmarks Chips:', res.data.includes('landmark-chip'));
  } catch (err) {
    console.error('Error fetching show page:', err.message);
  }
}

testShowPage();
