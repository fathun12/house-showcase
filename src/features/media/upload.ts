import { uploadFile } from "@/lib/supabase/upload";
import { MEDIA_BUCKET } from "./url";

/** Uploads one image to storage and returns its path inside the bucket. onProgress gets 0 to 1. */
export async function uploadToStorage(
  houseId: string,
  file: File,
  onProgress?: (fraction: number) => void,
): Promise<string> {
  const path = `${houseId}/${crypto.randomUUID()}.webp`;

  await uploadFile({ bucket: MEDIA_BUCKET, path, file, contentType: "image/webp", onProgress });

  return path;
}