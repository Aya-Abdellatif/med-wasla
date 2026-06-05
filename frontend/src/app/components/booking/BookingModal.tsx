import { useState } from "react";
import { X, Calendar, Clock, MapPin, AlertCircle } from "lucide-react";

interface Provider {
  name: string;
  specialty?: string;
  certification?: string;
  location?: string;
}

interface BookingModalProps {
  isOpen: boolean;
  onClose: () => void;
  provider?: Provider;
  serviceType?: "doctor" | "nurse";
}

export function BookingModal({ isOpen, onClose, provider, serviceType }: BookingModalProps) {
  const [formData, setFormData] = useState({
    //patientName: "",
    //email: "",
    //phone: "",
    date: "",
    time: "",
    reason: "",
    address: "", // Only for nurse/home service
  });

  const [errors, setErrors] = useState<Record<string, string>>({});
  const [isSubmitting, setIsSubmitting] = useState(false);

  const validateForm = () => {
    const newErrors: Record<string, string> = {};

    /*if (!formData.patientName.trim()) {
      newErrors.patientName = "Name is required";
    }*/

    /*if (!formData.email) {
      newErrors.email = "Email is required";
    } else if (!/^[^\s@]+@[^\s@]+\.[^\s@]+$/.test(formData.email)) {
      newErrors.email = "Please enter a valid email address";
    }*/

    /*if (!formData.phone) {
      newErrors.phone = "Phone number is required";
    }*/

    if (!formData.date) {
      newErrors.date = "Date is required";
    }

    if (!formData.time) {
      newErrors.time = "Time is required";
    }

    if (!formData.reason.trim()) {
      newErrors.reason = "Reason for visit is required";
    }

    if (serviceType === "nurse" && !formData.address.trim()) {
      newErrors.address = "Address is required for home service";
    }

    setErrors(newErrors);
    return Object.keys(newErrors).length === 0;
  };

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();

    if (!validateForm()) {
      return;
    }

    setIsSubmitting(true);

    // Simulate API call
    setTimeout(() => {
      console.log("Booking submitted:", {
        ...formData,
        provider: provider?.name,
        serviceType,
      });
      alert(
        `${serviceType === "nurse" ? "Home service" : "Appointment"} request submitted successfully! ${provider?.name} will contact you shortly.`
      );
      setIsSubmitting(false);
      onClose();
      // Reset form
      setFormData({
        //patientName: "",
        //email: "",
        //phone: "",
        date: "",
        time: "",
        reason: "",
        address: "",
      });
      setErrors({});
    }, 1500);
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

  if (!isOpen) return null;

  return (
    <div className="fixed inset-0 z-50 flex items-center justify-center p-4 bg-black/50">
      <div className="bg-white rounded-2xl shadow-2xl max-w-2xl w-full max-h-[90vh] overflow-y-auto">
        {/* Header */}
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
          <button
            onClick={onClose}
            className="p-2 hover:bg-muted rounded-lg transition-colors"
          >
            <X className="w-5 h-5" />
          </button>
        </div>

        {/* Form */}
        <form onSubmit={handleSubmit} className="p-6 space-y-6">
          {/* Patient Name */}
          {/*<div>
            <label htmlFor="patientName" className="block mb-2 font-medium text-foreground">
              Patient Name *
            </label>
            <div className="relative">
              <User className="absolute left-4 top-1/2 -translate-y-1/2 w-5 h-5 text-muted-foreground" />
              <input
                id="patientName"
                type="text"
                value={formData.patientName}
                onChange={(e) => handleChange("patientName", e.target.value)}
                placeholder="Enter your full name"
                className={`w-full pl-12 pr-4 py-3 border rounded-lg focus:outline-none focus:ring-2 transition-colors ${
                  errors.patientName
                    ? "border-red-500 focus:ring-red-500"
                    : "border-border focus:ring-primary"
                }`}
              />
            </div>
            {errors.patientName && (
              <div className="flex items-center space-x-2 mt-2 text-red-500 text-sm">
                <AlertCircle className="w-4 h-4" />
                <span>{errors.patientName}</span>
              </div>
            )}
          </div>*/}

          {/* Email */}
          {/*<div>
            <label htmlFor="email" className="block mb-2 font-medium text-foreground">
              Email Address *
            </label>
            <div className="relative">
              <Mail className="absolute left-4 top-1/2 -translate-y-1/2 w-5 h-5 text-muted-foreground" />
              <input
                id="email"
                type="email"
                value={formData.email}
                onChange={(e) => handleChange("email", e.target.value)}
                placeholder="your.email@example.com"
                className={`w-full pl-12 pr-4 py-3 border rounded-lg focus:outline-none focus:ring-2 transition-colors ${
                  errors.email
                    ? "border-red-500 focus:ring-red-500"
                    : "border-border focus:ring-primary"
                }`}
              />
            </div>
            {errors.email && (
              <div className="flex items-center space-x-2 mt-2 text-red-500 text-sm">
                <AlertCircle className="w-4 h-4" />
                <span>{errors.email}</span>
              </div>
            )}
          </div>*/}

          {/* Phone */}
          {/*<div>
            <label htmlFor="phone" className="block mb-2 font-medium text-foreground">
              Phone Number *
            </label>
            <div className="relative">
              <Phone className="absolute left-4 top-1/2 -translate-y-1/2 w-5 h-5 text-muted-foreground" />
              <input
                id="phone"
                type="tel"
                value={formData.phone}
                onChange={(e) => handleChange("phone", e.target.value)}
                placeholder="+1 (234) 567-890"
                className={`w-full pl-12 pr-4 py-3 border rounded-lg focus:outline-none focus:ring-2 transition-colors ${
                  errors.phone
                    ? "border-red-500 focus:ring-red-500"
                    : "border-border focus:ring-primary"
                }`}
              />
            </div>
            {errors.phone && (
              <div className="flex items-center space-x-2 mt-2 text-red-500 text-sm">
                <AlertCircle className="w-4 h-4" />
                <span>{errors.phone}</span>
              </div>
            )}
          </div>*/}

          {/* Address (for home service only) */}
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

          {/* Date and Time */}
          <div className="grid grid-cols-2 gap-4">
            <div>
              <label htmlFor="date" className="block mb-2 font-medium text-foreground">
                Preferred Date *
              </label>
              <div className="relative">
                <Calendar className="absolute left-4 top-1/2 -translate-y-1/2 w-5 h-5 text-muted-foreground" />
                <input
                  id="date"
                  type="date"
                  value={formData.date}
                  onChange={(e) => handleChange("date", e.target.value)}
                  min={new Date().toISOString().split("T")[0]}
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
                Preferred Time *
              </label>
              <div className="relative">
                <Clock className="absolute left-4 top-1/2 -translate-y-1/2 w-5 h-5 text-muted-foreground" />
                <input
                  id="time"
                  type="time"
                  value={formData.time}
                  onChange={(e) => handleChange("time", e.target.value)}
                  className={`w-full pl-12 pr-4 py-3 border rounded-lg focus:outline-none focus:ring-2 transition-colors ${
                    errors.time
                      ? "border-red-500 focus:ring-red-500"
                      : "border-border focus:ring-primary"
                  }`}
                />
              </div>
              {errors.time && (
                <div className="flex items-center space-x-2 mt-2 text-red-500 text-sm">
                  <AlertCircle className="w-4 h-4" />
                  <span>{errors.time}</span>
                </div>
              )}
            </div>
          </div>

          {/* Reason */}
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

          {/* Provider Info (Read-only) */}
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
                  <span className="font-medium">
                    {serviceType === "nurse" ? "Specialty" : "Specialty"}:
                  </span>{" "}
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

          {/* Buttons */}
          <div className="flex space-x-3 pt-4">
            <button
              type="button"
              onClick={onClose}
              className="flex-1 px-6 py-3 border border-border rounded-lg hover:bg-muted transition-colors font-medium"
            >
              Cancel
            </button>
            <button
              type="submit"
              disabled={isSubmitting}
              className="flex-1 px-6 py-3 bg-primary text-white rounded-lg hover:bg-primary/90 transition-colors disabled:opacity-50 disabled:cursor-not-allowed font-medium"
            >
              {isSubmitting ? "Submitting..." : "Submit Request"}
            </button>
          </div>
        </form>
      </div>
    </div>
  );
}
