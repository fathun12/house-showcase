import { getLocale, getTranslations } from "next-intl/server";
import { getHouseOrNotFound } from "@/features/houses/queries";
import { listMedia } from "@/features/media/queries";
import { pickLocalized } from "@/lib/utils/format";
import { FURNITURE_MEDIA_KINDS } from "@/types/house";
import { FormShell } from "@/ui/admin/FormShell";
import { HouseTabs } from "@/ui/admin/HouseTabs";
import { MediaItem } from "@/ui/admin/MediaItem";
import { Uploader } from "@/ui/admin/Uploader";

export default async function AdminFurnitureMediaPage({
  params,
}: {
  params: Promise<{ id: string }>;
}) {
  const { id } = await params;
  const house = await getHouseOrNotFound(id, "furniture");
  const t = await getTranslations("admin.media");
  const locale = await getLocale();
  const media = await listMedia(id);

  return (
    <FormShell
      eyebrow={`${pickLocalized(locale, house.title_id, house.title_en)} / ${t("eyebrow")}`}
      title={t("title")}
    >
      <HouseTabs houseId={id} active="media" kind="furniture" />
      <Uploader houseId={id} rooms={[]} kinds={FURNITURE_MEDIA_KINDS} />

      {media.length === 0 ? <p className="text-muted">{t("empty")}</p> : null}

      {FURNITURE_MEDIA_KINDS.map((kind) => {
        const group = media.filter((item) => item.kind === kind);
        if (group.length === 0) return null;

        return (
          <section key={kind} className="mb-12">
            <h2 className="label mb-4 text-accent">
              {t(`kinds.${kind}`)} ({group.length})
            </h2>
            {group.map((item) => (
              <MediaItem key={item.id} media={item} rooms={[]} />
            ))}
          </section>
        );
      })}
    </FormShell>
  );
}