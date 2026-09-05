const dns = require('dns');
try { dns.setServers(['8.8.8.8', '1.1.1.1']); } catch(e){}
const mongoose = require('mongoose');
const path = require('path');
require('dotenv').config({ path: path.join(__dirname, '..', '..', '.env') });
const uri = process.env.ATLAS_URI || process.env.MONGO_URL;

async function checkUsers() {
  console.log('Connecting to MongoDB Atlas...');
  const atlasConn = await mongoose.createConnection(uri).asPromise();
  const atlasUsers = await atlasConn.collection('users').find({}).toArray();
  console.log('\n--- ATLAS USERS ---');
  atlasUsers.forEach(u => console.log(`User: ${u.username} | Email: ${u.email} | isAdmin: ${u.isAdmin} | verified: ${u.emailVerified}`));
  await atlasConn.close();

  console.log('\nConnecting to Local MongoDB...');
  const localConn = await mongoose.createConnection('mongodb://127.0.0.1:27017/fairstay').asPromise();
  const localUsers = await localConn.collection('users').find({}).toArray();
  console.log('\n--- LOCAL USERS ---');
  localUsers.forEach(u => console.log(`User: ${u.username} | Email: ${u.email} | isAdmin: ${u.isAdmin} | verified: ${u.emailVerified}`));
  await localConn.close();

  process.exit(0);
}
checkUsers().catch(err => { console.error(err); process.exit(1); });
