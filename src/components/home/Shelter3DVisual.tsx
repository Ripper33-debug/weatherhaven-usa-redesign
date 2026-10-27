"use client";

import Link from "next/link";
import { useEffect, useRef, useState } from "react";
import { IconX } from "@tabler/icons-react";
import * as THREE from "three";
import { OrbitControls } from "three/examples/jsm/controls/OrbitControls.js";
import { trackEvent } from "@/lib/analytics";
import {
  getShelterZone,
  SHELTER_ZONES,
  type ShelterZone,
  type ShelterZoneId,
} from "@/lib/shelterZones";

import type { ShelterViewMode } from "@/lib/shelter-view-mode";

export type { ShelterViewMode };

type ZoneMesh = {
  mesh: THREE.Mesh;
  glow: THREE.Mesh;
  material: THREE.MeshBasicMaterial;
  glowMaterial: THREE.MeshBasicMaterial;
  zoneId: ShelterZoneId;
  structural?: boolean;
};

type TooltipState = { x: number; y: number; zone: ShelterZone } | null;

const WIREFRAME = 0xffffff;
const BG = 0x080a0c;

const CAMERA_PRESETS: Record<
  ShelterViewMode,
  { position: THREE.Vector3; target: THREE.Vector3 }
> = {
  shelter: {
    position: new THREE.Vector3(10, 6, 10),
    target: new THREE.Vector3(0, 2.2, 0),
  },
  power: {
    position: new THREE.Vector3(14, 5, 2),
    target: new THREE.Vector3(0, 1.5, 0),
  },
  field: {
    position: new THREE.Vector3(18, 12, 18),
    target: new THREE.Vector3(0, 2, 0),
  },
};

const VIEW_HIGHLIGHTS: Record<ShelterViewMode, ShelterZoneId[] | "pulse"> = {
  shelter: ["roof", "walls", "entrance"],
  power: ["ecu", "power"],
  field: "pulse",
};

function createWireMaterial(opacity = 0.25) {
  return new THREE.MeshBasicMaterial({
    color: WIREFRAME,
    wireframe: true,
    transparent: true,
    opacity,
  });
}

function addZoneMesh(
  zones: ZoneMesh[],
  geometry: THREE.BufferGeometry,
  zoneId: ShelterZoneId,
  position: THREE.Vector3,
  rotation?: THREE.Euler,
  scale?: THREE.Vector3,
) {
  const material = createWireMaterial(0.25);
  const mesh = new THREE.Mesh(geometry, material);
  mesh.position.copy(position);
  if (rotation) mesh.rotation.copy(rotation);
  if (scale) mesh.scale.copy(scale);
  mesh.userData.zoneId = zoneId;

  const glowMaterial = new THREE.MeshBasicMaterial({
    color: WIREFRAME,
    wireframe: true,
    transparent: true,
    opacity: 0.12,
  });
  const glow = new THREE.Mesh(geometry.clone(), glowMaterial);
  glow.position.copy(position);
  if (rotation) glow.rotation.copy(rotation);
  if (scale) glow.scale.copy(scale);
  glow.scale.multiplyScalar(1.04);
  glow.visible = false;

  zones.push({ mesh, glow, material, glowMaterial, zoneId });
  return { mesh, glow };
}

function createRoofPanelGeometry(
  length: number,
  halfDepth: number,
  wallTop: number,
  peakY: number,
  side: 1 | -1,
): THREE.BufferGeometry {
  const zEave = side * halfDepth;
  const halfLen = length / 2;
  const positions = new Float32Array([
    -halfLen, peakY, 0,
    halfLen, peakY, 0,
    halfLen, wallTop, zEave,
    -halfLen, wallTop, zEave,
  ]);
  const geom = new THREE.BufferGeometry();
  geom.setAttribute("position", new THREE.BufferAttribute(positions, 3));
  geom.setIndex([0, 1, 2, 0, 2, 3]);
  geom.computeVertexNormals();
  return geom;
}

function addGuyWire(shelter: THREE.Group, from: THREE.Vector3, to: THREE.Vector3) {
  const wireGeom = new THREE.CylinderGeometry(0.02, 0.02, 1, 4);
  const wire = new THREE.Mesh(wireGeom, createWireMaterial(0.35));
  const dir = to.clone().sub(from);
  const len = dir.length();
  wire.position.copy(from).addScaledVector(dir, 0.5);
  wire.scale.set(1, len, 1);
  wire.quaternion.setFromUnitVectors(new THREE.Vector3(0, 1, 0), dir.normalize());
  shelter.add(wire);
}

function buildShelter(mobile: boolean): { group: THREE.Group; zones: ZoneMesh[] } {
  const shelter = new THREE.Group();
  const zones: ZoneMesh[] = [];

  const w = 10;
  const d = 6;
  const wallH = 2.5;
  const wallT = 0.05;
  const baseY = 0.05;
  const wallCenterY = baseY + wallH / 2;
  const wallTop = baseY + wallH;
  const peakY = wallTop + 1.5;
  const halfW = w / 2;
  const halfD = d / 2;

  // Ground footprint
  addZoneMesh(
    zones,
    new THREE.BoxGeometry(w, 0.1, d),
    "walls",
    new THREE.Vector3(0, baseY, 0),
  );

  // Four wall panels
  addZoneMesh(
    zones,
    new THREE.BoxGeometry(w, wallH, wallT),
    "walls",
    new THREE.Vector3(0, wallCenterY, halfD + wallT / 2),
  );
  addZoneMesh(
    zones,
    new THREE.BoxGeometry(w, wallH, wallT),
    "walls",
    new THREE.Vector3(0, wallCenterY, -halfD - wallT / 2),
  );
  addZoneMesh(
    zones,
    new THREE.BoxGeometry(wallT, wallH, d),
    "walls",
    new THREE.Vector3(halfW + wallT / 2, wallCenterY, 0),
  );
  addZoneMesh(
    zones,
    new THREE.BoxGeometry(wallT, wallH, d),
    "walls",
    new THREE.Vector3(-halfW - wallT / 2, wallCenterY, 0),
  );

  // Peaked A-frame roof (ridge along X)
  addZoneMesh(
    zones,
    createRoofPanelGeometry(w, halfD, wallTop, peakY, 1),
    "roof",
    new THREE.Vector3(0, 0, 0),
  );
  addZoneMesh(
    zones,
    createRoofPanelGeometry(w, halfD, wallTop, peakY, -1),
    "roof",
    new THREE.Vector3(0, 0, 0),
  );

  // Ridge pole along peak
  const ridgeGeom = new THREE.CylinderGeometry(0.03, 0.03, w, 6);
  const ridge = new THREE.Mesh(ridgeGeom, createWireMaterial(0.35));
  ridge.rotation.z = Math.PI / 2;
  ridge.position.set(0, peakY, 0);
  shelter.add(ridge);

  // Entry vestibule — center of +Z short wall
  addZoneMesh(
    zones,
    new THREE.BoxGeometry(2, 2, 2),
    "entrance",
    new THREE.Vector3(0, baseY + 1, halfD + 1),
  );

  // ECU against +X long wall
  addZoneMesh(
    zones,
    new THREE.BoxGeometry(1, 0.8, 0.8),
    "ecu",
    new THREE.Vector3(halfW + 0.5, baseY + 0.4, 0),
  );

  // Power box against -X long wall
  addZoneMesh(
    zones,
    new THREE.BoxGeometry(0.5, 0.5, 0.5),
    "power",
    new THREE.Vector3(-halfW - 0.35, baseY + 0.25, 0),
  );

  // Guy wires — roof eave corners to exterior stakes
  const eaveCorners: THREE.Vector3[] = [
    new THREE.Vector3(halfW, wallTop, halfD),
    new THREE.Vector3(-halfW, wallTop, halfD),
    new THREE.Vector3(halfW, wallTop, -halfD),
    new THREE.Vector3(-halfW, wallTop, -halfD),
  ];
  const stakes: THREE.Vector3[] = [
    new THREE.Vector3(halfW + 1, 0, halfD + 1),
    new THREE.Vector3(-halfW - 1, 0, halfD + 1),
    new THREE.Vector3(halfW + 1, 0, -halfD - 1),
    new THREE.Vector3(-halfW - 1, 0, -halfD - 1),
  ];
  for (let i = 0; i < 4; i++) {
    addGuyWire(shelter, eaveCorners[i]!, stakes[i]!);
  }

  if (mobile) {
    shelter.scale.setScalar(0.55);
  }

  for (const z of zones) {
    shelter.add(z.mesh);
    shelter.add(z.glow);
  }

  return { group: shelter, zones };
}

type Props = {
  activeView: ShelterViewMode;
  className?: string;
};

export function Shelter3DVisual({ activeView, className }: Props) {
  const mountRef = useRef<HTMLDivElement>(null);
  const canvasRef = useRef<HTMLCanvasElement | null>(null);
  const [tooltip, setTooltip] = useState<TooltipState>(null);
  const [active, setActive] = useState<ShelterZone | null>(null);
  const [panelOpen, setPanelOpen] = useState(false);

  const stateRef = useRef({
    renderer: null as THREE.WebGLRenderer | null,
    scene: null as THREE.Scene | null,
    camera: null as THREE.PerspectiveCamera | null,
    controls: null as OrbitControls | null,
    shelter: null as THREE.Group | null,
    zones: [] as ZoneMesh[],
    interiorLight: null as THREE.PointLight | null,
    raycaster: new THREE.Raycaster(),
    pointer: new THREE.Vector2(),
    hovered: null as ShelterZoneId | null,
    selected: null as ShelterZoneId | null,
    autoRotate: true,
    userInteracting: false,
    resumeTimer: 0,
    visible: true,
    activeView: "shelter" as ShelterViewMode,
    cameraGoal: CAMERA_PRESETS.shelter.position.clone(),
    cameraTargetGoal: CAMERA_PRESETS.shelter.target.clone(),
    pulseIndex: 0,
    pulseTimer: 0,
    raf: 0,
    mobile: false,
  });

  useEffect(() => {
    stateRef.current.activeView = activeView;
    const preset = CAMERA_PRESETS[activeView];
    stateRef.current.cameraGoal = preset.position.clone();
    stateRef.current.cameraTargetGoal = preset.target.clone();
  }, [activeView]);

  useEffect(() => {
    const mount = mountRef.current;
    if (!mount) return;

    const mobile = window.matchMedia("(max-width: 767px)").matches;
    stateRef.current.mobile = mobile;

    const scene = new THREE.Scene();
    scene.background = new THREE.Color(BG);
    scene.fog = new THREE.Fog(BG, 18, 32);

    const camera = new THREE.PerspectiveCamera(45, 1, 0.1, 100);
    camera.position.set(10, 6, 10);

    const renderer = new THREE.WebGLRenderer({ antialias: true, alpha: false });
    renderer.setPixelRatio(Math.min(window.devicePixelRatio, mobile ? 1.5 : 2));
    renderer.setClearColor(BG);
    canvasRef.current = renderer.domElement;
    canvasRef.current.style.display = "block";
    canvasRef.current.style.width = "100%";
    canvasRef.current.style.height = "100%";
    canvasRef.current.style.touchAction = "none";
    mount.appendChild(canvasRef.current);

    const ambient = new THREE.AmbientLight(0x111111, 1);
    scene.add(ambient);
    const dir = new THREE.DirectionalLight(WIREFRAME, 0.3);
    dir.position.set(6, 10, 4);
    scene.add(dir);

    const interiorLight = new THREE.PointLight(0xffffff, 0, 8);
    interiorLight.position.set(0, 1.2, 0);
    scene.add(interiorLight);

    const grid = new THREE.GridHelper(24, 24, WIREFRAME, WIREFRAME);
    const gridMat = grid.material as THREE.Material;
    if (Array.isArray(gridMat)) gridMat.forEach((m) => ((m as THREE.Material).opacity = 0.06));
    else (gridMat as THREE.LineBasicMaterial).opacity = 0.06;
    if (Array.isArray(gridMat)) gridMat.forEach((m) => ((m as THREE.Material).transparent = true));
    else (gridMat as THREE.LineBasicMaterial).transparent = true;
    scene.add(grid);

    const { group: shelter, zones } = buildShelter(mobile);
    scene.add(shelter);

    const controls = new OrbitControls(camera, renderer.domElement);
    controls.enableDamping = true;
    controls.dampingFactor = 0.05;
    controls.minDistance = 5;
    controls.maxDistance = 20;
    controls.target.set(0, 2.2, 0);
    controls.enablePan = true;
    controls.mouseButtons = {
      LEFT: THREE.MOUSE.ROTATE,
      MIDDLE: THREE.MOUSE.DOLLY,
      RIGHT: THREE.MOUSE.PAN,
    };

    stateRef.current = {
      ...stateRef.current,
      renderer,
      scene,
      camera,
      controls,
      shelter,
      zones,
      interiorLight,
    };

    const setZoneVisual = (
      zoneId: ShelterZoneId,
      mode: "default" | "hover" | "selected" | "dim" | "pulse",
    ) => {
      for (const z of zones) {
        if (z.zoneId !== zoneId) continue;
        z.glow.visible = mode === "selected";
        if (mode === "hover" || mode === "selected") {
          z.material.opacity = 1;
        } else if (mode === "pulse") {
          z.material.opacity = 0.65;
        } else if (mode === "dim") {
          z.material.opacity = 0.12;
        } else {
          z.material.opacity = 0.35;
        }
      }
    };

    const resetAllZones = () => {
      const s = stateRef.current;
      const sel = s.selected;
      const hov = s.hovered;
      for (const z of zones) {
        if (sel === z.zoneId) {
          setZoneVisual(z.zoneId, "selected");
        } else if (hov === z.zoneId) {
          setZoneVisual(z.zoneId, "hover");
        } else {
          setZoneVisual(z.zoneId, "default");
        }
      }
    };

    const applyViewHighlights = () => {
      const s = stateRef.current;
      const mode = s.activeView;
      const spec = VIEW_HIGHLIGHTS[mode];
      if (spec === "pulse") {
        const id = SHELTER_ZONES[s.pulseIndex % SHELTER_ZONES.length]!.id;
        for (const z of zones) {
          if (z.zoneId === id && !s.selected) setZoneVisual(z.zoneId, "pulse");
          else if (z.zoneId === s.selected) setZoneVisual(z.zoneId, "selected");
          else setZoneVisual(z.zoneId, "dim");
        }
        return;
      }
      for (const z of zones) {
        if (s.selected === z.zoneId) setZoneVisual(z.zoneId, "selected");
        else if (spec.includes(z.zoneId)) setZoneVisual(z.zoneId, "hover");
        else setZoneVisual(z.zoneId, "dim");
      }
    };

    const onResize = () => {
      if (!mount || !stateRef.current.renderer || !stateRef.current.camera) return;
      const w = mount.clientWidth;
      const h = mount.clientHeight;
      if (w < 1 || h < 1) return;
      stateRef.current.camera.aspect = w / h;
      stateRef.current.camera.updateProjectionMatrix();
      stateRef.current.renderer.setSize(w, h, false);
    };

    const onPointerMove = (e: PointerEvent) => {
      const s = stateRef.current;
      if (!s.camera || !s.renderer) return;
      const rect = s.renderer.domElement.getBoundingClientRect();
      s.pointer.x = ((e.clientX - rect.left) / rect.width) * 2 - 1;
      s.pointer.y = -((e.clientY - rect.top) / rect.height) * 2 + 1;
      s.raycaster.setFromCamera(s.pointer, s.camera);
      const meshes = zones.map((z) => z.mesh);
      const hits = s.raycaster.intersectObjects(meshes, false);
      const hit = hits[0]?.object as THREE.Mesh | undefined;
      const zoneId = hit?.userData.zoneId as ShelterZoneId | undefined;

      if (zoneId) {
        s.hovered = zoneId;
        const zone = getShelterZone(zoneId);
        setTooltip({ x: e.clientX, y: e.clientY, zone });
        s.renderer.domElement.style.cursor = "pointer";
        if (s.activeView !== "field") {
          resetAllZones();
          if (s.selected !== zoneId) setZoneVisual(zoneId, "hover");
        }
        s.interiorLight!.intensity = zoneId === "interior" ? 0.45 : 0;
      } else {
        s.hovered = null;
        setTooltip(null);
        s.renderer.domElement.style.cursor = "grab";
        if (s.activeView === "field") applyViewHighlights();
        else resetAllZones();
        if (!s.selected) s.interiorLight!.intensity = 0;
      }
    };

    const onPointerDown = () => {
      stateRef.current.userInteracting = true;
      stateRef.current.autoRotate = false;
    };

    const onPointerUp = () => {
      stateRef.current.userInteracting = false;
      stateRef.current.resumeTimer = performance.now() + 3000;
    };

    const onClick = () => {
      const s = stateRef.current;
      if (!s.hovered) return;
      const zone = getShelterZone(s.hovered);
      void trackEvent("click", `Shelter zone — ${zone.name}`);
      s.selected = s.hovered;
      setActive(zone);
      setPanelOpen(true);
      for (const z of zones) {
        z.glow.visible = z.zoneId === s.selected;
        if (z.zoneId === s.selected) z.material.opacity = 1;
      }
    };

    const onPointerEnter = () => {
      stateRef.current.autoRotate = false;
    };

    const onPointerLeave = () => {
      stateRef.current.hovered = null;
      setTooltip(null);
      stateRef.current.resumeTimer = performance.now() + 3000;
      if (stateRef.current.activeView === "field") applyViewHighlights();
      else resetAllZones();
    };

    const onVisibility = () => {
      stateRef.current.visible = document.visibilityState === "visible";
    };

    renderer.domElement.addEventListener("pointermove", onPointerMove);
    renderer.domElement.addEventListener("pointerdown", onPointerDown);
    renderer.domElement.addEventListener("pointerup", onPointerUp);
    renderer.domElement.addEventListener("click", onClick);
    renderer.domElement.addEventListener("pointerenter", onPointerEnter);
    renderer.domElement.addEventListener("pointerleave", onPointerLeave);
    document.addEventListener("visibilitychange", onVisibility);

    const ro = new ResizeObserver(onResize);
    ro.observe(mount);
    onResize();

    let last = performance.now();
    const tick = (now: number) => {
      const s = stateRef.current;
      if (!s.visible || !s.renderer || !s.scene || !s.camera || !s.controls || !s.shelter) {
        s.raf = requestAnimationFrame(tick);
        return;
      }

      const dt = (now - last) / 1000;
      last = now;

      if (
        s.autoRotate &&
        !s.userInteracting &&
        now > s.resumeTimer &&
        s.activeView !== "field"
      ) {
        s.shelter.rotation.y += 0.002;
      }

      if (s.activeView === "field") {
        s.pulseTimer += dt;
        if (s.pulseTimer > 1.4) {
          s.pulseTimer = 0;
          s.pulseIndex = (s.pulseIndex + 1) % SHELTER_ZONES.length;
          applyViewHighlights();
        }
      } else {
        applyViewHighlights();
      }

      s.camera.position.lerp(s.cameraGoal, 0.06);
      s.controls.target.lerp(s.cameraTargetGoal, 0.06);
      s.controls.update();
      s.renderer.render(s.scene, s.camera);
      s.raf = requestAnimationFrame(tick);
    };
    stateRef.current.raf = requestAnimationFrame(tick);

    return () => {
      cancelAnimationFrame(stateRef.current.raf);
      ro.disconnect();
      document.removeEventListener("visibilitychange", onVisibility);
      renderer.domElement.removeEventListener("pointermove", onPointerMove);
      renderer.domElement.removeEventListener("pointerdown", onPointerDown);
      renderer.domElement.removeEventListener("pointerup", onPointerUp);
      renderer.domElement.removeEventListener("click", onClick);
      renderer.domElement.removeEventListener("pointerenter", onPointerEnter);
      renderer.domElement.removeEventListener("pointerleave", onPointerLeave);
      controls.dispose();
      zones.forEach((z) => {
        z.mesh.geometry.dispose();
        z.glow.geometry.dispose();
        z.material.dispose();
        z.glowMaterial.dispose();
      });
      shelter.traverse((obj) => {
        if (obj instanceof THREE.Mesh) {
          obj.geometry.dispose();
          const mat = obj.material;
          if (Array.isArray(mat)) mat.forEach((m) => m.dispose());
          else mat.dispose();
        }
      });
      grid.geometry.dispose();
      const gridM = grid.material;
      if (Array.isArray(gridM)) gridM.forEach((m) => m.dispose());
      else gridM.dispose();
      renderer.dispose();
      if (renderer.domElement.parentNode) renderer.domElement.parentNode.removeChild(renderer.domElement);
    };
  }, []);

  const closePanel = () => {
    setPanelOpen(false);
    window.setTimeout(() => {
      setActive(null);
      stateRef.current.selected = null;
      const s = stateRef.current;
      for (const z of s.zones) {
        z.glow.visible = false;
      }
    }, 280);
  };

  return (
    <div ref={mountRef} data-shelter-3d className={`relative h-full w-full min-h-[220px] ${className ?? ""}`}>
      {tooltip && (
        <div
          className="pointer-events-none fixed z-[60] max-w-[240px] border border-white/10 bg-[#0d0f12] px-3 py-2 shadow-lg"
          style={{ left: tooltip.x + 14, top: tooltip.y + 14 }}
        >
          <p className="text-[11px] font-semibold tracking-[0.15em] text-[#4d9fff]">{tooltip.zone.name}</p>
          <p className="mt-1 text-[13px] leading-snug text-[#8a9099]">{tooltip.zone.tooltipSpec}</p>
        </div>
      )}

      <aside
        className={`fixed inset-y-0 right-0 z-[55] flex w-full max-w-full flex-col border-l border-white/[0.08] bg-[#0d0f12] transition-transform duration-300 ease-out sm:max-w-[360px] ${
          panelOpen ? "translate-x-0" : "translate-x-full"
        }`}
        aria-hidden={!panelOpen}
      >
        {active && (
          <>
            <div className="flex items-center justify-between border-b border-white/[0.08] px-5 py-4">
              <p className="wh-label">{active.name}</p>
              <button
                type="button"
                onClick={closePanel}
                className="p-2 text-[#8a9099] hover:text-white"
                aria-label="Close zone detail"
              >
                <IconX size={20} stroke={1.5} />
              </button>
            </div>
            <div className="flex-1 overflow-y-auto px-5 py-6">
              <h3 className="font-display text-xl font-semibold text-white">{active.title}</h3>
              <ul className="mt-6 space-y-3 text-sm leading-relaxed text-[#8a9099]">
                {active.bullets.map((b) => (
                  <li key={b} className="flex gap-3">
                    <span className="mt-2 h-1 w-1 shrink-0 bg-[#4d9fff]" />
                    <span>{b}</span>
                  </li>
                ))}
              </ul>
              <Link
                href={active.learnMoreHref}
                className="mt-8 inline-block text-[11px] font-semibold uppercase tracking-[0.16em] text-[#4d9fff] transition-opacity hover:opacity-70"
              >
                Learn More →
              </Link>
            </div>
          </>
        )}
      </aside>
    </div>
  );
}
