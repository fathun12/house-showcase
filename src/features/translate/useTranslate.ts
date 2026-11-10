"use client";

import { useState, useTransition } from "react";
import { translateTexts } from "./actions";
import type { TranslateJob } from "./actions";

export type TranslateStatus = "idle" | "done" | "nothing" | "no_key" | "key" | "quota" | "failed";

type Control = HTMLInputElement | HTMLTextAreaElement;

/** Fills the empty side of every bilingual pair ("title" = title_id + title_en) of a form.
 *  Fields that already have text are never touched. Nothing is saved: that stays with Save. */
export function useTranslate(bases: readonly string[]) {
  const [status, setStatus] = useState<TranslateStatus>("idle");
  const [isPending, startTransition] = useTransition();

  const translate = (form: HTMLFormElement | null) => {
    if (!form) return;

    const control = (name: string) => form.elements.namedItem(name) as Control | null;
    const jobs: TranslateJob[] = [];
    const targets: Control[] = [];

    for (const base of bases) {
      const id = control(`${base}_id`);
      const en = control(`${base}_en`);
      if (!id || !en) continue;

      const idText = id.value.trim();
      const enText = en.value.trim();

      if (idText && !enText) {
        jobs.push({ text: idText, to: "en" });
        targets.push(en);
      } else if (enText && !idText) {
        jobs.push({ text: enText, to: "id" });
        targets.push(id);
      }
    }

    if (jobs.length === 0) {
      setStatus("nothing");
      return;
    }

    startTransition(async () => {
      const result = await translateTexts(jobs);

      if (!result.ok) {
        setStatus(result.code);
        return;
      }

      result.texts.forEach((translated, index) => {
        targets[index].value = translated;
      });
      setStatus("done");
    });
  };

  return { translate, status, isPending };
}