import type { ReactNode } from "react";

interface AuthLayoutProps {
  title: string;
  subtitle?: string;
  children: ReactNode;
  compact?: boolean;
  small?: boolean;
  wide?: boolean; 
}

export default function AuthLayout({
  title,
  subtitle,
  children,
  compact = false,
  small = false,

}: AuthLayoutProps) {
  const cardWidthClass = small ? 'max-w-[350px]' : compact ? 'max-w-[420px]' : 'max-w-[560px]';
  const cardPaddingClass = small ? 'p-4' : compact ? 'p-4 sm:p-5' : 'p-8 sm:p-10';
  const sectionPaddingClass = small ? 'py-6' : compact ? 'py-6' : 'py-12';

  return (
    <div className={`h-screen overflow-hidden flex items-center justify-center px-4 ${sectionPaddingClass} bg-teal-50`}>
      <div className={`w-full ${cardWidthClass}`}> 
        <div className="flex flex-row items-center justify-center gap-3 mb-6">
          <div className="w-14 h-14 bg-teal-500 rounded-2xl flex items-center justify-center shadow-md shrink-0">
            <div className="w-6 h-6 bg-white rounded-full"></div>
          </div>

          <h1 className="text-xl font-semibold">
            <span className="text-slate-900">Med</span>
            <span className="text-teal-500">Wasla</span>
          </h1>
        </div>

        <div className={`bg-white rounded-2xl border border-slate-100 shadow-xl ${cardPaddingClass}`}>
          <h2 className="text-2xl sm:text-3xl font-semibold text-slate-900 mb-1">{title}</h2>
          {subtitle && <p className="text-slate-500 text-sm sm:text-base mb-6">{subtitle}</p>}
          {children}
        </div>
      </div>
    </div>
  );
}