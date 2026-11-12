import { z } from "zod";
import { MODEL_MAX_BYTES } from "./url";

export const newModelSchema = z.object({
  houseId: z.uuid(),
  storagePath: z.string().min(1).max(300),
  sizeBytes: z.number().int().positive().max(MODEL_MAX_BYTES),
});