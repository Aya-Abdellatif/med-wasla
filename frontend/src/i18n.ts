import i18n from "i18next";
import { initReactI18next } from "react-i18next";
import { applyDocumentDirection } from "./utils/i18nHelpers";
import { getStoredLanguage, LANG_STORAGE_KEY } from "./utils/i18nConstants";
import { namespaces, resources } from "./locales/resources";

const savedLang = getStoredLanguage();

i18n.use(initReactI18next).init({
  lng: savedLang,
  fallbackLng: "en",
  supportedLngs: ["en", "ar"],
  ns: [...namespaces],
  defaultNS: "common",
  resources,
  interpolation: { escapeValue: false },
  react: { useSuspense: false },
});

applyDocumentDirection(savedLang);

i18n.on("languageChanged", (lang) => {
  applyDocumentDirection(lang);
  localStorage.setItem(LANG_STORAGE_KEY, lang.startsWith("ar") ? "ar" : "en");
});

export default i18n;