// src/components/layout/LanguageSwitch.tsx
import { useTranslation } from "react-i18next";

function LanguageSwitch() {
  const { i18n } = useTranslation();
  const isArabic = i18n.language === "ar";

  const toggleLanguage = () => {
    const newLang = isArabic ? "en" : "ar";
    i18n.changeLanguage(newLang);
    document.documentElement.lang = newLang;
    document.documentElement.dir = newLang === "ar" ? "rtl" : "ltr";
    localStorage.setItem("lang", newLang);
  };

  return (
    <button
      type="button"
      dir="ltr"
      onClick={toggleLanguage}
      aria-label="Toggle language"
      className="relative flex items-center rounded-full bg-muted border-2 border-border cursor-pointer shrink-0"
      style={{ width: 80, height: 36, padding: 4 }}
    >
      <span
        className="absolute rounded-full bg-primary shadow-md transition-transform duration-300 ease-in-out"
        style={{
          top: 2,
          left: 5,
          width: 32,
          height: 28,
          transform: isArabic ? "translateX(36px)" : "translateX(0px)",
        }}
      />

      <span
        className="relative z-10 text-xs font-bold transition-colors duration-300 ease-in-out"
        style={{
          width: 36,
          textAlign: "center",
          color: isArabic ? "var(--color-fg-muted)" : "#fff",
        }}
      >
        EN
      </span>
      <span
        className="relative z-10 text-xs font-bold transition-colors duration-300 ease-in-out"
        style={{
          width: 36,
          textAlign: "center",
          color: isArabic ? "#fff" : "var(--color-fg-muted)",
        }}
      >
        AR
      </span>
    </button>
  );
}

export default LanguageSwitch;
