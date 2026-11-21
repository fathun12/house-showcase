"use server";

import { createSecretClient } from "@/lib/supabase/admin";
import { redeemSchema } from "./schema";
import { hashToken } from "./token";
import { FILE_BUCKET } from "./url";

export type RedeemResult = { ok: true; url: string } | { ok: false };

/** The ONE public server action: visitors call it, so it does not use requireAdmin().
 *  The token is the guard. A single UPDATE checks the token and burns it at the same time,
 *  so two people can never use the same token. Every failure gives the same answer. */
export async function redeemFileToken(input: {
  fileId: string;
  token: string;
}): Promise<RedeemResult> {
  const parsed = redeemSchema.safeParse(input);
  if (!parsed.success) return { ok: false };

  const { fileId, token } = parsed.data;

  try {
    const supabase = createSecretClient();

    const { data: file } = await supabase
      .from("house_files")
      .select("storage_path, file_name")
      .eq("id", fileId)
      .maybeSingle();

    if (!file) return { ok: false };

    const now = new Date().toISOString();

    const { data: burned } = await supabase
      .from("file_tokens")
      .update({ used_at: now })
      .eq("file_id", fileId)
      .eq("token_hash", hashToken(token))
      .is("used_at", null)
      .is("revoked_at", null)
      .gt("expires_at", now)
      .select("id")
      .maybeSingle();

    if (!burned) return { ok: false };

    // The link lives 60 seconds and makes the browser save the file under its real name
    const { data: signed } = await supabase.storage
      .from(FILE_BUCKET)
      .createSignedUrl(file.storage_path as string, 60, {
        download: file.file_name as string,
      });

    if (!signed) {
      // The visitor got nothing, so the token is given back
      await supabase.from("file_tokens").update({ used_at: null }).eq("id", burned.id);
      return { ok: false };
    }

    return { ok: true, url: signed.signedUrl };
  } catch {
    return { ok: false };
  }
}