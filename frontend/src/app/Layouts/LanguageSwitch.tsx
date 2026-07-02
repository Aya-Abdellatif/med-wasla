import { useState, useRef, useEffect } from "react";
import { Globe, Check } from "lucide-react";
import { useTranslation } from "react-i18next";
import { applyDocumentDirection } from "../../utils/i18nHelpers";

function LanguageSwitch() {
  const { i18n, t } = useTranslation("language");
  const [isOpen, setIsOpen] = useState(false);
  const ref = useRef<HTMLDivElement | null>(null);
  const isArabic = i18n.language.startsWith("ar");

  useEffect(() => {
    if (!isOpen) return;
    const handleClickOutside = (event: MouseEvent) => {
      if (ref.current && !ref.current.contains(event.target as Node)) {
        setIsOpen(false);
      }
    };
    document.addEventListener("mousedown", handleClickOutside);
    return () => document.removeEventListener("mousedown", handleClickOutside);
  }, [isOpen]);

  const selectLanguage = (lang: "en" | "ar") => {
    void i18n.changeLanguage(lang);
    applyDocumentDirection(lang);
    setIsOpen(false);
  };

  return (
    <div className="relative" ref={ref}>
      <button
        type="button"
        onClick={() => setIsOpen((prev) => !prev)}
        aria-label={t("aria.change")}
        className="flex items-center justify-center h-10 w-10 rounded-xl text-fg-muted hover:text-primary transition-all duration-300 cursor-pointer hover:scale-[1.1] hover:-translate-y-0.5"
      >
        <Globe className="h-5 w-5" strokeWidth={2.2} />
      </button>

      {isOpen && (
        <div
          dir="ltr"
          className="absolute end-0 top-full mt-2 w-36 bg-white rounded-xl shadow-xl border border-border p-1.5 space-y-1 z-50"
        >
          <button
            type="button"
            onClick={() => selectLanguage("en")}
            className="flex items-center justify-between w-full text-sm font-semibold px-3 py-2 rounded-lg text-fg-muted hover:text-fg hover:bg-muted transition-all duration-200"
          >
            {t("en")}
            {!isArabic && (
              <Check className="h-4 w-4 text-primary" strokeWidth={2.5} />
            )}
          </button>
          <button
            type="button"
            onClick={() => selectLanguage("ar")}
            className="flex items-center justify-between w-full text-sm font-semibold px-3 py-2 rounded-lg text-fg-muted hover:text-fg hover:bg-muted transition-all duration-200"
          >
            {t("ar")}
            {isArabic && (
              <Check className="h-4 w-4 text-primary" strokeWidth={2.5} />
            )}
          </button>
        </div>
      )}
    </div>
  );
}

export default LanguageSwitch;
