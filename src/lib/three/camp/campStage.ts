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
 * Renders only while something moves, and not at all while off screen.
 */
import * as THREE from "three";
import { GLTFLoader } from "three/examples/jsm/loaders/GLTFLoader.js";
import { MeshoptDecoder } from "three/examples/jsm/libs/meshopt_decoder.module.js";
import { RoomEnvironment } from "three/examples/jsm/environments/RoomEnvironment.js";
import { KIND_SIZE, type CampPlan, type CampProp, type CampUnit, type ModelKind } from "@/lib/camp-scene-plan";
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
import { buildKind, scanFrame, treccStandIn, type KindModel } from "@/lib/three/camp/shelters";
import { CLIMATES, createEnvironment, createProps, createWeather, mixPreset, type Avoid, type ClimateKey, type ClimatePreset, type Weather } from "@/lib/three/camp/environment";
import { createArrival, type Arrival, type ArrivalMats } from "@/lib/three/camp/arrivals";
import { figure } from "@/lib/three/camp/vehicles";
import { buildSiteLayer, disposeGlowTexture, type SiteLayer } from "@/lib/three/camp/siteworks";

export const TRECC_CAMP_MODEL = "/models/trecc-camp.glb";

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
};

export type CampStage = {
  setPlan: (plan: CampPlan, focus: CampFocus, opts?: { instant?: boolean }) => void;
  setActive: (on: boolean) => void;
  resize: () => void;
  dispose: () => void;
  /** For tests: true while anything is still animating. */
  isBusy: () => boolean;
};

type Struct = {
  unit: CampUnit;
  root: THREE.Group;
  mats: MatSet;
  reveal: Reveal;
  frame: THREE.LineSegments;
  model: KindModel | null;
  moving: { obj: THREE.Object3D; path: [number, number, number][] }[];
  keepColors: boolean;
  /** Current reveal height (for scanning back down from wherever it got to). */
  y: number;
  removed: boolean;
};

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
  /** Starts a tween; one with the same key replaces any still running (without finishing it). */
  const tween = (delay: number, dur: number, update: (k: number) => void, done?: () => void, key?: string) => {
    if (key) for (let i = tweens.length - 1; i >= 0; i--) if (tweens[i].key === key) tweens.splice(i, 1);
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
  const sharedSets = [vehicleMats, aircraftMats, groundMats, ...containerMats];
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

  const modelFor = (kind: ModelKind): KindModel | Promise<KindModel> => {
    if (kind === "trecc") return loadTrecc();
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
    s.root.add(meshesFor(model.body, s.mats, shadows));
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
        if (model.style === "expand" && s.moving.length) {
          tween(
            0.05,
            1.1,
            (k) => {
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
    s.frame.visible = true;
    tween(
      0,
      0.55,
      (k) => {
        const y = lerp(from, -0.05, easeInOutCubic(k));
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

  const setClimate = (next: ClimateKey) => {
    if (next === climateKey) return;
    // Start from what is on screen, even if the last change is still fading in.
    const from = climateE >= 1 ? shownPreset : mixPreset(climateFrom, climateTo, climateE);
    const to = CLIMATES[next];
    climateFrom = from;
    climateTo = to;
    climateE = 0;
    const shells = new Map([...structs.values()].map((s) => [s, { a: s.mats.shell.color.clone(), b: s.mats.shell2.color.clone() }]));
    climateKey = next;
    finish = to.finish;
    // Vehicles follow the finish too.
    vehicleMats.shell.color.setHex(FINISH_COLORS[finish === "white" ? "green" : finish].shell);
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
    // Weather: fade the old one out, the new one in.
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
  let arrival: { group: THREE.Group; arrival: Arrival; kind: string; start: number; climate: string; lead: string } | null = null;

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
      const made = createArrival(site.kind, plan, arrivalMats, shadows);
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

  // Headless test runs can set window.__CAMP_STILL__ so the scene stops drawing once built.
  const still = () => !!(window as unknown as { __CAMP_STILL__?: boolean }).__CAMP_STILL__;
  const ambient = () => !opts.reduced && !still() && (!!weather || fading.length > 0 || beaconOn > 0.01 || orbit);
  const busy = () =>
    tweens.length > 0 || !!camTween || (arrival && !opts.reduced && arrival.arrival.busy((now - arrival.start) / 1000)) || false;

  function frame(t: number) {
    raf = 0;
    if (disposed) return;
    now = t;
    const dt = lastFrame ? Math.min(0.1, (t - lastFrame) / 1000) : 1 / 60;
    lastFrame = t;
    const isBusy = busy();
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
      if (camTween) {
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
    // Refit the distance for the new shape, keeping the angle (and any move or orbit under way).
    if (plan) {
      const fresh = poseFor(plan, lastFocus);
      if (camTween) camTween.to = { ...fresh, az: camTween.to.az, el: camTween.to.el };
      else if (!userMoved) {
        cam.dist = fresh.dist;
        applyCamera();
      }
    }
    lastTags = "";
    invalidate();
  };

  let lastFocus: CampFocus = "empty";
  let lastOrbitFocus: CampFocus = "empty";
  let firstPlan = true;

  const setPlan = (next: CampPlan, focus: CampFocus, o?: { instant?: boolean }) => {
    const instant = !!o?.instant;
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
    });
  }

  return {
    setPlan,
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
      void treccPromise?.then(disposeModel);
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
