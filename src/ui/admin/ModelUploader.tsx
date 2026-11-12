"use client";

import { useTranslations } from "next-intl";
import { useState } from "react";
import { useModelUploader } from "@/features/models/useModelUploader";
import { Button } from "@/ui/primitives/Button";

export function ModelUploader({ houseId }: { houseId: string }) {
  const t = useTranslations("admin.models.upload");
  const { state, upload } = useModelUploader(houseId);

  const [files, setFiles] = useState<File[]>([]);
  const [inputKey, setInputKey] = useState(0);

  const working = state.status === "working";

  async function handleUpload() {
    await upload(files);
    setFiles([]);
    setInputKey((key) => key + 1);
  }

  return (
    <section className="mb-12 flex flex-col gap-6 border-2 border-foreground p-6">
      <div className="flex flex-col gap-2">
        <label htmlFor="models" className="label text-muted">
          {t("files")}
        </label>
        <input
          key={inputKey}
          id="models"
          type="file"
          accept=".glb"
          multiple
          onChange={(event) => setFiles(Array.from(event.target.files ?? []))}
          className="label w-full file:mr-4 file:cursor-pointer file:border-2 file:border-foreground file:bg-transparent file:px-4 file:py-2 file:text-foreground"
        />
        <p className="text-sm text-muted">{t("hint")}</p>
      </div>

      <div className="flex flex-wrap items-center gap-4">
        <Button type="button" onClick={handleUpload} disabled={working || files.length === 0}>
          {t("submit")}
        </Button>
        <p aria-live="polite" className="label">
          {state.status === "working" ? t("uploading") : null}
          {state.status === "done" ? t("done") : null}
          {state.status === "error" && state.error ? (
            <span className="text-accent">{t(`errors.${state.error}`)}</span>
          ) : null}
        </p>
      </div>
    </section>
  );
}