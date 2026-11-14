import { z } from "zod";
import { MEDIA_KINDS } from "@/types/house";

export const newMediaBatchSchema = z.object({
  houseId: z.uuid(),
  roomId: z.uuid().nullable(),
  kind: z.enum(MEDIA_KINDS),
  items: z
    .array(
      z.object({
        storagePath: z.string().min(1).max(300),
        width: z.number().int().positive().max(20000).nullable(),
        height: z.number().int().positive().max(20000).nullable(),
      }),
    )
    .min(1)
    .max(40),
});

export type NewMediaBatchInput = z.input<typeof newMediaBatchSchema>;