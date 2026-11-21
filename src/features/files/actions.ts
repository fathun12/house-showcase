"use server";

import { revalidatePath } from "next/cache";
import { after } from "next/server";
import { requireAdmin } from "@/features/auth/session";
import { createClient } from "@/lib/supabase/server";
import { createTokenSchema, newFilesSchema } from "./schema";
import type { CreateTokenInput, NewFilesInput } from "./schema";
import { generateToken, hashToken } from "./token";
import { FILE_BUCKET, isAllowedFile } from "./url";

/** Called by the browser after its files were uploaded to the private bucket: records them. */
export async function addFiles(input: NewFilesInput): Promise<{ ok: boolean }> {
  await requireAdmin();

  const parsed = newFilesSchema.safeParse(input);
  if (!parsed.success) return { ok: false };

  const { houseId, items } = parsed.data;
  const paths = items.map((item) => item.storagePath);

  if (
    paths.some((path) => !path.startsWith(`${houseId}/`)) ||
    items.some((item) => !isAllowedFile(item.fileName))
  ) {
    return { ok: false };
  }

  const supabase = await createClient();

  const { count } = await supabase
    .from("house_files")
    .select("id", { count: "exact", head: true })
    .eq("house_id", houseId);

  const start = count ?? 0;

  const { error } = await supabase.from("house_files").insert(
    items.map((item, index) => ({
      house_id: houseId,
      storage_path: item.storagePath,
      file_name: item.fileName,
      size_bytes: item.sizeBytes,
      position: start + index,
    })),
  );

  if (error) {
    await supabase.storage.from(FILE_BUCKET).remove(paths);
    return { ok: false };
  }

  revalidatePath("/", "layout");
  return { ok: true };
}

export async function deleteFile(fileId: string): Promise<void> {
  await requireAdmin();

  const supabase = await createClient();

  // The row goes first (its tokens go with it); the stored file is removed after the answer
  const { data, error } = await supabase
    .from("house_files")
    .delete()
    .eq("id", fileId)
    .select("storage_path")
    .maybeSingle();

  if (error) throw new Error("Could not delete file");

  if (data) {
    const path = data.storage_path as string;

    after(async () => {
      await supabase.storage.from(FILE_BUCKET).remove([path]);
    });
  }

  revalidatePath("/", "layout");
}

/** Makes a one-time token for one file. The token is returned ONCE; only its hash is stored. */
export async function createFileToken(
  input: CreateTokenInput,
): Promise<{ ok: true; token: string } | { ok: false }> {
  await requireAdmin();

  const parsed = createTokenSchema.safeParse(input);
  if (!parsed.success) return { ok: false };

  const { fileId, label, days } = parsed.data;
  const token = generateToken();
  const expiresAt = new Date(Date.now() + days * 86_400_000).toISOString();

  const supabase = await createClient();

  const { error } = await supabase.from("file_tokens").insert({
    file_id: fileId,
    token_hash: hashToken(token),
    label,
    expires_at: expiresAt,
  });

  if (error) return { ok: false };

  revalidatePath("/", "layout");
  return { ok: true, token };
}

export async function revokeFileToken(tokenId: string): Promise<void> {
  await requireAdmin();

  const supabase = await createClient();

  const { error } = await supabase
    .from("file_tokens")
    .update({ revoked_at: new Date().toISOString() })
    .eq("id", tokenId)
    .is("used_at", null)
    .is("revoked_at", null);

  if (error) throw new Error("Could not revoke token");

  revalidatePath("/", "layout");
}