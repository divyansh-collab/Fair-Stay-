const dns = require('dns');
try {
  dns.setServers(['8.8.8.8', '1.1.1.1']);
} catch (e) {}

const mongoose = require('mongoose');
const path = require('path');
require('dotenv').config({ path: path.join(__dirname, '..', '..', '.env') });

const atlasUri = process.env.ATLAS_URI || process.env.MONGO_URL;

console.log('\n===============================================================');
console.log('         FAIRSTAY MONGODB ATLAS CONNECTION VERIFIER             ');
console.log('===============================================================\n');

if (!atlasUri) {
  console.error('❌ Error: No ATLAS_URI or MONGO_URL found in your .env file!');
  process.exit(1);
}

const maskedUri = atlasUri.replace(/:([^@]+)@/, ':****@');
console.log('📡 Target Atlas URI:', maskedUri);
console.log('⏳ Connecting to MongoDB Atlas Cloud...');

mongoose.connect(atlasUri, { serverSelectionTimeoutMS: 6000 })
  .then(async () => {
    console.log('\n🎉 STATUS: 100% CONNECTED TO MONGODB ATLAS CLOUD!\n');
    console.log('📊 Cloud Database Name :', mongoose.connection.name);
    console.log('🌐 Connected Host       :', mongoose.connection.host);
    console.log('🔒 Ready State          : Active & Ready (State 1)');

    // Inspect Collections
    const collections = await mongoose.connection.db.listCollections().toArray();
    console.log('\n📂 Cloud Collections Found in Atlas:');
    if (collections.length === 0) {
      console.log('   (No collections yet - run "npm run seed" to seed stays)');
    } else {
      for (const col of collections) {
        const count = await mongoose.connection.db.collection(col.name).countDocuments();
        console.log(`   └─ ${col.name.padEnd(16)}: ${count} documents`);
      }
    }

    console.log('\n===============================================================');
    console.log('✅ YOUR ATLAS CLUSTER IS FULLY OPERATIONAL AND VERIFIED!');
    console.log('===============================================================\n');
    await mongoose.disconnect();
    process.exit(0);
  })
  .catch((err) => {
    console.error('\n❌ FAILED TO CONNECT TO MONGODB ATLAS:');
    console.error('Error Code   :', err.code || 'UNKNOWN');
    console.error('Error Message:', err.message);
    console.log('\n👉 Troubleshooting Tips:');
    console.log('1. Go to cloud.mongodb.com -> Network Access -> Add IP Address -> 0.0.0.0/0');
    console.log('2. Check your Atlas username and password in .env');
    console.log('===============================================================\n');
    process.exit(1);
  });
