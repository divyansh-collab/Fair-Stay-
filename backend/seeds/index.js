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

  const sampleReviews = [
    {
      rating: 5,
      comment: 'Truly blessed experience! The sunrise Aarti from the terrace was heavenly. Hot water was available at 4:30 AM before our holy snan.',
    },
    {
      rating: 5,
      comment: 'Pure sattvic food, zero garlic/onion and absolutely delicious. Hosts arranged an authorized wooden boat without any surge pricing.',
    },
    {
      rating: 4,
      comment: 'Very peaceful stay away from city noise. Courteous staff who guided us through the Kashi Vishwanath Sugam Darshan process.',
    },
    {
      rating: 5,
      comment: 'The FairSafe score of 98 was completely accurate. Clean bedding, pure water, and peaceful spiritual environment.',
    },
  ];

  for (let i = 0; i < sampleListings.length; i++) {
    const item = sampleListings[i];
    const listing = new Listing({
      ...item,
      owner: adminUser._id,
      reviews: [],
    });

    const rev1 = new Review({
      rating: 5,
      comment: sampleReviews[i % sampleReviews.length].comment,
      author: pilgrimUser._id,
    });
    await rev1.save();
    listing.reviews.push(rev1._id);

    const rev2 = new Review({
      rating: (i % 2 === 0) ? 5 : 4,
      comment: sampleReviews[(i + 1) % sampleReviews.length].comment,
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
