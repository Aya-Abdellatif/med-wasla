import type { ReactNode } from "react";

interface RoleSelectCardProps {
  icon: ReactNode;
  title: string;
  description: string;
  onClick: () => void;
}

export default function RoleSelectCard({
  icon,
  title,
  description,
  onClick,
}: RoleSelectCardProps) {
  return (
    <button
      type="button"
      onClick={onClick}
      className="group relative flex w-full flex-col items-center gap-4 overflow-hidden rounded-2xl bg-white p-6 text-center shadow-sm outline-none transition-all duration-200 hover:-translate-y-1.5 hover:shadow-xl active:translate-y-0 active:scale-[0.98] active:shadow-sm active:duration-75 sm:p-7"
    >
      <div className="flex h-14 w-14 items-center justify-center rounded-xl bg-primary/10 text-primary transition-colors duration-200 group-hover:bg-primary group-hover:text-white">
        {icon}
      </div>

      <div className="space-y-1">
        <h3 className="text-lg font-semibold text-fg">{title}</h3>
        <p className="text-sm leading-relaxed text-fg-muted">{description}</p>
      </div>

      <span className="block translate-y-2 text-sm font-semibold text-primary opacity-0 transition-all duration-200 group-hover:translate-y-0 group-hover:opacity-100">
        Get started
      </span>
    </button>
  );
}
