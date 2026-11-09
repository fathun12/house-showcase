"use client";

import { useEffect, useRef, useState, type ReactNode } from "react";
import { cn } from "@/lib/utils/cn";

type Props = {
  /** Optional heading, shown on the left of the arrow buttons */
  heading?: ReactNode;
  children: ReactNode;
};

const button =
  "label size-11 border-2 border-foreground hover:bg-foreground hover:text-background disabled:pointer-events-none disabled:opacity-30";

/** A sideways row. Touch and trackpad scroll it natively; the arrow buttons are for a mouse.
 *  The buttons are hidden from screen readers and the tab order: the cards inside are links. */
export function Rail({ heading, children }: Props) {
  const ref = useRef<HTMLDivElement>(null);
  const [edge, setEdge] = useState({ start: true, end: true });

  useEffect(() => {
    const rail = ref.current;
    if (!rail) return;

    const sync = () =>
      setEdge({
        start: rail.scrollLeft <= 4,
        end: rail.scrollLeft + rail.clientWidth >= rail.scrollWidth - 4,
      });

    rail.addEventListener("scroll", sync, { passive: true });
    const observer = new ResizeObserver(sync);
    observer.observe(rail);

    return () => {
      rail.removeEventListener("scroll", sync);
      observer.disconnect();
    };
  }, []);

  const slide = (direction: 1 | -1) => {
    const rail = ref.current;
    if (!rail) return;
    rail.scrollBy({
      left: direction * rail.clientWidth * 0.8,
      behavior: window.matchMedia("(prefers-reduced-motion: reduce)").matches
        ? "auto"
        : "smooth",
    });
  };

  const everythingFits = edge.start && edge.end;

  return (
    <div>
      <div className="flex items-end justify-between gap-4">
        {heading}
        <div
          aria-hidden
          className={cn("ml-auto hidden gap-2 sm:flex", everythingFits && "invisible")}
        >
          <button
            type="button"
            tabIndex={-1}
            disabled={edge.start}
            onClick={() => slide(-1)}
            className={button}
          >
            ←
          </button>
          <button
            type="button"
            tabIndex={-1}
            disabled={edge.end}
            onClick={() => slide(1)}
            className={button}
          >
            →
          </button>
        </div>
      </div>

      <div
        ref={ref}
        className="rail -mx-4 flex snap-x snap-proximity scroll-pl-4 gap-4 overflow-x-auto px-4 py-8 [scrollbar-width:none] [&::-webkit-scrollbar]:hidden"
      >
        {children}
      </div>
    </div>
  );
}