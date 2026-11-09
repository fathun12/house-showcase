"use client";

import type { ElementType, HTMLAttributes } from "react";
import { useReveal } from "@/features/motion/useReveal";
import { cn } from "@/lib/utils/cn";

type Props = HTMLAttributes<HTMLElement> & {
  as?: ElementType;
  /** lift: fades in and rises 12 px (text). fade: only fades in (pictures and rules). */
  kind?: "lift" | "fade";
};

export function Reveal({ as: Tag = "div", kind = "lift", className, ...rest }: Props) {
  const ref = useReveal<HTMLElement>();

  return (
    <Tag
      ref={ref}
      className={cn(kind === "fade" ? "reveal-fade" : "reveal", className)}
      {...rest}
    />
  );
}