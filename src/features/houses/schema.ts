import { z } from "zod";
import { optionalNumber, requiredText, text } from "@/lib/utils/validation";
import { isValidWhatsapp } from "@/lib/utils/whatsapp";

export const HOUSE_FIELDS = [
  "slug",
  "title_id",
  "title_en",
  "tagline_id",
  "tagline_en",
  "why_id",
  "why_en",
  "notes_id",
  "notes_en",
  "floors",
  "bedrooms",
  "bathrooms",
  "area_m2",
  "designer",
  "whatsapp",
  "sort_order",
  "is_published",
] as const;

export type HouseField = (typeof HOUSE_FIELDS)[number];
export type HouseFormValues = Record<HouseField, string>;

export const houseSchema = z.object({
  slug: requiredText(80).regex(/^[a-z0-9]+(-[a-z0-9]+)*$/),
  title_id: requiredText(120),
  title_en: text(120),
  tagline_id: text(240),
  tagline_en: text(240),
  why_id: text(5000),
  why_en: text(5000),
  notes_id: text(5000),
  notes_en: text(5000),
  floors: optionalNumber(1, 10, true),
  bedrooms: optionalNumber(0, 30, true),
  bathrooms: optionalNumber(0, 30, true),
  area_m2: optionalNumber(1, 100000),
  designer: text(80),
  whatsapp: text(30).refine((value) => value === "" || isValidWhatsapp(value)),
  sort_order: optionalNumber(-1000, 1000, true),
  is_published: z.string().transform((value) => value === "on"),
});

export type HouseInput = z.output<typeof houseSchema>;