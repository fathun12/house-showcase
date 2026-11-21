import { uploadFile } from "@/lib/supabase/upload";
import { extensionOf, FILE_BUCKET, FILE_MAX_BYTES, isAllowedFile } from "./url";

export type FileCheck = "ok" | "bad_type" | "too_big";

export function checkFile(file: File): FileCheck {
  if (file.size > FILE_MAX_BYTES) return "too_big";
  if (!isAllowedFile(file.name)) return "bad_type";
  return "ok";
}

/** Uploads one file to the private bucket and returns its path. onProgress gets 0 to 1. */
export async function uploadFileToStorage(
  houseId: string,
  file: File,
  onProgress?: (fraction: number) => void,
): Promise<string> {
  const path = `${houseId}/${crypto.randomUUID()}.${extensionOf(file.name)}`;

  await uploadFile({
    bucket: FILE_BUCKET,
    path,
    file,
    contentType: file.type || "application/octet-stream",
    onProgress,
  });

  return path;
}