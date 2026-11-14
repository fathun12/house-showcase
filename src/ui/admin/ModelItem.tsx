"use client";

import dynamic from "next/dynamic";
import { useTranslations } from "next-intl";
import { useState, useTransition } from "react";
import { deleteModel } from "@/features/models/actions";
import type { PublicModel } from "@/types/house";
import { Button } from "@/ui/primitives/Button";
import { ProgressBar } from "@/ui/primitives/ProgressBar";

function EditorLoading() {
  const t = useTranslations("admin.models.parts");

  return <p className="label text-muted">{t("loading")}</p>;
}

// Three.js is only downloaded when the editor is opened, and only in the browser
const ModelPartsEditor = dynamic(
  () => import("@/ui/admin/ModelPartsEditor").then((module) => module.ModelPartsEditor),
  { ssr: false, loading: () => <EditorLoading /> },
);

export function ModelItem({ model, number }: { model: PublicModel; number: string }) {
  const t = useTranslations("admin.models.item");
  const [confirming, setConfirming] = useState(false);
  const [editing, setEditing] = useState(false);
  const [deleting, setDeleting] = useState(false);
  const [failed, setFailed] = useState(false);
  const [, startTransition] = useTransition();

  const megabytes = model.size_bytes ? (model.size_bytes / 1048576).toFixed(1) : "?";

  // The row turns into a "deleting" strip at once; the server answer removes it for good
  function remove() {
    setConfirming(false);
    setFailed(false);
    setDeleting(true);

    startTransition(async () => {
      try {
        await deleteModel(model.id);
      } catch {
        setDeleting(false);
        setFailed(true);
      }
    });
  }

  if (deleting) {
    return (
      <div className="border-b-2 border-foreground py-4">
        <p aria-live="polite" className="label text-muted">
          <span className="text-accent">{number}</span> / {t("deleting")}
        </p>
        <ProgressBar value={null} label={t("deleting")} className="mt-3 w-full" />
      </div>
    );
  }

  return (
    <div className="border-b-2 border-foreground py-4">
      <div className="flex flex-wrap items-center gap-4">
        <p className="label text-accent">{number}</p>
        <p className="label">
          {t("size")}: {megabytes} MB
        </p>

        <div className="ml-auto flex flex-wrap items-center gap-3">
          <Button
            type="button"
            variant={editing ? "primary" : "outline"}
            aria-expanded={editing}
            onClick={() => setEditing((open) => !open)}
          >
            {editing ? t("partsClose") : t("parts")}
          </Button>

          {confirming ? (
            <>
              <span className="label">{t("deleteConfirm")}</span>
              <Button type="button" onClick={remove}>
                {t("deleteYes")}
              </Button>
              <Button type="button" variant="outline" onClick={() => setConfirming(false)}>
                {t("cancel")}
              </Button>
            </>
          ) : (
            <Button type="button" variant="outline" onClick={() => setConfirming(true)}>
              {t("delete")}
            </Button>
          )}
        </div>
      </div>

      {failed ? (
        <p role="alert" className="label mt-3 text-accent">
          {t("deleteFailed")}
        </p>
      ) : null}

      {editing ? (
        <div className="mt-6">
          <ModelPartsEditor model={model} />
        </div>
      ) : null}
    </div>
  );
}