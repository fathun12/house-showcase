import { createClient } from "@/lib/supabase/client";
import { MEDIA_BUCKET } from "./url";

/** Uploads one image to storage and returns its path inside the bucket. */
export async function uploadToStorage(houseId: string, file: File): Promise<string> {
  const supabase = createClient();
  const path = `${houseId}/${crypto.randomUUID()}.webp`;

  const { error } = await supabase.storage.from(MEDIA_BUCKET).upload(path, file, {
    contentType: "image/webp",
    cacheControl: "31536000",
    upsert: false,
  });

  if (error) throw new Error("Upload failed");

  return path;
}