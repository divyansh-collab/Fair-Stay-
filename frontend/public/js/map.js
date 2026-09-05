/**
 * FairStay — Leaflet Interactive Mapping with CartoDB & OpenStreetMap Tiles
 */

(function () {
  function runMap() {
    let map = null;
    let isMapVisible = false;

    const toggleBtn = document.getElementById('toggleMapBtn');
    const toggleTopBtn = document.getElementById('topMapToggle');
    const toggleText = document.getElementById('toggleMapText');
    const toggleIcon = document.getElementById('toggleMapIcon');
    const gridView = document.getElementById('listingsGridView');
    const mapView = document.getElementById('listingsMapView');

    if (!mapView) return;

    // Check URL param or localStorage for default map view
    const urlParams = new URLSearchParams(window.location.search);
    const preferMap = urlParams.get('view') === 'map';

    function setMapView(showMap) {
      isMapVisible = showMap;

      if (isMapVisible) {
        if (gridView) gridView.classList.add('d-none');
        mapView.classList.remove('d-none');

        if (toggleText) toggleText.textContent = 'Show list';
        if (toggleIcon) toggleIcon.className = 'bi bi-list-ul';
        if (toggleTopBtn) {
          toggleTopBtn.innerHTML = '<i class="bi bi-grid-fill"></i> Grid View';
          toggleTopBtn.classList.add('btn-dark');
          toggleTopBtn.classList.remove('btn-outline-dark');
        }

        if (!map) {
          initIndexMap();
        } else {
          // Invalidate size in multiple frames to ensure seamless tile layout
          map.invalidateSize();
          setTimeout(() => map.invalidateSize(), 150);
          setTimeout(() => map.invalidateSize(), 400);
        }

        // Scroll to top of map smoothly
        mapView.scrollIntoView({ behavior: 'smooth', block: 'start' });
      } else {
        mapView.classList.add('d-none');
        if (gridView) gridView.classList.remove('d-none');

        if (toggleText) toggleText.textContent = 'Show map';
        if (toggleIcon) toggleIcon.className = 'bi bi-map-fill';
        if (toggleTopBtn) {
          toggleTopBtn.innerHTML = '<i class="bi bi-map-fill"></i> Map View';
          toggleTopBtn.classList.remove('btn-dark');
          toggleTopBtn.classList.add('btn-outline-dark');
        }
      }
    }

    if (toggleBtn) {
      toggleBtn.addEventListener('click', () => setMapView(!isMapVisible));
    }
    if (toggleTopBtn) {
      toggleTopBtn.addEventListener('click', () => setMapView(!isMapVisible));
    }

    if (preferMap) {
      setMapView(true);
    }

    function initIndexMap() {
      const mapContainer = document.getElementById('indexMap');
      if (!mapContainer || !window.L) return;

      const listings = window.allListingsData || [];

      // Default center: Varanasi / Prayagraj Corridor
      let center = [25.3176, 82.9739];
      let zoom = 6;

      map = L.map('indexMap', {
        scrollWheelZoom: true,
      }).setView(center, zoom);

      // Primary: OpenStreetMap Tile Layer (ultra reliable)
      L.tileLayer('https://tile.openstreetmap.org/{z}/{x}/{y}.png', {
        maxZoom: 19,
        attribution: '&copy; <a href="https://www.openstreetmap.org/copyright">OpenStreetMap</a> contributors',
      }).addTo(map);

      const markers = [];

      listings.forEach((listing) => {
        if (!listing.geometry || !listing.geometry.coordinates) return;

        let lon = Number(listing.geometry.coordinates[0]);
        let lat = Number(listing.geometry.coordinates[1]);

        // Defensive normalization for Indian coordinates (lat ~15-35, lon ~70-90)
        if (lat > 50 && lon < 50) {
          const temp = lat;
          lat = lon;
          lon = temp;
        }

        if (isNaN(lat) || isNaN(lon)) return;

        // Custom HTML Price Tag Pill Icon
        const priceTagHtml = `<div class="custom-price-marker">₹${Number(listing.price).toLocaleString('en-IN')}</div>`;
        const priceIcon = L.divIcon({
          className: 'custom-leaflet-marker-wrapper',
          html: priceTagHtml,
          iconSize: [64, 28],
          iconAnchor: [32, 14],
        });

        const marker = L.marker([lat, lon], { icon: priceIcon }).addTo(map);

        // Rich Popup Card
        const imageUrl = listing.image && listing.image.url ? listing.image.url : 'https://images.unsplash.com/photo-1590050752117-238cb0fb12b1?auto=format&fit=crop&w=800&q=80';
        const popupContent = `
          <div style="width: 230px; font-family: 'Plus Jakarta Sans', sans-serif;">
            <img src="${imageUrl}" alt="${listing.title}" style="width: 100%; height: 125px; object-fit: cover; border-radius: 8px; margin-bottom: 8px; display: block;" onerror="this.src='https://images.unsplash.com/photo-1590050752117-238cb0fb12b1?auto=format&fit=crop&w=800&q=80'" />
            <div style="font-weight: 700; font-size: 0.88rem; color: #111; margin-bottom: 2px; line-height: 1.3;">${listing.title}</div>
            <div style="font-size: 0.76rem; color: #666; margin-bottom: 6px;"><i class="bi bi-geo-alt-fill" style="color: #ff5a3c;"></i> ${listing.location}</div>
            <div style="display: flex; justify-content: space-between; align-items: center; border-top: 1px solid #eee; padding-top: 6px;">
              <div style="font-weight: 800; font-size: 0.95rem; color: #ff5a3c;">₹${Number(listing.price).toLocaleString('en-IN')}<span style="font-size: 0.72rem; color: #666; font-weight: normal;"> / night</span></div>
              <a href="/listings/${listing._id}" style="background: #222; color: #fff; text-decoration: none; padding: 4px 12px; border-radius: 12px; font-size: 0.75rem; font-weight: 600;">View Stay</a>
            </div>
          </div>
        `;

        marker.bindPopup(popupContent, { maxWidth: 260 });
        markers.push([lat, lon]);
      });

      if (markers.length > 1) {
        map.fitBounds(markers, { padding: [40, 40] });
      }

      // Re-trigger layout adjustments
      setTimeout(() => map.invalidateSize(), 200);
      setTimeout(() => map.invalidateSize(), 500);
    }
  }

  if (document.readyState !== 'loading') {
    runMap();
  } else {
    document.addEventListener('DOMContentLoaded', runMap);
  }
})();
