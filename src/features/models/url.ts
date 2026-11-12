export const MODEL_BUCKET = "house-models";
export const MODEL_MAX_BYTES = 20 * 1024 * 1024;

/** Public address of a 3D model in the storage bucket. Works on server and browser. */
export function modelUrl(storagePath: string) {
  return `${process.env.NEXT_PUBLIC_SUPABASE_URL}/storage/v1/object/public/${MODEL_BUCKET}/${storagePath}`;
}