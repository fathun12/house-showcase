import { cache } from "react";
import { createPublicClient } from "@/lib/supabase/server";
import type { PublicFurniture } from "@/types/house";

/** One published furniture project with its images and 3D models. Null when it does not exist, is a draft, or is a house. */
export const getPublishedFurniture = cache(async (slug: string): Promise<PublicFurniture | null> => {
  const supabase = createPublicClient();

  const { data, error } = await supabase
    .from("houses")
    .select("*, media(*), models(*, model_parts(*))")
    .eq("slug", slug)
    .eq("kind", "furniture")
    .maybeSingle();

  if (error) throw new Error("Could not load furniture");

  return data;
});