import { byPosition, toImage } from "@/features/houses/view";
import type { ImageView } from "@/features/houses/view";
import { readSettings } from "@/features/model3d/config";
import type { PartConfig } from "@/features/model3d/config";
import { modelUrl } from "@/features/models/url";
import type { ViewerItem } from "@/features/viewer/items";
import { pickLocalized } from "@/lib/utils/format";
import type { FurnitureSummary, PublicFurniture } from "@/types/house";

export type ModelView = {
  id: string;
  url: string;
  /** glTF node name -> label and movement chosen in the admin */
  configs: Record<string, PartConfig>;
};

export type FurnitureContent = {
  slug: string;
  title: string;
  tagline: string;
  why: string;
  notes: string;
  designer: string;
  whatsapp: string;
  /** Already formatted for the visitor's language; null when not filled in */
  dimensions: { length: string | null; width: string | null; height: string | null };
  material: string;
  finish: string;
  hero: ImageView | null;
  gallery: ImageView[];
  models: ModelView[];
};

export function buildFurnitureContent(item: PublicFurniture, locale: string): FurnitureContent {
  const title = pickLocalized(locale, item.title_id, item.title_en);
  const media = [...item.media].sort(byPosition);
  const formatter = new Intl.NumberFormat(locale, { maximumFractionDigits: 1 });
  const format = (value: number | null) => (value === null ? null : formatter.format(value));

  const imagesOf = (kind: "hero" | "gallery") =>
    media.filter((entry) => entry.kind === kind).map((entry) => toImage(entry, locale, title));

  const models = [...item.models].sort(byPosition).map((model) => {
    const configs: Record<string, PartConfig> = {};

    for (const part of model.model_parts) {
      configs[part.node_name] = {
        label: pickLocalized(locale, part.label_id, part.label_en),
        motion: part.motion,
        settings: readSettings(part.settings),
      };
    }

    return { id: model.id, url: modelUrl(model.storage_path), configs };
  });

  return {
    slug: item.slug,
    title,
    tagline: pickLocalized(locale, item.tagline_id, item.tagline_en),
    why: pickLocalized(locale, item.why_id, item.why_en),
    notes: pickLocalized(locale, item.notes_id, item.notes_en),
    designer: item.designer?.trim() ?? "",
    whatsapp: item.whatsapp ?? "",
    dimensions: {
      length: format(item.length_cm),
      width: format(item.width_cm),
      height: format(item.height_cm),
    },
    material: pickLocalized(locale, item.material_id, item.material_en),
    finish: pickLocalized(locale, item.finish_id, item.finish_en),
    hero: imagesOf("hero")[0] ?? null,
    gallery: imagesOf("gallery"),
    models,
  };
}

/** Every clickable picture of a furniture page, in page order: main image, then the gallery. */
export function buildFurnitureViewerItems(content: FurnitureContent): ViewerItem[] {
  const items: ViewerItem[] = [];

  if (content.hero) {
    items.push({ key: content.hero.src, kind: "hero", image: content.hero, room: null });
  }

  for (const image of content.gallery) {
    items.push({ key: image.src, kind: "gallery", image, room: null });
  }

  return items;
}

export type FurnitureRow = {
  slug: string;
  title: string;
  /** "120 × 60 × 75", only when all three sizes are filled in */
  size: string | null;
  material: string;
};

export function buildFurnitureRows(list: FurnitureSummary[], locale: string): FurnitureRow[] {
  const formatter = new Intl.NumberFormat(locale, { maximumFractionDigits: 1 });

  return list.map((item) => ({
    slug: item.slug,
    title: pickLocalized(locale, item.title_id, item.title_en),
    size:
      item.length_cm !== null && item.width_cm !== null && item.height_cm !== null
        ? [item.length_cm, item.width_cm, item.height_cm]
            .map((value) => formatter.format(value))
            .join(" \u00d7 ")
        : null,
    material: pickLocalized(locale, item.material_id, item.material_en),
  }));
}