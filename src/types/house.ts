export type House = {
  id: string;
  slug: string;
  title_id: string;
  title_en: string;
  tagline_id: string;
  tagline_en: string;
  why_id: string;
  why_en: string;
  notes_id: string;
  notes_en: string;
  floors: number | null;
  bedrooms: number | null;
  bathrooms: number | null;
  area_m2: number | null;
  is_published: boolean;
  sort_order: number;
  created_at: string;
  updated_at: string;
};

export type HouseListItem = Pick<
  House,
  "id" | "slug" | "title_id" | "title_en" | "is_published" | "sort_order" | "updated_at"
>;