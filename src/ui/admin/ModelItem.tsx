"use client";

import dynamic from "next/dynamic";
import { useTranslations } from "next-intl";
import { useState, useTransition } from "react";
import { deleteModel } from "@/features/models/actions";
import { useRouter } from "@/lib/i18n/navigation";
import type { PublicModel } from "@/types/house";
import { buttonStyles } from "@/ui/primitives/Button";

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
  const router = useRouter();
  const [confirming, setConfirming] = useState(false);
  const [editing, setEditing] = useState(false);
  const [pending, startTransition] = useTransition();

  const megabytes = model.size_bytes ? (model.size_bytes / 1048576).toFixed(1) : "?";

  function remove() {
    startTransition(async () => {
      await deleteModel(model.id);
      router.refresh();
    });
  }

  return (
    <div className="border-b-2 border-foreground py-4">
      <div className="flex flex-wrap items-center gap-4">
        <p className="label text-accent">{number}</p>
        <p className="label">
          {t("size")}: {megabytes} MB
        </p>

        <div className="ml-auto flex flex-wrap items-center gap-3">
          <button
            type="button"
            aria-expanded={editing}
            onClick={() => setEditing((open) => !open)}
            className={buttonStyles(editing ? "primary" : "outline")}
          >
            {editing ? t("partsClose") : t("parts")}
          </button>

          {confirming ? (
            <>
              <span className="label">{t("deleteConfirm")}</span>
              <button
                type="button"
                disabled={pending}
                onClick={remove}
                className={buttonStyles("primary")}
              >
                {t("deleteYes")}
              </button>
              <button
                type="button"
                disabled={pending}
                onClick={() => setConfirming(false)}
                className={buttonStyles("outline")}
              >
                {t("cancel")}
              </button>
            </>
          ) : (
            <button
              type="button"
              onClick={() => setConfirming(true)}
              className={buttonStyles("outline")}
            >
              {t("delete")}
            </button>
          )}
        </div>
      </div>

      {editing ? (
        <div className="mt-6">
          <ModelPartsEditor model={model} />
        </div>
      ) : null}
    </div>
  );
}