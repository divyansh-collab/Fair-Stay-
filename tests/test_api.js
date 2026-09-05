const axios = require('axios');

async function testApi() {
  const baseURL = 'http://localhost:8080';
  console.log('Testing /api endpoints...\n');

  try {
    const resCorridors = await axios.get(`${baseURL}/api/corridors`);
    console.log('✅ GET /api/corridors:');
    console.log(JSON.stringify(resCorridors.data, null, 2));

    const resListings = await axios.get(`${baseURL}/api/listings?location=Varanasi`);
    console.log(`\n✅ GET /api/listings?location=Varanasi: Found ${resListings.data.count} stays`);
  } catch (err) {
    console.error('API Error:', err.message);
  }
}

testApi();
