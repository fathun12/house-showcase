"use server";

import { revalidatePath } from "next/cache";
import { requireAdmin } from "@/features/auth/session";
import { createClient } from "@/lib/supabase/server";
import { newModelSchema, savePartsSchema } from "./schema";
import type { SavePartsInput } from "./schema";
import { MODEL_BUCKET } from "./url";

export type NewModelInput = {
  houseId: string;
  storagePath: string;
  sizeBytes: number;
};

/** Called by the browser after a .glb was uploaded to storage: records it in the database. */
export async function addModel(input: NewModelInput): Promise<{ ok: boolean }> {
  await requireAdmin();

  const parsed = newModelSchema.safeParse(input);

  if (
    !parsed.success ||
    !parsed.data.storagePath.startsWith(`${parsed.data.houseId}/`) ||
    !parsed.data.storagePath.endsWith(".glb")
  ) {
    return { ok: false };
  }

  const { houseId, storagePath, sizeBytes } = parsed.data;
  const supabase = await createClient();

  const { count } = await supabase
    .from("models")
    .select("id", { count: "exact", head: true })
    .eq("house_id", houseId);

  const { error } = await supabase.from("models").insert({
    house_id: houseId,
    storage_path: storagePath,
    size_bytes: sizeBytes,
    position: count ?? 0,
  });

  if (error) {
    // Do not leave an orphan file in storage
    await supabase.storage.from(MODEL_BUCKET).remove([storagePath]);
    return { ok: false };
  }

  revalidatePath("/", "layout");
  return { ok: true };
}

export async function deleteModel(modelId: string): Promise<void> {
  await requireAdmin();

  const supabase = await createClient();

  const { data } = await supabase
    .from("models")
    .select("storage_path")
    .eq("id", modelId)
    .maybeSingle();

  if (data) {
    await supabase.storage.from(MODEL_BUCKET).remove([data.storage_path]);
  }

  const { error } = await supabase.from("models").delete().eq("id", modelId);

  if (error) throw new Error("Could not delete model");

  revalidatePath("/", "layout");
}

/** Saves the names and movements of the parts of one model (replaces what was saved before). */
export async function saveModelParts(input: SavePartsInput): Promise<{ ok: boolean }> {
  await requireAdmin();

  const parsed = savePartsSchema.safeParse(input);
  if (!parsed.success) return { ok: false };

  const { modelId, parts } = parsed.data;
  const supabase = await createClient();

  const { data: model } = await supabase
    .from("models")
    .select("id")
    .eq("id", modelId)
    .maybeSingle();

  if (!model) return { ok: false };

  const { data: old } = await supabase
    .from("model_parts")
    .select("id")
    .eq("model_id", modelId);

  // Only parts that have a name or a movement are worth storing
  const rows = parts
    .filter((part) => part.labelId || part.labelEn || part.motion !== "none")
    .map((part, index) => ({
      model_id: modelId,
      node_name: part.nodeName,
      label_id: part.labelId,
      label_en: part.labelEn,
      motion: part.motion,
      settings: part.settings,
      position: index,
    }));

  // Insert the new rows first and delete the old ones after, so a failure never loses everything
  if (rows.length > 0) {
    const { error } = await supabase.from("model_parts").insert(rows);
    if (error) return { ok: false };
  }

  const oldIds = (old ?? []).map((row) => row.id as string);

  if (oldIds.length > 0) {
    const { error } = await supabase.from("model_parts").delete().in("id", oldIds);
    if (error) return { ok: false };
  }

  revalidatePath("/", "layout");
  return { ok: true };
}