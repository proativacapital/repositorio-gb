/* ============================================
   Proativa Capital — Vanilla JS
   Skills: core-web-vitals (INP + CLS safe)
   No heavy blocking, passive listeners, rAF batching
   ============================================ */

(function () {
  'use strict';

  // ---------- DOM REFERENCES ----------
  var header = document.querySelector('.site-header');
  var menuToggle = document.getElementById('menuToggle');
  var navList = document.getElementById('navList');
  var navLinks = document.querySelectorAll('.nav-link');

  // ---------- HEADER SCROLL STATE (passive for INP) ----------
  var ticking = false;

  function updateHeaderState() {
    var scrolled = window.scrollY > 10;
    header.classList.toggle('scrolled', scrolled);
    ticking = false;
  }

  window.addEventListener('scroll', function () {
    if (!ticking) {
      requestAnimationFrame(updateHeaderState);
      ticking = true;
    }
  }, { passive: true });

  updateHeaderState();

  // ---------- MOBILE MENU ----------
  function openMenu() {
    navList.classList.add('open');
    menuToggle.classList.add('active');
    menuToggle.setAttribute('aria-expanded', 'true');
    menuToggle.setAttribute('aria-label', 'Fechar menu');
    // Trap focus: focus first link
    var firstLink = navList.querySelector('.nav-link');
    if (firstLink) firstLink.focus();
  }

  function closeMenu() {
    navList.classList.remove('open');
    menuToggle.classList.remove('active');
    menuToggle.setAttribute('aria-expanded', 'false');
    menuToggle.setAttribute('aria-label', 'Abrir menu');
  }

  function toggleMenu() {
    if (navList.classList.contains('open')) {
      closeMenu();
    } else {
      openMenu();
    }
  }

  menuToggle.addEventListener('click', toggleMenu);

  // Close menu on link click
  navLinks.forEach(function (link) {
    link.addEventListener('click', closeMenu);
  });

  // Close on Escape
  document.addEventListener('keydown', function (e) {
    if (e.key === 'Escape' && navList.classList.contains('open')) {
      closeMenu();
      menuToggle.focus();
    }
  });

  // Close on click outside (mobile)
  document.addEventListener('click', function (e) {
    if (navList.classList.contains('open') &&
        !navList.contains(e.target) &&
        !menuToggle.contains(e.target)) {
      closeMenu();
    }
  });

  // ---------- SMOOTH SCROLL (progressive enhancement) ----------
  document.querySelectorAll('a[href^="#"]').forEach(function (anchor) {
    anchor.addEventListener('click', function (e) {
      var targetId = this.getAttribute('href');
      if (targetId === '#') return;

      var target = document.querySelector(targetId);
      if (target) {
        e.preventDefault();
        var headerOffset = 72;
        var elementPosition = target.getBoundingClientRect().top + window.scrollY;
        var offsetPosition = elementPosition - headerOffset;

        window.scrollTo({
          top: offsetPosition,
          behavior: 'smooth'
        });

        // Update URL fragment
        history.pushState(null, '', targetId);
      }
    });
  });

  // ---------- FADE-IN ON SCROLL (IntersectionObserver — CLS safe) ----------
  function initFadeIns() {
    var fadeElements = document.querySelectorAll(
      '.card, .stat, .values-list__item, .jobs-content, .section__tag, .section__title, .section__lead, .section__header, .hero__eyebrow, .hero__actions, .jobs-badges'
    );

    // Add fade-in class via JS (so content is visible if JS fails — no CLS)
    fadeElements.forEach(function (el) {
      el.classList.add('fade-in');
    });

    if (!('IntersectionObserver' in window)) {
      fadeElements.forEach(function (el) {
        el.classList.add('visible');
      });
      return;
    }

    var observer = new IntersectionObserver(
      function (entries) {
        entries.forEach(function (entry) {
          if (entry.isIntersecting) {
            // Batch visual update in rAF for better INP
            requestAnimationFrame(function () {
              entry.target.classList.add('visible');
            });
            observer.unobserve(entry.target);
          }
        });
      },
      {
        threshold: 0.12,
        rootMargin: '0px 0px -50px 0px'
      }
    );

    fadeElements.forEach(function (el) {
      observer.observe(el);
    });
  }

  // ---------- COUNTER ANIMATION (stats) — CLS safe with min-height ----------
  function animateCounters() {
    var stats = document.querySelectorAll('.stat');

    if (!('IntersectionObserver' in window)) return;

    var observer = new IntersectionObserver(
      function (entries) {
        entries.forEach(function (entry) {
          if (entry.isIntersecting) {
            var stat = entry.target;
            var numberEl = stat.querySelector('.stat__number');
            var target = parseInt(stat.dataset.target, 10);
            var prefix = stat.dataset.prefix || '';
            var suffix = stat.dataset.suffix || '';

            animateNumber(numberEl, target, prefix, suffix);
            observer.unobserve(stat);
          }
        });
      },
      { threshold: 0.3 }
    );

    stats.forEach(function (stat) {
      observer.observe(stat);
    });
  }

  function animateNumber(el, target, prefix, suffix) {
    var duration = 1800;
    var startTime = null;

    function step(timestamp) {
      if (!startTime) startTime = timestamp;
      var progress = Math.min((timestamp - startTime) / duration, 1);

      // Ease-out expo for a premium feel
      var eased = progress === 1 ? 1 : 1 - Math.pow(2, -10 * progress);
      var current = Math.floor(eased * target);

      el.textContent = prefix + current + suffix;

      if (progress < 1) {
        requestAnimationFrame(step);
      } else {
        el.textContent = prefix + target + suffix;
      }
    }

    requestAnimationFrame(step);
  }

  // ---------- ACTIVE NAV HIGHLIGHT ----------
  function initActiveNav() {
    var sections = document.querySelectorAll('section[id]');

    if (!('IntersectionObserver' in window) || sections.length === 0) return;

    var observer = new IntersectionObserver(
      function (entries) {
        entries.forEach(function (entry) {
          if (entry.isIntersecting) {
            var id = entry.target.getAttribute('id');
            // Defer DOM updates to rAF
            requestAnimationFrame(function () {
              navLinks.forEach(function (link) {
                var isActive = link.getAttribute('href') === '#' + id;
                link.classList.toggle('active', isActive);
              });
            });
          }
        });
      },
      {
        threshold: 0.3,
        rootMargin: '-72px 0px -40% 0px'
      }
    );

    sections.forEach(function (section) {
      observer.observe(section);
    });
  }

  // ---------- INIT — deferred to avoid blocking first paint ----------
  function init() {
    initFadeIns();
    animateCounters();
    initActiveNav();
  }

  if (document.readyState === 'loading') {
    document.addEventListener('DOMContentLoaded', init);
  } else {
    // Yield to main thread before initializing (INP best practice)
    requestAnimationFrame(function () {
      requestAnimationFrame(init);
    });
  }
})();
