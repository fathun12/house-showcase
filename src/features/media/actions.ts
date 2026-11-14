"use server";

import { revalidatePath } from "next/cache";
import { after } from "next/server";
import { requireAdmin } from "@/features/auth/session";
import { createClient } from "@/lib/supabase/server";
import { readFormValues } from "@/lib/utils/validation";
import { newMediaBatchSchema } from "./batchSchema";
import type { NewMediaBatchInput } from "./batchSchema";
import { MEDIA_DETAIL_FIELDS, mediaDetailsSchema } from "./schema";
import { MEDIA_BUCKET } from "./url";

/** Called by the browser after its files were uploaded to storage: records all of them in one go. */
export async function addMediaBatch(input: NewMediaBatchInput): Promise<{ ok: boolean }> {
  await requireAdmin();

  const parsed = newMediaBatchSchema.safeParse(input);
  if (!parsed.success) return { ok: false };

  const { houseId, roomId, kind, items } = parsed.data;
  const paths = items.map((item) => item.storagePath);

  if (paths.some((path) => !path.startsWith(`${houseId}/`))) return { ok: false };

  const supabase = await createClient();

  // One hero image per house: the new one replaces the old one
  if (kind === "hero") {
    const { data: old } = await supabase
      .from("media")
      .select("id, storage_path")
      .eq("house_id", houseId)
      .eq("kind", "hero");

    if (old && old.length > 0) {
      await supabase.storage.from(MEDIA_BUCKET).remove(old.map((item) => item.storage_path));
      await supabase.from("media").delete().in("id", old.map((item) => item.id));
    }
  }

  const { count } = await supabase
    .from("media")
    .select("id", { count: "exact", head: true })
    .eq("house_id", houseId)
    .eq("kind", kind);

  const start = count ?? 0;

  const { error } = await supabase.from("media").insert(
    items.map((item, index) => ({
      house_id: houseId,
      room_id: kind === "room" ? roomId : null,
      kind,
      storage_path: item.storagePath,
      width: item.width,
      height: item.height,
      position: start + index,
    })),
  );

  if (error) {
    // Do not leave orphan files in storage
    await supabase.storage.from(MEDIA_BUCKET).remove(paths);
    return { ok: false };
  }

  revalidatePath("/", "layout");
  return { ok: true };
}

export async function updateMedia(mediaId: string, formData: FormData): Promise<void> {
  await requireAdmin();

  const parsed = mediaDetailsSchema.safeParse(readFormValues(formData, MEDIA_DETAIL_FIELDS));

  if (!parsed.success) throw new Error("Invalid image details");

  const { position, ...details } = parsed.data;
  const supabase = await createClient();

  const { error } = await supabase
    .from("media")
    .update({ ...details, position: position ?? 0 })
    .eq("id", mediaId);

  if (error) throw new Error("Could not save image details");

  revalidatePath("/", "layout");
}

export async function deleteMedia(mediaId: string): Promise<void> {
  await requireAdmin();

  const supabase = await createClient();

  // One call deletes the row and tells us which file belonged to it
  const { data, error } = await supabase
    .from("media")
    .delete()
    .eq("id", mediaId)
    .select("storage_path")
    .maybeSingle();

  if (error) throw new Error("Could not delete image");

  // The file itself is removed after the answer was sent: the admin does not wait for it
  if (data) {
    const path = data.storage_path as string;

    after(async () => {
      await supabase.storage.from(MEDIA_BUCKET).remove([path]);
    });
  }

  revalidatePath("/", "layout");
}