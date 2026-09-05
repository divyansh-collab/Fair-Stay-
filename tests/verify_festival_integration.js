const axios = require('axios');

async function testFestivalIntegration() {
  const baseURL = 'http://localhost:8080';
  console.log('=== VERIFYING AI FESTIVAL PREDICTOR & TRANSPARENCY ===\n');

  try {
    // 1. Christmas in Goa (User's exact example)
    console.log('[TEST 1] Querying Christmas in Goa via /ai/predict-festival-price...');
    const resChristmas = await axios.get(`${baseURL}/ai/predict-festival-price`, {
      params: { destination: 'Goa', festival: 'christmas', basePrice: 4000 },
    });
    console.log('Status:', resChristmas.status);
    console.log('Festival:', resChristmas.data.festivalName);
    console.log('Percentage:', resChristmas.data.signedPercentage);
    console.log('Effective Price: ₹' + resChristmas.data.effectivePrice);
    console.log('Customer Explanation:', resChristmas.data.explanation);
    const passChristmas = resChristmas.data.percentage === 25 && resChristmas.data.effectivePrice === 5000;
    console.log('✅ TEST 1 Christmas Passed (25% increase):', passChristmas);

    // 2. Diwali in Jaipur via POST
    console.log('\n[TEST 2] Querying Diwali via POST /ai/predict-festival-price...');
    const resDiwali = await axios.post(`${baseURL}/ai/predict-festival-price`, {
      destination: 'Jaipur',
      festival: 'diwali',
      basePrice: 5000,
    });
    console.log('Festival:', resDiwali.data.festivalName);
    console.log('Percentage:', resDiwali.data.signedPercentage);
    console.log('Effective Price: ₹' + resDiwali.data.effectivePrice);
    const passDiwali = resDiwali.data.percentage === 30 && resDiwali.data.effectivePrice === 6500;
    console.log('✅ TEST 2 Diwali Passed (30% increase):', passDiwali);

    // 3. Raksha Bandhan
    console.log('\n[TEST 3] Querying Raksha Bandhan...');
    const resRakhi = await axios.get(`${baseURL}/ai/predict-festival-price`, {
      params: { destination: 'Manali', festival: 'rakshabandhan', basePrice: 3500 },
    });
    console.log('Festival:', resRakhi.data.festivalName);
    console.log('Percentage:', resRakhi.data.signedPercentage);
    const passRakhi = resRakhi.data.percentage === 18;
    console.log('✅ TEST 3 Raksha Bandhan Passed (18% increase):', passRakhi);

    // 4. Holi
    console.log('\n[TEST 4] Querying Holi...');
    const resHoli = await axios.get(`${baseURL}/ai/predict-festival-price`, {
      params: { destination: 'Pushkar', festival: 'holi', basePrice: 3000 },
    });
    console.log('Festival:', resHoli.data.festivalName);
    console.log('Percentage:', resHoli.data.signedPercentage);
    const passHoli = resHoli.data.percentage === 20;
    console.log('✅ TEST 4 Holi Passed (20% increase):', passHoli);

    // 5. REST API Route: /api/festival-pricing
    console.log('\n[TEST 5] Querying REST API endpoint /api/festival-pricing...');
    const resApi = await axios.get(`${baseURL}/api/festival-pricing`, {
      params: { destination: 'Goa', festival: 'christmas', basePrice: 4000 },
    });
    const passApi = resApi.status === 200 && resApi.data.percentage === 25;
    console.log('✅ TEST 5 REST API /api/festival-pricing Passed:', passApi);

    // 6. UI Show Page Render
    console.log('\n[TEST 6] Inspecting Show Page HTML for AI Predictor & Transparency...');
    const resShow = await axios.get(`${baseURL}/listings/6a9883c55789ef28395fd6b7`);
    const hasNightlySubtext = resShow.data.includes('normalBasePriceSubtext');
    const hasActiveSurgeAlert = resShow.data.includes('activeFestivalAlertBox');
    const hasPredictorModal = resShow.data.includes('festivalPredictorModal');
    const hasPredictSelect = resShow.data.includes('predictFestivalSelect');
    console.log('Has Normal Baseline Subtext:', hasNightlySubtext);
    console.log('Has Active Festival Surge Alert Box:', hasActiveSurgeAlert);
    console.log('Has AI Festival Predictor Modal:', hasPredictorModal);
    console.log('Has Festival Selection Dropdown:', hasPredictSelect);
    const passUI = hasNightlySubtext && hasActiveSurgeAlert && hasPredictorModal && hasPredictSelect;
    console.log('✅ TEST 6 UI Show Page Elements Passed:', passUI);

    console.log('\n===============================================================');
    if (passChristmas && passDiwali && passRakhi && passHoli && passApi && passUI) {
      console.log('🎉 ALL AI FESTIVAL PREDICTOR & TRANSPARENCY TESTS PASSED (100%)');
    } else {
      console.error('❌ Some tests failed');
    }
    console.log('===============================================================');
  } catch (err) {
    console.error('Error during test:', err.message);
  }
}

testFestivalIntegration();
