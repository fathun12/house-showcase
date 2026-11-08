"use client";

import { useLocale } from "next-intl";
import { useTransition } from "react";
import { usePathname, useRouter } from "@/lib/i18n/navigation";
import type { Locale } from "./options";

export function useLocaleSwitch() {
  const locale = useLocale() as Locale;
  const router = useRouter();
  const pathname = usePathname();
  const [isPending, startTransition] = useTransition();

  function switchTo(next: Locale) {
    startTransition(() => {
      router.replace(pathname, { locale: next });
    });
  }

  return { locale, switchTo, isPending };
}