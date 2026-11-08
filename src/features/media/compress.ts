import imageCompression, { type Options } from "browser-image-compression";

const OPTIONS: Options = {
  maxSizeMB: 1.5,
  maxWidthOrHeight: 2400,
  useWebWorker: true,
  fileType: "image/webp",
  initialQuality: 0.85,
};

export type CompressedImage = { file: File; width: number; height: number };

/** Shrinks an image in the browser and reports its final size. */
export async function compressImage(source: File): Promise<CompressedImage> {
  const file = await imageCompression(source, OPTIONS);

  const bitmap = await createImageBitmap(file);
  const { width, height } = bitmap;
  bitmap.close();

  return { file, width, height };
}