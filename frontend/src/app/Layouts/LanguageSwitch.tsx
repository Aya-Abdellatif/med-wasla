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

  const TRACK_WIDTH = 54;
  const TRACK_HEIGHT = 32;
  const BALL_WIDTH = 22;
  const BALL_HEIGHT = 24;
  const BALL_TOP = 2; // distance from top of track
  const BALL_LEFT = 3; // resting (EN) position from left
  const BALL_TRAVEL = 24; // how far right it slides when AR is active
  const LABEL_WIDTH = 30; // width of each EN/AR text slot

  return (
    <button
      type="button"
      dir="ltr"
      onClick={toggleLanguage}
      aria-label="Toggle language"
      className="relative flex items-center rounded-xl bg-muted border-2 border-border cursor-pointer shrink-0"
      style={{ width: TRACK_WIDTH, height: TRACK_HEIGHT }}
    >
      <span
        className="absolute rounded-lg bg-primary shadow-md transition-transform duration-300 ease-in-out"
        style={{
          top: BALL_TOP,
          left: BALL_LEFT,
          width: BALL_WIDTH,
          height: BALL_HEIGHT,
          transform: isArabic
            ? `translateX(${BALL_TRAVEL}px)`
            : "translateX(0px)",
        }}
      />

      <span
        className="relative z-10 text-[11px] font-bold text-center transition-colors duration-300 ease-in-out"
        style={{
          width: LABEL_WIDTH,
          marginLeft: BALL_LEFT,
          color: isArabic ? "var(--color-fg-muted)" : "#fff",
        }}
      >
        EN
      </span>
      <span
        className="relative z-10 text-[11px] font-bold text-center transition-colors duration-300 ease-in-out"
        style={{
          width: LABEL_WIDTH,
          color: isArabic ? "#fff" : "var(--color-fg-muted)",
        }}
      >
        AR
      </span>
    </button>
  );
}

export default LanguageSwitch;
