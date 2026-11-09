import { useEffect, useRef, useState } from "react";
import type { PointerEvent } from "react";

export const MIN_SCALE = 1;
export const MAX_SCALE = 5;
export const ZOOM_STEP = 1.4;

const DOUBLE_TAP_SCALE = 2.5;
const SWIPE_DISTANCE = 60;
const TAP_MOVE = 6;

/** scale 1 = the picture fits the stage. x and y are the pan in pixels from the center. */
export type View = { scale: number; x: number; y: number; smooth: boolean };

const FIT: View = { scale: 1, x: 0, y: 0, smooth: true };

type Point = { x: number; y: number };
type Stage = { width: number; height: number; centerX: number; centerY: number };

function measure(element: HTMLElement): Stage {
  const rect = element.getBoundingClientRect();

  return {
    width: rect.width,
    height: rect.height,
    centerX: rect.left + rect.width / 2,
    centerY: rect.top + rect.height / 2,
  };
}

/** Keeps the picture from being dragged out of the stage. */
function clampView(view: View, stage: Stage, ratio: number): View {
  // Size of the picture when it fits the stage (the rest is empty space around it)
  const fitWidth = Math.min(stage.width, stage.height * ratio);
  const fitHeight = Math.min(stage.height, stage.width / ratio);
  const maxX = Math.max(0, (fitWidth * view.scale - stage.width) / 2);
  const maxY = Math.max(0, (fitHeight * view.scale - stage.height) / 2);

  return {
    ...view,
    x: Math.min(maxX, Math.max(-maxX, view.x)),
    y: Math.min(maxY, Math.max(-maxY, view.y)),
  };
}

/** Changes the scale while keeping the point under the cursor (or fingers) where it is. */
function zoomAt(
  view: View,
  scale: number,
  point: Point,
  stage: Stage,
  ratio: number,
  smooth: boolean,
): View {
  const next = Math.min(MAX_SCALE, Math.max(MIN_SCALE, scale));
  const factor = next / view.scale;

  return clampView(
    {
      scale: next,
      x: point.x - (point.x - view.x) * factor,
      y: point.y - (point.y - view.y) * factor,
      smooth,
    },
    stage,
    ratio,
  );
}

function pinchDistance(pointers: Map<number, Point>) {
  const [a, b] = [...pointers.values()];
  return a && b ? Math.hypot(a.x - b.x, a.y - b.y) : 0;
}

function pinchCenter(pointers: Map<number, Point>): Point {
  const [a, b] = [...pointers.values()];
  return a && b ? { x: (a.x + b.x) / 2, y: (a.y + b.y) / 2 } : { x: 0, y: 0 };
}

/**
 * Zoom and pan for one picture: mouse wheel, pinch, double click or tap, drag, and the
 * + - 0 keys. At scale 1 a sideways swipe calls onSwipe (next or previous picture).
 * `ratio` is the picture's width divided by its height.
 */
export function useZoom(ratio: number, onSwipe: (direction: 1 | -1) => void) {
  const stageRef = useRef<HTMLDivElement>(null);
  const [view, setView] = useState<View>(FIT);

  const pointers = useRef(new Map<number, Point>());
  const gesture = useRef({
    startX: 0,
    startY: 0,
    startTime: 0,
    moved: false,
    multi: false,
    pinch: 0,
    tapTime: 0,
    tapX: 0,
    tapY: 0,
  });

  useEffect(() => {
    const element = stageRef.current;
    if (!element) return;

    // Must be a native listener: React's onWheel is passive and cannot stop the page zoom
    const onWheel = (event: WheelEvent) => {
      event.preventDefault();
      const stage = measure(element);
      const unit = event.deltaMode === 1 ? 16 : 1;
      const speed = event.ctrlKey ? 0.01 : 0.002;
      const factor = Math.exp(-event.deltaY * unit * speed);
      const point = { x: event.clientX - stage.centerX, y: event.clientY - stage.centerY };

      setView((current) =>
        zoomAt(current, current.scale * factor, point, stage, ratio, false),
      );
    };

    const onKey = (event: KeyboardEvent) => {
      if (event.ctrlKey || event.metaKey || event.altKey) return;
      const center = { x: 0, y: 0 };

      if (event.key === "+" || event.key === "=") {
        setView((current) =>
          zoomAt(current, current.scale * ZOOM_STEP, center, measure(element), ratio, true),
        );
      } else if (event.key === "-") {
        setView((current) =>
          zoomAt(current, current.scale / ZOOM_STEP, center, measure(element), ratio, true),
        );
      } else if (event.key === "0") {
        setView(FIT);
      }
    };

    // The stage changed size (info panel toggled, phone rotated): start from "fit" again
    const observer = new ResizeObserver(() => setView(FIT));

    observer.observe(element);
    element.addEventListener("wheel", onWheel, { passive: false });
    window.addEventListener("keydown", onKey);

    return () => {
      observer.disconnect();
      element.removeEventListener("wheel", onWheel);
      window.removeEventListener("keydown", onKey);
    };
  }, [ratio]);

  const onPointerDown = (event: PointerEvent<HTMLDivElement>) => {
    event.currentTarget.setPointerCapture(event.pointerId);
    pointers.current.set(event.pointerId, { x: event.clientX, y: event.clientY });

    const g = gesture.current;

    if (pointers.current.size === 1) {
      g.startX = event.clientX;
      g.startY = event.clientY;
      g.startTime = event.timeStamp;
      g.moved = false;
      g.multi = false;
    } else {
      g.multi = true;
      g.pinch = pinchDistance(pointers.current);
    }
  };

  const onPointerMove = (event: PointerEvent<HTMLDivElement>) => {
    const previous = pointers.current.get(event.pointerId);
    if (!previous) return;

    const point = { x: event.clientX, y: event.clientY };
    pointers.current.set(event.pointerId, point);

    const stage = measure(event.currentTarget);
    const g = gesture.current;

    if (pointers.current.size >= 2) {
      const distance = pinchDistance(pointers.current);
      const factor = g.pinch > 0 ? distance / g.pinch : 1;
      const center = pinchCenter(pointers.current);
      const at = { x: center.x - stage.centerX, y: center.y - stage.centerY };
      g.pinch = distance;

      setView((current) => zoomAt(current, current.scale * factor, at, stage, ratio, false));
      return;
    }

    if (Math.hypot(point.x - g.startX, point.y - g.startY) > TAP_MOVE) g.moved = true;

    const dx = point.x - previous.x;
    const dy = point.y - previous.y;

    setView((current) =>
      current.scale > 1
        ? clampView(
            { ...current, x: current.x + dx, y: current.y + dy, smooth: false },
            stage,
            ratio,
          )
        : current,
    );
  };

  const onPointerUp = (event: PointerEvent<HTMLDivElement>) => {
    const g = gesture.current;
    pointers.current.delete(event.pointerId);

    // A pinch is ending: ignore the finger that is still down and the one that just lifted
    if (pointers.current.size > 0) {
      g.moved = true;
      return;
    }
    if (g.multi) return;

    const dx = event.clientX - g.startX;
    const dy = event.clientY - g.startY;

    if (g.moved) {
      const sideways = Math.abs(dx) > SWIPE_DISTANCE && Math.abs(dx) > Math.abs(dy) * 1.5;
      if (view.scale === 1 && sideways) onSwipe(dx < 0 ? 1 : -1);
      return;
    }

    // Long presses do not count as taps
    if (event.timeStamp - g.startTime > 300) return;

    const isDouble =
      event.timeStamp - g.tapTime < 350 &&
      Math.hypot(event.clientX - g.tapX, event.clientY - g.tapY) < 30;

    g.tapTime = isDouble ? 0 : event.timeStamp;
    g.tapX = event.clientX;
    g.tapY = event.clientY;
    if (!isDouble) return;

    if (view.scale > 1) {
      setView(FIT);
      return;
    }

    const stage = measure(event.currentTarget);
    const at = { x: event.clientX - stage.centerX, y: event.clientY - stage.centerY };
    setView((current) => zoomAt(current, DOUBLE_TAP_SCALE, at, stage, ratio, true));
  };

  const onPointerCancel = (event: PointerEvent<HTMLDivElement>) => {
    pointers.current.delete(event.pointerId);
  };

  const zoomBy = (factor: number) => {
    const element = stageRef.current;
    if (!element) return;
    const stage = measure(element);

    setView((current) =>
      zoomAt(current, current.scale * factor, { x: 0, y: 0 }, stage, ratio, true),
    );
  };

  return {
    stageRef,
    view,
    zoomBy,
    reset: () => setView(FIT),
    handlers: { onPointerDown, onPointerMove, onPointerUp, onPointerCancel },
  };
}