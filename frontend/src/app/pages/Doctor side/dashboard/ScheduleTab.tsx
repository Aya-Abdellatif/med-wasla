import { useRef } from "react";
import { Calendar } from "lucide-react";
import type { Appointment } from "./dashboardTypes";
import { DASHBOARD_THEME } from "./dashboardUtils";
import { AppointmentRow } from "./AppointmentRow";
import { MissedAppointmentsPanel } from "./MissedAppointmentsPanel";

interface ScheduleTabProps {
  selectedDate: string;
  onSelectedDateChange: (date: string) => void;
  filteredUpcoming: Appointment[];
  filteredCompleted: Appointment[];
  filteredNoShow: Appointment[];
  pendingAppointments: Appointment[];
  overdueAppointments: Appointment[];
  offersHomeService: boolean;
  onCancel?: (appointmentId: string) => void;
  onCancelAllPending?: () => void;
  onCancelAllUpcoming?: (date: string) => void;
  onComplete?: (appointmentId: string) => void;
  onNoShow?: (appointmentId: string) => void;
  onGoToHomeService?: () => void;
  updatingAppointmentId?: string | null;
  selectedScheduleDate: string;
}

export function ScheduleTab({
  selectedDate,
  onSelectedDateChange,
  filteredUpcoming,
  filteredCompleted,
  filteredNoShow,
  pendingAppointments,
  overdueAppointments,
  offersHomeService,
  onCancel,
  onCancelAllPending,
  onCancelAllUpcoming,
  onComplete,
  onNoShow,
  onGoToHomeService,
  updatingAppointmentId,
}: ScheduleTabProps) {
  const dateInputRef = useRef<HTMLInputElement>(null);

  const cancellablePending = pendingAppointments.filter(
    (a) => a.backendStatus === "pending" && a.visitType === "home",
  );
  const cancellableUpcoming = filteredUpcoming.filter(
    (a) => a.visitType === "clinic" && a.backendStatus === "confirmed",
  );
  const isBulkHome = updatingAppointmentId === "bulk-home";
  const isBulkUpcoming = updatingAppointmentId === "bulk-upcoming";

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
          <Calendar
            className="w-4 h-4 shrink-0 cursor-pointer"
            style={{ color: DASHBOARD_THEME.primary }}
            onClick={() => dateInputRef.current?.showPicker()}
          />
          <input
            ref={dateInputRef}
            type="date"
            value={selectedDate}
            onChange={(e) => onSelectedDateChange(e.target.value)}
            className="text-sm font-medium bg-transparent focus:outline-none cursor-pointer hide-picker-icon"
            style={{ color: DASHBOARD_THEME.text }}
          />
        </label>
      </div>

      <div className="space-y-8">
        {offersHomeService && pendingAppointments.length > 0 && (
          <div>
            <div className="flex flex-wrap items-center justify-between gap-3 mb-4">
              <h3 className="text-lg font-semibold" style={{ color: DASHBOARD_THEME.text }}>
                Pending Home Visits
                <span className="ml-2 text-sm font-normal" style={{ color: DASHBOARD_THEME.muted }}>
                  ({pendingAppointments.length})
                </span>
              </h3>
              {cancellablePending.length > 1 && onCancelAllPending && (
                <button
                  type="button"
                  disabled={isBulkHome || isBulkUpcoming}
                  onClick={onCancelAllPending}
                  className="px-3 py-1.5 text-sm font-medium rounded-lg text-white disabled:opacity-50"
                  style={{ backgroundColor: DASHBOARD_THEME.danger }}
                >
                  {isBulkHome ? "Cancelling..." : "Cancel All Home"}
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
                  onCancel={onCancel}
                  onComplete={onComplete}
                  onNoShow={onNoShow}
                  onGoToHomeService={onGoToHomeService}
                  isUpdating={updatingAppointmentId === appointment.id}
                />
              ))}
            </div>
          </div>
        )}

        <div>
          <div className="flex flex-wrap items-center justify-between gap-3 mb-4">
            <h3 className="text-lg font-semibold" style={{ color: DASHBOARD_THEME.text }}>
              Upcoming
              <span className="ml-2 text-sm font-normal" style={{ color: DASHBOARD_THEME.muted }}>
                ({filteredUpcoming.length})
              </span>
            </h3>
            {cancellableUpcoming.length > 1 && onCancelAllUpcoming && (
              <button
                type="button"
                disabled={isBulkHome || isBulkUpcoming}
                onClick={() => onCancelAllUpcoming(selectedDate)}
                className="px-3 py-1.5 text-sm font-medium rounded-lg text-white disabled:opacity-50"
                style={{ backgroundColor: DASHBOARD_THEME.danger }}
              >
                {isBulkUpcoming ? "Cancelling..." : "Cancel All"}
              </button>
            )}
          </div>
          <div className="space-y-3">
            {filteredUpcoming.length > 0 ? (
              filteredUpcoming.map((appointment) => (
                <AppointmentRow
                  key={appointment.id}
                  appointment={appointment}
                  offersHomeService={offersHomeService}
                  onCancel={onCancel}
                  onComplete={onComplete}
                  onNoShow={onNoShow}
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

        <div>
          <h3 className="text-lg font-semibold mb-4" style={{ color: DASHBOARD_THEME.text }}>
            No Show
            <span className="ml-2 text-sm font-normal" style={{ color: DASHBOARD_THEME.muted }}>
              ({filteredNoShow.length})
            </span>
          </h3>
          <div className="space-y-3">
            {filteredNoShow.length > 0 ? (
              filteredNoShow.map((appointment) => (
                <AppointmentRow key={appointment.id} appointment={appointment} />
              ))
            ) : (
              <p
                className="text-sm py-4 text-center rounded-lg"
                style={{ color: DASHBOARD_THEME.muted, backgroundColor: "#f9fafb" }}
              >
                No no-show appointments for this day.
              </p>
            )}
          </div>
        </div>

        {offersHomeService && (
        <MissedAppointmentsPanel
          count={overdueAppointments.length}
          title="Missed Home Visits"
          description="Home visits that passed without confirmation or completion."
        >
          {overdueAppointments.map((appointment) => (
            <AppointmentRow
              key={appointment.id}
              appointment={appointment}
              showDate
              offersHomeService={offersHomeService}
            />
          ))}
        </MissedAppointmentsPanel>
        )}
      </div>
    </div>
  );
}
