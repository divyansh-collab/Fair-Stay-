if (process.env.NODE_ENV !== 'production') {
  require('dotenv').config({ path: require('path').join(__dirname, '..', '..', '.env') });
}

const dns = require('dns');
try {
  dns.setServers(['8.8.8.8', '1.1.1.1']);
} catch (e) {}

const mongoose = require('mongoose');
const Listing = require('../models/listing');
const Review = require('../models/review');
const User = require('../models/user');
const sampleListings = require('./data');

const dbUrl = process.env.ATLAS_URI || process.env.MONGO_URL || 'mongodb://127.0.0.1:27017/fairstay';

async function seedDB() {
  await mongoose.connect(dbUrl);
  console.log('✅ Connected to MongoDB for seeding FairStay database.');

  // Drop existing database to wipe any legacy indexes
  await mongoose.connection.db.dropDatabase();
  console.log('🧹 Cleaned existing fairstay database and legacy indexes.');

  // Ensure Admin Superhost user exists
  let adminUser = await User.findOne({ username: 'admin' });
  if (!adminUser) {
    const admin = new User({
      username: 'admin',
      email: 'admin@fairstay.com',
      phone: '+91 98765 43210',
      emailVerified: true,
      isAdmin: true,
      profilePhoto: {
        url: 'https://images.unsplash.com/photo-1472099645785-5658abf4ff4e?auto=format&fit=crop&w=400&q=80',
        filename: 'admin_avatar',
      },
    });
    adminUser = await User.register(admin, 'admin123');
    console.log('👤 Created Superhost Admin User: admin / admin123');
  }

  // Ensure Demo Pilgrim user exists
  let pilgrimUser = await User.findOne({ username: 'pilgrim' });
  if (!pilgrimUser) {
    const pilgrim = new User({
      username: 'pilgrim',
      email: 'pilgrim@fairstay.com',
      phone: '+91 91234 56789',
      emailVerified: true,
      isAdmin: false,
      profilePhoto: {
        url: 'https://images.unsplash.com/photo-1534528741775-53994a69daeb?auto=format&fit=crop&w=400&q=80',
        filename: 'pilgrim_avatar',
      },
    });
    pilgrimUser = await User.register(pilgrim, 'pilgrim123');
    console.log('👤 Created Demo Pilgrim User: pilgrim / pilgrim123');
  }

  for (let i = 0; i < sampleListings.length; i++) {
    const item = sampleListings[i];
    const listing = new Listing({
      ...item,
      owner: adminUser._id,
      reviews: [],
    });

    const lowerTitle = (item.title || '').toLowerCase();
    const lowerLoc = (item.location || '').toLowerCase();

    let comment1, comment2;
    if (lowerLoc.includes('goa') || lowerTitle.includes('utopia') || lowerTitle.includes('palolem') || lowerTitle.includes('baga')) {
      comment1 = 'Unbeatable location! Just a short barefoot walk to the calm waves of Palolem Beach. Sitting on the wooden veranda listening to the sea breeze at sunset was pure paradise. Transparent pricing with zero hidden charges.';
      comment2 = 'Cozy, clean beach cottage surrounded by lush green palms. Ice-cold AC, reliable Wi-Fi, and very hospitable hosts. Loved that FairStay had the exact authentic price without the typical booking markups.';
    } else if (/haridwar|varanasi|kashi|rishikesh|ayodhya|mathura|prayagraj|nashik/i.test(lowerLoc) || /ashram|yatri/i.test(lowerTitle)) {
      comment1 = 'Truly serene and spiritually fulfilling stay. Pure sattvic meals, immaculate rooms, and 24/7 hot water for holy snan before temple darshan.';
      comment2 = 'The proximity to the sacred ghats made attending morning and evening aarti effortless. Peaceful environment, honest pricing, and courteous staff.';
    } else if (/manali|himachal|munnar/i.test(lowerLoc)) {
      comment1 = 'Waking up to the fresh cedar scent and snow-capped Himalayan peaks was breathtaking. Warm blankets, efficient heating, and hot ginger tea on the private balcony.';
      comment2 = 'Peaceful mountain retreat away from noisy tourist centers. Authentic pine wood interior and very helpful hosts.';
    } else if (/jaipur|udaipur|rajasthan/i.test(lowerLoc)) {
      comment1 = 'Authentic royal heritage charm! The historic stone jharokhas, courtyards, and warm Rajasthani hospitality made our holiday memorable.';
      comment2 = 'Stunning architecture, quiet inner courtyards, and delicious traditional food. FairStay pricing was far more transparent than other apps.';
    } else {
      comment1 = 'Super clean, high-speed Wi-Fi, comfortable beds, and smooth check-in. Excellent value and prime location.';
      comment2 = 'Great amenities, responsive host, and transparent pricing without surprise surcharges.';
    }

    const rev1 = new Review({
      rating: 5,
      comment: comment1,
      author: pilgrimUser._id,
    });
    await rev1.save();
    listing.reviews.push(rev1._id);

    const rev2 = new Review({
      rating: (i % 3 === 0) ? 4 : 5,
      comment: comment2,
      author: adminUser._id,
    });
    await rev2.save();
    listing.reviews.push(rev2._id);

    await listing.save();
  }

  console.log(`🎉 Successfully seeded ${sampleListings.length} verified stays across Goa, Manali, Jaipur, Udaipur, Mumbai, Kerala, and all top corridors!`);
  await mongoose.connection.close();
}

seedDB().catch((err) => {
  console.error('❌ Seeding Error:', err);
  process.exit(1);
});
