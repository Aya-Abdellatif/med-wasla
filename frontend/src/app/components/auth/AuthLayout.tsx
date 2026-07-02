import type { ReactNode } from "react";
import { useTranslation } from "react-i18next";
import Logo from "../../../assets/logo.png";

interface AuthLayoutProps {
  title: string;
  subtitle?: string;
  children: ReactNode;
  compact?: boolean;
  small?: boolean;
  wide?: boolean;
  center?: boolean;
  fitScreen?: boolean;
}

export default function AuthLayout({
  title,
  subtitle,
  children,
  compact = false,
  small = false,
  wide = false,
  center = true,
  fitScreen = false,
}: AuthLayoutProps) {
  const { t } = useTranslation("common");
  const cardWidthClass = fitScreen
    ? "max-w-4xl"
    : wide
      ? "max-w-4xl"
      : small
        ? "max-w-[350px]"
        : compact
          ? "max-w-[420px]"
          : "max-w-[520px]";

  const cardPaddingClass = fitScreen
    ? "p-5 sm:p-6"
    : small
      ? "p-4"
      : compact
        ? "p-5 sm:p-6"
        : "p-6 sm:p-8";

  const shellClass = fitScreen
    ? "min-h-screen bg-gradient-to-br from-teal-50 via-white to-slate-50 px-4 sm:px-6 py-4 flex flex-col justify-center"
    : "min-h-screen bg-gradient-to-br from-teal-50 via-white to-slate-50 px-4 py-6 sm:py-8";

  const alignClass = center ? "flex items-center justify-center" : "";

  return (
    <div className={`${shellClass} ${alignClass}`}>
      <div className={`w-full ${cardWidthClass}`}>
        <div
          className={`flex items-center justify-center gap-3 ${fitScreen ? "mb-3" : "mb-5"}`}
        >
          <img
            src={Logo}
            alt={t("brand.logoAlt")}
            className={`${fitScreen ? "h-12 w-14" : "w-19 h-17"} -me-6 transition-transform duration-300`}
          />
          <h1
            className={`${fitScreen ? "text-2xl" : "text-3xl"} font-semibold`}
          >
            <span className="text-fg">{t("brand.med")}</span>
            <span className="text-primary">{t("brand.wasla")}</span>
          </h1>
        </div>

        <div
          className={`rounded-3xl border border-slate-100 bg-white shadow-xl shadow-slate-200/50 ${cardPaddingClass}`}
        >
          <div className={fitScreen ? "mb-4" : "mb-5"}>
            <h2
              className={`font-bold text-fg ${fitScreen ? "text-xl sm:text-2xl" : "text-2xl sm:text-[1.65rem]"}`}
            >
              {title}
            </h2>
            {subtitle && (
              <p
                className={`mt-1 text-fg-muted ${fitScreen ? "text-sm" : "text-sm sm:text-base"}`}
              >
                {subtitle}
              </p>
            )}
          </div>
          {fitScreen ? (
            <div className="max-h-[min(85dvh,calc(100vh-8rem))] overflow-y-auto overscroll-contain pr-1">
              {children}
            </div>
          ) : (
            children
          )}
        </div>
      </div>
    </div>
  );
}
