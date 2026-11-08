import { z } from "zod";
import { optionalNumber, requiredText, text } from "@/lib/utils/validation";

export const ROOM_FIELDS = [
  "position",
  "floor",
  "name_id",
  "name_en",
  "description_id",
  "description_en",
  "rationale_id",
  "rationale_en",
] as const;

export type RoomField = (typeof ROOM_FIELDS)[number];
export type RoomFormValues = Record<RoomField, string>;

export const roomSchema = z.object({
  position: optionalNumber(0, 999, true),
  floor: optionalNumber(1, 10, true),
  name_id: requiredText(120),
  name_en: text(120),
  description_id: text(3000),
  description_en: text(3000),
  rationale_id: text(3000),
  rationale_en: text(3000),
});