"use client";

import { useTranslations } from "next-intl";
import { useTranslate } from "@/features/translate/useTranslate";
import { Button } from "@/ui/primitives/Button";

/** Put it inside a <form>: it translates the empty side of the listed bilingual fields. */
export function TranslateButton({ bases }: { bases: readonly string[] }) {
  const t = useTranslations("admin.translate");
  const { translate, status, isPending } = useTranslate(bases);

  return (
    <>
      <Button
        type="button"
        variant="outline"
        disabled={isPending}
        onClick={(event) => translate(event.currentTarget.form)}
      >
        {isPending ? t("pending") : t("button")}
      </Button>
      {status !== "idle" && !isPending ? (
        <p
          role="status"
          className={
            status === "done" || status === "nothing"
              ? "label self-center text-muted"
              : "label self-center text-accent"
          }
        >
          {t(`status.${status}`)}
        </p>
      ) : null}
    </>
  );
}