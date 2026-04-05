/* ============================================
   PROATIVA CAPITAL — Vanilla JS
   Skills: /core-web-vitals (INP + CLS safe)
   Passive listeners, rAF batching, no heavy tasks
   ============================================ */

(function () {
  'use strict';

  // ─────────── DOM REFS ───────────
  var header = document.querySelector('.site-header');
  var menuToggle = document.getElementById('menuToggle');
  var mobileMenu = document.getElementById('mobileMenu');
  var mobileOverlay = document.getElementById('mobileOverlay');
  var mobileLinks = document.querySelectorAll('.mobile-menu__link');
  var navLinks = document.querySelectorAll('.nav-link');

  // ─────────── HEADER SCROLL (passive + rAF throttle for INP) ───────────
  var scrollTicking = false;

  function onScroll() {
    if (!scrollTicking) {
      requestAnimationFrame(function () {
        header.classList.toggle('scrolled', window.scrollY > 10);
        scrollTicking = false;
      });
      scrollTicking = true;
    }
  }

  window.addEventListener('scroll', onScroll, { passive: true });
  onScroll();

  // ─────────── MOBILE MENU (fullscreen overlay) ───────────
  var menuOpen = false;

  function openMobileMenu() {
    menuOpen = true;
    mobileMenu.classList.add('open');
    mobileMenu.setAttribute('aria-hidden', 'false');
    mobileOverlay.classList.add('open');
    mobileOverlay.setAttribute('aria-hidden', 'false');
    menuToggle.classList.add('active');
    menuToggle.setAttribute('aria-expanded', 'true');
    menuToggle.setAttribute('aria-label', 'Fechar menu');
    document.body.style.overflow = 'hidden';

    // Focus first link
    var first = mobileMenu.querySelector('.mobile-menu__link');
    if (first) first.focus();
  }

  function closeMobileMenu() {
    menuOpen = false;
    mobileMenu.classList.remove('open');
    mobileMenu.setAttribute('aria-hidden', 'true');
    mobileOverlay.classList.remove('open');
    mobileOverlay.setAttribute('aria-hidden', 'true');
    menuToggle.classList.remove('active');
    menuToggle.setAttribute('aria-expanded', 'false');
    menuToggle.setAttribute('aria-label', 'Abrir menu');
    document.body.style.overflow = '';
  }

  menuToggle.addEventListener('click', function () {
    if (menuOpen) {
      closeMobileMenu();
    } else {
      openMobileMenu();
    }
  });

  mobileOverlay.addEventListener('click', closeMobileMenu);

  mobileLinks.forEach(function (link) {
    link.addEventListener('click', closeMobileMenu);
  });

  document.addEventListener('keydown', function (e) {
    if (e.key === 'Escape' && menuOpen) {
      closeMobileMenu();
      menuToggle.focus();
    }
  });

  // ─────────── SMOOTH SCROLL ───────────
  document.querySelectorAll('a[href^="#"]').forEach(function (anchor) {
    anchor.addEventListener('click', function (e) {
      var href = this.getAttribute('href');
      if (href === '#') return;

      var target = document.querySelector(href);
      if (target) {
        e.preventDefault();
        var offset = 72;
        var top = target.getBoundingClientRect().top + window.scrollY - offset;

        window.scrollTo({ top: top, behavior: 'smooth' });
        history.pushState(null, '', href);
      }
    });
  });

  // ─────────── HERO STAGGER ANIMATION ───────────
  function initHeroAnimation() {
    var words = document.querySelectorAll('.hero__word');
    var subtitle = document.querySelector('.hero__subtitle');
    var actions = document.querySelector('.hero__actions');

    // Stagger words with increasing delay
    words.forEach(function (word, i) {
      setTimeout(function () {
        requestAnimationFrame(function () {
          word.classList.add('visible');
        });
      }, 200 + i * 180);
    });

    // Subtitle after words
    if (subtitle) {
      setTimeout(function () {
        requestAnimationFrame(function () {
          subtitle.classList.add('visible');
        });
      }, 200 + words.length * 180 + 150);
    }

    // Actions after subtitle
    if (actions) {
      setTimeout(function () {
        requestAnimationFrame(function () {
          actions.classList.add('visible');
        });
      }, 200 + words.length * 180 + 350);
    }
  }

  // ─────────── FADE-IN ON SCROLL (IntersectionObserver) ───────────
  function initFadeIns() {
    var elements = document.querySelectorAll(
      '.eco-card, .stats-item, .culture-item, .jobs-block, .section__tag, .section__title, .section__lead, .section__header'
    );

    // Add fade-in via JS so content stays visible without JS (no CLS)
    elements.forEach(function (el) {
      el.classList.add('fade-in');
    });

    if (!('IntersectionObserver' in window)) {
      elements.forEach(function (el) {
        el.classList.add('visible');
      });
      return;
    }

    var observer = new IntersectionObserver(
      function (entries) {
        entries.forEach(function (entry) {
          if (entry.isIntersecting) {
            requestAnimationFrame(function () {
              entry.target.classList.add('visible');
            });
            observer.unobserve(entry.target);
          }
        });
      },
      {
        threshold: 0.1,
        rootMargin: '0px 0px -60px 0px'
      }
    );

    elements.forEach(function (el) {
      observer.observe(el);
    });
  }

  // ─────────── COUNTER ANIMATION (stats) ───────────
  function initCounters() {
    var items = document.querySelectorAll('.stats-item[data-target]');

    if (!('IntersectionObserver' in window) || items.length === 0) return;

    var observer = new IntersectionObserver(
      function (entries) {
        entries.forEach(function (entry) {
          if (entry.isIntersecting) {
            var el = entry.target;
            var numberEl = el.querySelector('.stats-item__number');
            var target = parseInt(el.dataset.target, 10);
            var prefix = el.dataset.prefix || '';
            var suffix = el.dataset.suffix || '';

            animateNumber(numberEl, target, prefix, suffix);
            observer.unobserve(el);
          }
        });
      },
      { threshold: 0.3 }
    );

    items.forEach(function (item) {
      observer.observe(item);
    });
  }

  function animateNumber(el, target, prefix, suffix) {
    var duration = 2000;
    var startTime = null;

    function step(ts) {
      if (!startTime) startTime = ts;
      var progress = Math.min((ts - startTime) / duration, 1);

      // Ease-out expo for premium feel
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

  // ─────────── ACTIVE NAV HIGHLIGHT ───────────
  function initActiveNav() {
    var sections = document.querySelectorAll('section[id]');

    if (!('IntersectionObserver' in window) || sections.length === 0) return;

    var observer = new IntersectionObserver(
      function (entries) {
        entries.forEach(function (entry) {
          if (entry.isIntersecting) {
            var id = entry.target.getAttribute('id');
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
        threshold: 0.25,
        rootMargin: '-72px 0px -35% 0px'
      }
    );

    sections.forEach(function (section) {
      observer.observe(section);
    });
  }

  // ─────────── INIT (deferred — yield to main thread for INP) ───────────
  function init() {
    initHeroAnimation();
    initFadeIns();
    initCounters();
    initActiveNav();
  }

  if (document.readyState === 'loading') {
    document.addEventListener('DOMContentLoaded', init);
  } else {
    // Double rAF to yield to main thread before init
    requestAnimationFrame(function () {
      requestAnimationFrame(init);
    });
  }
})();
