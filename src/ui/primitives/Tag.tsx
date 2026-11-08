import type { ReactNode } from "react";
import { cn } from "@/lib/utils/cn";

export function Tag({
  tone = "outline",
  children,
}: {
  tone?: "accent" | "outline";
  children: ReactNode;
}) {
  return (
    <span
      className={cn(
        "label inline-block border px-2 py-1",
        tone === "accent"
          ? "border-accent bg-accent text-accent-ink"
          : "border-foreground",
      )}
    >
      {children}
    </span>
  );
}