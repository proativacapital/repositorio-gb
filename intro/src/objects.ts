import * as THREE from 'three';

export interface IntroObject {
  mesh: THREE.Mesh;
  /** Angle on the orbital ring (radians) */
  orbitAngle: number;
  /** Self-rotation speed per axis */
  spin: THREE.Vector3;
}

/**
 * Creates the three brand objects and adds them to the scene.
 * All start off-screen at their spawn positions.
 */
export function createObjects(scene: THREE.Scene): IntroObject[] {
  // 1 — Proativa Capital: chrome icosahedron (enters from left)
  const proativaMat = new THREE.MeshStandardMaterial({
    color: 0xd0d0d8,
    metalness: 0.9,
    roughness: 0.15,
  });
  const proativaMesh = new THREE.Mesh(
    new THREE.IcosahedronGeometry(0.7, 1),
    proativaMat,
  );
  proativaMesh.position.set(-14, 0, 0);
  scene.add(proativaMesh);

  // 2 — GLP Gás: blue torus (enters from top)
  const glpMat = new THREE.MeshStandardMaterial({
    color: 0x0050f0,
    emissive: 0x0050f0,
    emissiveIntensity: 0.3,
    metalness: 0.5,
    roughness: 0.3,
  });
  const glpMesh = new THREE.Mesh(
    new THREE.TorusGeometry(0.55, 0.2, 16, 32),
    glpMat,
  );
  glpMesh.position.set(0, 12, 0);
  scene.add(glpMesh);

  // 3 — Simeão Advogados: wine octahedron (enters from right)
  const simeaoMat = new THREE.MeshStandardMaterial({
    color: 0x8b1a2b,
    emissive: 0x8b1a2b,
    emissiveIntensity: 0.3,
    metalness: 0.5,
    roughness: 0.3,
  });
  const simeaoMesh = new THREE.Mesh(
    new THREE.OctahedronGeometry(0.7, 0),
    simeaoMat,
  );
  simeaoMesh.position.set(14, 0, 0);
  scene.add(simeaoMesh);

  return [
    {
      mesh: proativaMesh,
      orbitAngle: 0,                                    // 0°
      spin: new THREE.Vector3(0.008, 0.012, 0.004),
    },
    {
      mesh: glpMesh,
      orbitAngle: (Math.PI * 2) / 3,                    // 120°
      spin: new THREE.Vector3(0.01, 0.006, 0.008),
    },
    {
      mesh: simeaoMesh,
      orbitAngle: (Math.PI * 4) / 3,                    // 240°
      spin: new THREE.Vector3(0.006, 0.01, 0.006),
    },
  ];
}
