import { mediaUrl } from "@/features/media/url";
import { pickLocalized } from "@/lib/utils/format";
import type { HouseSummary, Media, PublicHouse } from "@/types/house";

export type ImageView = {
  src: string;
  width: number;
  height: number;
  alt: string;
  caption: string;
};

export type RoomView = {
  id: string;
  number: string;
  anchor: string;
  name: string;
  floor: number | null;
  description: string;
  rationale: string;
  photos: ImageView[];
};

export type HouseContent = {
  slug: string;
  title: string;
  tagline: string;
  why: string;
  notes: string;
  facts: {
    floors: number | null;
    bedrooms: number | null;
    bathrooms: number | null;
    area: number | null;
  };
  hero: ImageView | null;
  floorplans: ImageView[];
  rooms: RoomView[];
  gallery: ImageView[];
};

export type SummaryRow = {
  slug: string;
  title: string;
  floors: string | null;
  bedrooms: string | null;
  bathrooms: string | null;
  area: string | null;
};

const byPosition = (
  a: { position: number; created_at: string },
  b: { position: number; created_at: string },
) => a.position - b.position || a.created_at.localeCompare(b.created_at);

function numberFormatter(locale: string) {
  const formatter = new Intl.NumberFormat(locale, { maximumFractionDigits: 1 });
  return (value: number | null) => (value === null ? null : formatter.format(value));
}

function toImage(item: Media, locale: string, fallbackAlt: string): ImageView {
  const caption = pickLocalized(locale, item.caption_id, item.caption_en);

  return {
    src: mediaUrl(item.storage_path),
    width: item.width ?? 1600,
    height: item.height ?? 1000,
    alt: pickLocalized(locale, item.alt_id, item.alt_en) || caption || fallbackAlt,
    caption,
  };
}

export function buildHouseContent(house: PublicHouse, locale: string): HouseContent {
  const title = pickLocalized(locale, house.title_id, house.title_en);
  const media = [...house.media].sort(byPosition);
  const rooms = [...house.rooms].sort(byPosition);
  const roomIds = new Set(rooms.map((room) => room.id));

  const imagesOf = (kind: Media["kind"]) =>
    media.filter((item) => item.kind === kind).map((item) => toImage(item, locale, title));

  // Room photos that are not linked to an existing room still show up, in the gallery
  const orphanPhotos = media
    .filter((item) => item.kind === "room" && (!item.room_id || !roomIds.has(item.room_id)))
    .map((item) => toImage(item, locale, title));

  return {
    slug: house.slug,
    title,
    tagline: pickLocalized(locale, house.tagline_id, house.tagline_en),
    why: pickLocalized(locale, house.why_id, house.why_en),
    notes: pickLocalized(locale, house.notes_id, house.notes_en),
    facts: {
      floors: house.floors,
      bedrooms: house.bedrooms,
      bathrooms: house.bathrooms,
      area: house.area_m2,
    },
    hero: imagesOf("hero")[0] ?? null,
    floorplans: imagesOf("floorplan"),
    gallery: [...imagesOf("gallery"), ...orphanPhotos],
    rooms: rooms.map((room, index) => {
      const name = pickLocalized(locale, room.name_id, room.name_en);
      const number = String(index + 1).padStart(2, "0");

      return {
        id: room.id,
        number,
        anchor: `room-${number}`,
        name,
        floor: room.floor,
        description: pickLocalized(locale, room.description_id, room.description_en),
        rationale: pickLocalized(locale, room.rationale_id, room.rationale_en),
        photos: media
          .filter((item) => item.kind === "room" && item.room_id === room.id)
          .map((item) => toImage(item, locale, name)),
      };
    }),
  };
}

export function buildSummaryRows(houses: HouseSummary[], locale: string): SummaryRow[] {
  const format = numberFormatter(locale);

  return houses.map((house) => ({
    slug: house.slug,
    title: pickLocalized(locale, house.title_id, house.title_en),
    floors: format(house.floors),
    bedrooms: format(house.bedrooms),
    bathrooms: format(house.bathrooms),
    area: format(house.area_m2),
  }));
}