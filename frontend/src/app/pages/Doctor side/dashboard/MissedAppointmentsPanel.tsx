import { useState } from "react";
import { ChevronDown, History } from "lucide-react";
import { useTranslation } from "react-i18next";
import { DASHBOARD_THEME } from "./dashboardUtils";

interface MissedAppointmentsPanelProps {
  count: number;
  title?: string;
  description?: string;
  children: React.ReactNode;
}

export function MissedAppointmentsPanel({
  count,
  title,
  description,
  children,
}: MissedAppointmentsPanelProps) {
  const { t } = useTranslation("dashboard");
  const [expanded, setExpanded] = useState(false);

  if (count === 0) return null;

  const resolvedTitle = title ?? t("missed.title");
  const resolvedDescription = description ?? t("missed.description");

  return (
    <div
      className="rounded-xl border overflow-hidden"
      style={{ borderColor: "#e5e7eb", backgroundColor: "#fafafa" }}
    >
      <button
        type="button"
        onClick={() => setExpanded((open) => !open)}
        className="w-full flex items-center justify-between gap-3 px-4 py-3 text-start transition-colors hover:bg-gray-50"
      >
        <div className="flex items-center gap-3 min-w-0">
          <div
            className="w-9 h-9 rounded-lg flex items-center justify-center shrink-0"
            style={{ backgroundColor: "#f3f4f6" }}
          >
            <History className="w-4 h-4" style={{ color: DASHBOARD_THEME.muted }} />
          </div>
          <div className="min-w-0">
            <p className="text-sm font-semibold" style={{ color: DASHBOARD_THEME.text }}>
              {resolvedTitle}
              <span className="ms-2 font-normal" style={{ color: DASHBOARD_THEME.muted }}>
                ({count})
              </span>
            </p>
            <p className="text-xs truncate sm:whitespace-normal" style={{ color: DASHBOARD_THEME.muted }}>
              {resolvedDescription}
            </p>
          </div>
        </div>
        <ChevronDown
          className={`w-5 h-5 shrink-0 transition-transform ${expanded ? "rotate-180" : ""}`}
          style={{ color: DASHBOARD_THEME.muted }}
        />
      </button>

      {expanded && (
        <div className="px-4 pb-4 space-y-3 border-t" style={{ borderColor: "#e5e7eb" }}>
          {children}
        </div>
      )}
    </div>
  );
}