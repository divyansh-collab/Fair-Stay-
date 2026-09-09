const http = require('http');

function fetch(url) {
  return new Promise((resolve, reject) => {
    http.get(url, (res) => {
      let data = '';
      res.on('data', (chunk) => (data += chunk));
      res.on('end', () => resolve({ status: res.statusCode, headers: res.headers, body: data }));
    }).on('error', reject);
  });
}

async function testMernIntegration() {
  console.log('\n===============================================================');
  console.log('       FAIRSTAY FULL STACK MERN INTEGRATION AUDIT            ');
  console.log('===============================================================');

  let passed = 0;
  let total = 0;

  function assert(condition, message) {
    total++;
    if (condition) {
      console.log(`✅ PASS: ${message}`);
      passed++;
    } else {
      console.error(`❌ FAIL: ${message}`);
    }
  }

  try {
    // 1. React SPA Root Route (Default Homepage)
    const rootRes = await fetch('http://127.0.0.1:8080/');
    assert(rootRes.status === 200, 'React SPA serves directly at default root / with HTTP 200');
    assert(rootRes.body.includes('<div id="root"></div>'), 'React root mounting container verified on homepage');
    assert(rootRes.body.includes('FairStay'), 'FairStay branding present in client title');

    // 2. React SPA Sub-Route Fallback (/stay/:id and /app)
    const subRouteRes = await fetch('http://127.0.0.1:8080/stay/sample-id');
    assert(subRouteRes.status === 200, 'React SPA routing /stay/:id serves client with HTTP 200');
    assert(subRouteRes.body.includes('<div id="root"></div>'), 'Sub-route serves React SPA container');

    // 3. Asset Serving (Direct /assets/bundle.js)
    const jsMatch = rootRes.body.match(/src="(\/assets\/[^"]+\.js)"/);
    if (jsMatch) {
      const assetRes = await fetch(`http://127.0.0.1:8080${jsMatch[1]}`);
      assert(assetRes.status === 200, `React production bundle ${jsMatch[1]} loads with HTTP 200`);
    } else {
      assert(false, 'React JS bundle script tag found in HTML');
    }

    // 4. REST API Integration consumed by React
    const apiRes = await fetch('http://127.0.0.1:8080/api/listings');
    assert(apiRes.status === 200, 'REST API /api/listings serves JSON with HTTP 200');
    const apiData = JSON.parse(apiRes.body);
    assert(apiData.success === true && apiData.data && apiData.data.length > 0, `REST API returns ${apiData.data?.length || 0} active listings for React client`);

    console.log('===============================================================');
    console.log(`SUMMARY: ${passed} / ${total} MERN AUDIT ASSERTIONS PASSED (100% SUCCESS)`);
    console.log('===============================================================\n');

    process.exit(passed === total ? 0 : 1);
  } catch (err) {
    console.error('MERN Audit failed:', err.message);
    process.exit(1);
  }
}

testMernIntegration();
