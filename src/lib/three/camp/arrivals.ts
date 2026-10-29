/**
 * "How will it get there": a short arrival scene beside the camp for each transport answer.
 * Each scene is a group plus an update(t) that poses it t seconds after it starts; t = Infinity
 * (or anything past `duration`) is the settled final state, used for reduced motion.
 */
import * as THREE from "three";
import type { ClimateId } from "@/lib/mission-guide";
import type { CampPlan, TransportSite } from "@/lib/camp-scene-plan";
import { clamp01, easeInOutCubic, easeOutCubic, GeoBag, meshesFor, rng, type MatSet } from "@/lib/three/camp/kit";
import { airlifter, container, figure, helicopter, sled, snowmobile, trailer, truck, utilityVehicle, type Vehicle } from "@/lib/three/camp/vehicles";

export type Arrival = {
  group: THREE.Group;
  /** Seconds until the scene settles. */
  duration: number;
  update: (t: number) => void;
  /** True while something in the scene still moves on its own (rotors winding down). */
  busy: (t: number) => boolean;
  /** Ground the terrain should keep flat (runway, road), in world coordinates. */
  strip?: { minX: number; maxX: number; minZ: number; maxZ: number };
  /** Where the camera should look to include the arrival, and how big it is. */
  focus: { x: number; z: number; r: number };
  /** What the camera follows while the arrival plays (local position), and for how long. */
  subject: () => THREE.Vector3;
  follow: { until: number; dist: number; el: number };
  dispose: () => void;
};

export type ArrivalMats = { vehicle: MatSet; aircraft: MatSet; ground: MatSet; containers: MatSet[] };

/** The leading system in the form it travels in, built by the stage (y = 0 at its base, long
 * side along x). */
export type Cargo = {
  kind: "trecc" | "container" | "pallet" | "bags";
  /** Length along x, for spacing. */
  l: number;
  h: number;
  make: () => THREE.Object3D;
};

const snowy = (c: ClimateId | null) => c === "polar" || c === "cold";

function spin(v: Vehicle, rate: number, dt: number) {
  for (const s of v.spinners) {
    s.obj.rotation[s.axis] += rate * dt * (s.rate || 1);
  }
}

/** A flat strip on the ground (runway, road, pad), slightly above the terrain to avoid fighting it. */
function strip(mats: MatSet, key: "dark" | "trim" | "shell2", l: number, w: number, x: number, z: number, y = 0.03): THREE.Group {
  const g = new GeoBag().box(key, l, 0.04, w, x, y, z).build();
  const m = meshesFor(g, mats, false);
  m.children.forEach((c) => ((c as THREE.Mesh).receiveShadow = true));
  return m;
}

function surfaceMats(base: MatSet, climate: ClimateId | null): MatSet {
  // Runway and road surfaces reuse the ground material set with colours for the climate.
  const s = { ...base };
  const tone = climate === "polar" ? 0xd4dde7 : climate === "cold" ? 0x7b8794 : climate === "hot" ? 0x8a6a48 : climate === "tropical" ? 0x3b3326 : 0x1b2027;
  s.dark = base.dark.clone();
  s.dark.color.setHex(tone);
  s.dark.roughness = 0.95;
  s.dark.userData.owned = true;
  return s;
}

// ---- fixed-wing airlift ------------------------------------------------------------------------

const lerpN = (a: number, b: number, t: number) => a + (b - a) * t;

function airArrival(site: TransportSite, plan: CampPlan, m: ArrivalMats, shadows: boolean, cargo: Cargo): Arrival {
  const g = new THREE.Group();
  const surf = surfaceMats(m.ground, plan.climate);
  const runwayL = 520;
  const runwayW = 34;
  const strips: THREE.Object3D[] = [strip(surf, "dark", runwayL, runwayW, site.x, site.z)];
  // Centreline dashes and edge markers (flags on a skiway, lights elsewhere).
  const marks = new GeoBag();
  for (let x = -runwayL / 2 + 10; x < runwayL / 2; x += 24) marks.box("trim", 9, 0.05, 0.5, site.x + x, 0.06, site.z);
  const edge = new GeoBag();
  for (let x = -runwayL / 2; x <= runwayL / 2; x += 30) {
    for (const s of [-1, 1]) {
      if (snowy(plan.climate)) {
        edge.cyl("dark", 0.025, 1.6, site.x + x, 0, site.z + s * (runwayW / 2 + 1), 4);
        edge.box("accent", 0.02, 0.3, 0.42, site.x + x, 1.45, site.z + s * (runwayW / 2 + 1) + 0.2);
      } else {
        edge.box("lit", 0.3, 0.3, 0.3, site.x + x, 0.15, site.z + s * (runwayW / 2 + 1));
      }
    }
  }
  strips.push(meshesFor(marks.build(), m.vehicle, false), meshesFor(edge.build(), m.vehicle, false));
  g.add(...strips);

  const plane = airlifter(m.aircraft, shadows);
  // Lands heading -x (the model's nose is +x).
  plane.group.rotation.y = Math.PI;
  g.add(plane.group);
  const parkX = site.x - 4;
  // The system itself rolls out of the hold and down the ramp.
  const loads = [0, 1].map((i) => {
    const o = cargo.make();
    o.userData.to = parkX + 15 + cargo.l / 2 + i * (cargo.l + 1.6);
    o.userData.z = site.z + (i ? 1.4 : -1.4) * (cargo.l > 4 ? 0 : 1);
    g.add(o);
    return o;
  });
  // Ground crew by the ramp.
  const crew = new THREE.Group();
  for (let i = 0; i < 3; i++) {
    const f = figure(m.vehicle, shadows, i === 0);
    f.position.set(parkX + 14 + i * 1.3, 0, site.z - 3.6 - (i % 2));
    crew.add(f);
  }
  g.add(crew);

  const D = 7.6;
  let lastT = 0;
  const update = (t: number) => {
    const dt = Math.max(0, Math.min(0.1, t - lastT));
    lastT = t;
    const T = Math.min(t, D + 4);
    // Approach and flare (0–3.2 s), roll-out (3.2–5.6 s), ramp down (5.6–6.6 s).
    let x: number;
    let y: number;
    let pitch = 0;
    if (T < 3.2) {
      const k = T / 3.2;
      x = parkX + 260 - 200 * k;
      y = 46 * (1 - k) ** 1.6;
      pitch = 0.045 + 0.03 * k;
    } else {
      const k = clamp01((T - 3.2) / 2.4);
      x = parkX + 60 - 60 * easeOutCubic(k);
      y = 0;
      pitch = 0.075 * (1 - clamp01((T - 3.2) / 0.5));
    }
    plane.group.position.set(x, y, site.z);
    plane.group.rotation.z = -pitch;
    const propRate = T < 5.6 ? 38 : 38 * Math.max(0, 1 - (T - 5.6) / 2.2);
    spin(plane, propRate, dt || 1 / 60);
    const rk = easeInOutCubic(clamp01((T - 5.6) / 1.0));
    plane.parts.ramp.rotation.z = -0.3 + rk * 0.6;
    plane.parts.opening.visible = rk > 0.05;
    // Unload: from the hold (floor about 1 m up) down the ramp, then out to its spot.
    loads.forEach((o, i) => {
      const k = clamp01((T - 6.5 - i * 0.9) / 1.6);
      o.visible = k > 0;
      const inside = parkX + 6;
      const rampEnd = parkX + 12.2;
      if (k < 0.45) {
        const a = easeInOutCubic(k / 0.45);
        o.position.set(lerpN(inside, rampEnd, a), lerpN(1.0, 0, a), o.userData.z);
      } else {
        const a = easeOutCubic((k - 0.45) / 0.55);
        o.position.set(lerpN(rampEnd, o.userData.to, a), 0, o.userData.z);
      }
    });
    crew.visible = T > 6.2;
  };
  update(0);
  return {
    group: g,
    duration: D + 1.6,
    update,
    subject: () => plane.group.position.clone().setY(plane.group.position.y + 3),
    follow: { until: 6.4, dist: 64, el: 11 },
    busy: (t) => t < D + 2.4,
    strip: { minX: site.x - runwayL / 2, maxX: site.x + runwayL / 2, minZ: site.z - runwayW / 2 - 6, maxZ: site.z + runwayW / 2 + 6 },
    focus: { x: site.x + 4, z: site.z, r: 26 },
    dispose: () => disposeTree(g),
  };
}

// ---- helicopter ---------------------------------------------------------------------------------

function heloArrival(site: TransportSite, plan: CampPlan, m: ArrivalMats, shadows: boolean, cargo: Cargo): Arrival {
  const g = new THREE.Group();
  // Landing zone: a flat pad with an H and edge lights.
  const pad = new GeoBag();
  pad.add("trim", new THREE.CylinderGeometry(11, 11, 0.05, 40), site.x + 4, 0.03, site.z - 3);
  pad.box("dark", 6.5, 0.06, 1.0, site.x + 4, 0.06, site.z - 3 - 2.6);
  pad.box("dark", 6.5, 0.06, 1.0, site.x + 4, 0.06, site.z - 3 + 2.6);
  pad.box("dark", 1.0, 0.06, 6.2, site.x + 4, 0.06, site.z - 3);
  const lights = new GeoBag();
  for (let i = 0; i < 12; i++) {
    const a = (i / 12) * Math.PI * 2;
    lights.box("lit", 0.3, 0.25, 0.3, site.x + 4 + Math.cos(a) * 11.3, 0.12, site.z - 3 + Math.sin(a) * 11.3);
  }
  g.add(meshesFor(pad.build(), surfaceMats(m.ground, plan.climate), false), meshesFor(lights.build(), m.vehicle, false));

  const helo = helicopter(m.vehicle, shadows);
  g.add(helo.group);
  // The system itself, slung underneath.
  const load = cargo.make();
  g.add(load);
  const cable = new THREE.Mesh(new THREE.CylinderGeometry(0.035, 0.035, 1, 5), m.vehicle.dark);
  g.add(cable);

  const drop = new THREE.Vector3(site.x - 10, 0, site.z + 6);
  const land = new THREE.Vector3(site.x + 4, 0, site.z - 3);
  const hang = 9.5;
  const D = 8.2;
  let lastT = 0;
  const update = (t: number) => {
    const dt = Math.max(0, Math.min(0.1, t - lastT));
    lastT = t;
    const T = Math.min(t, D + 4);
    let hx: number;
    let hy: number;
    let hz: number;
    let loadOnGround = false;
    if (T < 3.6) {
      const k = easeOutCubic(T / 3.6);
      hx = drop.x + 150 * (1 - k);
      hy = 2.6 + hang + 36 * (1 - k);
      hz = drop.z - 90 * (1 - k);
    } else if (T < 5.0) {
      const k = easeInOutCubic((T - 3.6) / 1.4);
      hx = drop.x;
      hz = drop.z;
      hy = 2.6 + hang - 2.6 * k;
    } else {
      loadOnGround = true;
      const k = easeInOutCubic(clamp01((T - 5.0) / 2.8));
      hx = drop.x + (land.x - drop.x) * k;
      hz = drop.z + (land.z - drop.z) * k;
      hy = hang * (1 - k) + 0;
      hy = Math.max(0, hy + Math.sin(k * Math.PI) * 2.5);
    }
    helo.group.position.set(hx, hy, hz);
    helo.group.rotation.y = 0.35;
    helo.group.rotation.z = T < 3.6 ? -0.08 * (1 - T / 3.6) : 0;
    if (!loadOnGround) {
      load.position.set(hx, hy - hang, hz);
      const belly = hy + 0.8;
      const top = hy - hang + cargo.h;
      cable.visible = true;
      cable.position.set(hx, (belly + top) / 2, hz);
      cable.scale.set(1, Math.max(0.1, belly - top), 1);
    } else {
      load.position.copy(drop);
      cable.visible = false;
    }
    const rate = T < 7.8 ? 22 : 22 * Math.max(0, 1 - (T - 7.8) / 3.2);
    helo.spinners[0].obj.rotation.y += rate * (dt || 1 / 60);
    helo.spinners[1].obj.rotation.y -= rate * (dt || 1 / 60);
    const blur = Math.min(0.2, (rate / 22) * 0.2);
    ((helo.parts.blurFront as THREE.Mesh).material as THREE.MeshBasicMaterial).opacity = blur;
    ((helo.parts.blurAft as THREE.Mesh).material as THREE.MeshBasicMaterial).opacity = blur;
  };
  update(0);
  return {
    group: g,
    duration: D,
    update,
    busy: (t) => t < D + 3.4,
    focus: { x: site.x - 2, z: site.z, r: 20 },
    subject: () => helo.group.position.clone().setY(helo.group.position.y - (helo.group.position.y > 4 ? hang * 0.45 : -1)),
    follow: { until: 6.2, dist: 44, el: 13 },
    dispose: () => disposeTree(g),
  };
}

// ---- road ---------------------------------------------------------------------------------------

function roadArrival(site: TransportSite, plan: CampPlan, m: ArrivalMats, shadows: boolean, cargo: Cargo): Arrival {
  const g = new THREE.Group();
  const surf = surfaceMats(m.ground, plan.climate);
  const len = 340;
  const end = site.x + 26;
  g.add(strip(surf, "dark", len, 7, end - len / 2, site.z));
  const convoy: { v: Vehicle; tr: THREE.Group | null; to: number }[] = [];
  const onBed = cargo.kind === "container" || cargo.kind === "pallet";
  const gap = onBed ? Math.max(12, cargo.l + 7) : 12;
  const stops = [site.x + gap, site.x, site.x - gap];
  stops.forEach((to, i) => {
    // Containers and pallets ride the truck bed; a TRECC rides its trailer; bags go under canvas.
    const v = truck(m.vehicle, shadows, onBed ? "container" : i === 1 ? "pallet" : "cover");
    let tr: THREE.Group | null = null;
    if (onBed) {
      const o = cargo.make();
      // Just behind the cab (which starts at x = 1.45).
      o.position.set(1.3 - cargo.l / 2, 1.3, 0);
      v.group.add(o);
    } else {
      tr = trailer(m.vehicle, shadows, cargo.kind !== "trecc");
      if (cargo.kind === "trecc") {
        const o = cargo.make();
        o.position.set(0, 0.8, 0);
        tr.add(o);
      }
      g.add(tr);
    }
    g.add(v.group);
    convoy.push({ v, tr, to });
  });
  const D = 5.2;
  const update = (t: number) => {
    const T = Math.min(t, D);
    convoy.forEach(({ v, tr, to }, i) => {
      const k = easeOutCubic(clamp01((T - i * 0.35) / (D - 0.9)));
      const x = to - 130 * (1 - k);
      v.group.position.set(x, 0, site.z + 0.2);
      tr?.position.set(x - 6.0, 0, site.z + 0.2);
    });
  };
  update(0);
  return {
    group: g,
    duration: D,
    update,
    subject: () => convoy[0].v.group.position.clone().setY(1.5),
    follow: { until: 4.4, dist: 30, el: 12 },
    busy: (t) => t < D,
    strip: { minX: end - len, maxX: end, minZ: site.z - 6, maxZ: site.z + 6 },
    focus: { x: site.x, z: site.z, r: 18 },
    dispose: () => disposeTree(g),
  };
}

// ---- ISO containers -----------------------------------------------------------------------------

function seaArrival(site: TransportSite, plan: CampPlan, m: ArrivalMats, shadows: boolean, cargo: Cargo): Arrival {
  const g = new THREE.Group();
  const surf = surfaceMats(m.ground, plan.climate);
  g.add(strip(surf, "dark", 16, 26, site.x, site.z));
  const rand = rng(41);
  const slots: [number, number, number][] = [];
  // Two rows of containers along z, some stacked two high.
  for (let r = 0; r < 2; r++) for (let i = 0; i < 4; i++) slots.push([site.x - 3.2 + r * 6.4 - 0, 0, site.z - 7.5 + i * 3.0]);
  slots.push([site.x - 3.2, 2.62, site.z - 4.5], [site.x - 3.2, 2.62, site.z - 1.5], [site.x + 3.2, 2.62, site.z + 1.5]);
  // A container-built system ships as its own container: those are in its colours.
  const own = new Set(cargo.kind === "container" ? [0, 4, 8] : []);
  const boxes = slots.map(([x, y, z], i) => {
    const mats = m.containers[Math.floor(rand() * m.containers.length)];
    const c = own.has(i) ? cargo.make() : container(mats, shadows);
    c.rotation.y = Math.PI / 2;
    c.position.set(x, y, z);
    c.userData.home = y;
    c.userData.delay = i * 0.22;
    g.add(c);
    return c;
  });
  // A truck bringing one more in.
  const t1 = truck(m.vehicle, shadows, "container");
  const load = cargo.kind === "container" ? cargo.make() : container(m.containers[0], shadows);
  load.position.set(-1.3, 1.3, 0);
  t1.group.add(load);
  g.add(t1.group);
  const D = 5;
  const update = (t: number) => {
    boxes.forEach((c) => {
      const k = clamp01((t - c.userData.delay) / 0.6);
      const e = k < 1 ? 1 - (1 - k) * (1 - k) : 1;
      c.position.y = c.userData.home + (1 - e) * 16;
      c.visible = t >= c.userData.delay;
    });
    const k = easeOutCubic(clamp01((t - 1.2) / 3.4));
    t1.group.rotation.y = Math.PI / 2;
    t1.group.position.set(site.x + 9, 0, site.z + 9 + 110 * (1 - k));
  };
  update(0);
  return {
    group: g,
    duration: D,
    update,
    busy: (t) => t < D,
    focus: { x: site.x + 2, z: site.z, r: 18 },
    subject: () => new THREE.Vector3(site.x + 3, 2, site.z + 2),
    follow: { until: 3.6, dist: 34, el: 18 },
    dispose: () => disposeTree(g),
  };
}

// ---- by hand, sled or snowmobile ----------------------------------------------------------------

function remoteArrival(site: TransportSite, plan: CampPlan, m: ArrivalMats, shadows: boolean, _cargo: Cargo): Arrival {
  const g = new THREE.Group();
  const snow = snowy(plan.climate);
  const lead = new THREE.Group();
  const train: THREE.Object3D[] = [];
  if (snow) {
    const sm = snowmobile(m.vehicle, shadows);
    lead.add(sm);
    for (let i = 0; i < 3; i++) {
      const s = sled(m.vehicle, shadows);
      s.position.set(-3.6 - i * 3.6, 0, 0);
      lead.add(s);
      train.push(s);
    }
  } else {
    const uv = utilityVehicle(m.vehicle, shadows);
    lead.add(uv);
    const tr = trailer(m.vehicle, shadows);
    tr.scale.setScalar(0.7);
    tr.position.set(-3.2, 0, 0);
    lead.add(tr);
  }
  // A small team carrying the rest in by hand.
  const team = new THREE.Group();
  for (let i = 0; i < 4; i++) {
    const f = figure(m.vehicle, shadows, i === 1);
    const pack = new GeoBag().block("shell2", 0.42, 0.55, 0.3, -0.24, 1.0, 0).build();
    f.add(meshesFor(pack, m.vehicle, shadows));
    f.position.set(-2.2 - i * 1.6, 0, 3.2 + (i % 2) * 0.8);
    team.add(f);
  }
  g.add(lead, team);
  const dir = new THREE.Vector3(-0.55, 0, -1).normalize();
  const heading = Math.atan2(-dir.z, dir.x);
  lead.rotation.y = heading;
  team.rotation.y = heading;
  const D = 5.5;
  const update = (t: number) => {
    const k = easeOutCubic(clamp01(t / D));
    const back = 120 * (1 - k);
    lead.position.set(site.x - dir.x * back, 0, site.z - dir.z * back);
    const kt = easeOutCubic(clamp01((t - 0.6) / D));
    const backT = 60 * (1 - kt);
    team.position.set(site.x - dir.x * backT, 0, site.z - dir.z * backT);
  };
  update(0);
  void train;
  void _cargo;
  return {
    group: g,
    duration: D,
    update,
    busy: (t) => t < D + 0.6,
    focus: { x: site.x - 2, z: site.z - 2, r: 12 },
    subject: () => lead.position.clone().setY(1),
    follow: { until: 4.6, dist: 22, el: 14 },
    dispose: () => disposeTree(g),
  };
}

/** Builds the scene around the origin; the stage places the group at the site, and `strip` and
 * `focus` are relative to it. */
export function createArrival(kind: TransportSite["kind"], plan: CampPlan, m: ArrivalMats, shadows: boolean, cargo: Cargo): Arrival {
  const site: TransportSite = { kind, x: 0, z: 0, rot: 0 };
  switch (kind) {
    case "air":
      return airArrival(site, plan, m, shadows, cargo);
    case "helo":
      return heloArrival(site, plan, m, shadows, cargo);
    case "road":
      return roadArrival(site, plan, m, shadows, cargo);
    case "sea":
      return seaArrival(site, plan, m, shadows, cargo);
    case "remote":
      return remoteArrival(site, plan, m, shadows, cargo);
  }
}

/** Frees geometry made for this scene (materials are shared and freed by the stage). */
function disposeTree(root: THREE.Object3D) {
  root.traverse((o) => {
    const mesh = o as THREE.Mesh;
    if (mesh.isMesh) {
      // Cargo built from a cached model (the stowed TRECC) shares its geometry with the stage.
      if (!mesh.userData.shared) mesh.geometry?.dispose();
      const mat = mesh.material as THREE.Material;
      // Shared materials belong to the stage; the blur discs and surface tints belong to the scene.
      if (mat && ((mat as THREE.MeshBasicMaterial).isMeshBasicMaterial || mat.userData.owned)) mat.dispose();
    }
  });
}
