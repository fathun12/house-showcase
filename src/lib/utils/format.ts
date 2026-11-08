export function formatDate(iso: string, locale: string) {
  return new Intl.DateTimeFormat(locale, { dateStyle: "medium" }).format(
    new Date(iso),
  );
}

/** Indonesian is the base language; English falls back to it when empty. */
export function pickLocalized(locale: string, valueId: string, valueEn: string) {
  return locale === "en" && valueEn ? valueEn : valueId;
}