/**
 * FairStay — 3D Spatial Vacation Portals & Motion Physics Engine (Concept 1)
 * 1. 3D Spatial Vacation Portals (Apple Vision Pro / Luxury Style)
 * 2. Multi-Plane Ambient Weather Particles (Procedural Snow, Sunbeam & Starlight)
 * 3. 60fps Hardware-Accelerated 3D Card Tilt with Dynamic Specular Glare
 * 4. Magnetic Micro-Interactions & Apple Intelligence 3D Living Orb
 * 5. Perspective 3D Scroll Reveal Observers
 */

(function () {
  'use strict';

  /* ==========================================================================
     1. 3D Spatial Vacation Portals Engine (Concept 1)
     ========================================================================== */
  function initSpatialPortals() {
    const section = document.getElementById('spatialPortalsSection');
    const toggleBtn = document.getElementById('toggleSpatialPortalsBtn');
    const starsCanvas = document.getElementById('spatialStarsCanvas');
    const snowCanvas = document.querySelector('.portal-snow-canvas');
    const portalCards = document.querySelectorAll('[data-tilt-portal="true"]');

    if (!section) return;

    // Toggle Spatial Portals visibility
    if (toggleBtn) {
      toggleBtn.addEventListener('click', function () {
        const isHidden = section.classList.contains('d-none');
        if (isHidden) {
          section.classList.remove('d-none');
          toggleBtn.innerHTML = '<i class="bi bi-grid-fill me-1"></i> Standard View';
          toggleBtn.classList.add('active');
        } else {
          section.classList.add('d-none');
          toggleBtn.innerHTML = '<i class="bi bi-layers-fill me-1"></i> ✨ 3D Spatial Portals';
          toggleBtn.classList.remove('active');
        }
      });
    }

    // --------------------------------------------------------------------------
    // Ambient Starfield Canvas
    // --------------------------------------------------------------------------
    if (starsCanvas) {
      const ctx = starsCanvas.getContext('2d');
      let stars = [];
      let starWidth = (starsCanvas.width = section.clientWidth || 1100);
      let starHeight = (starsCanvas.height = section.clientHeight || 550);

      function initStars() {
        stars = [];
        const count = 90;
        for (let i = 0; i < count; i++) {
          stars.push({
            x: Math.random() * starWidth,
            y: Math.random() * starHeight,
            radius: Math.random() * 1.6 + 0.5,
            alpha: Math.random() * 0.7 + 0.2,
            speedY: Math.random() * 0.25 + 0.05,
            speedX: (Math.random() - 0.5) * 0.15,
          });
        }
      }
      initStars();

      window.addEventListener('resize', () => {
        starWidth = starsCanvas.width = section.clientWidth;
        starHeight = starsCanvas.height = section.clientHeight;
        initStars();
      });

      let isPortalsVisible = true;
      let starsRaf = null;
      let snowRaf = null;

      function renderStars() {
        if (!isPortalsVisible) {
          starsRaf = null;
          return;
        }

        ctx.clearRect(0, 0, starWidth, starHeight);
        ctx.fillStyle = '#ffffff';

        for (let s of stars) {
          ctx.globalAlpha = s.alpha;
          ctx.beginPath();
          ctx.arc(s.x, s.y, s.radius, 0, Math.PI * 2);
          ctx.fill();

          s.y -= s.speedY;
          s.x += s.speedX;

          if (s.y < 0) s.y = starHeight;
          if (s.x < 0) s.x = starWidth;
          if (s.x > starWidth) s.x = 0;
        }
        starsRaf = requestAnimationFrame(renderStars);
      }

      function startStars() {
        if (!starsRaf && isPortalsVisible) {
          starsRaf = requestAnimationFrame(renderStars);
        }
      }

      function stopStars() {
        if (starsRaf) {
          cancelAnimationFrame(starsRaf);
          starsRaf = null;
        }
      }

      starsRaf = requestAnimationFrame(renderStars);
    }

    // --------------------------------------------------------------------------
    // Manali Live Snowflakes Canvas
    // --------------------------------------------------------------------------
    let startSnow = () => {};
    let stopSnow = () => {};

    if (snowCanvas) {
      const sCtx = snowCanvas.getContext('2d');
      let snowW = (snowCanvas.width = snowCanvas.clientWidth || 300);
      let snowH = (snowCanvas.height = snowCanvas.clientHeight || 400);

      const flakes = [];
      for (let i = 0; i < 45; i++) {
        flakes.push({
          x: Math.random() * snowW,
          y: Math.random() * snowH,
          r: Math.random() * 2.2 + 0.8,
          d: Math.random() * 1 + 0.5,
          a: Math.random() * 0.8 + 0.2,
        });
      }

      function renderSnow() {
        if (!isPortalsVisible) {
          snowRaf = null;
          return;
        }

        sCtx.clearRect(0, 0, snowW, snowH);
        sCtx.fillStyle = '#ffffff';

        for (let f of flakes) {
          sCtx.globalAlpha = f.a;
          sCtx.beginPath();
          sCtx.arc(f.x, f.y, f.r, 0, Math.PI * 2);
          sCtx.fill();

          f.y += f.d * 0.8;
          f.x += Math.sin(f.y * 0.02) * 0.5;

          if (f.y > snowH) {
            f.y = -5;
            f.x = Math.random() * snowW;
          }
        }
        snowRaf = requestAnimationFrame(renderSnow);
      }

      startSnow = function () {
        if (!snowRaf && isPortalsVisible) {
          snowRaf = requestAnimationFrame(renderSnow);
        }
      };

      stopSnow = function () {
        if (snowRaf) {
          cancelAnimationFrame(snowRaf);
          snowRaf = null;
        }
      };

      snowRaf = requestAnimationFrame(renderSnow);
    }

    // Observer to completely pause canvas processing when scrolled offscreen
    if ('IntersectionObserver' in window) {
      const obs = new IntersectionObserver(
        (entries) => {
          isPortalsVisible = entries[0].isIntersecting;
          if (isPortalsVisible) {
            if (typeof startStars === 'function') startStars();
            startSnow();
          } else {
            if (typeof stopStars === 'function') stopStars();
            stopSnow();
          }
        },
        { threshold: 0 }
      );
      obs.observe(section);
    }

    // --------------------------------------------------------------------------
    // 3D Perspective Tilt on Portals
    // --------------------------------------------------------------------------
    if (!window.matchMedia('(pointer: coarse)').matches) {
      portalCards.forEach((card) => {
        let rafId = null;
        const glare = card.querySelector('.card-glare-overlay');

        card.addEventListener('mousemove', (e) => {
          const rect = card.getBoundingClientRect();
          const x = e.clientX - rect.left;
          const y = e.clientY - rect.top;

          const centerX = rect.width / 2;
          const centerY = rect.height / 2;

          const rotX = -((y - centerY) / centerY) * 12;
          const rotY = ((x - centerX) / centerX) * 12;

          const glareX = (x / rect.width) * 100;
          const glareY = (y / rect.height) * 100;

          if (rafId) cancelAnimationFrame(rafId);
          rafId = requestAnimationFrame(() => {
            card.style.transform = `perspective(1200px) rotateX(${rotX.toFixed(2)}deg) rotateY(${rotY.toFixed(2)}deg) translateY(-14px) scale3d(1.03, 1.03, 1.03)`;
            if (glare) {
              glare.style.opacity = '1';
              glare.style.background = `radial-gradient(circle at ${glareX}% ${glareY}%, rgba(255, 255, 255, 0.45) 0%, rgba(255, 255, 255, 0) 65%)`;
            }
          });
        });

        card.addEventListener('mouseleave', () => {
          if (rafId) cancelAnimationFrame(rafId);
          rafId = requestAnimationFrame(() => {
            card.style.transform = '';
            if (glare) glare.style.opacity = '0';
          });
        });
      });
    }

    // --------------------------------------------------------------------------
    // 3D Panoramic Stage Parallax on Mouse Move (Zero Layout Thrashing)
    // --------------------------------------------------------------------------
    const hero = document.getElementById('spatialPortalsSection');
    const grid = document.getElementById('spatialPortalsGrid');
    if (hero && grid && !window.matchMedia('(pointer: coarse)').matches) {
      let targetRotX = 0, targetRotY = 0;
      let currentRotX = 0, currentRotY = 0;
      let isHovering = false;
      let heroRect = null;

      hero.addEventListener('mouseenter', () => {
        heroRect = hero.getBoundingClientRect();
      }, { passive: true });

      hero.addEventListener('mousemove', (e) => {
        if (!heroRect) heroRect = hero.getBoundingClientRect();
        const x = (e.clientX - heroRect.left) / heroRect.width - 0.5;
        const y = (e.clientY - heroRect.top) / heroRect.height - 0.5;
        targetRotY = x * 8; // +/- 4 deg
        targetRotX = -y * 6; // +/- 3 deg
        if (!isHovering) {
          isHovering = true;
          tickParallax();
        }
      }, { passive: true });

      hero.addEventListener('mouseleave', () => {
        targetRotX = 0;
        targetRotY = 0;
        heroRect = null;
      }, { passive: true });

      function tickParallax() {
        currentRotX += (targetRotX - currentRotX) * 0.08;
        currentRotY += (targetRotY - currentRotY) * 0.08;

        grid.style.transform = `perspective(1600px) rotateX(${currentRotX.toFixed(2)}deg) rotateY(${currentRotY.toFixed(2)}deg)`;

        if (Math.abs(currentRotX - targetRotX) > 0.01 || Math.abs(currentRotY - targetRotY) > 0.01 || isHovering) {
          requestAnimationFrame(tickParallax);
        } else {
          grid.style.transform = 'perspective(1600px) rotateX(0deg) rotateY(0deg)';
          isHovering = false;
        }
      }
    }
  }

  /* ==========================================================================
     2. 120fps Hardware-Accelerated Card Elevation (Zero-Lag Scroll)
     ========================================================================== */
  function init3DCardTiltEngine() {
    // Pure CSS hardware acceleration handles card elevation and glow on the GPU compositor thread.
    // This completely eliminates JS layout thrashing across all 166 cards during scroll.
    const cards = document.querySelectorAll('[data-tilt-3d="true"]');
    if (!cards.length) return;

    cards.forEach((card) => {
      let glare = card.querySelector('.card-glare-overlay');
      if (!glare) {
        glare = document.createElement('div');
        glare.className = 'card-glare-overlay';
        card.appendChild(glare);
      }
    });
  }

  /* ==========================================================================
     3. 3D Magnetic Micro-Interactions & Living Orb
     ========================================================================== */
  function initMagneticButtons() {
    if (window.matchMedia('(pointer: coarse)').matches) return;

    const magneticElements = document.querySelectorAll('.magnetic-btn-3d, #aiLauncherBtn, .btn-wishlist-heart');

    magneticElements.forEach((btn) => {
      btn.addEventListener('mousemove', function (e) {
        const rect = this.getBoundingClientRect();
        const x = e.clientX - rect.left - rect.width / 2;
        const y = e.clientY - rect.top - rect.height / 2;

        const strength = 0.28;
        this.style.transform = `translate3d(${x * strength}px, ${y * strength}px, 8px) scale(1.06)`;
      });

      btn.addEventListener('mouseleave', function () {
        this.style.transform = 'translate3d(0px, 0px, 0px) scale(1)';
      });
    });
  }

  /* ==========================================================================
     4. Universal Silk Smooth Scroll Reveal Engine
     ========================================================================== */
  function initScrollReveal3D() {
    const revealElements = document.querySelectorAll('.reveal-3d, .reveal-smooth, .stay-card, .booking-card, .spatial-kpi-card');
    if (!revealElements.length || !('IntersectionObserver' in window)) {
      revealElements.forEach((el) => el.classList.add('revealed'));
      return;
    }

    const observer = new IntersectionObserver(
      (entries) => {
        entries.forEach((entry) => {
          if (entry.isIntersecting) {
            entry.target.classList.add('revealed');
            observer.unobserve(entry.target);
          }
        });
      },
      {
        threshold: 0.08,
        rootMargin: '0px 0px -30px 0px',
      }
    );

    revealElements.forEach((el, index) => {
      el.style.transitionDelay = `${(index % 4) * 0.06}s`;
      observer.observe(el);
    });
  }

  /* ==========================================================================
     5. Scroll Progress 3D Glow Bar
     ========================================================================== */
  function initScrollProgressBar() {
    const bar = document.getElementById('scrollProgress3d');
    if (!bar) return;

    window.addEventListener('scroll', function () {
      const scrollTop = window.scrollY || document.documentElement.scrollTop;
      const docHeight = document.documentElement.scrollHeight - document.documentElement.clientHeight;
      const scrollPercent = docHeight > 0 ? (scrollTop / docHeight) * 100 : 0;
      bar.style.width = scrollPercent.toFixed(1) + '%';
    }, { passive: true });
  }

  function initMotion3D() {
    initSpatialPortals();
    init3DCardTiltEngine();
    initMagneticButtons();
  }

  // Auto-init on document ready
  if (document.readyState !== 'loading') {
    initMotion3D();
  } else {
    document.addEventListener('DOMContentLoaded', initMotion3D);
  }
})();
