"use client";

import { useTheme } from "next-themes";
import { useSyncExternalStore } from "react";
import type { ThemeOption } from "./options";

const subscribe = () => () => {};

export function useThemeSwitch() {
  const { theme, setTheme } = useTheme();

  // false on the server, true in the browser: avoids a flash of the wrong state
  const mounted = useSyncExternalStore(
    subscribe,
    () => true,
    () => false,
  );

  return {
    theme: (mounted ? (theme ?? "system") : "system") as ThemeOption,
    setTheme: (next: ThemeOption) => setTheme(next),
    mounted,
  };
}