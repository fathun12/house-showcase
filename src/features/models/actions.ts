"use server";

import { revalidatePath } from "next/cache";
import { requireAdmin } from "@/features/auth/session";
import { createClient } from "@/lib/supabase/server";
import { newModelSchema } from "./schema";
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