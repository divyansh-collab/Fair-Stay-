const axios = require('axios');

async function testTiles() {
  const cartoUrl = 'https://a.basemaps.cartocdn.com/rastertiles/voyager/7/93/53.png';
  const osmUrl = 'https://tile.openstreetmap.org/7/93/53.png';

  try {
    const resCarto = await axios.get(cartoUrl, { headers: { 'User-Agent': 'Mozilla/5.0' }, timeout: 4000 });
    console.log(`CartoDB: HTTP ${resCarto.status}`);
  } catch (e) {
    console.log(`CartoDB failed: ${e.message}`);
  }

  try {
    const resOsm = await axios.get(osmUrl, { headers: { 'User-Agent': 'FairStay-App' }, timeout: 4000 });
    console.log(`OpenStreetMap: HTTP ${resOsm.status}`);
  } catch (e) {
    console.log(`OpenStreetMap failed: ${e.message}`);
  }
}

testTiles();
