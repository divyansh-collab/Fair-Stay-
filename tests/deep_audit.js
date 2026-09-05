const http = require('http');

const routes = [
  { path: '/listings', name: 'Universal Stays Feed' },
  { path: '/login', name: 'Authentication Login' },
  { path: '/signup', name: 'Authentication Signup' },
  { path: '/listings/new', name: 'Host Listing Creation Form' },
  { path: '/api/destinations', name: 'REST Top Destinations' },
  { path: '/api/listings', name: 'REST All Listings' },
  { path: '/api/search?q=villa', name: 'REST Instant Search (villa)' },
  { path: '/api/search?q=goa+pool', name: 'REST Multi-Word Search (goa pool)' },
  { path: '/css/style.css', name: 'Primary Stylesheet' },
  { path: '/css/motion-3d.css', name: '3D Spatial Motion Engine CSS' },
  { path: '/js/script.js', name: 'Core Interaction Engine JS' },
  { path: '/js/motion-3d.js', name: '3D Motion & Parallax JS' },
];

console.log('===============================================================');
console.log('         FAIRSTAY FULL SYSTEM & ROUTE AUDIT (100%)             ');
console.log('===============================================================');

let completed = 0;
let failed = 0;

routes.forEach((route) => {
  http.get(`http://127.0.0.1:8080${route.path}`, (res) => {
    if (res.statusCode >= 200 && res.statusCode < 400) {
      console.log(`✅ [${res.statusCode}] ${route.name.padEnd(38)} -> ${route.path}`);
    } else {
      console.error(`❌ [${res.statusCode}] ${route.name.padEnd(38)} -> ${route.path}`);
      failed++;
    }
    completed++;
    if (completed === routes.length) {
      console.log('===============================================================');
      if (failed === 0) {
        console.log(`🎉 ALL ${routes.length} ROUTES AND SUBSYSTEMS ARE 100% OPERATIONAL!`);
      } else {
        console.log(`⚠️ ${failed} route(s) failed.`);
      }
      console.log('===============================================================');
      process.exit(failed === 0 ? 0 : 1);
    }
  }).on('error', (err) => {
    console.error(`❌ [ERROR] ${route.name.padEnd(38)} -> ${err.message}`);
    failed++;
    completed++;
    if (completed === routes.length) process.exit(1);
  });
});
