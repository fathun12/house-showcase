"use client";

import { useTranslations } from "next-intl";
import { THEMES } from "@/features/theme/options";
import { useThemeSwitch } from "@/features/theme/useThemeSwitch";
import { Segmented } from "@/ui/primitives/Segmented";

export function ThemeSwitch({ fill = false }: { fill?: boolean }) {
  const t = useTranslations("common.theme");
  const { theme, setTheme } = useThemeSwitch();

  return (
    <Segmented
      label={t("label")}
      options={THEMES.map((value) => ({ value, label: t(value) }))}
      value={theme}
      onChange={setTheme}
      fill={fill}
    />
  );
}