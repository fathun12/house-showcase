import { readSettings } from "@/features/model3d/config";
import type { PartConfig } from "@/features/model3d/config";
import { pickLocalized } from "@/lib/utils/format";
import type { PublicModel } from "@/types/house";
import { modelUrl } from "./url";

export type ModelView = {
  id: string;
  url: string;
  /** glTF node name -> label and movement chosen in the admin */
  configs: Record<string, PartConfig>;
};

const inOrder = (a: PublicModel, b: PublicModel) =>
  a.position - b.position || a.created_at.localeCompare(b.created_at);

/** Models of a project (house or furniture) in the shape the 3D viewer needs. */
export function buildModelViews(models: PublicModel[], locale: string): ModelView[] {
  return [...models].sort(inOrder).map((model) => {
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
}