export type FilePhase = "waiting" | "compressing" | "uploading" | "done" | "failed";

export type FileState = {
  name: string;
  phase: FilePhase;
  /** 0 to 1 over the whole life of this file (compress, upload) */
  fraction: number;
  /** Why it failed: failed, not_glb or too_big */
  reason: string | null;
};

export type UploadState = {
  status: "idle" | "working" | "saving" | "done" | "error";
  files: FileState[];
  failed: number;
};

export const IDLE_UPLOAD: UploadState = { status: "idle", files: [], failed: 0 };

/** Average progress of all files, 0 to 1. */
export function overallProgress(files: FileState[]): number {
  if (files.length === 0) return 0;
  return files.reduce((sum, file) => sum + file.fraction, 0) / files.length;
}

/** Runs the worker over all items, at most `limit` at the same time. */
export async function runPool<T>(
  items: T[],
  limit: number,
  worker: (item: T, index: number) => Promise<void>,
): Promise<void> {
  let next = 0;

  const runners = Array.from({ length: Math.min(limit, items.length) }, async () => {
    while (next < items.length) {
      const index = next;
      next += 1;
      await worker(items[index], index);
    }
  });

  await Promise.all(runners);
}

/** Progress events can come dozens of times a second: pass on only steps of 2 percent. */
export function throttledReporter(report: (value: number) => void) {
  let last = -1;

  return (value: number) => {
    if (value >= 1 || value - last >= 0.02) {
      last = value;
      report(value);
    }
  };
}