"use client";

import { useTranslations } from "next-intl";
import { LOCALE_LABELS, LOCALES } from "@/features/locale/options";
import { useLocaleSwitch } from "@/features/locale/useLocaleSwitch";
import { Segmented } from "@/ui/primitives/Segmented";

export function LocaleSwitch({ fill = false }: { fill?: boolean }) {
  const t = useTranslations("common.language");
  const { locale, switchTo, isPending } = useLocaleSwitch();

  return (
    <Segmented
      label={t("label")}
      options={LOCALES.map((value) => ({
        value,
        label: LOCALE_LABELS[value],
      }))}
      value={locale}
      onChange={switchTo}
      disabled={isPending}
      fill={fill}
    />
  );
}