const axios = require('axios');

async function testReserveFlow() {
  const baseURL = 'http://localhost:8080';
  console.log('=== TESTING COMPLETE RESERVE & BOOKING FLOW ===\n');

  // 1. Get a sample listing
  const sampleRes = await axios.get(`${baseURL}/api/listings`);
  const sampleListing = sampleRes.data.data[0];
  const listingId = sampleListing._id;
  console.log(`Sample Listing: "${sampleListing.title}" (ID: ${listingId})`);

  // 2. Test: Reserving when NOT logged in
  console.log('\n[TEST 1] Reserving without authentication...');
  const tomorrow = new Date(Date.now() + 24 * 60 * 60 * 1000).toISOString().split('T')[0];
  const afterTomorrow = new Date(Date.now() + 3 * 24 * 60 * 60 * 1000).toISOString().split('T')[0];

  const unauthBookingRes = await axios.post(
    `${baseURL}/listings/${listingId}/bookings`,
    new URLSearchParams({
      'booking[checkIn]': tomorrow,
      'booking[checkOut]': afterTomorrow,
      'booking[guests]': '2',
    }).toString(),
    {
      headers: { 'Content-Type': 'application/x-www-form-urlencoded' },
      maxRedirects: 0,
      validateStatus: (s) => s >= 200 && s < 400,
    }
  );

  console.log('Unauthenticated booking redirect status:', unauthBookingRes.status);
  console.log('Redirect location:', unauthBookingRes.headers.location);
  const unauthPass = unauthBookingRes.status === 302 && unauthBookingRes.headers.location === '/login';
  console.log('✅ TEST 1 Result: Properly intercepted by isLoggedIn and redirected to /login:', unauthPass);

  // 3. Test: Login and redirect back
  console.log('\n[TEST 2] Logging in after booking attempt...');
  const loginCookie = unauthBookingRes.headers['set-cookie'] ? unauthBookingRes.headers['set-cookie'][0] : '';
  
  const loginRes = await axios.post(
    `${baseURL}/login`,
    new URLSearchParams({ username: 'pilgrim@fairstay.com', password: 'pilgrim123' }).toString(),
    {
      headers: {
        'Content-Type': 'application/x-www-form-urlencoded',
        Cookie: loginCookie,
      },
      maxRedirects: 0,
      validateStatus: (s) => s >= 200 && s < 400,
    }
  );

  console.log('Login status:', loginRes.status);
  console.log('Redirect location after login:', loginRes.headers.location);
  const postLoginRedirectPass = loginRes.status === 302 && loginRes.headers.location.includes(`/listings/${listingId}`);
  console.log('✅ TEST 2 Result: Properly redirected back to listing details page:', postLoginRedirectPass);

  // 4. Test: Reserve when authenticated
  console.log('\n[TEST 3] Reserving while authenticated...');
  const authCookie = loginRes.headers['set-cookie'] ? loginRes.headers['set-cookie'][0] : loginCookie;

  const authBookingRes = await axios.post(
    `${baseURL}/listings/${listingId}/bookings`,
    new URLSearchParams({
      'booking[checkIn]': tomorrow,
      'booking[checkOut]': afterTomorrow,
      'booking[guests]': '2',
    }).toString(),
    {
      headers: {
        'Content-Type': 'application/x-www-form-urlencoded',
        Cookie: authCookie,
      },
      maxRedirects: 0,
      validateStatus: (s) => s >= 200 && s < 400,
    }
  );

  console.log('Reserve status:', authBookingRes.status);
  const checkoutUrl = authBookingRes.headers.location;
  console.log('Checkout location:', checkoutUrl);
  const reservePass = authBookingRes.status === 302 && checkoutUrl.includes('/checkout');
  console.log('✅ TEST 3 Result: Booking created and redirected to checkout:', reservePass);

  // 5. Test: Render Checkout
  console.log('\n[TEST 4] Loading Checkout Page...');
  const checkoutRes = await axios.get(`${baseURL}${checkoutUrl}`, {
    headers: { Cookie: authCookie },
  });
  console.log('Checkout Page status:', checkoutRes.status);
  const checkoutPass = checkoutRes.status === 200 && checkoutRes.data.includes('Transparent Price Breakdown');
  console.log('✅ TEST 4 Result: Transparent checkout rendered with price breakdown:', checkoutPass);

  // 6. Test: Confirm Booking
  console.log('\n[TEST 5] Confirming reservation...');
  const bookingId = checkoutUrl.split('/')[2];
  const confirmRes = await axios.post(
    `${baseURL}/bookings/${bookingId}/confirm`,
    {},
    {
      headers: { Cookie: authCookie },
      maxRedirects: 0,
      validateStatus: (s) => s >= 200 && s < 400,
    }
  );

  console.log('Confirm status:', confirmRes.status);
  console.log('Redirect location:', confirmRes.headers.location);
  const confirmPass = confirmRes.status === 302 && confirmRes.headers.location === '/bookings';
  console.log('✅ TEST 5 Result: Reservation confirmed and redirected to My Trips:', confirmPass);

  // 7. Verify in My Trips
  console.log('\n[TEST 6] Checking My Trips (/bookings)...');
  const tripsRes = await axios.get(`${baseURL}/bookings`, {
    headers: { Cookie: authCookie },
  });
  const tripsPass = tripsRes.status === 200 && tripsRes.data.includes('CONFIRMED');
  console.log('✅ TEST 6 Result: Reservation visible in My Trips with CONFIRMED badge:', tripsPass);

  console.log('\n===============================================================');
  const allPassed = unauthPass && postLoginRedirectPass && reservePass && checkoutPass && confirmPass && tripsPass;
  if (allPassed) {
    console.log('🎉 ALL RESERVE & BOOKING FLOW TESTS PASSED (100% SUCCESS)');
  } else {
    console.error('❌ Some tests failed.');
  }
  console.log('===============================================================');
}

testReserveFlow();
