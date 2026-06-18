import { Clock } from "lucide-react";
import type { Appointment } from "./dashboardTypes";
import { formatDateLabel, getStatusBadgeStyle } from "./dashboardUtils";
import { Avatar } from "./Avatar";

interface AppointmentRowProps {
  appointment: Appointment;
  showDate?: boolean;
}

export function AppointmentRow({ appointment, showDate = false }: AppointmentRowProps) {
  return (
    <div
      className="flex items-center justify-between p-4 rounded-lg border transition-colors hover:bg-gray-50"
      style={{ borderColor: "#e5e7eb" }}
    >
      <div className="flex items-center space-x-4">
        <Avatar name={appointment.patientName} size="md" />
        <div>
          <h3 className="font-semibold" style={{ color: "#111827" }}>{appointment.patientName}</h3>
          <p className="text-sm" style={{ color: "#6b7280" }}>{appointment.type}</p>
        </div>
      </div>
      <div className="flex items-center space-x-4">
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
      </div>
    </div>
  );
}
