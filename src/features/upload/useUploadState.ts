"use client";

import { useCallback, useState } from "react";
import { IDLE_UPLOAD } from "./state";
import type { FileState, UploadState } from "./state";

/** The state of one upload batch, shared by the image and the 3D model uploaders. */
export function useUploadState() {
  const [state, setState] = useState<UploadState>(IDLE_UPLOAD);

  const begin = useCallback((names: string[]) => {
    setState({
      status: "working",
      failed: 0,
      files: names.map((name) => ({ name, phase: "waiting", fraction: 0, reason: null })),
    });
  }, []);

  const patch = useCallback((index: number, change: Partial<FileState>) => {
    setState((current) => ({
      ...current,
      files: current.files.map((file, position) =>
        position === index ? { ...file, ...change } : file,
      ),
    }));
  }, []);

  const saving = useCallback(() => {
    setState((current) => ({ ...current, status: "saving" }));
  }, []);

  const finish = useCallback((failed: number) => {
    setState((current) => ({ ...current, status: failed > 0 ? "error" : "done", failed }));
  }, []);

  return { state, begin, patch, saving, finish };
}