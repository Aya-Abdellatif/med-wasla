import { Calendar } from "lucide-react";
import type { Appointment } from "./dashboardTypes";
import { formatDateLabel } from "./dashboardUtils";
import { AppointmentRow } from "./AppointmentRow";

interface ScheduleTabProps {
  selectedDate: string;
  onSelectedDateChange: (date: string) => void;
  filteredUpcoming: Appointment[];
  filteredCompleted: Appointment[];
}

export function ScheduleTab({
  selectedDate,
  onSelectedDateChange,
  filteredUpcoming,
  filteredCompleted,
}: ScheduleTabProps) {
  return (
    <div className="bg-white rounded-xl p-6" style={{ boxShadow: "0 1px 3px rgba(0,0,0,0.1)" }}>
      <div className="flex flex-wrap items-center justify-between gap-4 mb-6">
        <h2 className="text-xl font-bold" style={{ color: "#111827" }}>Appointments</h2>
        <label className="flex items-center gap-2 px-3 py-2 border rounded-lg bg-gray-50 cursor-pointer hover:border-teal-300 transition-colors">
          <Calendar className="w-4 h-4 text-teal-600 shrink-0" />
          <input
            type="date"
            value={selectedDate}
            onChange={(e) => onSelectedDateChange(e.target.value)}
            className="text-sm font-medium bg-transparent focus:outline-none cursor-pointer"
            style={{ color: "#111827" }}
          />
        </label>
      </div>

      <p className="text-sm mb-6" style={{ color: "#6b7280" }}>
        {formatDateLabel(selectedDate)}
      </p>

      <div className="space-y-8">
        <div>
          <h3 className="text-lg font-semibold mb-4" style={{ color: "#111827" }}>
            Upcoming
            <span className="ml-2 text-sm font-normal" style={{ color: "#6b7280" }}>
              ({filteredUpcoming.length})
            </span>
          </h3>
          <div className="space-y-3">
            {filteredUpcoming.length > 0 ? (
              filteredUpcoming.map((appointment) => (
                <AppointmentRow key={appointment.id} appointment={appointment} />
              ))
            ) : (
              <p
                className="text-sm py-4 text-center rounded-lg"
                style={{ color: "#6b7280", backgroundColor: "#f9fafb" }}
              >
                No upcoming appointments for this day.
              </p>
            )}
          </div>
        </div>

        <div>
          <h3 className="text-lg font-semibold mb-4" style={{ color: "#111827" }}>
            Completed
            <span className="ml-2 text-sm font-normal" style={{ color: "#6b7280" }}>
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
                style={{ color: "#6b7280", backgroundColor: "#f9fafb" }}
              >
                No completed appointments for this day.
              </p>
            )}
          </div>
        </div>
      </div>
    </div>
  );
}
