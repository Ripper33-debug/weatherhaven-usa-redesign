/**
 * The 3D camp beside the mission builder's questions. Framework-free: the React component hands
 * it a CampPlan (from camp-scene-plan.ts) after every answer and it works out what changed.
 *
 * New shelters scan in from the ground up with the same orange scan as the homepage TRECC,
 * expanding containers then open their wings, inflatables puff up; shelters that no longer fit
 * scan back down. The climate cross-fades sky, terrain, light and weather; the transport answer
 * plays a short arrival; the duration answer adds site works. The camera moves to show whatever
 * the last answer changed, and sweeps around the finished camp on the results.
 *
 * Systems with a detailed model in system-models.ts (the MECC so far) load it when the camp first
 * needs that kind: Draco files through /assets/draco-ar/, one geometry per node shared by every
 * copy. The walls fold down on their real hinges and the expansions open out from the container
 * edge; the packed file rides in on the arrival. If a file fails to load the simplified model
 * stands in. The TRECC keeps its own camp files.
 *
 * Renders only while something moves, and not at all while off screen.
 */
import * as THREE from "three";
import { GLTFLoader } from "three/examples/jsm/loaders/GLTFLoader.js";
import { withImageTextures } from "@/lib/three/gltfImageTextures";
import { MeshoptDecoder } from "three/examples/jsm/libs/meshopt_decoder.module.js";
import { DRACOLoader } from "three/examples/jsm/loaders/DRACOLoader.js";
import { mergeGeometries } from "three/examples/jsm/utils/BufferGeometryUtils.js";
import { RoomEnvironment } from "three/examples/jsm/environments/RoomEnvironment.js";
import { KIND_FOR_SLUG, KIND_SIZE, type CampPlan, type CampProp, type CampUnit, type ModelKind } from "@/lib/camp-scene-plan";
import { SYSTEM_MODELS, fitoutForMission, type SystemModel } from "@/lib/system-models";
import type { DurationId } from "@/lib/mission-guide";
import {
  clamp01,
  easeInOutCubic,
  easeOutBack,
  easeOutCubic,
  FINISH_COLORS,
  makeMats,
  makeReveal,
  meshesFor,
  type Finish,
  type MatKey,
  type MatSet,
  type PartGeo,
  type Reveal,
} from "@/lib/three/camp/kit";
import { buildKind, scanFrame, treccStandIn, type KindModel, type Look, type Rig } from "@/lib/three/camp/shelters";
import { CLIMATES, createEnvironment, createProps, createWeather, mixPreset, type Avoid, type ClimateKey, type ClimatePreset, type Weather } from "@/lib/three/camp/environment";
import { livePreset } from "@/lib/three/camp/live-preset";
import type { LiveConditions } from "@/lib/live-site";
import { createArrival, type Arrival, type ArrivalMats, type Cargo } from "@/lib/three/camp/arrivals";
import { bagsLoad, container, figure, palletShelter } from "@/lib/three/camp/vehicles";
import { buildSiteLayer, disposeGlowTexture, type SiteLayer } from "@/lib/three/camp/siteworks";
import { buildInterior } from "@/lib/three/camp/interiors";

export const TRECC_CAMP_MODEL = "/models/trecc-camp.glb";
export const TRECC_STOWED_MODEL = "/models/trecc-stowed-camp.glb";
/** Size of each detailed model's packed file (length along the camp's x, height) and how it travels. */
const PACKED: Partial<Record<ModelKind, { kind: Cargo["kind"]; l: number; h: number }>> = {
  mecc: { kind: "container", l: 6.23, h: 2.56 },
  ehmecc: { kind: "container", l: 6.23, h: 2.56 },
  hercon: { kind: "container", l: 6.22, h: 2.56 },
  ateps: { kind: "pallet", l: 2.75, h: 2.4 },
  mts: { kind: "pallet", l: 2.78, h: 1.47 },
  rdmss: { kind: "pallet", l: 2.78, h: 1.47 },
  mex26: { kind: "pallet", l: 2.78, h: 1.47 },
  "series4-26": { kind: "bags", l: 2.48, h: 1.23 },
  polarhaven: { kind: "bags", l: 2.24, h: 1.08 },
  "polar-chief": { kind: "bags", l: 2.24, h: 1.08 },
  endurance: { kind: "bags", l: 3.41, h: 0.84 },
};

/** Draco decoder for the detailed models (the same files the /ar page uses). */
export const DRACO_PATH = "/assets/draco-ar/";

/** The detailed model for a camp kind, if system-models.ts has one (the TRECC keeps its camp files). */
export function detailedModelFor(kind: ModelKind): SystemModel | null {
  if (kind === "trecc") return null;
  const slug = Object.keys(KIND_FOR_SLUG).find((k) => KIND_FOR_SLUG[k] === kind);
  return (slug && SYSTEM_MODELS[slug]) || null;
}

/** Which of the camp's material slots each of a detailed model's materials goes to. Paint and
 * fabric take the camp's finish; everything else keeps the model's own colour. */
function slotFor(name: string, sm: SystemModel): MatKey {
  if (sm.finishMaterials?.paint.includes(name)) return "shell";
  if (sm.finishMaterials?.fabric.includes(name)) return "shell2";
  // Shelters made in their own colours (the polar ones) keep their fabric colour.
  if (!sm.finishMaterials && /fabric|gore|band/.test(name)) return "shell2";
  if (/light|lamp/.test(name)) return "lit";
  if (/glass/.test(name)) return "glass";
  if (/^(red|yellow|orange)$/.test(name)) return "accent";
  if (/alu|galv|stainless|steel|metal|chrome|plate|grey|gray/.test(name)) return "trim";
  // Interior panels and liners are the only light surfaces; stencils, holes and rubber are dark.
  if (/panel|liner|interior/.test(name)) return "frame";
  return "dark";
}

type DetailedNode = {
  name: string;
  geo: PartGeo;
  position: THREE.Vector3;
  quaternion: THREE.Quaternion;
  role: "static" | "hinge" | "unfold" | "interior" | "hidden";
  /** Hinges: rotation about z packed and deployed. Unfolds: the hinge line's x. */
  from?: number;
  to?: number;
  pivotX?: number;
};

export type CampFocus = "empty" | "mission" | "climate" | "people" | "transport" | "duration" | "results" | "overview";

export type TagPos = { unitId: string; x: number; y: number; visible: boolean };

export type CampStageOptions = {
  mobile: boolean;
  reduced: boolean;
  maxDpr: number;
  shadows?: boolean;
  onTags?: (tags: TagPos[]) => void;
  onPick?: (slug: string) => void;
  /** Fires when the pointer moves over (or off) a shelter in the finished camp. */
  onHover?: (unitId: string | null) => void;
  /** Fires when the look-inside view opens or closes (including when a new plan closes it). */
  onInside?: (on: boolean) => void;
};

export type CampStage = {
  setPlan: (plan: CampPlan, focus: CampFocus, opts?: { instant?: boolean }) => void;
  setActive: (on: boolean) => void;
  resize: () => void;
  dispose: () => void;
  /** For tests: true while anything is still animating. */
  isBusy: () => boolean;
  /** Cuts the roof off the best match and shows an example fit-out (results only). Returns
   * whether the view is open afterwards. */
  setInside: (on: boolean) => boolean;
  /** A JPEG of the current view, at most `width` pixels wide. */
  snapshot: (width: number) => string | null;
  /** Real conditions at the chosen place (weather, sun, day or night), or null for the preset. */
  setLive: (live: LiveConditions | null) => void;
};

type Struct = {
  unit: CampUnit;
  root: THREE.Group;
  mats: MatSet;
  reveal: Reveal;
  frame: THREE.LineSegments;
  model: KindModel | null;
  moving: { obj: THREE.Object3D; path: [number, number, number][] }[];
  /** Detailed models: poses the copy from packed (0) to deployed (1). */
  pose?: (k: number) => void;
  keepColors: boolean;
  /** Current reveal height (for scanning back down from wherever it got to). */
  y: number;
  removed: boolean;
};

type ArrivalState = { group: THREE.Group; arrival: Arrival; kind: string; start: number; climate: string; lead: string };

type Tween = { start: number; dur: number; update: (k: number) => void; done?: () => void; key?: string };

const lerp = (a: number, b: number, t: number) => a + (b - a) * t;
const TIERS: DurationId[] = ["rapid", "months", "years"];

export async function createCampStage(canvas: HTMLCanvasElement, opts: CampStageOptions): Promise<CampStage> {
  const shadows = opts.shadows ?? true;
  const renderer = new THREE.WebGLRenderer({ canvas, antialias: true, alpha: false, powerPreference: "high-performance" });
  renderer.setPixelRatio(Math.min(window.devicePixelRatio || 1, opts.maxDpr));
  renderer.toneMapping = THREE.ACESFilmicToneMapping;
  renderer.localClippingEnabled = true;
  renderer.shadowMap.enabled = shadows;
  renderer.shadowMap.type = THREE.PCFShadowMap;
  renderer.shadowMap.autoUpdate = false;
  renderer.shadowMap.needsUpdate = true;

  const scene = new THREE.Scene();
  const pmrem = new THREE.PMREMGenerator(renderer);
  const room = new RoomEnvironment();
  const envTex = pmrem.fromScene(room, 0.04).texture;
  room.dispose();
  scene.environment = envTex;

  const env = createEnvironment(renderer, scene, { shadows, mobile: opts.mobile });
  renderer.setClearColor(new THREE.Color(CLIMATES.none.horizon));

  const camera = new THREE.PerspectiveCamera(32, 1, 0.5, 1400);
  const camp = new THREE.Group();
  scene.add(camp);

  // ---- clock and tweens ------------------------------------------------------------------
  // Video capture can drive the clock by hand (window.__CAMP_CAPTURE__ before the scene loads,
  // then window.__campFrame(ms) to step and draw one frame).
  const w = window as unknown as { __CAMP_CAPTURE__?: boolean; __campFrame?: (ms: number) => void };
  const capture = !!w.__CAMP_CAPTURE__;
  let captureTime = 1000;
  const clock = () => (capture ? captureTime : performance.now());
  const tweens: Tween[] = [];
  let now = clock();
  /** Starts a tween. One with the same key still running is finished first (jumped to its end,
   * including anything its `done` starts under that key), so a shelter is never left half-built. */
  const tween = (delay: number, dur: number, update: (k: number) => void, done?: () => void, key?: string) => {
    if (key) {
      for (let guard = 0; guard < 6; guard++) {
        const i = tweens.findIndex((tw) => tw.key === key);
        if (i < 0) break;
        const [old] = tweens.splice(i, 1);
        old.update(1);
        old.done?.();
      }
    }
    if (opts.reduced) {
      update(1);
      done?.();
      invalidate();
      return;
    }
    tweens.push({ start: clock() + delay * 1000, dur: Math.max(1, dur * 1000), update, done, key });
    invalidate();
  };

  // ---- shared materials -------------------------------------------------------------------
  const staticReveal = makeReveal();
  let finish: Finish = "green";
  const vehicleMats = makeMats(staticReveal, finish, { shadows });
  const aircraftMats = makeMats(staticReveal, "white", { shadows });
  aircraftMats.shell.color.setHex(0x6f7880);
  aircraftMats.shell2.color.setHex(0x5b636b);
  aircraftMats.shell.roughness = 0.55;
  const groundMats = makeMats(staticReveal, "green", { shadows });
  groundMats.trim.color.setHex(0x5b5f63);
  groundMats.trim.metalness = 0;
  groundMats.trim.roughness = 0.95;
  const containerColors = [0x8a4b2a, 0x3f5568, 0x6b6f45, 0xb9b09b, 0x7a2f22, 0x4e5a3a];
  const containerMats = containerColors.map((c) => {
    const m = makeMats(staticReveal, "green", { shadows });
    m.shell.color.setHex(c);
    m.shell2.color.setHex(new THREE.Color(c).multiplyScalar(0.82).getHex());
    return m;
  });
  const arrivalMats: ArrivalMats = { vehicle: vehicleMats, aircraft: aircraftMats, ground: groundMats, containers: containerMats };
  // The leading system in transit: one set in the camp's finish, one for the stowed TRECC.
  const loadMats = makeMats(staticReveal, finish, { shadows });
  const treccLoadMats = makeMats(staticReveal, finish, { shadows });
  const sharedSets = [vehicleMats, aircraftMats, groundMats, loadMats, treccLoadMats, ...containerMats];
  const frameMat = new THREE.LineBasicMaterial({ color: 0xf18522, transparent: true, opacity: 0.95, blending: THREE.AdditiveBlending, depthWrite: false });

  // ---- models ------------------------------------------------------------------------------
  const kinds = new Map<ModelKind, KindModel>();
  const frames = new Map<ModelKind, THREE.BufferGeometry>();
  let treccPromise: Promise<KindModel> | null = null;
  let treccColors: Partial<Record<MatKey, THREE.Color>> = {};

  const loadTrecc = () => {
    treccPromise ??= new GLTFLoader()
      .setMeshoptDecoder(MeshoptDecoder)
      .loadAsync(TRECC_CAMP_MODEL)
      .then((gltf) => {
        const map: Record<string, MatKey> = { shell: "shell", panel: "shell2", metal: "trim", part: "frame", dark: "dark" };
        const body: PartGeo = {};
        gltf.scene.updateMatrixWorld(true);
        gltf.scene.traverse((o) => {
          const mesh = o as THREE.Mesh;
          if (!mesh.isMesh) return;
          const mat = mesh.material as THREE.MeshStandardMaterial;
          const key = map[mat.name] ?? "frame";
          const geo = toFloat(mesh.geometry);
          geo.applyMatrix4(mesh.matrixWorld);
          body[key] = geo;
          treccColors[key] = mat.color.clone();
        });
        const s = KIND_SIZE.trecc;
        return { body, moving: [], l: s.l, w: s.w, h: 2.35, style: "scan", tagY: 3.3 } as KindModel;
      })
      .catch(() => {
        treccColors = {};
        return treccStandIn();
      });
    return treccPromise;
  };

  /** The TRECC folded for travel, loaded only when a TRECC leads the camp. */
  let stowed: PartGeo | null = null;
  let stowedPromise: Promise<void> | null = null;
  const stowedSlots: THREE.Group[] = [];
  const loadStowed = () => {
    stowedPromise ??= new GLTFLoader()
      .setMeshoptDecoder(MeshoptDecoder)
      .loadAsync(TRECC_STOWED_MODEL)
      .then((gltf) => {
        const map: Record<string, MatKey> = { shell: "shell", panel: "shell2", metal: "trim", part: "frame", dark: "dark" };
        const body: PartGeo = {};
        gltf.scene.updateMatrixWorld(true);
        gltf.scene.traverse((o) => {
          const mesh = o as THREE.Mesh;
          if (!mesh.isMesh) return;
          const mat = mesh.material as THREE.MeshStandardMaterial;
          const key = map[mat.name] ?? "frame";
          const geo = toFloat(mesh.geometry);
          geo.applyMatrix4(mesh.matrixWorld);
          body[key] = geo;
          if (key !== "shell") treccLoadMats[key].color.copy(mat.color);
        });
        stowed = body;
        // Swap the stand-ins still in the scene (on trailers, pallets or slings) for the model.
        for (const slot of stowedSlots) if (inScene(slot)) fillStowed(slot);
        stowedSlots.length = 0;
        invalidate();
      })
      .catch(() => {
        // Keep the stand-ins; let a later arrival try again.
        stowedSlots.length = 0;
        stowedPromise = null;
      });
    return stowedPromise;
  };
  const inScene = (o: THREE.Object3D) => {
    let p: THREE.Object3D | null = o;
    while (p && p !== scene) p = p.parent;
    return p === scene;
  };
  const fillStowed = (slot: THREE.Group) => {
    slot.traverse((o) => {
      if ((o as THREE.Mesh).isMesh && !o.userData.shared) (o as THREE.Mesh).geometry.dispose();
    });
    slot.clear();
    if (stowed) {
      const m = meshesFor(stowed, treccLoadMats, shadows);
      m.traverse((o) => (o.userData.shared = true));
      slot.add(m);
    } else {
      // Stand-in at the published stowed size (114 × 94.5 × 57 in) until the model arrives.
      slot.add(palletBox(2.9, 1.45, 2.4));
    }
  };
  const palletBox = (l: number, h: number, w: number) => {
    const g = new THREE.Mesh(new THREE.BoxGeometry(l, h, w), treccLoadMats.shell);
    g.position.y = h / 2;
    g.castShadow = shadows;
    return g;
  };

  // ---- detailed models (system-models.ts) ----------------------------------------------------
  let draco: DRACOLoader | null = null;
  const loaderFor = (sm: SystemModel) => {
    // Embedded textures (the fit-outs) load through <img>: the CSP refuses fetch() of blob: URLs.
    const loader = withImageTextures(new GLTFLoader().setMeshoptDecoder(MeshoptDecoder));
    if (sm.compression === "draco") {
      draco ??= new DRACOLoader().setDecoderPath(DRACO_PATH);
      loader.setDRACOLoader(draco);
    }
    return loader;
  };

  const applyLooks = (mats: MatSet, looks: Partial<Record<MatKey, Look>>, ownFinish = false) => {
    for (const [k, l] of Object.entries(looks) as [MatKey, Look][]) {
      if (k === "lit" || k === "shell" || (k === "shell2" && !ownFinish)) continue;
      mats[k].color.copy(l.color);
      mats[k].metalness = l.metalness;
      mats[k].roughness = l.roughness;
    }
    // Interior panels and liners are seen from inside only (see faceInward).
    if (looks.frame) mats.frame.side = THREE.FrontSide;
  };

  /** One PartGeo per named node (in the node's own frame), with the colours its materials bring. */
  const readNodes = (root: THREE.Object3D, sm: SystemModel, looks: Partial<Record<MatKey, Look>>) => {
    const weight: Partial<Record<MatKey, number>> = {};
    const nodes: { obj: THREE.Object3D; geo: PartGeo }[] = [];
    root.updateMatrixWorld(true);
    const inv = new THREE.Matrix4();
    for (const obj of root.children) {
      const lists = new Map<MatKey, THREE.BufferGeometry[]>();
      inv.copy(obj.matrixWorld).invert();
      obj.traverse((o) => {
        const mesh = o as THREE.Mesh;
        if (!mesh.isMesh) return;
        const mat = mesh.material as THREE.MeshStandardMaterial;
        const key = slotFor(mat.name, sm);
        const geo = toFloat(mesh.geometry);
        geo.applyMatrix4(new THREE.Matrix4().multiplyMatrices(inv, mesh.matrixWorld));
        // Liners are one-sheet linings just inside the fabric. Facing them inward and drawing the
        // interior slot one-sided keeps them from showing through the fabric at camp distances.
        if (/liner/.test(mat.name)) faceInward(geo);
        const list = lists.get(key) ?? [];
        list.push(geo);
        lists.set(key, list);
        // Each slot takes the look of the material that covers most of it.
        const tris = (geo.index ? geo.index.count : geo.getAttribute("position").count) / 3;
        if (tris > (weight[key] ?? 0)) {
          weight[key] = tris;
          looks[key] = { color: mat.color.clone(), metalness: mat.metalness, roughness: mat.roughness };
        }
      });
      const geo: PartGeo = {};
      for (const [k, list] of lists) {
        geo[k] = list.length === 1 ? list[0] : (mergeGeometries(list, false) ?? list[0]);
        if (list.length > 1) list.forEach((g) => g.dispose());
      }
      nodes.push({ obj, geo });
    }
    return nodes;
  };

  /** Folds for files that follow the MECC's node names (side walls on hinges, expansions beside
   * them) but have no `articulation` in the registry, e.g. the EHMECC and HERCon. */
  const deriveFolds = (scene: THREE.Object3D): SystemModel["articulation"] | undefined => {
    const names = scene.children.map((c) => c.name);
    const exp = names.filter((n) => /_expansion_[LR]$/.test(n));
    if (exp.length === 0) return undefined;
    const walls = names.filter((n) => /_side_wall_[LR]$/.test(n));
    const unfold = exp.map((node) => {
      const side = node.endsWith("_L") ? -1 : 1;
      const wall = scene.children.find((c) => c.name === node.replace("_expansion_", "_side_wall_"));
      const box = new THREE.Box3().setFromObject(scene.children.find((c) => c.name === node)!);
      // The hinge line is the wall's, or the expansion's inner edge.
      return { node, pivotX: wall ? wall.position.x : side < 0 ? box.max.x : box.min.x };
    });
    return { hinges: walls.map((node) => ({ node, stowed: 0 })), unfold, hideStowed: names.filter((n) => /_interior$|_site_kit$/.test(n)) };
  };

  /** A packed file as one PartGeo in the deployed file's frame, and its size. */
  const loadPackedGeo = async (sm: SystemModel) => {
    const gltf = await loaderFor(sm).loadAsync(sm.stowed!);
    const looks: Partial<Record<MatKey, Look>> = {};
    const lists = new Map<MatKey, THREE.BufferGeometry[]>();
    for (const { obj, geo } of readNodes(gltf.scene, sm, looks)) {
      const m = new THREE.Matrix4().compose(obj.position, obj.quaternion, new THREE.Vector3(1, 1, 1));
      for (const [k, g] of Object.entries(geo) as [MatKey, THREE.BufferGeometry][]) {
        g.applyMatrix4(m);
        lists.set(k, [...(lists.get(k) ?? []), g]);
      }
    }
    const geo: PartGeo = {};
    const box = new THREE.Box3();
    for (const [k, list] of lists) {
      geo[k] = list.length === 1 ? list[0] : (mergeGeometries(list, false) ?? list[0]);
      if (list.length > 1) list.forEach((g) => g.dispose());
      geo[k]!.computeBoundingBox();
      box.union(geo[k]!.boundingBox!);
    }
    return { geo, looks, size: box.getSize(new THREE.Vector3()) };
  };

  const detailedPromises = new Map<ModelKind, Promise<KindModel>>();
  /** Fit-outs for "Look inside", one PartGeo per kind, loaded the first time it's asked for. */
  type Fitout = { geo: PartGeo; position: THREE.Vector3; quaternion: THREE.Quaternion };
  const fitouts = new Map<ModelKind, Promise<Fitout | null>>();
  const fitoutFor = (kind: ModelKind, sm: SystemModel): Promise<Fitout | null> => {
    let f = fitouts.get(kind);
    if (!f) {
      const inside = sm.inside!;
      f = loaderFor(sm)
        .loadAsync(inside.src)
        .then((gltf) => {
          const node = gltf.scene.getObjectByName(inside.node);
          if (!node) return null;
          // The node shares the deployed file's coordinates; keep its placement.
          node.updateWorldMatrix(true, false);
          const position = new THREE.Vector3();
          const quaternion = new THREE.Quaternion();
          node.matrixWorld.decompose(position, quaternion, new THREE.Vector3());
          const holder = new THREE.Group();
          holder.add(node);
          node.position.set(0, 0, 0);
          node.quaternion.identity();
          node.scale.set(1, 1, 1);
          const geo = readNodes(holder, sm, {})[0]?.geo;
          return geo ? { geo, position, quaternion } : null;
        })
        .catch(() => null);
      fitouts.set(kind, f);
    }
    return f;
  };
  const pickMat = new THREE.MeshBasicMaterial();
  const noRaycast = () => undefined;
  const loadDetailed = (kind: ModelKind, sm: SystemModel): Promise<KindModel> => {
    let p = detailedPromises.get(kind);
    if (p) return p;
    p = loaderFor(sm)
      .loadAsync(sm.campModel ?? sm.deployed)
      .then(async (gltf) => {
        const looks: Partial<Record<MatKey, Look>> = {};
        const art = sm.articulation ?? deriveFolds(gltf.scene);
        // Without hinges the packed file stands in for the packed state and the shelter swaps in.
        const loadGeo = !art && sm.stowed ? await loadPackedGeo(sm).catch(() => null) : null;
        const nodes: DetailedNode[] = readNodes(gltf.scene, sm, looks).map(({ obj, geo }) => {
          const hinge = art?.hinges.find((h) => h.node === obj.name);
          const unfold = art?.unfold.find((u) => u.node === obj.name);
          const packedOnly = art?.hideStowed.includes(obj.name);
          const base = { name: obj.name, geo, position: obj.position.clone(), quaternion: obj.quaternion.clone() };
          if (hinge) return { ...base, role: "hinge", from: hinge.stowed, to: new THREE.Euler().setFromQuaternion(obj.quaternion).z };
          if (unfold) return { ...base, role: "unfold", pivotX: unfold.pivotX };
          // The interior shows on the copy you can look inside; site kit (cables, earth rods) stays out
          // of the camp, which brings its own generators and would trip over the cables between rows.
          if (packedOnly || /_site_kit$/i.test(obj.name)) return { ...base, role: /interior/i.test(obj.name) ? "interior" : "hidden" };
          if (/_interior$/i.test(obj.name)) return { ...base, role: "interior" };
          return { ...base, role: "static" };
        });
        // Size from the parts that stand in the camp (not the site kit's cable run).
        const box = new THREE.Box3();
        const tmp = new THREE.Box3();
        for (const n of nodes) {
          if (n.role === "hidden") continue;
          for (const g of Object.values(n.geo)) {
            if (!g) continue;
            g.computeBoundingBox();
            tmp.copy(g.boundingBox!).applyMatrix4(new THREE.Matrix4().compose(n.position, n.quaternion, new THREE.Vector3(1, 1, 1)));
            box.union(tmp);
          }
        }
        const size = KIND_SIZE[kind];
        const h = box.isEmpty() ? size.h : box.max.y;
        // Hover and click test this box, not the model's few hundred thousand triangles.
        const pickGeo = new THREE.BoxGeometry(size.w, h, size.l).translate(0, h / 2, 0);
        const rig = (mats: MatSet, castShadows: boolean, o: { interior: boolean }): Rig => {
          // The files run their length along z with the door at +z; the camp runs it along x, door at +x.
          const root = new THREE.Group();
          root.rotation.y = Math.PI / 2;
          const pick = new THREE.Mesh(pickGeo, pickMat);
          pick.visible = false;
          root.add(pick);
          const steps: ((k: number) => void)[] = [];
          // Shelters without hinges: the shelter rises and spreads out of its packed load, and the
          // load sinks away under it once the shelter covers it.
          const shelter = new THREE.Group();
          root.add(shelter);
          if (loadGeo) {
            const load = meshesFor(loadGeo.geo, mats, castShadows);
            load.traverse((m) => {
              if ((m as THREE.Mesh).isMesh) m.raycast = noRaycast;
            });
            root.add(load);
            const from = new THREE.Vector3(
              THREE.MathUtils.clamp(loadGeo.size.x / Math.max(0.1, box.max.x - box.min.x), 0.08, 1),
              THREE.MathUtils.clamp(loadGeo.size.y / Math.max(0.1, box.max.y), 0.08, 1),
              THREE.MathUtils.clamp(loadGeo.size.z / Math.max(0.1, box.max.z - box.min.z), 0.08, 1),
            );
            steps.push((k) => {
              const e = easeInOutCubic(clamp01((k - 0.08) / 0.72));
              shelter.visible = k > 0.08;
              shelter.scale.set(lerp(from.x, 1, e), Math.max(0.02, lerp(from.y * 0.4, 1, easeOutCubic(e))), lerp(from.z, 1, e));
              const f = easeInOutCubic(clamp01((k - 0.55) / 0.4));
              load.visible = f < 0.999;
              load.scale.set(1 - 0.3 * f, Math.max(0.001, 1 - f), 1 - 0.3 * f);
            });
          }
          for (const n of nodes) {
            if (n.role === "hidden" || (n.role === "interior" && !o.interior)) continue;
            const part = meshesFor(n.geo, mats, castShadows);
            part.traverse((m) => {
              if ((m as THREE.Mesh).isMesh) m.raycast = noRaycast;
            });
            if (n.role === "hinge") {
              part.position.copy(n.position);
              shelter.add(part);
              const from = n.from ?? 0;
              const to = n.to ?? 0;
              // The walls fold down on their real hinge line first.
              steps.push((k) => (part.rotation.z = lerp(from, to, easeInOutCubic(clamp01(k / 0.55)))));
            } else if (n.role === "unfold") {
              const pivot = new THREE.Group();
              pivot.position.set(n.pivotX ?? 0, 0, 0);
              part.position.copy(n.position).sub(pivot.position);
              part.quaternion.copy(n.quaternion);
              pivot.add(part);
              shelter.add(pivot);
              // Then the expansion opens out from the container edge.
              steps.push((k) => {
                const e = easeInOutCubic(clamp01((k - 0.35) / 0.65));
                pivot.scale.x = Math.max(0.001, e);
                pivot.visible = e > 0.002;
              });
            } else {
              part.position.copy(n.position);
              part.quaternion.copy(n.quaternion);
              shelter.add(part);
              if (n.role === "interior") steps.push((k) => (part.visible = k >= 0.999));
            }
          }
          return { root, pose: (k) => steps.forEach((step) => step(k)) };
        };
        return {
          body: {},
          moving: [],
          l: size.l,
          w: size.w,
          h,
          style: art || loadGeo ? "expand" : "scan",
          tagY: h + 0.9,
          rig,
          looks,
          ownFinish: !sm.finishMaterials,
          floorY: art ? 0.27 : 0.05,
          dispose: () => {
            nodes.forEach((n) => Object.values(n.geo).forEach((g) => g?.dispose()));
            if (loadGeo) Object.values(loadGeo.geo).forEach((g) => g?.dispose());
            pickGeo.dispose();
          },
        } as KindModel & { dispose: () => void };
      })
      .catch(() => {
        // Fall back to the simplified model (kept, so a missing file isn't fetched again).
        let m = kinds.get(kind);
        if (!m) {
          m = buildKind(kind as Exclude<ModelKind, "trecc">);
          kinds.set(kind, m);
        }
        return m;
      });
    detailedPromises.set(kind, p);
    return p;
  };

  /** A detailed model's packed form for the arrival (its `stowed` file), loaded when it leads. */
  const realLoadMats = makeMats(staticReveal, finish, { shadows });
  sharedSets.push(realLoadMats);
  const packed = new Map<ModelKind, { geo: PartGeo | null; promise: Promise<void> | null; slots: THREE.Group[] }>();
  const loadPacked = (kind: ModelKind, sm: SystemModel) => {
    let st = packed.get(kind);
    if (!st) {
      st = { geo: null, promise: null, slots: [] };
      packed.set(kind, st);
    }
    const state = st;
    if (state.promise || state.geo || !sm.stowed) return;
    state.promise = loaderFor(sm)
      .loadAsync(sm.stowed)
      .then((gltf) => {
        const looks: Partial<Record<MatKey, Look>> = {};
        const lists = new Map<MatKey, THREE.BufferGeometry[]>();
        for (const { obj, geo } of readNodes(gltf.scene, sm, looks)) {
          const m = new THREE.Matrix4().compose(obj.position, obj.quaternion, new THREE.Vector3(1, 1, 1));
          for (const [k, g] of Object.entries(geo) as [MatKey, THREE.BufferGeometry][]) {
            g.applyMatrix4(m);
            lists.set(k, [...(lists.get(k) ?? []), g]);
          }
        }
        const geo: PartGeo = {};
        for (const [k, list] of lists) {
          geo[k] = list.length === 1 ? list[0] : (mergeGeometries(list, false) ?? list[0]);
          if (list.length > 1) list.forEach((g) => g.dispose());
        }
        applyLooks(realLoadMats, looks);
        state.geo = geo;
        for (const slot of state.slots) if (inScene(slot)) fillPacked(slot, kind);
        state.slots.length = 0;
        invalidate();
      })
      .catch(() => {
        state.slots.length = 0;
        state.promise = null;
      });
  };
  const fillPacked = (slot: THREE.Group, kind: ModelKind) => {
    slot.traverse((o) => {
      if ((o as THREE.Mesh).isMesh && !o.userData.shared) (o as THREE.Mesh).geometry.dispose();
    });
    slot.clear();
    const geo = packed.get(kind)?.geo;
    if (geo) {
      const m = meshesFor(geo, realLoadMats, shadows);
      m.rotation.y = Math.PI / 2;
      m.traverse((o) => (o.userData.shared = true));
      slot.add(m);
    } else {
      // A plain container, pallet or bag load until the model arrives.
      const how = PACKED[kind]?.kind ?? "container";
      slot.add(how === "container" ? container(realLoadMats, shadows, 6.058, 2.438) : how === "pallet" ? palletShelter(realLoadMats, shadows) : bagsLoad(realLoadMats, shadows));
    }
  };

  /** The leading system in the form it travels in. */
  const cargoFor = (plan: CampPlan): Cargo => {
    const kind = plan.units[0]?.kind;
    const real = kind ? detailedModelFor(kind) : null;
    const pack = kind ? PACKED[kind] : undefined;
    if (kind && real?.stowed && pack) {
      loadPacked(kind, real);
      return {
        kind: pack.kind,
        l: pack.l,
        h: pack.h,
        make: () => {
          const slot = new THREE.Group();
          fillPacked(slot, kind);
          if (!packed.get(kind)?.geo) packed.get(kind)?.slots.push(slot);
          return slot;
        },
      };
    }
    switch (kind) {
      case "trecc":
        void loadStowed();
        return {
          kind: "trecc",
          l: 2.9,
          h: 1.45,
          make: () => {
            const slot = new THREE.Group();
            fillStowed(slot);
            if (!stowed) stowedSlots.push(slot);
            return slot;
          },
        };
      case "mecc":
      case "ehmecc":
      case "iso": {
        const sm = kind ? detailedModelFor(kind) : null;
        if (kind && sm?.stowed) {
          loadPacked(kind, sm);
          return {
            kind: "container",
            l: 6.058,
            h: 2.56,
            make: () => {
              const slot = new THREE.Group();
              fillPacked(slot, kind);
              if (!packed.get(kind)?.geo) packed.get(kind)?.slots.push(slot);
              return slot;
            },
          };
        }
        return { kind: "container", l: 6.058, h: 2.438, make: () => container(loadMats, shadows, 6.058, 2.438) };
      }
      case "bmecc":
        return { kind: "container", l: 3.048, h: 2.438, make: () => container(loadMats, shadows, 3.048, 2.438) };
      case "hercon":
        return { kind: "container", l: 2.438, h: 2.438, make: () => container(loadMats, shadows, 2.438, 2.438) };
      case "ateps":
        return { kind: "pallet", l: 2.235, h: 2.4, make: () => palletShelter(loadMats, shadows) };
      default:
        return { kind: "bags", l: 2.74, h: 1.3, make: () => bagsLoad(loadMats, shadows) };
    }
  };

  const modelFor = (kind: ModelKind): KindModel | Promise<KindModel> => {
    if (kind === "trecc") return loadTrecc();
    const sm = detailedModelFor(kind);
    if (sm) return loadDetailed(kind, sm);
    let m = kinds.get(kind);
    if (!m) {
      m = buildKind(kind);
      kinds.set(kind, m);
    }
    return m;
  };

  const frameFor = (kind: ModelKind) => {
    let f = frames.get(kind);
    if (!f) {
      const s = KIND_SIZE[kind];
      f = scanFrame(s.l, s.w);
      frames.set(kind, f);
    }
    return f;
  };

  // ---- structures ---------------------------------------------------------------------------
  const structs = new Map<string, Struct>();
  let leadFigures: { id: string; group: THREE.Group } | null = null;

  const mount = (s: Struct, model: KindModel, delay: number) => {
    if (s.removed) return;
    s.model = model;
    if (s.unit.kind === "trecc") {
      s.keepColors = true;
      for (const [k, c] of Object.entries(treccColors) as [MatKey, THREE.Color][]) if (k !== "shell") s.mats[k].color.copy(c);
      s.mats.shell2.roughness = 0.7;
    }
    if (model.ownFinish) s.keepColors = true;
    if (model.looks) applyLooks(s.mats, model.looks, model.ownFinish);
    if (model.rig) {
      // Only the camp's first copy gets the interior (it's the one you can look inside).
      const rig = model.rig(s.mats, shadows, { interior: s.unit.role === "main" && /-0$/.test(s.unit.id) });
      s.root.add(rig.root);
      s.pose = rig.pose;
      rig.pose(model.style === "expand" ? 0 : 1);
    } else s.root.add(meshesFor(model.body, s.mats, shadows));
    for (const part of model.moving) {
      const obj = meshesFor(part.geo, s.mats, shadows);
      obj.position.set(...part.path[0]);
      s.root.add(obj);
      s.moving.push({ obj, path: part.path });
    }
    const H = model.h + 0.35;
    const settle = () => {
      s.reveal.set(1e4, 0);
      s.y = 1e4;
      s.frame.visible = false;
      renderer.shadowMap.needsUpdate = true;
    };
    if (model.style === "inflate") {
      s.reveal.set(1e4, 1);
      s.root.scale.set(0.9, 0.02, 0.9);
      s.frame.visible = true;
      s.frame.position.y = 0.04;
      tween(
        delay,
        1.3,
        (k) => {
          const e = easeOutBack(k);
          s.root.scale.set(0.9 + 0.1 * Math.min(1, e), Math.max(0.02, e), 0.9 + 0.1 * Math.min(1, e));
          s.reveal.uniforms.uGlow.value = 1 - k;
          renderer.shadowMap.needsUpdate = true;
        },
        () => {
          s.root.scale.set(1, 1, 1);
          settle();
        },
        `s:${s.unit.id}`,
      );
      return;
    }
    s.reveal.set(-0.05, 1);
    s.y = -0.05;
    s.frame.visible = true;
    const dur = 0.85 + model.h * 0.1;
    tween(
      delay,
      dur,
      (k) => {
        const y = -0.05 + easeInOutCubic(k) * H;
        s.reveal.set(y, 1);
        s.y = y;
        s.frame.position.y = y;
        renderer.shadowMap.needsUpdate = true;
      },
      () => {
        settle();
        if (model.style === "expand" && (s.moving.length || s.pose)) {
          tween(
            0.05,
            s.pose ? 2.2 : 1.1,
            (k) => {
              s.pose?.(k);
              for (const m of s.moving) {
                const n = m.path.length - 1;
                const f = k * n;
                const i = Math.min(n - 1, Math.floor(f));
                const t = easeInOutCubic(f - i);
                const a = m.path[i];
                const b = m.path[i + 1];
                m.obj.position.set(lerp(a[0], b[0], t), lerp(a[1], b[1], t), lerp(a[2], b[2], t));
              }
              renderer.shadowMap.needsUpdate = true;
            },
            undefined,
            `s:${s.unit.id}`,
          );
        } else {
          for (const m of s.moving) m.obj.position.set(0, 0, 0);
          s.pose?.(1);
        }
      },
      `s:${s.unit.id}`,
    );
  };

  const addStruct = (u: CampUnit, delay: number) => {
    const reveal = makeReveal();
    reveal.set(-1, 0);
    const mats = makeMats(reveal, finish, { shadows });
    const root = new THREE.Group();
    root.position.set(u.x, 0, u.z);
    root.rotation.y = u.rot;
    root.userData.unitId = u.id;
    const frame = new THREE.LineSegments(frameFor(u.kind), frameMat);
    frame.visible = false;
    root.add(frame);
    camp.add(root);
    const s: Struct = { unit: u, root, mats, reveal, frame, model: null, moving: [], keepColors: false, y: -1, removed: false };
    structs.set(u.id, s);
    const m = modelFor(u.kind);
    if (m instanceof Promise) {
      void m.then((model) => {
        mount(s, model, 0);
        invalidate();
      });
    } else mount(s, m, delay);
    return s;
  };

  const removeStruct = (s: Struct) => {
    structs.delete(s.unit.id);
    s.removed = true;
    const from = Math.min(s.y, (s.model?.h ?? 3) + 0.35);
    const finishRemoval = () => {
      camp.remove(s.root);
      disposeOwned(s.root);
      Object.values(s.mats).forEach((m) => m.dispose());
      renderer.shadowMap.needsUpdate = true;
    };
    if (!s.model || from <= 0) {
      // Cancel a build that hasn't shown anything yet.
      tween(0, 0, () => undefined, undefined, `s:${s.unit.id}`);
      finishRemoval();
      return;
    }
    tween(
      0,
      0.55,
      (k) => {
        const y = lerp(from, -0.05, easeInOutCubic(k));
        s.frame.visible = true;
        s.reveal.set(y, 1);
        s.frame.position.y = Math.max(0.02, y);
        renderer.shadowMap.needsUpdate = true;
      },
      finishRemoval,
      `s:${s.unit.id}`,
    );
  };

  const moveStruct = (s: Struct, u: CampUnit) => {
    const from = s.root.position.clone();
    s.unit = u;
    tween(
      0,
      0.9,
      (k) => {
        const e = easeInOutCubic(k);
        s.root.position.set(lerp(from.x, u.x, e), 0, lerp(from.z, u.z, e));
        renderer.shadowMap.needsUpdate = true;
      },
      undefined,
      `m:${u.id}`,
    );
  };

  // ---- site works ------------------------------------------------------------------------------
  const layers = new Map<DurationId, { key: string; layer: SiteLayer; mats: MatSet; reveal: Reveal }>();
  const layerColors: Record<DurationId, Partial<Record<MatKey, number>>> = {
    rapid: { shell: 0x5f6650 },
    months: { shell: 0x5f6650, shell2: 0x5a4632 },
    years: { shell: 0xb7b2a2, shell2: 0x77746a },
  };

  const setLayer = (tier: DurationId, props: CampProp[], delay: number) => {
    const key = JSON.stringify(props.map((p) => [p.id, p.x, p.z, p.l]));
    const cur = layers.get(tier);
    if (cur?.key === key) return;
    if (cur) {
      layers.delete(tier);
      const top = cur.layer.height;
      tween(
        0,
        0.5,
        (k) => {
          cur.reveal.set(lerp(top, -0.05, k), 1);
          cur.layer.glows.forEach((g) => ((g.material as THREE.MeshBasicMaterial).opacity = 0.55 * (1 - k)));
          renderer.shadowMap.needsUpdate = true;
        },
        () => {
          camp.remove(cur.layer.group);
          cur.layer.group.traverse((o) => {
            const m = o as THREE.Mesh;
            if (m.isMesh) {
              m.geometry.dispose();
              if ((m.material as THREE.MeshBasicMaterial).isMeshBasicMaterial) (m.material as THREE.Material).dispose();
            }
          });
          Object.values(cur.mats).forEach((m) => m.dispose());
        },
      );
    }
    if (props.length === 0) return;
    const reveal = makeReveal();
    reveal.set(-0.05, 1);
    const mats = makeMats(reveal, finish, { shadows });
    for (const [k, c] of Object.entries(layerColors[tier]) as [MatKey, number][]) mats[k].color.setHex(c);
    mats.trim.color.setHex(0x8b939b);
    const layer = buildSiteLayer(props, mats, shadows);
    camp.add(layer.group);
    layers.set(tier, { key, layer, mats, reveal });
    tween(
      delay,
      1.4,
      (k) => {
        reveal.set(-0.05 + easeInOutCubic(k) * (layer.height + 0.2), 1);
        layer.glows.forEach((g) => ((g.material as THREE.MeshBasicMaterial).opacity = 0.55 * clamp01(k * 1.5 - 0.5)));
        renderer.shadowMap.needsUpdate = true;
      },
      () => {
        reveal.set(1e4, 0);
        renderer.shadowMap.needsUpdate = true;
      },
    );
  };

  // ---- climate ---------------------------------------------------------------------------------
  let climateKey: ClimateKey = "none";
  let shownPreset: ClimatePreset = CLIMATES.none;
  let weather: Weather | null = null;
  const fading: Weather[] = [];
  let props: { group: THREE.Group; key: string } | null = null;

  let climateFrom: ClimatePreset = CLIMATES.none;
  let climateTo: ClimatePreset = CLIMATES.none;
  let climateE = 1;
  // Real conditions at the chosen place shape the preset (weather, sun, night).
  let live: LiveConditions | null = null;
  let shownSig = "none|";
  const liveSig = () => (live ? `${live.lat},${live.lng},${live.seenAt},${live.symbol},${Math.round(live.windMs ?? 0)}` : "");

  const setClimate = (next: ClimateKey) => {
    const sig = `${next}|${next === "none" ? "" : liveSig()}`;
    if (sig === shownSig) return;
    shownSig = sig;
    // Start from what is on screen, even if the last change is still fading in.
    const from = climateE >= 1 ? shownPreset : mixPreset(climateFrom, climateTo, climateE);
    const to = live && next !== "none" ? livePreset(CLIMATES[next], live) : CLIMATES[next];
    climateFrom = from;
    climateTo = to;
    climateE = 0;
    const shells = new Map([...structs.values()].map((s) => [s, { a: s.mats.shell.color.clone(), b: s.mats.shell2.color.clone() }]));
    climateKey = next;
    finish = to.finish;
    // Vehicles follow the finish too.
    vehicleMats.shell.color.setHex(FINISH_COLORS[finish === "white" ? "green" : finish].shell);
    loadMats.shell.color.setHex(FINISH_COLORS[finish].shell);
    loadMats.shell2.color.setHex(FINISH_COLORS[finish].shell2);
    treccLoadMats.shell.color.setHex(FINISH_COLORS[finish].shell);
    realLoadMats.shell.color.setHex(FINISH_COLORS[finish].shell);
    realLoadMats.shell2.color.setHex(FINISH_COLORS[finish].shell2);
    vehicleMats.shell2.color.setHex(FINISH_COLORS[finish === "white" ? "green" : finish].shell2);
    const target = { a: new THREE.Color(FINISH_COLORS[finish].shell), b: new THREE.Color(FINISH_COLORS[finish].shell2) };
    tween(
      0,
      1.6,
      (k) => {
        const e = easeInOutCubic(k);
        climateE = k;
        env.blend(from, to, e);
        renderer.setClearColor(env.fog.color);
        for (const [s, c] of shells) {
          if (s.removed) continue;
          s.mats.shell.color.copy(c.a).lerp(target.a, e);
          if (!s.keepColors) s.mats.shell2.color.copy(c.b).lerp(target.b, e);
        }
      },
      () => {
        shownPreset = to;
        climateE = 1;
      },
      "climate",
    );
    // Weather: fade the old one out, the new one in (unless it's the same weather).
    if (weather && weather.kind === to.weather) return;
    if (weather) {
      const old = weather;
      fading.push(old);
      const start = old.opacity();
      tween(
        0,
        1.0,
        (k) => old.setOpacity(start * (1 - k)),
        () => {
          scene.remove(old.points);
          old.dispose();
          fading.splice(fading.indexOf(old), 1);
        },
        `w:${old.id}`,
      );
      weather = null;
    }
    if (to.weather !== "none") {
      const w = createWeather(to.weather, opts.mobile);
      w.setOpacity(0);
      w.setDensity(weatherScale);
      scene.add(w.points);
      weather = w;
      tween(0.3, 1.4, (k) => w.setOpacity(k), undefined, `w:${w.id}`);
    }
  };

  const setProps = (plan: CampPlan, arrival: { group: THREE.Group; arrival: Arrival } | null) => {
    const set = CLIMATES[climateKey].props;
    const b = plan.bounds;
    const center = new THREE.Vector2((b.minX + b.maxX) / 2, (b.minZ + b.maxZ) / 2);
    const radius = Math.hypot(b.maxX - b.minX, b.maxZ - b.minZ) / 2;
    // Nothing tall between the usual camera positions (in front, +z) and the camp.
    const avoid: Avoid[] = [{ x0: center.x - radius - 70, x1: center.x + radius + 90, z0: center.y, z1: center.y + radius + 140 }];
    if (arrival && plan.transportSite) {
      // Where the arrival is going to be (it may still be sliding there).
      const p = { x: plan.transportSite.x, z: plan.transportSite.z };
      const st = arrival.arrival.strip;
      if (st) avoid.push({ x0: st.minX + p.x - 4, x1: st.maxX + p.x + 4, z0: st.minZ + p.z - 6, z1: st.maxZ + p.z + 6 });
      avoid.push({ x: p.x + arrival.arrival.focus.x, z: p.z + arrival.arrival.focus.z, r: arrival.arrival.focus.r + 8 });
      // Keep the approach corridors clear.
      if (plan.transport === "helo") avoid.push({ x0: p.x - 20, x1: p.x + 200, z0: p.z - 120, z1: p.z + 20 });
      if (plan.transport === "remote") avoid.push({ x0: p.x - 10, x1: p.x + 90, z0: p.z - 10, z1: p.z + 130 });
      if (plan.transport === "sea") avoid.push({ x0: p.x - 2, x1: p.x + 20, z0: p.z - 10, z1: p.z + 140 });
    }
    const key = `${set}|${Math.round(center.x)}|${Math.round(center.y)}|${Math.round(radius / 4)}|${plan.transport ?? ""}|${plan.transportSite ? Math.round(plan.transportSite.x) : ""}`;
    if (props?.key === key) return;
    if (props) {
      const old = props.group;
      tween(0, 0.6, (k) => old.scale.set(1, Math.max(0.001, 1 - k), 1), () => {
        env.root.remove(old);
        (old.userData.dispose as (() => void) | undefined)?.();
      });
      props = null;
    }
    if (set === "none") return;
    const g = createProps(set, center, radius + 10, avoid, opts.mobile, env.terrain);
    g.scale.y = 0.001;
    env.root.add(g);
    props = { group: g, key };
    tween(0.4, 1.2, (k) => g.scale.set(1, Math.max(0.001, easeOutCubic(k)), 1));
  };

  // ---- arrival --------------------------------------------------------------------------------
  let arrival: ArrivalState | null = null;

  const setArrival = (plan: CampPlan, animate: boolean) => {
    const site = plan.transportSite;
    const sameKind = arrival && site && arrival.kind === site.kind && arrival.climate === (plan.climate ?? "") && arrival.lead === (plan.lead?.slug ?? "");
    if (arrival && (!site || !sameKind)) {
      const old = arrival;
      arrival = null;
      tween(0, 0.45, (k) => old.group.scale.set(1, Math.max(0.001, 1 - k), 1), () => {
        camp.remove(old.group);
        old.arrival.dispose();
        renderer.shadowMap.needsUpdate = true;
      });
    }
    if (!site) {
      env.setStrips();
      return;
    }
    if (arrival && sameKind) {
      // Same arrival, camp grew: slide it to the new site.
      const from = arrival.group.position.clone();
      const a = arrival;
      if (from.x !== site.x || from.z !== site.z) {
        tween(0, 0.9, (k) => {
          const e = easeInOutCubic(k);
          a.group.position.set(lerp(from.x, site.x, e), 0, lerp(from.z, site.z, e));
          renderer.shadowMap.needsUpdate = true;
        });
      }
    } else {
      const made = createArrival(site.kind, plan, arrivalMats, shadows, cargoFor(plan));
      const group = new THREE.Group();
      group.add(made.group);
      group.position.set(site.x, 0, site.z);
      camp.add(group);
      arrival = { group, arrival: made, kind: site.kind, start: clock() + 250, climate: plan.climate ?? "", lead: plan.lead?.slug ?? "" };
      if (!animate || opts.reduced) {
        made.update(1e3);
        arrival.start = -1e9;
      }
    }
    const st = arrival!.arrival.strip;
    env.setStrips(st ? { minX: st.minX + site.x, maxX: st.maxX + site.x, minZ: st.minZ + site.z, maxZ: st.maxZ + site.z } : undefined);
  };

  // ---- beacon (empty site) ----------------------------------------------------------------------
  const beacon = new THREE.Group();
  const beamMat = new THREE.MeshBasicMaterial({ color: 0xf18522, transparent: true, opacity: 0.85, blending: THREE.AdditiveBlending, depthWrite: false });
  const beam = new THREE.Mesh(new THREE.CylinderGeometry(0.04, 0.04, 9, 6), beamMat);
  beam.position.y = 4.5;
  const ringMat = new THREE.MeshBasicMaterial({ color: 0xf18522, transparent: true, opacity: 0.8, blending: THREE.AdditiveBlending, depthWrite: false, side: THREE.DoubleSide });
  const ring = new THREE.Mesh(new THREE.RingGeometry(0.9, 1.0, 48), ringMat);
  ring.rotation.x = -Math.PI / 2;
  ring.position.y = 0.03;
  const crossMat = new THREE.LineBasicMaterial({ color: 0xf18522, transparent: true, opacity: 0.7 });
  const cross = new THREE.LineSegments(
    new THREE.BufferGeometry().setAttribute("position", new THREE.Float32BufferAttribute([-6, 0.03, 0, -1.4, 0.03, 0, 1.4, 0.03, 0, 6, 0.03, 0, 0, 0.03, -6, 0, 0.03, -1.4, 0, 0.03, 1.4, 0, 0.03, 6], 3)),
    crossMat,
  );
  beacon.add(beam, ring, cross);
  scene.add(beacon);
  let beaconOn = 1;

  // ---- camera --------------------------------------------------------------------------------------
  type Pose = { az: number; el: number; dist: number; tx: number; ty: number; tz: number };
  const cam: Pose = { az: 32, el: 30, dist: 40, tx: 0, ty: 0.5, tz: 0 };
  let camTween: { from: Pose; to: Pose; start: number; dur: number } | null = null;
  // While an arrival plays, the camera follows its vehicle, then pulls back to frame it all.
  let follow: { a: ArrivalState; from: Pose; t0: number; final: Pose } | null = null;
  let orbit = false;
  let orbited = 0;
  let userMoved = false;

  const applyCamera = () => {
    const a = THREE.MathUtils.degToRad(cam.az);
    const e = THREE.MathUtils.degToRad(cam.el);
    camera.position.set(cam.tx + cam.dist * Math.cos(e) * Math.sin(a), cam.ty + cam.dist * Math.sin(e), cam.tz + cam.dist * Math.cos(e) * Math.cos(a));
    camera.lookAt(cam.tx, cam.ty, cam.tz);
    env.sky.position.copy(camera.position);
    env.setFogScale(cam.dist);
  };

  type Box = { minX: number; maxX: number; minZ: number; maxZ: number; h: number };
  const fwd = new THREE.Vector3();
  const back = new THREE.Vector3();
  const right = new THREE.Vector3();
  const upv = new THREE.Vector3();
  const corner = new THREE.Vector3();
  const UP = new THREE.Vector3(0, 1, 0);

  /** Camera distance that fits a box in the view from a given direction, leaving room for the
   * captions over the top and bottom of the scene. */
  const fitBox = (az: number, el: number, box: Box): Pose => {
    const tx = (box.minX + box.maxX) / 2;
    const tz = (box.minZ + box.maxZ) / 2;
    const ty = Math.min(box.h * 0.3, 2);
    const a = THREE.MathUtils.degToRad(az);
    const e = THREE.MathUtils.degToRad(el);
    back.set(Math.cos(e) * Math.sin(a), Math.sin(e), Math.cos(e) * Math.cos(a));
    fwd.copy(back).negate();
    right.crossVectors(fwd, UP).normalize();
    upv.crossVectors(right, fwd).normalize();
    const tv = Math.tan(THREE.MathUtils.degToRad(camera.fov) / 2);
    const th = tv * camera.aspect;
    const hPx = canvas.clientHeight || 600;
    const mv = 1 / Math.max(0.55, 1 - 90 / hPx);
    const mh = 1.08;
    let d = 0;
    for (const x of [box.minX, box.maxX])
      for (const y of [0, box.h])
        for (const z of [box.minZ, box.maxZ]) {
          corner.set(x - tx, y - ty, z - tz);
          const cx = corner.dot(right);
          const cy = corner.dot(upv);
          const cz = corner.dot(back);
          d = Math.max(d, cz + (Math.abs(cx) * mh) / th, cz + (Math.abs(cy) * mv) / tv);
        }
    return { az, el, dist: Math.max(d, 6), tx, ty, tz };
  };

  const grow = (b: Box, m: number): Box => ({ minX: b.minX - m, maxX: b.maxX + m, minZ: b.minZ - m, maxZ: b.maxZ + m, h: b.h });
  const union = (a: Box, b: Box): Box => ({
    minX: Math.min(a.minX, b.minX),
    maxX: Math.max(a.maxX, b.maxX),
    minZ: Math.min(a.minZ, b.minZ),
    maxZ: Math.max(a.maxZ, b.maxZ),
    h: Math.max(a.h, b.h),
  });

  const poseFor = (plan: CampPlan, focus: CampFocus): Pose => {
    const tall = Math.max(3, ...plan.units.map((u) => KIND_SIZE[u.kind].h)) + 1.2;
    const camp: Box = { ...plan.bounds, h: tall };
    const lead = plan.units[0];
    const withArrival = (b: Box): Box => {
      if (!arrival || !plan.transportSite) return b;
      const f = arrival.arrival.focus;
      const ax = plan.transportSite.x + f.x;
      const az = plan.transportSite.z + f.z;
      return union(b, { minX: ax - f.r, maxX: ax + f.r, minZ: az - f.r, maxZ: az + f.r, h: Math.max(b.h, plan.transport === "air" ? 12 : 6) });
    };
    const siteMargin = plan.duration === "years" ? 10 : plan.duration ? 4 : 2;
    switch (focus) {
      case "empty":
        return fitBox(32, 30, { minX: -7, maxX: 7, minZ: -7, maxZ: 7, h: 6 });
      case "mission": {
        if (!lead) return poseFor(plan, "empty");
        const s = KIND_SIZE[lead.kind];
        // Wider when going back to the first question with a whole camp around the lead.
        const m = plan.units.length > 1 ? 6 : 1.4;
        return fitBox(38, 17, { minX: lead.x - s.l / 2 - m, maxX: lead.x + s.l / 2 + m + 2, minZ: lead.z - s.w / 2 - m, maxZ: lead.z + s.w / 2 + m, h: s.h + 1.4 });
      }
      case "climate":
        return fitBox(24, 9, grow(camp, Math.max(6, (camp.maxX - camp.minX) * 0.25)));
      case "people":
        return fitBox(34, 30, grow(camp, 2));
      case "transport":
        return fitBox(plan.transport === "road" ? 30 : 16, 24, withArrival(grow(camp, 2)));
      case "duration":
        return fitBox(-30, 32, grow(camp, siteMargin));
      case "results":
      case "overview": {
        const box = withArrival(grow(camp, siteMargin));
        const pose = fitBox(28, 28, box);
        // The results orbit all the way round: allow for the widest view, though a corner may
        // brush the edge for a moment rather than leave the camp small the whole time.
        if (focus === "results") {
          let widest = pose.dist;
          for (let a = 0; a < 360; a += 30) widest = Math.max(widest, fitBox(a, 28, box).dist);
          pose.dist = Math.max(pose.dist, widest * 0.9);
        }
        return pose;
      }
    }
  };

  const moveCamera = (to: Pose, instant: boolean) => {
    if (instant || opts.reduced) {
      Object.assign(cam, to);
      camTween = null;
      applyCamera();
      return;
    }
    const from = { ...cam };
    // Turn the short way round.
    let d = to.az - from.az;
    d = ((((d + 180) % 360) + 360) % 360) - 180;
    camTween = { from, to: { ...to, az: from.az + d }, start: clock(), dur: 1700 };
    invalidate();
  };

  // ---- interaction ------------------------------------------------------------------------------------
  let drag: { id: number; x: number; y: number; moved: number } | null = null;
  let resultsMode = false;
  const raycaster = new THREE.Raycaster();
  const pointer = new THREE.Vector2();
  let hoverId: string | null = null;

  const pickAt = (clientX: number, clientY: number): Struct | null => {
    const r = canvas.getBoundingClientRect();
    pointer.set(((clientX - r.left) / r.width) * 2 - 1, -((clientY - r.top) / r.height) * 2 + 1);
    raycaster.setFromCamera(pointer, camera);
    const roots = [...structs.values()].filter((s) => s.model).map((s) => s.root);
    const hit = raycaster.intersectObjects(roots, true).find((h) => (h.object as THREE.Mesh).isMesh);
    if (!hit) return null;
    let o: THREE.Object3D | null = hit.object;
    while (o && !o.userData.unitId) o = o.parent;
    return o ? structs.get(o.userData.unitId as string) ?? null : null;
  };

  const onDown = (e: PointerEvent) => {
    drag = { id: e.pointerId, x: e.clientX, y: e.clientY, moved: 0 };
  };
  const onMove = (e: PointerEvent) => {
    if (drag && e.pointerId === drag.id) {
      const dx = e.clientX - drag.x;
      const dy = e.clientY - drag.y;
      drag.x = e.clientX;
      drag.y = e.clientY;
      drag.moved += Math.abs(dx) + Math.abs(dy);
      if (drag.moved > 4) {
        if (!canvas.hasPointerCapture(e.pointerId)) canvas.setPointerCapture(e.pointerId);
        camTween = null;
        follow = null;
        orbit = false;
        userMoved = true;
        cam.az -= dx * 0.28;
        cam.el = Math.min(68, Math.max(4, cam.el + dy * 0.18));
        applyCamera();
        invalidate();
      }
      return;
    }
    if (!resultsMode || e.pointerType !== "mouse") return;
    const s = pickAt(e.clientX, e.clientY);
    const id = s?.unit.id ?? null;
    canvas.style.cursor = id ? "pointer" : "grab";
    if (id !== hoverId) {
      hoverId = id;
      opts.onHover?.(id);
    }
  };
  const onUp = (e: PointerEvent) => {
    if (!drag || e.pointerId !== drag.id) return;
    const click = drag.moved <= 4;
    drag = null;
    if (canvas.hasPointerCapture(e.pointerId)) canvas.releasePointerCapture(e.pointerId);
    if (click && resultsMode) {
      const s = pickAt(e.clientX, e.clientY);
      if (s) opts.onPick?.(s.unit.slug);
    }
  };
  const onCancel = () => {
    drag = null;
  };
  canvas.addEventListener("pointerdown", onDown);
  canvas.addEventListener("pointermove", onMove);
  canvas.addEventListener("pointerup", onUp);
  canvas.addEventListener("pointercancel", onCancel);
  const onLeave = () => {
    if (hoverId) {
      hoverId = null;
      opts.onHover?.(null);
    }
  };
  canvas.addEventListener("pointerleave", onLeave);
  canvas.style.touchAction = "pan-y pinch-zoom";
  canvas.style.cursor = "grab";

  // ---- tags -------------------------------------------------------------------------------------------
  let plan: CampPlan | null = null;
  const v = new THREE.Vector3();
  let lastTags = "";
  const emitTags = () => {
    if (!opts.onTags || !plan) return;
    const w = canvas.clientWidth;
    const h = canvas.clientHeight;
    const out: TagPos[] = plan.tags.map((t) => {
      const s = structs.get(t.unitId);
      if (!s || !s.model) return { unitId: t.unitId, x: 0, y: 0, visible: false };
      v.set(s.root.position.x, s.model.tagY * s.root.scale.y, s.root.position.z).project(camera);
      const visible = v.z < 1 && s.y > s.model.h * 0.6 && Math.abs(v.x) < 1.05 && Math.abs(v.y) < 1.05;
      return { unitId: t.unitId, x: Math.round(((v.x + 1) / 2) * w), y: Math.round(((1 - v.y) / 2) * h), visible };
    });
    const key = JSON.stringify(out);
    if (key === lastTags) return;
    lastTags = key;
    opts.onTags(out);
  };

  // ---- loop --------------------------------------------------------------------------------------------
  let raf = 0;
  let active = true;
  let disposed = false;
  // Something changed that must be drawn on the next frame (never skipped).
  let dirty = true;
  let lastFrame = 0;
  let elapsed = 0;
  let skip = false;

  // ---- automatic quality -----------------------------------------------------------------------
  // Frame times are sampled while something animates. If a device can't keep up (median frame
  // slower than 25 fps), step down: first a lower pixel ratio and half the
  // weather, then no shadows and no weather. Screenshot and video runs opt out.
  const testRun = () => capture || still();
  let quality = 2;
  let weatherScale = 1;
  let samples: number[] = [];
  let settleFrames = 8;
  const resetQuality = () => {
    samples = [];
    settleFrames = 8;
  };
  const watchQuality = (dtMs: number) => {
    if (quality === 0 || testRun()) return;
    if (settleFrames > 0) {
      settleFrames--;
      return;
    }
    samples.push(dtMs);
    if (samples.length < 24) return;
    const median = [...samples].sort((a, b) => a - b)[samples.length >> 1];
    samples = [];
    // 25 fps or better is fine (phones in low-power mode run at 30).
    if (median <= 40) return;
    quality--;
    settleFrames = 12;
    if (quality === 1) {
      renderer.setPixelRatio(1);
      resize();
      weatherScale = 0.5;
    } else {
      env.key.castShadow = false;
      renderer.shadowMap.needsUpdate = true;
      weatherScale = 0;
    }
    if (weather) weather.setDensity(weatherScale);
  };

  // Headless test runs can set window.__CAMP_STILL__ so the scene stops drawing once built.
  const still = () => !!(window as unknown as { __CAMP_STILL__?: boolean }).__CAMP_STILL__;
  const ambient = () => !opts.reduced && !still() && ((!!weather && weatherScale > 0) || fading.length > 0 || beaconOn > 0.01 || orbit);
  const busy = () =>
    tweens.length > 0 || !!camTween || !!follow || (arrival && !opts.reduced && arrival.arrival.busy((now - arrival.start) / 1000)) || false;

  function frame(t: number) {
    raf = 0;
    if (disposed) return;
    now = t;
    const interval = lastFrame ? t - lastFrame : 0;
    const dt = lastFrame ? Math.min(0.1, interval / 1000) : 1 / 60;
    // The first frame after a rest starts a fresh measurement.
    if (!lastFrame) resetQuality();
    lastFrame = t;
    const isBusy = busy();
    // Real frame intervals (a slow device can take far longer than the 0.1 s the animation clock
    // allows). A quality step resizes the canvas, which marks this frame as one to draw.
    if ((isBusy || ambient()) && interval > 0 && interval < 2000) watchQuality(interval);
    // When only weather, the beacon or the orbit is moving, draw every other frame (30 fps).
    skip = !isBusy && !dirty ? !skip : false;
    const step = dt * (!isBusy && !dirty ? 2 : 1);
    if (!skip) {
      elapsed += step;
      for (let i = tweens.length - 1; i >= 0; i--) {
        const tw = tweens[i];
        if (t < tw.start) continue;
        const k = clamp01((t - tw.start) / tw.dur);
        tw.update(k);
        if (k >= 1) {
          tweens.splice(i, 1);
          tw.done?.();
        }
      }
      if (follow && follow.a !== arrival) follow = null;
      if (follow) {
        const a = follow.a;
        const at = (t - a.start) / 1000;
        const f = a.arrival.follow;
        const sub = a.arrival.subject().add(a.group.position);
        const tall = camera.aspect < 1 ? 1 / camera.aspect : 1;
        const fp: Pose = { az: follow.final.az + 8, el: f.el, dist: f.dist * tall, tx: sub.x, ty: sub.y, tz: sub.z };
        let pose: Pose;
        if (at < f.until) {
          pose = blendPose(follow.from, fp, easeInOutCubic(clamp01((t - follow.t0) / 1300)));
        } else {
          const u = easeInOutCubic(clamp01((at - f.until) / 2.2));
          pose = blendPose(fp, follow.final, u);
          if (u >= 1) follow = null;
        }
        Object.assign(cam, pose);
      } else if (camTween) {
        const k = clamp01((t - camTween.start) / camTween.dur);
        const e = easeInOutCubic(k);
        const { from, to } = camTween;
        cam.az = lerp(from.az, to.az, e);
        cam.el = lerp(from.el, to.el, e);
        cam.dist = lerp(from.dist, to.dist, e);
        cam.tx = lerp(from.tx, to.tx, e);
        cam.ty = lerp(from.ty, to.ty, e);
        cam.tz = lerp(from.tz, to.tz, e);
        if (k >= 1) camTween = null;
      } else if (orbit && !userMoved) {
        cam.az += step * 4;
        orbited += step * 4;
        // One slow turn, then rest (no point drawing frames nobody asked for).
        if (orbited >= 360) orbit = false;
      }
      applyCamera();
      if (arrival && arrival.start > 0) {
        const at = (t - arrival.start) / 1000;
        if (at >= 0 && arrival.arrival.busy(at)) {
          arrival.arrival.update(at);
          renderer.shadowMap.needsUpdate = true;
        }
      }
      // Beacon pulse while the site is empty.
      if (beaconOn > 0.01) {
        const p = (elapsed % 2.4) / 2.4;
        ring.scale.setScalar(1 + p * 5);
        ringMat.opacity = 0.8 * (1 - p) * beaconOn;
        beamMat.opacity = 0.85 * beaconOn;
        crossMat.opacity = 0.7 * beaconOn;
      }
      beacon.visible = beaconOn > 0.01;
      const target = new THREE.Vector3(cam.tx, cam.ty, cam.tz);
      const px = renderer.getPixelRatio();
      if (weather) weather.update(opts.reduced ? 3 : elapsed, target, px);
      for (const f of fading) f.update(elapsed, target, px);
      renderer.render(scene, camera);
      dirty = false;
      emitTags();
    }
    if (active && (busy() || ambient())) kick();
    else lastFrame = 0;
  }

  function kick() {
    if (capture) return;
    if (!raf && active && !disposed) raf = requestAnimationFrame(frame);
  }
  /** Marks the view as changed and makes sure a frame is drawn. */
  function invalidate() {
    dirty = true;
    kick();
  }
  if (capture) {
    w.__campFrame = (ms: number) => {
      captureTime += ms;
      lastFrame = captureTime - ms;
      frame(captureTime);
    };
  }

  const resize = () => {
    const w = canvas.clientWidth || 1;
    const h = canvas.clientHeight || 1;
    renderer.setSize(w, h, false);
    camera.aspect = w / h;
    camera.updateProjectionMatrix();
    // Refit what the camera is framing (the cut-away, or the step's view) for the new shape,
    // keeping the angle and any move, follow or orbit under way.
    if (plan) {
      const fresh = framing();
      if (follow) follow.final = poseFor(plan, lastFocus);
      if (camTween) camTween.to = { ...fresh, az: camTween.to.az, el: camTween.to.el };
      else if (!userMoved && !follow) {
        cam.dist = fresh.dist;
        applyCamera();
      }
    }
    lastTags = "";
    invalidate();
  };

  let lastFocus: CampFocus = "empty";
  let lastFollowed: ArrivalState | null = null;
  let lastOrbitFocus: CampFocus = "empty";
  let firstPlan = true;

  const setPlan = (next: CampPlan, focus: CampFocus, o?: { instant?: boolean }) => {
    const instant = !!o?.instant;
    // Any change of plan or step closes the look-inside view.
    if (inside) closeInside(focus === "results" && next.units[0]?.id === inside.s.unit.id);
    plan = next;
    lastFocus = focus;
    resultsMode = focus === "results";
    if (!resultsMode && hoverId) {
      hoverId = null;
      opts.onHover?.(null);
    }

    setClimate(next.climate ?? "none");

    // Shelters: scan out what's gone, scan in what's new (rippling out from the lead).
    const ids = new Set(next.units.map((u) => u.id));
    let removing = false;
    for (const s of [...structs.values()]) {
      if (!ids.has(s.unit.id)) {
        removeStruct(s);
        removing = true;
      }
    }
    const base = removing ? 0.45 : 0.1;
    const order = [...next.units].sort((a, b) => Math.hypot(a.x, a.z) - Math.hypot(b.x, b.z));
    let n = 0;
    for (const u of order) {
      const s = structs.get(u.id);
      if (!s) {
        addStruct(u, instant ? 0 : base + Math.min(2.4, n * 0.14));
        n++;
      } else if (s.unit.x !== u.x || s.unit.z !== u.z) moveStruct(s, u);
    }

    // People for scale beside the lead shelter.
    const lead = next.units[0];
    // The figures belong to the lead shelter and leave with it.
    if (leadFigures && leadFigures.id !== lead?.id) leadFigures = null;
    if (lead && !leadFigures) {
      const s = structs.get(lead.id)!;
      const g = new THREE.Group();
      const sz = KIND_SIZE[lead.kind];
      // In front, toward the door end, clear of the walkway and the next shelter along.
      [[sz.l / 2 - 0.8, sz.w / 2 + 2.8], [sz.l / 2 + 0.2, sz.w / 2 + 3.4], [sz.l / 2 - 1.8, sz.w / 2 + 3.3]].forEach(([x, z], i) => {
        const f = figure(s.mats, shadows, i === 0);
        f.traverse((o) => (o.userData.ownGeometry = true));
        f.position.set(x, 0, z);
        f.rotation.y = 1.2 + i * 0.9;
        g.add(f);
      });
      s.root.add(g);
      leadFigures = { id: lead.id, group: g };
    }

    // Beacon fades once there is something on the site.
    const wantBeacon = next.units.length === 0 ? 1 : 0;
    if (wantBeacon !== beaconOn) {
      const from = beaconOn;
      tween(0, 0.6, (k) => (beaconOn = lerp(from, wantBeacon, k)), () => (beaconOn = wantBeacon), "beacon");
      if (opts.reduced) beaconOn = wantBeacon;
    }

    if (next.units[0]?.kind === "trecc") void loadStowed();
    setArrival(next, !instant);

    // Site works by tier.
    for (const tier of TIERS) setLayer(tier, next.props.filter((p) => p.tier === tier), instant ? 0 : 0.3);

    const b = next.bounds;
    const center = new THREE.Vector2((b.minX + b.maxX) / 2, (b.minZ + b.maxZ) / 2);
    const radius = Math.max(8, Math.hypot(b.maxX - b.minX, b.maxZ - b.minZ) / 2 + (next.duration === "years" ? 10 : 2));
    env.setSite(radius, center);
    setProps(next, arrival);

    // Camera: show what this answer changed; sweep around the finished camp.
    const wasResults = orbit || lastOrbitFocus === "results";
    orbit = focus === "results" && !opts.reduced && !(wasResults && orbited >= 360);
    if (focus === "results" && !wasResults) {
      userMoved = false;
      orbited = 0;
    }
    lastOrbitFocus = focus;
    moveCamera(poseFor(next, focus), instant || firstPlan);
    // A new arrival on the transport question: follow it in.
    follow = null;
    const fresh = arrival && arrival.start > 0 && (clock() - arrival.start) / 1000 < arrival.arrival.follow.until - 1;
    if (focus === "transport" && arrival && fresh && arrival !== lastFollowed && !opts.reduced && !instant && !firstPlan) {
      follow = { a: arrival, from: { ...cam }, t0: clock(), final: poseFor(next, focus) };
      lastFollowed = arrival;
      camTween = null;
    }
    firstPlan = false;
    lastTags = "";
    invalidate();
  };

  const onVisibility = () => {
    if (document.hidden) {
      if (raf) cancelAnimationFrame(raf);
      raf = 0;
      lastFrame = 0;
    } else invalidate();
  };
  document.addEventListener("visibilitychange", onVisibility);

  // ---- look inside ----------------------------------------------------------------------------
  let inside: { s: Struct; group: THREE.Group; cut: number } | null = null;

  const insidePose = (s: Struct, cut: number, az: number): Pose => {
    const model = s.model!;
    const u = s.unit;
    const m = 1.2;
    return fitBox(az, 54, { minX: u.x - model.l / 2 - m, maxX: u.x + model.l / 2 + m, minZ: u.z - model.w / 2 - m, maxZ: u.z + model.w / 2 + m, h: cut });
  };
  /** The view the camera should be holding right now. */
  function framing(): Pose {
    if (inside && inside.s.model) return insidePose(inside.s, inside.cut, cam.az);
    return poseFor(plan!, lastFocus);
  }

  const closeInside = (keepCamera: boolean) => {
    if (!inside) return;
    const { s, group, cut } = inside;
    inside = null;
    opts.onInside?.(false);
    if (leadFigures?.id === s.unit.id) leadFigures.group.visible = true;
    if (s.removed || !s.model) {
      disposeOwned(group);
      return;
    }
    const top = s.model.h + 0.4;
    tween(
      0,
      0.9,
      (k) => {
        s.reveal.set(lerp(cut, top, easeInOutCubic(k)), 1);
        renderer.shadowMap.needsUpdate = true;
      },
      () => {
        s.reveal.set(1e4, 0);
        group.removeFromParent();
        disposeOwned(group);
        renderer.shadowMap.needsUpdate = true;
      },
      `s:${s.unit.id}`,
    );
    if (keepCamera && plan) moveCamera(poseFor(plan, "results"), false);
  };

  const setInside = (on: boolean): boolean => {
    if (!plan || !resultsMode) return false;
    if (!on) {
      closeInside(true);
      return false;
    }
    if (inside) return true;
    const lead = plan.units[0];
    const s = lead ? structs.get(lead.id) : undefined;
    if (!s || !s.model) return false;
    const model = s.model;
    const real = lead.kind === "trecc" ? SYSTEM_MODELS.trecc : detailedModelFor(lead.kind);
    let group: THREE.Group;
    let cut: number;
    // The TRECC's camp model isn't Barry's file, so its fit-out isn't lined up with it here.
    if (lead.kind !== "trecc" && real?.inside && model.rig && fitoutForMission(real.slug, plan.mission)) {
      // The model's own example fit-out (one node of its fitted file), in the model's frame.
      group = new THREE.Group();
      group.rotation.y = Math.PI / 2;
      void fitoutFor(lead.kind, real).then((fit) => {
        if (!fit || inside?.group !== group) return;
        const m = meshesFor(fit.geo, s.mats, shadows);
        m.position.copy(fit.position);
        m.quaternion.copy(fit.quaternion);
        group.add(m);
        renderer.shadowMap.needsUpdate = true;
        invalidate();
      });
      cut = real.cutHeight ?? Math.min(2.1, model.h * 0.66);
    } else {
      group = buildInterior(plan.mission, { l: model.l, w: model.w, round: lead.kind === "polar-chief" }, s.mats, shadows);
      group.position.y = model.floorY ?? 0;
      group.traverse((o) => (o.userData.ownGeometry = true));
      // Cut just above the tallest furniture for the mission, and always below the roof.
      const furniture: Record<string, number> = { command: 1.25, medical: 1.45, maintenance: 1.9, living: 1.75, research: 1.25, response: 0.8 };
      const top = furniture[plan.mission ?? "response"] ?? 1.3;
      cut = Math.min(model.h - 0.25, Math.min(2.8, Math.max(top + 0.15, model.h * 0.5)));
    }
    s.root.add(group);
    inside = { s, group, cut };
    // The people outside would be cut in half; they step out of the drawing for this view.
    if (leadFigures?.id === lead.id) leadFigures.group.visible = false;
    orbit = false;
    tween(
      0,
      1.2,
      (k) => {
        s.reveal.set(lerp(model.h + 0.4, cut, easeInOutCubic(k)), 1);
        renderer.shadowMap.needsUpdate = true;
      },
      // Leave a faint orange edge along the cut, like a drawing's section line.
      () => s.reveal.set(cut, 0.5),
      `s:${s.unit.id}`,
    );
    moveCamera(insidePose(s, cut, cam.az), false);
    opts.onInside?.(true);
    return true;
  };

  const snapshot = (width: number): string | null => {
    try {
      // Draw and read back in the same task, so the buffer is still there.
      renderer.render(scene, camera);
      const src = renderer.domElement;
      // Crop to 16:10 around the middle, so a tall phone canvas still gives a wide picture.
      const aspect = 1.6;
      let sw = src.width;
      let sh = src.height;
      if (sw / sh < aspect) sh = Math.round(sw / aspect);
      else sw = Math.round(sh * aspect);
      const sx = Math.round((src.width - sw) / 2);
      const sy = Math.round((src.height - sh) * 0.45);
      const scale = Math.min(1, width / sw);
      const out = document.createElement("canvas");
      out.width = Math.round(sw * scale);
      out.height = Math.round(sh * scale);
      out.getContext("2d")?.drawImage(src, sx, sy, sw, sh, 0, 0, out.width, out.height);
      return out.toDataURL("image/jpeg", 0.82);
    } catch {
      return null;
    }
  };

  resize();
  applyCamera();
  kick();
  if (process.env.NODE_ENV !== "production") {
    (window as unknown as { __campInfo?: () => unknown }).__campInfo = () => ({
      calls: renderer.info.render.calls,
      triangles: renderer.info.render.triangles,
      geometries: renderer.info.memory.geometries,
      programs: renderer.info.programs?.length,
      structs: structs.size,
      quality,
    });
  }

  return {
    setPlan,
    setLive: (next) => {
      live = next;
      setClimate(climateKey);
      invalidate();
    },
    setActive: (on) => {
      active = on;
      if (on) invalidate();
      else {
        if (raf) cancelAnimationFrame(raf);
        raf = 0;
        lastFrame = 0;
      }
    },
    resize,
    setInside,
    snapshot,
    isBusy: () => busy() || ambient(),
    dispose: () => {
      disposed = true;
      if (raf) cancelAnimationFrame(raf);
      document.removeEventListener("visibilitychange", onVisibility);
      canvas.removeEventListener("pointerdown", onDown);
      canvas.removeEventListener("pointermove", onMove);
      canvas.removeEventListener("pointerup", onUp);
      canvas.removeEventListener("pointercancel", onCancel);
      canvas.removeEventListener("pointerleave", onLeave);
      arrival?.arrival.dispose();
      weather?.dispose();
      fading.forEach((f) => f.dispose());
      (props?.group.userData.dispose as (() => void) | undefined)?.();
      for (const s of structs.values()) {
        disposeOwned(s.root);
        Object.values(s.mats).forEach((m) => m.dispose());
      }
      for (const l of layers.values()) {
        Object.values(l.mats).forEach((m) => m.dispose());
        l.layer.group.traverse((o) => (o as THREE.Mesh).isMesh && (o as THREE.Mesh).geometry.dispose());
      }
      for (const k of kinds.values()) disposeModel(k);
      if (stowed) Object.values(stowed).forEach((g) => g?.dispose());
      void treccPromise?.then(disposeModel);
      for (const p of detailedPromises.values()) void p.then((m) => (m as KindModel & { dispose?: () => void }).dispose?.());
      for (const st of packed.values()) if (st.geo) Object.values(st.geo).forEach((g) => g?.dispose());
      draco?.dispose();
      for (const f of fitouts.values()) void f.then((fit) => fit && Object.values(fit.geo).forEach((x) => x?.dispose()));
      pickMat.dispose();
      frames.forEach((f) => f.dispose());
      sharedSets.forEach((set) => Object.values(set).forEach((m) => m.dispose()));
      [frameMat, beamMat, ringMat, crossMat].forEach((m) => m.dispose());
      beam.geometry.dispose();
      ring.geometry.dispose();
      cross.geometry.dispose();
      disposeGlowTexture();
      env.dispose();
      envTex.dispose();
      pmrem.dispose();
      renderer.dispose();
      renderer.forceContextLoss();
    },
  };
}

/** Frees geometry made for one structure only (the scale figures); shared model geometry stays. */
function blendPose(a: { az: number; el: number; dist: number; tx: number; ty: number; tz: number }, b: typeof a, t: number): typeof a {
  let d = b.az - a.az;
  d = ((((d + 180) % 360) + 360) % 360) - 180;
  return {
    az: a.az + d * t,
    el: a.el + (b.el - a.el) * t,
    dist: a.dist + (b.dist - a.dist) * t,
    tx: a.tx + (b.tx - a.tx) * t,
    ty: a.ty + (b.ty - a.ty) * t,
    tz: a.tz + (b.tz - a.tz) * t,
  };
}

function disposeOwned(root: THREE.Object3D) {
  root.traverse((o) => {
    if (o.userData.ownGeometry && (o as THREE.Mesh).isMesh) (o as THREE.Mesh).geometry.dispose();
  });
}

function disposeModel(m: KindModel) {
  Object.values(m.body).forEach((g) => g?.dispose());
  m.moving.forEach((p) => Object.values(p.geo).forEach((g) => g?.dispose()));
}

/** Copies a (possibly quantized) geometry's position and normal into plain floats so it can be
 * transformed and merged. */
/** Turns a lining's faces to point at the unit's centre line (x = 0), so one-sided drawing shows it from inside. */
function faceInward(geo: THREE.BufferGeometry) {
  const pos = geo.getAttribute("position");
  const nor = geo.getAttribute("normal");
  if (!nor) return;
  geo.computeBoundingBox();
  const cy = (geo.boundingBox!.min.y + geo.boundingBox!.max.y) / 2;
  let outward = 0;
  for (let i = 0; i < pos.count; i++) outward += nor.getX(i) * pos.getX(i) + nor.getY(i) * (pos.getY(i) - cy) > 0 ? 1 : -1;
  if (outward <= 0) return;
  for (let i = 0; i < nor.count; i++) nor.setXYZ(i, -nor.getX(i), -nor.getY(i), -nor.getZ(i));
  const index = geo.getIndex();
  if (index) {
    for (let i = 0; i < index.count; i += 3) {
      const b = index.getX(i + 1);
      index.setX(i + 1, index.getX(i + 2));
      index.setX(i + 2, b);
    }
  } else {
    for (const a of [pos, nor]) {
      for (let i = 0; i + 2 < a.count; i += 3) {
        const x = a.getX(i + 1), y = a.getY(i + 1), z = a.getZ(i + 1);
        a.setXYZ(i + 1, a.getX(i + 2), a.getY(i + 2), a.getZ(i + 2));
        a.setXYZ(i + 2, x, y, z);
      }
    }
  }
}

function toFloat(src: THREE.BufferGeometry): THREE.BufferGeometry {
  const g = new THREE.BufferGeometry();
  for (const name of ["position", "normal"] as const) {
    const a = src.getAttribute(name) as THREE.BufferAttribute | undefined;
    if (!a) continue;
    const out = new Float32Array(a.count * 3);
    for (let i = 0; i < a.count; i++) {
      out[i * 3] = a.getX(i);
      out[i * 3 + 1] = a.getY(i);
      out[i * 3 + 2] = a.getZ(i);
    }
    g.setAttribute(name, new THREE.BufferAttribute(out, 3));
  }
  if (src.index) g.setIndex(src.index.clone());
  if (!g.getAttribute("normal")) g.computeVertexNormals();
  return g;
}
