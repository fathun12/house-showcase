"use server";

import { revalidatePath } from "next/cache";
import { requireAdmin } from "@/features/auth/session";
import { createClient } from "@/lib/supabase/server";
import { readFormValues } from "@/lib/utils/validation";
import type { MediaKind } from "@/types/house";
import { MEDIA_DETAIL_FIELDS, mediaDetailsSchema, newMediaSchema } from "./schema";
import { MEDIA_BUCKET } from "./url";

export type NewMediaInput = {
  houseId: string;
  roomId: string | null;
  kind: MediaKind;
  storagePath: string;
  width: number | null;
  height: number | null;
};

/** Called by the browser after a file was uploaded to storage: records it in the database. */
export async function addMedia(input: NewMediaInput): Promise<{ ok: boolean }> {
  await requireAdmin();

  const parsed = newMediaSchema.safeParse(input);

  if (!parsed.success || !parsed.data.storagePath.startsWith(`${parsed.data.houseId}/`)) {
    return { ok: false };
  }

  const { houseId, roomId, kind, storagePath, width, height } = parsed.data;
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

  const { error } = await supabase.from("media").insert({
    house_id: houseId,
    room_id: kind === "room" ? roomId : null,
    kind,
    storage_path: storagePath,
    width,
    height,
    position: count ?? 0,
  });

  if (error) {
    // Do not leave an orphan file in storage
    await supabase.storage.from(MEDIA_BUCKET).remove([storagePath]);
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

  const { data } = await supabase
    .from("media")
    .select("storage_path")
    .eq("id", mediaId)
    .maybeSingle();

  if (data) {
    await supabase.storage.from(MEDIA_BUCKET).remove([data.storage_path]);
  }

  const { error } = await supabase.from("media").delete().eq("id", mediaId);

  if (error) throw new Error("Could not delete image");

  revalidatePath("/", "layout");
}