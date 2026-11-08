"use server";

import { revalidatePath } from "next/cache";
import { redirectLocalized, requireAdmin } from "@/features/auth/session";
import { createClient } from "@/lib/supabase/server";
import { HOUSE_FIELDS, houseSchema, type HouseFormValues } from "./schema";

export type HouseFormState = {
  status: "idle" | "error";
  // field name -> error code (the UI turns the code into a sentence)
  fieldErrors: Partial<Record<string, string>>;
  values: HouseFormValues | null;
};

function readValues(formData: FormData): HouseFormValues {
  return Object.fromEntries(
    HOUSE_FIELDS.map((field) => [field, String(formData.get(field) ?? "")]),
  ) as HouseFormValues;
}

export async function saveHouse(
  houseId: string | null,
  _previous: HouseFormState,
  formData: FormData,
): Promise<HouseFormState> {
  await requireAdmin();

  const values = readValues(formData);
  const parsed = houseSchema.safeParse(values);

  if (!parsed.success) {
    const fieldErrors: Record<string, string> = {};

    for (const issue of parsed.error.issues) {
      const field = String(issue.path[0] ?? "form");
      fieldErrors[field] ??= issue.code;
    }

    return { status: "error", fieldErrors, values };
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
  const { error } = await supabase.from("houses").delete().eq("id", houseId);

  if (error) throw new Error("Could not delete house");

  revalidatePath("/", "layout");
  await redirectLocalized("/admin/houses");
}