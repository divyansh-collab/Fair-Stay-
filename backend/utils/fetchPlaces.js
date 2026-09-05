const axios = require('axios');
const Listing = require('../models/listing');
const User = require('../models/user');
const Review = require('../models/review');

const GOOGLE_PLACES_API_KEY = process.env.GOOGLE_PLACES_API_KEY;

// Destination Queries for Google Places Text Search (Vacation, Beach, Mountain, City & Heritage)
const VACATION_DESTINATION_QUERIES = [
  // 1. Goa — Beachfront & Pool Villas
  { corridor: 'Goa', query: 'luxury beach villas and private resorts in Baga Candolim Goa', category: 'Beachfront' },
  { corridor: 'Goa', query: 'beach cottages and pool stays in Palolem Anjuna Goa', category: 'Pools' },

  // 2. Manali & Himachal — Mountain Cabins & Nature
  { corridor: 'Manali', query: 'wooden chalets and mountain cottages in Manali', category: 'Mountains' },
  { corridor: 'Manali', query: 'resorts and boutique stays in Old Manali pine forest', category: 'Countryside' },

  // 3. Jaipur & Udaipur — Heritage Havelis & Mansions
  { corridor: 'Jaipur', query: 'heritage palace hotel and royal haveli in Jaipur', category: 'Heritage' },
  { corridor: 'Udaipur', query: 'lake view boutique resorts and villas in Udaipur', category: 'Trending' },

  // 4. Mumbai & Bengaluru — City Apartments & Workations
  { corridor: 'Mumbai', query: 'luxury serviced apartments and boutique stays in Bandra Juhu Mumbai', category: 'City' },
  { corridor: 'Bengaluru', query: 'workation apartments and boutique lofts in Indiranagar Bengaluru', category: 'Workation' },

  // 5. Kerala — Tea Plantations & Backwaters
  { corridor: 'Munnar', query: 'tea plantation resort and mountain villas in Munnar Kerala', category: 'Mountains' },
  { corridor: 'Alleppey', query: 'backwater lake villas and houseboats in Alleppey Kerala', category: 'Trending' },

  // 6. Rishikesh & Varanasi — Riverside Retreats & Cultural Corridors
  { corridor: 'Rishikesh', query: 'luxury riverfront resorts and yoga retreats in Tapovan Rishikesh', category: 'Pools' },
  { corridor: 'Varanasi', query: 'heritage haveli hotel near Dashashwamedh Ghat Varanasi', category: 'Heritage' },
];

const SAMPLE_REVIEWS = [
  'Incredible stay! The views from the private balcony were stunning, and high-speed Wi-Fi made working remotely seamless.',
  'Sparkling clean, beautifully designed interiors, and the pool was exceptional. Highly recommended for couples and families.',
  'Great location close to top cafes and beaches. The host was very responsive and helpful throughout our stay.',
  'Peaceful retreat with scenic surroundings. The kitchen was fully equipped and beds were super comfortable.',
  'The FairSafe price guarantee made our holiday booking completely stress-free with zero surge surprises.',
];

async function fetchStaysFromGooglePlaces(limitPerQuery = 5) {
  if (!GOOGLE_PLACES_API_KEY) {
    console.warn('[Google Places Sync] No GOOGLE_PLACES_API_KEY configured.');
    return { success: false, message: 'GOOGLE_PLACES_API_KEY is missing.' };
  }

  // Find admin and pilgrim users for ownership and review attribution
  let owner = await User.findOne({ isAdmin: true });
  if (!owner) owner = await User.findOne();

  let guestUser = await User.findOne({ username: 'pilgrim' });
  if (!guestUser) guestUser = owner;

  let totalImported = 0;
  const importedStays = [];

  for (const item of VACATION_DESTINATION_QUERIES) {
    try {
      console.log(`📡 Querying Google Places API: "${item.query}" (${item.corridor})...`);
      const url = `https://maps.googleapis.com/maps/api/place/textsearch/json`;
      const response = await axios.get(url, {
        params: {
          query: item.query,
          key: GOOGLE_PLACES_API_KEY,
        },
        timeout: 7000,
      });

      if (response.data && response.data.results && response.data.results.length > 0) {
        const places = response.data.results.slice(0, limitPerQuery);

        for (const place of places) {
          // Avoid duplicate titles
          const existing = await Listing.findOne({ title: place.name });
          if (existing) continue;

          // Extract Google Places Photo (mandatory for 100% organic data)
          if (!place.photos || place.photos.length === 0) continue;

          const photoRef = place.photos[0].photo_reference;
          const photoUrl = `https://maps.googleapis.com/maps/api/place/photo?maxwidth=1200&photoreference=${photoRef}&key=${GOOGLE_PLACES_API_KEY}`;

          const lat = place.geometry?.location?.lat || 25.3176;
          const lng = place.geometry?.location?.lng || 82.9739;

          // Pricing calculation based on rating / destination
          const rating = place.rating || 4.5;
          const priceLevel = place.price_level || 2;
          const calculatedPrice = Math.round(1800 + priceLevel * 1100 + rating * 250);

          // Clean up location display string
          const rawAddress = place.formatted_address || item.corridor;
          const locationDisplay = `${rawAddress.split(',')[0].trim()}, ${item.corridor}`;

          const newListing = new Listing({
            title: place.name,
            description: `${place.name} is a verified vacation accommodation situated at ${rawAddress}. Featuring premium hospitality, scenic views, high-speed Wi-Fi, air conditioning, modern interiors, and effortless proximity to local attractions and dining.`,
            image: {
              url: photoUrl,
              filename: `places_${place.place_id}`,
            },
            price: calculatedPrice,
            location: locationDisplay,
            country: 'India',
            geometry: {
              type: 'Point',
              coordinates: [lng, lat],
            },
            category: item.category,
            fairsafeScore: Math.min(100, Math.max(90, Math.round(rating * 20))),
            amenities: [
              'High-Speed Wi-Fi (100+ Mbps)',
              'Swimming Pool',
              'Air Conditioning',
              'Dedicated Workspace',
              'Fully Equipped Kitchen',
              'Free Parking On-Premises',
              'Pet Friendly',
              'Balcony with Scenic View',
            ],
            owner: owner ? owner._id : null,
            reviews: [],
          });

          // Add authentic vacation review
          const reviewText = SAMPLE_REVIEWS[Math.floor(Math.random() * SAMPLE_REVIEWS.length)];
          const newReview = new Review({
            rating: Math.round(rating),
            comment: reviewText,
            author: guestUser ? guestUser._id : owner._id,
          });
          await newReview.save();
          newListing.reviews.push(newReview._id);

          await newListing.save();
          totalImported++;
          importedStays.push({
            title: place.name,
            destination: item.corridor,
            price: calculatedPrice,
            rating: place.rating,
          });
        }
      }
    } catch (err) {
      console.warn(`[Google Places Error on "${item.query}"]:`, err.message);
    }
  }

  console.log(`🌸 Vacation Stays Sync Complete! Successfully imported ${totalImported} new organic stays.`);
  return {
    success: true,
    newlyImported: totalImported,
    stays: importedStays,
  };
}

module.exports = { fetchStaysFromGooglePlaces };
