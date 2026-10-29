/**
 * Framework-free three.js stage for the TRECC models (stowed + deployed).
 * Used by the homepage scroll scene and the TRECC product-page viewer.
 *
 * The two models are separate CAD exports that share an origin, so "deploying" is a reveal:
 * an orange scan plane sweeps across the unit, with the stowed model clipped on one side and
 * the deployed model on the other.
 */
import * as THREE from "three";
import { GLTFLoader } from "three/examples/jsm/loaders/GLTFLoader.js";
import { MeshoptDecoder } from "three/examples/jsm/libs/meshopt_decoder.module.js";
import { RoomEnvironment } from "three/examples/jsm/environments/RoomEnvironment.js";
import { OrbitControls } from "three/examples/jsm/controls/OrbitControls.js";
import { TRECC_FINISHES, type TreccFinish } from "@/lib/three/treccFinishes";
import { createWeather, type Weather, type WeatherKind, type WeatherPreset } from "@/lib/three/camp/environment";

export { TRECC_FINISHES, type TreccFinish };

export const TRECC_MODELS = {
  stowed: "/models/trecc-stowed.glb",
  open: "/models/trecc-open.glb",
};

/** Scan sweeps along x; the deployed model spans about ±2.26 m. */
const SCAN_FROM = -2.45;
const SCAN_TO = 2.45;

export type CameraPose = { az: number; el: number; dist: number; ty: number };

export type TreccStage = {
  /** 0 = fully stowed, 1 = fully deployed. */
  setDeploy: (t: number) => void;
  setCamera: (pose: CameraPose) => void;
  setFinish: (finish: TreccFinish, animate?: boolean) => void;
  /** Shift the image horizontally by a fraction of the width (positive = right). */
  setShift: (fraction: number) => void;
  /** Turns on drag-to-rotate (product viewer); onChange fires whenever the view moves. */
  enableControls: (onChange?: () => void) => void;
  /** Turns the model by some degrees, eased by the controls; positive turns it the way a drag to the right does. */
  turn: (degrees: number) => void;
  render: () => void;
  resize: () => void;
  dispose: () => void;
  /** True while the finish tween still needs frames. */
  isAnimating: () => boolean;
  /** True while weather is falling (needs frames at a steady rate while on screen). */
  isAmbient: () => boolean;
  /** Draws a share of the weather particles (0 turns the weather off; quality steps). */
  setWeatherDensity: (share: number) => void;
  /** Reduced motion: weather is drawn but holds still. */
  setStill: (on: boolean) => void;
  /**
   * Points on the deployed shelter, each given as fractions of its bounding box (x along the
   * length, y up, z across) with the outward direction of the face it sits on, projected to the
   * canvas in CSS pixels. `front` is false when that face points away from the camera.
   */
  projectOpen: (points: readonly OpenPoint[]) => { x: number; y: number; front: boolean }[];
};

export type OpenPoint = { at: readonly [number, number, number]; normal: readonly [number, number, number] };

const lerp = (a: number, b: number, t: number) => a + (b - a) * t;

/**
 * Climate around the unit when the stage runs with `climate` (homepage): each finish brings the
 * weather it's made for. Particle boxes and sizes are tuned for a single unit seen from ~10 m.
 */
type Climate = {
  weather: Exclude<WeatherKind, "none">;
  tune: Partial<WeatherPreset>;
  ground: number;
  groundAlpha: number;
  key: number;
  hemiSky: number;
};
const CLIMATE: Record<TreccFinish, Climate> = {
  arctic: {
    weather: "blizzard",
    tune: { box: [22, 8, 22], count: 6500, size: 0.07, vel: [4.6, -1.2, 1.4], streak: 1.7, alpha: 0.85, low: 0.4, sway: 0.5 },
    ground: 0xdfe8f1,
    groundAlpha: 0.5,
    key: 0xeef4ff,
    hemiSky: 0xc2d4e6,
  },
  tan: {
    weather: "dust",
    tune: { box: [24, 3, 24], count: 7000, size: 0.085, vel: [5.4, 0.12, 1.7], streak: 2.4, alpha: 0.42, low: 0.75, sway: 0.4 },
    ground: 0xc29460,
    groundAlpha: 0.42,
    key: 0xffe0b5,
    hemiSky: 0xcfb08a,
  },
  green: {
    weather: "rain",
    tune: { box: [22, 9, 22], count: 4200, size: 0.16, vel: [0.8, -10.5, 0.3], streak: 7, alpha: 0.45, color: 0xc4d3e0 },
    ground: 0x4e6040,
    groundAlpha: 0.38,
    key: 0xf6f2e8,
    hemiSky: 0x9fb7d1,
  },
};

export async function createTreccStage(
  canvas: HTMLCanvasElement,
  {
    maxDpr = 1.75,
    shadows = true,
    climate = false,
    mobile = false,
    still = false,
  }: {
    maxDpr?: number;
    shadows?: boolean;
    /** Weather and ground that follow the finish (homepage scene). */
    climate?: boolean;
    /** Fewer weather particles. */
    mobile?: boolean;
    /** Reduced motion: the weather is drawn but doesn't move. */
    still?: boolean;
  } = {},
): Promise<TreccStage> {
  const renderer = new THREE.WebGLRenderer({ canvas, antialias: true, alpha: true, powerPreference: "high-performance" });
  renderer.setPixelRatio(Math.min(window.devicePixelRatio || 1, maxDpr));
  renderer.toneMapping = THREE.ACESFilmicToneMapping;
  renderer.toneMappingExposure = 1.0;
  renderer.localClippingEnabled = true;
  renderer.shadowMap.enabled = shadows;
  renderer.shadowMap.type = THREE.PCFShadowMap;
  // The light and models are static; the shadow only changes with the scan, so redraw it on demand.
  renderer.shadowMap.autoUpdate = false;
  renderer.shadowMap.needsUpdate = true;

  const scene = new THREE.Scene();
  scene.fog = new THREE.Fog(0x0a0f17, 14, 30);
  const pmrem = new THREE.PMREMGenerator(renderer);
  const room = new RoomEnvironment();
  const envTex = pmrem.fromScene(room, 0.04).texture;
  room.dispose();
  scene.environment = envTex;
  scene.environmentIntensity = 0.38;

  // Lighting: warm key from front-right, cool fill, orange rim from behind (Weatherhaven signal).
  const key = new THREE.DirectionalLight(0xfff4e6, 2.3);
  key.position.set(4.5, 7.5, 6);
  key.castShadow = shadows;
  key.shadow.mapSize.set(2048, 2048);
  key.shadow.bias = -0.0004;
  key.shadow.normalBias = 0.02;
  Object.assign(key.shadow.camera, { left: -4, right: 4, top: 4, bottom: -4, near: 1, far: 20 });
  scene.add(key);
  const hemi = new THREE.HemisphereLight(0x9fb7d1, 0x0a0f17, 0.35);
  scene.add(hemi);
  const rim = new THREE.DirectionalLight(0xffb070, 1.15);
  rim.position.set(-6, 3.5, -5.5);
  scene.add(rim);

  // Ground: soft contact shadow + a blueprint grid that fades out radially.
  const shadowFloor = new THREE.Mesh(
    new THREE.CircleGeometry(9, 64),
    new THREE.ShadowMaterial({ color: 0x000000, opacity: 0.55 }),
  );
  shadowFloor.rotation.x = -Math.PI / 2;
  shadowFloor.receiveShadow = true;
  scene.add(shadowFloor);
  const gridMat = new THREE.ShaderMaterial({
    transparent: true,
    depthWrite: false,
    uniforms: { uColor: { value: new THREE.Color(0x94aac4) } },
    vertexShader: /* glsl */ `
      varying vec2 vXZ;
      void main() {
        vec4 w = modelMatrix * vec4(position, 1.0);
        vXZ = w.xz;
        gl_Position = projectionMatrix * viewMatrix * w;
      }`,
    fragmentShader: /* glsl */ `
      uniform vec3 uColor;
      varying vec2 vXZ;
      float line(float x, float w) {
        float d = abs(fract(x - 0.5) - 0.5) / fwidth(x);
        return 1.0 - min(d / w, 1.0);
      }
      void main() {
        float minor = max(line(vXZ.x * 2.0, 1.0), line(vXZ.y * 2.0, 1.0)) * 0.35;
        float major = max(line(vXZ.x * 0.5, 1.2), line(vXZ.y * 0.5, 1.2));
        float fade = 1.0 - smoothstep(2.5, 8.5, length(vXZ));
        float a = max(minor, major) * fade * 0.16;
        if (a < 0.002) discard;
        gl_FragColor = vec4(uColor, a);
      }`,
  });
  const grid = new THREE.Mesh(new THREE.PlaneGeometry(20, 20), gridMat);
  grid.rotation.x = -Math.PI / 2;
  grid.position.y = 0.001;
  scene.add(grid);

  // Climate ground: a patch of snow, sand or wet grass under the unit that fades into the page.
  const groundUniforms = { uColor: { value: new THREE.Color(0x000000) }, uAlpha: { value: 0 } };
  const groundMat = new THREE.ShaderMaterial({
    transparent: true,
    depthWrite: false,
    uniforms: groundUniforms,
    vertexShader: /* glsl */ `
      varying vec2 vXZ;
      void main() {
        vec4 w = modelMatrix * vec4(position, 1.0);
        vXZ = w.xz;
        gl_Position = projectionMatrix * viewMatrix * w;
      }`,
    fragmentShader: /* glsl */ `
      uniform vec3 uColor;
      uniform float uAlpha;
      varying vec2 vXZ;
      float hash(vec2 p) { return fract(sin(dot(p, vec2(127.1, 311.7))) * 43758.5453); }
      float noise(vec2 p) {
        vec2 i = floor(p), f = fract(p);
        vec2 u = f * f * (3.0 - 2.0 * f);
        return mix(mix(hash(i), hash(i + vec2(1, 0)), u.x), mix(hash(i + vec2(0, 1)), hash(i + vec2(1, 1)), u.x), u.y);
      }
      void main() {
        float r = length(vXZ * vec2(0.8, 1.0));
        float n = noise(vXZ * 1.7) * 0.6 + noise(vXZ * 6.0) * 0.4;
        float a = uAlpha * (1.0 - smoothstep(2.0, 8.5, r)) * (0.7 + 0.6 * n);
        if (a < 0.003) discard;
        gl_FragColor = vec4(uColor * (0.8 + 0.35 * n), a);
        #include <colorspace_fragment>
      }`,
  });
  const ground = new THREE.Mesh(new THREE.CircleGeometry(9, 64), groundMat);
  ground.rotation.x = -Math.PI / 2;
  ground.position.y = -0.002;
  ground.renderOrder = -1;
  ground.visible = climate;
  scene.add(ground);

  // Scan plane: hairline frame plus a faint glowing sheet.
  const scanGroup = new THREE.Group();
  const scanFrame = new THREE.LineSegments(
    new THREE.EdgesGeometry(new THREE.PlaneGeometry(2.7, 2.6)),
    new THREE.LineBasicMaterial({ color: 0xf18522, transparent: true, opacity: 0.95 }),
  );
  const scanSheet = new THREE.Mesh(
    new THREE.PlaneGeometry(2.7, 2.6),
    new THREE.MeshBasicMaterial({
      color: 0xf18522,
      transparent: true,
      opacity: 0.08,
      side: THREE.DoubleSide,
      depthWrite: false,
      blending: THREE.AdditiveBlending,
    }),
  );
  scanGroup.add(scanFrame, scanSheet);
  scanGroup.rotation.y = Math.PI / 2;
  scanGroup.position.set(SCAN_FROM, 1.3, 0.06);
  scanGroup.visible = false;
  scene.add(scanGroup);

  const camera = new THREE.PerspectiveCamera(28, 1, 0.1, 60);
  const target = new THREE.Vector3(0, 1, 0.06);

  // Clipping planes: stowed keeps x ≥ s, deployed keeps x ≤ s.
  const clipStowed = new THREE.Plane(new THREE.Vector3(1, 0, 0), -SCAN_FROM);
  const clipOpen = new THREE.Plane(new THREE.Vector3(-1, 0, 0), SCAN_FROM);
  // Shared uniforms for the orange glow where the scan passes over surfaces.
  const scanUniforms = { uScanX: { value: SCAN_FROM }, uScanOn: { value: 0 } };

  const shellMaterials: THREE.MeshStandardMaterial[] = [];
  const patch = (mat: THREE.MeshStandardMaterial, plane: THREE.Plane) => {
    mat.clippingPlanes = [plane];
    mat.clipShadows = true;
    mat.onBeforeCompile = (shader) => {
      shader.uniforms.uScanX = scanUniforms.uScanX;
      shader.uniforms.uScanOn = scanUniforms.uScanOn;
      shader.vertexShader = shader.vertexShader
        .replace("#include <common>", "#include <common>\nvarying float vWorldX;")
        .replace("#include <worldpos_vertex>", "#include <worldpos_vertex>\nvWorldX = (modelMatrix * vec4(transformed, 1.0)).x;");
      shader.fragmentShader = shader.fragmentShader
        .replace("#include <common>", "#include <common>\nvarying float vWorldX;\nuniform float uScanX;\nuniform float uScanOn;")
        .replace(
          "#include <emissivemap_fragment>",
          "#include <emissivemap_fragment>\ntotalEmissiveRadiance += vec3(0.95, 0.42, 0.08) * 2.2 * uScanOn * (1.0 - smoothstep(0.0, 0.14, abs(vWorldX - uScanX)));",
        );
    };
    mat.needsUpdate = true;
  };

  let controls: OrbitControls | null = null;
  // Frees everything on the GPU; also used if a model fails to load, so a failed attempt
  // doesn't leave a live WebGL context behind.
  const weathers: Weather[] = [];
  const disposeAll = () => {
    controls?.dispose();
    controls = null;
    weathers.forEach((w) => w.dispose());
    scene.traverse((o) => {
      const mesh = o as THREE.Mesh;
      if (mesh.geometry) mesh.geometry.dispose();
      const mats = mesh.material ? (Array.isArray(mesh.material) ? mesh.material : [mesh.material]) : [];
      mats.forEach((m) => m.dispose());
    });
    key.dispose();
    rim.dispose();
    hemi.dispose();
    envTex.dispose();
    pmrem.dispose();
    renderer.dispose();
    renderer.forceContextLoss();
  };

  const loader = new GLTFLoader().setMeshoptDecoder(MeshoptDecoder);
  let stowedGltf: Awaited<ReturnType<typeof loader.loadAsync>>;
  let openGltf: Awaited<ReturnType<typeof loader.loadAsync>>;
  try {
    [stowedGltf, openGltf] = await Promise.all([
      loader.loadAsync(TRECC_MODELS.stowed),
      loader.loadAsync(TRECC_MODELS.open),
    ]);
  } catch (err) {
    disposeAll();
    throw err;
  }
  const prep = (root: THREE.Object3D, plane: THREE.Plane) => {
    root.traverse((o) => {
      const mesh = o as THREE.Mesh;
      if (!mesh.isMesh) return;
      // Cast onto the ground only: self-shadowing on the decimated panels shows acne.
      mesh.castShadow = shadows;
      mesh.receiveShadow = false;
      const mats = Array.isArray(mesh.material) ? mesh.material : [mesh.material];
      mesh.material = mats.map((m) => {
        const mat = (m as THREE.MeshStandardMaterial).clone();
        if (mat.name === "shell") shellMaterials.push(mat);
        // Non-slip roof and rubber read as warm brown under the key light; push them to charcoal.
        if (mat.name === "rubber") {
          mat.color.multiplyScalar(0.45);
          mat.roughness = 0.95;
        }
        patch(mat, plane);
        return mat;
      }) as never;
      if (mats.length === 1) mesh.material = (mesh.material as THREE.Material[])[0];
    });
    scene.add(root);
  };
  prep(stowedGltf.scene, clipStowed);
  prep(openGltf.scene, clipOpen);
  const stowedRoot = stowedGltf.scene;
  const openRoot = openGltf.scene;

  // ---- finish ------------------------------------------------------------------
  let finishFrom = new THREE.Color(...TRECC_FINISHES[0].color);
  let finishTo = finishFrom.clone();
  let finishT = 1;
  let finishStart = 0;
  const applyFinish = (c: THREE.Color) => shellMaterials.forEach((m) => m.color.copy(c));
  applyFinish(finishTo);

  // ---- climate ------------------------------------------------------------------------
  // Each finish's weather is built the first time it's chosen and kept; switching cross-fades.
  const weatherFor: Partial<Record<TreccFinish, Weather>> = {};
  let climateTo: Climate = CLIMATE.green;
  let climateId: TreccFinish = "green";
  let climateT = 1;
  let climateStart = 0;
  let density = 1;
  const keyFrom = new THREE.Color();
  const hemiFrom = new THREE.Color();
  const groundFrom = new THREE.Color();
  let groundAlphaFrom = 0;
  const weatherOf = (f: TreccFinish) => {
    let w = weatherFor[f];
    if (!w) {
      const c = CLIMATE[f];
      w = createWeather(c.weather, mobile, f.length * 31 + 5, c.tune);
      w.setDensity(density);
      w.setOpacity(0);
      weatherFor[f] = w;
      weathers.push(w);
      scene.add(w.points);
    }
    return w;
  };
  const applyClimate = (k: number) => {
    key.color.copy(keyFrom).lerp(new THREE.Color(climateTo.key), k);
    hemi.color.copy(hemiFrom).lerp(new THREE.Color(climateTo.hemiSky), k);
    groundUniforms.uColor.value.copy(groundFrom).lerp(new THREE.Color(climateTo.ground), k);
    groundUniforms.uAlpha.value = lerp(groundAlphaFrom, climateTo.groundAlpha, k);
    for (const [id, w] of Object.entries(weatherFor) as [TreccFinish, Weather][]) {
      if (id === climateId) w.setOpacity(Math.max(w.opacity(), k));
      else w.setOpacity(Math.min(w.opacity(), 1 - k));
      w.points.visible = density > 0 && w.opacity() > 0.001;
    }
  };
  const setClimate = (f: TreccFinish, animate: boolean) => {
    if (!climate) return;
    climateTo = CLIMATE[f];
    climateId = f;
    keyFrom.copy(key.color);
    hemiFrom.copy(hemi.color);
    groundFrom.copy(groundUniforms.uColor.value);
    groundAlphaFrom = groundUniforms.uAlpha.value;
    weatherOf(f);
    if (animate) {
      climateT = 0;
      climateStart = performance.now();
    } else {
      climateT = 1;
      applyClimate(1);
    }
  };
  if (climate) {
    groundFrom.set(CLIMATE.green.ground);
    setClimate("green", false);
  }
  const target3 = new THREE.Vector3(0, 0, 0);

  // ---- state ------------------------------------------------------------------------
  let deploy = -1;
  const setDeploy = (t: number) => {
    const next = Math.min(1, Math.max(0, t));
    if (next === deploy) return;
    deploy = next;
    // Only draw what can be seen: one model at rest, both during the scan.
    stowedRoot.visible = deploy < 0.999;
    openRoot.visible = deploy > 0.001;
    renderer.shadowMap.needsUpdate = true;
    const s = lerp(SCAN_FROM, SCAN_TO, deploy);
    clipStowed.constant = -s;
    clipOpen.constant = s;
    scanUniforms.uScanX.value = s;
    const on = deploy > 0.001 && deploy < 0.999;
    scanUniforms.uScanOn.value = on ? Math.min(1, Math.min(deploy, 1 - deploy) * 12) : 0;
    scanGroup.visible = on;
    scanGroup.position.x = s;
  };
  setDeploy(0);

  const setCamera = ({ az, el, dist, ty }: CameraPose) => {
    const a = (az * Math.PI) / 180;
    const e = (el * Math.PI) / 180;
    target.set(0, ty, 0.06);
    camera.position.set(
      target.x + dist * Math.cos(e) * Math.sin(a),
      target.y + dist * Math.sin(e),
      target.z + dist * Math.cos(e) * Math.cos(a),
    );
    camera.lookAt(target);
  };
  setCamera({ az: 38, el: 13, dist: 8.5, ty: 0.9 });

  let shift = 0;

  const resize = () => {
    const w = canvas.clientWidth || 1;
    const h = canvas.clientHeight || 1;
    renderer.setSize(w, h, false);
    camera.aspect = w / h;
    // Hold the horizontal field of view (the deployed unit is wide), so tall phone screens
    // frame it the same way a desktop does.
    const hfov = 2 * Math.atan(Math.tan((14 * Math.PI) / 180) * 1.6);
    camera.fov = Math.max(28, (2 * Math.atan(Math.tan(hfov / 2) / camera.aspect) * 180) / Math.PI);
    if (shift) camera.setViewOffset(w, h, -w * shift, 0, w, h);
    else camera.clearViewOffset();
    camera.updateProjectionMatrix();
  };
  resize();

  const render = () => {
    const now = performance.now();
    if (finishT < 1) {
      finishT = Math.min(1, (now - finishStart) / 600);
      const k = 1 - (1 - finishT) ** 3;
      applyFinish(finishFrom.clone().lerp(finishTo, k));
    }
    if (climateT < 1) {
      climateT = Math.min(1, (now - climateStart) / 900);
      applyClimate(1 - (1 - climateT) ** 3);
    }
    if (climate) {
      // Particles drift around the unit; with reduced motion they hold still.
      const t = still ? 0 : now / 1000;
      const pr = renderer.getPixelRatio();
      for (const w of weathers) if (w.points.visible) w.update(t, target3, pr);
    }
    controls?.update();
    renderer.render(scene, camera);
  };

  const openBox = new THREE.Box3();
  const pv = new THREE.Vector3();
  const nv = new THREE.Vector3();
  const toCam = new THREE.Vector3();
  const projectOpen = (points: readonly OpenPoint[]) => {
    openBox.setFromObject(openRoot);
    const w = canvas.clientWidth || 1;
    const h = canvas.clientHeight || 1;
    return points.map(({ at, normal }) => {
      pv.set(
        lerp(openBox.min.x, openBox.max.x, at[0]),
        lerp(openBox.min.y, openBox.max.y, at[1]),
        lerp(openBox.min.z, openBox.max.z, at[2]),
      );
      nv.set(normal[0], normal[1], normal[2]);
      toCam.subVectors(camera.position, pv);
      const front = nv.dot(toCam) > 0;
      pv.project(camera);
      return { x: ((pv.x + 1) / 2) * w, y: ((1 - pv.y) / 2) * h, front: front && pv.z < 1 };
    });
  };

  return {
    projectOpen,
    setDeploy,
    setCamera,
    setFinish: (finish, animate = true) => {
      const f = TRECC_FINISHES.find((x) => x.id === finish) ?? TRECC_FINISHES[0];
      setClimate(f.id, animate);
      finishFrom = shellMaterials[0]?.color.clone() ?? finishTo.clone();
      finishTo = new THREE.Color(...f.color);
      if (animate) {
        finishT = 0;
        finishStart = performance.now();
      } else {
        finishT = 1;
        applyFinish(finishTo);
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
      // No wheel or pinch zoom: the wheel keeps scrolling the page instead of being captured.
      controls.enableZoom = false;
      controls.minPolarAngle = Math.PI * 0.18;
      controls.maxPolarAngle = Math.PI * 0.49;
      // Let vertical swipes scroll the page on touch screens; sideways drags still turn the model.
      canvas.style.touchAction = "pan-y";
      controls.update();
    },
    turn: (degrees) => {
      controls?.rotateLeft((degrees * Math.PI) / 180);
      controls?.update();
    },
    setShift: (fraction) => {
      shift = fraction;
      resize();
    },
    render,
    resize,
    isAnimating: () => finishT < 1 || climateT < 1,
    isAmbient: () => climate && !still && density > 0,
    setStill: (on) => {
      still = on;
    },
    setWeatherDensity: (share) => {
      density = share;
      for (const w of weathers) {
        w.setDensity(share);
        w.points.visible = share > 0 && w.opacity() > 0.001;
      }
    },
    dispose: disposeAll,
  };
}

/** WebGL availability check without keeping a context around. */
export function canUseWebGL(): boolean {
  try {
    const c = document.createElement("canvas");
    const gl = c.getContext("webgl2") || c.getContext("webgl");
    gl?.getExtension("WEBGL_lose_context")?.loseContext();
    return !!gl;
  } catch {
    return false;
  }
}
