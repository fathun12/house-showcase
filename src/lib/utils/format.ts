export function formatDate(iso: string, locale: string) {
  return new Intl.DateTimeFormat(locale, { dateStyle: "medium" }).format(
    new Date(iso),
  );
}

/** Shows the visitor's language; when that side is empty, falls back to the other one. */
export function pickLocalized(locale: string, valueId: string, valueEn: string) {
  return locale === "en" ? valueEn || valueId : valueId || valueEn;
}