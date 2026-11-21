"use client";

import { useTranslations } from "next-intl";
import { useState } from "react";
import { useFileUploader } from "@/features/files/useFileUploader";
import { FILE_ACCEPT } from "@/features/files/url";
import { UploadStatus } from "@/ui/admin/UploadStatus";
import { Button } from "@/ui/primitives/Button";

export function FileUploader({ houseId }: { houseId: string }) {
  const t = useTranslations("admin.files.upload");
  const tu = useTranslations("admin.upload");
  const { state, upload } = useFileUploader(houseId);

  const [files, setFiles] = useState<File[]>([]);
  const [inputKey, setInputKey] = useState(0);

  const working = state.status === "working" || state.status === "saving";

  async function handleUpload() {
    await upload(files);
    setFiles([]);
    setInputKey((key) => key + 1);
  }

  return (
    <section className="mb-12 flex flex-col gap-6 border-2 border-foreground p-6">
      <div className="flex flex-col gap-2">
        <label htmlFor="project-files" className="label text-muted">
          {t("files")}
        </label>
        <input
          key={inputKey}
          id="project-files"
          type="file"
          accept={FILE_ACCEPT}
          multiple
          disabled={working}
          onChange={(event) => setFiles(Array.from(event.target.files ?? []))}
          className="label w-full file:mr-4 file:cursor-pointer file:border-2 file:border-foreground file:bg-transparent file:px-4 file:py-2 file:text-foreground"
        />
        <p className="text-sm text-muted">{t("hint")}</p>
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
              : t("submit")}
        </Button>
      </div>

      <UploadStatus state={state} />
    </section>
  );
}