"use client";

import { usePresent } from "@/features/viewer/context";

/** Starts the full-screen room-by-room presentation. */
export function PresentButton({ label }: { label: string }) {
  const present = usePresent();

  return (
    <button
      type="button"
      onClick={present}
      className="label inline-flex min-h-11 items-center bg-foreground px-4 text-background transition-colors hover:bg-accent hover:text-accent-ink"
    >
      {label}
    </button>
  );
}