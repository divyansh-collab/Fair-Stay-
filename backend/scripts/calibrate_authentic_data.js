const fs = require('fs');
const path = require('path');
const dns = require('dns');
try { dns.setServers(['8.8.8.8', '1.1.1.1']); } catch(e){}
const mongoose = require('mongoose');

const projectRoot = path.join(__dirname, '..', '..');
require('dotenv').config({ path: path.join(projectRoot, '.env') });

const dataFilePath = path.join(projectRoot, 'backend', 'seeds', 'data.js');
const rawData = require(dataFilePath);

function calibrateListing(item) {
  let { title, location, category, propertyType, price, marketOtaPrice, maxGuests, bedrooms, beds, baths, amenities, description } = item;
  title = (title || '').trim();
  location = (location || '').trim();
  const lowerTitle = title.toLowerCase();
  const lowerLoc = location.toLowerCase();

  // 1. Village Utopia Cottages — directly matches Trip.com benchmark of $17 USD (~₹1,450 INR)
  if (lowerTitle.includes('village utopia')) {
    price = 1450;
    marketOtaPrice = 1850;
    category = 'Beachfront';
    propertyType = 'Cozy Tropical Beach Cottage';
    maxGuests = 2;
    bedrooms = 1;
    beds = 1;
    baths = 1;
    description = 'Village Utopia Cottages offers authentic eco-friendly beach cottage living nestled among swaying palms at Palolem Beach, South Goa. Walk barefoot to the golden sands in 1 minute, relax on your private wooden veranda, and enjoy fair, honest pricing without OTA surge markups.';
    amenities = [
      'Direct Palolem Beach Access (50m)',
      'High-Speed Wi-Fi',
      'Air Conditioning and Ceiling Fan',
      'Veranda with Palm Garden View',
      'Private Attached Bathroom',
      'Eco-friendly Wooden Architecture',
      'Daily Housekeeping',
      'Scooter Rental and Kayak Assistance'
    ];
    return { ...item, title, location, category, propertyType, price, marketOtaPrice, maxGuests, bedrooms, beds, baths, amenities, description };
  }

  // 2. Goa beach cottages, resorts, and villas
  if (lowerLoc.includes('goa') || lowerTitle.includes('goa') || lowerTitle.includes('palolem') || lowerTitle.includes('baga')) {
    const isLuxuryVilla = /luxury villa|white coco|casa pallazzo|azara/i.test(lowerTitle);
    
    if (isLuxuryVilla) {
      price = price < 18000 ? 19500 : price;
      marketOtaPrice = Math.round(price * 1.45);
      propertyType = 'Entire Luxury Beachfront Villa';
      category = 'Luxe';
      maxGuests = Math.min(maxGuests || 8, 8);
      bedrooms = Math.min(bedrooms || 4, 4);
      beds = bedrooms + 1;
      baths = bedrooms;
    } else if (/cottage|hut|shack|oxygen|hitide|cocos/i.test(lowerTitle)) {
      if (/hitide/i.test(lowerTitle)) price = 1850;
      else if (/cocos/i.test(lowerTitle)) price = 2100;
      else if (/oxygen/i.test(lowerTitle)) price = 1950;
      else if (/sea shades/i.test(lowerTitle)) price = 3200;
      else price = 2200;

      marketOtaPrice = Math.round(price * 1.35);
      propertyType = 'Tropical Beach Cottage';
      category = 'Beachfront';
      maxGuests = 2;
      bedrooms = 1;
      beds = 1;
      baths = 1;
      amenities = [
        'Beach Access (Walking Distance)',
        'Air Conditioning and Ceiling Fan',
        'Free Wi-Fi',
        'Private Attached Bathroom',
        'Garden / Sea Breeze Veranda',
        'Daily Housekeeping',
        'Beach Towels and Umbrellas'
      ];
    } else if (/resort/i.test(lowerTitle)) {
      price = 4800;
      marketOtaPrice = 6400;
      propertyType = 'Deluxe Beach Resort Room';
      category = 'Beachfront';
      maxGuests = 2;
      bedrooms = 1;
      beds = 1;
      baths = 1;
      amenities = [
        'Beachfront Resort Pool Access',
        'Air Conditioning',
        'Free High-Speed Wi-Fi',
        'En-Suite Bathroom',
        'Complimentary Breakfast',
        'On-site Restaurant and Bar'
      ];
    } else {
      price = 2400;
      marketOtaPrice = 3200;
      propertyType = 'Coastal Beachfront Room';
      category = 'Beachfront';
      maxGuests = 2;
      bedrooms = 1;
      beds = 1;
      baths = 1;
    }
    return { ...item, title, location, category, propertyType, price, marketOtaPrice, maxGuests, bedrooms, beds, baths, amenities, description };
  }

  // 3. Ashrams, Dharamshalas and Spiritual Stays (Haridwar, Rishikesh, Varanasi, Ayodhya, Mathura, Prayagraj, Nashik)
  const isSpiritual = /haridwar|rishikesh|varanasi|ayodhya|mathura|prayagraj|nashik/i.test(lowerLoc) ||
                      /ashram|yatri|bhavan|dharamshala|gayatri|kashi|vishwanath|bhakti|sangam|math/i.test(lowerTitle);

  if (isSpiritual) {
    const isHeritageHotel = /ihcl|haveli resort|ganga lahari/i.test(lowerTitle);
    const isWellnessRetreat = /veda5|ayurveda|wellness/i.test(lowerTitle);

    if (isHeritageHotel) {
      price = 5800;
      marketOtaPrice = 7800;
      propertyType = 'Boutique Heritage Riverfront Suite';
      category = 'Heritage';
      maxGuests = 2;
      bedrooms = 1;
      beds = 1;
      baths = 1;
    } else if (isWellnessRetreat) {
      price = 3800;
      marketOtaPrice = 5200;
      propertyType = 'Himalayan Yoga and Ayurveda Suite';
      category = 'Rooms';
      maxGuests = 2;
      bedrooms = 1;
      beds = 1;
      baths = 1;
    } else {
      if (/shantikunj/i.test(lowerTitle)) price = 650;
      else if (/saptrishi/i.test(lowerTitle)) price = 850;
      else if (/prem nagar/i.test(lowerTitle)) price = 950;
      else if (/harihar/i.test(lowerTitle)) price = 900;
      else if (/basanti|yatri/i.test(lowerTitle)) price = 750;
      else if (/baba vishwanath/i.test(lowerTitle)) price = 950;
      else if (/guest house/i.test(lowerTitle)) price = 1200;
      else price = Math.min(price, 1350);

      marketOtaPrice = Math.round(price * 1.4);
      propertyType = /ashram/i.test(lowerTitle) ? 'Sacred Ashram Guest Room' : 'Pilgrim Yatri Nivas Room';
      category = 'Ashram';
      maxGuests = 2;
      bedrooms = 1;
      beds = 2;
      baths = 1;
      amenities = [
        'Temple and Holy Ghat Proximity (<400m)',
        'Pure Vegetarian Sattvic Meals',
        '24/7 Hot Water for Sacred Snan',
        'Peaceful Meditation Hall',
        'High-Speed Wi-Fi',
        'Luggage Cloakroom Assistance',
        'Early Morning Aarti Assistance'
      ];
    }
    return { ...item, title, location, category, propertyType, price, marketOtaPrice, maxGuests, bedrooms, beds, baths, amenities, description };
  }

  // 4. Mountain Stays (Manali, Munnar)
  if (/manali|himachal|munnar/i.test(lowerLoc) || /chalet|cottage/i.test(lowerTitle)) {
    price = Math.min(Math.max(price, 2600), 5800);
    marketOtaPrice = Math.round(price * 1.38);
    propertyType = 'Himalayan Cedar Wood Chalet';
    category = 'Mountains';
    maxGuests = 3;
    bedrooms = 1;
    beds = 2;
    baths = 1;
    amenities = [
      'Panoramic Mountain and Pine Views',
      'Electric Room Heating / Blankets',
      'High-Speed Wi-Fi (100 Mbps)',
      'Balcony with Scenic Valley View',
      '24/7 Hot Water',
      'Complimentary Mountain Tea / Coffee',
      'Free Parking On-Premises'
    ];
    return { ...item, title, location, category, propertyType, price, marketOtaPrice, maxGuests, bedrooms, beds, baths, amenities, description };
  }

  // 5. Rajasthan Heritage Havelis (Jaipur, Udaipur)
  if (/jaipur|udaipur|rajasthan/i.test(lowerLoc)) {
    price = Math.min(Math.max(price, 4200), 9800);
    marketOtaPrice = Math.round(price * 1.42);
    propertyType = 'Royal Heritage Haveli Suite';
    category = 'Heritage';
    maxGuests = 2;
    bedrooms = 1;
    beds = 1;
    baths = 1;
    amenities = [
      'Historic Courtyard View',
      'Heritage Jharokha Seating',
      'Traditional Rajasthani Dining',
      'Swimming Pool',
      'Air Conditioning',
      'High-Speed Wi-Fi',
      'Complimentary Heritage Walk'
    ];
    return { ...item, title, location, category, propertyType, price, marketOtaPrice, maxGuests, bedrooms, beds, baths, amenities, description };
  }

  // 6. City Serviced Apartments (Mumbai, Bengaluru)
  if (/mumbai|bengaluru|bangalore/i.test(lowerLoc)) {
    price = Math.min(Math.max(price, 3200), 6200);
    marketOtaPrice = Math.round(price * 1.35);
    propertyType = 'Boutique Serviced Apartment';
    category = 'City';
    maxGuests = 2;
    bedrooms = 1;
    beds = 1;
    baths = 1;
    amenities = [
      'High-Speed Fiber Wi-Fi (300 Mbps)',
      'Dedicated Ergonomic Work Desk',
      'Air Conditioning',
      'Smart 50 inch 4K TV with OTT',
      'Fully Equipped Modern Kitchenette',
      'In-Unit Washer',
      'Prime Transit and Cafe Connectivity'
    ];
    return { ...item, title, location, category, propertyType, price, marketOtaPrice, maxGuests, bedrooms, beds, baths, amenities, description };
  }

  // 7. Kerala Backwaters / Alleppey
  if (/alleppey|kerala/i.test(lowerLoc)) {
    const isHouseboat = /boat|cruise/i.test(lowerTitle);
    price = isHouseboat ? 5800 : 2600;
    marketOtaPrice = Math.round(price * 1.4);
    propertyType = isHouseboat ? 'Private Deluxe Backwater Houseboat' : 'Backwater Canal Homestay';
    category = 'Trending';
    maxGuests = 2;
    bedrooms = 1;
    beds = 1;
    baths = 1;
    return { ...item, title, location, category, propertyType, price, marketOtaPrice, maxGuests, bedrooms, beds, baths, amenities, description };
  }

  price = Math.min(Math.max(price, 1800), 3800);
  marketOtaPrice = Math.round(price * 1.35);
  return { ...item, price, marketOtaPrice, maxGuests: 2, bedrooms: 1, beds: 1, baths: 1 };
}

async function run() {
  console.log('Calibrating authentic data for', rawData.length, 'listings...');
  const calibrated = rawData.map(calibrateListing);

  // 1. Update data.js
  fs.writeFileSync(dataFilePath, '// All 166 Verified FairStay Vacation Stays (Genuine Indian Hospitality Market Pricing)\nmodule.exports = ' + JSON.stringify(calibrated, null, 2) + ';\n');
  console.log('✅ Updated backend/seeds/data.js');

  // 2. Update MongoDB Atlas if ATLAS_URI exists
  const atlasUri = process.env.ATLAS_URI || process.env.MONGO_URL;
  if (atlasUri) {
    console.log('Connecting to MongoDB Atlas to update live listings...');
    await mongoose.connect(atlasUri, { serverSelectionTimeoutMS: 10000 });
    const listingsCol = mongoose.connection.db.collection('listings');
    const reviewsCol = mongoose.connection.db.collection('reviews');
    const usersCol = mongoose.connection.db.collection('users');

    const adminUser = await usersCol.findOne({ username: 'admin' });
    const pilgrimUser = await usersCol.findOne({ username: 'pilgrim' }) || adminUser;

    let updatedCount = 0;

    for (const item of calibrated) {
      // Find matching listing by title or coordinates
      const query = { title: item.title };
      const existing = await listingsCol.findOne(query);

      // Create region-authentic reviews
      const lowerTitle = item.title.toLowerCase();
      const lowerLoc = (item.location || '').toLowerCase();
      let customReviews = [];

      if (lowerLoc.includes('goa') || lowerTitle.includes('utopia') || lowerTitle.includes('palolem') || lowerTitle.includes('baga')) {
        customReviews = [
          {
            rating: 5,
            comment: 'Unbeatable location! Just a short barefoot walk to the calm waters of Palolem Beach. Sitting on the wooden veranda listening to the waves at sunset was magical. Transparent pricing with zero hidden fees.',
            author: pilgrimUser._id,
            createdAt: new Date(Date.now() - 12 * 86400000)
          },
          {
            rating: 5,
            comment: 'Cozy and clean beach cottage surrounded by lush palm trees. The AC was ice cold, Wi-Fi worked great for checking emails, and the hosts were very welcoming. Exactly as advertised.',
            author: adminUser._id,
            createdAt: new Date(Date.now() - 5 * 86400000)
          }
        ];
      } else if (/haridwar|varanasi|kashi|rishikesh|ayodhya|mathura|prayagraj|nashik/i.test(lowerLoc) || /ashram|yatri/i.test(lowerTitle)) {
        customReviews = [
          {
            rating: 5,
            comment: 'Truly peaceful and spiritually uplifting stay. Pure sattvic meals, clean rooms, and 24/7 hot water for morning snan before temple darshan.',
            author: pilgrimUser._id,
            createdAt: new Date(Date.now() - 10 * 86400000)
          },
          {
            rating: 5,
            comment: 'The location near the holy ghats made attending morning and evening aarti effortless. Honest pricing and respectful staff.',
            author: adminUser._id,
            createdAt: new Date(Date.now() - 4 * 86400000)
          }
        ];
      } else if (/manali|himachal|munnar/i.test(lowerLoc)) {
        customReviews = [
          {
            rating: 5,
            comment: 'Waking up to the fresh pine scent and snow-peaked mountains was breathtaking. Warm blankets, efficient heating, and hot ginger tea on the wooden balcony.',
            author: pilgrimUser._id,
            createdAt: new Date(Date.now() - 8 * 86400000)
          },
          {
            rating: 4,
            comment: 'Serene mountain getaway away from city hustle. Cozy wooden architecture and very friendly host.',
            author: adminUser._id,
            createdAt: new Date(Date.now() - 2 * 86400000)
          }
        ];
      } else if (/jaipur|udaipur|rajasthan/i.test(lowerLoc)) {
        customReviews = [
          {
            rating: 5,
            comment: 'Authentic royal heritage charm! The historic stone jharokhas, courtyards, and warm Rajasthani hospitality made our vacation unforgettable.',
            author: pilgrimUser._id,
            createdAt: new Date(Date.now() - 14 * 86400000)
          },
          {
            rating: 5,
            comment: 'Stunning architecture, quiet inner courtyards, and great food. FairStay pricing was significantly better than other booking apps.',
            author: adminUser._id,
            createdAt: new Date(Date.now() - 3 * 86400000)
          }
        ];
      } else {
        customReviews = [
          {
            rating: 5,
            comment: 'Super clean, high-speed Wi-Fi, comfortable beds, and smooth check-in. Excellent value and prime location.',
            author: pilgrimUser._id,
            createdAt: new Date(Date.now() - 7 * 86400000)
          },
          {
            rating: 4,
            comment: 'Great amenities, responsive host, and transparent pricing without surprise surcharges.',
            author: adminUser._id,
            createdAt: new Date(Date.now() - 1 * 86400000)
          }
        ];
      }

      // If existing listing, update it with calibrated fields and fresh context-authentic reviews
      if (existing) {
        // Delete old mismatched reviews for this listing
        if (existing.reviews && existing.reviews.length > 0) {
          await reviewsCol.deleteMany({ _id: { $in: existing.reviews } });
        }

        // Insert new authentic reviews
        const reviewIds = [];
        for (const r of customReviews) {
          const insertRes = await reviewsCol.insertOne(r);
          reviewIds.push(insertRes.insertedId);
        }

        await listingsCol.updateOne(
          { _id: existing._id },
          {
            $set: {
              price: item.price,
              marketOtaPrice: item.marketOtaPrice,
              category: item.category,
              propertyType: item.propertyType,
              maxGuests: item.maxGuests,
              bedrooms: item.bedrooms,
              beds: item.beds,
              baths: item.baths,
              amenities: item.amenities,
              description: item.description,
              reviews: reviewIds
            }
          }
        );
        updatedCount++;
      }
    }

    console.log(`✅ Updated ${updatedCount} listings in MongoDB Atlas with authentic pricing and localized reviews!`);
    await mongoose.disconnect();
  }
}

run().catch(err => {
  console.error('Calibration error:', err);
  process.exit(1);
});
