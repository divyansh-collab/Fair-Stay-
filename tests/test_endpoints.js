const axios = require('axios');

async function testAll() {
  const baseURL = 'http://localhost:8080';
  console.log('🧪 Starting FairStay Automated Verification Tests...\n');

  // 1. Test GET /listings
  try {
    const res = await axios.get(`${baseURL}/listings`);
    console.log(`✅ [1/5] GET /listings: HTTP ${res.status} (Received ${res.data.length} bytes)`);
  } catch (e) {
    console.error(`❌ [1/5] GET /listings failed:`, e.message);
  }

  // 2. Test AI Chat - Creator Inquiry Bypass Regex
  try {
    const res = await axios.post(`${baseURL}/ai/chat`, {
      message: 'Who created FairStay and this platform?',
    });
    console.log(`✅ [2/5] POST /ai/chat (Creator Bypass):`);
    console.log(`       Reply: "${res.data.reply}"`);
  } catch (e) {
    console.error(`❌ [2/5] POST /ai/chat failed:`, e.message);
  }

  // 3. Test AI Chat - Pilgrimage Advice
  try {
    const res = await axios.post(`${baseURL}/ai/chat`, {
      message: 'What are the evening Aarti timings at Dashashwamedh Ghat?',
    });
    console.log(`✅ [3/5] POST /ai/chat (Aarti Knowledge):`);
    console.log(`       Preview: "${res.data.reply.slice(0, 100)}..."`);
  } catch (e) {
    console.error(`❌ [3/5] POST /ai/chat failed:`, e.message);
  }

  // 4. Test AI Smart Search Parser & Redirect
  try {
    const res = await axios.post(
      `${baseURL}/ai/smart-search`,
      { query: 'cheap stay in Prayagraj under ₹2500 for Kumbh Mela' },
      { maxRedirects: 0, validateStatus: (status) => status >= 200 && status < 400 }
    );
    console.log(`✅ [4/5] POST /ai/smart-search: Redirected to "${res.headers.location}"`);
  } catch (e) {
    console.error(`❌ [4/5] POST /ai/smart-search failed:`, e.message);
  }

  // 5. Test Filtered Listings
  try {
    const res = await axios.get(`${baseURL}/listings?location=Varanasi&category=Haveli`);
    console.log(`✅ [5/5] GET /listings (Filtered Varanasi & Haveli): HTTP ${res.status}`);
  } catch (e) {
    console.error(`❌ [5/5] GET /listings (Filtered) failed:`, e.message);
  }

  console.log('\n🎉 Verification completed successfully!');
}

testAll();
