import { cn } from "@/lib/utils/cn";

type Option<T extends string> = {
  value: T;
  label: string;
};

type SegmentedProps<T extends string> = {
  label: string;
  options: readonly Option<T>[];
  value: T;
  onChange: (value: T) => void;
  disabled?: boolean;
  /** Stretch to the full width of the parent (used in the admin sidebar). */
  fill?: boolean;
};

export function Segmented<T extends string>({
  label,
  options,
  value,
  onChange,
  disabled,
  fill = false,
}: SegmentedProps<T>) {
  return (
    <div
      role="radiogroup"
      aria-label={label}
      className={cn(
        "border border-foreground",
        fill ? "flex w-full" : "inline-flex w-fit",
      )}
    >
      {options.map((option) => {
        const active = option.value === value;

        return (
          <button
            key={option.value}
            type="button"
            role="radio"
            aria-checked={active}
            disabled={disabled}
            onClick={() => onChange(option.value)}
            className={cn(
              "label flex min-h-11 cursor-pointer items-center border-l border-foreground transition-colors first:border-l-0 disabled:cursor-wait",
              fill ? "flex-1 justify-center px-2" : "px-4",
              active
                ? "bg-accent text-accent-ink"
                : "bg-background text-foreground hover:bg-surface",
            )}
          >
            {option.label}
          </button>
        );
      })}
    </div>
  );
}