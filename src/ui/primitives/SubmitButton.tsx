"use client";

import { useEffect, useState } from "react";
import type { ReactNode } from "react";
import { useFormStatus } from "react-dom";
import { Button } from "@/ui/primitives/Button";

type Props = {
  children: ReactNode;
  /** Shown while the form is being sent */
  pendingLabel: string;
  /** Shown with a check mark for a moment after it was sent */
  doneLabel?: string;
  variant?: "primary" | "outline";
  className?: string;
};

/** Submit button for a form with a server action: busy while sending, a check mark when done. */
export function SubmitButton({ children, pendingLabel, doneLabel, variant, className }: Props) {
  const { pending } = useFormStatus();
  const [wasPending, setWasPending] = useState(false);
  const [flash, setFlash] = useState(false);

  // Sending just ended: show the check mark (state adjusted while rendering, not in an effect)
  if (pending !== wasPending) {
    setWasPending(pending);
    if (wasPending && doneLabel) setFlash(true);
  }

  useEffect(() => {
    if (!flash) return;

    const id = window.setTimeout(() => setFlash(false), 2500);
    return () => window.clearTimeout(id);
  }, [flash]);

  return (
    <Button type="submit" variant={variant} busy={pending} className={className}>
      {pending ? pendingLabel : flash && doneLabel ? `\u2713 ${doneLabel}` : children}
    </Button>
  );
}