import type { Appointment, DashboardStat } from "./dashboardTypes";
import { DASHBOARD_THEME } from "./dashboardUtils";
import { AppointmentRow } from "./AppointmentRow";

interface OverviewTabProps {
  stats: DashboardStat[];
  pendingAppointments: Appointment[];
  todayUpcoming: Appointment[];
  offersHomeService: boolean;
  onViewAllSchedule: () => void;
  onConfirm?: (appointmentId: string) => void;
  onCancel?: (appointmentId: string) => void;
  onCancelAllPending?: () => void;
  onComplete?: (appointmentId: string) => void;
  onGoToHomeService?: () => void;
  updatingAppointmentId?: string | null;
  loading?: boolean;
}

export function OverviewTab({
  stats,
  pendingAppointments,
  todayUpcoming,
  offersHomeService,
  onViewAllSchedule,
  onConfirm,
  onCancel,
  onCancelAllPending,
  onComplete,
  onGoToHomeService,
  updatingAppointmentId,
  loading = false,
}: OverviewTabProps) {
  const cancellablePending = pendingAppointments.filter(
    (a) => a.backendStatus === "pending" && a.visitType === "clinic",
  );

  return (
    <div className="space-y-8">
      <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-4 gap-6">
        {stats.map((stat, index) => {
          const Icon = stat.icon;
          return (
            <div
              key={index}
              className="bg-white rounded-xl p-6 transition-shadow duration-300 hover:shadow-md"
              style={{ boxShadow: "0 1px 3px rgba(0,0,0,0.1)" }}
            >
              <div className="flex items-center justify-between">
                <div>
                  <p className="text-sm mb-1" style={{ color: DASHBOARD_THEME.muted }}>
                    {stat.label}
                  </p>
                  <p className="text-3xl font-bold" style={{ color: DASHBOARD_THEME.text }}>
                    {stat.value}
                  </p>
                </div>
                <div
                  className="w-12 h-12 rounded-lg flex items-center justify-center"
                  style={{ backgroundColor: stat.bgColor }}
                >
                  <Icon className="w-6 h-6" style={{ color: stat.iconColor }} />
                </div>
              </div>
            </div>
          );
        })}
      </div>

      <div className="bg-white rounded-xl p-6" style={{ boxShadow: "0 1px 3px rgba(0,0,0,0.1)" }}>
        <div className="flex flex-wrap items-center justify-between gap-3 mb-6">
          <h2 className="text-xl font-bold" style={{ color: DASHBOARD_THEME.text }}>
            Pending Booking Requests
          </h2>
          {cancellablePending.length > 1 && onCancelAllPending && (
            <button
              type="button"
              disabled={loading || updatingAppointmentId === "bulk"}
              onClick={onCancelAllPending}
              className="px-4 py-2 text-sm font-medium rounded-lg text-white disabled:opacity-50"
              style={{ backgroundColor: DASHBOARD_THEME.danger }}
            >
              {updatingAppointmentId === "bulk" ? "Cancelling..." : "Cancel All Clinic Requests"}
            </button>
          )}
        </div>
        <div className="space-y-4">
          {loading ? (
            <p className="text-sm text-center py-6" style={{ color: DASHBOARD_THEME.muted }}>
              Loading appointments...
            </p>
          ) : pendingAppointments.length > 0 ? (
            pendingAppointments.map((appointment) => (
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
            ))
          ) : (
            <p className="text-sm text-center py-6" style={{ color: DASHBOARD_THEME.muted }}>
              No pending booking requests.
            </p>
          )}
        </div>
      </div>

      <div className="bg-white rounded-xl p-6" style={{ boxShadow: "0 1px 3px rgba(0,0,0,0.1)" }}>
        <div className="flex items-center justify-between mb-6">
          <h2 className="text-xl font-bold" style={{ color: DASHBOARD_THEME.text }}>
            Today&apos;s Schedule
          </h2>
          <button
            onClick={onViewAllSchedule}
            className="text-sm font-medium hover:underline transition-colors"
            style={{ color: DASHBOARD_THEME.primary }}
          >
            View All
          </button>
        </div>
        <div className="space-y-4">
          {loading ? (
            <p className="text-sm text-center py-6" style={{ color: DASHBOARD_THEME.muted }}>
              Loading appointments...
            </p>
          ) : todayUpcoming.length > 0 ? (
            todayUpcoming.map((appointment) => (
              <AppointmentRow
                key={appointment.id}
                appointment={appointment}
                offersHomeService={offersHomeService}
                onComplete={onComplete}
                onGoToHomeService={onGoToHomeService}
                isUpdating={updatingAppointmentId === appointment.id}
              />
            ))
          ) : (
            <p className="text-sm text-center py-6" style={{ color: DASHBOARD_THEME.muted }}>
              No confirmed appointments for today.
            </p>
          )}
        </div>
      </div>
    </div>
  );
}
