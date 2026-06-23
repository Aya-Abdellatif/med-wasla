import { useState, useEffect, useMemo, useCallback } from "react";
import { useNavigate } from "react-router";
import { X, Calendar, Clock, MapPin, AlertCircle, Loader2 } from "lucide-react";
import { showSuccess, showWarning, showError } from "../../../utils/toast";
import { bookAppointment, fetchAvailableSlots } from "../../../services/appointmentsApi";
import { formatSlotLabel } from "../../../utils/appointmentReschedule";
import { useAuth } from "../../context/useAuth";
interface AvailableSlot {
  day: string;
  startTime: string;
  endTime: string;
}

interface Provider {
  id?: string;
  name: string;
  specialty?: string;
  certification?: string;
  location?: string;
  availableSlots?: AvailableSlot[];
}

interface BookingModalProps {
  isOpen: boolean;
  onClose: () => void;
  provider?: Provider;
  serviceType?: "doctor" | "nurse";
}

const initialFormData = {
  date: "",
  time: "",
  reason: "",
  address: "",
};

function isWorkingDay(dateStr: string, availableSlots: AvailableSlot[]) {  if (!dateStr || availableSlots.length === 0) return false;
  const dayName = new Date(`${dateStr}T12:00:00`).toLocaleDateString("en-US", {
    weekday: "long",
  });
  return availableSlots.some((slot) => slot.day === dayName);
}

export function BookingModal({ isOpen, onClose, provider, serviceType }: BookingModalProps) {
  const navigate = useNavigate();
  const { user } = useAuth();
  const [formData, setFormData] = useState(initialFormData);

  const [errors, setErrors] = useState<Record<string, string>>({});
  const [isSubmitting, setIsSubmitting] = useState(false);
  const [loadingSlots, setLoadingSlots] = useState(false);
  const [availableTimes, setAvailableTimes] = useState<string[]>([]);
  const [workingHours, setWorkingHours] = useState<{ start: string; end: string } | null>(
    null,
  );

  const specialistSlots = useMemo(
    () => provider?.availableSlots ?? [],
    [provider?.availableSlots],
  );

  const resetForm = useCallback(() => {
    setFormData(initialFormData);
    setErrors({});
    setAvailableTimes([]);
    setWorkingHours(null);
    setLoadingSlots(false);
  }, []);

  const handleClose = useCallback(() => {
    resetForm();
    onClose();
  }, [onClose, resetForm]);

  useEffect(() => {
    if (!isOpen || !provider?.id || !formData.date) return;
    if (!isWorkingDay(formData.date, specialistSlots)) return;

    let cancelled = false;

    const timer = window.setTimeout(() => {
      setLoadingSlots(true);

      fetchAvailableSlots(provider.id!, formData.date)
        .then((result) => {
          if (cancelled) return;
          setAvailableTimes(result.availableSlots);
          setWorkingHours(result.workingHours);
          setFormData((prev) => ({
            ...prev,
            time: result.availableSlots.includes(prev.time) ? prev.time : "",
          }));
        })
        .catch((err) => {
          if (cancelled) return;
          setAvailableTimes([]);
          setWorkingHours(null);
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
  }, [isOpen, provider?.id, formData.date, specialistSlots]);
  const validateForm = () => {
    const newErrors: Record<string, string> = {};

    if (!formData.date) newErrors.date = "Date is required";
    else if (!isWorkingDay(formData.date, specialistSlots)) {
      newErrors.date = "Doctor is not available on this day";
    }

    if (!formData.time) newErrors.time = "Time is required";

    if (!formData.reason.trim()) newErrors.reason = "Reason for visit is required";

    if (serviceType === "nurse" && !formData.address.trim()) {
      newErrors.address = "Address is required for home service";
    }

    setErrors(newErrors);
    return Object.keys(newErrors).length === 0;
  };

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();

    if (!validateForm()) {
      showWarning("Please fill in all required fields");
      return;
    }

    if (!user || user.role !== "patient") {
      showWarning("Please sign in as a patient to book an appointment");
      navigate("/");
      return;
    }

    if (!provider?.id) {
      showError("Unable to book: specialist information is missing");
      return;
    }

    setIsSubmitting(true);

    try {
      await bookAppointment({
        specialistId: provider.id,
        date: formData.date,
        time: formData.time,
        type: serviceType === "nurse" ? "home" : "clinic",
        address: serviceType === "nurse" ? formData.address : undefined,
        notes: formData.reason,
      });

      showSuccess(
        `${serviceType === "nurse" ? "Home service" : "Appointment"} booked successfully! Check My Appointments to track it.`,
      );
      handleClose();
    } catch (err) {      showError(err instanceof Error ? err.message : "Failed to book appointment");
    } finally {
      setIsSubmitting(false);
    }
  };

  const handleChange = (field: string, value: string) => {
    setFormData((prev) => ({ ...prev, [field]: value }));
    if (errors[field]) {
      setErrors((prev) => {
        const newErrors = { ...prev };
        delete newErrors[field];
        return newErrors;
      });
    }
  };

  const handleDateChange = (nextDate: string) => {
    setFormData((prev) => ({ ...prev, date: nextDate, time: "" }));
    setAvailableTimes([]);
    setWorkingHours(null);

    if (errors.date || errors.time) {
      setErrors((prev) => {
        const newErrors = { ...prev };
        delete newErrors.date;
        delete newErrors.time;
        return newErrors;
      });
    }
  };
  if (!isOpen) return null;

  const workingDaysText =
    specialistSlots.length > 0
      ? specialistSlots.map((slot) => `${slot.day} (${slot.startTime}-${slot.endTime})`).join(", ")
      : "No schedule published yet";

  return (
    <div className="fixed inset-0 z-50 flex items-center justify-center p-4 bg-black/50">
      <div className="bg-white rounded-2xl shadow-2xl max-w-2xl w-full max-h-[90vh] overflow-y-auto">
        <div className="sticky top-0 bg-white border-b border-border px-6 py-4 flex items-center justify-between">
          <div>
            <h2 className="text-2xl font-bold text-foreground">
              {serviceType === "nurse" ? "Request Home Service" : "Book Appointment"}
            </h2>
            {provider && (
              <p className="text-sm text-muted-foreground mt-1">
                with {provider.name} - {provider.specialty || provider.certification}
              </p>
            )}
          </div>
          <button onClick={handleClose} className="p-2 hover:bg-muted rounded-lg transition-colors">            <X className="w-5 h-5" />
          </button>
        </div>

        <form onSubmit={handleSubmit} className="p-6 space-y-6">
          <div className="rounded-lg border border-primary/20 bg-primary/5 p-4 text-sm text-foreground">
            <p className="font-medium mb-1">Doctor availability</p>
            <p className="text-muted-foreground">{workingDaysText}</p>
          </div>

          {serviceType === "nurse" && (
            <div>
              <label htmlFor="address" className="block mb-2 font-medium text-foreground">
                Home Address *
              </label>
              <div className="relative">
                <MapPin className="absolute left-4 top-4 w-5 h-5 text-muted-foreground" />
                <textarea
                  id="address"
                  value={formData.address}
                  onChange={(e) => handleChange("address", e.target.value)}
                  placeholder="Enter your complete address"
                  rows={3}
                  className={`w-full pl-12 pr-4 py-3 border rounded-lg focus:outline-none focus:ring-2 transition-colors resize-none ${
                    errors.address
                      ? "border-red-500 focus:ring-red-500"
                      : "border-border focus:ring-primary"
                  }`}
                />
              </div>
              {errors.address && (
                <div className="flex items-center space-x-2 mt-2 text-red-500 text-sm">
                  <AlertCircle className="w-4 h-4" />
                  <span>{errors.address}</span>
                </div>
              )}
            </div>
          )}

          <div className="grid grid-cols-1 sm:grid-cols-2 gap-4">
            <div>
              <label htmlFor="date" className="block mb-2 font-medium text-foreground">
                Date *
              </label>
              <div className="relative">
                <Calendar className="absolute left-4 top-1/2 -translate-y-1/2 w-5 h-5 text-muted-foreground" />
                <input
                  id="date"
                  type="date"
                  value={formData.date}
                  onChange={(e) => handleDateChange(e.target.value)}                  min={new Date().toISOString().split("T")[0]}
                  className={`w-full pl-12 pr-4 py-3 border rounded-lg focus:outline-none focus:ring-2 transition-colors ${
                    errors.date
                      ? "border-red-500 focus:ring-red-500"
                      : "border-border focus:ring-primary"
                  }`}
                />
              </div>
              {errors.date && (
                <div className="flex items-center space-x-2 mt-2 text-red-500 text-sm">
                  <AlertCircle className="w-4 h-4" />
                  <span>{errors.date}</span>
                </div>
              )}
            </div>

            <div>
              <label htmlFor="time" className="block mb-2 font-medium text-foreground">
                Available Time *
              </label>
              <div className="relative">
                <Clock className="absolute left-4 top-1/2 -translate-y-1/2 w-5 h-5 text-muted-foreground z-10" />
                <select
                  id="time"
                  value={formData.time}
                  onChange={(e) => handleChange("time", e.target.value)}
                  disabled={!formData.date || loadingSlots || availableTimes.length === 0}
                  className={`w-full pl-12 pr-4 py-3 border rounded-lg focus:outline-none focus:ring-2 transition-colors appearance-none ${
                    errors.time
                      ? "border-red-500 focus:ring-red-500"
                      : "border-border focus:ring-primary"
                  } disabled:opacity-50`}
                >
                  <option value="">
                    {loadingSlots
                      ? "Loading times..."
                      : !formData.date
                        ? "Select a date first"
                        : availableTimes.length === 0
                          ? "No slots available"
                          : "Select a time"}
                  </option>
                  {availableTimes.map((slot) => (
                    <option key={slot} value={slot}>
                      {formatSlotLabel(slot)}
                    </option>
                  ))}
                </select>
              </div>
              {workingHours && (
                <p className="text-xs text-muted-foreground mt-2">
                  Working hours: {workingHours.start} - {workingHours.end}
                </p>
              )}
              {errors.time && (
                <div className="flex items-center space-x-2 mt-2 text-red-500 text-sm">
                  <AlertCircle className="w-4 h-4" />
                  <span>{errors.time}</span>
                </div>
              )}
            </div>
          </div>

          <div>
            <label htmlFor="reason" className="block mb-2 font-medium text-foreground">
              Reason for {serviceType === "nurse" ? "Service" : "Visit"} *
            </label>
            <textarea
              id="reason"
              value={formData.reason}
              onChange={(e) => handleChange("reason", e.target.value)}
              placeholder={`Describe the reason for your ${serviceType === "nurse" ? "home service request" : "appointment"}`}
              rows={4}
              className={`w-full px-4 py-3 border rounded-lg focus:outline-none focus:ring-2 transition-colors resize-none ${
                errors.reason
                  ? "border-red-500 focus:ring-red-500"
                  : "border-border focus:ring-primary"
              }`}
            />
            {errors.reason && (
              <div className="flex items-center space-x-2 mt-2 text-red-500 text-sm">
                <AlertCircle className="w-4 h-4" />
                <span>{errors.reason}</span>
              </div>
            )}
          </div>

          {provider && (
            <div className="bg-muted/50 rounded-lg p-4 border border-border">
              <h3 className="font-semibold text-foreground mb-2">
                {serviceType === "nurse" ? "Nurse" : "Doctor"} Details
              </h3>
              <div className="space-y-1 text-sm">
                <p className="text-foreground">
                  <span className="font-medium">Name:</span> {provider.name}
                </p>
                <p className="text-foreground">
                  <span className="font-medium">Specialty:</span>{" "}
                  {provider.specialty || provider.certification}
                </p>
                {provider.location && (
                  <p className="text-foreground">
                    <span className="font-medium">Location:</span> {provider.location}
                  </p>
                )}
              </div>
            </div>
          )}

          <div className="flex space-x-3 pt-4">
            <button
              type="button"
              onClick={handleClose}              className="flex-1 px-6 py-3 border border-border rounded-lg hover:bg-muted transition-colors font-medium"
            >
              Cancel
            </button>
            <button
              type="submit"
              disabled={isSubmitting || loadingSlots || !formData.time}
              className="flex-1 px-6 py-3 bg-primary text-white rounded-lg hover:bg-primary/90 transition-colors disabled:opacity-50 disabled:cursor-not-allowed font-medium flex items-center justify-center gap-2"
            >
              {isSubmitting ? (
                <>
                  <Loader2 className="w-4 h-4 animate-spin" />
                  Booking...
                </>
              ) : (
                "Book Appointment"
              )}
            </button>
          </div>
        </form>
      </div>
    </div>
  );
}
