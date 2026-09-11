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

    // 12. Universal Christmas Dates (Dec 25 check-in across multiple destinations)
    const goaXmas = await fetchJson('http://127.0.0.1:8080/ai/predict-festival-price?destination=Goa&checkInDate=2026-12-25&basePrice=6000');
    assert(goaXmas.success === true, 'Goa Christmas Dec 25 date query succeeds');
    assert(goaXmas.direction === 'higher', 'Goa Christmas recognized as peak holiday surge');
    assert(goaXmas.percentage === 30, 'Goa Christmas returns +30% holiday surge');
    assert(goaXmas.effectivePrice === 7800, 'Goa Christmas effective price is 7800 (6000 + 30%)');

    const manaliXmas = await fetchJson('http://127.0.0.1:8080/ai/predict-festival-price?destination=Manali&checkInDate=2026-12-25&basePrice=4000');
    assert(manaliXmas.success === true, 'Manali Christmas Dec 25 date query succeeds');
    assert(manaliXmas.direction === 'higher', 'Manali Christmas recognized as peak snow surge');
    assert(manaliXmas.percentage === 35, 'Manali Christmas returns +35% snow surge');
    assert(manaliXmas.effectivePrice === 5400, 'Manali Christmas effective price is 5400 (4000 + 35%)');

    const varanasiXmas = await fetchJson('http://127.0.0.1:8080/ai/predict-festival-price?destination=Varanasi&checkInDate=2026-12-25&basePrice=3000');
    assert(varanasiXmas.success === true, 'Varanasi Christmas Dec 25 date query succeeds');
    assert(varanasiXmas.direction === 'higher', 'Varanasi Christmas recognized as winter holiday surge');
    assert(varanasiXmas.percentage === 25, 'Varanasi Christmas returns +25% holiday surge');

    // 13. Tourist Destinations Exemption: Manali & Goa do NOT surge for Diwali
    const goaDiwali = await fetchJson('http://127.0.0.1:8080/ai/predict-festival-price?destination=Goa&festival=diwali&basePrice=5000');
    assert(goaDiwali.success === true, 'Goa Diwali query succeeds');
    assert(goaDiwali.percentage === 0, 'Goa does NOT hike for Diwali (0% holiday surge)');
    assert(goaDiwali.effectivePrice === 5000, 'Goa maintains direct baseline rate (₹5,000) during Diwali');

    const manaliDiwali = await fetchJson('http://127.0.0.1:8080/ai/predict-festival-price?destination=Manali&festival=diwali&basePrice=4000');
    assert(manaliDiwali.success === true, 'Manali Diwali query succeeds');
    assert(manaliDiwali.percentage === 0, 'Manali does NOT hike for Diwali (0% holiday surge)');
    assert(manaliDiwali.effectivePrice === 4000, 'Manali maintains direct baseline rate (₹4,000) during Diwali');

    // 14. Regional Specificity: Janmashtami ONLY hikes in Mathura and Prayagraj
    const mathuraJanmashtami = await fetchJson('http://127.0.0.1:8080/ai/predict-festival-price?destination=Mathura&festival=janmashtami&basePrice=3000');
    assert(mathuraJanmashtami.success === true, 'Mathura Janmashtami query succeeds');
    assert(mathuraJanmashtami.percentage === 40, 'Mathura Janmashtami returns +40% surge');
    assert(mathuraJanmashtami.effectivePrice === 4200, 'Mathura Janmashtami effective price is 4200 (3000 + 40%)');

    const prayagrajJanmashtami = await fetchJson('http://127.0.0.1:8080/ai/predict-festival-price?destination=Prayagraj&festival=janmashtami&basePrice=2500');
    assert(prayagrajJanmashtami.success === true, 'Prayagraj Janmashtami query succeeds');
    assert(prayagrajJanmashtami.percentage === 30, 'Prayagraj Janmashtami returns +30% surge');

    const goaJanmashtami = await fetchJson('http://127.0.0.1:8080/ai/predict-festival-price?destination=Goa&festival=janmashtami&basePrice=5000');
    assert(goaJanmashtami.success === true, 'Goa Janmashtami query succeeds');
    assert(goaJanmashtami.percentage === 0, 'Goa does NOT hike for Janmashtami (0% surge)');

    // 15. Regional Specificity: Ganpati Mahotsav ONLY hikes in Maharashtra
    const mumbaiGanpati = await fetchJson('http://127.0.0.1:8080/ai/predict-festival-price?destination=Mumbai&festival=ganpati&basePrice=6000');
    assert(mumbaiGanpati.success === true, 'Mumbai Ganpati query succeeds');
    assert(mumbaiGanpati.percentage === 30, 'Mumbai Ganpati returns +30% surge');
    assert(mumbaiGanpati.effectivePrice === 7800, 'Mumbai Ganpati effective price is 7800 (6000 + 30%)');

    const manaliGanpati = await fetchJson('http://127.0.0.1:8080/ai/predict-festival-price?destination=Manali&festival=ganpati&basePrice=4000');
    assert(manaliGanpati.success === true, 'Manali Ganpati query succeeds');
    assert(manaliGanpati.percentage === 0, 'Manali does NOT hike for Ganpati (0% surge)');

    // 16. Christmas Dec 26 date check
    const goaXmas26 = await fetchJson('http://127.0.0.1:8080/ai/predict-festival-price?destination=Goa&checkInDate=2026-12-26&basePrice=6000');
    assert(goaXmas26.percentage === 30, 'Goa Dec 26 date correctly applies Christmas surge (+30%)');

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
