/**
 * Sky, terrain, light and weather for the 3D camp. Each climate is a preset of colours and
 * numbers; switching climate tweens from one preset to the next, so the site changes in place
 * (snow settles, sand drifts in) instead of cutting.
 *
 * Every look is set at dusk so the scene stays dark like the rest of the site and lit windows
 * and the orange scan read clearly.
 */
import * as THREE from "three";
import type { ClimateId } from "@/lib/mission-guide";
import { rng, type Finish } from "@/lib/three/camp/kit";

export type ClimateKey = ClimateId | "none";
export type WeatherKind = "none" | "snow" | "blizzard" | "rain" | "storm" | "dust";
export type PropSet = "none" | "conifer" | "trees" | "jungle" | "desert" | "flags";

export type ClimatePreset = {
  zenith: number;
  horizon: number;
  glow: number;
  glowStrength: number;
  /** Sun azimuth and elevation in degrees (azimuth 0 = +z, 90 = +x). */
  sunAz: number;
  sunEl: number;
  groundA: number;
  groundB: number;
  /** Noise threshold between groundA and groundB (0 = all B, 1 = all A). */
  groundMix: number;
  /** Terrain height beyond the flat camp area, metres. */
  amp: number;
  /** 0 = rolling hills, 1 = dune ridges. */
  dune: number;
  key: number;
  keyIntensity: number;
  hemiSky: number;
  hemiGround: number;
  hemiIntensity: number;
  rim: number;
  rimIntensity: number;
  envIntensity: number;
  grid: number;
  gridOpacity: number;
  /** Fog distances as multiples of the framing distance. */
  fogNear: number;
  fogFar: number;
  exposure: number;
  weather: WeatherKind;
  props: PropSet;
  finish: Finish;
  /** Short label for the scene's caption. */
  label: string;
};

export const CLIMATES: Record<ClimateKey, ClimatePreset> = {
  none: {
    zenith: 0x080c13, horizon: 0x0c121b, glow: 0x3a2a1c, glowStrength: 0.25, sunAz: 140, sunEl: 38,
    groundA: 0x05080c, groundB: 0x070a10, groundMix: 0.5, amp: 0, dune: 0,
    key: 0xfff4e6, keyIntensity: 2.2, hemiSky: 0x9fb7d1, hemiGround: 0x0a0f17, hemiIntensity: 0.45,
    rim: 0xffb070, rimIntensity: 1.0, envIntensity: 0.35, grid: 0x94aac4, gridOpacity: 0.2,
    fogNear: 1.4, fogFar: 3.2, exposure: 1.0, weather: "none", props: "none", finish: "green", label: "Site not yet chosen",
  },
  polar: {
    zenith: 0x0a1424, horizon: 0x40536d, glow: 0xffa070, glowStrength: 0.9, sunAz: 235, sunEl: 7,
    groundA: 0x8d9fb3, groundB: 0xb2c1d1, groundMix: 0.45, amp: 1.4, dune: 0.35,
    key: 0xffc49a, keyIntensity: 2.0, hemiSky: 0x7f9fc8, hemiGround: 0x43546a, hemiIntensity: 0.95,
    rim: 0x9cc0ff, rimIntensity: 0.7, envIntensity: 0.32, grid: 0x23344a, gridOpacity: 0.22,
    fogNear: 0.9, fogFar: 2.6, exposure: 0.82, weather: "blizzard", props: "flags", finish: "white", label: "Polar: blowing snow, −40° and below",
  },
  cold: {
    zenith: 0x0b1420, horizon: 0x2f3d4d, glow: 0xb7c6da, glowStrength: 0.35, sunAz: 210, sunEl: 16,
    groundA: 0x56625e, groundB: 0xa9b6c4, groundMix: 0.22, amp: 5, dune: 0,
    key: 0xdfe8f5, keyIntensity: 1.9, hemiSky: 0x9db3cc, hemiGround: 0x3b4652, hemiIntensity: 0.9,
    rim: 0xa9c4ea, rimIntensity: 0.6, envIntensity: 0.3, grid: 0x1f2b38, gridOpacity: 0.2,
    fogNear: 1.0, fogFar: 2.8, exposure: 0.95, weather: "snow", props: "conifer", finish: "green", label: "Cold: snow load and wind",
  },
  temperate: {
    zenith: 0x0c1520, horizon: 0x3a4651, glow: 0xffc690, glowStrength: 0.45, sunAz: 250, sunEl: 14,
    groundA: 0x36412f, groundB: 0x4b4a37, groundMix: 0.55, amp: 6, dune: 0,
    key: 0xffe0bd, keyIntensity: 2.1, hemiSky: 0xa6b8c8, hemiGround: 0x2a3326, hemiIntensity: 0.75,
    rim: 0xffb070, rimIntensity: 0.6, envIntensity: 0.32, grid: 0xc8d6e4, gridOpacity: 0.12,
    fogNear: 1.1, fogFar: 3.0, exposure: 1.0, weather: "rain", props: "trees", finish: "green", label: "Temperate: rain and wind",
  },
  hot: {
    zenith: 0x1b1626, horizon: 0xa8643a, glow: 0xffa458, glowStrength: 1.1, sunAz: 245, sunEl: 9,
    groundA: 0xa77a4b, groundB: 0xc29560, groundMix: 0.5, amp: 7, dune: 1,
    key: 0xffc290, keyIntensity: 2.5, hemiSky: 0xe0b48e, hemiGround: 0x6a4a2c, hemiIntensity: 0.6,
    rim: 0xffc890, rimIntensity: 0.5, envIntensity: 0.3, grid: 0x3a2516, gridOpacity: 0.14,
    fogNear: 0.9, fogFar: 2.6, exposure: 0.92, weather: "dust", props: "desert", finish: "tan", label: "Desert: above 100°F, blowing sand",
  },
  tropical: {
    zenith: 0x0d191b, horizon: 0x3c5249, glow: 0xffd29a, glowStrength: 0.35, sunAz: 230, sunEl: 20,
    groundA: 0x26381f, groundB: 0x3d3524, groundMix: 0.62, amp: 9, dune: 0,
    key: 0xffe2b5, keyIntensity: 1.7, hemiSky: 0xb7c9b8, hemiGround: 0x23301f, hemiIntensity: 0.85,
    rim: 0xffcf9a, rimIntensity: 0.4, envIntensity: 0.3, grid: 0xc8d6e4, gridOpacity: 0.1,
    fogNear: 0.75, fogFar: 2.1, exposure: 1.0, weather: "storm", props: "jungle", finish: "green", label: "Tropical: heat, humidity, heavy rain",
  },
  mixed: {
    zenith: 0x0a0f17, horizon: 0x1c2532, glow: 0xffb070, glowStrength: 0.4, sunAz: 140, sunEl: 26,
    groundA: 0x1a222c, groundB: 0x232c37, groundMix: 0.5, amp: 3, dune: 0,
    key: 0xfff0dc, keyIntensity: 2.2, hemiSky: 0x9fb7d1, hemiGround: 0x18202a, hemiIntensity: 0.6,
    rim: 0xffb070, rimIntensity: 0.9, envIntensity: 0.35, grid: 0x94aac4, gridOpacity: 0.2,
    fogNear: 1.3, fogFar: 3.1, exposure: 1.0, weather: "none", props: "none", finish: "tan", label: "Any climate",
  },
};

// ---- shared GLSL noise -----------------------------------------------------------------

const NOISE = /* glsl */ `
float cHash(vec2 p) { p = fract(p * vec2(123.34, 456.21)); p += dot(p, p + 45.32); return fract(p.x * p.y); }
float cNoise(vec2 p) {
  vec2 i = floor(p); vec2 f = fract(p);
  float a = cHash(i), b = cHash(i + vec2(1.0, 0.0)), c = cHash(i + vec2(0.0, 1.0)), d = cHash(i + vec2(1.0, 1.0));
  vec2 u = f * f * (3.0 - 2.0 * f);
  return mix(mix(a, b, u.x), mix(c, d, u.x), u.y);
}
float cFbm(vec2 p) { float v = 0.0; float a = 0.5; for (int i = 0; i < 4; i++) { v += a * cNoise(p); p *= 2.03; a *= 0.5; } return v; }
`;

const HEIGHT = /* glsl */ `
uniform float uAmp; uniform float uDune; uniform float uFlat; uniform vec2 uSiteC; uniform vec4 uStripA; uniform vec4 uStripB;
float stripMask(vec2 p, vec4 s) {
  vec2 c = vec2(s.x + s.y, s.z + s.w) * 0.5;
  vec2 hs = vec2(s.y - s.x, s.w - s.z) * 0.5;
  vec2 d = abs(p - c) - hs;
  return smoothstep(0.0, 22.0, max(d.x, d.y));
}
float campH(vec2 p) {
  float r = length(p - uSiteC);
  float m = smoothstep(uFlat, uFlat + 45.0, r) * stripMask(p, uStripA) * stripMask(p, uStripB);
  float hills = cFbm(p * 0.012) * 1.2 + cNoise(p * 0.05) * 0.15;
  float ridge = 1.0 - abs(sin(p.x * 0.035 + p.y * 0.012 + cFbm(p * 0.01) * 5.0));
  float dunes = pow(ridge, 2.2) * 0.9 + cFbm(p * 0.02) * 0.3;
  return uAmp * mix(hills, dunes, uDune) * m;
}
`;

export type TerrainUniforms = {
  uAmp: { value: number };
  uDune: { value: number };
  uFlat: { value: number };
  uSiteC: { value: THREE.Vector2 };
  uStripA: { value: THREE.Vector4 };
  uStripB: { value: THREE.Vector4 };
};

/** Lifts each instance of an instanced mesh onto the terrain (by its origin, so it stays upright). */
export function patchInstancedTerrain(mat: THREE.Material, terrain: TerrainUniforms) {
  mat.onBeforeCompile = (shader) => {
    Object.assign(shader.uniforms, terrain);
    shader.vertexShader = shader.vertexShader
      .replace("#include <common>", `#include <common>\n${NOISE}\n${HEIGHT}`)
      .replace(
        "#include <project_vertex>",
        /* glsl */ `
        vec4 mvPosition = vec4(transformed, 1.0);
        #ifdef USE_INSTANCING
          mvPosition = instanceMatrix * mvPosition;
          mvPosition.y += campH(vec2(instanceMatrix[3].x, instanceMatrix[3].z));
        #endif
        mvPosition = modelViewMatrix * mvPosition;
        gl_Position = projectionMatrix * mvPosition;`,
      );
  };
}

export type Env = {
  root: THREE.Group;
  terrain: TerrainUniforms;
  /** Flattens up to two strips of terrain (runway, road). */
  setStrips: (a?: { minX: number; maxX: number; minZ: number; maxZ: number }, b?: { minX: number; maxX: number; minZ: number; maxZ: number }) => void;
  sky: THREE.Mesh;
  key: THREE.DirectionalLight;
  hemi: THREE.HemisphereLight;
  rim: THREE.DirectionalLight;
  fog: THREE.Fog;
  /** Applies a preset blend (t = 0 → from, 1 → to). */
  blend: (from: ClimatePreset, to: ClimatePreset, t: number) => void;
  /** Size of the flat camp area and where the grid fades out. */
  setSite: (radius: number, center: THREE.Vector2) => void;
  /** Fog distances for the current framing distance. */
  setFogScale: (dist: number) => void;
  sunDir: THREE.Vector3;
  current: () => { preset: ClimatePreset; fogNear: number; fogFar: number };
  dispose: () => void;
};

const col = (hex: number) => new THREE.Color(hex);
const lerpN = (a: number, b: number, t: number) => a + (b - a) * t;

export function createEnvironment(renderer: THREE.WebGLRenderer, scene: THREE.Scene, opts: { shadows: boolean; mobile: boolean }): Env {
  const root = new THREE.Group();
  scene.add(root);

  // ---- sky dome (follows the camera; drawn first at the far plane) ----
  const skyU = {
    uZenith: { value: col(CLIMATES.none.zenith) },
    uHorizon: { value: col(CLIMATES.none.horizon) },
    uGlow: { value: col(CLIMATES.none.glow) },
    uGlowStrength: { value: CLIMATES.none.glowStrength },
    uSunDir: { value: new THREE.Vector3(0, 0.5, 1).normalize() },
  };
  const sky = new THREE.Mesh(
    new THREE.SphereGeometry(500, 32, 16),
    new THREE.ShaderMaterial({
      uniforms: skyU,
      side: THREE.BackSide,
      depthWrite: false,
      vertexShader: /* glsl */ `
        varying vec3 vDir;
        void main() {
          vDir = normalize(position);
          vec4 p = projectionMatrix * modelViewMatrix * vec4(position, 1.0);
          gl_Position = p.xyww;
        }`,
      fragmentShader: /* glsl */ `
        uniform vec3 uZenith; uniform vec3 uHorizon; uniform vec3 uGlow; uniform float uGlowStrength; uniform vec3 uSunDir;
        varying vec3 vDir;
        void main() {
          vec3 d = normalize(vDir);
          float up = smoothstep(-0.02, 0.5, d.y);
          vec3 c = mix(uHorizon, uZenith, pow(up, 0.75));
          float s = max(dot(d, uSunDir), 0.0);
          float band = 1.0 - smoothstep(0.0, 0.25, abs(d.y - 0.02));
          c += uGlow * uGlowStrength * (pow(s, 6.0) * 0.55 + pow(s, 40.0) * 0.6) * (0.35 + band);
          gl_FragColor = vec4(c, 1.0);
          #include <tonemapping_fragment>
          #include <colorspace_fragment>
        }`,
    }),
  );
  sky.renderOrder = -10;
  sky.frustumCulled = false;
  root.add(sky);

  // ---- ground ----
  const FAR = new THREE.Vector4(1e5, 1e5 + 1, 1e5, 1e5 + 1);
  const groundU = {
    uAmp: { value: 0 },
    uDune: { value: 0 },
    uFlat: { value: 30 },
    uSiteC: { value: new THREE.Vector2() },
    uStripA: { value: FAR.clone() },
    uStripB: { value: FAR.clone() },
    uGroundA: { value: col(CLIMATES.none.groundA) },
    uGroundB: { value: col(CLIMATES.none.groundB) },
    uMix: { value: 0.5 },
  };
  const groundGeo = polarGrid(opts.mobile ? 56 : 80, opts.mobile ? 72 : 110, 420);
  const groundMat = new THREE.MeshStandardMaterial({ color: 0xffffff, roughness: 0.97, metalness: 0 });
  groundMat.onBeforeCompile = (shader) => {
    Object.assign(shader.uniforms, groundU);
    shader.vertexShader = shader.vertexShader
      .replace("#include <common>", `#include <common>\n${NOISE}\n${HEIGHT}\nvarying vec2 vGXZ;`)
      .replace(
        "#include <beginnormal_vertex>",
        /* glsl */ `
        vec2 gp = position.xz;
        float ge = 1.2;
        float gx = campH(gp + vec2(ge, 0.0)) - campH(gp - vec2(ge, 0.0));
        float gz = campH(gp + vec2(0.0, ge)) - campH(gp - vec2(0.0, ge));
        vec3 objectNormal = normalize(vec3(-gx, 2.0 * ge, -gz));
        #ifdef USE_TANGENT
          vec3 objectTangent = vec3(1.0, 0.0, 0.0);
        #endif`,
      )
      .replace("#include <begin_vertex>", "vec3 transformed = vec3(position.x, position.y + campH(position.xz), position.z);\nvGXZ = position.xz;");
    shader.fragmentShader = shader.fragmentShader
      .replace("#include <common>", `#include <common>\n${NOISE}\nuniform vec3 uGroundA; uniform vec3 uGroundB; uniform float uMix; varying vec2 vGXZ;`)
      .replace(
        "#include <color_fragment>",
        /* glsl */ `#include <color_fragment>
        float gn = cFbm(vGXZ * 0.06) + cNoise(vGXZ * 0.7) * 0.12;
        float gt = smoothstep(uMix - 0.1, uMix + 0.1, gn);
        diffuseColor.rgb = mix(uGroundA, uGroundB, gt);`,
      );
  };
  const ground = new THREE.Mesh(groundGeo, groundMat);
  ground.position.y = -0.02;
  ground.receiveShadow = opts.shadows;
  root.add(ground);

  // ---- blueprint grid over the flat site: 1 m minor, 5 m major lines ----
  const gridU = { uColor: { value: col(CLIMATES.none.grid) }, uOpacity: { value: CLIMATES.none.gridOpacity }, uRadius: { value: 30 }, uCenter: { value: new THREE.Vector2() } };
  const grid = new THREE.Mesh(
    new THREE.PlaneGeometry(400, 400),
    new THREE.ShaderMaterial({
      transparent: true,
      depthWrite: false,
      uniforms: gridU,
      vertexShader: /* glsl */ `
        varying vec2 vXZ;
        void main() { vec4 w = modelMatrix * vec4(position, 1.0); vXZ = w.xz; gl_Position = projectionMatrix * viewMatrix * w; }`,
      fragmentShader: /* glsl */ `
        uniform vec3 uColor; uniform float uOpacity; uniform float uRadius; uniform vec2 uCenter;
        varying vec2 vXZ;
        float line(float x, float w) { float d = abs(fract(x - 0.5) - 0.5) / fwidth(x); return 1.0 - min(d / w, 1.0); }
        void main() {
          // Metre lines fade out where they would crowd together in the distance.
          float px = max(fwidth(vXZ.x), fwidth(vXZ.y));
          float minor = max(line(vXZ.x, 1.0), line(vXZ.y, 1.0)) * 0.22 * (1.0 - smoothstep(0.06, 0.16, px));
          float major = max(line(vXZ.x / 5.0, 1.2), line(vXZ.y / 5.0, 1.2));
          float fade = 1.0 - smoothstep(uRadius * 0.55, uRadius * 1.15, length(vXZ - uCenter));
          float a = max(minor, major) * fade * uOpacity;
          if (a < 0.003) discard;
          gl_FragColor = vec4(uColor, a);
          #include <colorspace_fragment>
        }`,
    }),
  );
  grid.rotation.x = -Math.PI / 2;
  grid.position.y = 0.012;
  grid.renderOrder = 1;
  root.add(grid);

  // ---- lights ----
  const key = new THREE.DirectionalLight(0xffffff, 2);
  key.castShadow = opts.shadows;
  key.shadow.mapSize.set(opts.mobile ? 1024 : 2048, opts.mobile ? 1024 : 2048);
  key.shadow.bias = -0.0006;
  key.shadow.normalBias = 0.04;
  scene.add(key, key.target);
  const hemi = new THREE.HemisphereLight(0x9fb7d1, 0x0a0f17, 0.4);
  scene.add(hemi);
  const rim = new THREE.DirectionalLight(0xffb070, 1);
  scene.add(rim);

  const fog = new THREE.Fog(CLIMATES.none.horizon, 60, 200);
  scene.fog = fog;

  const sunDir = new THREE.Vector3();
  let fogNearK = CLIMATES.none.fogNear;
  let fogFarK = CLIMATES.none.fogFar;
  let fogDist = 40;
  let last: ClimatePreset = CLIMATES.none;
  const site = { radius: 30, center: new THREE.Vector2() };

  const applyFog = () => {
    fog.near = fogDist * fogNearK;
    fog.far = fogDist * fogFarK + 60;
  };

  const placeSun = (az: number, el: number) => {
    const a = THREE.MathUtils.degToRad(az);
    const e = THREE.MathUtils.degToRad(el);
    sunDir.set(Math.sin(a) * Math.cos(e), Math.sin(e), Math.cos(a) * Math.cos(e)).normalize();
    skyU.uSunDir.value.copy(sunDir);
    const r = site.radius + 30;
    // Keep shadows from going absurdly long when the sun is very low.
    const shadowDir = sunDir.clone();
    shadowDir.y = Math.max(shadowDir.y, 0.3);
    shadowDir.normalize();
    key.position.set(site.center.x + shadowDir.x * 120, shadowDir.y * 120, site.center.y + shadowDir.z * 120);
    key.target.position.set(site.center.x, 0, site.center.y);
    key.target.updateMatrixWorld();
    const cam = key.shadow.camera;
    cam.left = -r;
    cam.right = r;
    cam.top = r;
    cam.bottom = -r;
    cam.near = 10;
    cam.far = 260;
    cam.updateProjectionMatrix();
    rim.position.set(site.center.x - sunDir.x * 60, 40, site.center.y - sunDir.z * 60);
  };

  const blend = (from: ClimatePreset, to: ClimatePreset, t: number) => {
    const c = (a: number, b: number) => col(a).lerp(col(b), t);
    skyU.uZenith.value.copy(c(from.zenith, to.zenith));
    skyU.uHorizon.value.copy(c(from.horizon, to.horizon));
    skyU.uGlow.value.copy(c(from.glow, to.glow));
    skyU.uGlowStrength.value = lerpN(from.glowStrength, to.glowStrength, t);
    fog.color.copy(skyU.uHorizon.value);
    groundU.uGroundA.value.copy(c(from.groundA, to.groundA));
    groundU.uGroundB.value.copy(c(from.groundB, to.groundB));
    groundU.uMix.value = lerpN(from.groundMix, to.groundMix, t);
    groundU.uAmp.value = lerpN(from.amp, to.amp, t);
    groundU.uDune.value = lerpN(from.dune, to.dune, t);
    gridU.uColor.value.copy(c(from.grid, to.grid));
    gridU.uOpacity.value = lerpN(from.gridOpacity, to.gridOpacity, t);
    key.color.copy(c(from.key, to.key));
    key.intensity = lerpN(from.keyIntensity, to.keyIntensity, t);
    hemi.color.copy(c(from.hemiSky, to.hemiSky));
    hemi.groundColor.copy(c(from.hemiGround, to.hemiGround));
    hemi.intensity = lerpN(from.hemiIntensity, to.hemiIntensity, t);
    rim.color.copy(c(from.rim, to.rim));
    rim.intensity = lerpN(from.rimIntensity, to.rimIntensity, t);
    scene.environmentIntensity = lerpN(from.envIntensity, to.envIntensity, t);
    renderer.toneMappingExposure = lerpN(from.exposure, to.exposure, t);
    fogNearK = lerpN(from.fogNear, to.fogNear, t);
    fogFarK = lerpN(from.fogFar, to.fogFar, t);
    applyFog();
    // Sun direction: interpolate angles (short way round).
    let daz = to.sunAz - from.sunAz;
    if (daz > 180) daz -= 360;
    if (daz < -180) daz += 360;
    placeSun(from.sunAz + daz * t, lerpN(from.sunEl, to.sunEl, t));
    last = t >= 1 ? to : from;
    renderer.shadowMap.needsUpdate = true;
  };
  blend(CLIMATES.none, CLIMATES.none, 1);

  return {
    root,
    terrain: groundU,
    setStrips: (a, b) => {
      const v = (r?: { minX: number; maxX: number; minZ: number; maxZ: number }) => (r ? new THREE.Vector4(r.minX, r.maxX, r.minZ, r.maxZ) : FAR.clone());
      groundU.uStripA.value.copy(v(a));
      groundU.uStripB.value.copy(v(b));
      renderer.shadowMap.needsUpdate = true;
    },
    sky,
    key,
    hemi,
    rim,
    fog,
    sunDir,
    blend,
    setSite: (radius, center) => {
      site.radius = radius;
      site.center.copy(center);
      groundU.uFlat.value = radius + 6;
      groundU.uSiteC.value.copy(center);
      gridU.uRadius.value = radius + 10;
      gridU.uCenter.value.copy(center);
      placeSun(Math.atan2(sunDir.x, sunDir.z) * (180 / Math.PI), Math.asin(sunDir.y) * (180 / Math.PI));
      renderer.shadowMap.needsUpdate = true;
    },
    setFogScale: (dist) => {
      fogDist = dist;
      applyFog();
    },
    current: () => ({ preset: last, fogNear: fog.near, fogFar: fog.far }),
    dispose: () => {
      sky.geometry.dispose();
      (sky.material as THREE.Material).dispose();
      groundGeo.dispose();
      groundMat.dispose();
      grid.geometry.dispose();
      (grid.material as THREE.Material).dispose();
      key.dispose();
      rim.dispose();
      hemi.dispose();
    },
  };
}

/** A disc of rings that get further apart away from the centre: dense detail where the camp is,
 * cheap terrain toward the horizon. */
function polarGrid(rings: number, segments: number, radius: number): THREE.BufferGeometry {
  const pos: number[] = [0, 0, 0];
  const idx: number[] = [];
  for (let r = 1; r <= rings; r++) {
    const t = r / rings;
    const rad = radius * (0.08 * t + 0.92 * t * t);
    for (let s = 0; s < segments; s++) {
      const a = (s / segments) * Math.PI * 2;
      pos.push(Math.cos(a) * rad, 0, Math.sin(a) * rad);
    }
  }
  for (let s = 0; s < segments; s++) idx.push(0, 1 + ((s + 1) % segments), 1 + s);
  for (let r = 1; r < rings; r++) {
    const a0 = 1 + (r - 1) * segments;
    const a1 = 1 + r * segments;
    for (let s = 0; s < segments; s++) {
      const s1 = (s + 1) % segments;
      idx.push(a0 + s, a0 + s1, a1 + s, a0 + s1, a1 + s1, a1 + s);
    }
  }
  const g = new THREE.BufferGeometry();
  g.setAttribute("position", new THREE.Float32BufferAttribute(pos, 3));
  g.setAttribute("normal", new THREE.Float32BufferAttribute(new Array(pos.length).fill(0).map((_, i) => (i % 3 === 1 ? 1 : 0)), 3));
  g.setIndex(idx);
  return g;
}

// ---- weather ----------------------------------------------------------------------------

export type Weather = {
  points: THREE.Points;
  kind: WeatherKind;
  setOpacity: (o: number) => void;
  update: (time: number, center: THREE.Vector3, pixelRatio: number) => void;
  dispose: () => void;
};

const WEATHER: Record<Exclude<WeatherKind, "none">, { vel: [number, number, number]; box: [number, number, number]; size: number; color: number; alpha: number; streak: number; sway: number; low: number; count: number }> = {
  snow: { vel: [1.2, -1.4, 0.4], box: [70, 30, 70], size: 0.14, color: 0xf2f6fb, alpha: 0.85, streak: 1, sway: 0.5, low: 0, count: 6000 },
  blizzard: { vel: [11, -1.6, 3.5], box: [80, 22, 80], size: 0.12, color: 0xeef4fb, alpha: 0.75, streak: 2.6, sway: 1.2, low: 0.55, count: 9000 },
  rain: { vel: [1.2, -14, 0.4], box: [70, 30, 70], size: 0.16, color: 0xb9c9d8, alpha: 0.35, streak: 7, sway: 0, low: 0, count: 5000 },
  storm: { vel: [3, -19, 1], box: [70, 30, 70], size: 0.2, color: 0xc7d6d0, alpha: 0.42, streak: 8, sway: 0, low: 0, count: 9000 },
  dust: { vel: [8, 0.2, 2.5], box: [90, 6, 90], size: 0.13, color: 0xd9a86c, alpha: 0.45, streak: 3, sway: 0.6, low: 1, count: 7000 },
};

export function createWeather(kind: Exclude<WeatherKind, "none">, mobile: boolean, seed = 7): Weather {
  const w = WEATHER[kind];
  const n = Math.round(w.count * (mobile ? 0.45 : 1));
  const rand = rng(seed);
  const base = new Float32Array(n * 3);
  const seeds = new Float32Array(n);
  for (let i = 0; i < n; i++) {
    base[i * 3] = rand();
    // "low" packs a share of the particles near the ground (spindrift, sand).
    base[i * 3 + 1] = w.low && rand() < w.low ? rand() * 0.18 : rand();
    base[i * 3 + 2] = rand();
    seeds[i] = rand();
  }
  const g = new THREE.BufferGeometry();
  g.setAttribute("position", new THREE.BufferAttribute(base, 3));
  g.setAttribute("aSeed", new THREE.BufferAttribute(seeds, 1));
  const u = {
    uTime: { value: 0 },
    uCenter: { value: new THREE.Vector3() },
    uBox: { value: new THREE.Vector3(...w.box) },
    uVel: { value: new THREE.Vector3(...w.vel) },
    uSize: { value: w.size },
    uColor: { value: new THREE.Color(w.color) },
    uAlpha: { value: 0 },
    uStreak: { value: w.streak },
    uSway: { value: w.sway },
    uPx: { value: 1 },
  };
  const mat = new THREE.ShaderMaterial({
    uniforms: u,
    transparent: true,
    depthWrite: false,
    vertexShader: /* glsl */ `
      uniform float uTime; uniform vec3 uCenter; uniform vec3 uBox; uniform vec3 uVel; uniform float uSize; uniform float uSway; uniform float uPx;
      attribute float aSeed;
      varying float vFade; varying float vSeed;
      void main() {
        vec3 speed = uVel * (0.75 + aSeed * 0.5);
        vec3 p = position * uBox + speed * uTime;
        p.x += sin(uTime * 1.3 + aSeed * 31.0) * uSway;
        p.z += cos(uTime * 1.1 + aSeed * 17.0) * uSway;
        // Wrap into a box that stays around the view target, in world space.
        vec3 lo = uCenter - uBox * 0.5;
        lo.y = 0.0;
        p = lo + mod(p - lo, uBox);
        vec4 mv = viewMatrix * vec4(p, 1.0);
        gl_Position = projectionMatrix * mv;
        float d = -mv.z;
        gl_PointSize = clamp(uSize * uPx * 900.0 / max(d, 0.5), 1.0, 28.0);
        vFade = (1.0 - smoothstep(30.0, 80.0, d)) * smoothstep(0.5, 3.0, d);
        vSeed = aSeed;
      }`,
    fragmentShader: /* glsl */ `
      uniform vec3 uColor; uniform float uAlpha; uniform float uStreak;
      varying float vFade; varying float vSeed;
      void main() {
        vec2 c = gl_PointCoord - 0.5;
        c.x *= uStreak;
        float a = smoothstep(0.5, 0.05, length(c));
        a *= uAlpha * vFade * (0.6 + vSeed * 0.4);
        if (a < 0.01) discard;
        gl_FragColor = vec4(uColor, a);
        #include <colorspace_fragment>
      }`,
  });
  const points = new THREE.Points(g, mat);
  points.frustumCulled = false;
  points.renderOrder = 5;
  return {
    points,
    kind,
    setOpacity: (o) => {
      u.uAlpha.value = w.alpha * o;
    },
    update: (time, center, pixelRatio) => {
      u.uTime.value = time;
      u.uCenter.value.copy(center);
      u.uPx.value = pixelRatio;
    },
    dispose: () => {
      g.dispose();
      mat.dispose();
    },
  };
}

// ---- climate props (trees, rocks, route flags) ---------------------------------------------

export type Avoid = { x: number; z: number; r: number } | { x0: number; x1: number; z0: number; z1: number };

export function createProps(set: Exclude<PropSet, "none">, center: THREE.Vector2, ringFrom: number, avoid: Avoid[], mobile: boolean, terrain: TerrainUniforms): THREE.Group {
  const group = new THREE.Group();
  const rand = rng(set.length * 977 + 13);
  const count = { conifer: 260, trees: 200, jungle: 320, desert: 110, flags: 28 }[set];
  const n = Math.round(count * (mobile ? 0.5 : 1));
  const geo = propGeometry(set);
  const mat = new THREE.MeshStandardMaterial({ vertexColors: true, roughness: 0.92, metalness: 0 });
  patchInstancedTerrain(mat, terrain);
  const mesh = new THREE.InstancedMesh(geo, mat, n);
  // Props sit on displaced terrain, which the shadow pass doesn't know about, so they cast none.
  mesh.castShadow = false;
  const m = new THREE.Matrix4();
  const q = new THREE.Quaternion();
  const s = new THREE.Vector3();
  const p = new THREE.Vector3();
  const blocked = (x: number, z: number) =>
    avoid.some((a) => ("r" in a ? Math.hypot(x - a.x, z - a.z) < a.r : x > a.x0 && x < a.x1 && z > a.z0 && z < a.z1));
  let placed = 0;
  let tries = 0;
  while (placed < n && tries < n * 12) {
    tries++;
    let x: number;
    let z: number;
    if (set === "flags") {
      // Route flags: lines leading away from the camp.
      const line = placed % 4;
      const k = Math.floor(placed / 4);
      const ang = line * 1.7 + 0.6;
      const r = ringFrom + 4 + k * 9;
      x = center.x + Math.cos(ang) * r;
      z = center.y + Math.sin(ang) * r;
    } else {
      const ang = rand() * Math.PI * 2;
      const r = ringFrom + 6 + Math.sqrt(rand()) * 170;
      x = center.x + Math.cos(ang) * r;
      z = center.y + Math.sin(ang) * r;
    }
    if (blocked(x, z)) {
      if (set === "flags") placed++;
      continue;
    }
    const sc = set === "flags" ? 1 : 0.65 + rand() * 0.7;
    q.setFromAxisAngle(new THREE.Vector3(0, 1, 0), rand() * Math.PI * 2);
    s.set(sc, sc * (set === "desert" ? 0.6 + rand() * 0.5 : 0.85 + rand() * 0.35), sc);
    // Sunk a little; the shader lifts each one onto the terrain.
    p.set(x, -0.15, z);
    m.compose(p, q, s);
    mesh.setMatrixAt(placed, m);
    placed++;
  }
  mesh.count = placed;
  mesh.instanceMatrix.needsUpdate = true;
  group.add(mesh);
  group.userData.dispose = () => {
    geo.dispose();
    mat.dispose();
    mesh.dispose();
  };
  return group;
}

function colored(g: THREE.BufferGeometry, hex: number): THREE.BufferGeometry {
  const ng = g.index ? g.toNonIndexed() : g;
  for (const name of Object.keys(ng.attributes)) if (name !== "position" && name !== "normal") ng.deleteAttribute(name);
  const c = new THREE.Color(hex);
  const arr = new Float32Array(ng.attributes.position.count * 3);
  for (let i = 0; i < arr.length; i += 3) {
    arr[i] = c.r;
    arr[i + 1] = c.g;
    arr[i + 2] = c.b;
  }
  ng.setAttribute("color", new THREE.BufferAttribute(arr, 3));
  return ng;
}

function propGeometry(set: Exclude<PropSet, "none">): THREE.BufferGeometry {
  const parts: THREE.BufferGeometry[] = [];
  const add = (g: THREE.BufferGeometry, hex: number, x = 0, y = 0, z = 0, sx = 1, sy = 1, sz = 1) => {
    g.scale(sx, sy, sz);
    g.translate(x, y, z);
    parts.push(colored(g, hex));
  };
  if (set === "conifer") {
    add(new THREE.CylinderGeometry(0.18, 0.25, 2.2, 6), 0x3a2c22, 0, 1.1);
    add(new THREE.ConeGeometry(2.3, 4.6, 7), 0x1b2d22, 0, 3.6);
    add(new THREE.ConeGeometry(1.7, 3.6, 7), 0x22382a, 0, 6.0);
    add(new THREE.ConeGeometry(0.9, 2.2, 7), 0xb9c6d4, 0, 7.9);
  } else if (set === "trees") {
    add(new THREE.CylinderGeometry(0.22, 0.3, 3.2, 6), 0x3b2e24, 0, 1.6);
    add(new THREE.IcosahedronGeometry(2.6, 1), 0x2b3b25, 0, 5.0, 0, 1, 0.85, 1);
    add(new THREE.IcosahedronGeometry(1.7, 1), 0x34472c, 1.1, 6.2, 0.6);
  } else if (set === "jungle") {
    add(new THREE.CylinderGeometry(0.25, 0.4, 7, 6), 0x3a3022, 0, 3.5);
    add(new THREE.IcosahedronGeometry(3.4, 1), 0x1d3219, 0, 8.4, 0, 1.25, 0.6, 1.25);
    add(new THREE.IcosahedronGeometry(2.2, 1), 0x253f1f, -1.4, 6.8, 1.0, 1, 0.7, 1);
  } else if (set === "desert") {
    add(new THREE.DodecahedronGeometry(1.3, 0), 0x7d5a3a, 0, 0.5, 0, 1.4, 0.7, 1.1);
    add(new THREE.IcosahedronGeometry(0.7, 0), 0x5d5a35, 2.2, 0.35, 1.2, 1, 0.6, 1);
  } else {
    add(new THREE.CylinderGeometry(0.025, 0.025, 2.0, 4), 0x1a1a1a, 0, 1.0);
    add(new THREE.BoxGeometry(0.02, 0.32, 0.45), 0xf18522, 0, 1.8, 0.24);
  }
  const merged = mergeAll(parts);
  merged.computeBoundingSphere();
  return merged;
}

function mergeAll(parts: THREE.BufferGeometry[]): THREE.BufferGeometry {
  let total = 0;
  for (const p of parts) total += p.attributes.position.count;
  const pos = new Float32Array(total * 3);
  const nor = new Float32Array(total * 3);
  const colr = new Float32Array(total * 3);
  let o = 0;
  for (const p of parts) {
    if (!p.attributes.normal) p.computeVertexNormals();
    pos.set(p.attributes.position.array as Float32Array, o * 3);
    nor.set(p.attributes.normal.array as Float32Array, o * 3);
    colr.set(p.attributes.color.array as Float32Array, o * 3);
    o += p.attributes.position.count;
    p.dispose();
  }
  const g = new THREE.BufferGeometry();
  g.setAttribute("position", new THREE.BufferAttribute(pos, 3));
  g.setAttribute("normal", new THREE.BufferAttribute(nor, 3));
  g.setAttribute("color", new THREE.BufferAttribute(colr, 3));
  return g;
}
