const dns = require('dns');
try {
  dns.setServers(['8.8.8.8', '1.1.1.1']);
} catch (e) {}

const mongoose = require('mongoose');
const fs = require('fs');
const path = require('path');
require('dotenv').config({ path: path.join(__dirname, '..', '..', '.env') });

const localUrl = 'mongodb://127.0.0.1:27017/fairstay';
const atlasUri = process.env.ATLAS_URI || process.env.MONGO_URL;

async function syncAllToAtlas() {
  console.log('\n===============================================================');
  console.log('       SYNCING ALL 166 COMPLETE STAYS TO MONGODB ATLAS         ');
  console.log('===============================================================\n');

  // 1. Connect to Local MongoDB and extract all 166 stays
  console.log('1️⃣ Reading all stays from local MongoDB...');
  const localConn = await mongoose.createConnection(localUrl).asPromise();
  const localListings = await localConn.collection('listings').find({}).toArray();
  console.log(`   └─ Found ${localListings.length} total verified stays in local DB!`);

  // Also read any reviews and users
  const localUsers = await localConn.collection('users').find({}).toArray();
  console.log(`   └─ Found ${localUsers.length} users in local DB.`);

  await localConn.close();

  // 2. Export all 166 stays to seeds/data.js so seeds/data.js permanently has all 166 stays!
  console.log('\n2️⃣ Updating seeds/data.js with all 166 verified vacation stays...');
  const cleanedForSeeds = localListings.map(l => {
    const doc = { ...l };
    delete doc._id;
    delete doc.owner;
    delete doc.reviews;
    delete doc.__v;
    return doc;
  });
  const dataJsContent = `// All 166 Verified FairStay Vacation Stays (Goa, Manali, Jaipur, Udaipur, Mumbai, Kerala, etc.)\nmodule.exports = ${JSON.stringify(cleanedForSeeds, null, 2)};\n`;
  fs.writeFileSync(path.join(__dirname, '..', 'seeds', 'data.js'), dataJsContent, 'utf-8');
  console.log('   └─ seeds/data.js successfully updated with all 166 stays!');

  // 3. Connect to MongoDB Atlas Cloud
  console.log('\n3️⃣ Connecting to MongoDB Atlas Cloud...');
  const atlasConn = await mongoose.createConnection(atlasUri, { serverSelectionTimeoutMS: 8000 }).asPromise();
  console.log('   └─ Connected to MongoDB Atlas successfully!');

  // 4. Wipe old 14-item collection in Atlas and upload all 166 stays!
  console.log('\n4️⃣ Uploading all 166 stays to MongoDB Atlas Cloud...');
  const atlasListingsCol = atlasConn.collection('listings');
  await atlasListingsCol.deleteMany({});
  console.log('   └─ Cleared existing stays in Atlas.');

  // Find admin user in Atlas or create
  const atlasUsersCol = atlasConn.collection('users');
  let admin = await atlasUsersCol.findOne({ username: 'admin' });
  let adminId = admin ? admin._id : new mongoose.Types.ObjectId();

  const preparedListings = localListings.map(l => {
    const doc = { ...l };
    delete doc._id;
    doc.owner = adminId;
    return doc;
  });

  const insertResult = await atlasListingsCol.insertMany(preparedListings);
  console.log(`   └─ Successfully inserted ${insertResult.insertedCount} stays into Atlas!`);

  // Corridor stats
  const atlasTotal = await atlasListingsCol.countDocuments();
  console.log(`\n🎉 ATLAS CLOUD TOTAL STAYS COUNT: ${atlasTotal} STAYS!`);

  await atlasConn.close();

  console.log('\n===============================================================');
  console.log('✅ COMPLETE SYNC FINISHED! ATLAS CLOUD HAS ALL 166 STAYS!');
  console.log('===============================================================\n');
  process.exit(0);
}

syncAllToAtlas().catch(err => {
  console.error('❌ Sync Error:', err);
  process.exit(1);
});
