import { createClient } from "@/lib/supabase/server";
import type { Model } from "@/types/house";

export async function listModels(houseId: string): Promise<Model[]> {
  const supabase = await createClient();

  const { data, error } = await supabase
    .from("models")
    .select("*")
    .eq("house_id", houseId)
    .order("position", { ascending: true })
    .order("created_at", { ascending: true });

  if (error) throw new Error("Could not load models");

  return data ?? [];
}