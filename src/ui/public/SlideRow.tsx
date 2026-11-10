"use client";

import { useCallback, useEffect, useRef, useState, type ReactNode } from "react";

type Props = {
  /** Optional heading on the left, the arrows sit on the right */
  heading?: ReactNode;
  /** Slide to the next card by itself every this many ms (paused on hover, focus and touch) */
  autoMs?: number;
  children: ReactNode;
};

const arrow =
  "grid size-11 place-items-center border-2 border-foreground font-mono text-lg enabled:hover:bg-foreground enabled:hover:text-background disabled:opacity-30";

function slide(el: HTMLDivElement, direction: 1 | -1) {
  const first = el.firstElementChild as HTMLElement | null;
  if (!first) return;
  const gap = parseFloat(getComputedStyle(el).columnGap) || 0;
  el.scrollBy({ left: direction * (first.offsetWidth + gap), behavior: "smooth" });
}

/** A sideways row with arrows and optional auto slide. Cards inside use .rail-card (globals.css). */
export function SlideRow({ heading, autoMs, children }: Props) {
  const scroller = useRef<HTMLDivElement>(null);
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

  useEffect(() => {
    const el = scroller.current;
    if (!el) return;
    const observer = new ResizeObserver(measure);
    observer.observe(el);
    return () => observer.disconnect();
  }, [measure]);

  useEffect(() => {
    if (!autoMs) return;
    if (window.matchMedia("(prefers-reduced-motion: reduce)").matches) return;

    const timer = setInterval(() => {
      const el = scroller.current;
      if (!el || paused.current || document.hidden || Date.now() < holdUntil.current) return;
      const atEnd = el.scrollLeft + el.clientWidth >= el.scrollWidth - 4;
      if (atEnd) el.scrollTo({ left: 0, behavior: "smooth" });
      else slide(el, 1);
    }, autoMs);

    return () => clearInterval(timer);
  }, [autoMs]);

  const manual = (direction: 1 | -1) => {
    const el = scroller.current;
    if (!el) return;
    holdUntil.current = Date.now() + (autoMs ?? 0);
    slide(el, direction);
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
        className="rail -mx-4 mt-2 flex scroll-px-4 snap-x snap-mandatory gap-4 overflow-x-auto px-4 py-8 [scrollbar-width:none] [&::-webkit-scrollbar]:hidden"
      >
        {children}
      </div>
    </div>
  );
}