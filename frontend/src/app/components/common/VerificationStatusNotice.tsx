import { useState } from "react";
import { X, CheckCircle, Clock, XCircle } from "lucide-react";

type VerificationStatus = "approved" | "pending" | "rejected";

interface VerificationStatusNoticeProps {
  status: VerificationStatus;
}

const statusConfig = {
  approved: {
    icon: CheckCircle,
    message: "Profile approved — visible to patients.",
    className: "bg-green-50 border-green-200 text-green-800",
    iconColor: "#16a34a",
  },
  pending: {
    icon: Clock,
    message: "Profile pending admin review.",
    className: "bg-amber-50 border-amber-200 text-amber-800",
    iconColor: "#d97706",
  },
  rejected: {
    icon: XCircle,
    message: "Profile rejected — please update and resubmit.",
    className: "bg-red-50 border-red-200 text-red-800",
    iconColor: "#dc2626",
  },
};

export function VerificationStatusNotice({ status }: VerificationStatusNoticeProps) {
  const [dismissed, setDismissed] = useState(false);
  if (dismissed) return null;

  const config = statusConfig[status];
  const Icon = config.icon;

  return (
    <div className="fixed top-24 right-4 z-50 max-w-xs">
      <div
        className={`flex items-start gap-2.5 rounded-lg border px-3 py-2.5 text-xs font-medium shadow-md ${config.className}`}
      >
        <Icon className="w-4 h-4 shrink-0 mt-0.5" style={{ color: config.iconColor }} />
        <p className="flex-1 leading-snug">{config.message}</p>
        <button
          onClick={() => setDismissed(true)}
          className="shrink-0 opacity-60 hover:opacity-100 transition-opacity"
          aria-label="Dismiss notification"
        >
          <X className="w-3.5 h-3.5" />
        </button>
      </div>
    </div>
  );
}
