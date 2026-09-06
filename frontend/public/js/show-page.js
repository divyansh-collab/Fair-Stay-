/**
 * FairStay — Interactive Listing Details Page Logic
 * 100% Organic Google Places Lightbox, AI Festival Price Predictor & Transparency Engine,
 * Interactive Guest Stepper, Datepicker, Map, and Seamless Reservation.
 */

(function () {
  function initShowPage() {
    initShowMap();
    initDatepickers();
    initFestivalPredictor();
    initGalleryModal();
    initGuestPicker();
    initShareAndSave();
    initAiConciergeTrigger();
    initContactHostModal();
    initScrollSpy();
  }

  /* ==========================================================================
     1. Show Page Leaflet Map
     ========================================================================== */
  function initShowMap() {
    const mapEl = document.getElementById('showMap');
    if (!mapEl || !window.listingCoords || !window.L) return;

    let lon = Number(window.listingCoords[0]);
    let lat = Number(window.listingCoords[1]);

    // Defensive normalization for Indian coordinates
    if (lat > 50 && lon < 50) {
      const temp = lat;
      lat = lon;
      lon = temp;
    }

    if (isNaN(lat) || isNaN(lon)) {
      lat = 10.0889; // Munnar fallback
      lon = 77.0595;
    }

    const map = L.map('showMap', {
      scrollWheelZoom: false,
    }).setView([lat, lon], 14);

    // OpenStreetMap standard tile layer
    L.tileLayer('https://tile.openstreetmap.org/{z}/{x}/{y}.png', {
      attribution: '&copy; <a href="https://www.openstreetmap.org/copyright">OpenStreetMap</a> contributors',
      maxZoom: 19,
    }).addTo(map);

    // Modern Airbnb Coral Marker Pin
    const stayPinIcon = L.divIcon({
      className: 'custom-show-map-pin',
      html: `
        <div style="background-color: #ff5a3c; color: #ffffff; border: 3px solid #ffffff; border-radius: 50%; width: 44px; height: 44px; display: flex; align-items: center; justify-content: center; box-shadow: 0 6px 18px rgba(0,0,0,0.3); font-size: 1.25rem; cursor: pointer; transition: transform 0.2s ease;">
          🏡
        </div>
      `,
      iconSize: [44, 44],
      iconAnchor: [22, 22],
    });

    const marker = L.marker([lat, lon], { icon: stayPinIcon }).addTo(map);
    marker.bindPopup(`
      <div style="font-family: 'Plus Jakarta Sans', sans-serif; padding: 4px;">
        <strong style="font-size: 0.95rem; color: #111;">${window.listingTitle || 'Verified Stay'}</strong><br />
        <small style="color: #ff5a3c; font-weight: 600;"><i class="bi bi-shield-check"></i> FairSafe™ Verified Location</small>
      </div>
    `).openPopup();

    setTimeout(() => map.invalidateSize(), 150);
    setTimeout(() => map.invalidateSize(), 450);
  }

  /* ==========================================================================
     2. Flatpickr, Dynamic Dates & Real-Time AI Festival Price Calculation
     ========================================================================== */
  let currentMultiplier = window.festivalMultiplier || 1.0;

  function initDatepickers() {
    const checkInEl = document.getElementById('checkInDate');
    const checkOutEl = document.getElementById('checkOutDate');
    const bookingForm = document.getElementById('bookingForm');
    if (!checkInEl || !checkOutEl) return;

    const basePrice = window.listingPrice || 3500;

    // Pre-calculate default dates: Tomorrow -> +2 nights
    const tomorrow = new Date(Date.now() + 24 * 60 * 60 * 1000);
    const dayAfterTomorrow = new Date(Date.now() + 3 * 24 * 60 * 60 * 1000);

    const formatYMD = (d) => d.toISOString().split('T')[0];
    const defaultCheckIn = formatYMD(tomorrow);
    const defaultCheckOut = formatYMD(dayAfterTomorrow);

    checkInEl.value = defaultCheckIn;
    checkOutEl.value = defaultCheckOut;

    let fpCheckIn;
    let fpCheckOut;

    window.updateDatePickers = function (inDateStr, outDateStr, multiplier) {
      if (multiplier) currentMultiplier = multiplier;
      if (fpCheckIn && inDateStr) fpCheckIn.setDate(inDateStr, true);
      if (fpCheckOut && outDateStr) fpCheckOut.setDate(outDateStr, true);
      calculateTotal();
    };

    if (window.flatpickr) {
      fpCheckIn = flatpickr(checkInEl, {
        defaultDate: defaultCheckIn,
        minDate: 'today',
        dateFormat: 'Y-m-d',
        altInput: true,
        altFormat: 'D, d M Y',
        monthSelectorType: 'static',
        animate: true,
        disableMobile: true,
        onChange: async function (selectedDates, dateStr) {
          if (fpCheckOut) {
            fpCheckOut.set('minDate', dateStr);
          }
          // Real-time festival check for picked date
          await syncFestivalForDate(dateStr);
          calculateTotal();
        },
      });

      fpCheckOut = flatpickr(checkOutEl, {
        defaultDate: defaultCheckOut,
        minDate: defaultCheckIn,
        dateFormat: 'Y-m-d',
        altInput: true,
        altFormat: 'D, d M Y',
        monthSelectorType: 'static',
        animate: true,
        disableMobile: true,
        onChange: function () {
          calculateTotal();
        },
      });
    }

    async function syncFestivalForDate(dateStr) {
      try {
        const queryParams = new URLSearchParams({
          listingId: window.listingId || '',
          destination: window.listingLocation || '',
          checkInDate: dateStr,
          basePrice: basePrice,
          listingTitle: window.listingTitle || '',
        });
        const res = await fetch(`/ai/predict-festival-price?${queryParams.toString()}`);
        if (!res.ok) return;
        const data = await res.json();
        if (data && data.success) {
          currentMultiplier = 1 + (data.percentage * (data.direction === 'lower' ? -1 : 1)) / 100;
          updateFestivalUI(data);
        }
      } catch (err) {
        console.warn('Could not sync festival for date:', err);
      }
    }

    function updateFestivalUI(data) {
      const alertBox = document.getElementById('activeFestivalAlertBox');
      const alertTitle = document.getElementById('activeFestivalTitle');
      const alertBadge = document.getElementById('activeFestivalBadge');
      const alertExplanation = document.getElementById('activeFestivalExplanation');
      const displayNightly = document.getElementById('displayNightlyPrice');

      const isSurge = data.percentage > 0 && data.direction !== 'lower';
      const isDiscount = data.direction === 'lower';

      if (alertBox) {
        alertBox.className = `alert ${isSurge ? 'alert-warning border-warning-subtle' : isDiscount ? 'alert-success border-success-subtle' : 'alert-light border'} rounded-3 p-2 small mb-3`;
      }
      if (alertTitle) {
        alertTitle.innerHTML = `<span>${data.festivalName.split(' ')[0] || '✨'}</span> <span>${data.festivalName}</span>`;
      }
      if (alertBadge) {
        alertBadge.className = `badge ${isSurge ? 'bg-danger' : isDiscount ? 'bg-success' : 'bg-secondary'} rounded-pill px-2 py-1`;
        alertBadge.textContent = data.signedPercentage ? `${data.signedPercentage} ${isSurge ? 'Surge' : 'Discount'}` : 'Normal Rate';
      }
      if (alertExplanation) {
        alertExplanation.textContent = data.explanation;
      }
      if (displayNightly) {
        const nightly = Math.round(basePrice * currentMultiplier);
        displayNightly.textContent = `₹${nightly.toLocaleString('en-IN')}`;
      }
    }

    function calculateTotal() {
      const d1 = checkInEl.value;
      const d2 = checkOutEl.value;
      if (!d1 || !d2) return;

      const date1 = new Date(d1);
      const date2 = new Date(d2);
      const diffTime = date2 - date1;
      const nights = Math.max(1, Math.ceil(diffTime / (1000 * 60 * 60 * 24)));

      const effectivePrice = Math.round(basePrice * currentMultiplier);
      const subtotal = effectivePrice * nights;
      const gst = Math.round(subtotal * 0.12);
      const total = subtotal + gst;

      const calcNights = document.getElementById('calcNights');
      const calcBasePrice = document.getElementById('calcBasePrice');
      const calcGst = document.getElementById('calcGst');
      const calcTotal = document.getElementById('calcTotal');

      if (calcNights) calcNights.textContent = `${nights} night${nights > 1 ? 's' : ''}`;
      if (calcBasePrice) calcBasePrice.textContent = `₹${subtotal.toLocaleString('en-IN')}`;
      if (calcGst) calcGst.textContent = `₹${gst.toLocaleString('en-IN')}`;
      if (calcTotal) calcTotal.textContent = `₹${total.toLocaleString('en-IN')}`;
    }

    // Run initial calculation
    calculateTotal();

    // Form Submission Validation
    if (bookingForm) {
      bookingForm.addEventListener('submit', function (e) {
        const d1 = checkInEl.value;
        const d2 = checkOutEl.value;
        if (!d1 || !d2) {
          e.preventDefault();
          showToast('⚠️ Please choose check-in and check-out dates.');
          if (fpCheckIn) fpCheckIn.open();
          return false;
        }

        const date1 = new Date(d1);
        const date2 = new Date(d2);
        if (date2 <= date1) {
          e.preventDefault();
          showToast('⚠️ Check-out date must be after check-in date.');
          if (fpCheckOut) fpCheckOut.open();
          return false;
        }

        const reserveBtn = document.getElementById('reserveSubmitBtn');
        if (reserveBtn) {
          reserveBtn.disabled = true;
          reserveBtn.innerHTML = '<span class="spinner-border spinner-border-sm me-2" role="status" aria-hidden="true"></span>Securing your stay...';
        }
      });
    }
  }

  /* ==========================================================================
     3. AI Festival Price Predictor & Modal Logic
     ========================================================================== */
  function initFestivalPredictor() {
    const select = document.getElementById('predictFestivalSelect');
    const customCol = document.getElementById('predictCustomDateCol');
    const customDateInput = document.getElementById('predictCustomDateInput');
    const applyBtn = document.getElementById('applyFestivalToStayBtn');

    if (!select) return;

    let lastPrediction = null;

    // Dates mapped to major festivals & city seasons for 1-click booking apply
    const FESTIVAL_TARGET_DATES = {
      // Goa
      goa_sunburn: { checkIn: '2026-12-28', checkOut: '2027-01-01' },
      goa_carnival: { checkIn: '2026-02-12', checkOut: '2026-02-16' },
      goa_watersports: { checkIn: '2026-10-15', checkOut: '2026-10-18' },
      goa_shigmo: { checkIn: '2026-03-18', checkOut: '2026-03-22' },
      goa_monsoon: { checkIn: '2026-07-15', checkOut: '2026-07-18' },
      // Jaipur & Rajasthan
      jaipur_jlf: { checkIn: '2026-01-20', checkOut: '2026-01-24' },
      jaipur_winter_palace: { checkIn: '2026-12-10', checkOut: '2026-12-14' },
      jaipur_pushkar: { checkIn: '2026-11-04', checkOut: '2026-11-08' },
      jaipur_teej: { checkIn: '2026-08-01', checkOut: '2026-08-04' },
      jaipur_summer: { checkIn: '2026-05-15', checkOut: '2026-05-18' },
      // Manali & Himachal
      manali_winter_carnival: { checkIn: '2026-01-08', checkOut: '2026-01-12' },
      manali_summer_escape: { checkIn: '2026-05-20', checkOut: '2026-05-24' },
      manali_kullu_dussehra: { checkIn: '2026-10-14', checkOut: '2026-10-18' },
      manali_apple_harvest: { checkIn: '2026-09-12', checkOut: '2026-09-16' },
      manali_monsoon: { checkIn: '2026-07-25', checkOut: '2026-07-28' },
      // Kerala
      kerala_onam: { checkIn: '2026-08-28', checkOut: '2026-09-02' },
      kerala_winter_backwaters: { checkIn: '2026-12-05', checkOut: '2026-12-09' },
      kerala_monsoon_ayurveda: { checkIn: '2026-06-20', checkOut: '2026-06-24' },
      // Mumbai & Coast
      mumbai_ganeshotsav: { checkIn: '2026-09-08', checkOut: '2026-09-12' },
      mumbai_monsoon_ghats: { checkIn: '2026-07-20', checkOut: '2026-07-24' },
      mumbai_winter_coastal: { checkIn: '2026-12-15', checkOut: '2026-12-18' },
      // Spiritual Corridor
      varanasi_dev_deepawali: { checkIn: '2026-11-15', checkOut: '2026-11-18' },
      varanasi_maha_shivratri: { checkIn: '2026-02-25', checkOut: '2026-02-28' },
      prayagraj_magh_mela: { checkIn: '2026-01-20', checkOut: '2026-01-24' },
      ayodhya_deepotsav: { checkIn: '2026-10-28', checkOut: '2026-10-31' },
      rishikesh_yoga: { checkIn: '2026-03-05', checkOut: '2026-03-09' },
      mathura_braj_holi: { checkIn: '2026-03-12', checkOut: '2026-03-16' },
      // General National Holidays
      christmas: { checkIn: '2026-12-24', checkOut: '2026-12-27' },
      new_year: { checkIn: '2026-12-30', checkOut: '2027-01-02' },
      diwali: { checkIn: '2026-11-01', checkOut: '2026-11-04' },
      holi: { checkIn: '2026-03-14', checkOut: '2026-03-17' },
      rakshabandhan: { checkIn: '2026-08-18', checkOut: '2026-08-21' },
      dussehra: { checkIn: '2026-10-18', checkOut: '2026-10-21' },
      ganesh_chaturthi: { checkIn: '2026-09-07', checkOut: '2026-09-10' },
      eid: { checkIn: '2026-04-10', checkOut: '2026-04-13' },
      monsoon_discount: { checkIn: '2026-07-15', checkOut: '2026-07-18' },
    };

    function getTargetDates(festivalKey) {
      if (FESTIVAL_TARGET_DATES[festivalKey]) return FESTIVAL_TARGET_DATES[festivalKey];
      const ev = (window.destinationEvents || []).find((e) => e.id === festivalKey);
      if (ev && ev.startMonth !== undefined && ev.startDay !== undefined) {
        const yr = 2026;
        const mm = String(ev.startMonth + 1).padStart(2, '0');
        const dd = String(ev.startDay).padStart(2, '0');
        const inDate = new Date(`${yr}-${mm}-${dd}`);
        const outDate = new Date(inDate.getTime() + 3 * 24 * 60 * 60 * 1000);
        return {
          checkIn: `${yr}-${mm}-${dd}`,
          checkOut: outDate.toISOString().split('T')[0],
        };
      }
      return { checkIn: '2026-12-24', checkOut: '2026-12-27' };
    }

    select.addEventListener('change', function () {
      if (this.value === 'custom_date') {
        if (customCol) customCol.classList.remove('d-none');
        fetchPrediction('', customDateInput ? customDateInput.value : '');
      } else {
        if (customCol) customCol.classList.add('d-none');
        fetchPrediction(this.value, '');
      }
    });

    if (customDateInput) {
      customDateInput.addEventListener('change', function () {
        if (select.value === 'custom_date') {
          fetchPrediction('', this.value);
        }
      });
    }

    async function fetchPrediction(festivalKey, dateVal) {
      const heading = document.getElementById('predFestivalHeading');
      const badge = document.getElementById('predPercentageBadge');
      const demand = document.getElementById('predDemandLevel');
      const normalPriceEl = document.getElementById('predNormalPrice');
      const diffEl = document.getElementById('predPriceDiff');
      const diffPercentEl = document.getElementById('predDiffPercent');
      const effectivePriceEl = document.getElementById('predEffectivePrice');
      const explanationEl = document.getElementById('predExplanationText');
      const tipEl = document.getElementById('predTravelerTip');

      if (badge) badge.innerHTML = '<span class="spinner-border spinner-border-sm" role="status"></span>';

      try {
        const queryParams = new URLSearchParams({
          listingId: window.listingId || '',
          destination: window.listingLocation || 'Goa',
          basePrice: window.listingPrice || 3500,
          listingTitle: window.listingTitle || 'Stay',
        });
        if (festivalKey) queryParams.set('festival', festivalKey);
        if (dateVal) queryParams.set('checkInDate', dateVal);

        const res = await fetch(`/ai/predict-festival-price?${queryParams.toString()}`);
        if (!res.ok) throw new Error('Failed to fetch prediction');
        const data = await res.json();
        lastPrediction = data;

        const isSurge = data.percentage > 0 && data.direction !== 'lower';
        const isDiscount = data.direction === 'lower';

        if (heading) heading.textContent = data.festivalName;
        if (badge) {
          badge.textContent = data.signedPercentage;
          badge.className = `display-6 fw-bold ${isSurge ? 'text-danger' : isDiscount ? 'text-success' : 'text-primary'}`;
        }
        if (demand) demand.textContent = data.demandLevel || 'Holiday Travel Demand';
        if (normalPriceEl) normalPriceEl.textContent = `₹${data.basePrice.toLocaleString('en-IN')}`;
        if (diffEl) {
          diffEl.textContent = `${isSurge ? '+' : isDiscount ? '-' : ''}₹${Math.abs(data.difference).toLocaleString('en-IN')}`;
          diffEl.className = `fs-5 fw-bold ${isSurge ? 'text-danger' : isDiscount ? 'text-success' : 'text-primary'}`;
        }
        if (diffPercentEl) diffPercentEl.textContent = `(${data.signedPercentage} ${isSurge ? 'surge' : isDiscount ? 'discount' : 'change'})`;
        if (effectivePriceEl) effectivePriceEl.textContent = `₹${data.effectivePrice.toLocaleString('en-IN')}`;
        if (explanationEl) explanationEl.textContent = data.explanation;
        if (tipEl && data.travelerTip) tipEl.textContent = data.travelerTip;
      } catch (err) {
        console.error('AI Prediction error:', err);
        if (badge) badge.textContent = '+25%';
      }
    }

    if (applyBtn) {
      applyBtn.addEventListener('click', function () {
        const festivalKey = select.value;
        const targetDates = getTargetDates(festivalKey);

        const multiplier = lastPrediction
          ? 1 + (lastPrediction.percentage * (lastPrediction.direction === 'lower' ? -1 : 1)) / 100
          : 1.25;

        if (targetDates && window.updateDatePickers) {
          window.updateDatePickers(targetDates.checkIn, targetDates.checkOut, multiplier);
        } else if (customDateInput && customDateInput.value && window.updateDatePickers) {
          const inDate = new Date(customDateInput.value);
          const outDate = new Date(inDate.getTime() + 2 * 24 * 60 * 60 * 1000);
          const formatYMD = (d) => d.toISOString().split('T')[0];
          window.updateDatePickers(formatYMD(inDate), formatYMD(outDate), multiplier);
        }

        // Close modal
        const modalEl = document.getElementById('festivalPredictorModal');
        if (modalEl && window.bootstrap) {
          bootstrap.Modal.getInstance(modalEl).hide();
        }

        showToast(`✨ Applied ${lastPrediction ? lastPrediction.festivalName : 'Festival'} rate (${lastPrediction ? lastPrediction.signedPercentage : '+25%'})!`);
      });
    }

    // Trigger initial prediction using the city's top event
    const initialFestival = select.value || (window.destinationEvents && window.destinationEvents[0] ? window.destinationEvents[0].id : 'christmas');
    fetchPrediction(initialFestival, '');
  }

  /* ==========================================================================
     4. 100% Organic Google Places Photo Lightbox Modal
     ========================================================================== */
  function initGalleryModal() {
    // Delegate click handlers to all photo items & button
    document.querySelectorAll('.photo-bento-item, .btn-show-all-photos').forEach((item) => {
      item.addEventListener('click', function (e) {
        const idx = parseInt(this.getAttribute('data-gallery-index'), 10) || 0;
        if (typeof window.openGalleryModal === 'function') {
          window.openGalleryModal(idx);
        }
      });
    });
  }

  /* ==========================================================================
     5. Interactive Guest Stepper Picker
     ========================================================================== */
  function initGuestPicker() {
    const toggle = document.getElementById('guestPickerToggle');
    const dropdown = document.getElementById('guestPickerDropdown');
    const closeBtn = document.getElementById('closeGuestPickerBtn');
    const displayLabel = document.getElementById('guestDisplayLabel');
    const hiddenInput = document.getElementById('guestsCountInput');

    if (!toggle || !dropdown) return;

    toggle.addEventListener('click', function (e) {
      e.stopPropagation();
      dropdown.classList.toggle('show');
    });

    if (closeBtn) {
      closeBtn.addEventListener('click', function () {
        dropdown.classList.remove('show');
      });
    }

    document.addEventListener('click', function (e) {
      if (!dropdown.contains(e.target) && !toggle.contains(e.target)) {
        dropdown.classList.remove('show');
      }
    });

    let adults = 2;
    let children = 0;
    let infants = 0;

    const adultsMinus = document.getElementById('adultsMinusBtn');
    const adultsPlus = document.getElementById('adultsPlusBtn');
    const adultsSpan = document.getElementById('adultsCountSpan');

    const childrenMinus = document.getElementById('childrenMinusBtn');
    const childrenPlus = document.getElementById('childrenPlusBtn');
    const childrenSpan = document.getElementById('childrenCountSpan');

    const infantsMinus = document.getElementById('infantsMinusBtn');
    const infantsPlus = document.getElementById('infantsPlusBtn');
    const infantsSpan = document.getElementById('infantsCountSpan');

    function updateGuestState() {
      const totalGuests = adults + children;
      if (adultsSpan) adultsSpan.textContent = adults;
      if (childrenSpan) childrenSpan.textContent = children;
      if (infantsSpan) infantsSpan.textContent = infants;

      if (adultsMinus) adultsMinus.disabled = adults <= 1;
      if (childrenMinus) childrenMinus.disabled = children <= 0;
      if (infantsMinus) infantsMinus.disabled = infants <= 0;

      let label = `${totalGuests} guest${totalGuests > 1 ? 's' : ''}`;
      if (children > 0) label += ` (${adults} adults, ${children} children)`;
      if (infants > 0) label += `, ${infants} infant${infants > 1 ? 's' : ''}`;

      if (displayLabel) displayLabel.textContent = label;
      if (hiddenInput) hiddenInput.value = totalGuests;
    }

    if (adultsPlus) adultsPlus.addEventListener('click', () => { if (adults < 8) { adults++; updateGuestState(); } });
    if (adultsMinus) adultsMinus.addEventListener('click', () => { if (adults > 1) { adults--; updateGuestState(); } });

    if (childrenPlus) childrenPlus.addEventListener('click', () => { if (children < 6) { children++; updateGuestState(); } });
    if (childrenMinus) childrenMinus.addEventListener('click', () => { if (children > 0) { children--; updateGuestState(); } });

    if (infantsPlus) infantsPlus.addEventListener('click', () => { if (infants < 4) { infants++; updateGuestState(); } });
    if (infantsMinus) infantsMinus.addEventListener('click', () => { if (infants > 0) { infants--; updateGuestState(); } });

    updateGuestState();
  }

  /* ==========================================================================
     6. Interactive Share & Save Actions
     ========================================================================== */
  function initShareAndSave() {
    const shareBtn = document.getElementById('shareBtn');
    if (shareBtn) {
      shareBtn.addEventListener('click', function () {
        if (navigator.clipboard) {
          navigator.clipboard.writeText(window.location.href);
          showToast('🏡 Link copied to clipboard! Share it with friends and family.');
        } else {
          showToast('🏡 Share this link: ' + window.location.href);
        }
      });
    }

    const saveBtn = document.getElementById('saveStayBtn');
    const saveText = document.getElementById('saveBtnText');
    if (saveBtn) {
      saveBtn.addEventListener('click', function () {
        const heartIcon = this.querySelector('.heart-icon');
        if (heartIcon) {
          if (heartIcon.classList.contains('bi-suit-heart')) {
            heartIcon.classList.remove('bi-suit-heart');
            heartIcon.classList.add('bi-suit-heart-fill');
            if (saveText) saveText.textContent = 'Saved';
            showToast('❤️ Saved to your FairStay wishlist!');
          } else {
            heartIcon.classList.remove('bi-suit-heart-fill');
            heartIcon.classList.add('bi-suit-heart');
            if (saveText) saveText.textContent = 'Save';
            showToast('Removed from your wishlist.');
          }
        }
      });
    }
  }

  /* ==========================================================================
     7. Interactive AI Concierge Trigger
     ========================================================================== */
  function initAiConciergeTrigger() {
    const aiBtn = document.getElementById('askAiAboutStayBtn');
    if (!aiBtn) return;

    aiBtn.addEventListener('click', function () {
      const panel = document.getElementById('aiChatPanel');
      const input = document.getElementById('aiChatInput');
      const form = document.getElementById('aiChatForm');

      if (panel) panel.classList.remove('d-none');
      if (input && window.listingTitle) {
        input.value = `Tell me about "${window.listingTitle}". What are the best nearby attractions, dining, and activities?`;
        input.focus();
        if (form) {
          setTimeout(() => {
            const submitBtn = form.querySelector('button[type="submit"]');
            if (submitBtn) submitBtn.click();
          }, 300);
        }
      }
    });
  }

  /* ==========================================================================
     8. Contact Host Interactive Modal
     ========================================================================== */
  function initContactHostModal() {
    const chips = document.querySelectorAll('.quick-msg-chip');
    const msgInput = document.getElementById('hostMsgInput');
    const contactForm = document.getElementById('contactHostForm');

    chips.forEach((chip) => {
      chip.addEventListener('click', function () {
        if (msgInput) {
          msgInput.value = this.getAttribute('data-msg');
          msgInput.focus();
        }
      });
    });

    if (contactForm) {
      contactForm.addEventListener('submit', function (e) {
        e.preventDefault();
        const modalEl = document.getElementById('contactHostModal');
        if (modalEl && window.bootstrap) {
          bootstrap.Modal.getInstance(modalEl).hide();
        }
        showToast('✉️ Message sent to host! You will receive a notification when they reply.');
        if (msgInput) msgInput.value = '';
      });
    }
  }

  /* ==========================================================================
     9. ScrollSpy Active Sub-Nav Highlight
     ========================================================================== */
  function initScrollSpy() {
    const sections = document.querySelectorAll('div[id$="Section"]');
    const navLinks = document.querySelectorAll('.show-nav-link');

    window.addEventListener('scroll', function () {
      let current = '';
      sections.forEach((sec) => {
        const top = sec.offsetTop - 120;
        if (window.scrollY >= top) {
          current = sec.getAttribute('id');
        }
      });

      navLinks.forEach((link) => {
        link.classList.remove('active');
        if (link.getAttribute('href') === `#${current}`) {
          link.classList.add('active');
        }
      });
    });
  }

  // Toast Helper
  function showToast(text) {
    if (window.Toastify) {
      Toastify({
        text: text,
        duration: 3500,
        gravity: 'bottom',
        position: 'center',
        style: {
          background: 'linear-gradient(135deg, #222222, #333333)',
          color: '#ffffff',
          borderRadius: '50px',
          padding: '10px 24px',
          boxShadow: '0 8px 24px rgba(0,0,0,0.25)',
          fontWeight: '600',
          fontSize: '0.9rem',
        },
      }).showToast();
    } else {
      alert(text);
    }
  }

  if (document.readyState !== 'loading') {
    initShowPage();
  } else {
    document.addEventListener('DOMContentLoaded', initShowPage);
  }
})();
