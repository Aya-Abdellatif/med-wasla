import type { Appointment, DashboardStat } from "./dashboardTypes";
import { AppointmentRow } from "./AppointmentRow";

interface OverviewTabProps {
  stats: DashboardStat[];
  todayUpcoming: Appointment[];
  onViewAllSchedule: () => void;
}

export function OverviewTab({ stats, todayUpcoming, onViewAllSchedule }: OverviewTabProps) {
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
                  <p className="text-sm mb-1" style={{ color: "#6b7280" }}>{stat.label}</p>
                  <p className="text-3xl font-bold" style={{ color: "#111827" }}>{stat.value}</p>
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
        <div className="flex items-center justify-between mb-6">
          <h2 className="text-xl font-bold" style={{ color: "#111827" }}>Today's Schedule</h2>
          <button
            onClick={onViewAllSchedule}
            className="text-sm font-medium text-teal-600 hover:text-teal-700 hover:underline transition-colors"
          >
            View All
          </button>
        </div>
        <div className="space-y-4">
          {todayUpcoming.length > 0 ? (
            todayUpcoming.map((appointment) => (
              <AppointmentRow key={appointment.id} appointment={appointment} />
            ))
          ) : (
            <p className="text-sm text-center py-6" style={{ color: "#6b7280" }}>
              No upcoming appointments for today.
            </p>
          )}
        </div>
      </div>
    </div>
  );
}
