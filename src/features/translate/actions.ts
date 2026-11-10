"use server";

import { requireAdmin } from "@/features/auth/session";

/** to = the language the text should become */
export type TranslateJob = { text: string; to: "id" | "en" };

export type TranslateResult =
  | { ok: true; texts: string[] }
  | { ok: false; code: "no_key" | "key" | "quota" | "failed" };

const LANGUAGES = {
  id: { source: "EN", target: "ID" },
  en: { source: "ID", target: "EN-US" },
} as const;

const MAX_JOBS = 20;
const MAX_LENGTH = 5000;

/** Translates texts with DeepL. Admin only; the key never leaves the server. */
export async function translateTexts(jobs: TranslateJob[]): Promise<TranslateResult> {
  await requireAdmin();

  const key = process.env.DEEPL_API_KEY?.trim();
  if (!key) return { ok: false, code: "no_key" };

  const valid =
    jobs.length > 0 &&
    jobs.length <= MAX_JOBS &&
    jobs.every(
      (job) => (job.to === "id" || job.to === "en") && job.text.length <= MAX_LENGTH,
    );
  if (!valid) return { ok: false, code: "failed" };

  // Free keys end in ":fx" and use another host than paid keys
  const host = key.endsWith(":fx") ? "https://api-free.deepl.com" : "https://api.deepl.com";
  const texts: string[] = jobs.map(() => "");

  try {
    for (const to of ["id", "en"] as const) {
      const indexes = jobs.flatMap((job, index) => (job.to === to ? [index] : []));
      if (indexes.length === 0) continue;

      const response = await fetch(`${host}/v2/translate`, {
        method: "POST",
        headers: {
          Authorization: `DeepL-Auth-Key ${key}`,
          "Content-Type": "application/json",
        },
        body: JSON.stringify({
          text: indexes.map((index) => jobs[index].text),
          source_lang: LANGUAGES[to].source,
          target_lang: LANGUAGES[to].target,
        }),
        cache: "no-store",
      });

      if (response.status === 403) return { ok: false, code: "key" };
      if (response.status === 456) return { ok: false, code: "quota" };
      if (!response.ok) return { ok: false, code: "failed" };

      const data = (await response.json()) as { translations?: { text: string }[] };
      const translations = data.translations;
      if (!translations || translations.length !== indexes.length) {
        return { ok: false, code: "failed" };
      }

      indexes.forEach((jobIndex, position) => {
        texts[jobIndex] = translations[position].text;
      });
    }
  } catch {
    return { ok: false, code: "failed" };
  }

  return { ok: true, texts };
}