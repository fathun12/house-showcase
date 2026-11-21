"use client";

import { runPool, throttledReporter } from "@/features/upload/state";
import { useUploadState } from "@/features/upload/useUploadState";
import { addFiles } from "./actions";
import { checkFile, uploadFileToStorage } from "./upload";

const CONCURRENCY = 2;

type Uploaded = { storagePath: string; fileName: string; sizeBytes: number };

export function useFileUploader(houseId: string) {
  const { state, begin, patch, saving, finish } = useUploadState();

  async function upload(files: File[]) {
    if (files.length === 0) return;

    begin(files.map((file) => file.name));
    const uploaded: (Uploaded | null)[] = files.map(() => null);

    await runPool(files, CONCURRENCY, async (file, index) => {
      try {
        const check = checkFile(file);

        if (check !== "ok") {
          patch(index, {
            phase: "failed",
            fraction: 1,
            reason: check === "too_big" ? "too_big" : "failed",
          });
          return;
        }

        patch(index, { phase: "uploading", fraction: 0 });
        const report = throttledReporter((value) => patch(index, { fraction: value }));
        const storagePath = await uploadFileToStorage(houseId, file, report);

        uploaded[index] = { storagePath, fileName: file.name, sizeBytes: file.size };
        patch(index, { phase: "done", fraction: 1 });
      } catch {
        patch(index, { phase: "failed", fraction: 1, reason: "failed" });
      }
    });

    const ready = uploaded.filter((item): item is Uploaded => item !== null);
    let failed = files.length - ready.length;

    if (ready.length > 0) {
      saving();

      let ok = false;
      try {
        ok = (await addFiles({ houseId, items: ready })).ok;
      } catch {
        ok = false;
      }

      if (!ok) {
        failed = files.length;
        uploaded.forEach((item, index) => {
          if (item) patch(index, { phase: "failed", reason: "failed" });
        });
      }
    }

    finish(failed);
  }

  return { state, upload };
}