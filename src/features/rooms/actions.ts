"use server";

import { revalidatePath } from "next/cache";
import { redirectLocalized, requireAdmin } from "@/features/auth/session";
import { createClient } from "@/lib/supabase/server";
import { readFormValues, toFieldErrors } from "@/lib/utils/validation";
import { ROOM_FIELDS, roomSchema, type RoomFormValues } from "./schema";

export type RoomFormState = {
  status: "idle" | "error";
  // field name -> error code (the UI turns the code into a sentence)
  fieldErrors: Partial<Record<string, string>>;
  values: RoomFormValues | null;
};

export async function saveRoom(
  houseId: string,
  roomId: string | null,
  _previous: RoomFormState,
  formData: FormData,
): Promise<RoomFormState> {
  await requireAdmin();

  const values = readFormValues(formData, ROOM_FIELDS);
  const parsed = roomSchema.safeParse(values);

  if (!parsed.success) {
    return { status: "error", fieldErrors: toFieldErrors(parsed.error), values };
  }

  const row = { ...parsed.data, position: parsed.data.position ?? 0, house_id: houseId };
  const supabase = await createClient();

  const { error } = roomId
    ? await supabase.from("rooms").update(row).eq("id", roomId).eq("house_id", houseId)
    : await supabase.from("rooms").insert(row);

  if (error) {
    return { status: "error", fieldErrors: { form: "save_failed" }, values };
  }

  revalidatePath("/", "layout");
  return redirectLocalized(`/admin/houses/${houseId}/rooms`);
}

export async function deleteRoom(houseId: string, roomId: string): Promise<void> {
  await requireAdmin();

  const supabase = await createClient();
  const { error } = await supabase
    .from("rooms")
    .delete()
    .eq("id", roomId)
    .eq("house_id", houseId);

  if (error) throw new Error("Could not delete room");

  revalidatePath("/", "layout");
  await redirectLocalized(`/admin/houses/${houseId}/rooms`);
}