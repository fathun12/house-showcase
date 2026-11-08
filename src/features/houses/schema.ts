import { z } from "zod";

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
  "sort_order",
  "is_published",
] as const;

export type HouseField = (typeof HOUSE_FIELDS)[number];
export type HouseFormValues = Record<HouseField, string>;

const text = (max: number) => z.string().trim().max(max);
const requiredText = (max: number) => z.string().trim().min(1).max(max);

// Empty string means "not filled" and becomes null
const optionalNumber = (min: number, max: number, integer = false) =>
  z
    .string()
    .trim()
    .transform((value) => (value === "" ? null : Number(value)))
    .pipe((integer ? z.number().int() : z.number()).min(min).max(max).nullable());

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
  sort_order: optionalNumber(-1000, 1000, true),
  is_published: z.string().transform((value) => value === "on"),
});

export type HouseInput = z.output<typeof houseSchema>;