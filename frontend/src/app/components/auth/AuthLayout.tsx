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
}

export default function AuthLayout({
  title,
  subtitle,
  children,
  compact = false,
  small = false,
  wide = false,
  center = true,
}: AuthLayoutProps) {
  const cardWidthClass = wide
    ? "max-w-3xl"
    : small
      ? "max-w-[350px]"
      : compact
        ? "max-w-[420px]"
        : "max-w-[520px]";
  const cardPaddingClass = small
    ? "p-4"
    : compact
      ? "p-5 sm:p-6"
      : "p-6 sm:p-8";

  return (
    <div
      className={`min-h-screen bg-gradient-to-br from-teal-50 via-white to-slate-50 px-4 py-6 sm:py-8 ${
        center ? "flex items-center justify-center" : ""
      }`}
    >
      <div className={`w-full ${cardWidthClass}`}>
        <div className="mb-5 flex items-center justify-center gap-3">
          <img
            src={Logo}
            alt="MedWasla Logo"
            className="w-17 h-15 -mr-6 transition-transform duration-300"
          />
          <h1 className="text-xl font-semibold">
            <span className="text-slate-900">Med</span>
            <span className="text-teal-500">Wasla</span>
          </h1>
        </div>

        <div
          className={`rounded-3xl border border-slate-100 bg-white shadow-xl shadow-slate-200/50 ${cardPaddingClass}`}
        >
          <div className="mb-5">
            <h2 className="text-2xl font-bold text-slate-900 sm:text-[1.65rem]">
              {title}
            </h2>
            {subtitle && (
              <p className="mt-1 text-sm text-slate-500 sm:text-base">
                {subtitle}
              </p>
            )}
          </div>
          {children}
        </div>
      </div>
    </div>
  );
}
