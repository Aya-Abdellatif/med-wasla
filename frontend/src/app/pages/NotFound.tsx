import { useTranslation } from "react-i18next";
import { Link } from "react-router-dom";
import notFoundBg from "../../assets/notfound1.avif";

export default function NotFound() {
  const { t } = useTranslation(["public", "common"]);

  return (
    <div className="relative h-screen w-screen overflow-hidden">
      <img
        src={notFoundBg}
        alt=""
        aria-hidden="true"
        loading="eager"
        fetchPriority="high"
        className="absolute inset-0 h-full w-full object-cover"
      />
      <div className="absolute inset-0 bg-black/60" />
      <div className="relative z-10 flex h-full flex-col items-center justify-center px-4 text-center text-white">
        <h1 className="text-6xl sm:text-7xl md:text-8xl lg:text-9xl font-bold drop-shadow-[0_0_30px_rgba(255,255,255,0.4)]">
          404
        </h1>
        <p className="mt-2 text-base sm:text-lg md:text-xl lg:text-2xl">
          {t("public:notFound.message")}
        </p>
        <Link
          to="/"
          className="group mt-4 flex items-center justify-center gap-2 whitespace-nowrap rounded-xl border-2 border-primary bg-primary px-4 py-2 text-sm font-bold text-white transition-all duration-300 hover:-translate-y-0.5 hover:bg-transparent hover:text-primary hover:shadow-md sm:px-5 sm:py-2.5 sm:text-base"
        >
          {t("common:returnHome")}
        </Link>
      </div>
    </div>
  );
}
