import { uploadFile } from "@/lib/supabase/upload";
import { MODEL_BUCKET, MODEL_MAX_BYTES } from "./url";

export type GlbCheck = "ok" | "not_glb" | "too_big";

/** A .glb file always starts with the four bytes "glTF". */
export async function checkGlb(file: File): Promise<GlbCheck> {
  if (file.size > MODEL_MAX_BYTES) return "too_big";
  if (!file.name.toLowerCase().endsWith(".glb")) return "not_glb";

  const magic = await file.slice(0, 4).text();
  return magic === "glTF" ? "ok" : "not_glb";
}

/** Uploads one .glb to storage and returns its path inside the bucket. onProgress gets 0 to 1. */
export async function uploadModelToStorage(
  houseId: string,
  file: File,
  onProgress?: (fraction: number) => void,
): Promise<string> {
  const path = `${houseId}/${crypto.randomUUID()}.glb`;

  await uploadFile({
    bucket: MODEL_BUCKET,
    path,
    file,
    contentType: "model/gltf-binary",
    onProgress,
  });

  return path;
}