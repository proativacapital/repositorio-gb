import gsap from 'gsap';
import type { IntroObject } from './objects';

const ORBIT_RADIUS = 3;

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

/** Rotate each object on its own axes — called every frame */
export function spinObjects(objects: IntroObject[]) {
  for (const obj of objects) {
    obj.mesh.rotation.x += obj.spin.x;
    obj.mesh.rotation.y += obj.spin.y;
    obj.mesh.rotation.z += obj.spin.z;
  }
}
