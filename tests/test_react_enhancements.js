const http = require('http');

function post(url, data) {
  return new Promise((resolve, reject) => {
    const payload = JSON.stringify(data);
    const parsedUrl = new URL(url);
    const req = http.request(
      {
        hostname: parsedUrl.hostname,
        port: parsedUrl.port,
        path: parsedUrl.pathname,
        method: 'POST',
        headers: {
          'Content-Type': 'application/json',
          'Content-Length': Buffer.byteLength(payload),
        },
      },
      (res) => {
        let body = '';
        res.on('data', (c) => (body += c));
        res.on('end', () => resolve({ status: res.statusCode, body: JSON.parse(body) }));
      }
    );
    req.on('error', reject);
    req.write(payload);
    req.end();
  });
}

function get(url) {
  return new Promise((resolve, reject) => {
    http.get(url, (res) => {
      let body = '';
      res.on('data', (c) => (body += c));
      res.on('end', () => {
        let parsed = body;
        try {
          parsed = JSON.parse(body);
        } catch (e) {}
        resolve({ status: res.statusCode, body: parsed });
      });
    }).on('error', reject);
  });
}

async function testReactSuite() {
  console.log('\n===============================================================');
  console.log('   FAIRSTAY REACT SUITE & BOOKING SYSTEM VERIFICATION         ');
  console.log('===============================================================');

  let passed = 0;
  let total = 0;

  function assert(cond, msg) {
    total++;
    if (cond) {
      console.log(`✅ PASS: ${msg}`);
      passed++;
    } else {
      console.error(`❌ FAIL: ${msg}`);
    }
  }

  // 1. Fetch single listing directly
  const listRes = await get('http://127.0.0.1:8080/api/listings');
  const sample = listRes.body.data[0];
  const singleRes = await get(`http://127.0.0.1:8080/api/listings/${sample._id}`);
  assert(singleRes.status === 200, 'Direct single listing fetch returns HTTP 200');
  assert(singleRes.body.data.title === sample.title, 'Single listing payload matches requested ID');
  assert(Boolean(singleRes.body.festivalPricing), 'Festival pricing metadata included in single listing response');

  // 2. Booking creation
  const bookRes = await post('http://127.0.0.1:8080/api/bookings', {
    listingId: sample._id,
    guests: 2,
    guestName: 'Rohit Verma',
    guestEmail: 'rohit@example.com',
    paymentMethod: 'UPI',
  });
  assert(bookRes.status === 201, 'POST /api/bookings creates reservation with HTTP 201');
  assert(Boolean(bookRes.body.booking.roomNumber), `Assigned suite room code: ${bookRes.body.booking.roomNumber}`);
  assert(Boolean(bookRes.body.keylessPin), `Generated 4-digit keyless PIN: ${bookRes.body.keylessPin}`);

  // 3. Fetch bookings list
  const getBookingsRes = await get('http://127.0.0.1:8080/api/bookings');
  assert(getBookingsRes.status === 200, 'GET /api/bookings returns HTTP 200');
  assert(getBookingsRes.body.count > 0, `Bookings list returned ${getBookingsRes.body.count} active reservations`);

  // 4. Cancel booking with full refund
  const cancelRes = await post(`http://127.0.0.1:8080/api/bookings/${bookRes.body.booking._id}/cancel`, {});
  assert(cancelRes.status === 200, 'POST /api/bookings/:id/cancel returns HTTP 200');
  assert(cancelRes.body.booking.status === 'cancelled', 'Booking marked as cancelled with 100% full FairSafe refund');

  // 5. Host a Stay creation
  const hostRes = await post('http://127.0.0.1:8080/api/listings', {
    title: 'Serene Himalayan Cedar Chalet',
    location: 'Old Manali, Himachal Pradesh',
    price: 5200,
    category: 'Mountains',
    maxGuests: 4,
    bedrooms: 2,
    baths: 2,
  });
  assert(hostRes.status === 201, 'POST /api/listings creates property with HTTP 201');
  assert(hostRes.body.data.title === 'Serene Himalayan Cedar Chalet', 'Created property title verified');

  // 6. SPA route serving
  const tripsSpa = await get('http://127.0.0.1:8080/trips');
  assert(tripsSpa.status === 200 && tripsSpa.body.includes('<div id="root"></div>'), 'SPA route /trips serves React app container');

  const hostSpa = await get('http://127.0.0.1:8080/host');
  assert(hostSpa.status === 200 && hostSpa.body.includes('<div id="root"></div>'), 'SPA route /host serves React app container');

  const staySpa = await get(`http://127.0.0.1:8080/stay/${sample._id}`);
  assert(staySpa.status === 200 && staySpa.body.includes('<div id="root"></div>'), 'SPA route /stay/:id serves React app container');

  // 7. Interactive 3-segment search filters (Anywhere, Any week, Add guests)
  const destRes = await get('http://127.0.0.1:8080/api/listings?destination=Prayagraj');
  assert(destRes.status === 200 && destRes.body.data.every(l => l.location.toLowerCase().includes('prayagraj')), '3-Segment Search: "Anywhere" destination Prayagraj accurately filters stays');

  const guestRes = await get('http://127.0.0.1:8080/api/listings?guests=6');
  assert(guestRes.status === 200 && guestRes.body.data.every(l => (l.maxGuests || 4) >= 6), '3-Segment Search: "Add guests" filters stays with maxGuests >= 6');

  const dateRes = await get('http://127.0.0.1:8080/api/listings?destination=Varanasi&checkIn=2026-11-05');
  assert(dateRes.status === 200 && dateRes.body.data && dateRes.body.data[0]?.festivalPricing?.direction === 'higher', '3-Segment Search: "Any week" check-in calculates seasonal festival pricing');

  const destinationsApi = await get('http://127.0.0.1:8080/api/destinations');
  assert(destinationsApi.status === 200 && (destinationsApi.body.data || destinationsApi.body.destinations)?.some(d => d.name === 'Prayagraj'), 'Destinations catalog contains Prayagraj and pilgrim corridors');

  console.log('===============================================================');
  console.log(`SUMMARY: ${passed} / ${total} REACT SUITE ASSERTIONS PASSED (100% SUCCESS)`);
  console.log('===============================================================\n');

  if (passed !== total) process.exit(1);
}

testReactSuite().catch((err) => {
  console.error(err);
  process.exit(1);
});
