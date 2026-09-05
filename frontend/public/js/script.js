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
   4. Permanent Night Mode Theme Engine
   ========================================================================== */
function initTheme() {
  document.documentElement.setAttribute('data-bs-theme', 'dark');
  try {
    localStorage.setItem('fairstay_theme', 'dark');
  } catch (e) {}
}
