import { notFound } from "next/navigation";
import { cache } from "react";
import { createClient, createPublicClient } from "@/lib/supabase/server";
import type { House, HouseListItem, HouseSummary, PublicHouse } from "@/types/house";

const UUID = /^[0-9a-f]{8}-[0-9a-f]{4}-[0-9a-f]{4}-[0-9a-f]{4}-[0-9a-f]{12}$/i;

export function isUuid(value: string) {
  return UUID.test(value);
}

export async function listHouses(): Promise<HouseListItem[]> {
  const supabase = await createClient();

  const { data, error } = await supabase
    .from("houses")
    .select("id, slug, title_id, title_en, is_published, sort_order, updated_at")
    .order("sort_order", { ascending: true })
    .order("created_at", { ascending: false });

  if (error) throw new Error("Could not load houses");

  return data ?? [];
}

export async function getHouseById(id: string): Promise<House | null> {
  const supabase = await createClient();

  const { data, error } = await supabase
    .from("houses")
    .select("*")
    .eq("id", id)
    .maybeSingle();

  if (error) throw new Error("Could not load house");

  return data;
}

/** For pages under a house: shows "not found" when the id is invalid or the house does not exist. */
export async function getHouseOrNotFound(id: string): Promise<House> {
  if (!isUuid(id)) notFound();

  const house = await getHouseById(id);
  if (!house) notFound();

  return house;
}

/** Published houses for visitors (no login). Used for the comparison and the home page. */
export async function getPublishedHouses(): Promise<HouseSummary[]> {
  const supabase = createPublicClient();

  const { data, error } = await supabase
    .from("houses")
    .select("id, slug, title_id, title_en, floors, bedrooms, bathrooms, area_m2, sort_order")
    .order("sort_order", { ascending: true })
    .order("created_at", { ascending: true });

  if (error) throw new Error("Could not load houses");

  return data ?? [];
}

/** One published house with its rooms and images. Null when it does not exist or is a draft. */
export const getPublishedHouse = cache(async (slug: string): Promise<PublicHouse | null> => {
  const supabase = createPublicClient();

  const { data, error } = await supabase
    .from("houses")
    .select("*, rooms(*), media(*)")
    .eq("slug", slug)
    .maybeSingle();

  if (error) throw new Error("Could not load house");

  return data;
});