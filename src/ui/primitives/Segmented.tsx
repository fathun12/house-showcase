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
};

export function Segmented<T extends string>({
  label,
  options,
  value,
  onChange,
  disabled,
}: SegmentedProps<T>) {
  return (
    <div
      role="radiogroup"
      aria-label={label}
      className="inline-flex w-fit border border-foreground"
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
              "label cursor-pointer border-l border-foreground px-3 py-1.5 transition-colors first:border-l-0 disabled:cursor-wait",
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