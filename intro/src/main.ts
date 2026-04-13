import './style.css';
import * as THREE from 'three';
import { createScene } from './scene';
import { createUI, createLogoOverlay, prefersReducedMotion } from './ui';
import gsap from 'gsap';
import { createObjects } from './objects';
import { buildEntryTimeline, buildConvergenceTimeline, buildRevealTimeline, spinObjects } from './animation';

const app = document.getElementById('app')!;
const { renderer, scene, camera, flashLight } = createScene(app);

// Dust particles so the fog is visible
const dustCount = 120;
const dustGeo = new THREE.BufferGeometry();
const positions = new Float32Array(dustCount * 3);
for (let i = 0; i < dustCount; i++) {
  positions[i * 3] = (Math.random() - 0.5) * 20;
  positions[i * 3 + 1] = (Math.random() - 0.5) * 20;
  positions[i * 3 + 2] = (Math.random() - 0.5) * 20;
}
dustGeo.setAttribute('position', new THREE.BufferAttribute(positions, 3));
const dustMat = new THREE.PointsMaterial({
  color: 0xd0d0d8,
  size: 0.04,
  transparent: true,
  opacity: 0.5,
});
const dust = new THREE.Points(dustGeo, dustMat);
scene.add(dust);

// Logo overlay DOM (must exist before buildRevealTimeline)
createLogoOverlay();

// 3D brand objects
const objects = createObjects(scene);

// Master GSAP timeline
const masterTL = gsap.timeline();

// Phase 3: entry (0s–2s)
const entryTL = buildEntryTimeline(objects);
masterTL.add(entryTL, 0);

// Phase 4: convergence + flash (2s–3.5s)
const convergeTL = buildConvergenceTimeline(objects, flashLight, scene);
masterTL.add(convergeTL, 2);

// Phase 5: logo reveal + tagline (3.5s–5s)
const revealTL = buildRevealTimeline();
masterTL.add(revealTL, 3.5);

// Fire custom event when intro finishes
masterTL.eventCallback('onComplete', () => {
  window.dispatchEvent(new CustomEvent('introComplete'));
});

// Skip handler — jumps entire timeline to end
function handleSkip() {
  masterTL.progress(1);
}

// Reduced motion: skip intro immediately
if (prefersReducedMotion()) {
  handleSkip();
} else {
  createUI(handleSkip);
}

// Render loop
function tick() {
  dust.rotation.y += 0.0003;
  spinObjects(objects);
  renderer.render(scene, camera);
  requestAnimationFrame(tick);
}
tick();
