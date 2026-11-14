import { z } from "zod";
import { MODEL_MAX_BYTES } from "./url";

export const newModelsSchema = z.object({
  houseId: z.uuid(),
  items: z
    .array(
      z.object({
        storagePath: z.string().min(1).max(300),
        sizeBytes: z.number().int().positive().max(MODEL_MAX_BYTES),
      }),
    )
    .min(1)
    .max(20),
});

export type NewModelsInput = z.input<typeof newModelsSchema>;