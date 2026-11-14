import type { ButtonHTMLAttributes } from "react";
import { cn } from "@/lib/utils/cn";

type Variant = "primary" | "outline";

const VARIANTS: Record<Variant, string> = {
  primary:
    "border-accent bg-accent text-accent-ink hover:border-foreground hover:bg-foreground hover:text-background",
  outline:
    "border-foreground bg-transparent text-foreground hover:bg-foreground hover:text-background",
};

/** Also used for links that should look like buttons. */
export function buttonStyles(variant: Variant = "primary", className?: string) {
  return cn(
    "label inline-flex cursor-pointer items-center justify-center border-2 px-5 py-3 transition-colors disabled:cursor-wait disabled:opacity-50",
    VARIANTS[variant],
    className,
  );
}

type ButtonProps = ButtonHTMLAttributes<HTMLButtonElement> & {
  variant?: Variant;
  /** Something is happening: the button is disabled and a block slides along its bottom edge. */
  busy?: boolean;
};

export function Button({
  variant = "primary",
  busy = false,
  className,
  disabled,
  children,
  ...props
}: ButtonProps) {
  return (
    <button
      className={buttonStyles(variant, cn(busy && "relative overflow-hidden", className))}
      disabled={disabled || busy}
      aria-busy={busy || undefined}
      {...props}
    >
      {children}
      {busy ? (
        <span aria-hidden className="absolute inset-x-0 bottom-0 h-1 overflow-hidden">
          <span className="busy-bar block h-full w-2/5 bg-current" />
        </span>
      ) : null}
    </button>
  );
}