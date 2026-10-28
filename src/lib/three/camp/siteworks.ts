/**
 * Site works that show how long a camp is meant to stand: generators, walkways, fuel bladders,
 * lights, gravel pads, a perimeter fence and water tanks. Each duration tier is merged into one
 * set of meshes so it scans in (and out) as a layer.
 */
import * as THREE from "three";
import type { CampProp } from "@/lib/camp-scene-plan";
import { GeoBag, meshesFor, type MatSet } from "@/lib/three/camp/kit";

let glowTex: THREE.Texture | null = null;

/** Soft radial light pool for the ground under lamps. */
function glowTexture(): THREE.Texture {
  if (glowTex) return glowTex;
  const c = document.createElement("canvas");
  c.width = c.height = 64;
  const ctx = c.getContext("2d")!;
  const g = ctx.createRadialGradient(32, 32, 0, 32, 32, 32);
  g.addColorStop(0, "rgba(255,214,160,0.9)");
  g.addColorStop(0.35, "rgba(255,190,120,0.35)");
  g.addColorStop(1, "rgba(255,170,90,0)");
  ctx.fillStyle = g;
  ctx.fillRect(0, 0, 64, 64);
  glowTex = new THREE.CanvasTexture(c);
  glowTex.colorSpace = THREE.SRGBColorSpace;
  return glowTex;
}

export function disposeGlowTexture() {
  glowTex?.dispose();
  glowTex = null;
}

const place = (x: number, z: number, rot: number, lx: number, lz: number): [number, number] => [
  x + lx * Math.cos(rot) + lz * Math.sin(rot),
  z - lx * Math.sin(rot) + lz * Math.cos(rot),
];

export type SiteLayer = { group: THREE.Group; glows: THREE.Mesh[]; height: number };

/** Builds one tier of site works with its own materials (so it can scan as one layer). */
export function buildSiteLayer(props: CampProp[], mats: MatSet, shadows: boolean): SiteLayer {
  const b = new GeoBag();
  const glows: THREE.Mesh[] = [];
  let height = 0.5;
  for (const p of props) {
    switch (p.kind) {
      case "pad":
        b.box("shell2", p.l ?? 6, 0.06, p.w ?? 4, p.x, 0.0, p.z, p.rot);
        break;
      case "walk": {
        const len = p.l ?? 6;
        const n = Math.max(1, Math.round(len / 2.4));
        for (let i = 0; i < n; i++) b.box("shell2", len / n - 0.08, 0.07, p.w ?? 1.2, p.x - len / 2 + (i + 0.5) * (len / n), 0.06, p.z);
        break;
      }
      case "gen": {
        const [x, z] = [p.x, p.z];
        b.block("shell", 1.9, 1.15, 1.0, x, 0, z, p.rot);
        const [gx, gz] = place(x, z, p.rot, 0.97, 0);
        b.box("dark", 0.05, 0.6, 0.7, gx, 0.6, gz, p.rot);
        const [ex, ez] = place(x, z, p.rot, -0.6, 0.2);
        b.cyl("frame", 0.05, 0.5, ex, 1.15, ez, 6);
        height = Math.max(height, 1.7);
        break;
      }
      case "bladder":
        b.add("dark", new THREE.SphereGeometry(1, 14, 8), p.x, 0.32, p.z, 0, p.rot, 0, 3.0, 0.45, 1.7);
        break;
      case "tank":
        b.cyl("shell", 1.3, 2.2, p.x, 0, p.z, 18);
        b.cyl("trim", 1.34, 0.08, p.x, 2.2, p.z, 18);
        b.cyl("frame", 0.06, 0.6, p.x + 1.1, 0, p.z + 0.6, 6);
        height = Math.max(height, 2.4);
        break;
      case "light": {
        const mast = p.id.startsWith("mast");
        const h = mast ? 7.5 : 4.6;
        b.cyl("frame", mast ? 0.09 : 0.06, h, p.x, 0, p.z, 6);
        b.box("trim", 0.9, 0.18, 0.5, p.x, h, p.z);
        b.box("lit", 0.8, 0.06, 0.4, p.x, h - 0.1, p.z);
        if (mast) b.block("dark", 0.8, 0.5, 0.8, p.x, 0, p.z);
        const glow = new THREE.Mesh(
          new THREE.PlaneGeometry(mast ? 18 : 11, mast ? 18 : 11),
          new THREE.MeshBasicMaterial({ map: glowTexture(), transparent: true, depthWrite: false, blending: THREE.AdditiveBlending, opacity: 0, color: 0xffffff }),
        );
        glow.rotation.x = -Math.PI / 2;
        glow.position.set(p.x, 0.05, p.z);
        glow.renderOrder = 2;
        glows.push(glow);
        height = Math.max(height, h + 0.4);
        break;
      }
      case "fence": {
        const len = p.l ?? 10;
        const n = Math.max(1, Math.round(len / 3));
        for (let i = 0; i <= n; i++) {
          const [x, z] = place(p.x, p.z, p.rot, -len / 2 + (i / n) * len, 0);
          b.cyl("frame", 0.045, 2.2, x, 0, z, 5);
        }
        for (const y of [0.6, 1.3, 2.0]) b.box("trim", len, 0.025, 0.025, p.x, y, p.z, p.rot);
        height = Math.max(height, 2.4);
        break;
      }
    }
  }
  const group = meshesFor(b.build(), mats, shadows);
  group.children.forEach((c) => ((c as THREE.Mesh).receiveShadow = true));
  glows.forEach((g) => group.add(g));
  return { group, glows, height };
}
