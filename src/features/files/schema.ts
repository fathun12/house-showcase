import { z } from "zod";
import { FILE_MAX_BYTES } from "./url";

export const newFilesSchema = z.object({
  houseId: z.uuid(),
  items: z
    .array(
      z.object({
        storagePath: z.string().min(1).max(300),
        fileName: z.string().trim().min(1).max(200),
        sizeBytes: z.number().int().positive().max(FILE_MAX_BYTES),
      }),
    )
    .min(1)
    .max(20),
});

export type NewFilesInput = z.input<typeof newFilesSchema>;

export const createTokenSchema = z.object({
  fileId: z.uuid(),
  label: z.string().trim().max(80),
  days: z.number().int().min(1).max(90),
});

export type CreateTokenInput = z.input<typeof createTokenSchema>;

export const redeemSchema = z.object({
  fileId: z.uuid(),
  token: z.string().trim().min(20).max(100),
});