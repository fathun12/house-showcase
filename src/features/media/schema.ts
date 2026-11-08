import { z } from "zod";
import { optionalNumber, text } from "@/lib/utils/validation";
import { MEDIA_KINDS } from "@/types/house";

export const newMediaSchema = z.object({
  houseId: z.uuid(),
  roomId: z.uuid().nullable(),
  kind: z.enum(MEDIA_KINDS),
  storagePath: z.string().min(1).max(300),
  width: z.number().int().positive().nullable(),
  height: z.number().int().positive().nullable(),
});

export const MEDIA_DETAIL_FIELDS = [
  "alt_id",
  "alt_en",
  "caption_id",
  "caption_en",
  "position",
  "room_id",
] as const;

export const mediaDetailsSchema = z.object({
  alt_id: text(200),
  alt_en: text(200),
  caption_id: text(300),
  caption_en: text(300),
  position: optionalNumber(0, 999, true),
  room_id: z
    .string()
    .trim()
    .transform((value) => (value === "" ? null : value))
    .pipe(z.uuid().nullable()),
});