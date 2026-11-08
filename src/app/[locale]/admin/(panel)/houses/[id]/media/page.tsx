import { getLocale, getTranslations } from "next-intl/server";
import { getHouseOrNotFound } from "@/features/houses/queries";
import { listMedia } from "@/features/media/queries";
import { listRooms } from "@/features/rooms/queries";
import { pickLocalized } from "@/lib/utils/format";
import { MEDIA_KINDS } from "@/types/house";
import { FormShell } from "@/ui/admin/FormShell";
import { HouseTabs } from "@/ui/admin/HouseTabs";
import { MediaItem } from "@/ui/admin/MediaItem";
import { Uploader } from "@/ui/admin/Uploader";

export default async function AdminMediaPage({
  params,
}: {
  params: Promise<{ id: string }>;
}) {
  const { id } = await params;
  const house = await getHouseOrNotFound(id);
  const t = await getTranslations("admin.media");
  const locale = await getLocale();
  const [rooms, media] = await Promise.all([listRooms(id), listMedia(id)]);

  const roomOptions = rooms.map((room) => ({
    value: room.id,
    label: pickLocalized(locale, room.name_id, room.name_en),
  }));

  return (
    <FormShell
      eyebrow={`${pickLocalized(locale, house.title_id, house.title_en)} / ${t("eyebrow")}`}
      title={t("title")}
    >
      <HouseTabs houseId={id} active="media" />
      <Uploader houseId={id} rooms={roomOptions} />

      {media.length === 0 ? <p className="text-muted">{t("empty")}</p> : null}

      {MEDIA_KINDS.map((kind) => {
        const group = media.filter((item) => item.kind === kind);
        if (group.length === 0) return null;

        return (
          <section key={kind} className="mb-12">
            <h2 className="label mb-4 text-accent">
              {t(`kinds.${kind}`)} ({group.length})
            </h2>
            {group.map((item) => (
              <MediaItem key={item.id} media={item} rooms={roomOptions} />
            ))}
          </section>
        );
      })}
    </FormShell>
  );
}