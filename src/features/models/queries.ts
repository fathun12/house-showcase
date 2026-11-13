import { createClient } from "@/lib/supabase/server";
import type { PublicModel } from "@/types/house";

export async function listModels(houseId: string): Promise<PublicModel[]> {
  const supabase = await createClient();

  const { data, error } = await supabase
    .from("models")
    .select("*, model_parts(*)")
    .eq("house_id", houseId)
    .order("position", { ascending: true })
    .order("created_at", { ascending: true });

  if (error) throw new Error("Could not load models");

  return data ?? [];
}