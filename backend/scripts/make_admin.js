const dns = require('dns');
try { dns.setServers(['8.8.8.8', '1.1.1.1']); } catch(e){}
const mongoose = require('mongoose');
const path = require('path');
require('dotenv').config({ path: path.join(__dirname, '..', '..', '.env') });
const uri = process.env.ATLAS_URI || process.env.MONGO_URL;

async function makeAdmin() {
  console.log('\n===============================================================');
  console.log('              FAIRSTAY ADMIN PRIVILEGE ELEVATION               ');
  console.log('===============================================================\n');

  // 1. Elevate on MongoDB Atlas
  console.log('1️⃣ Elevating admin on MongoDB Atlas Cloud...');
  const atlasConn = await mongoose.createConnection(uri, { serverSelectionTimeoutMS: 8000 }).asPromise();
  const atlasResult = await atlasConn.collection('users').updateMany(
    { $or: [
      { email: /dmishra/i },
      { username: /divyansh/i }
    ]},
    { $set: { isAdmin: true, emailVerified: true } }
  );
  console.log(`   └─ Updated ${atlasResult.modifiedCount} user(s) in MongoDB Atlas to Administrator!`);
  
  const atlasAdmins = await atlasConn.collection('users').find({ isAdmin: true }).toArray();
  console.log('   👑 Active Administrators in Atlas:');
  atlasAdmins.forEach(u => console.log(`      • ${u.username} (${u.email}) [isAdmin: true]`));
  await atlasConn.close();

  // 2. Elevate on Local MongoDB
  console.log('\n2️⃣ Elevating admin on Local MongoDB...');
  const localConn = await mongoose.createConnection('mongodb://127.0.0.1:27017/fairstay').asPromise();
  const localResult = await localConn.collection('users').updateMany(
    { $or: [
      { email: /dmishra/i },
      { username: /divyansh/i }
    ]},
    { $set: { isAdmin: true, emailVerified: true } }
  );
  console.log(`   └─ Updated ${localResult.modifiedCount} user(s) in Local MongoDB to Administrator!`);

  const localAdmins = await localConn.collection('users').find({ isAdmin: true }).toArray();
  console.log('   👑 Active Administrators in Local DB:');
  localAdmins.forEach(u => console.log(`      • ${u.username} (${u.email}) [isAdmin: true]`));
  await localConn.close();

  console.log('\n===============================================================');
  console.log('🎉 YOU ARE OFFICIALLY CONFIGURED AS ADMINISTRATOR!');
  console.log('===============================================================\n');
  process.exit(0);
}

makeAdmin().catch(err => {
  console.error('❌ Error promoting to admin:', err);
  process.exit(1);
});
