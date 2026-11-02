/**
 * Framework-free three.js stage for any system with a model in the registry (src/lib/system-models.ts):
 * the product page's 3D viewer for everything except the TRECC (which keeps treccStage).
 *
 * Packed ↔ deployed plays the model's own deploy animation (the glTF clip in Barry's files): a
 * container's clip starts from the closed container, so scrubbing it is the whole story; a soft
 * shelter's clip builds it up from bare ground, so the packed view is its own file (crates, bags),
 * which gives way to the clip. Models without a clip fall back to the registry's `articulation`
 * (hinge nodes rotate, unfold nodes open out from a hinge line) or a plain swap to the stowed file.
 *
 * Lit by the sky file the models were colour-checked under (public/models/env, from Barry's web kit)
 * with neutral tone mapping, plus a sun for the contact shadow, on the site's dark ground and grid.
 */
import * as THREE from "three";
import { GLTFLoader, type GLTF } from "three/examples/jsm/loaders/GLTFLoader.js";
import { DRACOLoader } from "three/examples/jsm/loaders/DRACOLoader.js";
import { MeshoptDecoder } from "three/examples/jsm/libs/meshopt_decoder.module.js";
import { RoomEnvironment } from "three/examples/jsm/environments/RoomEnvironment.js";
import { HDRLoader } from "three/examples/jsm/loaders/HDRLoader.js";
import { OrbitControls } from "three/examples/jsm/controls/OrbitControls.js";
import type { SystemModel } from "@/lib/system-models";
import type { TreccFinish } from "@/lib/three/treccFinishes";
import { withImageTextures } from "@/lib/three/gltfImageTextures";

/** Same Draco decoder the AR page uses (the newer one; model-viewer and three both read it). */
const DRACO_PATH = "/assets/draco-ar/";
/** Outdoor sky the models were colour-checked under, cut down to 256 × 128 for lighting only. */
const SKY_HDR = "/models/env/desert-sky-256.hdr";
/** Share of the deploy toggle spent on the packed file before a soft shelter's clip takes over. */
const PACKED_SHARE = 0.16;

/** Finish colours (linear RGB). Green keeps the model's own colours. */
const FINISH_COLORS: Record<Exclude<TreccFinish, "green">, { paint: [number, number, number]; fabric: [number, number, number] }> = {
  tan: { paint: [0.34, 0.27, 0.135], fabric: [0.431, 0.323, 0.157] },
  arctic: { paint: [0.72, 0.74, 0.74], fabric: [0.693, 0.672, 0.604] },
};

export type SystemStage = {
  /** 0 = packed, 1 = deployed. */
  setDeploy: (t: number) => void;
  setFinish: (finish: TreccFinish, animate?: boolean) => void;
  /** Turns on drag-to-rotate; onChange fires whenever the view moves. */
  enableControls: (onChange?: () => void) => void;
  turn: (degrees: number) => void;
  render: () => void;
  resize: () => void;
  dispose: () => void;
  /** True while a finish change still needs frames. */
  isAnimating: () => boolean;
  /** Whether the model can show a packed state at all. */
  canStow: boolean;
  /** How long a full packed ↔ deployed run should take (the clip's own pace when there is one). */
  deployMs: number;
  /** Whether the registry lists an example fit-out for "Show inside". */
  hasInside: boolean;
  /**
   * Cuts the shell away above a horizontal line and shows the fit-out, with the camera eased to look
   * down in. The fit-out file loads on the first call. Assumes the model is deployed.
   */
  setInside: (on: boolean, animate?: boolean) => Promise<void>;
  /** Starts (or reuses) the fit-out download without showing it. */
  preloadInside: () => Promise<void>;
  /** 0 = roof on, 1 = fully cut away (eases between). */
  insideProgress: () => number;
};

/** Ease in-out cubic, as the deploy toggle uses. */
const easeInOut = (t: number) => (t < 0.5 ? 4 * t * t * t : 1 - (-2 * t + 2) ** 3 / 2);
/** How long the cut and the camera move take. */
const INSIDE_MS = 1300;
/** Camera height while looking in (degrees above the horizon); within the orbit limits. */
const INSIDE_ELEVATION = 47;
const OUTSIDE_ELEVATION = 17;

const clamp01 = (v: number) => Math.min(1, Math.max(0, v));
const smooth = (a: number, b: number, v: number) => {
  const t = clamp01((v - a) / (b - a));
  return t * t * (3 - 2 * t);
};

export async function createSystemStage(
  canvas: HTMLCanvasElement,
  model: SystemModel,
  { maxDpr = 1.75, shadows = true }: { maxDpr?: number; shadows?: boolean } = {},
): Promise<SystemStage> {
  const renderer = new THREE.WebGLRenderer({ canvas, antialias: true, alpha: true, powerPreference: "high-performance" });
  renderer.setPixelRatio(Math.min(window.devicePixelRatio || 1, maxDpr));
  // Neutral, as the models were colour-checked: ACES would shift the CARC greens toward olive.
  renderer.toneMapping = THREE.NeutralToneMapping;
  renderer.toneMappingExposure = 1.0;
  renderer.shadowMap.enabled = shadows;
  renderer.shadowMap.type = THREE.PCFShadowMap;
  // The light is fixed; the shadow only changes while the model folds, so redraw it on demand.
  renderer.shadowMap.autoUpdate = false;
  renderer.shadowMap.needsUpdate = true;
  // "Show inside" clips the shell's materials only (the fit-out's have no planes).
  renderer.localClippingEnabled = true;

  const scene = new THREE.Scene();
  const pmrem = new THREE.PMREMGenerator(renderer);
  let envTex: THREE.Texture | null = null;
  // Fetched alongside the model; applied once both are in (see below).
  const hdrLoad = new HDRLoader().loadAsync(SKY_HDR).catch(() => null);

  // The sun for the contact shadow (the sky already carries most of the light), a cool fill from the
  // sky side and a little orange rim from behind, as on the TRECC stage.
  const key = new THREE.DirectionalLight(0xfff4e6, 1.4);
  key.castShadow = shadows;
  key.shadow.mapSize.set(2048, 2048);
  key.shadow.bias = -0.0004;
  key.shadow.normalBias = 0.02;
  scene.add(key);
  scene.add(key.target);
  const hemi = new THREE.HemisphereLight(0x9fb7d1, 0x0a0f17, 0.2);
  scene.add(hemi);
  const rim = new THREE.DirectionalLight(0xffb070, 0.6);
  scene.add(rim);

  // Load the model(s).
  const loader = withImageTextures(new GLTFLoader());
  let draco: DRACOLoader | null = null;
  if (model.compression === "draco") {
    draco = new DRACOLoader().setDecoderPath(DRACO_PATH);
    loader.setDRACOLoader(draco);
  } else {
    loader.setMeshoptDecoder(MeshoptDecoder);
  }

  let controls: OrbitControls | null = null;
  const disposeAll = () => {
    controls?.dispose();
    controls = null;
    scene.traverse((o) => {
      const mesh = o as THREE.Mesh;
      if (mesh.geometry) mesh.geometry.dispose();
      const mats = mesh.material ? (Array.isArray(mesh.material) ? mesh.material : [mesh.material]) : [];
      mats.forEach((m) => m.dispose());
    });
    draco?.dispose();
    key.dispose();
    rim.dispose();
    hemi.dispose();
    envTex?.dispose();
    pmrem.dispose();
    renderer.dispose();
    renderer.forceContextLoss();
  };

  // Soft shelters (and models without articulation) show their packed file; containers fold themselves.
  const swapStowed = !model.articulation && !!model.stowed;
  let gltf: GLTF;
  let stowedGltf: GLTF | null = null;
  try {
    [gltf, stowedGltf] = await Promise.all([
      loader.loadAsync(model.deployed),
      swapStowed && model.stowed ? loader.loadAsync(model.stowed) : Promise.resolve(null),
    ]);
  } catch (err) {
    disposeAll();
    throw err;
  }
  // The decoder's workers aren't needed once the files are in.
  draco?.dispose();
  draco = null;

  // The sky file lights the model; if it couldn't load, the studio room the TRECC stage uses stands
  // in, with the stronger lights that stage uses.
  const hdr = await hdrLoad;
  if (hdr) {
    hdr.mapping = THREE.EquirectangularReflectionMapping;
    envTex = pmrem.fromEquirectangular(hdr).texture;
    hdr.dispose();
    scene.environmentIntensity = 0.9;
  } else {
    const room = new RoomEnvironment();
    envTex = pmrem.fromScene(room, 0.04).texture;
    room.dispose();
    scene.environmentIntensity = 0.42;
    key.intensity = 2.3;
    hemi.intensity = 0.4;
    rim.intensity = 1.1;
  }
  scene.environment = envTex;

  const root = gltf.scene;
  scene.add(root);
  if (stowedGltf) scene.add(stowedGltf.scene);

  // Materials: clone per stage, remember the originals for the green finish.
  const paintNames = new Set(model.finishMaterials?.paint ?? []);
  const fabricNames = new Set(model.finishMaterials?.fabric ?? []);
  const tinted: { mat: THREE.MeshStandardMaterial; group: "paint" | "fabric"; base: THREE.Color; rel: number }[] = [];
  const groupRef: Partial<Record<"paint" | "fabric", number>> = {};
  const lum = (c: THREE.Color) => 0.2126 * c.r + 0.7152 * c.g + 0.0722 * c.b;
  const prep = (obj: THREE.Object3D) => {
    obj.traverse((o) => {
      const mesh = o as THREE.Mesh;
      if (!mesh.isMesh) return;
      mesh.castShadow = shadows;
      mesh.receiveShadow = false;
      const mats = Array.isArray(mesh.material) ? mesh.material : [mesh.material];
      const next = mats.map((m) => {
        const mat = (m as THREE.MeshStandardMaterial).clone();
        const group = paintNames.has(mat.name) ? "paint" : fabricNames.has(mat.name) ? "fabric" : null;
        if (group) {
          const base = mat.color.clone();
          // The first material named in each group sets the reference brightness; the others
          // (darker trim, straps) keep their brightness relative to it in every finish.
          const first = (group === "paint" ? model.finishMaterials?.paint[0] : model.finishMaterials?.fabric[0]) === mat.name;
          if (first && groupRef[group] === undefined) groupRef[group] = Math.max(lum(base), 1e-4);
          tinted.push({ mat, group, base, rel: lum(base) });
        }
        return mat;
      });
      mesh.material = (next.length === 1 ? next[0] : next) as never;
    });
  };
  prep(root);
  if (stowedGltf) prep(stowedGltf.scene);
  for (const t of tinted) t.rel = t.rel / (groupRef[t.group] ?? Math.max(t.rel, 1e-4));

  // ---- deploy animation -------------------------------------------------------------
  const clip = gltf.animations[0] ?? null;
  const mixer = clip ? new THREE.AnimationMixer(root) : null;
  const action = mixer && clip ? mixer.clipAction(clip) : null;
  if (action) {
    action.setLoop(THREE.LoopOnce, 1);
    action.clampWhenFinished = true;
    action.play();
  }
  /** Poses the model at a point in its clip (a finished LoopOnce action pauses itself, so un-pause). */
  const scrub = (seconds: number) => {
    if (!mixer || !action || !clip) return;
    action.enabled = true;
    action.paused = false;
    action.time = Math.min(Math.max(seconds, 0), clip.duration);
    mixer.update(0);
  };

  // ---- articulation (files without a clip) ---------------------------------------------
  const byName = (name: string) => root.getObjectByName(name) ?? null;
  const hinges = (model.articulation?.hinges ?? []).flatMap(({ node, stowed }) => {
    const obj = byName(node);
    if (!obj) return [];
    return [{ obj, open: obj.quaternion.clone(), closed: new THREE.Quaternion().setFromAxisAngle(new THREE.Vector3(0, 0, 1), stowed) }];
  });
  const unfolds = (model.articulation?.unfold ?? []).flatMap(({ node, pivotX }) => {
    const obj = byName(node);
    if (!obj || !obj.parent) return [];
    // Wrap in a pivot on the hinge line so a scale along X opens it out from the container edge.
    const pivot = new THREE.Group();
    pivot.name = `${node}_pivot`;
    pivot.position.set(pivotX, 0, 0);
    obj.parent.add(pivot);
    obj.position.x -= pivotX;
    pivot.add(obj);
    return [pivot];
  });
  const hidden = (model.articulation?.hideStowed ?? []).flatMap((name) => {
    const obj = byName(name);
    return obj ? [obj] : [];
  });
  // Parts the clip grows in last (interior, site kit): left out of the framing, as `hidden` is.
  const grown = clip ? root.children.filter((n) => /_(interior|site_kit)$/i.test(n.name)) : [];
  const canStow = !!clip || hinges.length > 0 || unfolds.length > 0 || !!stowedGltf;

  // ---- framing ------------------------------------------------------------------------
  // The deployed footprint without the nodes hidden while packed: interiors sit inside it anyway,
  // and site kits (cables, earth rods) spread out on the ground and would shrink the model in frame.
  const box = new THREE.Box3();
  const leaveOut = new Set<THREE.Object3D>();
  for (const h of [...hidden, ...grown]) h.traverse((o) => leaveOut.add(o));
  root.updateMatrixWorld(true);
  // Guy ropes and other thin lines reach far past the shelter; frame on the shelter itself.
  const thin = (mesh: THREE.Mesh) =>
    (Array.isArray(mesh.material) ? mesh.material : [mesh.material]).every((m) => /rope|guy|cable/i.test(m.name));
  root.traverse((o) => {
    const mesh = o as THREE.Mesh;
    if (mesh.isMesh && !leaveOut.has(mesh) && !thin(mesh)) box.expandByObject(mesh);
  });
  const size = box.getSize(new THREE.Vector3());
  const center = box.getCenter(new THREE.Vector3());
  const radius = Math.max(size.x, size.z) / 2;
  const groundR = radius * 2.6 + 2;

  // High and slightly to one side, so the contact shadow sits under the shelter rather than beside it.
  key.position.set(center.x + radius * 0.9, radius * 3.4 + 4, center.z + radius * 1.1);
  key.target.position.set(center.x, 0, center.z);
  const sc = radius * 1.6 + 1;
  Object.assign(key.shadow.camera, { left: -sc, right: sc, top: sc, bottom: -sc, near: 0.5, far: radius * 8 + 20 });
  key.shadow.camera.updateProjectionMatrix();
  rim.position.set(center.x - radius * 2.4, radius * 1.2 + 2, center.z - radius * 2.2);
  scene.fog = new THREE.Fog(0x0a0f17, radius * 3.2 + 4, radius * 7 + 12);

  // Ground: soft contact shadow + a blueprint grid (1 m and 0.5 m) fading out radially.
  const shadowFloor = new THREE.Mesh(new THREE.CircleGeometry(groundR, 64), new THREE.ShadowMaterial({ color: 0x000000, opacity: 0.42 }));
  shadowFloor.rotation.x = -Math.PI / 2;
  shadowFloor.position.set(center.x, 0, center.z);
  shadowFloor.receiveShadow = true;
  scene.add(shadowFloor);
  const gridMat = new THREE.ShaderMaterial({
    transparent: true,
    depthWrite: false,
    uniforms: { uColor: { value: new THREE.Color(0x94aac4) }, uFade: { value: new THREE.Vector2(radius * 0.9, radius * 2.4 + 2) } },
    vertexShader: /* glsl */ `
      varying vec2 vXZ;
      void main() {
        vec4 w = modelMatrix * vec4(position, 1.0);
        vXZ = w.xz;
        gl_Position = projectionMatrix * viewMatrix * w;
      }`,
    fragmentShader: /* glsl */ `
      uniform vec3 uColor;
      uniform vec2 uFade;
      varying vec2 vXZ;
      float line(float x, float w) {
        float d = abs(fract(x - 0.5) - 0.5) / fwidth(x);
        return 1.0 - min(d / w, 1.0);
      }
      void main() {
        float minor = max(line(vXZ.x * 2.0, 1.0), line(vXZ.y * 2.0, 1.0)) * 0.35;
        float major = max(line(vXZ.x * 0.5, 1.2), line(vXZ.y * 0.5, 1.2));
        float fade = 1.0 - smoothstep(uFade.x, uFade.y, length(vXZ));
        float a = max(minor, major) * fade * 0.16;
        if (a < 0.002) discard;
        gl_FragColor = vec4(uColor, a);
      }`,
  });
  const grid = new THREE.Mesh(new THREE.PlaneGeometry(groundR * 2.2, groundR * 2.2), gridMat);
  grid.rotation.x = -Math.PI / 2;
  grid.position.y = 0.001;
  scene.add(grid);

  // Camera: three-quarter view of the end with the door (the side the site kit lies on, when there
  // is one; otherwise +Z), framed on the deployed footprint.
  const siteKit = [...hidden, ...grown].find((h) => /site|kit/i.test(h.name));
  let doorSign = 1;
  if (siteKit) {
    const kb = new THREE.Box3().setFromObject(siteKit);
    doorSign = kb.getCenter(new THREE.Vector3()).z < center.z ? -1 : 1;
  }
  const camera = new THREE.PerspectiveCamera(30, 1, 0.1, radius * 20 + 40);
  const target = new THREE.Vector3(center.x, size.y * 0.38, center.z);
  const az = THREE.MathUtils.degToRad(doorSign > 0 ? 36 : 180 + 36);
  const el = THREE.MathUtils.degToRad(17);
  let dist = 10;
  /** The camera backs off a little while looking in: seen from above, the footprint is taller in frame. */
  let viewZoom = 1;
  // Sit the model a little above centre so the ground-level site kit clears the controls along the
  // bottom (the camera still turns about the model's centre); centred while looking in from above.
  let viewLift = 0.06;
  const applyViewOffset = () => {
    const w = canvas.clientWidth || 1;
    const h = canvas.clientHeight || 1;
    camera.setViewOffset(w, h, 0, h * viewLift, w, h);
  };
  const place = () => {
    camera.position.set(
      target.x + dist * Math.cos(el) * Math.sin(az),
      target.y + dist * Math.sin(el),
      target.z + dist * Math.cos(el) * Math.cos(az),
    );
    camera.lookAt(target);
  };

  const resize = () => {
    const w = canvas.clientWidth || 1;
    const h = canvas.clientHeight || 1;
    renderer.setSize(w, h, false);
    camera.aspect = w / h;
    camera.fov = Math.max(30, Math.min(48, 30 / Math.min(1, camera.aspect / 1.5)));
    // Fit the footprint's bounding sphere across the narrower of the two fields of view.
    const vfov = THREE.MathUtils.degToRad(camera.fov);
    const hfov = 2 * Math.atan(Math.tan(vfov / 2) * camera.aspect);
    const fitR = Math.hypot(size.x, size.z, size.y) / 2;
    // A little wider on the phones' 4:3 box, where the controls cover more of the picture.
    dist = (fitR / Math.sin(Math.min(vfov, hfov) / 2)) * (camera.aspect < 1.5 ? 0.92 : 0.82);
    // There's no zoom, so the near plane can sit well in front of the model; a tight near plane keeps
    // the depth precision that stops close layers (fabric over liner) flickering mid-unfold.
    camera.near = Math.max(0.1, dist * 0.2);
    if (!controls) place();
    else {
      // Keep the visitor's angle; only change how far away the camera sits.
      const dir = camera.position.clone().sub(controls.target).normalize();
      camera.position.copy(controls.target).addScaledVector(dir, dist * viewZoom);
    }
    applyViewOffset();
    camera.updateProjectionMatrix();
  };
  resize();

  // ---- deploy state -----------------------------------------------------------------
  let deploy = -1;
  const setDeploy = (t: number) => {
    const next = clamp01(t);
    if (next === deploy) return;
    deploy = next;
    if (mixer && clip) {
      if (stowedGltf) {
        // Packed file first; it sinks away as the shelter starts to go up from the ground.
        const k = smooth(PACKED_SHARE - 0.07, PACKED_SHARE, deploy);
        stowedGltf.scene.visible = k < 1;
        stowedGltf.scene.scale.setScalar(Math.max(1 - k, 0.0001));
        root.visible = deploy > PACKED_SHARE - 0.01;
        scrub(clamp01((deploy - PACKED_SHARE) / (1 - PACKED_SHARE)) * clip.duration);
      } else {
        scrub(deploy * clip.duration);
      }
      renderer.shadowMap.needsUpdate = true;
      return;
    }
    // The walls swing down first; the fabric opens out over them; the inside appears last.
    const wall = smooth(0, 0.58, deploy);
    for (const h of hinges) h.obj.quaternion.slerpQuaternions(h.closed, h.open, wall);
    const open = smooth(0.42, 1, deploy);
    for (const p of unfolds) {
      p.scale.set(Math.max(open, 0.0001), 1, 1);
      // Squashed almost flat it would flicker against the container side, so it appears a little open.
      p.visible = open > 0.1;
    }
    for (const n of hidden) n.visible = deploy > 0.97;
    if (stowedGltf) {
      stowedGltf.scene.visible = deploy < 0.5;
      root.visible = deploy >= 0.5;
    }
    renderer.shadowMap.needsUpdate = true;
  };
  setDeploy(1);

  // ---- inside -----------------------------------------------------------------------
  // The shell is cut by a horizontal plane that sweeps down from above the roof to the cut height;
  // the cut-open walls are drawn double-sided so you see their inner faces, not holes.
  const shellMats: { mat: THREE.Material; side: THREE.Side }[] = [];
  root.traverse((o) => {
    const mesh = o as THREE.Mesh;
    if (!mesh.isMesh) return;
    for (const mat of Array.isArray(mesh.material) ? mesh.material : [mesh.material]) shellMats.push({ mat, side: mat.side });
  });
  const topY = box.max.y + 0.5;
  const cut = new THREE.Plane(new THREE.Vector3(0, -1, 0), topY);
  let cutY = model.cutHeight ?? Math.min(size.y * 0.62, 2.1);
  let shellCut = false;
  const setShellCut = (on: boolean) => {
    if (on === shellCut) return;
    shellCut = on;
    for (const { mat, side } of shellMats) {
      mat.clippingPlanes = on ? [cut] : null;
      mat.clipShadows = on;
      mat.side = on ? THREE.DoubleSide : side;
      mat.needsUpdate = true;
    }
  };

  // Screens and lights glow while inside is shown (the files carry no emission of their own).
  const lit: { mat: THREE.MeshStandardMaterial; color: THREE.Color; strength: number }[] = [];
  const addLit = (mat: THREE.MeshStandardMaterial) => {
    const name = mat.name.toLowerCase();
    if (!/^(screen_lit|light|fire)/.test(name) || lit.some((l) => l.mat === mat)) return;
    const c = mat.color.clone();
    const peak = Math.max(c.r, c.g, c.b);
    let color: THREE.Color;
    if (/exit/.test(name)) color = new THREE.Color(0.1, 1, 0.35);
    else if (mat.map) color = new THREE.Color(1, 1, 1);
    else if (peak > 1e-4 && peak < 0.6) color = c.multiplyScalar(1 / peak);
    else color = new THREE.Color(1, 0.93, 0.8);
    if (mat.map) mat.emissiveMap = mat.map;
    mat.emissive.setRGB(0, 0, 0);
    lit.push({ mat, color, strength: name.startsWith("light") ? 0.9 : 1.5 });
  };
  for (const { mat } of shellMats) addLit(mat as THREE.MeshStandardMaterial);

  let fitout: THREE.Object3D | null = null;
  let fitoutLoad: Promise<void> | null = null;
  const loadFitout = () => {
    const spec = model.inside;
    if (!spec) return Promise.resolve();
    fitoutLoad ??= (async () => {
      const l = withImageTextures(new GLTFLoader());
      const d = new DRACOLoader().setDecoderPath(DRACO_PATH);
      l.setDRACOLoader(d);
      l.setMeshoptDecoder(MeshoptDecoder);
      try {
        const g = await l.loadAsync(spec.src);
        const node = g.scene.getObjectByName(spec.node);
        if (!node) throw new Error(`${spec.src} has no node ${spec.node}`);
        // Only the fit-out node is kept; it carries its own placement in the deployed file's frame.
        root.add(node);
        g.scene.traverse((o) => {
          const mesh = o as THREE.Mesh;
          if (!mesh.isMesh) return;
          mesh.geometry.dispose();
          (Array.isArray(mesh.material) ? mesh.material : [mesh.material]).forEach((m) => m.dispose());
        });
        node.traverse((o) => {
          const mesh = o as THREE.Mesh;
          if (!mesh.isMesh) return;
          mesh.castShadow = shadows;
          mesh.receiveShadow = false;
          const mats = (Array.isArray(mesh.material) ? mesh.material : [mesh.material]).map((m) => {
            const mat = (m as THREE.MeshStandardMaterial).clone();
            m.dispose();
            addLit(mat);
            return mat;
          });
          mesh.material = (mats.length === 1 ? mats[0] : mats) as never;
        });
        node.visible = false;
        fitout = node;
        if (model.cutHeight === undefined) {
          // Keep the default cut above the fit-out's floor by a head height at most.
          const fb = new THREE.Box3().setFromObject(node);
          if (!fb.isEmpty()) cutY = Math.max(cutY, Math.min(fb.min.y + 1.2, size.y * 0.75));
        }
      } catch (err) {
        fitoutLoad = null;
        throw err;
      } finally {
        d.dispose();
      }
    })();
    return fitoutLoad;
  };

  let insideK = 0;
  let inside = { from: 0, to: 0, start: 0, ms: 0 };
  let camFrom = new THREE.Spherical();
  let camTo = new THREE.Spherical();
  const orbitTarget = () => controls?.target ?? target;
  const applyInside = (k: number) => {
    insideK = k;
    setShellCut(k > 0.001);
    if (fitout) fitout.visible = k > 0.001;
    cut.constant = THREE.MathUtils.lerp(topY, cutY, k);
    viewLift = 0.06 * (1 - k);
    applyViewOffset();
    camera.updateProjectionMatrix();
    for (const l of lit) {
      l.mat.emissive.copy(l.color).multiplyScalar(k);
      l.mat.emissiveIntensity = l.strength;
    }
    renderer.shadowMap.needsUpdate = true;
  };
  const stepInside = (now: number) => {
    if (inside.ms === 0 || insideK === inside.to) return;
    const t = Math.min(1, (now - inside.start) / inside.ms);
    const e = easeInOut(t);
    applyInside(THREE.MathUtils.lerp(inside.from, inside.to, e));
    const s = new THREE.Spherical(
      THREE.MathUtils.lerp(camFrom.radius, camTo.radius, e),
      THREE.MathUtils.lerp(camFrom.phi, camTo.phi, e),
      camFrom.theta,
    );
    camera.position.setFromSpherical(s).add(orbitTarget());
    camera.lookAt(orbitTarget());
    if (t >= 1) inside.ms = 0;
  };
  const setInside = async (on: boolean, animate = true) => {
    if (!model.inside) return;
    if (on) await loadFitout();
    const to = on ? 1 : 0;
    camFrom = new THREE.Spherical().setFromVector3(camera.position.clone().sub(orbitTarget()));
    camTo = camFrom.clone();
    camTo.phi = THREE.MathUtils.degToRad(90 - (on ? INSIDE_ELEVATION : OUTSIDE_ELEVATION));
    viewZoom = on ? 1.22 : 1;
    camTo.radius = dist * viewZoom;
    if (animate) {
      inside = { from: insideK, to, start: performance.now(), ms: INSIDE_MS * Math.max(0.35, Math.abs(to - insideK)) };
    } else {
      inside = { from: to, to, start: 0, ms: 0 };
      applyInside(to);
      camera.position.setFromSpherical(camTo).add(orbitTarget());
      camera.lookAt(orbitTarget());
    }
  };

  // ---- finish ---------------------------------------------------------------------
  let finishFrom: THREE.Color[] = tinted.map((t) => t.mat.color.clone());
  let finishTo: THREE.Color[] = finishFrom.map((c) => c.clone());
  let finishT = 1;
  let finishStart = 0;
  const colorsFor = (finish: TreccFinish) =>
    tinted.map((t) => {
      if (finish === "green") return t.base.clone();
      const c = FINISH_COLORS[finish][t.group];
      return new THREE.Color(c[0], c[1], c[2]).multiplyScalar(t.rel);
    });
  const applyColors = (k: number) => tinted.forEach((t, i) => t.mat.color.copy(finishFrom[i]).lerp(finishTo[i], k));

  const render = () => {
    if (finishT < 1) {
      finishT = Math.min(1, (performance.now() - finishStart) / 600);
      applyColors(1 - (1 - finishT) ** 3);
    }
    stepInside(performance.now());
    controls?.update();
    renderer.render(scene, camera);
  };

  return {
    canStow,
    // The clips run 3 to 7.4 s; played a little brisker, plus the packed file's share.
    deployMs: clip ? Math.round((clip.duration * 0.8 * 1000) / (stowedGltf ? 1 - PACKED_SHARE : 1)) : 2600,
    hasInside: !!model.inside,
    setInside,
    preloadInside: loadFitout,
    insideProgress: () => insideK,
    setDeploy,
    setFinish: (finish, animate = true) => {
      finishFrom = tinted.map((t) => t.mat.color.clone());
      finishTo = colorsFor(finish);
      if (animate) {
        finishT = 0;
        finishStart = performance.now();
      } else {
        finishT = 1;
        applyColors(1);
      }
    },
    enableControls: (onChange) => {
      if (controls) return;
      controls = new OrbitControls(camera, canvas);
      if (onChange) controls.addEventListener("change", onChange);
      controls.target.copy(target);
      controls.enableDamping = true;
      controls.dampingFactor = 0.08;
      controls.enablePan = false;
      // No wheel or pinch zoom: the wheel keeps scrolling the page.
      controls.enableZoom = false;
      controls.minPolarAngle = Math.PI * 0.18;
      controls.maxPolarAngle = Math.PI * 0.49;
      // Vertical swipes scroll the page on touch screens; sideways drags turn the model.
      canvas.style.touchAction = "pan-y";
      controls.update();
    },
    turn: (degrees) => {
      controls?.rotateLeft((degrees * Math.PI) / 180);
      controls?.update();
    },
    render,
    resize,
    isAnimating: () => finishT < 1 || (inside.ms > 0 && insideK !== inside.to),
    dispose: disposeAll,
  };
}
