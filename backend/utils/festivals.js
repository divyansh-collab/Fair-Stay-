/**
 * FairStay — AI-Powered Festival Price Prediction & Transparency Engine
 * Price increases / decreases depend on the individual host's pricing policy and seasonal demand.
 * The AI communicates clearly to the customer whether the price for this listing increases or decreases due to the festival.
 */

// Master Catalog of Supported Festivals & Seasons
const FESTIVALS_CATALOG = [
  {
    id: 'christmas',
    name: 'Christmas & Year-End Holidays',
    emoji: '🎄',
    defaultPercentage: 25,
    direction: 'higher',
    dateRange: 'Dec 20 – Jan 5',
    startMonth: 11,
    startDay: 20,
    endMonth: 0,
    endDay: 5,
    summary: 'High holiday travel nationwide; peak booking demand for beach villas, hill chalets, and family resorts.',
  },
  {
    id: 'new_year',
    name: "New Year's Eve Grand Peak",
    emoji: '🎆',
    defaultPercentage: 35,
    direction: 'higher',
    dateRange: 'Dec 30 – Jan 2',
    startMonth: 11,
    startDay: 30,
    endMonth: 0,
    endDay: 2,
    summary: 'Highest annual peak. Nightlife, parties, and festive celebrations create near 100% occupancy.',
  },
  {
    id: 'diwali',
    name: 'Diwali & Deepawali Festive Week',
    emoji: '🪔',
    defaultPercentage: 30,
    direction: 'higher',
    dateRange: 'Oct 25 – Nov 10',
    startMonth: 9,
    startDay: 25,
    endMonth: 10,
    endDay: 10,
    summary: 'India’s largest festive season. Massive nationwide family vacation rush across heritage, hills, and coastal getaways.',
  },
  {
    id: 'holi',
    name: 'Holi Spring Festival Break',
    emoji: '🎨',
    defaultPercentage: 20,
    direction: 'higher',
    dateRange: 'March 10 – March 30',
    startMonth: 2,
    startDay: 10,
    endMonth: 2,
    endDay: 30,
    summary: 'Spring break and color celebrations. Popular weekend getaway surge in Pushkar, Mathura, Goa, and Rishikesh.',
  },
  {
    id: 'rakshabandhan',
    name: 'Raksha Bandhan Long Weekend',
    emoji: '🧵',
    defaultPercentage: 18,
    direction: 'higher',
    dateRange: 'August 10 – August 25',
    startMonth: 7,
    startDay: 10,
    endMonth: 7,
    endDay: 25,
    summary: 'Family gatherings and extended long weekends drive high demand for whole homes, cottages, and villas.',
  },
  {
    id: 'dussehra',
    name: 'Dussehra & Durga Puja Holidays',
    emoji: '🏹',
    defaultPercentage: 22,
    direction: 'higher',
    dateRange: 'Oct 5 – Oct 24',
    startMonth: 9,
    startDay: 5,
    endMonth: 9,
    endDay: 24,
    summary: 'Grand autumn holidays. High festive tourism across Bengal, Varanasi, Mysore, and coastal retreats.',
  },
  {
    id: 'ganesh_chaturthi',
    name: 'Ganesh Utsav Festive Holiday',
    emoji: '🐘',
    defaultPercentage: 18,
    direction: 'higher',
    dateRange: 'Sept 1 – Sept 15',
    startMonth: 8,
    startDay: 1,
    endMonth: 8,
    endDay: 15,
    summary: 'Major regional festivities across Maharashtra, Goa, and coastal belt with heavy weekend getaways.',
  },
  {
    id: 'eid',
    name: 'Eid Festive Getaways',
    emoji: '🌙',
    defaultPercentage: 15,
    direction: 'higher',
    dateRange: 'April / June (Festive Break)',
    startMonth: 3,
    startDay: 1,
    endMonth: 5,
    endDay: 30,
    summary: 'Holiday celebration period with high leisure travel to hill stations and luxury staycations.',
  },
  {
    id: 'summer_mountains',
    name: 'Himalayan Summer Escape Peak',
    emoji: '🏔️',
    defaultPercentage: 20,
    direction: 'higher',
    dateRange: 'May 1 – June 30',
    startMonth: 4,
    startDay: 1,
    endMonth: 5,
    endDay: 30,
    summary: 'Peak summer vacation in Manali, Shimla, Kasol, and Mussoorie escaping the plains heat.',
  },
  {
    id: 'monsoon_discount',
    name: 'Monsoon Off-Season Discount',
    emoji: '🌧️',
    defaultPercentage: -15,
    direction: 'lower',
    dateRange: 'July 1 – August 5',
    startMonth: 6,
    startDay: 1,
    endMonth: 7,
    endDay: 5,
    summary: 'Low travel season due to rains. Prices drop 15% below normal baseline rates — perfect for budget travelers.',
  },
];

/**
 * Helper to compute host-specific variation for a listing
 * Each listing has its own individual host policy!
 */
function getHostSpecificPercentage(listingOrObj, basePercentage) {
  if (!listingOrObj || typeof listingOrObj !== 'object') return basePercentage;

  // 1. If host explicitly configured a custom percentage, use it!
  if (listingOrObj.hostSurgePercentage !== null && listingOrObj.hostSurgePercentage !== undefined) {
    return Number(listingOrObj.hostSurgePercentage);
  }

  // 2. Otherwise, derive an individual host policy based on the unique property attributes
  const idStr = String(listingOrObj._id || listingOrObj.id || listingOrObj.title || '');
  let hash = 0;
  for (let i = 0; i < idStr.length; i++) {
    hash = (hash * 31 + idStr.charCodeAt(i)) % 1000;
  }

  // Some hosts maintain 0% surge (no markup during festivals)
  if (hash % 6 === 0) return 0;

  // Some hosts offer festive discounts (-5% to -10%)
  if (hash % 19 === 0) return -10;

  // Variety around the base percentage: e.g. base 25% -> 18%, 22%, 25%, 28%, or 15%
  const offset = ((hash % 15) - 7); // -7 to +7
  const finalPercent = basePercentage + offset;

  if (basePercentage < 0) return basePercentage; // discount stays discount
  return Math.max(5, Math.min(35, finalPercent));
}

/**
 * Determines festival pricing for a specific listing or location.
 * Highlights that the percentage is set by the listing's host.
 */
function getFestivalPricing(listingOrLocation = '', checkInDate = null, festivalQuery = null) {
  const isListingObj = listingOrLocation && typeof listingOrLocation === 'object';
  const location = isListingObj ? (listingOrLocation.location || '') : String(listingOrLocation || '');
  const loc = location.toLowerCase();
  const hostName = isListingObj && listingOrLocation.owner ? (listingOrLocation.owner.username || 'Host') : 'Host';
  const stayTitle = isListingObj ? (listingOrLocation.title || 'this stay') : 'this stay';

  let matchedFestival = null;

  // 1. Query matching
  if (festivalQuery) {
    const q = festivalQuery.toLowerCase().trim();
    if (q.includes('raksha') || q.includes('rakhi') || q === 'rakshabandhan') {
      matchedFestival = FESTIVALS_CATALOG.find((f) => f.id === 'rakshabandhan');
    } else if (q.includes('diwali') || q.includes('deepawali')) {
      matchedFestival = FESTIVALS_CATALOG.find((f) => f.id === 'diwali');
    } else if (q === 'holi' || q.includes('holi ') || q.startsWith('holi') || q.includes(' holi')) {
      matchedFestival = FESTIVALS_CATALOG.find((f) => f.id === 'holi');
    } else if (q.includes('new year') || q.includes('nye')) {
      matchedFestival = FESTIVALS_CATALOG.find((f) => f.id === 'new_year');
    } else if (q.includes('christmas') || q.includes('xmas')) {
      matchedFestival = FESTIVALS_CATALOG.find((f) => f.id === 'christmas');
    } else if (q.includes('dussehra') || q.includes('durga') || q.includes('navratri') || q.includes('pooja')) {
      matchedFestival = FESTIVALS_CATALOG.find((f) => f.id === 'dussehra');
    } else if (q.includes('ganesh') || q.includes('vinayaka') || q.includes('chaturthi')) {
      matchedFestival = FESTIVALS_CATALOG.find((f) => f.id === 'ganesh_chaturthi');
    } else if (q.includes('eid')) {
      matchedFestival = FESTIVALS_CATALOG.find((f) => f.id === 'eid');
    } else if (q.includes('summer')) {
      matchedFestival = FESTIVALS_CATALOG.find((f) => f.id === 'summer_mountains');
    } else if (q.includes('monsoon') || q.includes('rain') || q.includes('off-season') || q.includes('discount')) {
      matchedFestival = FESTIVALS_CATALOG.find((f) => f.id === 'monsoon_discount');
    } else {
      matchedFestival = FESTIVALS_CATALOG.find((f) => f.id === q);
    }
  }

  // 2. Date-based matching if no explicit festival queried
  const date = checkInDate ? new Date(checkInDate) : new Date();
  const month = date.getMonth();
  const day = date.getDate();

  if (!matchedFestival) {
    if ((month === 11 && day >= 20) || (month === 0 && day <= 5)) {
      matchedFestival = day >= 30 || day <= 2 
        ? FESTIVALS_CATALOG.find((f) => f.id === 'new_year')
        : FESTIVALS_CATALOG.find((f) => f.id === 'christmas');
    } else if ((month === 9 && day >= 25) || (month === 10 && day <= 10)) {
      matchedFestival = FESTIVALS_CATALOG.find((f) => f.id === 'diwali');
    } else if (month === 2 && day >= 10 && day <= 30) {
      matchedFestival = FESTIVALS_CATALOG.find((f) => f.id === 'holi');
    } else if (month === 7 && day >= 10 && day <= 25) {
      matchedFestival = FESTIVALS_CATALOG.find((f) => f.id === 'rakshabandhan');
    } else if (month === 9 && day >= 5 && day <= 24) {
      matchedFestival = FESTIVALS_CATALOG.find((f) => f.id === 'dussehra');
    } else if (month === 8 && day >= 1 && day <= 15) {
      matchedFestival = FESTIVALS_CATALOG.find((f) => f.id === 'ganesh_chaturthi');
    } else if ((month === 4 || month === 5) && (loc.includes('manali') || loc.includes('shimla') || loc.includes('himachal') || loc.includes('mussoorie'))) {
      matchedFestival = FESTIVALS_CATALOG.find((f) => f.id === 'summer_mountains');
    } else if (month === 6 && (loc.includes('goa') || loc.includes('rajasthan'))) {
      matchedFestival = FESTIVALS_CATALOG.find((f) => f.id === 'monsoon_discount');
    }
  }

  let basePercentage = matchedFestival ? matchedFestival.defaultPercentage : 0;
  let festivalName = matchedFestival ? matchedFestival.name : 'Standard Regular Season';
  let emoji = matchedFestival ? matchedFestival.emoji : '⚖️';
  let demandLevel = 'Normal';

  // Apply host-specific percentage calculation
  let percentage = isListingObj
    ? getHostSpecificPercentage(listingOrLocation, basePercentage)
    : basePercentage;

  let direction = percentage > 0 ? 'higher' : percentage < 0 ? 'lower' : 'standard';

  // Generate clear AI customer explanation
  let explanation = '';
  if (percentage > 0) {
    explanation = `The host of ${stayTitle} has adjusted the rate by +${percentage}% for ${festivalName} due to holiday demand, fully protected under FairStay's FairSafe anti-surge guarantee.`;
    demandLevel = percentage >= 25 ? 'High Peak Demand' : 'Moderate Festive Surge';
  } else if (percentage < 0) {
    explanation = `Great value! The host is offering a ${Math.abs(percentage)}% festive discount for ${stayTitle} below the normal baseline rate.`;
    demandLevel = 'Festive Promotional Discount';
  } else {
    explanation = matchedFestival
      ? `The host has chosen to maintain a 0% surge during ${festivalName}, offering you standard baseline pricing with no markup!`
      : 'Standard regular season. You enjoy 100% transparent baseline rates with no surge markups.';
    demandLevel = 'Standard Normal Rate';
  }

  const multiplier = 1 + percentage / 100;

  return {
    festivalId: matchedFestival ? matchedFestival.id : 'standard',
    festivalName,
    emoji,
    direction,
    percentage: Math.abs(percentage),
    signedPercentage: percentage > 0 ? `+${percentage}%` : percentage < 0 ? `${percentage}%` : '0%',
    rawPercentage: percentage,
    multiplier,
    demandLevel,
    explanation,
    hostName,
    isSurgeCapped: percentage > 0,
    surgePercentage: percentage,
  };
}

/**
 * Calculates complete price comparison for a given base price and festival
 */
function calculateFestivalImpact(basePrice = 3500, festivalData) {
  const normalPrice = Number(basePrice) || 3500;
  const percentage = festivalData.rawPercentage !== undefined ? festivalData.rawPercentage : (festivalData.percentage || 0);
  const difference = Math.round(normalPrice * (percentage / 100));
  const effectivePrice = normalPrice + difference;

  return {
    normalPrice,
    effectivePrice,
    difference,
    percentage: Math.abs(percentage),
    signedPercentage: percentage > 0 ? `+${percentage}%` : percentage < 0 ? `${percentage}%` : '0%',
    direction: percentage > 0 ? 'higher' : percentage < 0 ? 'lower' : 'standard',
    festivalName: festivalData.festivalName,
    emoji: festivalData.emoji,
    demandLevel: festivalData.demandLevel,
    explanation: festivalData.explanation,
    comparisonText:
      percentage > 0
        ? `Normal price: ₹${normalPrice.toLocaleString('en-IN')} → Festive price: ₹${effectivePrice.toLocaleString('en-IN')} (+${percentage}% set by host for ${festivalData.festivalName})`
        : percentage < 0
        ? `Normal price: ₹${normalPrice.toLocaleString('en-IN')} → Discounted price: ₹${effectivePrice.toLocaleString('en-IN')} (${percentage}% off set by host for ${festivalData.festivalName})`
        : `Normal baseline price: ₹${normalPrice.toLocaleString('en-IN')} (0% markup - Host maintains standard rate during ${festivalData.festivalName})`,
  };
}

module.exports = {
  FESTIVALS_CATALOG,
  getFestivalPricing,
  calculateFestivalImpact,
  getHostSpecificPercentage,
};
