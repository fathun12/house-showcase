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
};

export function Button({ variant = "primary", className, ...props }: ButtonProps) {
  return <button className={buttonStyles(variant, className)} {...props} />;
}