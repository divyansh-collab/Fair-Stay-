const axios = require('axios');

// Predefined landmark coordinates for Indian sacred corridors as dependable fallbacks
const CORRIDOR_COORDINATES = {
  varanasi: [83.0064, 25.3109], // Dashashwamedh Ghat [lon, lat]
  kashi: [83.0107, 25.3109],
  prayagraj: [81.8845, 25.4358], // Triveni Sangam [lon, lat]
  allahabad: [81.8845, 25.4358],
  sangam: [81.8845, 25.4358],
  haridwar: [78.1642, 29.9565], // Har Ki Pauri [lon, lat]
  rishikesh: [78.3149, 30.1265], // Laxman Jhula / Tapovan [lon, lat]
  nashik: [73.7915, 19.9975], // Ramkund / Panchavati [lon, lat]
  trimbakeshwar: [73.5309, 19.9324],
  ayodhya: [82.1998, 26.7922],
  mathura: [77.6737, 27.4924],
  vrindavan: [77.7006, 27.5806],
};

async function geocodeLocation(location, country = 'India') {
  const query = `${location}, ${country}`;
  try {
    const response = await axios.get('https://nominatim.openstreetmap.org/search', {
      params: {
        q: query,
        format: 'json',
        limit: 1,
      },
      headers: {
        'User-Agent': 'FairStay-Pilgrimage-Platform/1.0 (contact@fairstay.org)',
      },
      timeout: 3500,
    });

    if (response.data && response.data.length > 0) {
      const lon = parseFloat(response.data[0].lon);
      const lat = parseFloat(response.data[0].lat);
      if (!isNaN(lon) && !isNaN(lat)) {
        return {
          type: 'Point',
          coordinates: [lon, lat],
        };
      }
    }
  } catch (err) {
    console.warn(`[Geocoder] Nominatim lookup failed or timed out for "${query}". Using corridor fallback.`);
  }

  // Corridor fallback resolution
  const lowerLoc = (location || '').toLowerCase();
  for (const [key, coords] of Object.entries(CORRIDOR_COORDINATES)) {
    if (lowerLoc.includes(key)) {
      return {
        type: 'Point',
        coordinates: coords,
      };
    }
  }

  // Default to Varanasi Ghats [lon, lat]
  return {
    type: 'Point',
    coordinates: [83.0064, 25.3109],
  };
}

module.exports = { geocodeLocation };
