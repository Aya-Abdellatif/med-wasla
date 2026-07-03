import { useState, useEffect, useMemo, useCallback, useRef } from "react";
import { useNavigate } from "react-router";
import { useTranslation } from "react-i18next";
import { X, Calendar, Clock, MapPin, AlertCircle, Loader2, Home, Stethoscope } from "lucide-react";
import { showSuccess, showWarning, showError } from "../../../utils/toast";
import { bookAppointment, fetchAvailableSlots } from "../../../services/appointmentsApi";
import {
  describeEmptySlotsMessage,
  emptySlotsTimeLabel,
  formatSlotLabel,
  getEarliestBookableDate,
  getLocalDateString,
  getLocalDayNameFromDateStr,
} from "../../../utils/appointmentReschedule";
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
  homeVisit?: boolean;
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

function isWorkingDay(dateStr: string, availableSlots: AvailableSlot[]) {
  if (!dateStr || availableSlots.length === 0) return false;
  const dayName = getLocalDayNameFromDateStr(dateStr);
  return availableSlots.some((slot) => slot.day === dayName);
}

export function BookingModal({ isOpen, onClose, provider, serviceType }: BookingModalProps) {
  const { t } = useTranslation("booking");
  const navigate = useNavigate();
  const { user } = useAuth();
  const [formData, setFormData] = useState(initialFormData);
  const [visitType, setVisitType] = useState<"clinic" | "home">("clinic");

  const [errors, setErrors] = useState<Record<string, string>>({});
  const [isSubmitting, setIsSubmitting] = useState(false);
  const dateInputRef = useRef<HTMLInputElement>(null);
  const timeInputRef = useRef<HTMLInputElement>(null);
  const [loadingSlots, setLoadingSlots] = useState(false);
  const [availableTimes, setAvailableTimes] = useState<string[]>([]);
  const [workingHours, setWorkingHours] = useState<{ start: string; end: string } | null>(
    null,
  );

  const isNurseBooking = serviceType === "nurse";
  const doctorOffersHome = serviceType === "doctor" && provider?.homeVisit === true;
  const requiresAddress = isNurseBooking || visitType === "home";
  const isHomeVisit = isNurseBooking || visitType === "home";

  const translateDay = useCallback(
    (day: string) => t(`days.${day}`, { defaultValue: day }),
    [t],
  );

  const specialistSlots = useMemo(
    () => provider?.availableSlots ?? [],
    [provider?.availableSlots],
  );

  const minBookableDate = useMemo(
    () => isHomeVisit ? getLocalDateString() : getEarliestBookableDate(specialistSlots),
    [isHomeVisit, specialistSlots],
  );

  const resetForm = useCallback(() => {
    setFormData(initialFormData);
    setVisitType(isNurseBooking ? "home" : "clinic");
    setErrors({});
    setAvailableTimes([]);
    setWorkingHours(null);
    setLoadingSlots(false);
  }, [isNurseBooking]);

  const handleClose = useCallback(() => {
    resetForm();
    onClose();
  }, [onClose, resetForm]);

  useEffect(() => {
    if (isHomeVisit) return;
    if (!isOpen || !provider?.id || !formData.date) return;
    if (!isWorkingDay(formData.date, specialistSlots)) return;

    let cancelled = false;

    // eslint-disable-next-line react-hooks/set-state-in-effect
    setLoadingSlots(true);

    fetchAvailableSlots(provider.id, formData.date)
      .then((result) => {
        if (cancelled) return;
        setAvailableTimes(result.availableSlots);
        setWorkingHours(result.workingHours);
        setFormData((prev) => ({
          ...prev,
          time: result.availableSlots.includes(prev.time) ? prev.time : "",
        }));

        if (result.availableSlots.length === 0) {
          setErrors((prev) => ({
            ...prev,
            date: describeEmptySlotsMessage(formData.date, result.workingHours),
            time: "",
          }));
        }
      })
      .catch((err) => {
        if (cancelled) return;
        setAvailableTimes([]);
        setWorkingHours(null);
        showError(err instanceof Error ? err.message : t("modal.loadSlotsFailed"));
      })
      .finally(() => {
        if (!cancelled) setLoadingSlots(false);
      });

    return () => {
      cancelled = true;
    };
  }, [isHomeVisit, isOpen, provider?.id, formData.date, specialistSlots, t]);

  const validateForm = () => {
    const newErrors: Record<string, string> = {};

    if (!formData.date) {
      newErrors.date = t("modal.validation.dateRequired");
    } else if (!isHomeVisit && !isWorkingDay(formData.date, specialistSlots)) {
      newErrors.date = t("modal.validation.dateUnavailable");
    } else if (!isHomeVisit && !loadingSlots && availableTimes.length === 0) {
      newErrors.date = describeEmptySlotsMessage(formData.date, workingHours);
    }

    if (!formData.time) newErrors.time = t("modal.validation.timeRequired");

    if (requiresAddress && !formData.address.trim()) {
      newErrors.address = t("modal.validation.addressRequired");
    }

    setErrors(newErrors);
    return Object.keys(newErrors).length === 0;
  };

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();

    if (!validateForm()) {
      showWarning(t("modal.fillRequiredFields"));
      return;
    }

    if (!user || user.role !== "patient") {
      showWarning(t("modal.signInAsPatient"));
      navigate("/");
      return;
    }

    if (!provider?.id) {
      showError(t("modal.missingSpecialist"));
      return;
    }

    setIsSubmitting(true);

    const bookingType = isNurseBooking ? "home" : visitType;

    try {
      await bookAppointment({
        specialistId: provider.id,
        date: formData.date,
        time: formData.time,
        type: bookingType,
        address: bookingType === "home" ? formData.address : undefined,
        notes: formData.reason,
      });

      showSuccess(
        bookingType === "home" ? t("modal.successHome") : t("modal.successClinic"),
      );
      handleClose();
    } catch (err) {
      const message = err instanceof Error ? err.message : t("modal.bookFailed");
      if (message.toLowerCase().includes("already have an appointment")) {
        showWarning(t("modal.alreadyBooked"));
      } else {
        showError(message);
      }
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

  const handleVisitTypeChange = (nextType: "clinic" | "home") => {
    setVisitType(nextType);
    if (nextType === "clinic") {
      setFormData((prev) => ({ ...prev, address: "" }));
      if (errors.address) {
        setErrors((prev) => {
          const newErrors = { ...prev };
          delete newErrors.address;
          return newErrors;
        });
      }
    }
  };

  if (!isOpen) return null;

  const workingDaysText =
    specialistSlots.length > 0
      ? specialistSlots
          .map(
            (slot) =>
              `${translateDay(slot.day)} (${formatSlotLabel(slot.startTime)}-${formatSlotLabel(slot.endTime)})`,
          )
          .join(t("modal.listSeparator"))
      : t("modal.noSchedule");

  return (
    <div className="fixed inset-0 z-50 flex items-center justify-center p-4 bg-black/50">
      <div className="bg-white rounded-2xl shadow-2xl max-w-2xl w-full max-h-[90vh] overflow-y-auto">
        <div className="sticky top-0 z-10 bg-white border-b border-border px-6 py-4 flex items-center justify-between">
          <div>
            <h2 className="text-2xl font-bold text-fg">
              {isNurseBooking ? t("modal.requestHomeService") : t("modal.bookAppointment")}
            </h2>
          </div>
          <button onClick={handleClose} className="p-2 hover:bg-muted rounded-lg transition-colors">
            <X className="w-5 h-5" />
          </button>
        </div>

        <form onSubmit={handleSubmit} className="p-6 space-y-6">
          {isHomeVisit ? (
            <div className="rounded-lg border border-amber-200 bg-amber-50 p-4 text-sm text-amber-900">
              <p className="font-medium mb-1">{t("modal.openSchedulingTitle")}</p>
              <p className="text-amber-700">{t("modal.openSchedulingDesc")}</p>
            </div>
          ) : (
            <div className="rounded-lg border border-primary/20 bg-primary/5 p-4 text-sm text-fg">
              <p className="font-medium mb-1">{t("modal.availability")}</p>
              <p className="text-fg-muted">{workingDaysText}</p>
            </div>
          )}

          {doctorOffersHome && (
            <div>
              <p className="block mb-2 font-medium text-fg">{t("modal.visitType")} *</p>
              <div className="grid grid-cols-2 gap-3">
                <button
                  type="button"
                  onClick={() => handleVisitTypeChange("clinic")}
                  className={`flex items-center justify-center gap-2 px-4 py-3 rounded-lg border transition-colors ${
                    visitType === "clinic"
                      ? "border-primary bg-primary/5 text-primary"
                      : "border-border hover:bg-muted/50"
                  }`}
                >
                  <Stethoscope className="w-4 h-4" />
                  {t("modal.clinicVisit")}
                </button>
                <button
                  type="button"
                  onClick={() => handleVisitTypeChange("home")}
                  className={`flex items-center justify-center gap-2 px-4 py-3 rounded-lg border transition-colors ${
                    visitType === "home"
                      ? "border-teal-600 bg-teal-50 text-teal-700"
                      : "border-border hover:bg-muted/50"
                  }`}
                >
                  <Home className="w-4 h-4" />
                  {t("modal.homeVisit")}
                </button>
              </div>
            </div>
          )}

          {requiresAddress && (
            <div>
              <label htmlFor="address" className="block mb-2 font-medium text-fg">
                {t("modal.address")} *
              </label>
              <div className="relative">
                <MapPin className="absolute start-4 top-4 w-5 h-5 text-fg-muted" />
                <textarea
                  id="address"
                  value={formData.address}
                  onChange={(e) => handleChange("address", e.target.value)}
                  placeholder={t("modal.addressPlaceholder")}
                  rows={3}
                  className={`w-full ps-12 pe-4 py-3 border rounded-lg focus:outline-none focus:ring-2 transition-colors resize-none ${
                    errors.address
                      ? "border-red-500 focus:ring-red-500"
                      : "border-border focus:ring-primary"
                  }`}
                />
              </div>
              {errors.address && (
                <div className="flex items-center gap-2 mt-2 text-red-500 text-sm">
                  <AlertCircle className="w-4 h-4" />
                  <span>{errors.address}</span>
                </div>
              )}
            </div>
          )}

          <div className="grid grid-cols-1 sm:grid-cols-2 gap-4">
            <div>
              <label htmlFor="date" className="block mb-2 font-medium text-fg">
                {t("modal.date")} *
              </label>
              <div className="relative">
                <Calendar
                  className="absolute start-4 top-1/2 -translate-y-1/2 w-5 h-5 text-fg-muted cursor-pointer"
                  onClick={() => dateInputRef.current?.showPicker()}
                />
                <input
                  ref={dateInputRef}
                  id="date"
                  type="date"
                  value={formData.date}
                  onChange={(e) => handleDateChange(e.target.value)}
                  min={minBookableDate}
                  className={`w-full ps-12 pe-4 py-3 border rounded-lg focus:outline-none focus:ring-2 transition-colors [&::-webkit-calendar-picker-indicator]:hidden ${
                    errors.date
                      ? "border-red-500 focus:ring-red-500"
                      : "border-border focus:ring-primary"
                  }`}
                />
              </div>
              {errors.date && (
                <div className="flex items-center gap-2 mt-2 text-red-500 text-sm">
                  <AlertCircle className="w-4 h-4" />
                  <span>{errors.date}</span>
                </div>
              )}
            </div>

            <div>
              <label htmlFor="time" className="block mb-2 font-medium text-fg">
                {isHomeVisit ? t("modal.preferredTime") : t("modal.availableTime")} *
              </label>
              <div className="relative">
                <Clock
                  className={`absolute start-4 top-1/2 -translate-y-1/2 w-5 h-5 text-fg-muted z-10 ${
                    isHomeVisit ? "cursor-pointer" : ""
                  }`}
                  onClick={() => isHomeVisit && timeInputRef.current?.showPicker()}
                />
                {isHomeVisit ? (
                  <input
                    ref={timeInputRef}
                    id="time"
                    type="time"
                    value={formData.time}
                    onChange={(e) => handleChange("time", e.target.value)}
                    disabled={!formData.date}
                    className={`w-full ps-12 pe-4 py-3 border rounded-lg focus:outline-none focus:ring-2 transition-colors [&::-webkit-calendar-picker-indicator]:hidden ${
                      errors.time
                        ? "border-red-500 focus:ring-red-500"
                        : "border-border focus:ring-primary"
                    } disabled:opacity-50`}
                  />
                ) : (
                  <select
                    id="time"
                    value={formData.time}
                    onChange={(e) => handleChange("time", e.target.value)}
                    disabled={!formData.date || loadingSlots || availableTimes.length === 0}
                    className={`w-full ps-12 pe-4 py-3 border rounded-lg focus:outline-none focus:ring-2 transition-colors appearance-none ${
                      errors.time
                        ? "border-red-500 focus:ring-red-500"
                        : "border-border focus:ring-primary"
                    } disabled:opacity-50`}
                  >
                    <option value="">
                      {loadingSlots
                        ? t("modal.loadingTimes")
                        : !formData.date
                          ? t("modal.selectDateFirst")
                          : availableTimes.length === 0
                            ? emptySlotsTimeLabel(formData.date, workingHours)
                            : t("modal.selectTime")}
                    </option>
                    {availableTimes.map((slot) => (
                      <option key={slot} value={slot}>
                        {formatSlotLabel(slot)}
                      </option>
                    ))}
                  </select>
                )}
              </div>
              {!isHomeVisit && workingHours && (
                <p className="text-xs text-fg-muted mt-2">
                  {t("modal.workingHours", {
                    start: formatSlotLabel(workingHours.start),
                    end: formatSlotLabel(workingHours.end),
                  })}
                </p>
              )}
              {errors.time && (
                <div className="flex items-center gap-2 mt-2 text-red-500 text-sm">
                  <AlertCircle className="w-4 h-4" />
                  <span>{errors.time}</span>
                </div>
              )}
            </div>
          </div>

          <div>
            <label htmlFor="reason" className="block mb-2 font-medium text-fg">
              {t("modal.reason")}
            </label>
            <textarea
              id="reason"
              value={formData.reason}
              onChange={(e) => handleChange("reason", e.target.value)}
              placeholder={t("modal.reasonPlaceholder")}
              rows={4}
              className={`w-full px-4 py-3 border rounded-lg focus:outline-none focus:ring-2 transition-colors resize-none ${
                errors.reason
                  ? "border-red-500 focus:ring-red-500"
                  : "border-border focus:ring-primary"
              }`}
            />
            {errors.reason && (
              <div className="flex items-center gap-2 mt-2 text-red-500 text-sm">
                <AlertCircle className="w-4 h-4" />
                <span>{errors.reason}</span>
              </div>
            )}
          </div>

          {provider && (
            <div className="bg-muted/50 rounded-lg p-4 border border-border">
              <h3 className="font-semibold text-fg mb-2">
                {t("modal.providerDetails")}
              </h3>
              <div className="space-y-1 text-sm">
                <p className="text-fg">
                  <span className="font-medium">{t("modal.name")}</span> {provider.name}
                </p>
                <p className="text-fg">
                  <span className="font-medium">{t("modal.specialty")}</span>{" "}
                  {provider.specialty || provider.certification}
                </p>
                {provider.location && (
                  <p className="text-fg">
                    <span className="font-medium">{t("modal.location")}</span> {provider.location}
                  </p>
                )}
                {doctorOffersHome && (
                  <p className="text-fg">
                    <span className="font-medium">{t("modal.homeVisitsAvailable")}</span>{" "}
                    {t("modal.available")}
                  </p>
                )}
              </div>
            </div>
          )}

          <div className="flex gap-3 pt-4">
            <button
              type="button"
              onClick={handleClose}
              className="flex-1 px-6 py-3 border border-border rounded-lg hover:bg-muted transition-colors font-medium"
            >
              {t("modal.cancel")}
            </button>
            <button
              type="submit"
              disabled={isSubmitting || (!isHomeVisit && loadingSlots) || !formData.time}
              className="flex-1 px-6 py-3 bg-primary text-white rounded-lg hover:bg-primary/90 transition-colors disabled:opacity-50 disabled:cursor-not-allowed font-medium flex items-center justify-center gap-2"
            >
              {isSubmitting ? (
                <>
                  <Loader2 className="w-4 h-4 animate-spin" />
                  {t("modal.submitting")}
                </>
              ) : (
                t("modal.submit")
              )}
            </button>
          </div>
        </form>
      </div>
    </div>
  );
}