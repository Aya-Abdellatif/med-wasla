import type { ReactNode } from "react";
import Logo from "../../../assets/logo.png";

interface AuthLayoutProps {
  title: string;
  subtitle?: string;
  children: ReactNode;
  compact?: boolean;
  small?: boolean;
  wide?: boolean;
  center?: boolean;
  /** Full viewport width, no page scroll */
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
    ? "min-h-screen lg:h-screen lg:overflow-hidden bg-gradient-to-br from-teal-50 via-white to-slate-50 px-4 sm:px-6 py-4 flex flex-col justify-center overflow-y-auto"
    : "min-h-screen bg-gradient-to-br from-teal-50 via-white to-slate-50 px-4 py-6 sm:py-8";

  const alignClass = center ? "flex items-center justify-center" : "";

  return (
    <div className={`${shellClass} ${alignClass}`}>
      <div className={`w-full ${cardWidthClass}`}>
        <div className={`flex items-center justify-center gap-3 ${fitScreen ? "mb-3" : "mb-5"}`}>
          <img
            src={Logo}
            alt="MedWasla Logo"
            className={`${fitScreen ? "h-12 w-12" : "w-17 h-15"} -mr-4 transition-transform duration-300`}
          />
          <h1 className={`${fitScreen ? "text-lg" : "text-xl"} font-semibold`}>
            <span className="text-slate-900">Med</span>
            <span className="text-teal-500">Wasla</span>
          </h1>
        </div>

        <div
          className={`rounded-3xl border border-slate-100 bg-white shadow-xl shadow-slate-200/50 ${cardPaddingClass}`}
        >
          <div className={fitScreen ? "mb-4" : "mb-5"}>
            <h2 className={`font-bold text-slate-900 ${fitScreen ? "text-xl sm:text-2xl" : "text-2xl sm:text-[1.65rem]"}`}>
              {title}
            </h2>
            {subtitle && (
              <p className={`mt-1 text-slate-500 ${fitScreen ? "text-sm" : "text-sm sm:text-base"}`}>
                {subtitle}
              </p>
            )}
          </div>
          {fitScreen ? (
            <div className="lg:max-h-[calc(85vh-160px)] lg:overflow-y-auto lg:pr-2 pr-0 overflow-y-visible">
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
