/**
 * Shared pieces for the 3D camp: material slots and colours, the orange scan that builds each
 * structure from the ground up, and a helper that merges many small parts into one mesh per
 * material so a whole shelter costs a handful of draw calls.
 */
import * as THREE from "three";
import { mergeGeometries } from "three/examples/jsm/utils/BufferGeometryUtils.js";

export type MatKey = "shell" | "shell2" | "frame" | "trim" | "dark" | "lit" | "glass" | "accent";

export const SIGNAL = new THREE.Color(0xf18522);

export type Finish = "green" | "tan" | "white";

/** Fabric and paint colours per finish (sRGB hex), close to the TRECC source-model colourways. */
export const FINISH_COLORS: Record<Finish, { shell: number; shell2: number }> = {
  green: { shell: 0x56653f, shell2: 0x46532f },
  tan: { shell: 0xb39a6c, shell2: 0x9c845a },
  white: { shell: 0xe3e7e8, shell2: 0xc9d0d4 },
};

const BASE: Record<MatKey, { color: number; roughness: number; metalness: number; emissive?: number; emissiveIntensity?: number; transparent?: boolean; opacity?: number }> = {
  shell: { color: 0x56653f, roughness: 0.86, metalness: 0 },
  shell2: { color: 0x46532f, roughness: 0.9, metalness: 0 },
  frame: { color: 0x2b3138, roughness: 0.6, metalness: 0.35 },
  trim: { color: 0x9aa3ab, roughness: 0.45, metalness: 0.55 },
  dark: { color: 0x15191e, roughness: 0.85, metalness: 0.1 },
  lit: { color: 0x1a1208, roughness: 0.6, metalness: 0, emissive: 0xffc27a, emissiveIntensity: 2.2 },
  glass: { color: 0x0b1118, roughness: 0.15, metalness: 0.4 },
  accent: { color: 0xf18522, roughness: 0.6, metalness: 0.05 },
};

/** Per-structure build state: a horizontal clipping plane that rises through the model, with an
 * orange glow just under the cut. */
export type Reveal = {
  plane: THREE.Plane;
  uniforms: { uRevealY: { value: number }; uGlow: { value: number } };
  set: (y: number, glow: number) => void;
};

export function makeReveal(): Reveal {
  const plane = new THREE.Plane(new THREE.Vector3(0, -1, 0), 1e4);
  const uniforms = { uRevealY: { value: 1e4 }, uGlow: { value: 0 } };
  return {
    plane,
    uniforms,
    set: (y, glow) => {
      plane.constant = y;
      uniforms.uRevealY.value = y;
      uniforms.uGlow.value = glow;
    },
  };
}

/** Same source text for every material, so three.js compiles one program for all of them. */
function revealCompile(this: { __reveal: Reveal }, shader: THREE.WebGLProgramParametersWithUniforms) {
  const r = this.__reveal;
  shader.uniforms.uRevealY = r.uniforms.uRevealY;
  shader.uniforms.uGlow = r.uniforms.uGlow;
  shader.vertexShader = shader.vertexShader
    .replace("#include <common>", "#include <common>\nvarying float vCampY;")
    .replace("#include <worldpos_vertex>", "#include <worldpos_vertex>\nvCampY = (modelMatrix * vec4(transformed, 1.0)).y;");
  shader.fragmentShader = shader.fragmentShader
    .replace("#include <common>", "#include <common>\nvarying float vCampY;\nuniform float uRevealY;\nuniform float uGlow;")
    .replace(
      "#include <emissivemap_fragment>",
      "#include <emissivemap_fragment>\ntotalEmissiveRadiance += vec3(0.95, 0.42, 0.08) * 2.6 * uGlow * (1.0 - smoothstep(0.0, 0.22, uRevealY - vCampY));",
    );
}

export type MatSet = Record<MatKey, THREE.MeshStandardMaterial>;

/** A fresh set of materials for one structure, tied to its reveal. */
export function makeMats(reveal: Reveal, finish: Finish, opts: { shadows: boolean }): MatSet {
  const out = {} as MatSet;
  for (const key of Object.keys(BASE) as MatKey[]) {
    const b = BASE[key];
    const m = new THREE.MeshStandardMaterial({
      color: b.color,
      roughness: b.roughness,
      metalness: b.metalness,
      emissive: b.emissive ?? 0x000000,
      emissiveIntensity: b.emissiveIntensity ?? 1,
      side: THREE.DoubleSide,
      transparent: b.transparent ?? false,
      opacity: b.opacity ?? 1,
    });
    m.name = key;
    m.clippingPlanes = [reveal.plane];
    m.clipShadows = opts.shadows;
    (m as unknown as { __reveal: Reveal }).__reveal = reveal;
    m.onBeforeCompile = revealCompile as unknown as THREE.Material["onBeforeCompile"];
    out[key] = m;
  }
  setFinish(out, finish);
  return out;
}

export function setFinish(mats: MatSet, finish: Finish) {
  mats.shell.color.setHex(FINISH_COLORS[finish].shell);
  mats.shell2.color.setHex(FINISH_COLORS[finish].shell2);
}

// ---- geometry ---------------------------------------------------------------------------

export type PartGeo = Partial<Record<MatKey, THREE.BufferGeometry>>;

const tmpM = new THREE.Matrix4();
const tmpQ = new THREE.Quaternion();
const tmpE = new THREE.Euler();
const tmpS = new THREE.Vector3();
const tmpP = new THREE.Vector3();

/** Collects transformed parts per material, then merges them. */
export class GeoBag {
  private parts = new Map<MatKey, THREE.BufferGeometry[]>();

  add(key: MatKey, geo: THREE.BufferGeometry, x = 0, y = 0, z = 0, rx = 0, ry = 0, rz = 0, sx = 1, sy = 1, sz = 1): this {
    let g = geo.index ? geo.toNonIndexed() : geo.clone();
    if (g !== geo) geo.dispose();
    for (const name of Object.keys(g.attributes)) if (name !== "position" && name !== "normal") g.deleteAttribute(name);
    if (!g.attributes.normal) g.computeVertexNormals();
    tmpE.set(rx, ry, rz);
    tmpQ.setFromEuler(tmpE);
    tmpM.compose(tmpP.set(x, y, z), tmpQ, tmpS.set(sx, sy, sz));
    g.applyMatrix4(tmpM);
    g = g.index ? g.toNonIndexed() : g;
    const list = this.parts.get(key) ?? [];
    list.push(g);
    this.parts.set(key, list);
    return this;
  }

  /** Box centred on (x, y, z). */
  box(key: MatKey, w: number, h: number, d: number, x = 0, y = 0, z = 0, ry = 0, rx = 0, rz = 0): this {
    return this.add(key, new THREE.BoxGeometry(w, h, d), x, y, z, rx, ry, rz);
  }

  /** Box standing on y0 (bottom face at y0). */
  block(key: MatKey, w: number, h: number, d: number, x = 0, y0 = 0, z = 0, ry = 0): this {
    return this.box(key, w, h, d, x, y0 + h / 2, z, ry);
  }

  /** Vertical cylinder standing on y0. */
  cyl(key: MatKey, r: number, h: number, x = 0, y0 = 0, z = 0, seg = 10, rTop = r): this {
    return this.add(key, new THREE.CylinderGeometry(rTop, r, h, seg), x, y0 + h / 2, z);
  }

  /** Cylinder lying along x, centred on (x, y, z). */
  cylX(key: MatKey, r: number, len: number, x = 0, y = 0, z = 0, seg = 12): this {
    return this.add(key, new THREE.CylinderGeometry(r, r, len, seg), x, y, z, 0, 0, Math.PI / 2);
  }

  /** Cylinder lying along z, centred on (x, y, z). */
  cylZ(key: MatKey, r: number, len: number, x = 0, y = 0, z = 0, seg = 12): this {
    return this.add(key, new THREE.CylinderGeometry(r, r, len, seg), x, y, z, Math.PI / 2, 0, 0);
  }

  merge(other: GeoBag): this {
    for (const [k, list] of other.parts) {
      const mine = this.parts.get(k) ?? [];
      mine.push(...list.map((g) => g.clone()));
      this.parts.set(k, mine);
    }
    return this;
  }

  build(): PartGeo {
    const out: PartGeo = {};
    for (const [k, list] of this.parts) {
      if (list.length === 0) continue;
      const merged = list.length === 1 ? list[0] : mergeGeometries(list, false);
      if (list.length > 1) list.forEach((g) => g.dispose());
      if (merged) {
        merged.computeBoundingSphere();
        out[k] = merged;
      }
    }
    this.parts.clear();
    return out;
  }
}

/** Meshes for a merged part, sharing the cached geometry, with this structure's materials. */
export function meshesFor(part: PartGeo, mats: MatSet, shadows: boolean): THREE.Group {
  const g = new THREE.Group();
  for (const [k, geo] of Object.entries(part) as [MatKey, THREE.BufferGeometry][]) {
    const mesh = new THREE.Mesh(geo, mats[k]);
    mesh.castShadow = shadows && k !== "lit" && k !== "glass";
    mesh.receiveShadow = shadows && (k === "shell" || k === "shell2" || k === "trim");
    g.add(mesh);
  }
  return g;
}

// ---- profiles (cross-sections of fabric buildings, across = z, up = y) ----------------------

export type Profile = [number, number][];

/** Vertical wall to the eave, a rounded shoulder, then a shallow pitch to the peak. */
export function shoulderProfile(w: number, eave: number, peak: number, steps = 7): Profile {
  const half = w / 2;
  const r = Math.min(half * 0.42, (peak - eave) * 1.6, eave * 0.9);
  const pts: Profile = [[-half, 0], [-half, eave - r * 0.4]];
  // Shoulder: quarter ellipse from the wall to the roof slope.
  const sx = -half + r;
  const sy = eave - r * 0.4;
  for (let i = 1; i <= steps; i++) {
    const a = Math.PI - (i / steps) * (Math.PI / 2) * 0.82;
    pts.push([sx + Math.cos(a) * r, sy + Math.sin(a) * r * 1.05]);
  }
  const [lx, ly] = pts[pts.length - 1];
  const slope = (peak - ly) / (0 - lx);
  for (let i = 1; i <= 3; i++) {
    const x = lx + (0 - lx) * (i / 3);
    pts.push([x, ly + slope * (x - lx)]);
  }
  const left = pts.slice(0, -1);
  const mirrored = left.map(([x, y]) => [-x, y] as [number, number]).reverse();
  return [...left, [0, peak], ...mirrored];
}

/** Elliptical arch over short vertical walls (inflatable and tunnel shapes). */
export function roundProfile(w: number, h: number, wall: number, steps = 16): Profile {
  const half = w / 2;
  const pts: Profile = [[-half, 0]];
  if (wall > 0) pts.push([-half, wall]);
  for (let i = 1; i < steps; i++) {
    const a = Math.PI - (i / steps) * Math.PI;
    pts.push([Math.cos(a) * half, wall + Math.sin(a) * (h - wall)]);
  }
  if (wall > 0) pts.push([half, wall]);
  pts.push([half, 0]);
  return pts;
}

/** Pointed (gothic) arch, as used for large-span maintenance shelters. */
export function gothicProfile(w: number, h: number, wall: number, steps = 10): Profile {
  const half = w / 2;
  // Each side is a circular arc from (±half, wall) to (0, h) whose centre sits on y = wall.
  const rise = h - wall;
  const R = (half * half + rise * rise) / (2 * half);
  const left: Profile = [[-half, 0], [-half, wall]];
  const cx = -half + R;
  const a0 = Math.PI;
  const a1 = Math.PI - Math.asin(rise / R);
  for (let i = 1; i <= steps; i++) {
    const a = a0 + (a1 - a0) * (i / steps);
    left.push([cx + Math.cos(a) * R, wall + Math.sin(a) * R]);
  }
  left[left.length - 1] = [0, h];
  const right = left.slice(0, -1).map(([x, y]) => [-x, y] as [number, number]).reverse();
  return [...left, ...right];
}

/** Straight walls and a pitched roof. */
export function pitchedProfile(w: number, eave: number, peak: number): Profile {
  const half = w / 2;
  return [[-half, 0], [-half, eave], [0, peak], [half, eave], [half, 0]];
}

/** Height of a profile at an across position (for placing windows and doors). */
export function profileHeightAt(p: Profile, z: number): number {
  for (let i = 0; i < p.length - 1; i++) {
    const [z0, y0] = p[i];
    const [z1, y1] = p[i + 1];
    if ((z >= z0 && z <= z1) || (z <= z0 && z >= z1)) {
      if (z1 === z0) continue;
      return y0 + ((z - z0) / (z1 - z0)) * (y1 - y0);
    }
  }
  return 0;
}

/** The skin of a fabric building: the profile swept along x, with smooth normals. */
export function profileShell(p: Profile, length: number): THREE.BufferGeometry {
  const n = p.length;
  const pos: number[] = [];
  const nor: number[] = [];
  const idx: number[] = [];
  // Vertex normals from neighbouring segments (outward = to the left of the walking direction).
  const normals = p.map((_, i) => {
    const a = p[Math.max(0, i - 1)];
    const b = p[Math.min(n - 1, i + 1)];
    const dz = b[0] - a[0];
    const dy = b[1] - a[1];
    const l = Math.hypot(dz, dy) || 1;
    return [-dy / l, dz / l];
  });
  for (const x of [-length / 2, length / 2]) {
    p.forEach(([z, y], i) => {
      pos.push(x, y, z);
      nor.push(0, normals[i][1], normals[i][0]);
    });
  }
  for (let i = 0; i < n - 1; i++) {
    const a = i;
    const b = i + 1;
    const c = n + i;
    const d = n + i + 1;
    idx.push(a, b, c, b, d, c);
  }
  const g = new THREE.BufferGeometry();
  g.setAttribute("position", new THREE.Float32BufferAttribute(pos, 3));
  g.setAttribute("normal", new THREE.Float32BufferAttribute(nor, 3));
  g.setIndex(idx);
  return g;
}

/** A flat end wall in the shape of the profile, at x. */
export function profileCap(p: Profile, x: number): THREE.BufferGeometry {
  const shape = new THREE.Shape(p.map(([z, y]) => new THREE.Vector2(z, y)));
  const g = new THREE.ShapeGeometry(shape);
  // ShapeGeometry lies in XY facing +z; turn it to face along x.
  g.rotateY(x > 0 ? Math.PI / 2 : -Math.PI / 2);
  g.translate(x, 0, 0);
  return g;
}

/** A frame arch (rib) following the profile, standing just proud of the skin at x. */
export function profileRib(bag: GeoBag, key: MatKey, p: Profile, x: number, thick: number, depth: number, skip = 0): void {
  for (let i = skip; i < p.length - 1 - skip; i++) {
    const [z0, y0] = p[i];
    const [z1, y1] = p[i + 1];
    const len = Math.hypot(z1 - z0, y1 - y0);
    if (len < 1e-3) continue;
    // Turning the box about x by -ang lines its long (z) side up with the segment.
    const ang = Math.atan2(y1 - y0, z1 - z0);
    // Outward normal of this segment.
    const nz = -(y1 - y0) / len;
    const ny = (z1 - z0) / len;
    bag.box(key, depth, thick, len + thick * 0.6, x, (y0 + y1) / 2 + ny * thick * 0.5, (z0 + z1) / 2 + nz * thick * 0.5, 0, -ang, 0);
  }
}

/** Deterministic pseudo-random numbers (so the same answers always draw the same scene). */
export function rng(seed: number) {
  let s = seed >>> 0 || 1;
  return () => {
    s ^= s << 13;
    s ^= s >>> 17;
    s ^= s << 5;
    return ((s >>> 0) % 100000) / 100000;
  };
}

export const easeOutCubic = (t: number) => 1 - (1 - t) ** 3;
export const easeInOutCubic = (t: number) => (t < 0.5 ? 4 * t * t * t : 1 - (-2 * t + 2) ** 3 / 2);
export const easeOutBack = (t: number) => {
  const c1 = 1.5;
  const c3 = c1 + 1;
  return 1 + c3 * (t - 1) ** 3 + c1 * (t - 1) ** 2;
};
export const clamp01 = (v: number) => Math.min(1, Math.max(0, v));
