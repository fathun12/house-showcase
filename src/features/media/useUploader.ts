"use client";

import { useState } from "react";
import { useRouter } from "@/lib/i18n/navigation";
import type { MediaKind } from "@/types/house";
import { addMedia } from "./actions";
import { compressImage } from "./compress";
import { uploadToStorage } from "./upload";

type UploadState = {
  status: "idle" | "working" | "done" | "error";
  done: number;
  total: number;
  failed: number;
};

const IDLE: UploadState = { status: "idle", done: 0, total: 0, failed: 0 };

export function useUploader(houseId: string) {
  const router = useRouter();
  const [state, setState] = useState<UploadState>(IDLE);

  async function upload(files: File[], kind: MediaKind, roomId: string | null) {
    if (files.length === 0) return;

    const total = files.length;
    let failed = 0;

    setState({ status: "working", done: 0, total, failed });

    for (const [index, source] of files.entries()) {
      try {
        const { file, width, height } = await compressImage(source);
        const storagePath = await uploadToStorage(houseId, file);
        const result = await addMedia({ houseId, roomId, kind, storagePath, width, height });

        if (!result.ok) failed += 1;
      } catch {
        failed += 1;
      }

      setState({ status: "working", done: index + 1, total, failed });
    }

    setState({ status: failed > 0 ? "error" : "done", done: total, total, failed });
    router.refresh();
  }

  return { state, upload };
}