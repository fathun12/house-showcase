"use server";

import { revalidatePath } from "next/cache";
import { after } from "next/server";
import { requireAdmin } from "@/features/auth/session";
import { createClient } from "@/lib/supabase/server";
import { newModelsSchema } from "./batchSchema";
import type { NewModelsInput } from "./batchSchema";
import { savePartsSchema } from "./schema";
import type { SavePartsInput } from "./schema";
import { MODEL_BUCKET } from "./url";

/** Called by the browser after its .glb files were uploaded to storage: records all of them in one go. */
export async function addModels(input: NewModelsInput): Promise<{ ok: boolean }> {
  await requireAdmin();

  const parsed = newModelsSchema.safeParse(input);
  if (!parsed.success) return { ok: false };

  const { houseId, items } = parsed.data;
  const paths = items.map((item) => item.storagePath);

  if (paths.some((path) => !path.startsWith(`${houseId}/`) || !path.endsWith(".glb"))) {
    return { ok: false };
  }

  const supabase = await createClient();

  const { count } = await supabase
    .from("models")
    .select("id", { count: "exact", head: true })
    .eq("house_id", houseId);

  const start = count ?? 0;

  const { error } = await supabase.from("models").insert(
    items.map((item, index) => ({
      house_id: houseId,
      storage_path: item.storagePath,
      size_bytes: item.sizeBytes,
      position: start + index,
    })),
  );

  if (error) {
    // Do not leave orphan files in storage
    await supabase.storage.from(MODEL_BUCKET).remove(paths);
    return { ok: false };
  }

  revalidatePath("/", "layout");
  return { ok: true };
}

export async function deleteModel(modelId: string): Promise<void> {
  await requireAdmin();

  const supabase = await createClient();

  // One call deletes the row (its parts go with it) and tells us which file belonged to it
  const { data, error } = await supabase
    .from("models")
    .delete()
    .eq("id", modelId)
    .select("storage_path")
    .maybeSingle();

  if (error) throw new Error("Could not delete model");

  // The file itself is removed after the answer was sent: the admin does not wait for it
  if (data) {
    const path = data.storage_path as string;

    after(async () => {
      await supabase.storage.from(MODEL_BUCKET).remove([path]);
    });
  }

  revalidatePath("/", "layout");
}

/** Saves the names and movements of the parts of one model (replaces what was saved before). */
export async function saveModelParts(input: SavePartsInput): Promise<{ ok: boolean }> {
  await requireAdmin();

  const parsed = savePartsSchema.safeParse(input);
  if (!parsed.success) return { ok: false };

  const { modelId, parts } = parsed.data;
  const supabase = await createClient();

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

  // Insert the new rows first and delete the old ones after, so a failure never loses everything.
  // (A model that does not exist fails here: model_id is a foreign key.)
  let keepIds: string[] = [];

  if (rows.length > 0) {
    const { data, error } = await supabase.from("model_parts").insert(rows).select("id");
    if (error || !data) return { ok: false };

    keepIds = data.map((row) => row.id as string);
  }

  const cleanup = supabase.from("model_parts").delete().eq("model_id", modelId);
  const { error } =
    keepIds.length > 0
      ? await cleanup.not("id", "in", `(${keepIds.join(",")})`)
      : await cleanup;

  if (error) return { ok: false };

  revalidatePath("/", "layout");
  return { ok: true };
}