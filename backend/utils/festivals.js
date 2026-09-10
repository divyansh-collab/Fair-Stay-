/**
 * FairStay — AI-Powered City-Centric Seasonal & Event Pricing Engine
 * In leisure and tourist destinations (Jaipur, Goa, Manali, Kerala), hotel rates do not
 * fluctuate on generic national holidays; instead, they dynamically adjust based on local
 * seasonality, weather patterns, and city-specific event calendars (e.g. JLF in Jaipur,
 * Sunburn & Carnival in Goa, Kullu Winter Carnival in Manali).
 */

// City-Specific Event & Seasonal Calendars
const DESTINATION_CALENDARS = {
  goa: [
    {
      id: 'goa_sunburn',
      name: 'Sunburn Festival & Year-End Music Week',
      emoji: '🎧',
      defaultPercentage: 45,
      direction: 'higher',
      dateRange: 'Dec 27 – Jan 2',
      startMonth: 11,
      startDay: 27,
      endMonth: 0,
      endDay: 2,
      summary: "Asia's premier electronic music festival and year-end celebrations drive 95%+ coastal villa occupancy and peak holiday rates across Goa.",
    },
    {
      id: 'goa_carnival',
      name: 'Goa Carnival & Float Parade Week',
      emoji: '🎭',
      defaultPercentage: 25,
      direction: 'higher',
      dateRange: 'Feb 10 – Feb 18',
      startMonth: 1,
      startDay: 10,
      endMonth: 1,
      endDay: 18,
      summary: 'Historic 4-day pre-Lent cultural extravaganza featuring King Momo, street dances, and heavy domestic tourist influx across North and South Goa.',
    },
    {
      id: 'goa_watersports',
      name: 'Post-Monsoon Watersports & Beach Opening',
      emoji: '🏄',
      defaultPercentage: 15,
      direction: 'higher',
      dateRange: 'Oct 1 – Nov 15',
      startMonth: 9,
      startDay: 1,
      endMonth: 10,
      endDay: 15,
      summary: 'Beach shacks reopen, calm sea waters welcome scuba diving and parasailing, marking the start of Goa’s prime leisure tourist season.',
    },
    {
      id: 'goa_shigmo',
      name: 'Shigmo Spring Folk Festival',
      emoji: '🥁',
      defaultPercentage: 15,
      direction: 'higher',
      dateRange: 'March 15 – March 26',
      startMonth: 2,
      startDay: 15,
      endMonth: 2,
      endDay: 26,
      summary: 'Vibrant Goan spring folk celebration with traditional temple processions, float parades, and cultural tourism across Panaji and Margao.',
    },
    {
      id: 'goa_monsoon',
      name: 'Monsoon Green Season Off-Peak Discount',
      emoji: '🌧️',
      defaultPercentage: -25,
      direction: 'lower',
      dateRange: 'June 15 – Sept 15',
      startMonth: 5,
      startDay: 15,
      endMonth: 8,
      endDay: 15,
      summary: 'Low tourist season due to coastal downpours and rough seas. Stays drop 25% below baseline rates — ideal for serene greenery and budget travelers.',
    },
  ],

  jaipur: [
    {
      id: 'jaipur_jlf',
      name: 'Jaipur Literature Festival (JLF)',
      emoji: '📚',
      defaultPercentage: 35,
      direction: 'higher',
      dateRange: 'Jan 15 – Jan 28',
      startMonth: 0,
      startDay: 15,
      endMonth: 0,
      endDay: 28,
      summary: "The world's greatest literary show draws over 400,000 global authors, thinkers, and visitors, creating massive hotel room compression across Jaipur.",
    },
    {
      id: 'jaipur_winter_palace',
      name: 'Winter Royal Palace & Wedding Season',
      emoji: '🏰',
      defaultPercentage: 30,
      direction: 'higher',
      dateRange: 'Nov 15 – Feb 15',
      startMonth: 10,
      startDay: 15,
      endMonth: 1,
      endDay: 15,
      summary: 'Pleasant desert winter climate and destination weddings at heritage havelis generate peak luxury stay and royal villa demand.',
    },
    {
      id: 'jaipur_pushkar',
      name: 'Pushkar Camel Fair & Desert Season',
      emoji: '🐪',
      defaultPercentage: 30,
      direction: 'higher',
      dateRange: 'Nov 1 – Nov 12',
      startMonth: 10,
      startDay: 1,
      endMonth: 10,
      endDay: 12,
      summary: 'One of the world’s largest livestock and desert cultural fairs attracts massive international photography and luxury tented stay demand across Rajasthan.',
    },
    {
      id: 'jaipur_teej',
      name: 'Teej & Gangaur Royal Processions',
      emoji: '🦚',
      defaultPercentage: 20,
      direction: 'higher',
      dateRange: 'July 25 – Aug 12',
      startMonth: 6,
      startDay: 25,
      endMonth: 7,
      endDay: 12,
      summary: 'Spectacular royal processions of Goddess Teej through the Old Pink City with traditional Rajasthani folk music and heritage tourism.',
    },
    {
      id: 'jaipur_summer',
      name: 'Scorching Desert Summer Off-Peak Discount',
      emoji: '☀️',
      defaultPercentage: -30,
      direction: 'lower',
      dateRange: 'April 15 – June 30',
      startMonth: 3,
      startDay: 15,
      endMonth: 5,
      endDay: 30,
      summary: 'Intense desert heat (42°C+) causes low tourist footfall. Heritage havelis and villas offer deep discounts of 30% below standard baseline rates.',
    },
  ],

  manali: [
    {
      id: 'manali_winter_carnival',
      name: 'Kullu Winter Carnival & Snow Peak',
      emoji: '❄️',
      defaultPercentage: 35,
      direction: 'higher',
      dateRange: 'Jan 2 – Jan 26',
      startMonth: 0,
      startDay: 2,
      endMonth: 0,
      endDay: 26,
      summary: 'Solang Valley snow sports, fresh snowfall, and the 5-day state cultural carnival in Manali trigger peak winter holiday bookings.',
    },
    {
      id: 'manali_summer_escape',
      name: 'Himalayan Summer Heatwave Escape',
      emoji: '🏔️',
      defaultPercentage: 35,
      direction: 'higher',
      dateRange: 'May 1 – June 30',
      startMonth: 4,
      startDay: 1,
      endMonth: 5,
      endDay: 30,
      summary: 'Northern plains travelers escape scorching summer heat, creating the highest annual occupancy in Manali, Shimla, and Kasol chalets.',
    },
    {
      id: 'manali_kullu_dussehra',
      name: 'Kullu Dussehra Regional Folk Fair',
      emoji: '🏹',
      defaultPercentage: 25,
      direction: 'higher',
      dateRange: 'Oct 10 – Oct 22',
      startMonth: 9,
      startDay: 10,
      endMonth: 9,
      endDay: 22,
      summary: 'Centuries-old regional assembly of over 200 mountain village deities in Dhalpur Maidan with grand folk dances and valley celebrations.',
    },
    {
      id: 'manali_apple_harvest',
      name: 'Apple Harvest & Autumn Foliage',
      emoji: '🍎',
      defaultPercentage: 15,
      direction: 'higher',
      dateRange: 'Sept 1 – Sept 30',
      startMonth: 8,
      startDay: 1,
      endMonth: 8,
      endDay: 30,
      summary: 'Pleasant mountain autumn temperatures, fruit picking in apple orchards, and pre-winter road trips to Rohtang and Atal Tunnel.',
    },
    {
      id: 'manali_monsoon',
      name: 'Monsoon Landslide Risk Off-Peak Discount',
      emoji: '⛈️',
      defaultPercentage: -35,
      direction: 'lower',
      dateRange: 'July 10 – Aug 25',
      startMonth: 6,
      startDay: 10,
      endMonth: 7,
      endDay: 25,
      summary: 'Heavy mountain rains and highway roadblock risks cause sharp decline in travel. Mountain cottages offer up to 35% discount for long-stay workations.',
    },
  ],

  kerala: [
    {
      id: 'kerala_onam',
      name: 'Onam Harvest & Snake Boat Races',
      emoji: '🛶',
      defaultPercentage: 30,
      direction: 'higher',
      dateRange: 'Aug 20 – Sept 12',
      startMonth: 7,
      startDay: 20,
      endMonth: 8,
      endDay: 12,
      summary: 'Kerala’s premier cultural season featuring the Nehru Trophy Boat Race in Punnamada Lake, Pookkalam floral carpets, and grand Sadya banquets.',
    },
    {
      id: 'kerala_winter_backwaters',
      name: 'Winter Tea Bloom & Backwater Peak',
      emoji: '☕',
      defaultPercentage: 25,
      direction: 'higher',
      dateRange: 'Nov 15 – Jan 31',
      startMonth: 10,
      startDay: 15,
      endMonth: 0,
      endDay: 31,
      summary: 'Crisp mountain mist in Munnar tea estates and ideal tranquil weather for Alleppey backwater houseboats and heritage homestays.',
    },
    {
      id: 'kerala_monsoon_ayurveda',
      name: 'Monsoon Ayurvedic Rejuvenation Season',
      emoji: '🌿',
      defaultPercentage: -20,
      direction: 'lower',
      dateRange: 'June 1 – July 31',
      startMonth: 5,
      startDay: 1,
      endMonth: 6,
      endDay: 31,
      summary: 'Traditional Karkidaka monsoon retreat season where properties provide wellness therapies, detox packages, and promotional seasonal discounts.',
    },
  ],

  mumbai: [
    {
      id: 'mumbai_ganeshotsav',
      name: '10-Day Ganeshotsav Coastal Peak',
      emoji: '🐘',
      defaultPercentage: 25,
      direction: 'higher',
      dateRange: 'Sept 1 – Sept 15',
      startMonth: 8,
      startDay: 1,
      endMonth: 8,
      endDay: 15,
      summary: 'Maharashtra’s largest public festival with Lalbaugcha Raja pandal tours, beach immersions, and coastal staycation demand across Mumbai and Alibaug.',
    },
    {
      id: 'mumbai_monsoon_ghats',
      name: 'Monsoon Western Ghats Waterfall Season',
      emoji: '🌧️',
      defaultPercentage: 20,
      direction: 'higher',
      dateRange: 'July 1 – Aug 31',
      startMonth: 6,
      startDay: 1,
      endMonth: 7,
      endDay: 31,
      summary: 'Lush misty green getaways to Lonavala, Khandala, and Alibaug villas for weekend rain leisure and waterfall trekking.',
    },
    {
      id: 'mumbai_winter_coastal',
      name: 'Winter Coastal Breeze Season',
      emoji: '🏙️',
      defaultPercentage: 15,
      direction: 'higher',
      dateRange: 'Nov 1 – Feb 28',
      startMonth: 10,
      startDay: 1,
      endMonth: 1,
      endDay: 28,
      summary: 'Comfortable sea breezes, outdoor cultural festivals, and high corporate and luxury boutique hotel bookings.',
    },
  ],

  spiritual: [
    {
      id: 'varanasi_dev_deepawali',
      name: 'Dev Deepawali & Ganga Mahotsav',
      emoji: '🪔',
      defaultPercentage: 40,
      direction: 'higher',
      dateRange: 'Nov 10 – Nov 26',
      startMonth: 10,
      startDay: 10,
      endMonth: 10,
      endDay: 26,
      summary: 'Millions of glowing earthen diyas illuminate all 84 Varanasi ghats on Kartik Poornima, attracting pilgrims from around the world.',
    },
    {
      id: 'varanasi_maha_shivratri',
      name: 'Maha Shivratri & Shravan Sacred Month',
      emoji: '🔱',
      defaultPercentage: 35,
      direction: 'higher',
      dateRange: 'Feb 20 – March 5 & July 15 – Aug 15',
      startMonth: 1,
      startDay: 20,
      endMonth: 2,
      endDay: 5,
      summary: 'Grand celebrations of Lord Shiva at Kashi Vishwanath temple with millions of devotees filling holy river corridors.',
    },
    {
      id: 'prayagraj_magh_mela',
      name: 'Magh Mela & Kumbh Holy Snan',
      emoji: '🌊',
      defaultPercentage: 40,
      direction: 'higher',
      dateRange: 'Jan 10 – Feb 25',
      startMonth: 0,
      startDay: 10,
      endMonth: 1,
      endDay: 25,
      summary: 'Annual sacred bathing pilgrimage at the Triveni Sangam confluence with millions of sadhus and pilgrims requiring riverside accommodation.',
    },
    {
      id: 'ayodhya_deepotsav',
      name: 'Ayodhya Deepotsav & Ram Navami',
      emoji: '🪔',
      defaultPercentage: 35,
      direction: 'higher',
      dateRange: 'Oct 20 – Nov 5 & March 25 – April 10',
      startMonth: 9,
      startDay: 20,
      endMonth: 10,
      endDay: 5,
      summary: 'World-record diya lighting along the Saryu River and Ram Mandir celebrations driving massive sacred accommodation demand.',
    },
    {
      id: 'rishikesh_yoga',
      name: 'International Yoga Festival & Ganga Dussehra',
      emoji: '🧘',
      defaultPercentage: 25,
      direction: 'higher',
      dateRange: 'March 1 – March 15',
      startMonth: 2,
      startDay: 1,
      endMonth: 2,
      endDay: 15,
      summary: 'Global spiritual seekers converge on the yoga capital of the world for ashram teachings, meditation, and holy Ganga dips.',
    },
    {
      id: 'mathura_braj_holi',
      name: 'Braj Lathmar Holi & Janmashtami',
      emoji: '🎨',
      defaultPercentage: 40,
      direction: 'higher',
      dateRange: 'March 5 – March 22 & Aug 15 – Aug 30',
      startMonth: 2,
      startDay: 5,
      endMonth: 2,
      endDay: 22,
      summary: 'Legendary week-long color festival and Krishna Janmashtami celebrations in Barsana, Nandgaon, Vrindavan, and Mathura.',
    },
  ],

  general: [
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
      summary: 'India’s largest festive season. Nationwide family vacation rush across heritage, hills, and coastal getaways.',
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
  ],
};

// Flattened global catalog for backward compatibility with existing tests
const FESTIVALS_CATALOG = [
  ...DESTINATION_CALENDARS.general,
  ...DESTINATION_CALENDARS.goa,
  ...DESTINATION_CALENDARS.jaipur,
  ...DESTINATION_CALENDARS.manali,
  ...DESTINATION_CALENDARS.kerala,
  ...DESTINATION_CALENDARS.mumbai,
  ...DESTINATION_CALENDARS.spiritual,
];

/**
 * Normalizes any location string to its destination city group
 */
function normalizeCityKey(location = '') {
  const loc = String(location || '').toLowerCase();
  if (/goa/i.test(loc)) return 'goa';
  if (/jaipur|rajasthan|udaipur|jodhpur|jaisalmer|pushkar/i.test(loc)) return 'jaipur';
  if (/manali|himachal|shimla|kullu|kasol|dharamshala|spiti|mussoorie/i.test(loc)) return 'manali';
  if (/kerala|munnar|alleppey|kochi|wayanad/i.test(loc)) return 'kerala';
  if (/mumbai|lonavala|alibaug|pune/i.test(loc)) return 'mumbai';
  if (/varanasi|kashi|prayagraj|allahabad|ayodhya|rishikesh|haridwar|mathura|vrindavan|puri|tirupati/i.test(loc)) return 'spiritual';
  return 'general';
}

/**
 * Returns the exact city-specific local seasons and event calendar for any destination
 */
function getDestinationEvents(location = '') {
  const cityKey = normalizeCityKey(location);
  const events = DESTINATION_CALENDARS[cityKey] || DESTINATION_CALENDARS.general;

  // For spiritual corridor, prioritize city-specific events if Varanasi / Prayagraj / Ayodhya
  const loc = String(location || '').toLowerCase();
  if (cityKey === 'spiritual') {
    if (loc.includes('varanasi') || loc.includes('kashi')) {
      return events.filter((e) => e.id.startsWith('varanasi') || e.id === 'christmas' || e.id === 'diwali');
    }
    if (loc.includes('prayagraj') || loc.includes('allahabad')) {
      return events.filter((e) => e.id.startsWith('prayagraj') || e.id.startsWith('varanasi'));
    }
    if (loc.includes('ayodhya')) {
      return events.filter((e) => e.id.startsWith('ayodhya') || e.id.startsWith('varanasi'));
    }
    if (loc.includes('rishikesh') || loc.includes('haridwar')) {
      return events.filter((e) => e.id.startsWith('rishikesh') || e.id.startsWith('varanasi'));
    }
    if (loc.includes('mathura') || loc.includes('vrindavan')) {
      return events.filter((e) => e.id.startsWith('mathura') || e.id.startsWith('varanasi'));
    }
  }

  return events;
}

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

  // 2. If base percentage is 0 (standard regular season / normal day), the surge is 0%!
  if (basePercentage === 0) {
    return 0;
  }

  // 3. Otherwise, derive an individual host policy based on the unique property attributes
  const idStr = String(listingOrObj._id || listingOrObj.id || listingOrObj.title || '');
  let hash = 0;
  for (let i = 0; i < idStr.length; i++) {
    hash = (hash * 31 + idStr.charCodeAt(i)) % 1000;
  }

  // Some hosts maintain 0% surge (no markup during peak events)
  if (hash % 7 === 0) return 0;

  // Some hosts offer promotional discounts (-5% to -10%)
  if (hash % 19 === 0) return -10;

  // Discounts stay discounts
  if (basePercentage < 0) return basePercentage;

  // Variety around the base percentage: e.g. base 35% -> 28%, 32%, 35%, 38%
  const offset = ((hash % 11) - 5); // -5 to +5
  const finalPercent = basePercentage + offset;

  return Math.max(5, Math.min(45, finalPercent));
}

/**
 * Determines seasonal/event pricing for a specific listing or location based strictly on
 * the specific city's local season and event calendar.
 */
function getFestivalPricing(listingOrLocation = '', checkInDate = null, festivalQuery = null) {
  const isListingObj = listingOrLocation && typeof listingOrLocation === 'object';
  const location = isListingObj ? (listingOrLocation.location || '') : String(listingOrLocation || '');
  const loc = location.toLowerCase();
  const hostName = isListingObj && listingOrLocation.owner ? (listingOrLocation.owner.username || 'Host') : 'Host';
  const stayTitle = isListingObj ? (listingOrLocation.title || 'this stay') : 'this stay';

  // 1. Retrieve the specific city's local event calendar
  const cityKey = normalizeCityKey(location);
  const cityEvents = getDestinationEvents(location);
  const cityName = location ? location.split(',')[0].trim() : 'this destination';

  let matchedFestival = null;
  let isGenericMismatch = false;
  let mismatchEventName = '';

  // 2. Query matching: Prioritize the city's specific local events
  if (festivalQuery) {
    const q = festivalQuery.toLowerCase().trim();

    // Exact or partial match within the specific city's local events
    matchedFestival = cityEvents.find((f) => 
      f.id === q || 
      f.id.toLowerCase().includes(q) || 
      f.name.toLowerCase().includes(q)
    );

    // Specific city event aliases
    if (!matchedFestival) {
      if (q.includes('jlf') || q.includes('literature')) {
        matchedFestival = DESTINATION_CALENDARS.jaipur ? DESTINATION_CALENDARS.jaipur.find((f) => f.id === 'jaipur_jlf') : null;
      } else if (q.includes('sunburn')) {
        matchedFestival = DESTINATION_CALENDARS.goa ? DESTINATION_CALENDARS.goa.find((f) => f.id === 'goa_sunburn') : null;
      } else if (q.includes('carnival')) {
        matchedFestival = cityKey === 'manali'
          ? (DESTINATION_CALENDARS.manali ? DESTINATION_CALENDARS.manali.find((f) => f.id === 'manali_winter_carnival') : null)
          : (DESTINATION_CALENDARS.goa ? DESTINATION_CALENDARS.goa.find((f) => f.id === 'goa_carnival') : null);
      } else if (q.includes('pushkar') || q.includes('camel')) {
        matchedFestival = DESTINATION_CALENDARS.jaipur ? DESTINATION_CALENDARS.jaipur.find((f) => f.id === 'jaipur_pushkar') : null;
      } else if (q.includes('onam') || q.includes('boat')) {
        matchedFestival = DESTINATION_CALENDARS.kerala ? DESTINATION_CALENDARS.kerala.find((f) => f.id === 'kerala_onam') : null;
      } else if (q.includes('dev deepawali') || q.includes('dev diwali')) {
        matchedFestival = DESTINATION_CALENDARS.spiritual ? DESTINATION_CALENDARS.spiritual.find((f) => f.id === 'varanasi_dev_deepawali') : null;
      } else if (q.includes('shivratri')) {
        matchedFestival = DESTINATION_CALENDARS.spiritual ? DESTINATION_CALENDARS.spiritual.find((f) => f.id === 'varanasi_maha_shivratri') : null;
      } else if (q.includes('magh') || q.includes('kumbh')) {
        matchedFestival = DESTINATION_CALENDARS.spiritual ? DESTINATION_CALENDARS.spiritual.find((f) => f.id === 'prayagraj_magh_mela') : null;
      } else if (q.includes('deepotsav')) {
        matchedFestival = DESTINATION_CALENDARS.spiritual ? DESTINATION_CALENDARS.spiritual.find((f) => f.id === 'ayodhya_deepotsav') : null;
      } else if (q.includes('yoga')) {
        matchedFestival = DESTINATION_CALENDARS.spiritual ? DESTINATION_CALENDARS.spiritual.find((f) => f.id === 'rishikesh_yoga') : null;
      } else if (q.includes('ganesh') || q.includes('ganpati')) {
        matchedFestival = DESTINATION_CALENDARS.mumbai ? DESTINATION_CALENDARS.mumbai.find((f) => f.id === 'mumbai_ganeshotsav') : null;
      }
    }

    // Strict Cultural Guard: If query is for a national holiday but city does NOT celebrate it with travel surges
    if (!matchedFestival) {
      if (q.includes('diwali') || q.includes('deepawali')) {
        if (cityKey === 'spiritual' && (loc.includes('varanasi') || loc.includes('kashi'))) {
          matchedFestival = DESTINATION_CALENDARS.spiritual.find((f) => f.id === 'varanasi_dev_deepawali');
        } else if (cityKey === 'spiritual' && loc.includes('ayodhya')) {
          matchedFestival = DESTINATION_CALENDARS.spiritual.find((f) => f.id === 'ayodhya_deepotsav');
        } else if (cityKey === 'general') {
          matchedFestival = FESTIVALS_CATALOG.find((f) => f.id === 'diwali');
        } else {
          // Leisure destinations: Goa, Manali, Kerala, Jaipur, Mumbai
          isGenericMismatch = true;
          mismatchEventName = 'Diwali';
        }
      } else if (q === 'holi' || q.includes('holi ') || q.startsWith('holi') || q.includes(' holi')) {
        if (cityKey === 'spiritual' && (loc.includes('mathura') || loc.includes('vrindavan'))) {
          matchedFestival = DESTINATION_CALENDARS.spiritual.find((f) => f.id === 'mathura_braj_holi');
        } else if (cityKey === 'general') {
          matchedFestival = FESTIVALS_CATALOG.find((f) => f.id === 'holi');
        } else {
          isGenericMismatch = true;
          mismatchEventName = 'Holi';
        }
      } else if (q.includes('raksha') || q.includes('rakhi') || q === 'rakshabandhan') {
        if (cityKey === 'general') {
          matchedFestival = FESTIVALS_CATALOG.find((f) => f.id === 'rakshabandhan');
        } else {
          isGenericMismatch = true;
          mismatchEventName = 'Raksha Bandhan';
        }
      } else if (q.includes('new year') || q.includes('nye') || q.includes('christmas')) {
        if (cityKey === 'goa') {
          matchedFestival = DESTINATION_CALENDARS.goa.find((f) => f.id === 'goa_sunburn');
        } else if (cityKey === 'general') {
          matchedFestival = FESTIVALS_CATALOG.find((f) => f.id === (q.includes('new year') || q.includes('nye') ? 'new_year' : 'christmas'));
        }
      }
    }
  }

  // 3. Date-based matching: Resolve strictly using the specific city's calendar
  const date = checkInDate ? new Date(checkInDate) : new Date();
  const month = date.getMonth();
  const day = date.getDate();

  if (!matchedFestival && !isGenericMismatch) {
    // City-first date matching
    if (cityKey === 'goa') {
      if ((month === 11 && day >= 20) || (month === 0 && day <= 5)) {
        matchedFestival = DESTINATION_CALENDARS.goa.find((f) => f.id === 'goa_sunburn');
      } else if (month === 1 && day >= 8 && day <= 22) {
        matchedFestival = DESTINATION_CALENDARS.goa.find((f) => f.id === 'goa_carnival');
      } else if (month === 2 && day >= 12 && day <= 28) {
        matchedFestival = DESTINATION_CALENDARS.goa.find((f) => f.id === 'goa_shigmo');
      } else if (month >= 5 && month <= 8) {
        matchedFestival = DESTINATION_CALENDARS.goa.find((f) => f.id === 'goa_monsoon');
      } else if (month === 9 || (month === 10 && day <= 15)) {
        matchedFestival = DESTINATION_CALENDARS.goa.find((f) => f.id === 'goa_watersports');
      }
    } else if (cityKey === 'jaipur') {
      if (month === 0 && day >= 12 && day <= 30) {
        matchedFestival = DESTINATION_CALENDARS.jaipur.find((f) => f.id === 'jaipur_jlf');
      } else if (month === 10 && day <= 15) {
        matchedFestival = DESTINATION_CALENDARS.jaipur.find((f) => f.id === 'jaipur_pushkar');
      } else if (month >= 10 || month <= 1) {
        matchedFestival = DESTINATION_CALENDARS.jaipur.find((f) => f.id === 'jaipur_winter_palace');
      } else if (month >= 3 && month <= 5) {
        matchedFestival = DESTINATION_CALENDARS.jaipur.find((f) => f.id === 'jaipur_summer');
      } else if ((month === 6 && day >= 20) || (month === 7 && day <= 15)) {
        matchedFestival = DESTINATION_CALENDARS.jaipur.find((f) => f.id === 'jaipur_teej');
      }
    } else if (cityKey === 'manali') {
      if (month === 0 && day >= 2 && day <= 28) {
        matchedFestival = DESTINATION_CALENDARS.manali.find((f) => f.id === 'manali_winter_carnival');
      } else if (month >= 4 && month <= 5) {
        matchedFestival = DESTINATION_CALENDARS.manali.find((f) => f.id === 'manali_summer_escape');
      } else if (month === 9 && day >= 8 && day <= 25) {
        matchedFestival = DESTINATION_CALENDARS.manali.find((f) => f.id === 'manali_kullu_dussehra');
      } else if (month === 8) {
        matchedFestival = DESTINATION_CALENDARS.manali.find((f) => f.id === 'manali_apple_harvest');
      } else if (month === 6 || (month === 7 && day <= 25)) {
        matchedFestival = DESTINATION_CALENDARS.manali.find((f) => f.id === 'manali_monsoon');
      }
    } else if (cityKey === 'kerala') {
      if ((month === 7 && day >= 15) || (month === 8 && day <= 15)) {
        matchedFestival = DESTINATION_CALENDARS.kerala.find((f) => f.id === 'kerala_onam');
      } else if (month >= 10 || month <= 1) {
        matchedFestival = DESTINATION_CALENDARS.kerala.find((f) => f.id === 'kerala_winter_backwaters');
      } else if (month === 5 || month === 6) {
        matchedFestival = DESTINATION_CALENDARS.kerala.find((f) => f.id === 'kerala_monsoon_ayurveda');
      }
    } else if (cityKey === 'mumbai') {
      if (month === 8 && day >= 1 && day <= 15) {
        matchedFestival = DESTINATION_CALENDARS.mumbai.find((f) => f.id === 'mumbai_ganeshotsav');
      } else if (month === 6 || month === 7) {
        matchedFestival = DESTINATION_CALENDARS.mumbai.find((f) => f.id === 'mumbai_monsoon_ghats');
      } else if (month >= 10 || month <= 1) {
        matchedFestival = DESTINATION_CALENDARS.mumbai.find((f) => f.id === 'mumbai_winter_coastal');
      }
    } else if (cityKey === 'spiritual') {
      if (loc.includes('varanasi') || loc.includes('kashi')) {
        if ((month === 10 && day >= 8 && day <= 28) || (month === 9 && day >= 25)) {
          matchedFestival = DESTINATION_CALENDARS.spiritual.find((f) => f.id === 'varanasi_dev_deepawali');
        } else if ((month === 1 && day >= 15) || (month === 2 && day <= 10)) {
          matchedFestival = DESTINATION_CALENDARS.spiritual.find((f) => f.id === 'varanasi_maha_shivratri');
        }
      } else if (loc.includes('prayagraj') || loc.includes('allahabad')) {
        if (month === 0 || (month === 1 && day <= 28)) {
          matchedFestival = DESTINATION_CALENDARS.spiritual.find((f) => f.id === 'prayagraj_magh_mela');
        }
      } else if (loc.includes('ayodhya')) {
        if ((month === 9 && day >= 20) || (month === 10 && day <= 10)) {
          matchedFestival = DESTINATION_CALENDARS.spiritual.find((f) => f.id === 'ayodhya_deepotsav');
        } else if (month === 2 && day >= 20 || (month === 3 && day <= 10)) {
          matchedFestival = DESTINATION_CALENDARS.spiritual.find((f) => f.id === 'ayodhya_deepotsav');
        }
      } else if (loc.includes('rishikesh') || loc.includes('haridwar')) {
        if (month === 2 && day <= 20) {
          matchedFestival = DESTINATION_CALENDARS.spiritual.find((f) => f.id === 'rishikesh_yoga');
        }
      } else if (loc.includes('mathura') || loc.includes('vrindavan')) {
        if (month === 2 && day >= 5 && day <= 25) {
          matchedFestival = DESTINATION_CALENDARS.spiritual.find((f) => f.id === 'mathura_braj_holi');
        } else if (month === 7 && day >= 10 && day <= 31) {
          matchedFestival = DESTINATION_CALENDARS.spiritual.find((f) => f.id === 'mathura_braj_holi');
        }
      } else {
        if ((month === 10 && day >= 5) || (month === 9 && day >= 25)) {
          matchedFestival = DESTINATION_CALENDARS.spiritual.find((f) => f.id === 'varanasi_dev_deepawali');
        } else if (month === 0 || month === 1) {
          matchedFestival = DESTINATION_CALENDARS.spiritual.find((f) => f.id === 'prayagraj_magh_mela');
        }
      }
    }

    // Generic fallback ONLY applies to unclassified general locations
    if (!matchedFestival && cityKey === 'general') {
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
      } else if (month === 6) {
        matchedFestival = FESTIVALS_CATALOG.find((f) => f.id === 'monsoon_discount');
      }
    }
  }

  let basePercentage = 0;
  let festivalName = 'Standard Regular Season';
  let emoji = '⚖️';
  let demandLevel = 'Normal';
  let customExplanation = '';
  let customWhyNotDiwali = '';

  if (isGenericMismatch) {
    basePercentage = 0;
    festivalName = `${mismatchEventName} (Standard Host Rate in ${cityName})`;
    emoji = '⚖️';
    demandLevel = 'Standard Host Rate (0% Holiday Surge)';
    customExplanation = `In ${cityName}, hotel rates do NOT increase for ${mismatchEventName}. Domestic travelers celebrate ${mismatchEventName} at home with family pujas, so leisure hotel occupancy remains standard. Hosts maintain their direct baseline rate with 0% holiday markup.`;
    customWhyNotDiwali = `In ${cityName}, generic national holidays like ${mismatchEventName} do not drive leisure room compression. Local pricing is governed strictly by coastal/mountain weather, seasonal tourism influx, and regional cultural celebrations.`;
  } else if (matchedFestival) {
    basePercentage = matchedFestival.defaultPercentage;
    festivalName = matchedFestival.name;
    emoji = matchedFestival.emoji;
    demandLevel = matchedFestival.direction === 'lower' ? 'Off-Season Promotional Discount' : 'Peak Local Event Surge';
  } else {
    basePercentage = 0;
    festivalName = 'Standard Regular Season';
    emoji = '⚖️';
    demandLevel = 'Standard Normal Rate';
    customExplanation = `Standard regular season in ${cityName}. Stays maintain 100% transparent baseline rates with steady year-round pricing (0% surge).`;
    customWhyNotDiwali = `In ${cityName}, rates are governed strictly by local weather patterns, seasonal tourism influx, and regional events, not generic holidays.`;
  }

  // Apply host-specific percentage calculation
  let percentage = isListingObj && basePercentage !== 0
    ? getHostSpecificPercentage(listingOrLocation, basePercentage)
    : basePercentage;

  let direction = percentage > 0 ? 'higher' : percentage < 0 ? 'lower' : 'standard';

  // Generate destination-aware AI customer explanation
  let explanation = customExplanation;
  if (!explanation) {
    if (percentage > 0) {
      explanation = `Area seasonal trend: Rates in ${cityName} typically adjust by +${percentage}% during ${festivalName} reflecting local event demand and peak area occupancy. Hosts retain full pricing freedom with direct, transparent rates.`;
      demandLevel = percentage >= 30 ? 'Peak Local Event Surge' : 'Seasonal Holiday Demand';
    } else if (percentage < 0) {
      explanation = `Off-peak season savings: Stays in ${cityName} trend ${Math.abs(percentage)}% lower during ${festivalName} below standard baseline rates.`;
      demandLevel = 'Off-Season Promotional Discount';
    } else {
      explanation = matchedFestival
        ? `Standard baseline rate: Stays in ${cityName} maintain standard pricing during ${festivalName} with steady demand.`
        : `Standard regular season in ${cityName}. Enjoy 100% transparent baseline rates with steady year-round pricing.`;
      demandLevel = 'Standard Normal Rate';
    }
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
    cityKey,
    destination: cityName,
    isSurgeCapped: percentage > 0,
    surgePercentage: percentage,
    availableEvents: cityEvents,
    occupancyRate: matchedFestival && matchedFestival.occupancyRate
      ? matchedFestival.occupancyRate
      : (percentage > 0 ? '92%+ (Peak Compression)' : percentage < 0 ? '30% (Inventory Surplus)' : '65% (Balanced)'),
    primaryDriver: matchedFestival && matchedFestival.primaryDriver
      ? matchedFestival.primaryDriver
      : (matchedFestival ? matchedFestival.summary : 'Local seasonal demand and city-specific event attendance.'),
    weatherIndex: matchedFestival && matchedFestival.weatherIndex
      ? matchedFestival.weatherIndex
      : (percentage < 0 ? 'Off-season climate slowdown' : 'Pleasant travel weather'),
    whyNotDiwali: customWhyNotDiwali || (matchedFestival && matchedFestival.whyNotDiwali
      ? matchedFestival.whyNotDiwali
      : 'National religious holidays see domestic travelers staying home for family pujas. Hotel compression in this leisure destination is strictly governed by local weather patterns and regional event calendars.'),
  };
}

/**
 * Calculates complete price comparison for a given base price and festival/event
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
        ? `Normal price: ₹${normalPrice.toLocaleString('en-IN')} → Seasonal price: ₹${effectivePrice.toLocaleString('en-IN')} (+${percentage}% set by host for ${festivalData.festivalName})`
        : percentage < 0
        ? `Normal price: ₹${normalPrice.toLocaleString('en-IN')} → Discounted price: ₹${effectivePrice.toLocaleString('en-IN')} (${percentage}% off set by host for ${festivalData.festivalName})`
        : `Normal baseline price: ₹${normalPrice.toLocaleString('en-IN')} (0% markup - Host maintains standard rate during ${festivalData.festivalName})`,
  };
}

module.exports = {
  DESTINATION_CALENDARS,
  FESTIVALS_CATALOG,
  normalizeCityKey,
  getDestinationEvents,
  getFestivalPricing,
  calculateFestivalImpact,
  getHostSpecificPercentage,
};
