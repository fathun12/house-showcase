import { useCallback, useEffect, useState } from "react";
import type { ViewerItem } from "@/features/viewer/items";

/** Which picture is open (if any) and how to move between pictures. */
export function useViewer(items: ViewerItem[]) {
  const [index, setIndex] = useState<number | null>(null);
  const count = items.length;

  const open = useCallback(
    (key: string) => {
      const found = items.findIndex((item) => item.key === key);
      if (found >= 0) setIndex(found);
    },
    [items],
  );

  const close = useCallback(() => setIndex(null), []);

  const step = useCallback(
    (direction: 1 | -1) => {
      setIndex((current) =>
        current === null || count === 0 ? current : (current + direction + count) % count,
      );
    },
    [count],
  );

  const item = index === null ? null : (items[index] ?? null);
  const previous = index === null || count === 0 ? null : items[(index - 1 + count) % count];
  const next = index === null || count === 0 ? null : items[(index + 1) % count];

  return {
    item,
    position: index === null ? 0 : index + 1,
    count,
    previousSrc: previous?.image.src ?? "",
    nextSrc: next?.image.src ?? "",
    open,
    close,
    step,
  };
}

/** Arrow keys move between pictures. (Escape is handled by the dialog itself.) */
export function useViewerKeys(onStep: (direction: 1 | -1) => void) {
  useEffect(() => {
    const onKey = (event: KeyboardEvent) => {
      if (event.ctrlKey || event.metaKey || event.altKey || event.shiftKey) return;
      if (event.key === "ArrowRight") onStep(1);
      if (event.key === "ArrowLeft") onStep(-1);
    };

    window.addEventListener("keydown", onKey);
    return () => window.removeEventListener("keydown", onKey);
  }, [onStep]);
}

/** Freezes the page behind the viewer without letting it jump sideways. */
export function useScrollLock() {
  useEffect(() => {
    const { body, documentElement } = document;
    const before = { overflow: body.style.overflow, paddingRight: body.style.paddingRight };
    const scrollbar = window.innerWidth - documentElement.clientWidth;

    body.style.overflow = "hidden";
    if (scrollbar > 0) body.style.paddingRight = `${scrollbar}px`;

    return () => {
      body.style.overflow = before.overflow;
      body.style.paddingRight = before.paddingRight;
    };
  }, []);
}