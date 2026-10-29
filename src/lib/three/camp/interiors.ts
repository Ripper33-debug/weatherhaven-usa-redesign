/**
 * Example fit-outs shown when a visitor looks inside the best match on the results: desks and
 * screens for a command post, beds for medical, a vehicle bay for maintenance, bunks for camp
 * life, benches for research, cots for disaster response. Illustrative only; the caption says so.
 *
 * Items are laid out inside the shelter's footprint (long side along x, door at +x) and use the
 * shelter's own materials, so the roof cut also slices anything taller (the vehicle in a
 * maintenance bay), like a section drawing.
 */
import * as THREE from "three";
import type { MissionId } from "@/lib/mission-guide";
import { GeoBag, meshesFor, type MatSet } from "@/lib/three/camp/kit";
import { truck } from "@/lib/three/camp/vehicles";

type Space = { l: number; w: number; round?: boolean };

/** Places items of a given length along a wall, leaving the door end clear. */
function alongWall(space: Space, itemL: number, gap: number, doorClear = 1.3): number[] {
  const from = -space.l / 2 + 0.5;
  const to = space.l / 2 - doorClear;
  const xs: number[] = [];
  for (let x = from + itemL / 2; x + itemL / 2 <= to; x += itemL + gap) xs.push(x);
  return xs;
}

function desk(b: GeoBag, x: number, z: number, facing: 1 | -1) {
  b.box("trim", 1.4, 0.05, 0.7, x, 0.75, z);
  b.block("frame", 0.05, 0.72, 0.6, x - 0.65, 0, z);
  b.block("frame", 0.05, 0.72, 0.6, x + 0.65, 0, z);
  // Screens face into the room.
  b.box("lit", 0.55, 0.34, 0.03, x - 0.32, 1.02, z - facing * 0.22);
  b.box("lit", 0.55, 0.34, 0.03, x + 0.32, 1.02, z - facing * 0.22);
  b.block("dark", 0.46, 0.45, 0.46, x, 0, z + facing * 0.65);
  b.box("dark", 0.46, 0.4, 0.06, x, 0.65, z + facing * 0.86);
}

function bed(b: GeoBag, x: number, z: number, facing: 1 | -1, cot = false) {
  const h = cot ? 0.42 : 0.55;
  b.block("frame", 1.95, h - 0.12, cot ? 0.7 : 0.88, x, 0, z);
  b.block("trim", 1.9, 0.12, cot ? 0.66 : 0.84, x, h - 0.12, z);
  if (!cot) {
    b.box("shell2", 0.4, 0.08, 0.6, x - 0.72, h + 0.04, z);
    // Patient monitor at the head of the bed.
    b.block("frame", 0.06, 1.2, 0.06, x - 1.05, 0, z - facing * 0.3);
    b.box("lit", 0.04, 0.3, 0.4, x - 1.02, 1.25, z - facing * 0.3);
  }
}

function bunk(b: GeoBag, x: number, z: number) {
  for (const y of [0.35, 1.3]) {
    b.box("trim", 1.95, 0.1, 0.85, x, y, z);
    b.box("shell2", 1.9, 0.12, 0.8, x, y + 0.11, z);
  }
  for (const dx of [-0.95, 0.95]) for (const dz of [-0.4, 0.4]) b.block("frame", 0.05, 1.55, 0.05, x + dx, 0, z + dz);
}

function bench(b: GeoBag, x: number, z: number, facing: 1 | -1, len = 1.8) {
  b.box("trim", len, 0.05, 0.75, x, 0.9, z);
  b.block("frame", len, 0.85, 0.7, x, 0, z);
  b.block("lit", 0.32, 0.26, 0.28, x - len * 0.25, 0.93, z - facing * 0.1);
  b.block("dark", 0.4, 0.35, 0.35, x + len * 0.2, 0.93, z - facing * 0.1);
}

function crate(b: GeoBag, x: number, z: number, h = 0.7) {
  b.block("shell2", 1.1, h, 0.8, x, 0, z);
  b.box("dark", 1.12, 0.04, 0.82, x, h * 0.5, z);
}

/** Interior for the mission, in the shelter's local frame. */
export function buildInterior(mission: MissionId | null, space: Space, mats: MatSet, shadows: boolean): THREE.Group {
  const g = new THREE.Group();
  const b = new GeoBag();
  const l = space.round ? space.l * 0.72 : space.l;
  const w = space.round ? space.w * 0.72 : space.w;
  const s: Space = { l, w };
  // Floor, so the cut-away reads as a room.
  b.box("dark", l - 0.25, 0.04, w - 0.25, 0, 0.03, 0);
  const twoSides = w >= 3.2;
  const sides: (1 | -1)[] = twoSides ? [-1, 1] : [-1];

  switch (mission) {
    case "command": {
      for (const side of sides) {
        const z = side * (w / 2 - 0.6);
        for (const x of alongWall(s, 1.4, 0.35)) desk(b, x, z, side === -1 ? 1 : -1);
      }
      if (w >= 4.5 && l >= 5) {
        // Plotting table in the middle, lit from above.
        b.block("frame", 2.6, 0.8, 1.2, -0.3, 0, 0);
        b.box("glass", 2.5, 0.03, 1.1, -0.3, 0.82, 0);
        b.box("lit", 2.3, 0.02, 0.05, -0.3, 0.845, -0.35);
        b.box("lit", 2.3, 0.02, 0.05, -0.3, 0.845, 0.35);
      }
      break;
    }
    case "medical": {
      for (const side of sides) {
        const z = side * (w / 2 - 0.62);
        for (const x of alongWall(s, 1.95, 0.6)) bed(b, x, z, side === -1 ? 1 : -1);
      }
      if (twoSides) crate(b, -l / 2 + 1.2, 0, 0.9);
      break;
    }
    case "maintenance": {
      if (l >= 8 && w >= 5) {
        const t = truck(mats, shadows, "cover");
        t.group.position.set(-0.4, 0, 0);
        g.add(t.group);
        const z = -(w / 2 - 0.55);
        for (const x of alongWall(s, 1.8, 0.4)) bench(b, x, z, 1);
        b.block("accent", 0.8, 1.1, 0.5, l / 2 - 2.2, 0, w / 2 - 0.45);
        b.block("accent", 0.8, 1.1, 0.5, l / 2 - 3.2, 0, w / 2 - 0.45);
      } else {
        for (const side of sides) for (const x of alongWall(s, 1.8, 0.4)) bench(b, x, side * (w / 2 - 0.55), side === -1 ? 1 : -1);
        if (twoSides || l > 4) b.block("dark", 1.0, 0.9, 0.7, 0, 0, twoSides ? 0 : 0.4);
      }
      break;
    }
    case "living": {
      for (const side of sides) {
        const z = side * (w / 2 - 0.55);
        for (const x of alongWall(s, 1.95, 0.5)) bunk(b, x, z);
      }
      if (twoSides) for (const x of alongWall(s, 0.6, 1.8)) b.block("frame", 0.5, 1.5, 0.5, x + 0.8, 0, 0);
      break;
    }
    case "research": {
      for (const side of sides) {
        const z = side * (w / 2 - 0.5);
        for (const x of alongWall(s, 1.8, 0.4)) bench(b, x, z, side === -1 ? 1 : -1);
      }
      if (twoSides) {
        // Core racks down the middle.
        for (const x of alongWall(s, 2.4, 0.9)) {
          b.block("frame", 2.4, 0.9, 0.6, x, 0, 0);
          for (let i = 0; i < 4; i++) b.cylX("trim", 0.05, 2.2, x, 0.95, -0.2 + i * 0.13, 8);
        }
      }
      break;
    }
    case "response":
    default: {
      const rows = Math.max(1, Math.floor((w - 0.6) / 1.15));
      for (let r = 0; r < rows; r++) {
        const z = -w / 2 + 0.75 + r * 1.15;
        for (const x of alongWall(s, 1.95, 0.35)) bed(b, x, z, 1, true);
      }
      crate(b, l / 2 - 0.8, -w / 2 + 0.6);
      break;
    }
  }
  const meshes = meshesFor(b.build(), mats, shadows);
  meshes.children.forEach((c) => (c.receiveShadow = true));
  g.add(meshes);
  return g;
}
