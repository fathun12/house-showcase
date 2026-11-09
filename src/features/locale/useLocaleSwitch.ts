"use client";

import { useLocale } from "next-intl";
import { useState } from "react";
import { getPathname, usePathname } from "@/lib/i18n/navigation";
import type { Locale } from "./options";

export function useLocaleSwitch() {
  const locale = useLocale() as Locale;
  const pathname = usePathname();
  const [isPending, setIsPending] = useState(false);

  function switchTo(next: Locale) {
    if (next === locale) return;

    setIsPending(true);

    // Full page load on purpose. A client-side switch re-mounts the layout, and
    // next-themes then renders its inline script in the browser, which React 19
    // reports as an error in development.
    const path = getPathname({ href: pathname, locale: next });
    window.location.assign(
      `${path}${window.location.search}${window.location.hash}`,
    );
  }

  return { locale, switchTo, isPending };
}