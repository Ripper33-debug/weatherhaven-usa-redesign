/**
 * Generic, unbranded low-poly vehicles for the "how will it get there" step, at real-world scale
 * so the shelters read at their true size next to them: a four-engine tactical airlifter, a
 * tandem-rotor heavy-lift helicopter, medium tactical trucks, ISO containers, a snowmobile with
 * sleds and a utility vehicle. Lengths along x, nose toward +x.
 */
import * as THREE from "three";
import { GeoBag, meshesFor, type MatSet } from "@/lib/three/camp/kit";

export type Vehicle = {
  group: THREE.Group;
  /** Spinning parts (propellers, rotors, wheels) with the axis they turn about. */
  spinners: { obj: THREE.Object3D; axis: "x" | "y" | "z"; rate: number }[];
  /** Hinged or sliding parts the arrival animation moves. */
  parts: Record<string, THREE.Object3D>;
};

const wheel = (bag: GeoBag, r: number, width: number, x: number, z: number) => {
  bag.cylZ("dark", r, width, x, r, z, 14);
  bag.cylZ("trim", r * 0.45, width + 0.02, x, r, z, 8);
};

// ---- airlifter ---------------------------------------------------------------------------

/** A C-130-class four-engine airlifter: 29.8 m long, 40.4 m span, 11.6 m to the fin tip. */
export function airlifter(mats: MatSet, shadows: boolean): Vehicle {
  const g = new THREE.Group();
  const body = new GeoBag();
  // Fuselage: a lathe from tail to nose, turned to lie along x, with an upswept tail.
  const stations: [number, number][] = [
    [-14.9, 0.32], [-13.5, 0.7], [-11.5, 1.25], [-9, 1.8], [-6.5, 2.1], [-4, 2.15], [6, 2.15], [9.5, 2.12], [11.5, 1.95], [12.8, 1.6], [13.9, 1.05], [14.6, 0.5], [14.9, 0.05],
  ];
  const lathe = new THREE.LatheGeometry(stations.map(([x, r]) => new THREE.Vector2(r, x)), 18);
  lathe.rotateZ(-Math.PI / 2);
  const p = lathe.attributes.position as THREE.BufferAttribute;
  for (let i = 0; i < p.count; i++) {
    const x = p.getX(i);
    if (x < -4.5) p.setY(i, p.getY(i) + (-4.5 - x) * 0.24);
  }
  lathe.computeVertexNormals();
  body.add("shell", lathe, 0, 2.9, 0);
  // Cockpit glazing and a dark nose radome band.
  body.box("glass", 1.5, 0.55, 2.2, 12.6, 3.95, 0, 0, 0, -0.35);
  // High wing, tapered toward the tips.
  const wing = new THREE.BoxGeometry(4.2, 0.55, 40.4, 1, 1, 8);
  const wp = wing.attributes.position as THREE.BufferAttribute;
  for (let i = 0; i < wp.count; i++) {
    const k = 1 - (Math.abs(wp.getZ(i)) / 20.2) * 0.45;
    wp.setX(i, wp.getX(i) * k + (1 - k) * 0.9);
    wp.setY(i, wp.getY(i) * (0.5 + 0.5 * k));
  }
  wing.computeVertexNormals();
  body.add("shell", wing, 1.0, 5.15, 0);
  // Engine nacelles under the wing.
  const engines = [-10.2, -5.3, 5.3, 10.2];
  for (const z of engines) {
    body.cylX("shell2", 0.62, 5.2, 2.9, 4.62, z, 10);
    body.cylX("dark", 0.36, 0.6, 5.7, 4.62, z, 8);
  }
  // Fin and tailplane.
  const fin = new THREE.BoxGeometry(4.0, 6.4, 0.38);
  const fp = fin.attributes.position as THREE.BufferAttribute;
  for (let i = 0; i < fp.count; i++) {
    if (fp.getY(i) > 0) fp.setX(i, fp.getX(i) * 0.55 - 1.3);
  }
  fin.computeVertexNormals();
  body.add("shell", fin, -12.6, 8.7, 0);
  body.box("shell", 2.6, 0.26, 16.2, -13.5, 6.3, 0);
  // Landing gear fairings and wheels.
  for (const s of [-1, 1]) body.block("shell2", 5.6, 1.7, 0.9, -0.2, 0.7, s * 2.25);
  for (const x of [-1.2, 0.9]) for (const s of [-1, 1]) wheel(body, 0.56, 0.45, x, s * 2.0);
  wheel(body, 0.42, 0.3, 11.2, -0.2);
  wheel(body, 0.42, 0.3, 11.2, 0.2);
  // Beacon and landing lights.
  body.box("accent", 0.25, 0.18, 0.25, 2.5, 5.1, 0);
  body.box("lit", 0.2, 0.2, 0.2, 11.4, 1.4, 0);
  for (const z of [-20, 20]) body.box("lit", 0.3, 0.12, 0.12, 1.2, 5.15, z);
  g.add(meshesFor(body.build(), mats, shadows));

  const spinners: Vehicle["spinners"] = [];
  for (const z of engines) {
    const prop = new GeoBag();
    // Four blades running out from the hub (4.1 m diameter).
    for (let b = 0; b < 4; b++) {
      const a = (b * Math.PI) / 2 + 0.4;
      prop.add("dark", new THREE.BoxGeometry(0.06, 2.05, 0.28), 0, Math.cos(a) * 1.025, Math.sin(a) * 1.025, a, 0, 0);
    }
    const geo = prop.build();
    const pivot = new THREE.Group();
    pivot.position.set(6.05, 4.62, z);
    const blades = meshesFor(geo, mats, false);
    blades.children.forEach((c) => (c.castShadow = false));
    pivot.add(blades);
    g.add(pivot);
    spinners.push({ obj: pivot, axis: "x", rate: 0 });
  }

  // Rear ramp, hinged under the upswept tail.
  const ramp = new THREE.Group();
  ramp.position.set(-8.6, 1.05, 0);
  const rb = new GeoBag();
  rb.box("shell2", 3.4, 0.16, 2.9, -1.7, 0, 0);
  rb.box("dark", 3.2, 0.02, 2.6, -1.7, 0.09, 0);
  ramp.add(meshesFor(rb.build(), mats, shadows));
  ramp.rotation.z = -0.3;
  g.add(ramp);
  // The dark cargo opening the ramp uncovers.
  const opening = new GeoBag().box("dark", 3.0, 0.05, 2.8, -10.2, 1.45, 0, 0, 0, 0.25).build();
  const openMesh = meshesFor(opening, mats, false);
  openMesh.visible = false;
  g.add(openMesh);

  return { group: g, spinners, parts: { ramp, opening: openMesh } };
}

// ---- heavy-lift helicopter --------------------------------------------------------------------

/** A CH-47-class tandem-rotor helicopter: 15.5 m fuselage, two 18.3 m rotors, 5.7 m tall. */
export function helicopter(mats: MatSet, shadows: boolean): Vehicle {
  const g = new THREE.Group();
  const b = new GeoBag();
  b.block("shell", 12.4, 2.6, 2.5, -0.2, 0.9, 0);
  // Fuel sponsons along the lower sides.
  for (const s of [-1, 1]) b.block("shell2", 9.0, 1.1, 0.62, -0.6, 0.8, s * 1.55);
  // Nose with the cockpit glazing.
  const nose = new THREE.BoxGeometry(2.0, 2.3, 2.4);
  const np = nose.attributes.position as THREE.BufferAttribute;
  for (let i = 0; i < np.count; i++) if (np.getX(i) > 0) np.setY(i, np.getY(i) * 0.8 - (np.getY(i) > 0 ? 0.35 : -0.15));
  nose.computeVertexNormals();
  b.add("shell", nose, 6.9, 2.1, 0);
  b.box("glass", 1.2, 0.9, 2.42, 7.0, 2.6, 0, 0, 0, -0.5);
  // Pylons: low forward, tall aft.
  b.block("shell", 2.2, 1.1, 1.6, 5.4, 3.5, 0);
  b.block("shell", 3.6, 2.4, 2.0, -5.6, 3.5, 0);
  b.cyl("dark", 0.28, 0.5, 5.6, 4.55, 0, 10);
  b.cyl("dark", 0.28, 0.5, -6.2, 5.85, 0, 10);
  for (const [x, z] of [[4.3, -1.3], [4.3, 1.3], [-3.8, -1.45], [-3.8, 1.45]] as const) wheel(b, 0.42, 0.32, x, z);
  b.box("accent", 0.22, 0.15, 0.22, -1.0, 3.55, 0);
  g.add(meshesFor(b.build(), mats, shadows));

  const rotor = (x: number, y: number, dir: number) => {
    const r = new GeoBag();
    for (let i = 0; i < 3; i++) {
      const a = (i / 3) * Math.PI * 2;
      r.add("dark", new THREE.BoxGeometry(9.15, 0.07, 0.65), Math.cos(a) * 4.575, 0, -Math.sin(a) * 4.575, 0, a);
    }
    const pivot = new THREE.Group();
    pivot.position.set(x, y, 0);
    pivot.add(meshesFor(r.build(), mats, false));
    // Faint disc that reads as motion blur while the blades turn fast.
    const disc = new THREE.Mesh(
      new THREE.CircleGeometry(9.15, 40),
      new THREE.MeshBasicMaterial({ color: 0x0b0f14, transparent: true, opacity: 0, depthWrite: false, side: THREE.DoubleSide }),
    );
    disc.rotation.x = -Math.PI / 2;
    disc.position.set(x, y + 0.02, 0);
    disc.name = "blur";
    g.add(pivot, disc);
    return { pivot, disc, dir };
  };
  const front = rotor(5.6, 5.1, 1);
  const aft = rotor(-6.2, 6.4, -1);
  return {
    group: g,
    spinners: [
      { obj: front.pivot, axis: "y", rate: 0 },
      { obj: aft.pivot, axis: "y", rate: 0 },
    ],
    parts: { blurFront: front.disc, blurAft: aft.disc },
  };
}

// ---- trucks and loads ------------------------------------------------------------------------

/** A medium tactical truck (about 7 × 2.45 × 3.1 m) with a covered bed. */
export function truck(mats: MatSet, shadows: boolean, load: "cover" | "container" | "pallet" = "cover"): Vehicle {
  const g = new THREE.Group();
  const b = new GeoBag();
  b.block("dark", 7.0, 0.35, 1.1, 0, 0.75, 0);
  b.block("shell", 1.9, 1.8, 2.4, 2.4, 1.05, 0);
  b.block("shell", 0.9, 1.05, 2.2, 3.75, 1.05, 0);
  b.box("glass", 0.06, 0.7, 2.1, 3.36, 2.4, 0);
  for (const s of [-1, 1]) b.box("glass", 1.1, 0.6, 0.05, 2.5, 2.35, s * 1.21);
  b.box("lit", 0.05, 0.18, 0.3, 4.21, 1.55, -0.85);
  b.box("lit", 0.05, 0.18, 0.3, 4.21, 1.55, 0.85);
  b.block("dark", 0.2, 0.3, 2.45, 4.25, 0.8, 0);
  if (load === "container") {
    b.block("dark", 6.2, 0.2, 2.3, -1.3, 1.1, 0);
  } else {
    b.block("shell2", 4.6, 0.12, 2.45, -1.0, 1.25, 0);
    for (const s of [-1, 1]) b.block("shell2", 4.6, 0.55, 0.06, -1.0, 1.37, s * 1.2);
    if (load === "cover") {
      // Canvas canopy: the top half of a cylinder lying along x.
      const cover = new THREE.CylinderGeometry(1.25, 1.25, 4.5, 16, 1, false, 0, Math.PI);
      cover.rotateZ(Math.PI / 2);
      b.add("shell2", cover, -1.0, 1.92, 0, 0, 0, 0, 1, 0.75, 1);
      b.block("shell2", 4.5, 0.55, 2.5, -1.0, 1.37, 0);
    } else {
      b.block("shell2", 2.0, 1.4, 2.2, -1.2, 1.37, 0);
      b.block("dark", 2.0, 0.08, 2.24, -1.2, 2.2, 0);
    }
  }
  const wheels = new THREE.Group();
  const wb = new GeoBag();
  for (const x of [2.9, -0.9, -2.35]) for (const s of [-1, 1]) wheel(wb, 0.58, 0.42, x, s * 1.02);
  wheels.add(meshesFor(wb.build(), mats, shadows));
  g.add(meshesFor(b.build(), mats, shadows), wheels);
  return { group: g, spinners: [], parts: { wheels } };
}

/** A 20-ft ISO container (6.06 × 2.44 × 2.59 m), corrugated, standing on y = 0. */
export function container(mats: MatSet, shadows: boolean): THREE.Group {
  const b = new GeoBag();
  const l = 6.058;
  const w = 2.438;
  const h = 2.591;
  b.block("shell", l, h, w);
  const n = 20;
  for (const s of [-1, 1]) for (let i = 0; i < n; i++) b.box("shell2", 0.12, h - 0.34, 0.05, -l / 2 + 0.3 + i * ((l - 0.6) / (n - 1)), h / 2, s * (w / 2 + 0.02));
  for (const sx of [-1, 1]) for (const sz of [-1, 1]) for (const y of [0.09, h - 0.09]) b.box("dark", 0.18, 0.18, 0.18, sx * (l / 2 - 0.08), y, sz * (w / 2 - 0.08));
  for (const z of [-0.85, -0.35, 0.35, 0.85]) b.block("trim", 0.06, h - 0.5, 0.05, l / 2 + 0.03, 0.25, z);
  return meshesFor(b.build(), mats, shadows);
}

/** A light two-wheel trailer with a packed load. */
export function trailer(mats: MatSet, shadows: boolean): THREE.Group {
  const b = new GeoBag();
  b.block("dark", 3.2, 0.18, 2.0, 0, 0.62, 0);
  b.block("dark", 1.6, 0.1, 0.12, 2.3, 0.62, 0);
  b.block("shell2", 2.9, 1.25, 1.9, 0, 0.8, 0);
  b.block("dark", 2.9, 0.06, 1.94, 0, 2.05, 0);
  for (const s of [-1, 1]) wheel(b, 0.45, 0.3, 0, s * 1.05);
  return meshesFor(b.build(), mats, shadows);
}

// ---- over-snow and small vehicles ---------------------------------------------------------------

export function snowmobile(mats: MatSet, shadows: boolean): THREE.Group {
  const b = new GeoBag();
  b.block("accent", 2.0, 0.55, 1.05, 0.2, 0.35, 0);
  b.block("dark", 1.2, 0.3, 0.6, -0.4, 0.9, 0);
  b.box("glass", 0.05, 0.4, 0.8, 1.0, 1.15, 0, 0, 0, -0.5);
  b.block("dark", 1.8, 0.4, 0.55, -0.4, 0.05, 0);
  for (const s of [-1, 1]) b.box("trim", 1.3, 0.05, 0.14, 1.1, 0.04, s * 0.5);
  // Rider.
  b.add("dark", new THREE.CapsuleGeometry(0.22, 0.6, 3, 8), -0.3, 1.45, 0);
  b.add("dark", new THREE.SphereGeometry(0.15, 10, 8), -0.25, 2.0, 0);
  return meshesFor(b.build(), mats, shadows);
}

export function sled(mats: MatSet, shadows: boolean): THREE.Group {
  const b = new GeoBag();
  b.block("trim", 3.0, 0.08, 1.05, 0, 0.18, 0);
  for (const s of [-1, 1]) b.box("trim", 3.2, 0.06, 0.08, 0, 0.06, s * 0.45, 0, 0, 0);
  b.block("shell2", 1.3, 0.55, 0.9, 0.6, 0.26, 0);
  b.block("dark", 1.1, 0.45, 0.85, -0.7, 0.26, 0);
  b.block("accent", 0.5, 0.35, 0.6, -0.7, 0.71, 0.05);
  return meshesFor(b.build(), mats, shadows);
}

export function utilityVehicle(mats: MatSet, shadows: boolean): THREE.Group {
  const b = new GeoBag();
  b.block("shell", 2.2, 0.6, 1.4, 0, 0.55, 0);
  b.block("shell2", 0.9, 0.35, 1.3, -0.6, 1.15, 0);
  for (const x of [-0.85, 0.85]) for (const s of [-1, 1]) wheel(b, 0.36, 0.28, x, s * 0.72);
  b.add("dark", new THREE.CapsuleGeometry(0.22, 0.55, 3, 8), 0.1, 1.6, 0);
  b.add("dark", new THREE.SphereGeometry(0.15, 10, 8), 0.12, 2.12, 0);
  return meshesFor(b.build(), mats, shadows);
}

/** A standing person, 1.8 m, for scale. */
export function figure(mats: MatSet, shadows: boolean, vest = false): THREE.Group {
  const b = new GeoBag();
  // Legs, torso, head: a slim silhouette that still reads as a person at camp scale.
  b.add("dark", new THREE.CapsuleGeometry(0.075, 0.7, 3, 6), 0, 0.43, -0.075);
  b.add("dark", new THREE.CapsuleGeometry(0.075, 0.7, 3, 6), 0, 0.43, 0.075);
  b.add("dark", new THREE.CapsuleGeometry(0.17, 0.4, 3, 8), 0, 1.17, 0, 0, 0, 0, 0.75, 1, 1);
  b.add("dark", new THREE.SphereGeometry(0.105, 10, 8), 0, 1.68, 0);
  if (vest) b.add("accent", new THREE.CylinderGeometry(0.175, 0.175, 0.3, 10), 0, 1.2, 0, 0, 0, 0, 0.76, 1, 1);
  return meshesFor(b.build(), mats, shadows);
}

/** A 463L pallet with a packed, netted load (a shelter waiting to be set up). */
export function palletLoad(mats: MatSet, shadows: boolean): THREE.Group {
  const b = new GeoBag();
  b.block("trim", 2.74, 0.06, 2.235, 0, 0, 0);
  b.block("shell2", 2.4, 1.5, 1.95, 0, 0.06, 0);
  for (let i = 0; i < 4; i++) b.box("dark", 2.44, 0.04, 0.05, 0, 0.3 + i * 0.38, 0.99);
  return meshesFor(b.build(), mats, shadows);
}
