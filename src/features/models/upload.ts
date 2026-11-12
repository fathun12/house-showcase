import { createClient } from "@/lib/supabase/client";
import { MODEL_BUCKET, MODEL_MAX_BYTES } from "./url";

export type GlbCheck = "ok" | "not_glb" | "too_big";

/** A .glb file always starts with the four bytes "glTF". */
export async function checkGlb(file: File): Promise<GlbCheck> {
  if (file.size > MODEL_MAX_BYTES) return "too_big";
  if (!file.name.toLowerCase().endsWith(".glb")) return "not_glb";

  const magic = await file.slice(0, 4).text();
  return magic === "glTF" ? "ok" : "not_glb";
}

/** Uploads one .glb to storage and returns its path inside the bucket. */
export async function uploadModelToStorage(houseId: string, file: File): Promise<string> {
  const supabase = createClient();
  const path = `${houseId}/${crypto.randomUUID()}.glb`;

  const { error } = await supabase.storage.from(MODEL_BUCKET).upload(path, file, {
    contentType: "model/gltf-binary",
    cacheControl: "31536000",
    upsert: false,
  });

  if (error) throw new Error("Upload failed");

  return path;
}