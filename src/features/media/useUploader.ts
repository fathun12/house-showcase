"use client";

import { runPool, throttledReporter } from "@/features/upload/state";
import { useUploadState } from "@/features/upload/useUploadState";
import type { MediaKind } from "@/types/house";
import { addMediaBatch } from "./actions";
import { compressImage } from "./compress";
import { uploadToStorage } from "./upload";

const CONCURRENCY = 3;
// Of one file's progress bar: the first part is shrinking, the rest is sending
const COMPRESS_SHARE = 0.35;

type Uploaded = { storagePath: string; width: number; height: number };

export function useUploader(houseId: string) {
  const { state, begin, patch, saving, finish } = useUploadState();

  async function upload(files: File[], kind: MediaKind, roomId: string | null) {
    if (files.length === 0) return;

    begin(files.map((file) => file.name));
    const uploaded: (Uploaded | null)[] = files.map(() => null);

    await runPool(files, CONCURRENCY, async (source, index) => {
      try {
        patch(index, { phase: "compressing", fraction: 0 });
        const reportShrink = throttledReporter((value) =>
          patch(index, { fraction: value * COMPRESS_SHARE }),
        );
        const { file, width, height } = await compressImage(source, (percent) =>
          reportShrink(percent / 100),
        );

        patch(index, { phase: "uploading", fraction: COMPRESS_SHARE });
        const reportSend = throttledReporter((value) =>
          patch(index, { fraction: COMPRESS_SHARE + value * (1 - COMPRESS_SHARE) }),
        );
        const storagePath = await uploadToStorage(houseId, file, reportSend);

        uploaded[index] = { storagePath, width, height };
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
        ok = (await addMediaBatch({ houseId, roomId, kind, items: ready })).ok;
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