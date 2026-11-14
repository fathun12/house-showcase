"use client";

import { useTranslations } from "next-intl";
import { useState } from "react";
import { useUploader } from "@/features/media/useUploader";
import { MEDIA_KINDS, type MediaKind } from "@/types/house";
import { UploadStatus } from "@/ui/admin/UploadStatus";
import { Button } from "@/ui/primitives/Button";
import { Select } from "@/ui/primitives/Field";

type RoomOption = { value: string; label: string };

export function Uploader({
  houseId,
  rooms,
  kinds = MEDIA_KINDS,
}: {
  houseId: string;
  rooms: RoomOption[];
  kinds?: readonly MediaKind[];
}) {
  const t = useTranslations("admin.media");
  const tu = useTranslations("admin.upload");
  const { state, upload } = useUploader(houseId);

  const [kind, setKind] = useState<MediaKind>("gallery");
  const [roomId, setRoomId] = useState("");
  const [files, setFiles] = useState<File[]>([]);
  const [inputKey, setInputKey] = useState(0);

  const working = state.status === "working" || state.status === "saving";

  async function handleUpload() {
    await upload(files, kind, kind === "room" && roomId ? roomId : null);
    setFiles([]);
    setInputKey((key) => key + 1);
  }

  return (
    <section className="mb-12 flex flex-col gap-6 border-2 border-foreground p-6">
      <div className="grid gap-6 md:grid-cols-2">
        <Select
          label={t("upload.kind")}
          name="kind"
          value={kind}
          onChange={(event) => setKind(event.target.value as MediaKind)}
          options={kinds.map((value) => ({ value, label: t(`kinds.${value}`) }))}
        />
        {kind === "room" ? (
          <Select
            label={t("upload.room")}
            name="room"
            value={roomId}
            onChange={(event) => setRoomId(event.target.value)}
            options={[{ value: "", label: t("upload.noRoom") }, ...rooms]}
          />
        ) : null}
      </div>

      <div className="flex flex-col gap-2">
        <label htmlFor="files" className="label text-muted">
          {t("upload.files")}
        </label>
        <input
          key={inputKey}
          id="files"
          type="file"
          accept="image/*"
          multiple={kind !== "hero"}
          disabled={working}
          onChange={(event) => setFiles(Array.from(event.target.files ?? []))}
          className="label w-full file:mr-4 file:cursor-pointer file:border-2 file:border-foreground file:bg-transparent file:px-4 file:py-2 file:text-foreground"
        />
        <p className="text-sm text-muted">{t("upload.hint")}</p>
      </div>

      <div>
        <Button
          type="button"
          onClick={handleUpload}
          busy={working}
          disabled={files.length === 0}
        >
          {state.status === "saving"
            ? tu("buttonSaving")
            : working
              ? tu("buttonWorking")
              : t("upload.submit")}
        </Button>
      </div>

      <UploadStatus state={state} />
    </section>
  );
}