import { Calendar } from "lucide-react";
import type { Appointment } from "./dashboardTypes";
import { DASHBOARD_THEME, formatDateLabel } from "./dashboardUtils";
import { AppointmentRow } from "./AppointmentRow";
import { MissedAppointmentsPanel } from "./MissedAppointmentsPanel";

interface ScheduleTabProps {
  selectedDate: string;
  onSelectedDateChange: (date: string) => void;
  filteredUpcoming: Appointment[];
  filteredCompleted: Appointment[];
  pendingAppointments: Appointment[];
  overdueAppointments: Appointment[];
  offersHomeService: boolean;
  onConfirm?: (appointmentId: string) => void;
  onCancel?: (appointmentId: string) => void;
  onCancelAllPending?: () => void;
  onComplete?: (appointmentId: string) => void;
  onGoToHomeService?: () => void;
  updatingAppointmentId?: string | null;
}

export function ScheduleTab({
  selectedDate,
  onSelectedDateChange,
  filteredUpcoming,
  filteredCompleted,
  pendingAppointments,
  overdueAppointments,
  offersHomeService,
  onConfirm,
  onCancel,
  onCancelAllPending,
  onComplete,
  onGoToHomeService,
  updatingAppointmentId,
}: ScheduleTabProps) {
  const cancellablePending = pendingAppointments.filter(
    (a) => a.backendStatus === "pending" && a.visitType === "clinic",
  );

  return (
    <div className="bg-white rounded-xl p-6" style={{ boxShadow: "0 1px 3px rgba(0,0,0,0.1)" }}>
      <div className="flex flex-wrap items-center justify-between gap-4 mb-6">
        <h2 className="text-xl font-bold" style={{ color: DASHBOARD_THEME.text }}>
          Appointments
        </h2>
        <label
          className="flex items-center gap-2 px-3 py-2 border rounded-lg bg-gray-50 cursor-pointer transition-colors"
          style={{ borderColor: "#e5e7eb" }}
        >
          <Calendar className="w-4 h-4 shrink-0" style={{ color: DASHBOARD_THEME.primary }} />
          <input
            type="date"
            value={selectedDate}
            onChange={(e) => onSelectedDateChange(e.target.value)}
            className="text-sm font-medium bg-transparent focus:outline-none cursor-pointer"
            style={{ color: DASHBOARD_THEME.text }}
          />
        </label>
      </div>

      <p className="text-sm mb-6" style={{ color: DASHBOARD_THEME.muted }}>
        {formatDateLabel(selectedDate)}
      </p>

      <div className="space-y-8">
        {pendingAppointments.length > 0 && (
          <div>
            <div className="flex flex-wrap items-center justify-between gap-3 mb-4">
              <h3 className="text-lg font-semibold" style={{ color: DASHBOARD_THEME.text }}>
                Pending Requests
                <span className="ml-2 text-sm font-normal" style={{ color: DASHBOARD_THEME.muted }}>
                  ({pendingAppointments.length})
                </span>
              </h3>
              {cancellablePending.length > 1 && onCancelAllPending && (
                <button
                  type="button"
                  disabled={updatingAppointmentId === "bulk"}
                  onClick={onCancelAllPending}
                  className="px-3 py-1.5 text-sm font-medium rounded-lg text-white disabled:opacity-50"
                  style={{ backgroundColor: DASHBOARD_THEME.danger }}
                >
                  {updatingAppointmentId === "bulk" ? "Cancelling..." : "Cancel All Clinic"}
                </button>
              )}
            </div>
            <div className="space-y-3">
              {pendingAppointments.map((appointment) => (
                <AppointmentRow
                  key={appointment.id}
                  appointment={appointment}
                  showDate
                  offersHomeService={offersHomeService}
                  onConfirm={onConfirm}
                  onCancel={onCancel}
                  onGoToHomeService={onGoToHomeService}
                  isUpdating={updatingAppointmentId === appointment.id}
                />
              ))}
            </div>
          </div>
        )}

        <div>
          <h3 className="text-lg font-semibold mb-4" style={{ color: DASHBOARD_THEME.text }}>
            Upcoming
            <span className="ml-2 text-sm font-normal" style={{ color: DASHBOARD_THEME.muted }}>
              ({filteredUpcoming.length})
            </span>
          </h3>
          <div className="space-y-3">
            {filteredUpcoming.length > 0 ? (
              filteredUpcoming.map((appointment) => (
                <AppointmentRow
                  key={appointment.id}
                  appointment={appointment}
                  offersHomeService={offersHomeService}
                  onConfirm={onConfirm}
                  onComplete={onComplete}
                  onGoToHomeService={onGoToHomeService}
                  isUpdating={updatingAppointmentId === appointment.id}
                />
              ))
            ) : (
              <p
                className="text-sm py-4 text-center rounded-lg"
                style={{ color: DASHBOARD_THEME.muted, backgroundColor: "#f9fafb" }}
              >
                No upcoming appointments for this day.
              </p>
            )}
          </div>
        </div>

        <div>
          <h3 className="text-lg font-semibold mb-4" style={{ color: DASHBOARD_THEME.text }}>
            Completed
            <span className="ml-2 text-sm font-normal" style={{ color: DASHBOARD_THEME.muted }}>
              ({filteredCompleted.length})
            </span>
          </h3>
          <div className="space-y-3">
            {filteredCompleted.length > 0 ? (
              filteredCompleted.map((appointment) => (
                <AppointmentRow key={appointment.id} appointment={appointment} />
              ))
            ) : (
              <p
                className="text-sm py-4 text-center rounded-lg"
                style={{ color: DASHBOARD_THEME.muted, backgroundColor: "#f9fafb" }}
              >
                No completed appointments for this day.
              </p>
            )}
          </div>
        </div>

        <MissedAppointmentsPanel count={overdueAppointments.length}>
          {overdueAppointments.map((appointment) => (
            <AppointmentRow
              key={appointment.id}
              appointment={appointment}
              showDate
              offersHomeService={offersHomeService}
            />
          ))}
        </MissedAppointmentsPanel>
      </div>
    </div>
  );
}
