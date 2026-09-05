const axios = require('axios');

async function testAddListingAndPages() {
  const baseURL = 'http://localhost:8080';
  console.log('Testing Add Listing & Interactive Pages...\n');

  // 1. Authenticate as admin
  const loginRes = await axios.post(
    `${baseURL}/login`,
    new URLSearchParams({ username: 'admin', password: 'admin123' }).toString(),
    {
      headers: { 'Content-Type': 'application/x-www-form-urlencoded' },
      maxRedirects: 0,
      validateStatus: (s) => s >= 200 && s < 400,
    }
  );
  const cookie = loginRes.headers['set-cookie'][0];
  console.log('✅ Authenticated session acquired');

  // 2. Add Listing with imageUrl (the exact case that failed in user screenshot)
  const testListingData = {
    'listing[title]': 'Villa Paradiso - Sunset Beachfront Haven',
    'listing[description]': 'A private luxury pool villa situated right by the golden sands of Candolim with high speed wifi and serene outdoor patio.',
    'listing[location]': 'Candolim, Goa',
    'listing[country]': 'India',
    'listing[price]': '5500',
    'listing[category]': 'Beachfront',
    'listing[imageUrl]': 'https://images.unsplash.com/photo-1512917774080-9991f1c4c750?auto=format&fit=crop&w=1200&q=80',
    'listing[amenities]': ['High-Speed Wi-Fi (100+ Mbps)', 'Private Swimming Pool', 'Air Conditioning'],
  };

  const createRes = await axios.post(
    `${baseURL}/listings`,
    new URLSearchParams(testListingData).toString(),
    {
      headers: {
        'Content-Type': 'application/x-www-form-urlencoded',
        Cookie: cookie,
      },
      maxRedirects: 0,
      validateStatus: (s) => s >= 200 && s < 400,
    }
  );

  console.log('Create Listing Status:', createRes.status);
  console.log('Redirect Location:', createRes.headers.location);

  if (createRes.status === 302 && createRes.headers.location.startsWith('/listings/')) {
    console.log('✅ PASS: Listing successfully created with listing[imageUrl]! No 400 error.');
  } else {
    console.error('❌ FAIL: Listing creation failed with status', createRes.status);
  }

  // 3. Check new host page renders
  const newPageRes = await axios.get(`${baseURL}/listings/new`, { headers: { Cookie: cookie } });
  const hasInteractiveGrid = newPageRes.data.includes('categoryTileGrid');
  const hasLivePreview = newPageRes.data.includes('livePreviewContainer');
  const hasDynamicPrice = newPageRes.data.includes('previewTotalPrice');
  console.log(`✅ Become a Host Page (/listings/new): Interactive grid: ${hasInteractiveGrid}, Live Preview: ${hasLivePreview}, Dynamic Price: ${hasDynamicPrice}`);

  // 4. Check login page renders
  const loginPageRes = await axios.get(`${baseURL}/login`);
  const hasQuickAdmin = loginPageRes.data.includes('quickAdminBtn');
  const hasEyeToggle = loginPageRes.data.includes('togglePasswordBtn');
  console.log(`✅ Login Page (/login): 1-Click Demo logins: ${hasQuickAdmin}, Password eye toggle: ${hasEyeToggle}`);

  // 5. Check signup page renders
  const signupPageRes = await axios.get(`${baseURL}/signup`);
  const hasStrengthBar = signupPageRes.data.includes('pwdStrengthBar');
  const hasAvatarPreview = signupPageRes.data.includes('avatarPreviewImg');
  console.log(`✅ Signup Page (/signup): Password strength meter: ${hasStrengthBar}, Live avatar preview: ${hasAvatarPreview}`);
}

testAddListingAndPages();
