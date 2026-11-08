import { createClient } from "@/lib/supabase/server";
import type { Media } from "@/types/house";

export async function listMedia(houseId: string): Promise<Media[]> {
  const supabase = await createClient();

  const { data, error } = await supabase
    .from("media")
    .select("*")
    .eq("house_id", houseId)
    .order("position", { ascending: true })
    .order("created_at", { ascending: true });

  if (error) throw new Error("Could not load images");

  return data ?? [];
}