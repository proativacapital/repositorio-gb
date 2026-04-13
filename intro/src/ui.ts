export function createUI(onSkip: () => void) {
  // -- Skip button --
  const btn = document.createElement('button');
  btn.id = 'skip-btn';
  btn.textContent = 'Skip';
  btn.setAttribute('aria-label', 'Pular introdução');
  btn.setAttribute('tabindex', '0');
  document.body.appendChild(btn);

  // Show after 1s
  setTimeout(() => btn.classList.add('visible'), 1000);

  // Unified skip handler (fires only once)
  let skipped = false;
  const skip = () => {
    if (skipped) return;
    skipped = true;
    btn.classList.remove('visible');
    onSkip();
  };

  btn.addEventListener('click', skip);
  btn.addEventListener('touchend', (e) => {
    e.preventDefault();
    skip();
  });

  window.addEventListener('keydown', (e) => {
    if (e.key === 'Escape' || e.key === ' ') {
      e.preventDefault();
      skip();
    }
  });

  return { skipBtn: btn };
}

/** Creates the logo overlay DOM (needed before animation setup) */
export function createLogoOverlay() {
  const overlay = document.createElement('div');
  overlay.id = 'logo-overlay';
  overlay.innerHTML = `
    <div id="logo-text"></div>
    <div id="tagline">Três forças. Um ecossistema.</div>
  `;
  document.body.appendChild(overlay);
}

/** Returns true if user prefers reduced motion */
export function prefersReducedMotion(): boolean {
  return window.matchMedia('(prefers-reduced-motion: reduce)').matches;
}
