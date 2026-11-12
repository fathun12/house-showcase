"use client";

import { useState } from "react";
import { useRouter } from "@/lib/i18n/navigation";
import { addModel } from "./actions";
import { checkGlb, uploadModelToStorage } from "./upload";

export type ModelUploadError = "not_glb" | "too_big" | "failed";

type UploadState = {
  status: "idle" | "working" | "done" | "error";
  error: ModelUploadError | null;
};

const IDLE: UploadState = { status: "idle", error: null };

export function useModelUploader(houseId: string) {
  const router = useRouter();
  const [state, setState] = useState<UploadState>(IDLE);

  async function upload(files: File[]) {
    if (files.length === 0) return;

    setState({ status: "working", error: null });
    let error: ModelUploadError | null = null;

    for (const file of files) {
      const check = await checkGlb(file);

      if (check !== "ok") {
        error = check;
        continue;
      }

      try {
        const storagePath = await uploadModelToStorage(houseId, file);
        const result = await addModel({ houseId, storagePath, sizeBytes: file.size });

        if (!result.ok) error = "failed";
      } catch {
        error = "failed";
      }
    }

    setState({ status: error ? "error" : "done", error });
    router.refresh();
  }

  return { state, upload };
}