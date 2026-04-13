import * as THREE from 'three';
import gsap from 'gsap';
import type { IntroObject } from './objects';

const ORBIT_RADIUS = 3;
const PARTICLE_COUNT = 50;

/**
 * Phase 3 timeline: objects fly in from edges → orbital positions.
 * Duration: 0s – 2s
 */
export function buildEntryTimeline(objects: IntroObject[]): gsap.core.Timeline {
  const tl = gsap.timeline();

  // Target orbital positions (evenly spaced around center)
  const targets = objects.map((o) => ({
    x: Math.cos(o.orbitAngle) * ORBIT_RADIUS,
    y: Math.sin(o.orbitAngle) * ORBIT_RADIUS,
    z: 0,
  }));

  objects.forEach((obj, i) => {
    tl.to(
      obj.mesh.position,
      {
        x: targets[i].x,
        y: targets[i].y,
        z: targets[i].z,
        duration: 2,
        ease: 'power3.out',
      },
      0, // all start at t=0
    );
  });

  return tl;
}

/**
 * Phase 4 timeline: spiral convergence → fusion flash → particles.
 * Duration: 2s – 3.5s (appended after entry)
 */
export function buildConvergenceTimeline(
  objects: IntroObject[],
  flashLight: THREE.PointLight,
  scene: THREE.Scene,
): gsap.core.Timeline {
  const tl = gsap.timeline();

  // Proxy object to drive orbital radius via GSAP
  const orbitState = { radius: ORBIT_RADIUS, speedMult: 1 };

  // Spiral inward: radius 3 → 0 over 1.2s
  tl.to(orbitState, {
    radius: 0,
    speedMult: 4,
    duration: 1.2,
    ease: 'power2.in',
    onUpdate() {
      objects.forEach((obj) => {
        // Advance orbit angle faster as they converge
        obj.orbitAngle += 0.04 * orbitState.speedMult;
        obj.mesh.position.x = Math.cos(obj.orbitAngle) * orbitState.radius;
        obj.mesh.position.y = Math.sin(obj.orbitAngle) * orbitState.radius;
      });
    },
  }, 0);

  // Scale objects to 0 at the end of spiral
  objects.forEach((obj) => {
    tl.to(obj.mesh.scale, {
      x: 0, y: 0, z: 0,
      duration: 0.2,
      ease: 'power2.in',
    }, 1.0); // starts 1.0s into this timeline
  });

  // Flash: intensity 0 → 50 → 0
  tl.to(flashLight, {
    intensity: 50,
    duration: 0.15,
    ease: 'power2.out',
  }, 1.15);
  tl.to(flashLight, {
    intensity: 0,
    duration: 0.2,
    ease: 'power2.in',
  }, 1.3);

  // Burst particles at fusion moment
  const particleGeo = new THREE.BufferGeometry();
  const positions = new Float32Array(PARTICLE_COUNT * 3);
  const velocities: THREE.Vector3[] = [];
  for (let i = 0; i < PARTICLE_COUNT; i++) {
    positions[i * 3] = 0;
    positions[i * 3 + 1] = 0;
    positions[i * 3 + 2] = 0;
    // Random radial direction
    const dir = new THREE.Vector3(
      (Math.random() - 0.5),
      (Math.random() - 0.5),
      (Math.random() - 0.5),
    ).normalize().multiplyScalar(0.15 + Math.random() * 0.1);
    velocities.push(dir);
  }
  particleGeo.setAttribute('position', new THREE.BufferAttribute(positions, 3));

  const particleMat = new THREE.PointsMaterial({
    color: 0xd0d0d8,
    size: 0.06,
    transparent: true,
    opacity: 0,
  });
  const particles = new THREE.Points(particleGeo, particleMat);
  particles.visible = false;
  scene.add(particles);

  // Animate particles: appear, expand, fade
  const particleState = { progress: 0 };
  tl.set(particles, { visible: true }, 1.15);
  tl.fromTo(particleMat, { opacity: 0 }, { opacity: 1, duration: 0.05 }, 1.15);
  tl.to(particleState, {
    progress: 1,
    duration: 0.35,
    ease: 'power1.out',
    onUpdate() {
      const posArr = particleGeo.attributes.position.array as Float32Array;
      for (let i = 0; i < PARTICLE_COUNT; i++) {
        posArr[i * 3] += velocities[i].x;
        posArr[i * 3 + 1] += velocities[i].y;
        posArr[i * 3 + 2] += velocities[i].z;
        // Decelerate
        velocities[i].multiplyScalar(0.92);
      }
      particleGeo.attributes.position.needsUpdate = true;
    },
  }, 1.15);
  tl.to(particleMat, { opacity: 0, duration: 0.2 }, 1.3);

  return tl;
}

/** Rotate each object on its own axes — called every frame */
export function spinObjects(objects: IntroObject[]) {
  for (const obj of objects) {
    obj.mesh.rotation.x += obj.spin.x;
    obj.mesh.rotation.y += obj.spin.y;
    obj.mesh.rotation.z += obj.spin.z;
  }
}
