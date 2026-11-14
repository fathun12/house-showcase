import Image from "next/image";
import { useTranslations } from "next-intl";
import { deleteMedia, updateMedia } from "@/features/media/actions";
import { mediaUrl } from "@/features/media/url";
import { cn } from "@/lib/utils/cn";
import type { Media } from "@/types/house";
import { buttonStyles } from "@/ui/primitives/Button";
import { SubmitButton } from "@/ui/primitives/SubmitButton";
import { Select, TextField } from "@/ui/primitives/Field";

type RoomOption = { value: string; label: string };

export function MediaItem({ media, rooms }: { media: Media; rooms: RoomOption[] }) {
  const t = useTranslations("admin.media");
  const suffix = media.id;

  return (
    <article className="grid gap-6 border-t border-foreground py-6 md:grid-cols-[18rem_1fr]">
      <Image
        src={mediaUrl(media.storage_path)}
        alt={media.alt_id}
        width={media.width ?? 1600}
        height={media.height ?? 900}
        sizes="288px"
        className="h-auto w-full border border-foreground"
      />

      <div className="flex flex-col gap-6">
        <form action={updateMedia.bind(null, media.id)} className="flex flex-col gap-6">
          <div className="grid gap-6 md:grid-cols-2">
            <TextField
              label={`${t("item.alt")} / ID`}
              name="alt_id"
              id={`alt_id-${suffix}`}
              defaultValue={media.alt_id}
              maxLength={200}
            />
            <TextField
              label={`${t("item.alt")} / EN`}
              name="alt_en"
              id={`alt_en-${suffix}`}
              defaultValue={media.alt_en}
              maxLength={200}
            />
            <TextField
              label={`${t("item.caption")} / ID`}
              name="caption_id"
              id={`caption_id-${suffix}`}
              defaultValue={media.caption_id}
              maxLength={300}
            />
            <TextField
              label={`${t("item.caption")} / EN`}
              name="caption_en"
              id={`caption_en-${suffix}`}
              defaultValue={media.caption_en}
              maxLength={300}
            />
          </div>

          <div className={cn("grid gap-6", media.kind === "room" ? "md:grid-cols-2" : "md:max-w-48")}>
            <TextField
              label={t("item.position")}
              name="position"
              id={`position-${suffix}`}
              type="number"
              min={0}
              max={999}
              defaultValue={media.position}
            />
            {media.kind === "room" ? (
              <Select
                label={t("item.room")}
                name="room_id"
                id={`room_id-${suffix}`}
                defaultValue={media.room_id ?? ""}
                options={[{ value: "", label: t("upload.noRoom") }, ...rooms]}
              />
            ) : (
              <input type="hidden" name="room_id" value="" />
            )}
          </div>

          <SubmitButton
            className="self-start"
            pendingLabel={t("item.saving")}
            doneLabel={t("item.saved")}
          >
            {t("item.save")}
          </SubmitButton>
        </form>

        <details>
          <summary
            className={cn(
              buttonStyles("outline"),
              "w-fit list-none [&::-webkit-details-marker]:hidden",
            )}
          >
            {t("item.delete")}
          </summary>
          <form
            action={deleteMedia.bind(null, media.id)}
            className="mt-3 flex flex-wrap items-center gap-4"
          >
            <span>{t("item.deleteConfirm")}</span>
            <SubmitButton variant="outline" pendingLabel={t("item.deleting")}>
              {t("item.deleteYes")}
            </SubmitButton>
          </form>
        </details>
      </div>
    </article>
  );
}