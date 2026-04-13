import './style.css';
import * as THREE from 'three';
import { createScene } from './scene';
import { createUI, prefersReducedMotion } from './ui';

const app = document.getElementById('app')!;
const { renderer, scene, camera } = createScene(app);

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

// Skip handler — for now just logs; will jump to final state in later phases
function handleSkip() {
  console.log('[intro] skipped');
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
  renderer.render(scene, camera);
  requestAnimationFrame(tick);
}
tick();
