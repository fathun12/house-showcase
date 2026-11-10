"use client";

import { useCallback, useEffect, useRef, useState, type ReactNode } from "react";

type Props = {
  /** Optional heading on the left, the arrows sit on the right */
  heading?: ReactNode;
  /** Slide to the next card by itself every this many ms (paused on hover, focus and touch) */
  autoMs?: number;
  children: ReactNode;
};

const GLIDE_MS = 800;
const REDUCED = "(prefers-reduced-motion: reduce)";

const arrow =
  "grid size-11 place-items-center border-2 border-foreground font-mono text-lg enabled:hover:bg-foreground enabled:hover:text-background disabled:opacity-30";

// Fast at first, slowing down at the end.
const ease = (p: number) => 1 - Math.pow(1 - p, 4);

// Scroll positions where a card sits at the left edge. offsetLeft ignores transforms,
// so a card that is hovered (scaled) or a neighbour that stepped aside does not shift the result.
function snapPoints(el: HTMLElement) {
  const pad = parseFloat(getComputedStyle(el).paddingLeft) || 0;
  const max = el.scrollWidth - el.clientWidth;
  const points: number[] = [];
  for (const child of Array.from(el.children) as HTMLElement[]) {
    const v = Math.min(Math.max(child.offsetLeft - pad, 0), max);
    if (points.length === 0 || v - points[points.length - 1] > 1) points.push(v);
  }
  return points;
}

/** A sideways row with arrows and optional auto slide. Cards inside use .rail-card (globals.css).
 *  Sliding is done here frame by frame (scroll-snap is switched off while moving), not by the
 *  browser's smooth scroll, which fights scroll-snap and looks choppy. */
export function SlideRow({ heading, autoMs, children }: Props) {
  const scroller = useRef<HTMLDivElement>(null);
  const raf = useRef(0);
  const goal = useRef<number | null>(null);
  const paused = useRef(false);
  const holdUntil = useRef(0);
  const [edge, setEdge] = useState({ start: true, end: false });

  const measure = useCallback(() => {
    const el = scroller.current;
    if (!el) return;
    const start = el.scrollLeft <= 4;
    const end = el.scrollLeft + el.clientWidth >= el.scrollWidth - 4;
    setEdge((prev) => (prev.start === start && prev.end === end ? prev : { start, end }));
  }, []);

  // Stop a running glide. restore = switch scroll-snap back on.
  const stop = useCallback((restore: boolean) => {
    if (raf.current) cancelAnimationFrame(raf.current);
    raf.current = 0;
    goal.current = null;
    if (restore && scroller.current) scroller.current.style.scrollSnapType = "";
  }, []);

  const glideTo = useCallback(
    (target: number) => {
      const el = scroller.current;
      if (!el) return;
      stop(false);
      const from = el.scrollLeft;
      const dist = target - from;
      if (Math.abs(dist) < 1) {
        el.style.scrollSnapType = "";
        return;
      }
      if (window.matchMedia(REDUCED).matches) {
        el.style.scrollSnapType = "";
        el.scrollLeft = target;
        return;
      }
      el.style.scrollSnapType = "none";
      goal.current = target;
      const t0 = performance.now();
      const tick = (now: number) => {
        const p = Math.min(1, (now - t0) / GLIDE_MS);
        el.scrollLeft = p < 1 ? from + dist * ease(p) : target;
        if (p < 1) {
          raf.current = requestAnimationFrame(tick);
        } else {
          raf.current = 0;
          goal.current = null;
          el.style.scrollSnapType = "";
        }
      };
      raf.current = requestAnimationFrame(tick);
    },
    [stop],
  );

  // One card forward or back. Forward from the end goes back to the start.
  const step = useCallback(
    (direction: 1 | -1) => {
      const el = scroller.current;
      if (!el) return;
      const max = el.scrollWidth - el.clientWidth;
      if (max <= 1) return;
      const points = snapPoints(el);
      const current = goal.current ?? el.scrollLeft;
      let target: number;
      if (direction === 1) {
        target = current >= max - 1 ? 0 : (points.find((p) => p > current + 1) ?? max);
      } else {
        if (current <= 1) return;
        target = [...points].reverse().find((p) => p < current - 1) ?? 0;
      }
      glideTo(target);
    },
    [glideTo],
  );

  useEffect(() => {
    const el = scroller.current;
    if (!el) return;
    const observer = new ResizeObserver(measure);
    observer.observe(el);
    return () => observer.disconnect();
  }, [measure]);

  useEffect(() => {
    if (!autoMs) return;
    if (window.matchMedia(REDUCED).matches) return;

    const timer = setInterval(() => {
      if (paused.current || document.hidden || raf.current) return;
      if (Date.now() < holdUntil.current) return;
      step(1);
    }, autoMs);

    return () => clearInterval(timer);
  }, [autoMs, step]);

  useEffect(() => () => stop(false), [stop]);

  const manual = (direction: 1 | -1) => {
    holdUntil.current = Date.now() + (autoMs ?? 0);
    step(direction);
  };

  return (
    <div
      onPointerEnter={() => {
        paused.current = true;
      }}
      onPointerLeave={() => {
        paused.current = false;
      }}
      onFocus={() => {
        paused.current = true;
      }}
      onBlur={() => {
        paused.current = false;
      }}
    >
      <div className="flex items-end justify-between gap-6">
        {heading ?? <span />}
        <div className="flex gap-2">
          <button type="button" className={arrow} disabled={edge.start} onClick={() => manual(-1)}>
            ←
          </button>
          <button type="button" className={arrow} disabled={edge.end} onClick={() => manual(1)}>
            →
          </button>
        </div>
      </div>

      <div
        ref={scroller}
        onScroll={measure}
        onWheel={() => stop(true)}
        onTouchStart={() => stop(true)}
        className="rail relative -mx-4 mt-2 flex scroll-px-4 snap-x snap-mandatory gap-4 overflow-x-auto px-4 py-8 [scrollbar-width:none] [&::-webkit-scrollbar]:hidden"
      >
        {children}
      </div>
    </div>
  );
}