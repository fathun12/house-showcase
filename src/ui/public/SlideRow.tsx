"use client";

import { useCallback, useEffect, useRef, useState, type ReactNode } from "react";

type Props = {
  /** Optional heading on the left, the arrows sit on the right */
  heading?: ReactNode;
  children: ReactNode;
};

const arrow =
  "grid size-11 place-items-center border-2 border-foreground font-mono text-lg enabled:hover:bg-foreground enabled:hover:text-background disabled:opacity-30";

/** A sideways row with arrows. Cards inside use .rail-card (globals.css) for the hover effect. */
export function SlideRow({ heading, children }: Props) {
  const scroller = useRef<HTMLDivElement>(null);
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

  const step = (direction: 1 | -1) => {
    const el = scroller.current;
    const first = el?.firstElementChild as HTMLElement | null;
    if (!el || !first) return;
    const gap = parseFloat(getComputedStyle(el).columnGap) || 0;
    el.scrollBy({ left: direction * (first.offsetWidth + gap), behavior: "smooth" });
  };

  return (
    <div>
      <div className="flex items-end justify-between gap-6">
        {heading ?? <span />}
        <div className="flex gap-2">
          <button type="button" className={arrow} disabled={edge.start} onClick={() => step(-1)}>
            ←
          </button>
          <button type="button" className={arrow} disabled={edge.end} onClick={() => step(1)}>
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