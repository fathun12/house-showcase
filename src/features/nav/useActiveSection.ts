import { useEffect, useState } from "react";

/**
 * Scroll spy: returns the id of the last element whose top has passed a line
 * placed a bit below the top of the screen (30% of the viewport by default).
 * At the very bottom of the page the last element counts as active, even when
 * it is too short to ever reach the line.
 */
export function useActiveSection(ids: string[], offset = 0.3) {
  const [active, setActive] = useState<string | null>(null);
  const key = ids.join("|");

  useEffect(() => {
    const list = key ? key.split("|") : [];
    let frame = 0;

    const update = () => {
      frame = 0;
      const line = window.innerHeight * offset;
      const atBottom =
        window.innerHeight + window.scrollY >= document.documentElement.scrollHeight - 2;
      let current: string | null = null;

      for (const id of list) {
        const element = document.getElementById(id);
        if (!element) continue;
        if (element.getBoundingClientRect().top <= line || atBottom) current = id;
      }

      setActive(current);
    };

    const schedule = () => {
      if (!frame) frame = requestAnimationFrame(update);
    };

    schedule();
    window.addEventListener("scroll", schedule, { passive: true });
    window.addEventListener("resize", schedule);

    return () => {
      window.removeEventListener("scroll", schedule);
      window.removeEventListener("resize", schedule);
      if (frame) cancelAnimationFrame(frame);
    };
  }, [key, offset]);

  return active;
}