import type { ReactNode } from "react";
import { ChevronRight } from "lucide-react";

type Accent = "blue" | "teal" | "indigo" | "emerald";

const accentStyles: Record<Accent, { icon: string; ring: string; hover: string }> = {
  blue: {
    icon: "from-blue-500 to-blue-600",
    ring: "group-hover:ring-blue-200",
    hover: "hover:border-blue-200 hover:bg-blue-50/40",
  },
  teal: {
    icon: "from-teal-500 to-teal-600",
    ring: "group-hover:ring-teal-200",
    hover: "hover:border-teal-300 hover:bg-teal-50/50",
  },
  indigo: {
    icon: "from-indigo-500 to-indigo-600",
    ring: "group-hover:ring-indigo-200",
    hover: "hover:border-indigo-200 hover:bg-indigo-50/40",
  },
  emerald: {
    icon: "from-emerald-500 to-emerald-600",
    ring: "group-hover:ring-emerald-200",
    hover: "hover:border-emerald-200 hover:bg-emerald-50/40",
  },
};

interface RoleSelectCardProps {
  icon: ReactNode;
  title: string;
  description: string;
  accent?: Accent;
  onClick: () => void;
}

export default function RoleSelectCard({
  icon,
  title,
  description,
  accent = "teal",
  onClick,
}: RoleSelectCardProps) {
  const styles = accentStyles[accent];

  return (
    <button
      type="button"
      onClick={onClick}
      className={`group relative flex w-full flex-col items-center gap-4 rounded-2xl border-2 border-slate-100 bg-white p-6 text-center shadow-sm transition-all duration-300 hover:-translate-y-1 hover:shadow-lg focus:outline-none focus:ring-2 focus:ring-teal-400/40 sm:p-7 ${styles.hover} ${styles.ring}`}
    >
      <div
        className={`flex h-16 w-16 items-center justify-center rounded-2xl bg-gradient-to-br text-white shadow-md transition-transform duration-300 group-hover:scale-105 ${styles.icon}`}
      >
        {icon}
      </div>

      <div className="space-y-1">
        <h3 className="text-lg font-bold text-slate-900">{title}</h3>
        <p className="text-sm leading-relaxed text-slate-500">{description}</p>
      </div>

      <span className="inline-flex items-center gap-1 text-sm font-semibold text-teal-600 opacity-0 transition-opacity duration-300 group-hover:opacity-100">
        Continue
        <ChevronRight className="h-4 w-4" />
      </span>
    </button>
  );
}
