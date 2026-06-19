import { Clock } from "lucide-react";
import type { Appointment } from "./dashboardTypes";
import { formatDateLabel, getStatusBadgeStyle } from "./dashboardUtils";
import { Avatar } from "./Avatar";

interface AppointmentRowProps {
  appointment: Appointment;
  showDate?: boolean;
  onConfirm?: (appointmentId: string) => void;
  onComplete?: (appointmentId: string) => void;
  isUpdating?: boolean;
}

export function AppointmentRow({
  appointment,
  showDate = false,
  onConfirm,
  onComplete,
  isUpdating = false,
}: AppointmentRowProps) {
  const showConfirm = appointment.backendStatus === "pending" && onConfirm;
  const showComplete = appointment.backendStatus === "confirmed" && onComplete;

  return (
    <div
      className="flex flex-col gap-3 sm:flex-row sm:items-center sm:justify-between p-4 rounded-lg border transition-colors hover:bg-gray-50"
      style={{ borderColor: "#e5e7eb" }}
    >
      <div className="flex items-center space-x-4">
        <Avatar name={appointment.patientName} size="md" />
        <div>
          <h3 className="font-semibold" style={{ color: "#111827" }}>{appointment.patientName}</h3>
          <p className="text-sm" style={{ color: "#6b7280" }}>{appointment.type}</p>
        </div>
      </div>
      <div className="flex flex-wrap items-center gap-3 sm:gap-4">
        {showDate && (
          <p className="text-sm font-medium hidden sm:block" style={{ color: "#111827" }}>
            {formatDateLabel(appointment.date)}
          </p>
        )}
        <div className="flex items-center space-x-2" style={{ color: "#6b7280" }}>
          <Clock className="w-4 h-4" />
          <span className="text-sm">{appointment.time}</span>
        </div>
        <span
          className="px-3 py-1 text-sm rounded-full font-medium capitalize"
          style={getStatusBadgeStyle(appointment.status)}
        >
          {appointment.status}
        </span>
        {showConfirm && (
          <button
            type="button"
            disabled={isUpdating}
            onClick={() => onConfirm(appointment.id)}
            className="px-3 py-1.5 text-sm rounded-lg font-medium text-white disabled:opacity-50"
            style={{ backgroundColor: "#2563eb" }}
          >
            Confirm
          </button>
        )}
        {showComplete && (
          <button
            type="button"
            disabled={isUpdating}
            onClick={() => onComplete(appointment.id)}
            className="px-3 py-1.5 text-sm rounded-lg font-medium text-white disabled:opacity-50"
            style={{ backgroundColor: "#16a34a" }}
          >
            Mark Complete
          </button>
        )}
      </div>
    </div>
  );
}
