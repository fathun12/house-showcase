import { z } from "zod";
import { AXES, DIRS, MOTIONS, SIDES } from "@/features/model3d/config";
import { MODEL_MAX_BYTES } from "./url";

export const newModelSchema = z.object({
  houseId: z.uuid(),
  storagePath: z.string().min(1).max(300),
  sizeBytes: z.number().int().positive().max(MODEL_MAX_BYTES),
});

const partSettingsSchema = z.object({
  dir: z.enum(DIRS),
  amount: z.number().min(5).max(300),
  axis: z.enum(AXES),
  angle: z.number().min(-170).max(170),
  pivotA: z.enum(SIDES),
  pivotB: z.enum(SIDES),
});

export const savePartsSchema = z.object({
  modelId: z.uuid(),
  parts: z
    .array(
      z.object({
        nodeName: z.string().min(1).max(200),
        labelId: z.string().trim().max(80),
        labelEn: z.string().trim().max(80),
        motion: z.enum(MOTIONS),
        settings: partSettingsSchema,
      }),
    )
    .max(200),
});

export type SavePartsInput = z.input<typeof savePartsSchema>;