export const THEMES = ["light", "dark", "system"] as const;

export type ThemeOption = (typeof THEMES)[number];