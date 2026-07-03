import { X, Stethoscope, Home } from "lucide-react";
import { useNavigate } from "react-router";
import { useTranslation } from "react-i18next";

interface BookingTypeModalProps {
  isOpen: boolean;
  onClose: () => void;
}

export function BookingTypeModal({ isOpen, onClose }: BookingTypeModalProps) {
  const { t } = useTranslation("booking");
  const navigate = useNavigate();

  const handleSelection = (type: "doctor" | "nurse") => {
    onClose();
    if (type === "doctor") {
      navigate("/doctors");
    } else {
      navigate("/nurses");
    }
  };

  if (!isOpen) return null;

  return (
    <div className="fixed inset-0 z-50 flex items-center justify-center p-4 bg-black/50">
      <div className="bg-white rounded-2xl shadow-2xl max-w-3xl w-full">
        {/* Header */}
        <div className="border-b border-border px-6 py-4 flex items-center justify-between">
          <div>
            <h2 className="text-2xl font-bold text-fg">{t("typeModal.title")}</h2>
            <p className="text-sm text-fg-muted mt-1">{t("typeModal.note")}</p>
          </div>
          <button
            onClick={onClose}
            className="p-2 hover:bg-muted rounded-lg transition-colors"
          >
            <X className="w-5 h-5" />
          </button>
        </div>

        {/* Content */}
        <div className="p-8">
          <div className="grid md:grid-cols-2 gap-6">
            {/* Doctor Appointment Option */}
            <button
              onClick={() => handleSelection("doctor")}
              className="group relative overflow-hidden bg-white border-2 border-border rounded-xl p-8 hover:border-primary transition-all hover:shadow-xl text-start"
            >
              <div className="absolute inset-0 bg-linear-to-br from-teal-500 to-blue-600 opacity-0 group-hover:opacity-5 transition-opacity" />
              <div className="relative">
                <div className="w-16 h-16 bg-linear-to-br from-teal-500 to-blue-600 rounded-xl flex items-center justify-center mb-4">
                  <Stethoscope className="w-8 h-8 text-white" />
                </div>
                <h3 className="text-xl font-bold text-fg mb-2">
                  {t("typeModal.doctor.title")}
                </h3>
                <p className="text-fg-muted mb-4">
                  {t("typeModal.doctor.description")}
                </p>
                <ul className="space-y-2 text-sm text-fg-muted">
                  <li className="flex items-center gap-2">
                    <div className="w-1.5 h-1.5 rounded-full bg-primary" />
                    <span>{t("typeModal.doctor.f1")}</span>
                  </li>
                  <li className="flex items-center gap-2">
                    <div className="w-1.5 h-1.5 rounded-full bg-primary" />
                    <span>{t("typeModal.doctor.f2")}</span>
                  </li>
                  <li className="flex items-center gap-2">
                    <div className="w-1.5 h-1.5 rounded-full bg-primary" />
                    <span>{t("typeModal.doctor.f3")}</span>
                  </li>
                </ul>
                <div className="mt-6 inline-flex items-center text-primary font-medium group-hover:translate-x-1 rtl:group-hover:-translate-x-1 transition-transform">
                  {t("typeModal.doctor.cta")}
                  <span className="ms-2 rtl:rotate-180">→</span>
                </div>
              </div>
            </button>

            {/* Home Service Option */}
            <button
              onClick={() => handleSelection("nurse")}
              className="group relative overflow-hidden bg-white border-2 border-border rounded-xl p-8 hover:border-primary transition-all hover:shadow-xl text-start"
            >
              <div className="absolute inset-0 bg-linear-to-br from-pink-500 to-pink-600 opacity-0 group-hover:opacity-5 transition-opacity" />
              <div className="relative">
                <div className="w-16 h-16 bg-linear-to-br from-pink-500 to-pink-600 rounded-xl flex items-center justify-center mb-4">
                  <Home className="w-8 h-8 text-white" />
                </div>
                <h3 className="text-xl font-bold text-fg mb-2">
                  {t("typeModal.nurse.title")}
                </h3>
                <p className="text-fg-muted mb-4">
                  {t("typeModal.nurse.description")}
                </p>
                <ul className="space-y-2 text-sm text-fg-muted">
                  <li className="flex items-center gap-2">
                    <div className="w-1.5 h-1.5 rounded-full bg-primary" />
                    <span>{t("typeModal.nurse.f1")}</span>
                  </li>
                  <li className="flex items-center gap-2">
                    <div className="w-1.5 h-1.5 rounded-full bg-primary" />
                    <span>{t("typeModal.nurse.f2")}</span>
                  </li>
                  <li className="flex items-center gap-2">
                    <div className="w-1.5 h-1.5 rounded-full bg-primary" />
                    <span>{t("typeModal.nurse.f3")}</span>
                  </li>
                </ul>
                <div className="mt-6 inline-flex items-center text-primary font-medium group-hover:translate-x-1 rtl:group-hover:-translate-x-1 transition-transform">
                  {t("typeModal.nurse.cta")}
                  <span className="ms-2 rtl:rotate-180">→</span>
                </div>
              </div>
            </button>
          </div>

          <div className="mt-6 p-4 bg-blue-50 rounded-lg border border-blue-200">
            <p className="text-sm text-blue-900">
              <strong>{t("typeModal.footnoteLabel")}</strong> {t("typeModal.footnoteText")}
            </p>
          </div>
        </div>
      </div>
    </div>
  );
}