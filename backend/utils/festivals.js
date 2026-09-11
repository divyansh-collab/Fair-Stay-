/**
 * FairStay — City-Centric AI Seasonal & Event Pricing Engine
 * 
 * Rules:
 * 1. Pan-India Festivals (e.g. Christmas Dec 20–26, New Year Dec 27–Jan 2) apply nationwide.
 * 2. Pure Leisure Tourist Destinations (Manali, Goa, Shimla):
 *    - DO NOT surge for traditional religious holidays like Diwali, Janmashtami, Ganpati, etc.
 *    - They maintain standard direct baseline rates (0% markup) with transparent explanations.
 *    - They surge for tourism-driven events: White Christmas, Sunburn/NYE, Winter Snow Carnival, Summer Escapes.
 * 3. Regional / City-Specific Festivals:
 *    - Janmashtami: Only surges in Mathura/Vrindavan (+40%) and Prayagraj (+30%). Everywhere else: 0% markup.
 *    - Ganpati Mahotsav (Ganesh Chaturthi): Only surges in Maharashtra/Mumbai (+30%). Everywhere else: 0% markup.
 *    - Dev Deepawali: Only in Varanasi (+40%).
 *    - International Yoga Festival: Only in Rishikesh (+25%).
 *    - Magh Mela / Kumbh: Only in Prayagraj (+40%).
 *    - Jaipur Literature Festival (JLF): Only in Jaipur (+35%).
 * 4. Off-Peak Seasonal Discounts:
 *    - Jaipur summer (-30%), Goa monsoon (-25%), Manali monsoon (-35%), Kerala monsoon (-20%).
 */

// City-Specific Event & Seasonal Calendars
const DESTINATION_CALENDARS = {
  goa: [
    {
      id: 'goa_christmas',
      name: 'Christmas Holiday & Goan Feast Week',
      emoji: '🎄',
      defaultPercentage: 30,
      direction: 'higher',
      dateRange: 'Dec 20 – Dec 26',
      startMonth: 11,
      startDay: 20,
      endMonth: 11,
      endDay: 26,
      summary: 'Traditional Goan Catholic midnight mass, illuminated beach cribs, and massive family holiday travel across North and South Goa.',
    },
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

  manali: [
    {
      id: 'manali_christmas',
      name: 'White Christmas & Himalayan Snow Week',
      emoji: '🎄',
      defaultPercentage: 35,
      direction: 'higher',
      dateRange: 'Dec 20 – Dec 26',
      startMonth: 11,
      startDay: 20,
      endMonth: 11,
      endDay: 26,
      summary: 'Festive snowfall, illuminated mountain pines, and heavy holiday travel to Solang Valley, Shimla Ridge, and Rohtang Pass.',
    },
    {
      id: 'manali_new_year',
      name: "Himalayan New Year's Eve Snow Bash",
      emoji: '🎆',
      defaultPercentage: 40,
      direction: 'higher',
      dateRange: 'Dec 27 – Jan 2',
      startMonth: 11,
      startDay: 27,
      endMonth: 0,
      endDay: 2,
      summary: 'Peak holiday year-end rush with winter bonfires, snow celebrations, and 100% chalet occupancy across Manali and Shimla.',
    },
    {
      id: 'manali_winter_carnival',
      name: 'Kullu Winter Carnival & Snow Peak',
      emoji: '❄️',
      defaultPercentage: 35,
      direction: 'higher',
      dateRange: 'Jan 2 – Jan 28',
      startMonth: 0,
      startDay: 2,
      endMonth: 0,
      endDay: 28,
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
      id: 'jaipur_christmas_nye',
      name: 'Christmas & New Year Royal Palace Holidays',
      emoji: '🎄',
      defaultPercentage: 35,
      direction: 'higher',
      dateRange: 'Dec 20 – Jan 2',
      startMonth: 11,
      startDay: 20,
      endMonth: 0,
      endDay: 2,
      summary: 'Peak royal winter tourism, luxury heritage palace galas, and festive holidays across Jaipur and Udaipur.',
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
      id: 'jaipur_diwali',
      name: 'Diwali Pink City Grand Illuminations',
      emoji: '🪔',
      defaultPercentage: 35,
      direction: 'higher',
      dateRange: 'Oct 18 – Nov 12',
      startMonth: 9,
      startDay: 18,
      endMonth: 10,
      endDay: 12,
      summary: 'Jaipur’s world-famous heritage market illuminations (Johari Bazaar, MI Road) attract hundreds of thousands of domestic and international visitors.',
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

  kerala: [
    {
      id: 'kerala_christmas_nye',
      name: 'Christmas & Year-End Coastal Carnival',
      emoji: '🎄',
      defaultPercentage: 30,
      direction: 'higher',
      dateRange: 'Dec 20 – Jan 2',
      startMonth: 11,
      startDay: 20,
      endMonth: 0,
      endDay: 2,
      summary: 'Historic Cochin Carnival, illuminated cathedral celebrations, and peak backwater houseboat holiday rush across Alleppey and Munnar.',
    },
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
      defaultPercentage: 30,
      direction: 'higher',
      dateRange: 'Aug 28 – Sept 15',
      startMonth: 7,
      startDay: 28,
      endMonth: 8,
      endDay: 15,
      summary: 'Maharashtra’s grandest celebration with Lalbaugcha Raja pandal tours, beach immersions, and coastal staycation demand across Mumbai, Pune, and Alibaug.',
    },
    {
      id: 'mumbai_christmas_nye',
      name: 'Christmas & New Year Coastal Staycation',
      emoji: '🎄',
      defaultPercentage: 30,
      direction: 'higher',
      dateRange: 'Dec 20 – Jan 2',
      startMonth: 11,
      startDay: 20,
      endMonth: 0,
      endDay: 2,
      summary: 'Year-end holiday celebrations, Bandra street illuminations, and high luxury villa demand in Alibaug and Lonavala.',
    },
    {
      id: 'mumbai_diwali',
      name: 'Diwali Coastal Villa Staycation & New Year',
      emoji: '🪔',
      defaultPercentage: 25,
      direction: 'higher',
      dateRange: 'Oct 18 – Nov 12',
      startMonth: 9,
      startDay: 18,
      endMonth: 10,
      endDay: 12,
      summary: 'Diwali family staycations and extended holiday celebrations create heavy demand for luxury villas in Alibaug and Lonavala.',
    },
    {
      id: 'mumbai_monsoon_ghats',
      name: 'Monsoon Western Ghats Waterfall Season',
      emoji: '🌧️',
      defaultPercentage: 20,
      direction: 'higher',
      dateRange: 'July 1 – Aug 25',
      startMonth: 6,
      startDay: 1,
      endMonth: 7,
      endDay: 25,
      summary: 'Lush misty green getaways to Lonavala, Khandala, and Alibaug villas for weekend rain leisure and waterfall trekking.',
    },
    {
      id: 'mumbai_winter_coastal',
      name: 'Winter Coastal Breeze Season',
      emoji: '🏙️',
      defaultPercentage: 15,
      direction: 'higher',
      dateRange: 'Nov 15 – Feb 28',
      startMonth: 10,
      startDay: 15,
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
      id: 'varanasi_diwali',
      name: 'Diwali & Annakut Ghats Illuminations',
      emoji: '🪔',
      defaultPercentage: 35,
      direction: 'higher',
      dateRange: 'Oct 15 – Nov 12',
      startMonth: 9,
      startDay: 15,
      endMonth: 10,
      endDay: 12,
      summary: 'Diwali illuminations across the Ganges ghats and Annakut celebrations at Kashi Vishwanath temple drive peak pilgrim tourism.',
    },
    {
      id: 'varanasi_maha_shivratri',
      name: 'Maha Shivratri & Shravan Sacred Month',
      emoji: '🔱',
      defaultPercentage: 35,
      direction: 'higher',
      dateRange: 'Feb 20 – March 5',
      startMonth: 1,
      startDay: 20,
      endMonth: 2,
      endDay: 5,
      summary: 'Grand celebrations of Lord Shiva at Kashi Vishwanath temple with millions of devotees filling holy river corridors.',
    },
    {
      id: 'varanasi_christmas',
      name: 'Christmas & Winter Kashi Ghats Season',
      emoji: '🎄',
      defaultPercentage: 25,
      direction: 'higher',
      dateRange: 'Dec 20 – Dec 26',
      startMonth: 11,
      startDay: 20,
      endMonth: 11,
      endDay: 26,
      summary: 'Pleasant winter morning boat rides, Subah-e-Banaras, and peak family year-end pilgrimage travel.',
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
      id: 'prayagraj_diwali',
      name: 'Deepawali & Sangam Kartik Holy Snan',
      emoji: '🪔',
      defaultPercentage: 30,
      direction: 'higher',
      dateRange: 'Oct 15 – Nov 15',
      startMonth: 9,
      startDay: 15,
      endMonth: 10,
      endDay: 15,
      summary: 'Sacred Kartik snan at the Triveni Sangam during Deepawali festive weeks brings devotees nationwide.',
    },
    {
      id: 'prayagraj_janmashtami',
      name: 'Janmashtami & Sacred Sangam Shravan Snan',
      emoji: '🦚',
      defaultPercentage: 30,
      direction: 'higher',
      dateRange: 'Aug 15 – Aug 30',
      startMonth: 7,
      startDay: 15,
      endMonth: 7,
      endDay: 30,
      summary: 'Sacred Shravan holy bathing and Janmashtami temple celebrations at the Triveni Sangam.',
    },
    {
      id: 'prayagraj_christmas',
      name: 'Winter Sangam Pilgrimage & Christmas Week',
      emoji: '🎄',
      defaultPercentage: 25,
      direction: 'higher',
      dateRange: 'Dec 20 – Dec 26',
      startMonth: 11,
      startDay: 20,
      endMonth: 11,
      endDay: 26,
      summary: 'Pre-Magh Mela winter spiritual retreats and family holiday visits to the sacred confluence.',
    },
    {
      id: 'ayodhya_deepotsav',
      name: 'Ayodhya Deepotsav & Ram Navami',
      emoji: '🪔',
      defaultPercentage: 40,
      direction: 'higher',
      dateRange: 'Oct 18 – Nov 12',
      startMonth: 9,
      startDay: 18,
      endMonth: 10,
      endDay: 12,
      summary: 'World-record diya lighting along the Saryu River and Ram Mandir celebrations driving massive sacred accommodation demand.',
    },
    {
      id: 'ayodhya_ram_navami',
      name: 'Ram Navami Janmotsav Grand Mela',
      emoji: '🏹',
      defaultPercentage: 40,
      direction: 'higher',
      dateRange: 'March 25 – April 10',
      startMonth: 2,
      startDay: 25,
      endMonth: 3,
      endDay: 10,
      summary: 'Lord Ram birth celebrations at the grand Ram Mandir with lakhs of devotees seeking darshan.',
    },
    {
      id: 'ayodhya_christmas',
      name: 'Winter Pilgrim Season & Christmas Week',
      emoji: '🎄',
      defaultPercentage: 25,
      direction: 'higher',
      dateRange: 'Dec 20 – Dec 26',
      startMonth: 11,
      startDay: 20,
      endMonth: 11,
      endDay: 26,
      summary: 'Pleasant winter pilgrimage season to Ram Janmabhoomi and Kanak Bhawan with heavy holiday family footfall.',
    },
    {
      id: 'rishikesh_diwali',
      name: 'Deepawali & Holy Ganga Aarti Festivities',
      emoji: '🪔',
      defaultPercentage: 30,
      direction: 'higher',
      dateRange: 'Oct 15 – Nov 20',
      startMonth: 9,
      startDay: 15,
      endMonth: 10,
      endDay: 20,
      summary: 'Tens of thousands of floating diyas at Triveni Ghat and spiritual pilgrims celebrating Deepawali on the sacred Ganges drive peak ashram and boutique resort bookings.',
    },
    {
      id: 'rishikesh_yoga',
      name: 'International Yoga Festival & Spring Retreats',
      emoji: '🧘',
      defaultPercentage: 25,
      direction: 'higher',
      dateRange: 'March 1 – March 20',
      startMonth: 2,
      startDay: 1,
      endMonth: 2,
      endDay: 20,
      summary: 'Global spiritual seekers converge on the yoga capital of the world for ashram teachings, meditation, and holy Ganga dips.',
    },
    {
      id: 'rishikesh_autumn_adventure',
      name: 'Autumn Rafting & Himalayan Trekking Peak',
      emoji: '🚣',
      defaultPercentage: 25,
      direction: 'higher',
      dateRange: 'Sept 20 – Nov 30',
      startMonth: 8,
      startDay: 20,
      endMonth: 10,
      endDay: 30,
      summary: 'Post-monsoon river opening, grade III/IV white-water rafting, and camping along Shivpuri and Tapovan with high adventure travel demand.',
    },
    {
      id: 'rishikesh_ganga_dussehra',
      name: 'Ganga Dussehra Sacred River Confluence',
      emoji: '🌊',
      defaultPercentage: 30,
      direction: 'higher',
      dateRange: 'May 20 – June 15',
      startMonth: 4,
      startDay: 20,
      endMonth: 5,
      endDay: 15,
      summary: 'Millions gather for holy purification dips celebrating the descent of River Ganga, creating peak summer accommodation demand.',
    },
    {
      id: 'rishikesh_christmas',
      name: 'Winter Solstice & Christmas Ganga Retreats',
      emoji: '🎄',
      defaultPercentage: 25,
      direction: 'higher',
      dateRange: 'Dec 20 – Dec 26',
      startMonth: 11,
      startDay: 20,
      endMonth: 11,
      endDay: 26,
      summary: 'Peaceful winter Ganga meditation retreats, campfire evenings, and holiday seekers escaping northern city smog.',
    },
    {
      id: 'rishikesh_new_year',
      name: "New Year's Eve Himalayan Riverside Camps",
      emoji: '🎆',
      defaultPercentage: 30,
      direction: 'higher',
      dateRange: 'Dec 27 – Jan 2',
      startMonth: 11,
      startDay: 27,
      endMonth: 0,
      endDay: 2,
      summary: 'Year-end camping, music, and bonfire gatherings along the Ganges riverbanks in Shivpuri and Mohan Chatti.',
    },
    {
      id: 'mathura_janmashtami',
      name: 'Sri Krishna Janmashtami & Nandotsav',
      emoji: '🦚',
      defaultPercentage: 40,
      direction: 'higher',
      dateRange: 'Aug 15 – Aug 30',
      startMonth: 7,
      startDay: 15,
      endMonth: 7,
      endDay: 30,
      summary: 'Lord Krishna’s midnight appearance festival and Nandotsav drawing millions of pilgrims to Mathura Janmabhoomi and Vrindavan Banke Bihari temple.',
    },
    {
      id: 'mathura_braj_holi',
      name: 'Braj Lathmar Holi Festival',
      emoji: '🎨',
      defaultPercentage: 40,
      direction: 'higher',
      dateRange: 'March 5 – March 22',
      startMonth: 2,
      startDay: 5,
      endMonth: 2,
      endDay: 22,
      summary: 'World-famous Lathmar and Phoolon wali Holi in Barsana, Nandgaon, and Vrindavan with massive devotional tourism.',
    },
    {
      id: 'mathura_diwali',
      name: 'Deepawali & Govardhan Annakut Parikrama',
      emoji: '🪔',
      defaultPercentage: 35,
      direction: 'higher',
      dateRange: 'Oct 18 – Nov 15',
      startMonth: 9,
      startDay: 18,
      endMonth: 10,
      endDay: 15,
      summary: 'Devotees perform the sacred 21-km Govardhan Parikrama and celebrate Annakut in Vrindavan and Mathura.',
    },
    {
      id: 'mathura_christmas',
      name: 'Winter Braj Pilgrimage & Christmas Break',
      emoji: '🎄',
      defaultPercentage: 25,
      direction: 'higher',
      dateRange: 'Dec 20 – Dec 26',
      startMonth: 11,
      startDay: 20,
      endMonth: 11,
      endDay: 26,
      summary: 'Pleasant winter climate and year-end pilgrim retreats in Vrindavan and Mathura temples.',
    },
  ],

  general: [
    {
      id: 'christmas',
      name: 'Christmas & Year-End Holidays',
      emoji: '🎄',
      defaultPercentage: 25,
      direction: 'higher',
      dateRange: 'Dec 20 – Dec 26',
      startMonth: 11,
      startDay: 20,
      endMonth: 11,
      endDay: 26,
      summary: 'Nationwide Christmas holiday travel surge; high demand for family villas, chalets, and vacation homes.',
    },
    {
      id: 'new_year',
      name: "New Year's Eve Grand Peak",
      emoji: '🎆',
      defaultPercentage: 35,
      direction: 'higher',
      dateRange: 'Dec 27 – Jan 2',
      startMonth: 11,
      startDay: 27,
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
      dateRange: 'Oct 18 – Nov 12',
      startMonth: 9,
      startDay: 18,
      endMonth: 10,
      endDay: 12,
      summary: 'India’s largest festive season. Major family gatherings and pilgrimage surges across heritage and holy destinations.',
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
      summary: 'Spring break and color celebrations. Popular weekend getaway surge across Northern and Western India.',
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

// Flattened global catalog for backward compatibility
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
  if (/mumbai|lonavala|alibaug|pune|maharashtra/i.test(loc)) return 'mumbai';
  if (/varanasi|kashi|prayagraj|allahabad|ayodhya|rishikesh|haridwar|mathura|vrindavan|puri|tirupati/i.test(loc)) return 'spiritual';
  return 'general';
}

/**
 * Returns the exact city-specific local seasons and event calendar for any destination
 */
function getDestinationEvents(location = '') {
  const cityKey = normalizeCityKey(location);
  const loc = String(location || '').toLowerCase();

  if (cityKey === 'spiritual') {
    const events = DESTINATION_CALENDARS.spiritual;
    if (loc.includes('varanasi') || loc.includes('kashi')) {
      return events.filter((e) => e.id.startsWith('varanasi'));
    }
    if (loc.includes('prayagraj') || loc.includes('allahabad')) {
      return events.filter((e) => e.id.startsWith('prayagraj'));
    }
    if (loc.includes('ayodhya')) {
      return events.filter((e) => e.id.startsWith('ayodhya'));
    }
    if (loc.includes('rishikesh') || loc.includes('haridwar')) {
      return events.filter((e) => e.id.startsWith('rishikesh'));
    }
    if (loc.includes('mathura') || loc.includes('vrindavan')) {
      return events.filter((e) => e.id.startsWith('mathura'));
    }
    return events;
  }

  return DESTINATION_CALENDARS[cityKey] || DESTINATION_CALENDARS.general;
}

/**
 * Helper to compute host-specific variation for a listing
 * Each listing has its own individual host policy!
 */
function getHostSpecificPercentage(listingOrObj, basePercentage) {
  if (!listingOrObj || typeof listingOrObj !== 'object') return basePercentage;

  if (listingOrObj.hostSurgePercentage !== null && listingOrObj.hostSurgePercentage !== undefined) {
    return Number(listingOrObj.hostSurgePercentage);
  }

  if (basePercentage === 0) {
    return 0;
  }

  if (basePercentage < 0) return basePercentage;

  const idStr = String(listingOrObj._id || listingOrObj.id || listingOrObj.title || 'stay');
  let hash = 0;
  for (let i = 0; i < idStr.length; i++) {
    hash = (hash * 31 + idStr.charCodeAt(i)) % 1000;
  }

  const offset = ((hash % 7) - 3); // -3 to +3
  const finalPercent = basePercentage + offset;

  return Math.max(5, Math.min(50, finalPercent));
}

/**
 * Helper to parse month (0-11) and day (1-31) reliably without timezone shift
 */
function parseMonthAndDay(checkInDate) {
  if (!checkInDate) {
    const d = new Date();
    return { month: d.getMonth(), day: d.getDate() };
  }

  if (typeof checkInDate === 'string' && checkInDate.includes('-')) {
    const cleanDate = checkInDate.split('T')[0].trim();
    const parts = cleanDate.split('-');
    if (parts.length === 3) {
      const m = parseInt(parts[1], 10) - 1; // 0-indexed
      const d = parseInt(parts[2], 10);
      if (!isNaN(m) && !isNaN(d)) {
        return { month: m, day: d };
      }
    }
  }

  const d = new Date(checkInDate);
  if (!isNaN(d.getTime())) {
    return { month: d.getMonth(), day: d.getDate() };
  }

  const now = new Date();
  return { month: now.getMonth(), day: now.getDate() };
}

/**
 * Determines seasonal/event pricing for a specific listing or location based strictly on
 * city-specific local seasonality, event calendars, and cultural travel patterns.
 */
function getFestivalPricing(listingOrLocation = '', checkInDate = null, festivalQuery = null) {
  const isListingObj = listingOrLocation && typeof listingOrLocation === 'object';
  const location = isListingObj ? (listingOrLocation.location || '') : String(listingOrLocation || '');
  const loc = location.toLowerCase();
  const hostName = isListingObj && listingOrLocation.owner ? (listingOrLocation.owner.username || 'Host') : 'Host';

  const cityKey = normalizeCityKey(location);
  const cityEvents = getDestinationEvents(location);
  const cityName = location ? location.split(',')[0].trim() : 'this destination';

  // Flag indicating if destination is a pure leisure tourist destination (Goa, Manali, Shimla)
  const isPureTouristHub = cityKey === 'goa' || cityKey === 'manali';

  let matchedFestival = null;
  let isGenericMismatch = false;
  let mismatchEventName = '';
  let customMismatchExplanation = '';

  // 1. Explicit Festival Query Matching
  if (festivalQuery) {
    const q = festivalQuery.toLowerCase().trim();
    const cleanQ = q.replace(/_/g, ' ');

    // Exact ID match in cityEvents takes priority
    const exactCityEvent = cityEvents.find((f) => f.id.toLowerCase() === q);
    if (exactCityEvent) {
      matchedFestival = exactCityEvent;
    }

    // RULE A: Tourist places (Manali, Goa, Shimla) do NOT get affected by Diwali or religious festivals
    else if (isPureTouristHub && (cleanQ.includes('diwali') || cleanQ.includes('deepawali'))) {
      isGenericMismatch = true;
      mismatchEventName = 'Diwali & Deepawali';
      customMismatchExplanation = `In ${cityName}, hotel rates do NOT increase for Diwali. As a premier leisure tourist destination, domestic travelers celebrate Diwali at home with traditional family pujas, so properties maintain direct baseline rates with 0% holiday markup.`;
    }

    // RULE B: Janmashtami ONLY increases in Mathura, Vrindavan, and Prayagraj
    else if (cleanQ.includes('janmashtami') || cleanQ.includes('krishna')) {
      if (loc.includes('mathura') || loc.includes('vrindavan')) {
        matchedFestival = DESTINATION_CALENDARS.spiritual.find((f) => f.id === 'mathura_janmashtami');
      } else if (loc.includes('prayagraj') || loc.includes('allahabad')) {
        matchedFestival = DESTINATION_CALENDARS.spiritual.find((f) => f.id === 'prayagraj_janmashtami');
      } else {
        isGenericMismatch = true;
        mismatchEventName = 'Krishna Janmashtami';
        customMismatchExplanation = `Sri Krishna Janmashtami is celebrated with peak devotional travel in Mathura, Vrindavan, and Prayagraj. In ${cityName}, properties maintain standard baseline rates with 0% holiday markup.`;
      }
    }

    // RULE C: Ganesh Chaturthi / Ganpati Mahotsav ONLY increases in Maharashtra (Mumbai, Pune, Alibaug, Lonavala)
    else if (cleanQ.includes('ganesh') || cleanQ.includes('ganpati') || cleanQ.includes('ganeshotsav')) {
      if (cityKey === 'mumbai' || loc.includes('mumbai') || loc.includes('pune') || loc.includes('alibaug') || loc.includes('lonavala') || loc.includes('maharashtra')) {
        matchedFestival = DESTINATION_CALENDARS.mumbai.find((f) => f.id === 'mumbai_ganeshotsav');
      } else {
        isGenericMismatch = true;
        mismatchEventName = 'Ganeshotsav & Ganpati Mahotsav';
        customMismatchExplanation = `Ganeshotsav is a signature cultural celebration of Maharashtra. Outside Maharashtra in ${cityName}, stays maintain standard direct rates with 0% festival markup.`;
      }
    }

    // RULE D: Dev Deepawali ONLY increases in Varanasi / Kashi
    else if (cleanQ.includes('dev deepawali') || cleanQ.includes('dev diwali')) {
      if (loc.includes('varanasi') || loc.includes('kashi')) {
        matchedFestival = DESTINATION_CALENDARS.spiritual.find((f) => f.id === 'varanasi_dev_deepawali');
      } else {
        isGenericMismatch = true;
        mismatchEventName = 'Dev Deepawali';
        customMismatchExplanation = `Dev Deepawali is celebrated exclusively along the 84 ghats of Varanasi on Kartik Poornima. In ${cityName}, stays maintain standard direct rates with 0% markup.`;
      }
    }

    // RULE E: International Yoga Festival ONLY in Rishikesh
    else if (q.includes('yoga')) {
      if (loc.includes('rishikesh') || loc.includes('haridwar')) {
        matchedFestival = DESTINATION_CALENDARS.spiritual.find((f) => f.id === 'rishikesh_yoga');
      } else {
        isGenericMismatch = true;
        mismatchEventName = 'International Yoga Festival';
        customMismatchExplanation = `The International Yoga Festival is held exclusively in Rishikesh on the sacred Ganges. Stays in ${cityName} maintain standard direct rates.`;
      }
    }

    // RULE F: Magh Mela / Kumbh ONLY in Prayagraj
    else if (q.includes('magh') || q.includes('kumbh')) {
      if (loc.includes('prayagraj') || loc.includes('allahabad')) {
        matchedFestival = DESTINATION_CALENDARS.spiritual.find((f) => f.id === 'prayagraj_magh_mela');
      } else {
        isGenericMismatch = true;
        mismatchEventName = 'Magh Mela & Kumbh Holy Snan';
        customMismatchExplanation = `Magh Mela is celebrated at the Triveni Sangam in Prayagraj. Stays in ${cityName} maintain standard direct rates.`;
      }
    }

    // RULE G: Jaipur Literature Festival (JLF) ONLY in Jaipur
    else if (q.includes('jlf') || q.includes('literature')) {
      if (cityKey === 'jaipur') {
        matchedFestival = DESTINATION_CALENDARS.jaipur.find((f) => f.id === 'jaipur_jlf');
      } else {
        isGenericMismatch = true;
        mismatchEventName = 'Jaipur Literature Festival';
        customMismatchExplanation = `The Jaipur Literature Festival is held exclusively in the Pink City of Jaipur. Stays in ${cityName} maintain standard direct rates.`;
      }
    }

    // RULE H: Sunburn Festival ONLY in Goa
    else if (q.includes('sunburn')) {
      if (cityKey === 'goa') {
        matchedFestival = DESTINATION_CALENDARS.goa.find((f) => f.id === 'goa_sunburn');
      } else {
        isGenericMismatch = true;
        mismatchEventName = 'Sunburn Festival';
        customMismatchExplanation = `Sunburn Festival is celebrated along the coastal beaches of Goa. Stays in ${cityName} maintain standard direct rates.`;
      }
    }

    // RULE I: Winter Carnival ONLY in Manali / Himachal
    else if (q.includes('winter carnival') || (q.includes('carnival') && cityKey === 'manali')) {
      if (cityKey === 'manali') {
        matchedFestival = DESTINATION_CALENDARS.manali.find((f) => f.id === 'manali_winter_carnival');
      } else {
        isGenericMismatch = true;
        mismatchEventName = 'Kullu Winter Carnival';
        customMismatchExplanation = `The Winter Carnival is celebrated in Solang Valley and Manali. Stays in ${cityName} maintain standard direct rates.`;
      }
    }

    // RULE J: Christmas & Year-End Holidays (PAN-INDIA: Celebrated across the country!)
    else if (q.includes('christmas') || q.includes('xmas')) {
      if (cityKey === 'goa') {
        matchedFestival = DESTINATION_CALENDARS.goa.find((f) => f.id === 'goa_christmas');
      } else if (cityKey === 'manali') {
        matchedFestival = DESTINATION_CALENDARS.manali.find((f) => f.id === 'manali_christmas');
      } else if (cityKey === 'jaipur') {
        matchedFestival = DESTINATION_CALENDARS.jaipur.find((f) => f.id === 'jaipur_christmas_nye');
      } else if (cityKey === 'kerala') {
        matchedFestival = DESTINATION_CALENDARS.kerala.find((f) => f.id === 'kerala_christmas_nye');
      } else if (cityKey === 'mumbai') {
        matchedFestival = DESTINATION_CALENDARS.mumbai.find((f) => f.id === 'mumbai_christmas_nye');
      } else if (cityKey === 'spiritual') {
        if (loc.includes('varanasi') || loc.includes('kashi')) {
          matchedFestival = DESTINATION_CALENDARS.spiritual.find((f) => f.id === 'varanasi_christmas');
        } else if (loc.includes('rishikesh') || loc.includes('haridwar')) {
          matchedFestival = DESTINATION_CALENDARS.spiritual.find((f) => f.id === 'rishikesh_christmas');
        } else if (loc.includes('ayodhya')) {
          matchedFestival = DESTINATION_CALENDARS.spiritual.find((f) => f.id === 'ayodhya_christmas');
        } else if (loc.includes('prayagraj') || loc.includes('allahabad')) {
          matchedFestival = DESTINATION_CALENDARS.spiritual.find((f) => f.id === 'prayagraj_christmas');
        } else if (loc.includes('mathura') || loc.includes('vrindavan')) {
          matchedFestival = DESTINATION_CALENDARS.spiritual.find((f) => f.id === 'mathura_christmas');
        } else {
          matchedFestival = DESTINATION_CALENDARS.general.find((f) => f.id === 'christmas');
        }
      } else {
        matchedFestival = DESTINATION_CALENDARS.general.find((f) => f.id === 'christmas');
      }
    }

    // RULE K: New Year / Year-End Peak
    else if (q.includes('new year') || q.includes('nye')) {
      if (cityKey === 'goa') {
        matchedFestival = DESTINATION_CALENDARS.goa.find((f) => f.id === 'goa_sunburn');
      } else if (cityKey === 'manali') {
        matchedFestival = DESTINATION_CALENDARS.manali.find((f) => f.id === 'manali_new_year');
      } else if (cityKey === 'jaipur') {
        matchedFestival = DESTINATION_CALENDARS.jaipur.find((f) => f.id === 'jaipur_christmas_nye');
      } else if (cityKey === 'kerala') {
        matchedFestival = DESTINATION_CALENDARS.kerala.find((f) => f.id === 'kerala_christmas_nye');
      } else if (cityKey === 'mumbai') {
        matchedFestival = DESTINATION_CALENDARS.mumbai.find((f) => f.id === 'mumbai_christmas_nye');
      } else if (cityKey === 'spiritual' && (loc.includes('rishikesh') || loc.includes('haridwar'))) {
        matchedFestival = DESTINATION_CALENDARS.spiritual.find((f) => f.id === 'rishikesh_new_year');
      } else {
        matchedFestival = DESTINATION_CALENDARS.general.find((f) => f.id === 'new_year');
      }
    }

    // RULE L: Diwali in Heritage & Spiritual Corridors
    else if (q.includes('diwali') || q.includes('deepawali')) {
      if (cityKey === 'spiritual') {
        if (loc.includes('varanasi') || loc.includes('kashi')) {
          matchedFestival = DESTINATION_CALENDARS.spiritual.find((f) => f.id === 'varanasi_diwali') ||
                            DESTINATION_CALENDARS.spiritual.find((f) => f.id === 'varanasi_dev_deepawali');
        } else if (loc.includes('rishikesh') || loc.includes('haridwar')) {
          matchedFestival = DESTINATION_CALENDARS.spiritual.find((f) => f.id === 'rishikesh_diwali');
        } else if (loc.includes('ayodhya')) {
          matchedFestival = DESTINATION_CALENDARS.spiritual.find((f) => f.id === 'ayodhya_deepotsav');
        } else if (loc.includes('prayagraj') || loc.includes('allahabad')) {
          matchedFestival = DESTINATION_CALENDARS.spiritual.find((f) => f.id === 'prayagraj_diwali');
        } else if (loc.includes('mathura') || loc.includes('vrindavan')) {
          matchedFestival = DESTINATION_CALENDARS.spiritual.find((f) => f.id === 'mathura_diwali');
        } else {
          matchedFestival = DESTINATION_CALENDARS.general.find((f) => f.id === 'diwali');
        }
      } else if (cityKey === 'jaipur') {
        matchedFestival = DESTINATION_CALENDARS.jaipur.find((f) => f.id === 'jaipur_diwali');
      } else if (cityKey === 'mumbai') {
        matchedFestival = DESTINATION_CALENDARS.mumbai.find((f) => f.id === 'mumbai_diwali');
      } else {
        matchedFestival = DESTINATION_CALENDARS.general.find((f) => f.id === 'diwali');
      }
    }

    // Fallback search within city events
    if (!matchedFestival && !isGenericMismatch) {
      matchedFestival = cityEvents.find((f) =>
        f.id === q ||
        f.id.toLowerCase().includes(q) ||
        f.name.toLowerCase().includes(q)
      );
    }
  }

  // 2. Date-Based Calendar Matching
  const { month, day } = parseMonthAndDay(checkInDate);

  if (!matchedFestival && !isGenericMismatch) {
    // DATE PRIORITY 1: Christmas Week (Dec 20 – Dec 26) — Universal across India
    if (month === 11 && day >= 20 && day <= 26) {
      if (cityKey === 'goa') {
        matchedFestival = DESTINATION_CALENDARS.goa.find((f) => f.id === 'goa_christmas');
      } else if (cityKey === 'manali') {
        matchedFestival = DESTINATION_CALENDARS.manali.find((f) => f.id === 'manali_christmas');
      } else if (cityKey === 'jaipur') {
        matchedFestival = DESTINATION_CALENDARS.jaipur.find((f) => f.id === 'jaipur_christmas_nye');
      } else if (cityKey === 'kerala') {
        matchedFestival = DESTINATION_CALENDARS.kerala.find((f) => f.id === 'kerala_christmas_nye');
      } else if (cityKey === 'mumbai') {
        matchedFestival = DESTINATION_CALENDARS.mumbai.find((f) => f.id === 'mumbai_christmas_nye');
      } else if (cityKey === 'spiritual') {
        if (loc.includes('varanasi') || loc.includes('kashi')) {
          matchedFestival = DESTINATION_CALENDARS.spiritual.find((f) => f.id === 'varanasi_christmas');
        } else if (loc.includes('rishikesh') || loc.includes('haridwar')) {
          matchedFestival = DESTINATION_CALENDARS.spiritual.find((f) => f.id === 'rishikesh_christmas');
        } else if (loc.includes('ayodhya')) {
          matchedFestival = DESTINATION_CALENDARS.spiritual.find((f) => f.id === 'ayodhya_christmas');
        } else if (loc.includes('prayagraj') || loc.includes('allahabad')) {
          matchedFestival = DESTINATION_CALENDARS.spiritual.find((f) => f.id === 'prayagraj_christmas');
        } else if (loc.includes('mathura') || loc.includes('vrindavan')) {
          matchedFestival = DESTINATION_CALENDARS.spiritual.find((f) => f.id === 'mathura_christmas');
        } else {
          matchedFestival = DESTINATION_CALENDARS.general.find((f) => f.id === 'christmas');
        }
      } else {
        matchedFestival = DESTINATION_CALENDARS.general.find((f) => f.id === 'christmas');
      }
    }

    // DATE PRIORITY 2: New Year / Year-End Music & Snow Bash (Dec 27 – Jan 2)
    else if ((month === 11 && day >= 27) || (month === 0 && day <= 2)) {
      if (cityKey === 'goa') {
        matchedFestival = DESTINATION_CALENDARS.goa.find((f) => f.id === 'goa_sunburn');
      } else if (cityKey === 'manali') {
        matchedFestival = DESTINATION_CALENDARS.manali.find((f) => f.id === 'manali_new_year');
      } else if (cityKey === 'jaipur') {
        matchedFestival = DESTINATION_CALENDARS.jaipur.find((f) => f.id === 'jaipur_christmas_nye');
      } else if (cityKey === 'kerala') {
        matchedFestival = DESTINATION_CALENDARS.kerala.find((f) => f.id === 'kerala_christmas_nye');
      } else if (cityKey === 'mumbai') {
        matchedFestival = DESTINATION_CALENDARS.mumbai.find((f) => f.id === 'mumbai_christmas_nye');
      } else if (cityKey === 'spiritual' && (loc.includes('rishikesh') || loc.includes('haridwar'))) {
        matchedFestival = DESTINATION_CALENDARS.spiritual.find((f) => f.id === 'rishikesh_new_year');
      } else {
        matchedFestival = DESTINATION_CALENDARS.general.find((f) => f.id === 'new_year');
      }
    }

    // DATE PRIORITY 3: Janmashtami Window (August 15 – August 30) — Strict regional restriction
    else if (month === 7 && day >= 15 && day <= 30) {
      if (loc.includes('mathura') || loc.includes('vrindavan')) {
        matchedFestival = DESTINATION_CALENDARS.spiritual.find((f) => f.id === 'mathura_janmashtami');
      } else if (loc.includes('prayagraj') || loc.includes('allahabad')) {
        matchedFestival = DESTINATION_CALENDARS.spiritual.find((f) => f.id === 'prayagraj_janmashtami');
      }
      // Pure tourist places (Goa monsoon -25%, Manali monsoon -35%) remain handled below!
    }

    // DATE PRIORITY 4: Ganeshotsav / Ganpati Window (August 28 – September 15) — Maharashtra only
    else if ((month === 7 && day >= 28) || (month === 8 && day <= 15)) {
      if (cityKey === 'mumbai' || loc.includes('mumbai') || loc.includes('pune') || loc.includes('alibaug') || loc.includes('lonavala')) {
        matchedFestival = DESTINATION_CALENDARS.mumbai.find((f) => f.id === 'mumbai_ganeshotsav');
      }
    }

    // DATE PRIORITY 5: Destination-Specific Calendars
    if (!matchedFestival) {
      if (cityKey === 'goa') {
        if (month === 1 && day >= 8 && day <= 22) {
          matchedFestival = DESTINATION_CALENDARS.goa.find((f) => f.id === 'goa_carnival');
        } else if (month === 2 && day >= 12 && day <= 28) {
          matchedFestival = DESTINATION_CALENDARS.goa.find((f) => f.id === 'goa_shigmo');
        } else if (month >= 5 && month <= 8) {
          // June 15 – Sept 15: Monsoon Green Season Discount (-25%)
          matchedFestival = DESTINATION_CALENDARS.goa.find((f) => f.id === 'goa_monsoon');
        } else if (month === 9 || (month === 10 && day <= 15)) {
          // Watersports & Beach Opening (+15%)
          matchedFestival = DESTINATION_CALENDARS.goa.find((f) => f.id === 'goa_watersports');
        }
        // Note: Goa does NOT surge for Diwali! Rates remain standard baseline rate.
      } else if (cityKey === 'jaipur') {
        if (month === 0 && day >= 12 && day <= 30) {
          matchedFestival = DESTINATION_CALENDARS.jaipur.find((f) => f.id === 'jaipur_jlf');
        } else if ((month === 9 && day >= 18) || (month === 10 && day <= 12)) {
          matchedFestival = DESTINATION_CALENDARS.jaipur.find((f) => f.id === 'jaipur_diwali');
        } else if (month === 10 && day <= 15) {
          matchedFestival = DESTINATION_CALENDARS.jaipur.find((f) => f.id === 'jaipur_pushkar');
        } else if (month >= 10 || month <= 1) {
          matchedFestival = DESTINATION_CALENDARS.jaipur.find((f) => f.id === 'jaipur_winter_palace');
        } else if (month >= 3 && month <= 5) {
          // April 15 – June 30: Summer Discount (-30%)
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
          // July 10 – Aug 25: Monsoon Landslide Risk Discount (-35%)
          matchedFestival = DESTINATION_CALENDARS.manali.find((f) => f.id === 'manali_monsoon');
        }
        // Note: Manali does NOT surge for Diwali! Rates remain standard baseline rate.
      } else if (cityKey === 'kerala') {
        if ((month === 7 && day >= 15) || (month === 8 && day <= 15)) {
          matchedFestival = DESTINATION_CALENDARS.kerala.find((f) => f.id === 'kerala_onam');
        } else if (month >= 10 || month <= 1) {
          matchedFestival = DESTINATION_CALENDARS.kerala.find((f) => f.id === 'kerala_winter_backwaters');
        } else if (month === 5 || month === 6) {
          // June 1 – July 31: Monsoon Ayurveda Discount (-20%)
          matchedFestival = DESTINATION_CALENDARS.kerala.find((f) => f.id === 'kerala_monsoon_ayurveda');
        }
      } else if (cityKey === 'mumbai') {
        if ((month === 9 && day >= 18) || (month === 10 && day <= 12)) {
          matchedFestival = DESTINATION_CALENDARS.mumbai.find((f) => f.id === 'mumbai_diwali');
        } else if (month === 6 || month === 7) {
          matchedFestival = DESTINATION_CALENDARS.mumbai.find((f) => f.id === 'mumbai_monsoon_ghats');
        } else if (month >= 10 || month <= 1) {
          matchedFestival = DESTINATION_CALENDARS.mumbai.find((f) => f.id === 'mumbai_winter_coastal');
        }
      } else if (cityKey === 'spiritual') {
        if (loc.includes('varanasi') || loc.includes('kashi')) {
          if ((month === 9 && day >= 15) || (month === 10 && day <= 30)) {
            // Nov 10 to Nov 26: Dev Deepawali, Oct 15 to Nov 10: Deepawali
            matchedFestival = (month === 10 && day >= 8 && day <= 28)
              ? DESTINATION_CALENDARS.spiritual.find((f) => f.id === 'varanasi_dev_deepawali')
              : DESTINATION_CALENDARS.spiritual.find((f) => f.id === 'varanasi_diwali');
          } else if ((month === 1 && day >= 15) || (month === 2 && day <= 10)) {
            matchedFestival = DESTINATION_CALENDARS.spiritual.find((f) => f.id === 'varanasi_maha_shivratri');
          }
        } else if (loc.includes('rishikesh') || loc.includes('haridwar')) {
          if ((month === 9 && day >= 15) || (month === 10 && day <= 20)) {
            matchedFestival = DESTINATION_CALENDARS.spiritual.find((f) => f.id === 'rishikesh_diwali');
          } else if (month === 2 && day <= 20) {
            matchedFestival = DESTINATION_CALENDARS.spiritual.find((f) => f.id === 'rishikesh_yoga');
          } else if ((month === 8 && day >= 20) || (month === 9 && day < 15)) {
            matchedFestival = DESTINATION_CALENDARS.spiritual.find((f) => f.id === 'rishikesh_autumn_adventure');
          } else if ((month === 4 && day >= 20) || (month === 5 && day <= 15)) {
            matchedFestival = DESTINATION_CALENDARS.spiritual.find((f) => f.id === 'rishikesh_ganga_dussehra');
          }
        } else if (loc.includes('prayagraj') || loc.includes('allahabad')) {
          if (month === 0 || (month === 1 && day <= 28)) {
            matchedFestival = DESTINATION_CALENDARS.spiritual.find((f) => f.id === 'prayagraj_magh_mela');
          } else if ((month === 9 && day >= 15) || (month === 10 && day <= 20)) {
            matchedFestival = DESTINATION_CALENDARS.spiritual.find((f) => f.id === 'prayagraj_diwali');
          }
        } else if (loc.includes('ayodhya')) {
          if ((month === 9 && day >= 15) || (month === 10 && day <= 15)) {
            matchedFestival = DESTINATION_CALENDARS.spiritual.find((f) => f.id === 'ayodhya_deepotsav');
          } else if ((month === 2 && day >= 20) || (month === 3 && day <= 10)) {
            matchedFestival = DESTINATION_CALENDARS.spiritual.find((f) => f.id === 'ayodhya_ram_navami');
          }
        } else if (loc.includes('mathura') || loc.includes('vrindavan')) {
          if (month === 2 && day >= 5 && day <= 25) {
            matchedFestival = DESTINATION_CALENDARS.spiritual.find((f) => f.id === 'mathura_braj_holi');
          } else if ((month === 9 && day >= 18) || (month === 10 && day <= 15)) {
            matchedFestival = DESTINATION_CALENDARS.spiritual.find((f) => f.id === 'mathura_diwali');
          }
        }
      } else {
        // General pan-India fallback
        if ((month === 9 && day >= 20) || (month === 10 && day <= 12)) {
          matchedFestival = DESTINATION_CALENDARS.general.find((f) => f.id === 'diwali');
        } else if (month === 2 && day >= 10 && day <= 30) {
          matchedFestival = DESTINATION_CALENDARS.general.find((f) => f.id === 'holi');
        } else if (month === 7 && day >= 10 && day <= 25) {
          matchedFestival = DESTINATION_CALENDARS.general.find((f) => f.id === 'rakshabandhan');
        } else if (month === 6) {
          matchedFestival = DESTINATION_CALENDARS.general.find((f) => f.id === 'monsoon_discount');
        }
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
    customExplanation = customMismatchExplanation || `In ${cityName}, hotel rates do NOT increase for ${mismatchEventName}. Domestic travelers celebrate ${mismatchEventName} at home with family, so leisure hotel occupancy remains standard. Hosts maintain their direct baseline rate with 0% holiday markup.`;
    customWhyNotDiwali = `In ${cityName}, generic religious holidays do not drive leisure room compression. Local pricing is governed strictly by coastal/mountain weather, seasonal tourism influx, and regional event calendars.`;
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
    customWhyNotDiwali = `In ${cityName}, rates are governed strictly by local weather patterns, seasonal tourism influx, and regional events.`;
  }

  // Apply host-specific percentage calculation
  let percentage = isListingObj && basePercentage !== 0
    ? getHostSpecificPercentage(listingOrLocation, basePercentage)
    : basePercentage;

  let direction = percentage > 0 ? 'higher' : percentage < 0 ? 'lower' : 'standard';

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
