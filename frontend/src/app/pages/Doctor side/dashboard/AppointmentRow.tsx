import { Clock, Home } from "lucide-react";
import type { Appointment } from "./dashboardTypes";
import {
  DASHBOARD_THEME,
  formatDateLabel,
  getStatusBadgeStyle,
  isHomeVisitAppointment,
} from "./dashboardUtils";
import { Avatar } from "./Avatar";

interface AppointmentRowProps {
  appointment: Appointment;
  showDate?: boolean;
  offersHomeService?: boolean;
  onConfirm?: (appointmentId: string) => void;
  onCancel?: (appointmentId: string) => void;
  onComplete?: (appointmentId: string) => void;
  onGoToHomeService?: () => void;
  isUpdating?: boolean;
}

export function AppointmentRow({
  appointment,
  showDate = false,
  offersHomeService = false,
  onConfirm,
  onCancel,
  onComplete,
  onGoToHomeService,
  isUpdating = false,
}: AppointmentRowProps) {
  const isHomeVisit = isHomeVisitAppointment(appointment);
  const routeToHomeTab =
    isHomeVisit &&
    offersHomeService &&
    appointment.backendStatus === "pending";

  const showConfirm =
    !routeToHomeTab &&
    appointment.backendStatus === "pending" &&
    onConfirm;
  const showCancel =
    !routeToHomeTab &&
    appointment.backendStatus === "pending" &&
    onCancel;
  const showComplete =
    !routeToHomeTab &&
    appointment.backendStatus === "confirmed" &&
    onComplete;

  return (
    <div
      className="flex flex-col gap-3 sm:flex-row sm:items-center sm:justify-between p-4 rounded-lg border transition-colors hover:bg-gray-50"
      style={{ borderColor: "#e5e7eb" }}
    >
      <div className="flex items-center space-x-4">
        <Avatar name={appointment.patientName} size="md" />
        <div>
          <h3 className="font-semibold" style={{ color: DASHBOARD_THEME.text }}>
            {appointment.patientName}
          </h3>
          <p className="text-sm" style={{ color: DASHBOARD_THEME.muted }}>
            {appointment.type}
          </p>
        </div>
      </div>
      <div className="flex flex-wrap items-center gap-3 sm:gap-4">
        {showDate && (
          <p
            className="text-sm font-medium hidden sm:block"
            style={{ color: DASHBOARD_THEME.text }}
          >
            {formatDateLabel(appointment.date)}
          </p>
        )}
        <div className="flex items-center space-x-2" style={{ color: DASHBOARD_THEME.muted }}>
          <Clock className="w-4 h-4" />
          <span className="text-sm">{appointment.time}</span>
        </div>
        <span
          className="px-3 py-1 text-sm rounded-full font-medium capitalize"
          style={getStatusBadgeStyle(appointment.status)}
        >
          {appointment.status}
        </span>
        {routeToHomeTab && onGoToHomeService && (
          <button
            type="button"
            disabled={isUpdating}
            onClick={onGoToHomeService}
            className="flex items-center gap-1.5 px-3 py-1.5 text-sm rounded-lg font-medium text-white disabled:opacity-50"
            style={{ backgroundColor: DASHBOARD_THEME.primary }}
          >
            <Home className="w-4 h-4" />
            Go to Home Service
          </button>
        )}
        {showConfirm && (
          <button
            type="button"
            disabled={isUpdating}
            onClick={() => onConfirm(appointment.id)}
            className="px-3 py-1.5 text-sm rounded-lg font-medium text-white disabled:opacity-50"
            style={{ backgroundColor: DASHBOARD_THEME.primary }}
          >
            Confirm
          </button>
        )}
        {showCancel && (
          <button
            type="button"
            disabled={isUpdating}
            onClick={() => onCancel(appointment.id)}
            className="px-3 py-1.5 text-sm rounded-lg font-medium text-white disabled:opacity-50"
            style={{ backgroundColor: DASHBOARD_THEME.danger }}
          >
            Cancel
          </button>
        )}
        {showComplete && (
          <button
            type="button"
            disabled={isUpdating}
            onClick={() => onComplete(appointment.id)}
            className="px-3 py-1.5 text-sm rounded-lg font-medium text-white disabled:opacity-50"
            style={{ backgroundColor: DASHBOARD_THEME.success }}
          >
            Mark Complete
          </button>
        )}
      </div>
    </div>
  );
}
