import { createClient } from "@/lib/supabase/client";

const baseUrl = process.env.NEXT_PUBLIC_SUPABASE_URL!;
const key = process.env.NEXT_PUBLIC_SUPABASE_PUBLISHABLE_KEY!;

export type UploadOptions = {
  bucket: string;
  path: string;
  file: File;
  /** Only used by the fallback upload */
  contentType: string;
  /** 0 to 1 */
  onProgress?: (fraction: number) => void;
};

/** Same request supabase-js sends (multipart), but through XMLHttpRequest, which reports bytes sent. */
function sendWithProgress(token: string, options: UploadOptions): Promise<void> {
  return new Promise((resolve, reject) => {
    const body = new FormData();
    body.append("cacheControl", "31536000");
    body.append("", options.file);

    const request = new XMLHttpRequest();
    request.open("POST", `${baseUrl}/storage/v1/object/${options.bucket}/${options.path}`);
    request.setRequestHeader("apikey", key);
    request.setRequestHeader("Authorization", `Bearer ${token}`);
    request.setRequestHeader("x-upsert", "false");

    request.upload.onprogress = (event) => {
      if (event.lengthComputable) options.onProgress?.(event.loaded / event.total);
    };
    request.onload = () => {
      if (request.status >= 200 && request.status < 300) resolve();
      else reject(new Error("Upload failed"));
    };
    request.onerror = () => reject(new Error("Upload failed"));
    request.onabort = () => reject(new Error("Upload aborted"));

    request.send(body);
  });
}

/** Uploads one file to storage and reports progress. If the progress upload fails, it tries the plain upload once. */
export async function uploadFile(options: UploadOptions): Promise<void> {
  const supabase = createClient();
  const { data } = await supabase.auth.getSession();
  const token = data.session?.access_token;

  if (token) {
    try {
      await sendWithProgress(token, options);
      return;
    } catch {
      // fall through to the plain upload below
    }
  }

  const { error } = await supabase.storage
    .from(options.bucket)
    .upload(options.path, options.file, {
      contentType: options.contentType,
      cacheControl: "31536000",
      upsert: false,
    });

  if (error) throw new Error("Upload failed");

  options.onProgress?.(1);
}