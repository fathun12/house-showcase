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
  designer: string | null;
  whatsapp: string | null;
  is_published: boolean;
  sort_order: number;
  created_at: string;
  updated_at: string;
};

export type HouseListItem = Pick<
  House,
  "id" | "slug" | "title_id" | "title_en" | "is_published" | "sort_order" | "updated_at"
>;

export type Room = {
  id: string;
  house_id: string;
  position: number;
  floor: number | null;
  name_id: string;
  name_en: string;
  description_id: string;
  description_en: string;
  rationale_id: string;
  rationale_en: string;
  created_at: string;
  updated_at: string;
};

export const MEDIA_KINDS = ["hero", "floorplan", "room", "gallery"] as const;

export type MediaKind = (typeof MEDIA_KINDS)[number];

export type Media = {
  id: string;
  house_id: string;
  room_id: string | null;
  kind: MediaKind;
  storage_path: string;
  width: number | null;
  height: number | null;
  alt_id: string;
  alt_en: string;
  caption_id: string;
  caption_en: string;
  position: number;
  created_at: string;
};

export type HouseSummary = Pick<
  House,
  | "id"
  | "slug"
  | "title_id"
  | "title_en"
  | "floors"
  | "bedrooms"
  | "bathrooms"
  | "area_m2"
  | "sort_order"
>;

export type PublicHouse = House & { rooms: Room[]; media: Media[] };