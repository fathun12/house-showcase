import { createClient } from "@/lib/supabase/server";
import type { AdminFile, FileTokenRow, HouseFile, TokenStatus } from "@/types/file";

function statusOf(token: FileTokenRow, now: number): TokenStatus {
  if (token.used_at) return "used";
  if (token.revoked_at) return "revoked";
  if (new Date(token.expires_at).getTime() <= now) return "expired";
  return "active";
}

/** Files of one house with their tokens (admin). The hash of a token is never selected. */
export async function listFilesWithTokens(houseId: string): Promise<AdminFile[]> {
  const supabase = await createClient();

  const { data, error } = await supabase
    .from("house_files")
    .select("*, file_tokens(id, label, expires_at, used_at, revoked_at, created_at)")
    .eq("house_id", houseId)
    .order("position", { ascending: true })
    .order("created_at", { ascending: true });

  if (error) throw new Error("Could not load files");

  const now = Date.now();

  return (data ?? []).map((row) => {
    const { file_tokens: tokens, ...file } = row as HouseFile & {
      file_tokens: FileTokenRow[];
    };

    return {
      ...file,
      tokens: [...tokens]
        .sort((a, b) => b.created_at.localeCompare(a.created_at))
        .map((token) => ({ ...token, status: statusOf(token, now) })),
    };
  });
}