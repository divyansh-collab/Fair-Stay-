/**
 * FairStay — Client Interaction Scripts
 * Wishlist management, Toastify notifications, tax toggle, and experiences.
 */

document.addEventListener('DOMContentLoaded', () => {
  initTheme();
  initWishlist();
  initTaxToggle();
  initModalsAndExperiences();
  initSearchSuggestions();
  initLiveFeedInteractions();
  initQuickReserveDrawer();
});

/* ==========================================================================
   1. Wishlist Management (localStorage)
   ========================================================================== */
function getWishlist() {
  try {
    return JSON.parse(localStorage.getItem('fairstay_wishlist')) || [];
  } catch (e) {
    return [];
  }
}

function saveWishlist(list) {
  localStorage.setItem('fairstay_wishlist', JSON.stringify(list));
  updateWishlistUI();
}

function updateWishlistUI() {
  const wishlist = getWishlist();
  const countBadge = document.getElementById('wishlistCountBadge');
  const container = document.getElementById('wishlistItemsContainer');
  const emptyState = document.getElementById('wishlistEmptyState');
  const footer = document.getElementById('wishlistFooter');

  // Update Badge
  if (countBadge) {
    if (wishlist.length > 0) {
      countBadge.textContent = wishlist.length;
      countBadge.style.display = 'inline-block';
    } else {
      countBadge.style.display = 'none';
    }
  }

  // Update Drawer Items
  if (container) {
    container.innerHTML = '';
    if (wishlist.length === 0) {
      if (emptyState) emptyState.classList.remove('d-none');
      if (footer) footer.classList.add('d-none');
    } else {
      if (emptyState) emptyState.classList.add('d-none');
      if (footer) footer.classList.remove('d-none');

      wishlist.forEach((item) => {
        const itemEl = document.createElement('div');
        itemEl.className = 'card border rounded-3 p-2 shadow-xs bg-body-tertiary';
        itemEl.innerHTML = `
          <div class="d-flex gap-2 align-items-center">
            <img src="${item.image || 'https://images.unsplash.com/photo-1590050752117-238cb0fb12b1?auto=format&fit=crop&w=200&q=80'}" alt="${item.title}" class="rounded object-fit-cover" style="width: 65px; height: 65px;" />
            <div class="overflow-hidden flex-grow-1">
              <h6 class="fw-bold text-dark mb-0 text-truncate small">${item.title}</h6>
              <div class="small text-muted text-truncate">${item.location}</div>
              <div class="fw-bold text-primary small">₹${Number(item.price).toLocaleString('en-IN')}/night</div>
            </div>
            <div class="d-flex flex-column gap-1">
              <a href="/listings/${item.id}" class="btn btn-sm btn-outline-primary rounded-pill py-0 px-2 small" style="font-size: 0.72rem;">View</a>
              <button class="btn btn-sm btn-link text-danger p-0 remove-wishlist-btn" data-id="${item.id}" style="font-size: 0.72rem;">Remove</button>
            </div>
          </div>
        `;
        container.appendChild(itemEl);
      });

      // Bind remove buttons
      container.querySelectorAll('.remove-wishlist-btn').forEach((btn) => {
        btn.addEventListener('click', (e) => {
          e.preventDefault();
          removeFromWishlist(btn.getAttribute('data-id'));
        });
      });
    }
  }

  // Sync heart buttons on page
  document.querySelectorAll('.btn-wishlist-heart').forEach((btn) => {
    const id = btn.getAttribute('data-id');
    const isSaved = wishlist.some((item) => item.id === id);
    if (isSaved) {
      btn.classList.add('saved');
    } else {
      btn.classList.remove('saved');
    }
  });
}

function toggleWishlistItem(stay) {
  let wishlist = getWishlist();
  const existsIndex = wishlist.findIndex((item) => item.id === stay.id);

  if (existsIndex > -1) {
    wishlist.splice(existsIndex, 1);
    saveWishlist(wishlist);
    showToast('Removed stay from wishlist.', 'info');
  } else {
    wishlist.push(stay);
    saveWishlist(wishlist);
    showToast('❤️ Saved to your pilgrimage wishlist!', 'success');
  }
}

function removeFromWishlist(id) {
  let wishlist = getWishlist();
  wishlist = wishlist.filter((item) => item.id !== id);
  saveWishlist(wishlist);
  showToast('Removed from wishlist.', 'info');
}

function initWishlist() {
  updateWishlistUI();

  // Listen on heart button clicks
  document.querySelectorAll('.btn-wishlist-heart').forEach((btn) => {
    btn.addEventListener('click', (e) => {
      e.preventDefault();
      e.stopPropagation();

      const stay = {
        id: btn.getAttribute('data-id'),
        title: btn.getAttribute('data-title'),
        price: btn.getAttribute('data-price'),
        location: btn.getAttribute('data-location'),
        image: btn.getAttribute('data-image'),
      };

      toggleWishlistItem(stay);
    });
  });

  // Clear all button in drawer
  const clearBtn = document.getElementById('clearWishlistBtn');
  if (clearBtn) {
    clearBtn.addEventListener('click', () => {
      saveWishlist([]);
      showToast('Wishlist cleared.', 'info');
    });
  }

  // Viewport scroll lock when Wishlist Drawer is opened
  const wishlistDrawer = document.getElementById('wishlistDrawer');
  if (wishlistDrawer) {
    wishlistDrawer.addEventListener('show.bs.offcanvas', () => {
      document.documentElement.classList.add('offcanvas-open');
      document.body.classList.add('offcanvas-open');
      document.documentElement.style.overflow = 'hidden';
      document.body.style.overflow = 'hidden';
    });
    wishlistDrawer.addEventListener('hidden.bs.offcanvas', () => {
      document.documentElement.classList.remove('offcanvas-open');
      document.body.classList.remove('offcanvas-open');
      document.documentElement.style.overflow = '';
      document.body.style.overflow = '';
    });
  }
}

/* ==========================================================================
   2. Tax Toggle Switch
   ========================================================================== */
function initTaxToggle() {
  const taxToggle = document.getElementById('taxToggleSwitch');
  if (!taxToggle) return;

  taxToggle.addEventListener('change', () => {
    const showTaxes = taxToggle.checked;
    document.querySelectorAll('.price-base').forEach((el) => {
      el.classList.toggle('d-none', showTaxes);
    });
    document.querySelectorAll('.price-taxed').forEach((el) => {
      el.classList.toggle('d-none', !showTaxes);
    });
    document.querySelectorAll('.price-tax-label').forEach((el) => {
      el.classList.toggle('d-none', !showTaxes);
    });
  });
}

/* ==========================================================================
   3. Modals & Curated Experiences
   ========================================================================== */
function initModalsAndExperiences() {
  // Direct click delegate for search capsules
  document.addEventListener('click', (e) => {
    const searchCapsule = e.target.closest('.search-capsule, [data-bs-target="#smartSearchModal"]');
    if (searchCapsule && window.bootstrap) {
      const modalEl = document.getElementById('smartSearchModal');
      if (modalEl) {
        const modal = bootstrap.Modal.getOrCreateInstance(modalEl);
        modal.show();
        setTimeout(() => {
          const inp = document.getElementById('naturalSearchInput');
          if (inp) inp.focus();
        }, 350);
      }
    }
  });

  // Mark all notifications read
  const markAllReadBtn = document.getElementById('markAllReadBtn');
  const notifBadge = document.getElementById('notifBadge');
  if (markAllReadBtn) {
    markAllReadBtn.addEventListener('click', () => {
      if (notifBadge) notifBadge.style.display = 'none';
      showToast('All notifications marked as read.', 'success');
    });
  }

  // Curated experience booking buttons
  document.querySelectorAll('.btn-book-exp').forEach((btn) => {
    btn.addEventListener('click', (e) => {
      e.preventDefault();
      const expTitle = btn.getAttribute('data-title') || 'Adventure';
      showToast(`Requested reservation for "${expTitle}". Verified confirmation issued!`, 'success');
    });
  });
}

/* ==========================================================================
   4. Natural Search Suggestions
   ========================================================================== */
function initSearchSuggestions() {
  // Suggestion pills
  document.querySelectorAll('.search-suggestion-pill').forEach((pill) => {
    pill.addEventListener('click', () => {
      const query = pill.getAttribute('data-query');
      const input = document.getElementById('naturalSearchInput');
      const form = document.getElementById('smartSearchForm');
      if (input && form) {
        input.value = query;
        form.submit();
      }
    });
  });

  // Live Auto-Suggest Search
  const input = document.getElementById('naturalSearchInput');
  const resultsBox = document.getElementById('liveSearchResults');
  const resultsList = document.getElementById('liveResultsList');
  const resultsCount = document.getElementById('liveResultsCount');

  if (!input || !resultsBox || !resultsList) return;

  const smartSearchModal = document.getElementById('smartSearchModal');
  if (smartSearchModal) {
    smartSearchModal.addEventListener('shown.bs.modal', () => {
      input.focus();
    });
  }

  let debounceTimer = null;

  input.addEventListener('input', () => {
    const val = input.value.trim();
    if (debounceTimer) clearTimeout(debounceTimer);

    if (val.length < 2) {
      resultsBox.classList.add('d-none');
      resultsList.innerHTML = '';
      return;
    }

    debounceTimer = setTimeout(async () => {
      try {
        const res = await fetch(`/api/search?q=${encodeURIComponent(val)}`);
        const data = await res.json();

        if (data.success && data.results && data.results.length > 0) {
          resultsCount.textContent = data.count;
          resultsList.innerHTML = data.results
            .map(
              (item) => `
            <a href="/listings/${item._id}" class="text-decoration-none text-reset">
              <div class="d-flex align-items-center gap-3 p-2 rounded-3 bg-white border shadow-xs transition-all hover-bg-light">
                <img src="${item.image && item.image.url ? item.image.url : '/images/listing-placeholder.jpg'}" alt="${item.title}" class="rounded-2 object-fit-cover flex-shrink-0" style="width: 50px; height: 50px;" loading="lazy" />
                <div class="flex-grow-1 min-w-0">
                  <div class="fw-bold text-truncate small text-dark mb-0">${item.title}</div>
                  <div class="text-muted small d-flex align-items-center gap-2" style="font-size: 0.78rem;">
                    <span>📍 ${item.location}</span>
                    <span>•</span>
                    <span class="badge bg-primary-subtle text-primary border border-primary-subtle" style="font-size: 0.68rem;">${item.category || 'Stay'}</span>
                  </div>
                </div>
                <div class="text-end flex-shrink-0">
                  <div class="fw-bold text-dark small">₹${item.price.toLocaleString('en-IN')}</div>
                  <div class="text-muted" style="font-size: 0.72rem;">/night</div>
                </div>
              </div>
            </a>
          `
            )
            .join('');
          resultsBox.classList.remove('d-none');
        } else {
          resultsBox.classList.add('d-none');
          resultsList.innerHTML = '';
        }
      } catch (err) {
        console.error('Search fetch error:', err);
      }
    }, 200);
  });
}

/* ==========================================================================
   Toastify Helper
   ========================================================================== */
function showToast(text, type = 'success') {
  if (typeof Toastify !== 'function') return;

  const bgGradient =
    type === 'success'
      ? 'linear-gradient(to right, #198754, #20c997)'
      : type === 'info'
      ? 'linear-gradient(to right, #0d6efd, #0dcaf0)'
      : 'linear-gradient(to right, #ff5a3c, #fb8500)';

  Toastify({
    text: text,
    duration: 3500,
    close: true,
    gravity: 'top',
    position: 'right',
    stopOnFocus: true,
    style: {
      background: bgGradient,
      borderRadius: '30px',
      padding: '10px 22px',
      fontSize: '0.88rem',
      fontWeight: '600',
      boxShadow: '0 8px 24px rgba(0,0,0,0.15)',
    },
  }).showToast();
}

/* ==========================================================================
   4. Dual-Theme Engine (Radiant Dawn ☀️ / Velvet Nocturne 🌙)
   ========================================================================== */
function initTheme() {
  function applyTheme(theme) {
    document.documentElement.setAttribute('data-bs-theme', theme);
    try {
      localStorage.setItem('fairstay_theme', theme);
    } catch (e) {}

    const sunIcons = document.querySelectorAll('.theme-icon-sun');
    const moonIcons = document.querySelectorAll('.theme-icon-moon');
    if (theme === 'dark') {
      sunIcons.forEach((i) => i.classList.remove('d-none'));
      moonIcons.forEach((i) => i.classList.add('d-none'));
    } else {
      sunIcons.forEach((i) => i.classList.add('d-none'));
      moonIcons.forEach((i) => i.classList.remove('d-none'));
    }
  }

  const savedTheme = localStorage.getItem('fairstay_theme') || 'light';
  applyTheme(savedTheme);

  const toggleBtn = document.getElementById('themeToggleBtn');
  if (toggleBtn) {
    toggleBtn.addEventListener('click', () => {
      const current = document.documentElement.getAttribute('data-bs-theme') || 'light';
      const nextTheme = current === 'dark' ? 'light' : 'dark';
      applyTheme(nextTheme);
      showToast(nextTheme === 'dark' ? '🌙 Dark mode enabled' : '☀️ Sunlit mode enabled', 'info');
    });
  }

  document.querySelectorAll('.dropdown-theme-toggle').forEach((el) => {
    el.addEventListener('click', (e) => {
      e.preventDefault();
      const current = document.documentElement.getAttribute('data-bs-theme') || 'light';
      const nextTheme = current === 'dark' ? 'light' : 'dark';
      applyTheme(nextTheme);
      showToast(nextTheme === 'dark' ? '🌙 Dark mode enabled' : '☀️ Sunlit mode enabled', 'info');
    });
  });
}

/* ==========================================================================
   5. Live Feed Real-Time 0ms Filtering & Vibe Controls
   ========================================================================== */
function initLiveFeedInteractions() {
  const searchInput = document.getElementById('liveSearchInput');
  const clearBtn = document.getElementById('clearLiveSearchBtn');
  const vibeBtns = document.querySelectorAll('.filter-vibe-btn');
  const staysCountBadge = document.getElementById('filteredStaysCount');
  const cardCols = document.querySelectorAll('.stay-card-col');

  if (!cardCols.length) return;

  let activeVibe = 'all';

  function filterCards() {
    const query = (searchInput ? searchInput.value : '').trim().toLowerCase();
    let visibleCount = 0;
    const matchingIds = [];

    cardCols.forEach((col) => {
      const title = col.getAttribute('data-title') || '';
      const location = col.getAttribute('data-location') || '';
      const category = col.getAttribute('data-category') || '';
      const price = Number(col.getAttribute('data-price')) || 0;
      const id = col.getAttribute('data-id');

      // Check text search against title, location, category
      const matchesSearch =
        !query ||
        title.includes(query) ||
        location.includes(query) ||
        category.includes(query);

      // Check vibe filter
      let matchesVibe = true;
      if (activeVibe === 'budget') {
        matchesVibe = price <= 2000;
      } else if (activeVibe === 'mid') {
        matchesVibe = price > 2000 && price <= 7500;
      } else if (activeVibe === 'luxury') {
        matchesVibe = price > 7500;
      }

      const isVisible = matchesSearch && matchesVibe;
      if (isVisible) {
        col.classList.remove('d-none');
        visibleCount++;
        if (id) matchingIds.push(id);
      } else {
        col.classList.add('d-none');
      }
    });

    // Update count badge
    if (staysCountBadge) {
      staysCountBadge.textContent = `${visibleCount} ${visibleCount === 1 ? 'Stay' : 'Stays'}`;
    }

    // Toggle clear search button
    if (clearBtn) {
      if (query.length > 0) {
        clearBtn.classList.remove('d-none');
      } else {
        clearBtn.classList.add('d-none');
      }
    }

    // Sync with Leaflet Map markers if map is active
    if (typeof window.filterMapMarkers === 'function') {
      window.filterMapMarkers(matchingIds);
    }
  }

  if (searchInput) {
    searchInput.addEventListener('input', filterCards);
  }

  if (clearBtn) {
    clearBtn.addEventListener('click', () => {
      searchInput.value = '';
      clearBtn.classList.add('d-none');
      filterCards();
      searchInput.focus();
    });
  }

  vibeBtns.forEach((btn) => {
    btn.addEventListener('click', () => {
      vibeBtns.forEach((b) => {
        b.classList.remove('active', 'btn-dark');
        b.classList.add('btn-outline-secondary');
      });
      btn.classList.add('active', 'btn-dark');
      btn.classList.remove('btn-outline-secondary');
      activeVibe = btn.getAttribute('data-vibe') || 'all';
      filterCards();
    });
  });

  // Bi-directional hover card -> map marker highlight
  cardCols.forEach((col) => {
    const id = col.getAttribute('data-id');
    if (!id) return;

    col.addEventListener('mouseenter', () => {
      if (typeof window.highlightMapMarker === 'function') {
        window.highlightMapMarker(id, true);
      }
    });

    col.addEventListener('mouseleave', () => {
      if (typeof window.highlightMapMarker === 'function') {
        window.highlightMapMarker(id, false);
      }
    });
  });
}

/* ==========================================================================
   6. 1-Click Quick Reserve Offcanvas Drawer
   ========================================================================== */
function initQuickReserveDrawer() {
  const drawerEl = document.getElementById('quickReserveDrawer');
  if (!drawerEl) return;

  const qrImg = document.getElementById('qrListingImg');
  const qrTitle = document.getElementById('qrListingTitle');
  const qrLocation = document.getElementById('qrListingLocation');
  const qrPrice = document.getElementById('qrListingPrice');
  const qrNightlyPrice = document.getElementById('qrNightlyPrice');
  const qrNightsCount = document.getElementById('qrNightsCount');
  const qrBasePrice = document.getElementById('qrBasePrice');
  const qrGstLabel = document.getElementById('qrGstLabel');
  const qrGstAmount = document.getElementById('qrGstAmount');
  const qrTotalAmount = document.getElementById('qrTotalAmount');
  const qrForm = document.getElementById('qrBookingForm');
  const qrFullDetailsLink = document.getElementById('qrFullDetailsLink');

  const checkInInput = document.getElementById('qrCheckInDate');
  const checkOutInput = document.getElementById('qrCheckOutDate');
  const guestsInput = document.getElementById('qrGuestsInput');
  const guestsMinus = document.getElementById('qrGuestsMinus');
  const guestsPlus = document.getElementById('qrGuestsPlus');

  let currentPrice = 0;
  let nights = 2;

  function calculateCosts() {
    if (currentPrice <= 0) return;
    const baseTotal = currentPrice * nights;
    
    // Statutory Indian GST Slabs (0% <=1k, 12% 1k-7.5k, 18% >7.5k)
    let gstRate = 0.12;
    let label = 'Taxes & GST (12%)';
    if (currentPrice <= 1000) {
      gstRate = 0;
      label = '0% GST (Exempt under ₹1,000)';
    } else if (currentPrice > 7500) {
      gstRate = 0.18;
      label = 'Taxes & GST (18% Luxury Surcharge)';
    }

    const gstAmount = Math.round(baseTotal * gstRate);
    const grandTotal = baseTotal + gstAmount;

    if (qrNightlyPrice) qrNightlyPrice.textContent = Number(currentPrice).toLocaleString('en-IN');
    if (qrNightsCount) qrNightsCount.textContent = `${nights} ${nights === 1 ? 'night' : 'nights'}`;
    if (qrBasePrice) qrBasePrice.textContent = `₹${baseTotal.toLocaleString('en-IN')}`;
    if (qrGstLabel) qrGstLabel.textContent = label;
    if (qrGstAmount) qrGstAmount.textContent = `₹${gstAmount.toLocaleString('en-IN')}`;
    if (qrTotalAmount) qrTotalAmount.textContent = `₹${grandTotal.toLocaleString('en-IN')}`;
  }

  // Guests Stepper
  if (guestsMinus && guestsPlus && guestsInput) {
    guestsMinus.addEventListener('click', () => {
      let g = parseInt(guestsInput.value, 10) || 1;
      if (g > 1) {
        guestsInput.value = g - 1;
      }
    });

    guestsPlus.addEventListener('click', () => {
      let g = parseInt(guestsInput.value, 10) || 1;
      if (g < 10) {
        guestsInput.value = g + 1;
      }
    });
  }

  // Date setup
  const tomorrow = new Date();
  tomorrow.setDate(tomorrow.getDate() + 1);
  const dayAfter = new Date();
  dayAfter.setDate(dayAfter.getDate() + 3);

  const formatDateYMD = (d) => {
    const month = String(d.getMonth() + 1).padStart(2, '0');
    const day = String(d.getDate()).padStart(2, '0');
    return `${d.getFullYear()}-${month}-${day}`;
  };

  function recalculateNights() {
    if (!checkInInput || !checkOutInput) return;
    const inVal = new Date(checkInInput.value);
    const outVal = new Date(checkOutInput.value);
    if (!isNaN(inVal.getTime()) && !isNaN(outVal.getTime()) && outVal > inVal) {
      const diffTime = outVal.getTime() - inVal.getTime();
      nights = Math.max(1, Math.ceil(diffTime / (1000 * 60 * 60 * 24)));
    } else {
      nights = 1;
    }
    calculateCosts();
  }

  if (checkInInput && checkOutInput) {
    checkInInput.value = formatDateYMD(tomorrow);
    checkOutInput.value = formatDateYMD(dayAfter);
    nights = 2;

    if (typeof flatpickr !== 'undefined') {
      flatpickr(checkInInput, {
        minDate: 'today',
        dateFormat: 'Y-m-d',
        defaultDate: tomorrow,
        onChange: function (selectedDates) {
          if (selectedDates.length > 0) {
            const nextDay = new Date(selectedDates[0]);
            nextDay.setDate(nextDay.getDate() + 1);
            if (checkOutInput._flatpickr) {
              checkOutInput._flatpickr.set('minDate', nextDay);
            }
            recalculateNights();
          }
        },
      });

      flatpickr(checkOutInput, {
        minDate: tomorrow,
        dateFormat: 'Y-m-d',
        defaultDate: dayAfter,
        onChange: function () {
          recalculateNights();
        },
      });
    } else {
      checkInInput.addEventListener('change', recalculateNights);
      checkOutInput.addEventListener('change', recalculateNights);
    }
  }

  // Bind to all Quick Reserve buttons
  document.querySelectorAll('.btn-quick-reserve').forEach((btn) => {
    btn.addEventListener('click', (e) => {
      e.preventDefault();
      e.stopPropagation();

      const id = btn.getAttribute('data-id');
      const title = btn.getAttribute('data-title') || 'FairStay Verified Stay';
      const location = btn.getAttribute('data-location') || 'India';
      const price = Number(btn.getAttribute('data-price')) || 0;
      const image = btn.getAttribute('data-image') || 'https://images.unsplash.com/photo-1590050752117-238cb0fb12b1?auto=format&fit=crop&w=400&q=80';

      currentPrice = price;

      if (qrImg) qrImg.src = image;
      if (qrTitle) qrTitle.textContent = title;
      if (qrLocation) qrLocation.textContent = location;
      if (qrPrice) qrPrice.textContent = `₹${price.toLocaleString('en-IN')} / night`;
      if (qrForm) qrForm.action = `/listings/${id}/bookings`;
      if (qrFullDetailsLink) qrFullDetailsLink.href = `/listings/${id}`;

      calculateCosts();

      if (typeof bootstrap !== 'undefined' && bootstrap.Offcanvas) {
        const offcanvas = bootstrap.Offcanvas.getOrCreateInstance(drawerEl);
        offcanvas.show();
      } else {
        drawerEl.classList.add('show');
        drawerEl.style.visibility = 'visible';
      }
    });
  });
}

