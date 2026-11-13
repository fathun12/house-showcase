"use client";

import { useCallback, useEffect, useRef, useState } from "react";
import {
  Box3,
  DirectionalLight,
  Group,
  HemisphereLight,
  Mesh,
  PerspectiveCamera,
  Scene,
  Sphere,
  Texture,
  Vector3,
  WebGLRenderer,
} from "three";
import type { Object3D } from "three";
import { OrbitControls } from "three/examples/jsm/controls/OrbitControls.js";
import { GLTFLoader } from "three/examples/jsm/loaders/GLTFLoader.js";
import type { GLTF } from "three/examples/jsm/loaders/GLTFLoader.js";

export type ModelInput = {
  url: string;
  /** glTF node name -> label chosen in the admin */
  labels: Record<string, string>;
};

export type PartInfo = { id: string; label: string; visible: boolean };

export type SceneStatus = "loading" | "ready" | "error";

type Built = {
  controls: OrbitControls;
  canvas: HTMLCanvasElement;
  parts: { id: string; label: string; object: Object3D }[];
  reset: () => void;
  dispose: () => void;
};

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

function buildScene(host: HTMLElement, gltfs: GLTF[], models: ModelInput[]): Built {
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

  const parts: Built["parts"] = [];

  gltfs.forEach((gltf, modelIndex) => {
    root.add(gltf.scene);

    const labels = models[modelIndex]?.labels ?? {};
    const found = findParts(gltf.scene);
    const list = found.length > 0 ? found : [gltf.scene];

    list.forEach((object, index) => {
      parts.push({
        id: `${modelIndex}:${index}`,
        label: labels[object.name] || object.name,
        object,
      });
    });
  });

  const sphere = new Box3().setFromObject(root).getBoundingSphere(new Sphere());
  const radius = Number.isFinite(sphere.radius) && sphere.radius > 0 ? sphere.radius : 1;
  const center = sphere.center;

  scene.add(new HemisphereLight(0xffffff, 0x8a8a8a, 1.8));

  const keyLight = new DirectionalLight(0xffffff, 2.4);
  keyLight.position.copy(center).add(new Vector3(3, 5, 4).multiplyScalar(radius));
  keyLight.target.position.copy(center);

  const fillLight = new DirectionalLight(0xffffff, 1.1);
  fillLight.position.copy(center).add(new Vector3(-4, 2, -3).multiplyScalar(radius));
  fillLight.target.position.copy(center);

  scene.add(keyLight, keyLight.target, fillLight, fillLight.target);

  const controls = new OrbitControls(camera, canvas);
  controls.enableDamping = !window.matchMedia("(prefers-reduced-motion: reduce)").matches;
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

  const render = () => {
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

/**
 * Loads the .glb files into one 3D scene inside the element that `hostRef` points to.
 * `interactive` false = the model is only shown (the page scrolls normally over it).
 * Pass a stable `models` array (it restarts the scene whenever it changes).
 */
export function useModelScene(models: ModelInput[], interactive: boolean) {
  const hostRef = useRef<HTMLDivElement>(null);
  const controlsRef = useRef<OrbitControls | null>(null);
  const canvasRef = useRef<HTMLCanvasElement | null>(null);
  const objectsRef = useRef(new Map<string, Object3D>());
  const resetRef = useRef<() => void>(() => {});
  const interactiveRef = useRef(interactive);

  const [parts, setParts] = useState<PartInfo[]>([]);
  const [status, setStatus] = useState<SceneStatus>("loading");

  const applyInteractive = useCallback(() => {
    const controls = controlsRef.current;
    const canvas = canvasRef.current;
    if (!controls || !canvas) return;

    controls.enabled = interactiveRef.current;
    canvas.style.touchAction = interactiveRef.current ? "none" : "pan-y";
    canvas.style.cursor = interactiveRef.current ? "grab" : "default";
  }, []);

  useEffect(() => {
    interactiveRef.current = interactive;
    applyInteractive();
  }, [interactive, applyInteractive]);

  useEffect(() => {
    const host = hostRef.current;
    if (!host) return;

    let disposed = false;
    const holder: { built: Built | null } = { built: null };
    const loader = new GLTFLoader();

    Promise.all(models.map((model) => loader.loadAsync(model.url)))
      .then((gltfs) => {
        if (disposed) return;

        const built = buildScene(host, gltfs, models);
        holder.built = built;

        controlsRef.current = built.controls;
        canvasRef.current = built.canvas;
        resetRef.current = built.reset;
        objectsRef.current = new Map(built.parts.map((part) => [part.id, part.object]));
        applyInteractive();

        setParts(built.parts.map((part) => ({ id: part.id, label: part.label, visible: true })));
        setStatus("ready");
      })
      .catch(() => {
        if (!disposed) setStatus("error");
      });

    return () => {
      disposed = true;
      holder.built?.dispose();
      controlsRef.current = null;
      canvasRef.current = null;
      resetRef.current = () => {};
      objectsRef.current = new Map();
    };
  }, [models, applyInteractive]);

  const toggle = useCallback((id: string) => {
    const object = objectsRef.current.get(id);
    if (!object) return;

    object.visible = !object.visible;
    const visible = object.visible;

    setParts((current) => current.map((part) => (part.id === id ? { ...part, visible } : part)));
  }, []);

  const showAll = useCallback(() => {
    for (const object of objectsRef.current.values()) object.visible = true;
    setParts((current) => current.map((part) => ({ ...part, visible: true })));
  }, []);

  const resetView = useCallback(() => resetRef.current(), []);

  return { hostRef, parts, status, toggle, showAll, resetView };
}