"use client";

import type { CSSProperties, ElementType, HTMLAttributes } from "react";
import { useReveal } from "@/features/motion/useReveal";
import { cn } from "@/lib/utils/cn";

type Kind = "fade" | "line" | "wipe" | "mask";

type Props = HTMLAttributes<HTMLElement> & {
  as?: ElementType;
  /** fade: text fades in with a small lift. line: a rule draws itself.
   *  wipe: an image is uncovered from the left. mask: the child rises out from behind the edge. */
  kind?: Kind;
  /** Wait this long (ms) before starting, so a section line and title come first */
  delay?: number;
};

const classes: Record<Kind, string> = {
  fade: "reveal",
  line: "reveal-line",
  wipe: "reveal-wipe",
  mask: "reveal-mask",
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
      className={cn(classes[kind], className)}
      style={{ ...style, "--reveal-delay": `${delay}ms` } as CSSProperties}
      {...rest}
    />
  );
}