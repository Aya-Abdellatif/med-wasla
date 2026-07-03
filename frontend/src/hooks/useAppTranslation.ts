import { useTranslation } from "react-i18next";
import { isRtlLanguage } from "../utils/i18nHelpers";

export function useAppTranslation(ns?: string | string[]) {
  const result = useTranslation(ns);
  return {
    ...result,
    isRtl: isRtlLanguage(result.i18n.language),
  };
}
