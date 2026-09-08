/**
 * FairStay — Leaflet Interactive Split-Screen Mapping & Bi-Directional Sync
 */

(function () {
  const markerMap = new Map();
  let map = null;
  let isMapVisible = false;

  function runMap() {
    const toggleBtn = document.getElementById('toggleMapBtn');
    const toggleTopBtn = document.getElementById('topMapToggle');
    const gridViewBtn = document.getElementById('btnGridViewToggle');
    const toggleText = document.getElementById('toggleMapText');
    const toggleIcon = document.getElementById('toggleMapIcon');
    const staysCol = document.getElementById('staysCol');
    const splitMapCol = document.getElementById('splitMapCol');
    const gridView = document.getElementById('listingsGridView');
    const mapView = document.getElementById('listingsMapView');

    if (!mapView || !splitMapCol) return;

    // Check URL param for default map view (?view=map or ?view=split)
    const urlParams = new URLSearchParams(window.location.search);
    const preferMap = urlParams.get('view') === 'map' || urlParams.get('view') === 'split';

    function setMapView(showMap) {
      isMapVisible = showMap;

      if (isMapVisible) {
        // Split Map Mode
        if (window.innerWidth >= 992) {
          if (staysCol) {
            staysCol.className = 'col-lg-7 col-xl-7 transition-all';
            staysCol.classList.remove('d-none');
          }
          if (gridView) {
            gridView.classList.remove('d-none', 'row-cols-lg-3', 'row-cols-xl-4');
            gridView.classList.add('row-cols-lg-2', 'row-cols-xl-2');
          }
          splitMapCol.className = 'col-lg-5 col-xl-5 transition-all';
          splitMapCol.classList.remove('d-none');
        } else {
          // Mobile / Tablet full map view
          if (staysCol) staysCol.classList.add('d-none');
          splitMapCol.className = 'col-12 transition-all';
          splitMapCol.classList.remove('d-none');
        }

        mapView.classList.remove('d-none');

        // Button states
        if (toggleText) toggleText.textContent = 'Show List';
        if (toggleIcon) toggleIcon.className = 'bi bi-grid-3x3-gap-fill';

        if (toggleTopBtn) {
          toggleTopBtn.classList.add('btn-dark');
          toggleTopBtn.classList.remove('btn-outline-secondary', 'text-body');
          toggleTopBtn.classList.add('text-white');
        }
        if (gridViewBtn) {
          gridViewBtn.classList.remove('btn-dark');
          gridViewBtn.classList.add('btn-outline-secondary', 'text-body');
        }

        if (!map) {
          initIndexMap();
        } else {
          map.invalidateSize();
          setTimeout(() => map.invalidateSize(), 150);
          setTimeout(() => map.invalidateSize(), 400);
        }

        // Smooth scroll to view if on mobile
        if (window.innerWidth < 992) {
          splitMapCol.scrollIntoView({ behavior: 'smooth', block: 'start' });
        }
      } else {
        // Full Grid View Mode
        if (staysCol) {
          staysCol.className = 'col-12 transition-all';
          staysCol.classList.remove('d-none');
        }
        if (gridView) {
          gridView.classList.remove('d-none', 'row-cols-lg-2', 'row-cols-xl-2');
          gridView.classList.add('row-cols-lg-3', 'row-cols-xl-4');
        }
        splitMapCol.classList.add('d-none');

        // Button states
        if (toggleText) toggleText.textContent = 'Show Map';
        if (toggleIcon) toggleIcon.className = 'bi bi-map-fill';

        if (gridViewBtn) {
          gridViewBtn.classList.add('btn-dark');
          gridViewBtn.classList.remove('btn-outline-secondary', 'text-body');
          gridViewBtn.classList.add('text-white');
        }
        if (toggleTopBtn) {
          toggleTopBtn.classList.remove('btn-dark', 'text-white');
          toggleTopBtn.classList.add('btn-outline-secondary', 'text-body');
        }
      }
    }

    if (toggleBtn) {
      toggleBtn.addEventListener('click', () => setMapView(!isMapVisible));
    }
    if (toggleTopBtn) {
      toggleTopBtn.addEventListener('click', () => setMapView(true));
    }
    if (gridViewBtn) {
      gridViewBtn.addEventListener('click', () => setMapView(false));
    }

    // Responsive resize adjustment
    window.addEventListener('resize', () => {
      if (isMapVisible) {
        setMapView(true);
      }
    });

    if (preferMap) {
      setMapView(true);
    }

    function initIndexMap() {
      const mapContainer = document.getElementById('indexMap');
      if (!mapContainer || !window.L) return;

      const listings = window.allListingsData || [];

      // Default center: Central India / Golden Corridor
      let center = [23.5, 78.5];
      let zoom = 5;

      map = L.map('indexMap', {
        scrollWheelZoom: true,
      }).setView(center, zoom);

      // Primary: Clean Tile Layer
      L.tileLayer('https://tile.openstreetmap.org/{z}/{x}/{y}.png', {
        maxZoom: 19,
        attribution: '&copy; <a href="https://www.openstreetmap.org/copyright">OpenStreetMap</a> contributors',
      }).addTo(map);

      const markersCoords = [];

      listings.forEach((listing) => {
        if (!listing.geometry || !listing.geometry.coordinates) return;

        let lon = Number(listing.geometry.coordinates[0]);
        let lat = Number(listing.geometry.coordinates[1]);

        // Defensive normalization for Indian coordinates
        if (lat > 50 && lon < 50) {
          const temp = lat;
          lat = lon;
          lon = temp;
        }

        if (isNaN(lat) || isNaN(lon)) return;

        const listingId = String(listing._id);

        // Custom HTML Floating Price Tag Pill Icon
        const priceTagHtml = `<div class="custom-price-marker" data-marker-id="${listingId}">₹${Number(listing.price).toLocaleString('en-IN')}</div>`;
        const priceIcon = L.divIcon({
          className: 'custom-leaflet-marker-wrapper',
          html: priceTagHtml,
          iconSize: [68, 30],
          iconAnchor: [34, 15],
        });

        const marker = L.marker([lat, lon], { icon: priceIcon }).addTo(map);
        markerMap.set(listingId, marker);

        // Rich Popup Card
        const imageUrl = listing.image && listing.image.url ? listing.image.url : 'https://images.unsplash.com/photo-1590050752117-238cb0fb12b1?auto=format&fit=crop&w=800&q=80';
        const popupContent = `
          <div style="width: 240px; font-family: 'Plus Jakarta Sans', sans-serif;">
            <img src="${imageUrl}" alt="${listing.title}" style="width: 100%; height: 130px; object-fit: cover; border-radius: 8px; margin-bottom: 8px; display: block;" onerror="this.src='https://images.unsplash.com/photo-1590050752117-238cb0fb12b1?auto=format&fit=crop&w=800&q=80'" />
            <div style="font-weight: 700; font-size: 0.88rem; color: #111; margin-bottom: 2px; line-height: 1.3;">${listing.title}</div>
            <div style="font-size: 0.76rem; color: #666; margin-bottom: 6px;"><i class="bi bi-geo-alt-fill" style="color: #ff5a3c;"></i> ${listing.location}</div>
            <div style="display: flex; justify-content: space-between; align-items: center; border-top: 1px solid #eee; padding-top: 8px; margin-top: 4px;">
              <div style="font-weight: 800; font-size: 0.95rem; color: #ff5a3c;">₹${Number(listing.price).toLocaleString('en-IN')}<span style="font-size: 0.72rem; color: #666; font-weight: normal;"> / nt</span></div>
              <a href="/listings/${listingId}" style="background: #ff5a3c; color: #fff; text-decoration: none; padding: 4px 12px; border-radius: 20px; font-size: 0.75rem; font-weight: 600;">View Stay</a>
            </div>
          </div>
        `;

        marker.bindPopup(popupContent, { maxWidth: 270 });

        // Clicking a marker: scroll to corresponding card in grid
        marker.on('click', () => {
          const cardCol = document.querySelector(`.stay-card-col[data-id="${listingId}"]`);
          if (cardCol) {
            cardCol.scrollIntoView({ behavior: 'smooth', block: 'center' });
            const cardInner = cardCol.querySelector('.stay-card');
            if (cardInner) {
              cardInner.classList.add('card-highlight-pulse');
              setTimeout(() => cardInner.classList.remove('card-highlight-pulse'), 2000);
            }
          }
        });

        markersCoords.push([lat, lon]);
      });

      if (markersCoords.length > 1) {
        map.fitBounds(markersCoords, { padding: [40, 40] });
      }

      setTimeout(() => map.invalidateSize(), 200);
      setTimeout(() => map.invalidateSize(), 500);
    }
  }

  // Bi-directional hover highlight
  window.highlightMapMarker = function (id, isHover) {
    const marker = markerMap.get(String(id));
    if (!marker || !marker._icon) return;

    const el = marker._icon.querySelector('.custom-price-marker');
    if (el) {
      if (isHover) {
        el.classList.add('active', 'marker-hover');
        marker.setZIndexOffset(1000);
      } else {
        el.classList.remove('active', 'marker-hover');
        marker.setZIndexOffset(0);
      }
    }
  };

  // Filter map markers dynamically based on visible cards
  window.filterMapMarkers = function (matchingIds) {
    if (!map) return;
    const matchingSet = new Set(matchingIds);

    markerMap.forEach((marker, id) => {
      if (matchingSet.has(id)) {
        if (!map.hasLayer(marker)) {
          marker.addTo(map);
        }
      } else {
        if (map.hasLayer(marker)) {
          map.removeLayer(marker);
        }
      }
    });
  };

  if (document.readyState !== 'loading') {
    runMap();
  } else {
    document.addEventListener('DOMContentLoaded', runMap);
  }
})();
