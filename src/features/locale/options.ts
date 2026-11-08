import { routing } from "@/lib/i18n/routing";

export const LOCALES = routing.locales;

export type Locale = (typeof routing.locales)[number];

export const LOCALE_LABELS: Record<Locale, string> = {
  id: "ID",
  en: "EN",
};