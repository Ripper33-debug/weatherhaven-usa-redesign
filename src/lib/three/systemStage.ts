/**
 * Framework-free three.js stage for any system with a model in the registry (src/lib/system-models.ts):
 * the product page's 3D viewer for everything except the TRECC (which keeps treccStage).
 *
 * One deployed model folds itself up for the stowed view, driven by the registry's `articulation`:
 * hinge nodes rotate back to their stowed angle (the MECC's side walls swing up), unfold nodes
 * shrink to their hinge line (the fabric expansions), and nodes hidden while packed (interior, site
 * kit) appear once it's deployed. A model without articulation but with a separate stowed file swaps
 * between the two. Lighting, ground and grid match the TRECC stage so the pages look alike.
 */
import * as THREE from "three";
import { GLTFLoader, type GLTF } from "three/examples/jsm/loaders/GLTFLoader.js";
import { DRACOLoader } from "three/examples/jsm/loaders/DRACOLoader.js";
import { MeshoptDecoder } from "three/examples/jsm/libs/meshopt_decoder.module.js";
import { RoomEnvironment } from "three/examples/jsm/environments/RoomEnvironment.js";
import { OrbitControls } from "three/examples/jsm/controls/OrbitControls.js";
import type { SystemModel } from "@/lib/system-models";
import type { TreccFinish } from "@/lib/three/treccFinishes";

/** Same Draco decoder the AR page uses (the newer one; model-viewer and three both read it). */
const DRACO_PATH = "/assets/draco-ar/";

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
};

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
  renderer.toneMapping = THREE.ACESFilmicToneMapping;
  renderer.toneMappingExposure = 1.0;
  renderer.shadowMap.enabled = shadows;
  renderer.shadowMap.type = THREE.PCFShadowMap;
  // The light is fixed; the shadow only changes while the model folds, so redraw it on demand.
  renderer.shadowMap.autoUpdate = false;
  renderer.shadowMap.needsUpdate = true;

  const scene = new THREE.Scene();
  const pmrem = new THREE.PMREMGenerator(renderer);
  const room = new RoomEnvironment();
  const envTex = pmrem.fromScene(room, 0.04).texture;
  room.dispose();
  scene.environment = envTex;
  scene.environmentIntensity = 0.42;

  // Lighting as on the TRECC stage: warm key, cool sky fill, orange rim from behind.
  const key = new THREE.DirectionalLight(0xfff4e6, 2.3);
  key.castShadow = shadows;
  key.shadow.mapSize.set(2048, 2048);
  key.shadow.bias = -0.0004;
  key.shadow.normalBias = 0.02;
  scene.add(key);
  scene.add(key.target);
  const hemi = new THREE.HemisphereLight(0x9fb7d1, 0x0a0f17, 0.4);
  scene.add(hemi);
  const rim = new THREE.DirectionalLight(0xffb070, 1.1);
  scene.add(rim);

  // Load the model(s).
  const loader = new GLTFLoader();
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
    envTex.dispose();
    pmrem.dispose();
    renderer.dispose();
    renderer.forceContextLoss();
  };

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

  // ---- articulation ---------------------------------------------------------------
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
  const canStow = hinges.length > 0 || unfolds.length > 0 || !!stowedGltf;

  // ---- framing ------------------------------------------------------------------------
  // The deployed footprint without the nodes hidden while packed: interiors sit inside it anyway,
  // and site kits (cables, earth rods) spread out on the ground and would shrink the model in frame.
  const box = new THREE.Box3();
  const leaveOut = new Set<THREE.Object3D>();
  for (const h of hidden) h.traverse((o) => leaveOut.add(o));
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
  const siteKit = hidden.find((h) => /site|kit/i.test(h.name));
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
    dist = (fitR / Math.sin(Math.min(vfov, hfov) / 2)) * 0.82;
    // There's no zoom, so the near plane can sit well in front of the model; a tight near plane keeps
    // the depth precision that stops close layers (fabric over liner) flickering mid-unfold.
    camera.near = Math.max(0.1, dist * 0.2);
    if (!controls) place();
    else {
      // Keep the visitor's angle; only change how far away the camera sits.
      const dir = camera.position.clone().sub(controls.target).normalize();
      camera.position.copy(controls.target).addScaledVector(dir, dist);
    }
    // Sit the model a little above centre so the ground-level site kit clears the controls along
    // the bottom; the camera still turns about the model's centre.
    camera.setViewOffset(w, h, 0, h * 0.06, w, h);
    camera.updateProjectionMatrix();
  };
  resize();

  // ---- deploy state -----------------------------------------------------------------
  let deploy = -1;
  const setDeploy = (t: number) => {
    const next = clamp01(t);
    if (next === deploy) return;
    deploy = next;
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
    controls?.update();
    renderer.render(scene, camera);
  };

  return {
    canStow,
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
    isAnimating: () => finishT < 1,
    dispose: disposeAll,
  };
}
