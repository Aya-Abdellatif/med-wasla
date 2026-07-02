export const LANG_STORAGE_KEY = "lang";
export const SUPPORTED_LANGUAGES = ["en", "ar"] as const;
export type AppLanguage = (typeof SUPPORTED_LANGUAGES)[number];

export function getStoredLanguage(): AppLanguage {
  const stored = localStorage.getItem(LANG_STORAGE_KEY);
  if (stored === "ar" || stored === "en") return stored;
  return "en";
}