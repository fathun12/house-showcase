"use client";

import { useTranslations } from "next-intl";
import { useState, useTransition } from "react";
import { deleteModel } from "@/features/models/actions";
import { useRouter } from "@/lib/i18n/navigation";
import type { Model } from "@/types/house";
import { buttonStyles } from "@/ui/primitives/Button";

export function ModelItem({ model, number }: { model: Model; number: string }) {
  const t = useTranslations("admin.models.item");
  const router = useRouter();
  const [confirming, setConfirming] = useState(false);
  const [pending, startTransition] = useTransition();

  const megabytes = model.size_bytes ? (model.size_bytes / 1048576).toFixed(1) : "?";

  function remove() {
    startTransition(async () => {
      await deleteModel(model.id);
      router.refresh();
    });
  }

  return (
    <div className="flex flex-wrap items-center gap-4 border-b-2 border-foreground py-4">
      <p className="label text-accent">{number}</p>
      <p className="label">
        {t("size")}: {megabytes} MB
      </p>

      <div className="ml-auto flex flex-wrap items-center gap-3">
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
  );
}