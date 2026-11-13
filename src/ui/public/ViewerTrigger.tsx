"use client";

import type { ReactNode } from "react";
import { useTranslations } from "next-intl";
import { useOpenViewer } from "@/features/viewer/context";
import { cn } from "@/lib/utils/cn";

type Props = {
  /** The picture's src, which is how the viewer finds it */
  itemKey: string;
  /** Fill the (positioned) parent, e.g. the hero image */
  fill?: boolean;
  children: ReactNode;
};

/** Makes a picture clickable. A small "Zoom" tag says so: always on touch screens,
 *  on hover or focus with a mouse. */
export function ViewerTrigger({ itemKey, fill, children }: Props) {
  const t = useTranslations("public.viewer");
  const open = useOpenViewer();

  return (
    <button
      type="button"
      onClick={() => open(itemKey)}
      className={cn(
        "group/zoom block w-full cursor-zoom-in text-left",
        fill ? "absolute inset-0" : "relative",
      )}
    >
      <span className="sr-only">{t("open")}</span>
      {children}
      <span
        aria-hidden
        className="label pointer-events-none absolute top-0 right-0 bg-foreground px-3 py-1.5 text-background transition-opacity pointer-fine:opacity-0 pointer-fine:group-hover/zoom:opacity-100 pointer-fine:group-focus-visible/zoom:opacity-100"
      >
        {t("open")}
      </span>
    </button>
  );
}