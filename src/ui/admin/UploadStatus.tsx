import { useTranslations } from "next-intl";
import { overallProgress } from "@/features/upload/state";
import type { FileState, UploadState } from "@/features/upload/state";
import { cn } from "@/lib/utils/cn";
import { ProgressBar } from "@/ui/primitives/ProgressBar";

function fillColor(file: FileState) {
  if (file.phase === "failed") return "bg-muted";
  if (file.phase === "done") return "bg-foreground";
  return "bg-accent";
}

/** Overall bar plus one thin bar per file, for the image and 3D model uploaders. */
export function UploadStatus({ state }: { state: UploadState }) {
  const t = useTranslations("admin.upload");

  if (state.status === "idle") return null;

  const settled = state.files.filter(
    (file) => file.phase === "done" || file.phase === "failed",
  ).length;
  const finished = state.status === "done" || state.status === "error";
  const value = state.status === "saving" ? null : finished ? 1 : overallProgress(state.files);

  let summary = t("summary", { done: settled, total: state.files.length });
  if (state.status === "saving") summary = t("savingSummary");
  if (state.status === "done") summary = `\u2713 ${t("allDone")}`;
  if (state.status === "error") summary = t("someFailed", { failed: state.failed });

  return (
    <div className="flex flex-col gap-4">
      <div className="flex flex-col gap-2">
        <p aria-live="polite" className={cn("label", state.status === "error" && "text-accent")}>
          {summary}
        </p>
        <ProgressBar value={value} label={summary} className="w-full" />
      </div>

      <ul className="flex flex-col gap-3">
        {state.files.map((file, index) => (
          <li key={`${index}-${file.name}`}>
            <div className="flex items-baseline justify-between gap-4">
              <span className="min-w-0 truncate text-sm">{file.name}</span>
              <span className={cn("label shrink-0", file.phase === "failed" && "text-accent")}>
                {file.phase === "failed" && file.reason
                  ? t(`reasons.${file.reason}`)
                  : t(`phases.${file.phase}`)}
                {file.phase === "compressing" || file.phase === "uploading"
                  ? ` ${Math.round(file.fraction * 100)}%`
                  : ""}
              </span>
            </div>
            <div className="mt-1 h-1 w-full bg-surface">
              <div
                className={cn("h-full transition-[width] duration-150 ease-out", fillColor(file))}
                style={{ width: `${Math.round(file.fraction * 100)}%` }}
              />
            </div>
          </li>
        ))}
      </ul>
    </div>
  );
}