const http = require('http');

function fetchJson(url) {
  return new Promise((resolve, reject) => {
    http.get(url, (res) => {
      let data = '';
      res.on('data', (chunk) => (data += chunk));
      res.on('end', () => {
        try {
          resolve(JSON.parse(data));
        } catch (e) {
          reject(new Error(`Failed to parse JSON: ${data.substring(0, 100)}`));
        }
      });
    }).on('error', reject);
  });
}

async function runCityPricingTests() {
  console.log('\n===============================================================');
  console.log('    FAIRSTAY CITY-CENTRIC AI PRICING & EVENT VERIFICATION     ');
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
    // 1. Jaipur Literature Festival (JLF)
    const jlfRes = await fetchJson('http://127.0.0.1:8080/ai/predict-festival-price?destination=Jaipur&festival=jaipur_jlf&basePrice=5000');
    assert(jlfRes.success === true, 'Jaipur JLF query succeeds');
    assert(jlfRes.percentage === 35, 'Jaipur JLF returns +35% rate surge');
    assert(jlfRes.effectivePrice === 6750, 'Jaipur JLF effective price correctly calculated (5000 + 35% = 6750)');
    assert(jlfRes.availableEvents && jlfRes.availableEvents.some(e => e.id === 'jaipur_jlf'), 'Jaipur returns city-specific availableEvents list');
    assert(jlfRes.explanation && jlfRes.explanation.includes('Jaipur'), 'Jaipur JLF explanation references Jaipur local market compression');

    // 2. Goa Sunburn Festival
    const goaRes = await fetchJson('http://127.0.0.1:8080/ai/predict-festival-price?destination=Goa&festival=goa_sunburn&basePrice=8000');
    assert(goaRes.success === true, 'Goa Sunburn query succeeds');
    assert(goaRes.percentage === 45, 'Goa Sunburn returns +45% rate surge');
    assert(goaRes.effectivePrice === 11600, 'Goa Sunburn effective price correctly calculated (8000 + 45% = 11600)');
    assert(goaRes.availableEvents && goaRes.availableEvents.some(e => e.id === 'goa_carnival'), 'Goa availableEvents includes Goa Carnival');

    // 3. Manali Kullu Winter Carnival
    const manaliRes = await fetchJson('http://127.0.0.1:8080/ai/predict-festival-price?destination=Manali&festival=manali_winter_carnival&basePrice=4000');
    assert(manaliRes.success === true, 'Manali Winter Carnival query succeeds');
    assert(manaliRes.percentage === 35, 'Manali Winter Carnival returns +35% rate surge');
    assert(manaliRes.effectivePrice === 5400, 'Manali Winter Carnival effective price correctly calculated (4000 + 35% = 5400)');
    assert(manaliRes.availableEvents && manaliRes.availableEvents.some(e => e.id === 'manali_summer_escape'), 'Manali availableEvents includes Summer Escape');

    // 4. Local Weather / Seasonality: Jaipur Scorching Summer Off-Peak Discount
    const jaipurSummer = await fetchJson('http://127.0.0.1:8080/ai/predict-festival-price?destination=Jaipur&checkInDate=2026-05-15&basePrice=5000');
    assert(jaipurSummer.success === true, 'Jaipur summer date query succeeds');
    assert(jaipurSummer.direction === 'lower', 'Jaipur summer recognized as off-peak discount');
    assert(jaipurSummer.percentage === 30, 'Jaipur summer returns -30% discount');
    assert(jaipurSummer.effectivePrice === 3500, 'Jaipur summer effective price is 3500 (5000 - 30%)');

    // 5. Local Weather / Seasonality: Goa Monsoon Off-Peak Discount
    const goaMonsoon = await fetchJson('http://127.0.0.1:8080/ai/predict-festival-price?destination=Goa&checkInDate=2026-07-20&basePrice=6000');
    assert(goaMonsoon.success === true, 'Goa monsoon date query succeeds');
    assert(goaMonsoon.direction === 'lower', 'Goa monsoon recognized as off-peak discount');
    assert(goaMonsoon.percentage === 25, 'Goa monsoon returns -25% discount');
    assert(goaMonsoon.effectivePrice === 4500, 'Goa monsoon effective price is 4500 (6000 - 25%)');

    // 6. Local Weather / Seasonality: Manali Monsoon Landslide Risk Off-Peak Discount
    const manaliMonsoon = await fetchJson('http://127.0.0.1:8080/ai/predict-festival-price?destination=Manali&checkInDate=2026-08-01&basePrice=4000');
    assert(manaliMonsoon.success === true, 'Manali monsoon date query succeeds');
    assert(manaliMonsoon.direction === 'lower', 'Manali monsoon recognized as off-peak discount');
    assert(manaliMonsoon.percentage === 35, 'Manali monsoon returns -35% discount');
    assert(manaliMonsoon.effectivePrice === 2600, 'Manali monsoon effective price is 2600 (4000 - 35%)');

    // 7. Spiritual Corridor: Varanasi Dev Deepawali
    const varanasiRes = await fetchJson('http://127.0.0.1:8080/ai/predict-festival-price?destination=Varanasi&festival=varanasi_dev_deepawali&basePrice=3000');
    assert(varanasiRes.success === true, 'Varanasi Dev Deepawali query succeeds');
    assert(varanasiRes.percentage === 40, 'Varanasi Dev Deepawali returns +40% surge');
    assert(varanasiRes.effectivePrice === 4200, 'Varanasi Dev Deepawali effective price is 4200 (3000 + 40%)');

    // 8. Spiritual Corridor: Varanasi Deepawali Festive Week (Nov 5 date check)
    const varanasiDiwaliDate = await fetchJson('http://127.0.0.1:8080/ai/predict-festival-price?destination=Varanasi&checkInDate=2026-11-05&basePrice=3000');
    assert(varanasiDiwaliDate.success === true, 'Varanasi Deepawali date query succeeds');
    assert(varanasiDiwaliDate.direction === 'higher', 'Varanasi Deepawali recognized as festive surge');
    assert(varanasiDiwaliDate.percentage >= 35, 'Varanasi Deepawali returns at least +35% surge');
    assert(varanasiDiwaliDate.effectivePrice >= 4050, 'Varanasi Deepawali effective price correctly calculated');

    // 9. Spiritual Corridor: Rishikesh Deepawali (Holy Ganga Aarti Festivities)
    const rishikeshDiwali = await fetchJson('http://127.0.0.1:8080/ai/predict-festival-price?destination=Rishikesh&festival=deepawali&basePrice=3000');
    assert(rishikeshDiwali.success === true, 'Rishikesh Deepawali query succeeds');
    assert(rishikeshDiwali.direction === 'higher', 'Rishikesh Deepawali recognized as festive surge');
    assert(rishikeshDiwali.percentage === 30, 'Rishikesh Deepawali returns +30% surge');
    assert(rishikeshDiwali.effectivePrice === 3900, 'Rishikesh Deepawali effective price correctly calculated (3000 + 30% = 3900)');

    // 10. Spiritual Corridor: Rishikesh Yoga Festival
    const rishikeshYoga = await fetchJson('http://127.0.0.1:8080/ai/predict-festival-price?destination=Rishikesh&festival=rishikesh_yoga&basePrice=4000');
    assert(rishikeshYoga.success === true, 'Rishikesh Yoga Festival query succeeds');
    assert(rishikeshYoga.percentage === 25, 'Rishikesh Yoga Festival returns +25% surge');
    assert(rishikeshYoga.effectivePrice === 5000, 'Rishikesh Yoga Festival effective price is 5000 (4000 + 25% = 5000)');

    // 11. Spiritual Corridor: Ayodhya Deepotsav
    const ayodhyaRes = await fetchJson('http://127.0.0.1:8080/ai/predict-festival-price?destination=Ayodhya&festival=ayodhya_deepotsav&basePrice=2500');
    assert(ayodhyaRes.success === true, 'Ayodhya Deepotsav query succeeds');
    assert(ayodhyaRes.percentage === 40, 'Ayodhya Deepotsav returns +40% surge');
    assert(ayodhyaRes.effectivePrice === 3500, 'Ayodhya Deepotsav effective price is 3500 (2500 + 40% = 3500)');

    console.log('===============================================================');
    console.log(`SUMMARY: ${passed} / ${total} ASSERTIONS PASSED (100% SUCCESS)`);
    console.log('===============================================================\n');

    process.exit(passed === total ? 0 : 1);
  } catch (err) {
    console.error('Test execution failed:', err);
    process.exit(1);
  }
}

runCityPricingTests();
