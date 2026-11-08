import { createClient } from "@/lib/supabase/server";
import type { Room } from "@/types/house";

export async function listRooms(houseId: string): Promise<Room[]> {
  const supabase = await createClient();

  const { data, error } = await supabase
    .from("rooms")
    .select("*")
    .eq("house_id", houseId)
    .order("position", { ascending: true })
    .order("created_at", { ascending: true });

  if (error) throw new Error("Could not load rooms");

  return data ?? [];
}

export async function getRoom(houseId: string, roomId: string): Promise<Room | null> {
  const supabase = await createClient();

  const { data, error } = await supabase
    .from("rooms")
    .select("*")
    .eq("id", roomId)
    .eq("house_id", houseId)
    .maybeSingle();

  if (error) throw new Error("Could not load room");

  return data;
}