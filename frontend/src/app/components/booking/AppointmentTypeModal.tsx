import { X, Stethoscope, Home, ArrowRight } from "lucide-react";
import { useNavigate } from "react-router-dom";
import { useTranslation } from "react-i18next";
import { useAuth } from "../../context/useAuth";
import { canBookAppointments } from "../../../utils/bookingAccess";

interface AppointmentTypeModalProps {
  isOpen: boolean;
  onClose: () => void;
}

export function AppointmentTypeModal({
  isOpen,
  onClose,
}: AppointmentTypeModalProps) {
  const { t } = useTranslation("booking");
  const navigate = useNavigate();
  const { user } = useAuth();

  if (!isOpen) return null;
  if (!canBookAppointments(user)) return null;

  const handleChooseDoctor = () => {
    onClose();
    navigate("/doctors");
  };

  const handleChooseNurse = () => {
    onClose();
    navigate("/nurses");
  };

  return (
    <div className="fixed inset-0 bg-black/50 flex items-center justify-center z-50 p-4">
      <div className="bg-white rounded-2xl max-w-4xl w-full max-h-[90vh] overflow-y-auto">
        <div className="flex items-center justify-between p-6 border-b border-gray-200">
          <div>
            <h2 className="text-3xl font-bold text-gray-900">
              {t("typeModal.title")}
            </h2>
            <p className="text-gray-600 mt-1">{t("typeModal.note")}</p>
          </div>
          <button
            onClick={onClose}
            className="p-2 hover:bg-gray-100 rounded-lg transition-colors"
          >
            <X className="w-6 h-6 text-gray-500" />
          </button>
        </div>

        <div className="p-8">
          <div className="grid md:grid-cols-2 gap-8 mb-8">
            <div
              onClick={handleChooseDoctor}
              className="rounded-2xl bg-white p-8 shadow-sm outline-none transition-all duration-200 hover:-translate-y-1.5 hover:shadow-xl active:translate-y-0 active:scale-[0.98] active:shadow-sm active:duration-75 cursor-pointer"
            >
              <div className="flex items-center justify-center w-16 h-16 bg-primary/10 rounded-2xl mb-6">
                <Stethoscope className="w-8 h-8 text-primary" />
              </div>

              <h3 className="text-2xl font-bold text-gray-900 mb-3">
                {t("typeModal.doctor.title")}
              </h3>

              <p className="text-gray-600 mb-6 leading-relaxed">
                {t("typeModal.doctor.description")}
              </p>

              <ul className="space-y-3 mb-8">
                <li className="flex items-center gap-3 text-gray-700">
                  <span className="w-2 h-2 bg-primary rounded-full"></span>
                  {t("typeModal.doctor.f1")}
                </li>
                <li className="flex items-center gap-3 text-gray-700">
                  <span className="w-2 h-2 bg-primary rounded-full"></span>
                  {t("typeModal.doctor.f2")}
                </li>
                <li className="flex items-center gap-3 text-gray-700">
                  <span className="w-2 h-2 bg-primary rounded-full"></span>
                  {t("typeModal.doctor.f3")}
                </li>
              </ul>

              <button
                onClick={handleChooseDoctor}
                className="inline-flex items-center gap-2 text-primary font-semibold hover:gap-3 transition-all"
              >
                {t("typeModal.doctor.cta")}{" "}
                <ArrowRight className="w-4 h-4 rtl:rotate-180" />
              </button>
            </div>

            <div
              onClick={handleChooseNurse}
              className="rounded-2xl bg-white p-8 shadow-sm outline-none transition-all duration-200 hover:-translate-y-1.5 hover:shadow-xl active:translate-y-0 active:scale-[0.98] active:shadow-sm active:duration-75 cursor-pointer"
            >
              <div className="flex items-center justify-center w-16 h-16 bg-primary/10 rounded-2xl mb-6">
                <Home className="w-8 h-8 text-primary" />
              </div>

              <h3 className="text-2xl font-bold text-gray-900 mb-3">
                {t("typeModal.nurse.title")}
              </h3>

              <p className="text-gray-600 mb-6 leading-relaxed">
                {t("typeModal.nurse.description")}
              </p>

              <ul className="space-y-3 mb-8">
                <li className="flex items-center gap-3 text-gray-700">
                  <span className="w-2 h-2 bg-primary rounded-full"></span>
                  {t("typeModal.nurse.f1")}
                </li>
                <li className="flex items-center gap-3 text-gray-700">
                  <span className="w-2 h-2 bg-primary rounded-full"></span>
                  {t("typeModal.nurse.f2")}
                </li>
                <li className="flex items-center gap-3 text-gray-700">
                  <span className="w-2 h-2 bg-primary rounded-full"></span>
                  {t("typeModal.nurse.f3")}
                </li>
              </ul>

              <button
                onClick={handleChooseNurse}
                className="inline-flex items-center gap-2 text-primary font-semibold hover:gap-3 transition-all"
              >
                {t("typeModal.nurse.cta")}{" "}
                <ArrowRight className="w-4 h-4 rtl:rotate-180" />
              </button>
            </div>
          </div>

          <div className="bg-primary/5 border-s-4 border-primary p-6 rounded-lg">
            <p className="text-gray-800">
              <span className="font-semibold text-primary">
                {t("typeModal.footnoteLabel")}
              </span>{" "}
              {t("typeModal.footnoteText")}
            </p>
          </div>
        </div>
      </div>
    </div>
  );
}