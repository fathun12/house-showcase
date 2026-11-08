"use server";

import { revalidatePath } from "next/cache";
import { redirectLocalized, requireAdmin } from "@/features/auth/session";
import { MEDIA_BUCKET } from "@/features/media/url";
import { createClient } from "@/lib/supabase/server";
import { readFormValues, toFieldErrors } from "@/lib/utils/validation";
import { HOUSE_FIELDS, houseSchema, type HouseFormValues } from "./schema";

export type HouseFormState = {
  status: "idle" | "error";
  // field name -> error code (the UI turns the code into a sentence)
  fieldErrors: Partial<Record<string, string>>;
  values: HouseFormValues | null;
};

export async function saveHouse(
  houseId: string | null,
  _previous: HouseFormState,
  formData: FormData,
): Promise<HouseFormState> {
  await requireAdmin();

  const values = readFormValues(formData, HOUSE_FIELDS);
  const parsed = houseSchema.safeParse(values);

  if (!parsed.success) {
    return { status: "error", fieldErrors: toFieldErrors(parsed.error), values };
  }

  const row = { ...parsed.data, sort_order: parsed.data.sort_order ?? 0 };
  const supabase = await createClient();

  const { error } = houseId
    ? await supabase.from("houses").update(row).eq("id", houseId)
    : await supabase.from("houses").insert(row);

  if (error) {
    const code = error.code === "23505" ? "duplicate" : "save_failed";
    const field = code === "duplicate" ? "slug" : "form";

    return { status: "error", fieldErrors: { [field]: code }, values };
  }

  revalidatePath("/", "layout");
  return redirectLocalized("/admin/houses");
}

export async function deleteHouse(houseId: string): Promise<void> {
  await requireAdmin();

  const supabase = await createClient();

  // Deleting a house only deletes database rows, so remove its image files first
  const { data: media } = await supabase
    .from("media")
    .select("storage_path")
    .eq("house_id", houseId);

  const paths = (media ?? []).map((item) => item.storage_path as string);

  if (paths.length > 0) {
    await supabase.storage.from(MEDIA_BUCKET).remove(paths);
  }

  const { error } = await supabase.from("houses").delete().eq("id", houseId);

  if (error) throw new Error("Could not delete house");

  revalidatePath("/", "layout");
  await redirectLocalized("/admin/houses");
}