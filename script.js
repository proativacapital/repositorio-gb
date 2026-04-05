/* ============================================
   Proativa Capital — Vanilla JS
   INP-optimized, no heavy blocking tasks
   ============================================ */

(function () {
  'use strict';

  // ---------- DOM REFERENCES ----------
  const header = document.querySelector('.site-header');
  const menuToggle = document.getElementById('menuToggle');
  const navList = document.getElementById('navList');
  const navLinks = document.querySelectorAll('.nav-link');

  // ---------- HEADER SCROLL STATE ----------
  let lastScrolled = false;

  function updateHeaderState() {
    const scrolled = window.scrollY > 10;
    if (scrolled !== lastScrolled) {
      lastScrolled = scrolled;
      if (scrolled) {
        header.classList.add('scrolled');
      } else {
        header.classList.remove('scrolled');
      }
    }
  }

  // Use passive scroll listener for better INP
  window.addEventListener('scroll', updateHeaderState, { passive: true });
  updateHeaderState();

  // ---------- MOBILE MENU ----------
  function toggleMenu() {
    const isOpen = navList.classList.contains('open');

    if (isOpen) {
      navList.classList.remove('open');
      menuToggle.classList.remove('active');
      menuToggle.setAttribute('aria-expanded', 'false');
      menuToggle.setAttribute('aria-label', 'Abrir menu');
    } else {
      navList.classList.add('open');
      menuToggle.classList.add('active');
      menuToggle.setAttribute('aria-expanded', 'true');
      menuToggle.setAttribute('aria-label', 'Fechar menu');
    }
  }

  function closeMenu() {
    navList.classList.remove('open');
    menuToggle.classList.remove('active');
    menuToggle.setAttribute('aria-expanded', 'false');
    menuToggle.setAttribute('aria-label', 'Abrir menu');
  }

  menuToggle.addEventListener('click', toggleMenu);

  // Close menu when a nav link is clicked
  navLinks.forEach(function (link) {
    link.addEventListener('click', closeMenu);
  });

  // Close menu on Escape key
  document.addEventListener('keydown', function (e) {
    if (e.key === 'Escape' && navList.classList.contains('open')) {
      closeMenu();
      menuToggle.focus();
    }
  });

  // ---------- SMOOTH SCROLL (for older browsers without CSS scroll-behavior) ----------
  document.querySelectorAll('a[href^="#"]').forEach(function (anchor) {
    anchor.addEventListener('click', function (e) {
      var targetId = this.getAttribute('href');
      if (targetId === '#') return;

      var target = document.querySelector(targetId);
      if (target) {
        e.preventDefault();
        var headerOffset = parseInt(getComputedStyle(document.documentElement).getPropertyValue('--header-height')) || 72;
        var elementPosition = target.getBoundingClientRect().top + window.scrollY;
        var offsetPosition = elementPosition - headerOffset;

        window.scrollTo({
          top: offsetPosition,
          behavior: 'smooth'
        });

        // Update URL without triggering scroll
        history.pushState(null, '', targetId);
      }
    });
  });

  // ---------- FADE-IN ON SCROLL (IntersectionObserver — no layout thrashing) ----------
  function initFadeIns() {
    var fadeElements = document.querySelectorAll(
      '.card, .stat, .values-list__item, .jobs-content, .section__tag, .section__title, .section__lead'
    );

    // Add the fade-in class
    fadeElements.forEach(function (el) {
      el.classList.add('fade-in');
    });

    // Guard: check for IntersectionObserver support
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
            // Use requestAnimationFrame to batch visual updates (better INP)
            requestAnimationFrame(function () {
              entry.target.classList.add('visible');
            });
            observer.unobserve(entry.target);
          }
        });
      },
      {
        threshold: 0.15,
        rootMargin: '0px 0px -40px 0px'
      }
    );

    fadeElements.forEach(function (el) {
      observer.observe(el);
    });
  }

  // Defer fade-in setup to avoid blocking first paint
  if (document.readyState === 'loading') {
    document.addEventListener('DOMContentLoaded', initFadeIns);
  } else {
    requestAnimationFrame(initFadeIns);
  }

  // ---------- COUNTER ANIMATION (stats section) ----------
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
    var duration = 1500;
    var startTime = null;

    function step(timestamp) {
      if (!startTime) startTime = timestamp;
      var progress = Math.min((timestamp - startTime) / duration, 1);

      // Ease-out cubic
      var eased = 1 - Math.pow(1 - progress, 3);
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

  if (document.readyState === 'loading') {
    document.addEventListener('DOMContentLoaded', animateCounters);
  } else {
    requestAnimationFrame(animateCounters);
  }

  // ---------- ACTIVE NAV HIGHLIGHT ON SCROLL ----------
  function initActiveNav() {
    var sections = document.querySelectorAll('section[id]');

    if (!('IntersectionObserver' in window) || sections.length === 0) return;

    var observer = new IntersectionObserver(
      function (entries) {
        entries.forEach(function (entry) {
          if (entry.isIntersecting) {
            var id = entry.target.getAttribute('id');
            navLinks.forEach(function (link) {
              if (link.getAttribute('href') === '#' + id) {
                link.classList.add('active');
              } else {
                link.classList.remove('active');
              }
            });
          }
        });
      },
      {
        threshold: 0.3,
        rootMargin: '-' + (parseInt(getComputedStyle(document.documentElement).getPropertyValue('--header-height')) || 72) + 'px 0px -40% 0px'
      }
    );

    sections.forEach(function (section) {
      observer.observe(section);
    });
  }

  if (document.readyState === 'loading') {
    document.addEventListener('DOMContentLoaded', initActiveNav);
  } else {
    requestAnimationFrame(initActiveNav);
  }
})();
