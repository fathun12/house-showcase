"use client";

import type { ElementType, HTMLAttributes } from "react";
import { useReveal } from "@/features/motion/useReveal";
import { cn } from "@/lib/utils/cn";

type Props = HTMLAttributes<HTMLElement> & {
  as?: ElementType;
  /** "fade" fades the content in; "line" draws a rule from left to right */
  kind?: "fade" | "line";
  /** Wait this long (ms) before starting, so a section line and title come first */
  delay?: number;
};

export function Reveal({
  as: Tag = "div",
  kind = "fade",
  delay = 0,
  className,
  style,
  ...rest
}: Props) {
  const ref = useReveal<HTMLElement>();

  return (
    <Tag
      ref={ref}
      className={cn(kind === "line" ? "reveal-line" : "reveal", className)}
      style={delay > 0 ? { ...style, transitionDelay: `${delay}ms` } : style}
      {...rest}
    />
  );
}