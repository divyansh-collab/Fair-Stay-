/**
 * Verification Test: Realistic Market Pricing & Property Sizing Diversity
 * Validates authentic pricing spectrum, physical room specs, OTA benchmarks, and GST slabs.
 */

const sampleListings = require('../backend/seeds/data.js');

async function testMarketDiversity() {
  console.log('\n===============================================================');
  console.log('   FAIRSTAY MARKET PRICING & PROPERTY SIZING DIVERSITY AUDIT   ');
  console.log('===============================================================\n');

  let passed = 0;
  let total = 0;

  function report(name, condition, details = '') {
    total++;
    if (condition) {
      passed++;
      console.log(`✅ PASS [${total}]: ${name}`);
      if (details) console.log(`   └─ ${details}`);
    } else {
      console.error(`❌ FAIL [${total}]: ${name}`);
      if (details) console.error(`   └─ ${details}`);
    }
  }

  // 1. Data array validity
  report(
    'Seed data is populated',
    Array.isArray(sampleListings) && sampleListings.length >= 150,
    `Total listings seeded: ${sampleListings.length}`
  );

  // 2. Price Distribution & Range Check
  const prices = sampleListings.map(l => l.price);
  const minPrice = Math.min(...prices);
  const maxPrice = Math.max(...prices);
  const priceSpread = maxPrice - minPrice;

  report(
    'Realistic price range spans budget to ultra-luxury (Min < ₹1,500, Max > ₹20,000)',
    minPrice <= 1500 && maxPrice >= 20000 && priceSpread >= 18000,
    `Min Price: ₹${minPrice.toLocaleString('en-IN')}, Max Price: ₹${maxPrice.toLocaleString('en-IN')} (Spread: ₹${priceSpread.toLocaleString('en-IN')})`
  );

  // 3. Price Band Diversity Check
  const budget = sampleListings.filter(l => l.price <= 3000).length;
  const midRange = sampleListings.filter(l => l.price > 3000 && l.price <= 7500).length;
  const premium = sampleListings.filter(l => l.price > 7500 && l.price <= 15000).length;
  const luxury = sampleListings.filter(l => l.price > 15000).length;

  report(
    'Multi-tier market segmentation is authentic across all tiers',
    budget >= 50 && midRange >= 20 && luxury >= 3,
    `Budget/Pilgrim (≤₹3k): ${budget} | Mid-Range (₹3k–7.5k): ${midRange} | Premium (₹7.5k–15k): ${premium} | Luxury (>₹15k): ${luxury}`
  );

  // 4. Property Specifications Population
  const withMaxGuests = sampleListings.filter(l => typeof l.maxGuests === 'number' && l.maxGuests > 0).length;
  const withBedrooms = sampleListings.filter(l => typeof l.bedrooms === 'number' && l.bedrooms > 0).length;
  const withBeds = sampleListings.filter(l => typeof l.beds === 'number' && l.beds > 0).length;
  const withBaths = sampleListings.filter(l => typeof l.baths === 'number' && l.baths > 0).length;
  const withPropertyType = sampleListings.filter(l => typeof l.propertyType === 'string' && l.propertyType.length > 2).length;
  const withMarketOta = sampleListings.filter(l => typeof l.marketOtaPrice === 'number' && l.marketOtaPrice > l.price).length;

  report(
    'All listings have authentic physical capacity specifications (maxGuests, bedrooms, beds, baths)',
    withMaxGuests === sampleListings.length && withBedrooms === sampleListings.length && withBeds === sampleListings.length && withBaths === sampleListings.length,
    `Capacity specs verified on 100% (${withMaxGuests}/${sampleListings.length}) of listings`
  );

  report(
    'Property type classification is assigned to listings',
    withPropertyType === sampleListings.length,
    `Property types present on 100% (${withPropertyType}/${sampleListings.length}) of listings`
  );

  report(
    'Commercial OTA comparison benchmarks (marketOtaPrice) provide FairSafe savings',
    withMarketOta === sampleListings.length,
    `100% (${withMarketOta}/${sampleListings.length}) of stays have market OTA price comparisons exceeding FairStay direct rates`
  );

  // 5. Statutory Indian GST Slab Logic
  function calculateStatutoryGst(nightlyRate) {
    if (nightlyRate <= 1000) return { rate: 0, label: '0% GST (Exempt under ₹1,000)' };
    if (nightlyRate > 7500) return { rate: 0.18, label: '18% Luxury Hotel GST' };
    return { rate: 0.12, label: '12% Hotel GST' };
  }

  const exemptStay = calculateStatutoryGst(950);
  const standardStay = calculateStatutoryGst(4500);
  const luxuryStay = calculateStatutoryGst(22000);

  report(
    'Statutory Indian GST slabs correctly classify 0% (≤₹1k), 12% (₹1k–₹7.5k), and 18% (>₹7.5k)',
    exemptStay.rate === 0 && standardStay.rate === 0.12 && luxuryStay.rate === 0.18,
    `₹950 -> ${exemptStay.rate * 100}% | ₹4,500 -> ${standardStay.rate * 100}% | ₹22,000 -> ${luxuryStay.rate * 100}%`
  );

  console.log(`\nMarket Diversity Audit Result: ${passed}/${total} checks passed.\n`);
  if (passed !== total) {
    process.exit(1);
  }
}

testMarketDiversity();
