import { useEffect, useRef } from "react";

/**
 * Fades an element in once, the first time it scrolls into view.
 * - The server renders it visible (no attribute), so nothing is hidden without JavaScript.
 * - Only things that start below the fold are hidden; what is already on screen stays put.
 * - With reduced motion nothing is ever hidden.
 * The state lives in a data-reveal attribute ("hidden", then "shown"); CSS does the animation.
 */
export function useReveal<T extends HTMLElement>() {
  const ref = useRef<T>(null);

  useEffect(() => {
    const element = ref.current;
    if (!element) return;
    if (window.matchMedia("(prefers-reduced-motion: reduce)").matches) return;
    if (element.dataset.reveal === "shown") return;
    if (element.getBoundingClientRect().top < window.innerHeight) return;

    element.dataset.reveal = "hidden";

    const observer = new IntersectionObserver(
      (entries) => {
        if (!entries.some((entry) => entry.isIntersecting)) return;
        element.dataset.reveal = "shown";
        observer.disconnect();
      },
      // Wait until the element is a little inside the screen, not just touching the edge
      { rootMargin: "0px 0px -8% 0px" },
    );

    observer.observe(element);

    return () => observer.disconnect();
  }, []);

  return ref;
}