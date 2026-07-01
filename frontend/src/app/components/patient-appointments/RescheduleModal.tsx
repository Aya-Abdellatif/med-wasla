import { useState, useEffect } from "react";
import { X, RefreshCw, Loader2 } from "lucide-react";
import type { Appointment } from "./AppointmentTypes";
import { ImageWithFallback } from "../../figma/ImageWithFallback";
import { fetchAvailableSlots } from "../../../services/appointmentsApi";
import {
  describeEmptySlotsMessage,
  emptySlotsTimeLabel,
  formatSlotLabel,
  getLocalDateString,
} from "../../../utils/appointmentReschedule";
import { showError } from "../../../utils/toast";

function formatDate(dateStr: string) {
    const d = new Date(dateStr);
    return d.toLocaleDateString("en-US", { weekday: "short", month: "short", day: "numeric", year: "numeric" });
}

export function RescheduleModal({
  appointment,
  onClose,
  onConfirm,
}: {
  appointment: Appointment;
  onClose: () => void;
  onConfirm: (date: string, time: string) => Promise<void>;
}) {
    const [date, setDate] = useState("");
    const [time, setTime] = useState("");
    const [submitted, setSubmitted] = useState(false);
    const [submitting, setSubmitting] = useState(false);
    const [loadingSlots, setLoadingSlots] = useState(false);
    const [availableTimes, setAvailableTimes] = useState<string[]>([]);
    const [workingHours, setWorkingHours] = useState<{ start: string; end: string } | null>(null);
    const [dateError, setDateError] = useState("");

    const isHomeVisit = appointment.type === "home";

    useEffect(() => {
        if (isHomeVisit) return;
        if (!date) return;

        let cancelled = false;

        const timer = window.setTimeout(() => {
            setLoadingSlots(true);

            fetchAvailableSlots(appointment.specialistId, date)
                .then((result) => {
                    if (cancelled) return;
                    setAvailableTimes(result.availableSlots);
                    setWorkingHours(result.workingHours);
                    setTime((prev) => (result.availableSlots.includes(prev) ? prev : ""));
                    setDateError(
                      result.availableSlots.length === 0
                        ? describeEmptySlotsMessage(date, result.workingHours)
                        : "",
                    );
                })
                .catch((err) => {
                    if (cancelled) return;
                    setAvailableTimes([]);
                    setWorkingHours(null);
                    setDateError("");
                    setTime("");
                    showError(err instanceof Error ? err.message : "Failed to load available times");
                })
                .finally(() => {
                    if (!cancelled) setLoadingSlots(false);
                });
        }, 0);

        return () => {
            cancelled = true;
            window.clearTimeout(timer);
        };
    }, [isHomeVisit, appointment.specialistId, date]);

    const handleConfirm = async () => {
      if (!date || !time || submitting) return;

      setSubmitting(true);
      try {
        await onConfirm(date, time);
        setSubmitted(true);
      } catch {
        // Parent handles error toast.
      } finally {
        setSubmitting(false);
      }
    };

    if (submitted) {
        return (
            <div className="fixed inset-0 z-50 flex items-center justify-center bg-black/50 p-4">
                <div className="bg-white rounded-2xl shadow-2xl p-8 max-w-md w-full text-center">
                    <div className="w-16 h-16 bg-blue-100 rounded-full flex items-center justify-center mx-auto mb-4">
                        <RefreshCw className="w-8 h-8 text-blue-600" />
                    </div>
                    <h3 className="text-xl font-bold text-foreground mb-2">Appointment Rescheduled!</h3>
                    <p className="text-muted-foreground mb-6">
                        Your appointment has been successfully rescheduled to {formatDate(date)} at {isHomeVisit ? time : formatSlotLabel(time)}.
                    </p>
                    <button onClick={onClose} className="bg-primary text-white px-6 py-2.5 rounded-xl hover:bg-primary/90 transition-colors">Done</button>
                </div>
            </div>
        );
    }

    return (
        <div className="fixed inset-0 z-50 flex items-center justify-center bg-black/50 p-4">
            <div className="bg-white rounded-2xl shadow-2xl p-6 max-w-md w-full">
                <div className="flex items-center justify-between mb-5">
                    <h3 className="text-lg font-bold text-foreground">Reschedule Appointment</h3>
                    <button onClick={onClose} className="w-8 h-8 flex items-center justify-center rounded-full hover:bg-muted transition-colors">
                        <X className="w-4 h-4" />
                    </button>
                </div>
                <div className="flex items-center gap-3 p-3 bg-muted/30 rounded-xl mb-5">
                    <ImageWithFallback src={appointment.doctor.photo} alt={appointment.doctor.name} className="w-12 h-12 rounded-full object-cover" />
                    <div>
                        <p className="font-semibold text-foreground">{appointment.doctor.name}</p>
                        <p className="text-sm text-muted-foreground">Current: {formatDate(appointment.date)} at {appointment.time}</p>
                    </div>
                </div>

                {isHomeVisit && (
                  <div className="mb-4 p-3 rounded-xl border border-amber-200 bg-amber-50 text-sm text-amber-800">
                    Choose any future date and time. Your request will be sent for re-approval.
                  </div>
                )}

                <div className="space-y-4 mb-5">
                    <div>
                        <label className="block text-sm text-foreground mb-1.5">New Date</label>
                        <input
                            type="date"
                            value={date}
                            onChange={(e) => {
                                const nextDate = e.target.value;
                                setDate(nextDate);
                                if (!isHomeVisit) {
                                  setTime("");
                                  setDateError("");
                                  if (!nextDate) {
                                    setAvailableTimes([]);
                                    setWorkingHours(null);
                                  }
                                }
                            }}
                            min={getLocalDateString()}
                            disabled={submitting}
                            className="w-full px-4 py-3 bg-input-background border border-border rounded-xl focus:outline-none focus:ring-2 focus:ring-primary disabled:opacity-50"
                        />
                        {dateError && (
                          <p className="mt-2 text-sm text-red-500">{dateError}</p>
                        )}
                    </div>
                    <div>
                        <label className="block text-sm text-foreground mb-1.5">
                          {isHomeVisit ? "Preferred Time" : "New Time"}
                        </label>
                        {isHomeVisit ? (
                          <input
                            type="time"
                            value={time}
                            onChange={(e) => setTime(e.target.value)}
                            disabled={submitting || !date}
                            className="w-full px-4 py-3 bg-input-background border border-border rounded-xl focus:outline-none focus:ring-2 focus:ring-primary disabled:opacity-50"
                          />
                        ) : (
                          <select
                            value={time}
                            onChange={(e) => setTime(e.target.value)}
                            disabled={submitting || !date || loadingSlots || availableTimes.length === 0}
                            className="w-full px-4 py-3 bg-input-background border border-border rounded-xl focus:outline-none focus:ring-2 focus:ring-primary disabled:opacity-50"
                          >
                            <option value="">
                                {loadingSlots
                                    ? "Loading times..."
                                    : !date
                                      ? "Select a date first"
                                      : availableTimes.length === 0
                                        ? emptySlotsTimeLabel(date, workingHours)
                                        : "Select a time"}
                            </option>
                            {availableTimes.map((slot) => (
                                <option key={slot} value={slot}>
                                    {formatSlotLabel(slot)}
                                </option>
                            ))}
                          </select>
                        )}
                    </div>
                </div>
                <button
                    onClick={handleConfirm}
                    disabled={!date || !time || submitting || (!isHomeVisit && loadingSlots)}
                    className="w-full bg-primary text-white py-2.5 rounded-xl hover:bg-primary/90 transition-colors disabled:opacity-50 disabled:cursor-not-allowed flex items-center justify-center gap-2"
                >
                    {submitting ? (
                      <>
                        <Loader2 className="w-4 h-4 animate-spin" />
                        Rescheduling...
                      </>
                    ) : (
                      "Confirm Reschedule"
                    )}
                </button>
            </div>
        </div>
    );
}
