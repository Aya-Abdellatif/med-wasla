import i18n from "../i18n";
import {
  LANG_STORAGE_KEY,
  SUPPORTED_LANGUAGES,
  type AppLanguage,
  getStoredLanguage,
} from "./i18nConstants";

// Re-exported so existing imports from "./i18nHelpers" elsewhere in the app keep working
export { LANG_STORAGE_KEY, SUPPORTED_LANGUAGES, getStoredLanguage };
export type { AppLanguage };

export function isRtlLanguage(lang?: string): boolean {
  return (lang ?? i18n.language)?.startsWith("ar");
}

export function applyDocumentDirection(lang: string): void {
  const isRtl = isRtlLanguage(lang);
  document.documentElement.lang = lang.startsWith("ar") ? "ar" : "en";
  document.documentElement.dir = isRtl ? "rtl" : "ltr";
}

export function formatLocaleDate(
  value: Date | string | number,
  options?: Intl.DateTimeFormatOptions,
): string {
  const date = value instanceof Date ? value : new Date(value);
  const locale = isRtlLanguage() ? "ar-EG" : "en-US";
  return date.toLocaleDateString(locale, options);
}

export function formatLocaleTime(
  value: Date | string | number,
  options?: Intl.DateTimeFormatOptions,
): string {
  const date = value instanceof Date ? value : new Date(value);
  const locale = isRtlLanguage() ? "ar-EG" : "en-US";
  return date.toLocaleTimeString(locale, options);
}