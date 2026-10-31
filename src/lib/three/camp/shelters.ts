/**
 * Simplified models of each Weatherhaven system, drawn to the sizes in camp-scene-plan.ts
 * (published dimensions where they exist). Systems with a detailed model in system-models.ts (the
 * MECC) use it instead and fall back to these if it can't be loaded; the TRECC uses its CAD files. Geometry is built once per kind and shared by every
 * copy in the camp; each copy gets its own materials so it can be scanned in on its own.
 *
 * Long side along x, centred on the origin, standing on y = 0.
 */
import * as THREE from "three";
import { KIND_SIZE, type ModelKind } from "@/lib/camp-scene-plan";
import {
  GeoBag,
  gothicProfile,
  pitchedProfile,
  profileCap,
  profileHeightAt,
  profileRib,
  profileShell,
  roundProfile,
  shoulderProfile,
  type MatKey,
  type MatSet,
  type PartGeo,
  type Profile,
} from "@/lib/three/camp/kit";

export type DeployStyle = "scan" | "expand" | "inflate";

export type MovingPart = {
  geo: PartGeo;
  /** Offsets from the deployed position, keyframed evenly across the expand step (ends at 0). */
  path: [number, number, number][];
};

/** A detailed model's parts for one copy in the camp, posed from packed (0) to deployed (1). */
export type Rig = { root: THREE.Group; pose: (k: number) => void };

export type Look = { color: THREE.Color; metalness: number; roughness: number };
export type KindModel = {
  body: PartGeo;
  moving: MovingPart[];
  l: number;
  w: number;
  h: number;
  style: DeployStyle;
  /** Height for the name tag above the roof. */
  tagY: number;
  /** Detailed models (system-models.ts): builds this copy's parts on its own materials, instead of `body`. */
  rig?: (mats: MatSet, shadows: boolean, opts: { interior: boolean }) => Rig;
  /** Colours the model's own materials give the non-finish keys (trim, frame, dark…). */
  /** The detailed model's own colour and sheen for each slot except shell and shell2 (they take the finish). */
  looks?: Partial<Record<MatKey, Look>>;
  /** The model keeps its own fabric colour (shell2) whatever the climate. */
  ownFinish?: boolean;
  /** Floor height inside, for the example fit-out. */
  floorY?: number;
};

const CORNER = 0.18;

/** ISO-style corner castings on a box. */
function castings(bag: GeoBag, l: number, w: number, h: number, x = 0, z = 0) {
  for (const sx of [-1, 1])
    for (const sz of [-1, 1])
      for (const y of [CORNER / 2, h - CORNER / 2]) bag.box("dark", CORNER, CORNER, CORNER, x + sx * (l / 2 - CORNER / 2 + 0.01), y, z + sz * (w / 2 - CORNER / 2 + 0.01));
}

/** Vertical corrugation on the two long faces of a box. */
function corrugate(bag: GeoBag, key: "shell" | "shell2", l: number, w: number, h: number, x = 0, z = 0, faces: (1 | -1)[] = [-1, 1]) {
  const n = Math.floor((l - 0.5) / 0.3);
  for (const s of faces) {
    for (let i = 0; i < n; i++) {
      const px = x - (n - 1) * 0.15 + i * 0.3;
      bag.box(key, 0.12, h - 0.34, 0.05, px, h / 2, z + s * (w / 2 + 0.02));
    }
  }
}

function windowsAlong(bag: GeoBag, l: number, z: number, y: number, every: number, size: [number, number] = [0.7, 0.5]) {
  const n = Math.max(1, Math.floor(l / every));
  for (let i = 0; i < n; i++) {
    const x = -l / 2 + (i + 0.5) * (l / n);
    bag.box("lit", size[0], size[1], 0.05, x, y, z);
  }
}

// ---- expanding containers ---------------------------------------------------------------

function expandingContainer(kind: "mecc" | "bmecc" | "ehmecc"): KindModel {
  const s = KIND_SIZE[kind];
  const coreW = 2.438;
  const baseH = 2.438;
  const l = s.l;
  const tall = kind === "ehmecc";
  const h = s.h;
  const wingD = (s.w - coreW) / 2;

  const core = new GeoBag();
  core.block("shell", l, baseH, coreW);
  castings(core, l, coreW, baseH);
  // End details: personnel door at +x, an environmental control unit at -x.
  core.block("dark", 0.9, 2.0, 0.06, l / 2 + 0.03, 0.12, 0.4, Math.PI / 2);
  core.block("lit", 0.42, 0.32, 0.07, l / 2 + 0.04, 1.6, 0.4, Math.PI / 2);
  core.block("trim", 0.5, 0.9, 1.1, -l / 2 - 0.25, 0.9, -0.3);
  core.block("dark", 0.06, 0.6, 0.8, -l / 2 - 0.51, 1.05, -0.3);
  if (!tall) core.box("shell2", l - 0.1, 0.06, coreW - 0.1, 0, baseH + 0.03, 0);

  const moving: MovingPart[] = [];
  const lift = h - baseH;
  if (tall) {
    // Raised roof section over the core.
    const upper = new GeoBag();
    upper.block("shell", l, lift, coreW, 0, baseH, 0);
    upper.box("shell2", l - 0.1, 0.06, coreW - 0.1, 0, h + 0.03, 0);
    castings(upper, l, coreW, lift, 0, 0);
    moving.push({ geo: upper.build(), path: [[0, -lift, 0], [0, 0, 0], [0, 0, 0]] });
  }
  for (const side of [-1, 1] as const) {
    const wing = new GeoBag();
    const wz = side * (coreW / 2 + wingD / 2);
    const wh = tall ? h - 0.06 : baseH - 0.08;
    wing.block("shell", l - 0.08, wh - 0.14, wingD, 0, 0.14, wz);
    wing.block("dark", l - 0.04, 0.14, wingD + 0.02, 0, 0, wz);
    // Roof with a slight fall to the outside.
    wing.box("shell2", l - 0.02, 0.07, wingD + 0.06, 0, wh + 0.02, wz, 0, side * 0.035, 0);
    windowsAlong(wing, l - 1.2, wz + side * (wingD / 2 + 0.03), wh * 0.58, 2.2);
    // Wing end walls get a door on one side.
    if (side === 1) wing.block("dark", 0.06, 2.0, 0.9, l / 2 + 0.01, 0.14, wz + side * 0.2);
    // Stowed, the wing sits wholly inside the core.
    const zin = side * -(wingD + 0.02);
    moving.push({
      geo: wing.build(),
      path: tall ? [[0, -lift, zin], [0, 0, zin], [0, 0, 0]] : [[0, 0, zin], [0, 0, zin], [0, 0, 0]],
    });
  }
  return { body: core.build(), moving, l, w: s.w, h, style: "expand", tagY: h + 0.9 };
}

/** Telescoping along x: a core with an end section that slides out each way. */
function telescoping(kind: "ateps" | "hercon"): KindModel {
  const s = KIND_SIZE[kind];
  const coreL = kind === "ateps" ? 84 * 0.0254 : 2.438;
  const ext = (s.l - coreL) / 2;
  const core = new GeoBag();
  if (kind === "ateps") {
    // 463L pallet under the core.
    core.block("trim", 2.235, 0.06, 2.743, 0, 0, 0);
    core.block("shell", coreL, s.h - 0.08, s.w, 0, 0.06, 0);
  } else {
    core.block("shell", coreL, s.h, s.w, 0, 0, 0);
  }
  core.box("shell2", coreL - 0.06, 0.06, s.w - 0.06, 0, s.h + 0.02, 0);
  castings(core, coreL, s.w, s.h);
  core.block("dark", 0.06, 2.0, 0.9, 0, 0.1, s.w / 2 + 0.02, Math.PI / 2);
  const moving: MovingPart[] = [];
  for (const side of [-1, 1] as const) {
    const b = new GeoBag();
    const cx = side * (coreL / 2 + ext / 2);
    b.block("shell", ext - 0.04, s.h - 0.16, s.w - 0.1, cx, 0.08, 0);
    b.block("dark", ext - 0.04, 0.08, s.w - 0.06, cx, 0, 0);
    b.box("shell2", ext, 0.06, s.w - 0.04, cx, s.h - 0.05, 0);
    windowsAlong(b, ext - 0.6, s.w / 2 - 0.02, 1.5, 1.4, [0.6, 0.45]);
    b.box("lit", 0.6, 0.45, 0.05, cx, 1.5, -(s.w / 2 - 0.02));
    if (side === 1) b.block("trim", 0.45, 0.8, 0.9, cx + ext / 2 + 0.22, 0.9, 0);
    // Stowed, the section slides wholly inside the core.
    moving.push({ geo: b.build(), path: [[-side * ext, 0, 0], [-side * ext, 0, 0], [0, 0, 0]] });
  }
  return { body: core.build(), moving, l: s.l, w: s.w, h: s.h, style: "expand", tagY: s.h + 0.9 };
}

function isoModule(): KindModel {
  const s = KIND_SIZE.iso;
  const b = new GeoBag();
  b.block("shell", s.l, s.h, s.w);
  corrugate(b, "shell2", s.l, s.w, s.h);
  castings(b, s.l, s.w, s.h);
  // Cargo doors with lock bars on +x, a fitted personnel door and ECU on the side.
  b.block("shell2", 0.05, s.h - 0.3, s.w - 0.2, s.l / 2 + 0.02, 0.15, 0);
  for (const z of [-0.85, -0.35, 0.35, 0.85]) b.block("trim", 0.06, s.h - 0.5, 0.05, s.l / 2 + 0.06, 0.25, z);
  b.block("dark", 0.9, 2.0, 0.06, 1.2, 0.2, s.w / 2 + 0.05);
  b.box("lit", 0.6, 0.4, 0.06, -0.8, 1.65, s.w / 2 + 0.05);
  b.block("trim", 0.9, 0.7, 0.5, -1.8, 1.3, s.w / 2 + 0.3);
  return { body: b.build(), moving: [], l: s.l, w: s.w, h: s.h, style: "scan", tagY: s.h + 0.9 };
}

// ---- fabric buildings ------------------------------------------------------------------------

type FabricOpts = {
  profile: Profile;
  l: number;
  ribEvery: number;
  ribKey?: "frame" | "trim" | "shell2";
  ribThick?: number;
  /** Door on the +x end: width, height. */
  door?: [number, number];
  bigDoor?: [number, number];
  windows?: { y: number; every: number };
  stove?: boolean;
};

function fabric(o: FabricOpts): GeoBag {
  const b = new GeoBag();
  const p = o.profile;
  const w = Math.max(...p.map(([z]) => z)) * 2;
  const h = Math.max(...p.map(([, y]) => y));
  b.add("shell", profileShell(p, o.l));
  b.add("shell2", profileCap(p, o.l / 2));
  b.add("shell2", profileCap(p, -o.l / 2));
  const n = Math.max(1, Math.round(o.l / o.ribEvery));
  for (let i = 0; i <= n; i++) {
    const x = -o.l / 2 + (i / n) * o.l;
    profileRib(b, o.ribKey ?? "shell2", p, x + (i === 0 ? 0.04 : i === n ? -0.04 : 0), o.ribThick ?? 0.07, 0.1);
  }
  // Base strip / skirt.
  for (const s of [-1, 1]) b.box("dark", o.l, 0.16, 0.05, 0, 0.08, s * (w / 2 + 0.03));
  if (o.door) {
    const [dw, dh] = o.door;
    b.block("dark", 0.08, dh, dw, o.l / 2 + 0.04, 0, 0);
    b.box("lit", 0.09, 0.32, dw * 0.6, o.l / 2 + 0.05, dh - 0.35, 0);
    b.block("dark", 0.08, Math.min(dh, h * 0.75), dw * 0.9, -o.l / 2 - 0.04, 0, 0);
  }
  if (o.bigDoor) {
    const [dw, dh] = o.bigDoor;
    // An open vehicle door: a dark interior with work lights inside.
    b.block("dark", 0.05, dh, dw, o.l / 2 + 0.03, 0, 0);
    b.box("lit", 0.06, 0.12, dw * 0.8, o.l / 2 + 0.05, dh * 0.82, 0);
    b.box("lit", 0.06, 0.06, dw * 0.9, o.l / 2 + 0.05, 0.04, 0);
    b.block("frame", 0.12, 0.14, dw + 0.3, o.l / 2 + 0.06, dh, 0);
    for (const s of [-1, 1]) b.block("frame", 0.12, dh, 0.14, o.l / 2 + 0.06, 0, s * (dw / 2 + 0.07));
  }
  if (o.windows) {
    const { y, every } = o.windows;
    for (const s of [-1, 1]) {
      const wz = Math.abs(p[1][0]) - 0.0;
      const hz = profileHeightAt(p, s * (w / 2 - 0.01));
      if (y + 0.3 > Math.max(hz, p[1][1])) continue;
      windowsAlong(b, o.l - 1.5, s * (wz + 0.035), y, every, [0.8, 0.45]);
    }
  }
  if (o.stove) {
    b.cyl("frame", 0.07, 0.9, -o.l * 0.25, profileHeightAt(p, w * 0.22) - 0.1, w * 0.22, 8);
    b.cyl("dark", 0.11, 0.12, -o.l * 0.25, profileHeightAt(p, w * 0.22) + 0.78, w * 0.22, 8);
  }
  return b;
}

function series4(kind: "series4-26" | "series4-12"): KindModel {
  const s = KIND_SIZE[kind];
  const big = kind === "series4-26";
  const p = shoulderProfile(s.w, big ? 3.0 : 1.45, s.h);
  const b = fabric({
    profile: p,
    l: s.l,
    ribEvery: big ? 2.44 : 2.44,
    ribKey: "shell2",
    door: big ? undefined : [0.95, 1.85],
    bigDoor: big ? [4.6, 3.6] : undefined,
    windows: { y: big ? 2.0 : 1.05, every: big ? 2.4 : 2.2 },
  });
  if (big) b.block("dark", 0.08, 2.0, 0.95, -s.l / 2 - 0.04, 0, 1.6);
  return { body: b.build(), moving: [], l: s.l, w: s.w, h: s.h, style: "scan", tagY: s.h + 1 };
}

function rdmss(): KindModel {
  const s = KIND_SIZE.rdmss;
  const p = shoulderProfile(s.w, 2.3, s.h);
  const b = fabric({ profile: p, l: s.l, ribEvery: s.l / 4, ribKey: "frame", ribThick: 0.09, door: [1.2, 2.0], windows: { y: 1.25, every: 1.6 } });
  // Side door into the module run.
  b.block("dark", 1.2, 2.0, 0.08, -s.l * 0.12, 0, s.w / 2 + 0.05);
  return { body: b.build(), moving: [], l: s.l, w: s.w, h: s.h, style: "scan", tagY: s.h + 1 };
}

function mts(): KindModel {
  const s = KIND_SIZE.mts;
  const p = pitchedProfile(s.w, 2.0, s.h);
  const b = fabric({ profile: p, l: s.l, ribEvery: 2, ribKey: "frame", ribThick: 0.06, door: [1.2, 1.9], windows: { y: 1.4, every: 2 } });
  // Environmental control unit beside the end wall.
  b.block("trim", 1.0, 1.1, 0.9, -s.l / 2 - 0.9, 0, -1.4);
  b.box("frame", 0.25, 0.25, 0.8, -s.l / 2 - 0.25, 1.0, -1.4, 0);
  return { body: b.build(), moving: [], l: s.l, w: s.w, h: s.h, style: "scan", tagY: s.h + 1 };
}

function mex26(): KindModel {
  const s = KIND_SIZE.mex26;
  const p = gothicProfile(s.w, s.h, 1.4);
  const b = fabric({ profile: p, l: s.l, ribEvery: 1.52, ribKey: "trim", ribThick: 0.1, bigDoor: [5.4, 4.3] });
  b.block("dark", 0.08, 2.0, 0.95, -s.l / 2 - 0.04, 0, 2.2);
  return { body: b.build(), moving: [], l: s.l, w: s.w, h: s.h, style: "scan", tagY: s.h + 1 };
}

function airmax(kind: "airmax-lp" | "airmax-hp"): KindModel {
  const s = KIND_SIZE[kind];
  const p = kind === "airmax-lp" ? roundProfile(s.w, s.h, 0.9, 18) : roundProfile(s.w, s.h, 2.3, 18);
  const b = new GeoBag();
  b.add("shell", profileShell(p, s.l));
  b.add("shell2", profileCap(p, s.l / 2));
  b.add("shell2", profileCap(p, -s.l / 2));
  // Airbeams: fat tubes over the skin every 2 m.
  const n = Math.round(s.l / 2);
  for (let i = 0; i <= n; i++) {
    const x = -s.l / 2 + 0.16 + (i / n) * (s.l - 0.32);
    profileRib(b, "shell2", p, x, 0.26, 0.3);
  }
  b.block("dark", 0.08, 1.95, 1.3, s.l / 2 + 0.04, 0, 0);
  b.box("lit", 0.09, 0.3, 0.8, s.l / 2 + 0.05, 1.7, 0);
  for (const sd of [-1, 1]) b.box("dark", s.l, 0.2, 0.06, 0, 0.1, sd * (s.w / 2 + 0.03));
  return { body: b.build(), moving: [], l: s.l, w: s.w, h: s.h, style: "inflate", tagY: s.h + 1 };
}

function polarhaven(): KindModel {
  const s = KIND_SIZE.polarhaven;
  const p = roundProfile(s.w, s.h, 0.75, 16);
  const b = fabric({ profile: p, l: s.l, ribEvery: 1.22, ribKey: "trim", ribThick: 0.05, door: [0.85, 1.75], stove: true });
  // Vestibule over the door.
  const vp = roundProfile(1.5, 1.95, 0.4, 10);
  b.add("shell2", profileShell(vp, 1.0), s.l / 2 + 0.5);
  b.add("shell2", profileCap(vp, 0.5), s.l / 2 + 0.5);
  b.box("lit", 0.06, 0.35, 0.5, s.l / 2 + 1.03, 1.35, 0);
  return { body: b.build(), moving: [], l: s.l, w: s.w, h: s.h, style: "scan", tagY: s.h + 0.9 };
}

function polarChief(): KindModel {
  const s = KIND_SIZE["polar-chief"];
  const flats = s.w / 2;
  const R = flats / Math.cos(Math.PI / 8);
  const eave = 6.3 * 0.3048;
  const b = new GeoBag();
  b.add("shell", new THREE.CylinderGeometry(R, R, eave, 8, 1, true), 0, eave / 2, 0, 0, Math.PI / 8);
  b.add("shell2", new THREE.ConeGeometry(R, s.h - eave, 8, 1, true), 0, eave + (s.h - eave) / 2, 0, 0, Math.PI / 8);
  // Frame at the eight corners and around the eave.
  for (let i = 0; i < 8; i++) {
    const a = (i / 8) * Math.PI * 2 + Math.PI / 8;
    b.block("trim", 0.06, eave, 0.06, Math.sin(a) * R, 0, Math.cos(a) * R);
  }
  b.add("trim", new THREE.TorusGeometry(R, 0.04, 4, 8), 0, eave, 0, Math.PI / 2, 0, Math.PI / 8);
  // Door on +x with a lit window, and a stovepipe.
  b.block("dark", 0.08, 1.8, 0.9, flats + 0.03, 0, 0);
  b.box("lit", 0.09, 0.3, 0.5, flats + 0.04, 1.5, 0);
  b.cyl("frame", 0.07, 1.2, -0.8, s.h - 0.55, 0.5, 8);
  return { body: b.build(), moving: [], l: s.l, w: s.w, h: s.h, style: "scan", tagY: s.h + 0.9 };
}

function endurance(): KindModel {
  const s = KIND_SIZE.endurance;
  const p = roundProfile(s.w, s.h, 0.25, 14);
  const b = fabric({ profile: p, l: s.l, ribEvery: s.l / 3, ribKey: "frame", ribThick: 0.05 });
  // Clamshell end, partly open, with light inside.
  b.block("lit", 0.04, 1.2, 0.9, s.l / 2 + 0.03, 0.05, 0);
  // Ballast skirt.
  for (const sd of [-1, 1]) b.box("shell2", s.l + 0.2, 0.05, 0.45, 0, 0.03, sd * (s.w / 2 + 0.2));
  return { body: b.build(), moving: [], l: s.l, w: s.w, h: s.h, style: "scan", tagY: s.h + 0.9 };
}

/** Builds the shared geometry for a kind. The TRECC uses its CAD model instead (see campStage). */
export function buildKind(kind: Exclude<ModelKind, "trecc">): KindModel {
  switch (kind) {
    case "mecc":
    case "bmecc":
    case "ehmecc":
      return expandingContainer(kind);
    case "ateps":
    case "hercon":
      return telescoping(kind);
    case "iso":
      return isoModule();
    case "series4-26":
    case "series4-12":
      return series4(kind);
    case "rdmss":
      return rdmss();
    case "mts":
      return mts();
    case "mex26":
      return mex26();
    case "airmax-lp":
    case "airmax-hp":
      return airmax(kind);
    case "polarhaven":
      return polarhaven();
    case "polar-chief":
      return polarChief();
    case "endurance":
      return endurance();
  }
}

/** Stand-in while the TRECC model loads (and if it can't): a box with its deployed size. */
export function treccStandIn(): KindModel {
  const s = KIND_SIZE.trecc;
  const b = new GeoBag();
  b.block("shell", s.l, 2.05, s.w, 0, 0.25, 0);
  b.block("dark", s.l * 0.9, 0.25, s.w * 0.9);
  return { body: b.build(), moving: [], l: s.l, w: s.w, h: 2.35, style: "scan", tagY: 3.2 };
}

/** The scan frame drawn around a structure's footprint while it builds. */
export function scanFrame(l: number, w: number): THREE.BufferGeometry {
  const hx = l / 2 + 0.25;
  const hz = w / 2 + 0.25;
  const pts = [
    [-hx, -hz], [hx, -hz], [hx, -hz], [hx, hz], [hx, hz], [-hx, hz], [-hx, hz], [-hx, -hz],
  ].flatMap(([x, z]) => [x, 0, z]);
  const g = new THREE.BufferGeometry();
  g.setAttribute("position", new THREE.Float32BufferAttribute(pts, 3));
  return g;
}
