import { cn } from "@/lib/utils/cn";

type Props = {
  /** 0 to 1, or null when the length of the wait is unknown (a block slides along the bar) */
  value: number | null;
  label: string;
  /** Set the width here (w-full, w-48, ...) */
  className?: string;
};

/** Sharp, flat progress bar. It takes the text color of its parent for the frame. */
export function ProgressBar({ value, label, className }: Props) {
  const percent = value === null ? null : Math.round(Math.min(1, Math.max(0, value)) * 100);

  return (
    <div
      role="progressbar"
      aria-label={label}
      aria-valuemin={0}
      aria-valuemax={100}
      aria-valuenow={percent ?? undefined}
      className={cn("h-3 overflow-hidden border-2 border-current", className)}
    >
      {percent === null ? (
        <div className="busy-bar h-full w-2/5 bg-accent" />
      ) : (
        <div
          className="h-full bg-accent transition-[width] duration-150 ease-out"
          style={{ width: `${percent}%` }}
        />
      )}
    </div>
  );
}