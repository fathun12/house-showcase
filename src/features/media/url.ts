export const MEDIA_BUCKET = "house-media";

/** Public address of an image in the storage bucket. Works on server and browser. */
export function mediaUrl(storagePath: string) {
  return `${process.env.NEXT_PUBLIC_SUPABASE_URL}/storage/v1/object/public/${MEDIA_BUCKET}/${storagePath}`;
}