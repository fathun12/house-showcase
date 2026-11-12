import { getLocale, getTranslations } from "next-intl/server";
import { getHouseOrNotFound } from "@/features/houses/queries";
import { listModels } from "@/features/models/queries";
import { pickLocalized } from "@/lib/utils/format";
import { FormShell } from "@/ui/admin/FormShell";
import { HouseTabs } from "@/ui/admin/HouseTabs";
import { ModelItem } from "@/ui/admin/ModelItem";
import { ModelUploader } from "@/ui/admin/ModelUploader";

export default async function AdminModelsPage({
  params,
}: {
  params: Promise<{ id: string }>;
}) {
  const { id } = await params;
  const house = await getHouseOrNotFound(id);
  const t = await getTranslations("admin.models");
  const locale = await getLocale();
  const models = await listModels(id);

  return (
    <FormShell
      eyebrow={`${pickLocalized(locale, house.title_id, house.title_en)} / ${t("eyebrow")}`}
      title={t("title")}
    >
      <HouseTabs houseId={id} active="models" />
      <ModelUploader houseId={id} />

      {models.length === 0 ? <p className="text-muted">{t("empty")}</p> : null}

      {models.map((model, index) => (
        <ModelItem
          key={model.id}
          model={model}
          number={String(index + 1).padStart(2, "0")}
        />
      ))}
    </FormShell>
  );
}