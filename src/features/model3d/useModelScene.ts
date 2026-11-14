"use client";

import { useCallback, useEffect, useRef, useState } from "react";
import {
  Box3,
  DirectionalLight,
  Group,
  HemisphereLight,
  Mesh,
  PerspectiveCamera,
  Raycaster,
  Scene,
  Sphere,
  Texture,
  Vector2,
  Vector3,
  WebGLRenderer,
} from "three";
import type { Material, MeshStandardMaterial, Object3D } from "three";
import { OrbitControls } from "three/examples/jsm/controls/OrbitControls.js";
import { GLTFLoader } from "three/examples/jsm/loaders/GLTFLoader.js";
import type { GLTF } from "three/examples/jsm/loaders/GLTFLoader.js";
import type { Motion, PartConfig } from "./config";
import { createRig } from "./motion";
import type { Rig } from "./motion";

export type ModelInput = {
  url: string;
  /** part key (node name) -> what the admin set: label and movement */
  configs: Record<string, PartConfig>;
};

export type PartInfo = {
  id: string;
  /** Stable name inside the file; repeated names get #2, #3, ... */
  key: string;
  name: string;
  label: string;
  visible: boolean;
  motion: Motion;
  open: boolean;
};

export type SceneStatus = "loading" | "ready" | "error";

type BuiltPart = {
  id: string;
  key: string;
  name: string;
  label: string;
  object: Object3D;
  rig: Rig | null;
  motion: Motion;
  progress: number;
  target: number;
};

type Built = {
  controls: OrbitControls;
  canvas: HTMLCanvasElement;
  parts: BuiltPart[];
  reset: () => void;
  dispose: () => void;
};

const OPEN_MS = 600;
const ease = (value: number) => value * value * (3 - 2 * value);

/** SketchUp wraps everything in one or two nodes: go down to the level where the real parts begin. */
function findParts(scene: Object3D): Object3D[] {
  let node = scene;

  while (node.children.length === 1 && node.children[0].children.length > 0) {
    node = node.children[0];
  }

  return node.children.filter(
    (child) => !child.type.endsWith("Camera") && !child.type.endsWith("Light"),
  );
}

/** Names inside one file, made unique: Door, Door#2, Door#3. */
function uniqueKeys(objects: Object3D[]) {
  const seen = new Map<string, number>();

  return objects.map((object, index) => {
    const base = object.name || `part-${index + 1}`;
    const count = (seen.get(base) ?? 0) + 1;
    seen.set(base, count);
    return count === 1 ? base : `${base}#${count}`;
  });
}

function isInside(node: Object3D, ancestor: Object3D) {
  for (let current: Object3D | null = node; current; current = current.parent) {
    if (current === ancestor) return true;
  }
  return false;
}

/** A hit only counts when nothing between the hit and its part is hidden. */
function visibleUpTo(node: Object3D, ancestor: Object3D) {
  for (let current: Object3D | null = node; current; current = current.parent) {
    if (!current.visible) return false;
    if (current === ancestor) return true;
  }
  return false;
}

function disposeTree(root: Object3D) {
  root.traverse((node) => {
    if (!(node instanceof Mesh)) return;

    node.geometry.dispose();
    const materials = Array.isArray(node.material) ? node.material : [node.material];

    for (const material of materials) {
      for (const value of Object.values(material as unknown as Record<string, unknown>)) {
        if (value instanceof Texture) value.dispose();
      }
      material.dispose();
    }
  });
}

function buildScene(
  host: HTMLElement,
  gltfs: GLTF[],
  models: ModelInput[],
  onPick: (id: string, openable: boolean) => void,
): Built {
  const scene = new Scene();
  const camera = new PerspectiveCamera(35, 1, 0.01, 1000);
  const renderer = new WebGLRenderer({ antialias: true, alpha: true });

  renderer.setPixelRatio(Math.min(window.devicePixelRatio, 2));
  const canvas = renderer.domElement;
  canvas.style.display = "block";
  canvas.style.width = "100%";
  canvas.style.height = "100%";
  host.appendChild(canvas);

  const root = new Group();
  scene.add(root);
  for (const gltf of gltfs) root.add(gltf.scene);
  root.updateMatrixWorld(true);

  // Measure the closed model first, so the camera frames it before anything moves
  const sphere = new Box3().setFromObject(root).getBoundingSphere(new Sphere());
  const radius = Number.isFinite(sphere.radius) && sphere.radius > 0 ? sphere.radius : 1;
  const center = sphere.center;

  const parts: BuiltPart[] = [];

  gltfs.forEach((gltf, modelIndex) => {
    const found = findParts(gltf.scene);
    const list = found.length > 0 ? found : [gltf.scene];
    const keys = uniqueKeys(list);
    const configs = models[modelIndex]?.configs ?? {};

    list.forEach((object, index) => {
      const key = keys[index];
      const config = configs[key];
      const rig = config ? createRig(object, config) : null;

      parts.push({
        id: `${modelIndex}:${index}`,
        key,
        name: object.name || key,
        label: config?.label || object.name || key,
        object,
        rig,
        motion: rig && config ? config.motion : "none",
        progress: 0,
        target: 0,
      });
    });
  });

  scene.add(new HemisphereLight(0xffffff, 0x8a8a8a, 1.8));

  const keyLight = new DirectionalLight(0xffffff, 2.4);
  keyLight.position.copy(center).add(new Vector3(3, 5, 4).multiplyScalar(radius));
  keyLight.target.position.copy(center);

  const fillLight = new DirectionalLight(0xffffff, 1.1);
  fillLight.position.copy(center).add(new Vector3(-4, 2, -3).multiplyScalar(radius));
  fillLight.target.position.copy(center);

  scene.add(keyLight, keyLight.target, fillLight, fillLight.target);

  const reduced = window.matchMedia("(prefers-reduced-motion: reduce)").matches;
  const controls = new OrbitControls(camera, canvas);
  controls.enableDamping = !reduced;
  controls.screenSpacePanning = true;

  const reset = () => {
    const vertical = (camera.fov * Math.PI) / 180;
    const horizontal = 2 * Math.atan(Math.tan(vertical / 2) * camera.aspect);
    const distance = (radius / Math.sin(Math.min(vertical, horizontal) / 2)) * 1.05;

    camera.position
      .copy(center)
      .addScaledVector(new Vector3(0.8, 0.5, 1).normalize(), distance);
    camera.near = distance / 100;
    camera.far = distance * 100;
    camera.updateProjectionMatrix();

    controls.target.copy(center);
    controls.minDistance = radius * 0.4;
    controls.maxDistance = distance * 3;
    controls.update();
  };

  let framed = false;

  const resize = () => {
    const width = host.clientWidth;
    const height = host.clientHeight;
    if (width === 0 || height === 0) return;

    renderer.setSize(width, height, false);
    camera.aspect = width / height;
    camera.updateProjectionMatrix();

    // Frame the model once, as soon as the stage has a real size
    if (!framed) {
      framed = true;
      reset();
    }
  };

  const observer = new ResizeObserver(resize);
  observer.observe(host);
  resize();

  // A tap or click (not a drag) on a door or drawer opens or closes it
  const raycaster = new Raycaster();
  const pointer = new Vector2();
  let down: { x: number; y: number; time: number } | null = null;

  const onDown = (event: PointerEvent) => {
    down = event.button === 0 ? { x: event.clientX, y: event.clientY, time: event.timeStamp } : null;
  };

  const onUp = (event: PointerEvent) => {
    const start = down;
    down = null;

    if (!start || !controls.enabled) return;
    if (Math.hypot(event.clientX - start.x, event.clientY - start.y) > 6) return;
    if (event.timeStamp - start.time > 500) return;

    const rect = canvas.getBoundingClientRect();
    pointer.set(
      ((event.clientX - rect.left) / rect.width) * 2 - 1,
      -((event.clientY - rect.top) / rect.height) * 2 + 1,
    );
    raycaster.setFromCamera(pointer, camera);

    for (const hit of raycaster.intersectObject(root, true)) {
      const part = parts.find((item) => isInside(hit.object, item.object));
      if (!part || !visibleUpTo(hit.object, part.object)) continue;

      // The nearest visible surface decides: a frame in front of a drawer does not open the drawer
      onPick(part.id, Boolean(part.rig));
      return;
    }
  };

  canvas.addEventListener("pointerdown", onDown);
  canvas.addEventListener("pointerup", onUp);

  let last = performance.now();

  const render = () => {
    const now = performance.now();
    const elapsed = Math.min(now - last, 50);
    last = now;

    for (const part of parts) {
      if (!part.rig || part.progress === part.target) continue;

      const step = reduced ? 1 : elapsed / OPEN_MS;
      part.progress =
        part.target > part.progress
          ? Math.min(part.target, part.progress + step)
          : Math.max(part.target, part.progress - step);
      part.rig.set(ease(part.progress));
    }

    controls.update();
    renderer.render(scene, camera);
  };

  // Draw only while the stage is on screen: saves the battery of the phone
  let running = false;
  const intersection = new IntersectionObserver((entries) => {
    const visible = Boolean(entries[0]?.isIntersecting);
    if (visible === running) return;

    running = visible;
    renderer.setAnimationLoop(visible ? render : null);
  });
  intersection.observe(host);
  render();

  const dispose = () => {
    canvas.removeEventListener("pointerdown", onDown);
    canvas.removeEventListener("pointerup", onUp);
    intersection.disconnect();
    observer.disconnect();
    renderer.setAnimationLoop(null);
    controls.dispose();
    disposeTree(root);
    renderer.dispose();
    renderer.forceContextLoss();
    canvas.remove();
  };

  return { controls, canvas, parts, reset, dispose };
}

const HIGHLIGHT = 0xb8502a;

type Tinted = { part: BuiltPart; saved: Map<Mesh, Material | Material[]> };

/** Gives every mesh of a part its own copy of the material with a terracotta glow
 *  (materials are shared between parts, so the original ones must not be changed). */
function tint(part: BuiltPart): Tinted {
  const saved = new Map<Mesh, Material | Material[]>();

  part.object.traverse((node) => {
    if (!(node instanceof Mesh)) return;

    saved.set(node, node.material);

    const glow = (material: Material) => {
      const copy = material.clone();
      const standard = copy as MeshStandardMaterial;

      if (standard.emissive) {
        standard.emissive.set(HIGHLIGHT);
        standard.emissiveIntensity = 0.9;
      }

      return copy;
    };

    node.material = Array.isArray(node.material) ? node.material.map(glow) : glow(node.material);
  });

  return { part, saved };
}

function untint(tinted: Tinted | null) {
  if (!tinted) return;

  for (const [mesh, original] of tinted.saved) {
    const copies = Array.isArray(mesh.material) ? mesh.material : [mesh.material];
    mesh.material = original;
    for (const copy of copies) copy.dispose();
  }
}

function toInfo(part: BuiltPart): PartInfo {
  return {
    id: part.id,
    key: part.key,
    name: part.name,
    label: part.label,
    visible: part.object.visible,
    motion: part.motion,
    open: part.target === 1,
  };
}

/** Shows every part again. */
function revealAll(parts: BuiltPart[]) {
  for (const part of parts) part.object.visible = true;
}

/** Sets the open or closed target of every part that can move, and returns their ids. */
function setOpenTargets(parts: BuiltPart[], open: boolean) {
  const ids = new Set<string>();

  for (const part of parts) {
    if (!part.rig) continue;
    part.target = open ? 1 : 0;
    ids.add(part.id);
  }

  return ids;
}

/**
 * Loads the .glb files into one 3D scene inside the element that `hostRef` points to.
 * `interactive` false = the model is only shown (the page scrolls normally over it).
 * Pass a stable `models` value (it restarts the scene whenever it changes).
 */
export function useModelScene(
  models: ModelInput[],
  interactive: boolean,
  /** Admin: a click on a part selects it. Without it, a click opens or closes a door or drawer. */
  onSelect?: (id: string) => void,
) {
  const hostRef = useRef<HTMLDivElement>(null);
  const builtRef = useRef<Built | null>(null);
  const interactiveRef = useRef(interactive);
  const selectRef = useRef(onSelect);
  const highlightRef = useRef<Tinted | null>(null);

  const [parts, setParts] = useState<PartInfo[]>([]);
  const [status, setStatus] = useState<SceneStatus>("loading");

  const applyInteractive = useCallback(() => {
    const built = builtRef.current;
    if (!built) return;

    built.controls.enabled = interactiveRef.current;
    built.canvas.style.touchAction = interactiveRef.current ? "none" : "pan-y";
    built.canvas.style.cursor = interactiveRef.current ? "grab" : "default";
  }, []);

  useEffect(() => {
    interactiveRef.current = interactive;
    applyInteractive();
  }, [interactive, applyInteractive]);

  useEffect(() => {
    selectRef.current = onSelect;
  }, [onSelect]);

  const toggleOpen = useCallback((id: string) => {
    const part = builtRef.current?.parts.find((item) => item.id === id);
    if (!part || !part.rig) return;

    part.target = part.target === 1 ? 0 : 1;
    const open = part.target === 1;

    setParts((current) => current.map((item) => (item.id === id ? { ...item, open } : item)));
  }, []);

  useEffect(() => {
    const host = hostRef.current;
    if (!host) return;

    let disposed = false;
    const loader = new GLTFLoader();

    Promise.all(models.map((model) => loader.loadAsync(model.url)))
      .then((gltfs) => {
        if (disposed) return;

        const built = buildScene(host, gltfs, models, (id, openable) => {
          if (selectRef.current) selectRef.current(id);
          else if (openable) toggleOpen(id);
        });
        builtRef.current = built;
        applyInteractive();

        setParts(built.parts.map(toInfo));
        setStatus("ready");
      })
      .catch(() => {
        if (!disposed) setStatus("error");
      });

    return () => {
      disposed = true;
      untint(highlightRef.current);
      highlightRef.current = null;
      builtRef.current?.dispose();
      builtRef.current = null;
    };
  }, [models, applyInteractive, toggleOpen]);

  const toggle = useCallback((id: string) => {
    const part = builtRef.current?.parts.find((item) => item.id === id);
    if (!part) return;

    part.object.visible = !part.object.visible;
    const visible = part.object.visible;

    setParts((current) => current.map((item) => (item.id === id ? { ...item, visible } : item)));
  }, []);

  const showAll = useCallback(() => {
    revealAll(builtRef.current?.parts ?? []);
    setParts((current) => current.map((item) => ({ ...item, visible: true })));
  }, []);

  const setAllOpen = useCallback((open: boolean) => {
    const ids = setOpenTargets(builtRef.current?.parts ?? [], open);

    setParts((current) =>
      current.map((item) => (ids.has(item.id) ? { ...item, open } : item)),
    );
  }, []);

  /** Admin preview: rebuild the movement of one part from new settings, and show it right away. */
  const applyConfig = useCallback((id: string, config: PartConfig, open: boolean) => {
    const part = builtRef.current?.parts.find((item) => item.id === id);
    if (!part) return;

    part.rig?.dispose();
    part.progress = 0;
    part.rig = createRig(part.object, config);
    part.motion = part.rig ? config.motion : "none";
    part.target = part.rig && open ? 1 : 0;

    setParts((current) => current.map((item) => (item.id === id ? toInfo(part) : item)));
  }, []);

  const resetView = useCallback(() => builtRef.current?.reset(), []);

  /** Admin: make one part glow so it can be told apart from the others (null = none). */
  const highlight = useCallback((id: string | null) => {
    const built = builtRef.current;
    if (!built) return;

    if (highlightRef.current?.part.id === id) return;

    untint(highlightRef.current);
    highlightRef.current = null;

    const part = id ? built.parts.find((item) => item.id === id) : undefined;
    if (part) highlightRef.current = tint(part);
  }, []);

  return {
    hostRef,
    parts,
    status,
    toggle,
    toggleOpen,
    setAllOpen,
    showAll,
    applyConfig,
    resetView,
    highlight,
  };
}