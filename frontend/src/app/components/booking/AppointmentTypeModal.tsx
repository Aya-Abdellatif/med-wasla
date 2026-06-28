import { X, Stethoscope, Home, ArrowRight } from "lucide-react";
import { useNavigate } from "react-router-dom";
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
        {/* Header */}
        <div className="flex items-center justify-between p-6 border-b border-gray-200">
          <div>
            <h2 className="text-3xl font-bold text-gray-900">
              Choose Service Type
            </h2>
            <p className="text-gray-600 mt-1">
              Select the type of healthcare service you need
            </p>
          </div>
          <button
            onClick={onClose}
            className="p-2 hover:bg-gray-100 rounded-lg transition-colors"
          >
            <X className="w-6 h-6 text-gray-500" />
          </button>
        </div>

        {/* Content */}
        <div className="p-8">
          <div className="grid md:grid-cols-2 gap-8 mb-8">
            {/* Doctor Appointment Card */}
            <div className="border-2 border-gray-200 rounded-2xl p-8 hover:border-teal-500 hover:shadow-lg transition-all cursor-pointer"
              onClick={handleChooseDoctor}>
              <div className="flex items-center justify-center w-16 h-16 bg-teal-100 rounded-2xl mb-6">
                <Stethoscope className="w-8 h-8 text-teal-600" />
              </div>

              <h3 className="text-2xl font-bold text-gray-900 mb-3">
                Book Doctor Appointment
              </h3>

              <p className="text-gray-600 mb-6 leading-relaxed">
                Schedule a consultation with our expert doctors at the clinic
              </p>

              <ul className="space-y-3 mb-8">
                <li className="flex items-center gap-3 text-gray-700">
                  <span className="w-2 h-2 bg-teal-500 rounded-full"></span>
                  In-clinic consultations
                </li>
                <li className="flex items-center gap-3 text-gray-700">
                  <span className="w-2 h-2 bg-teal-500 rounded-full"></span>
                  Multiple specialties available
                </li>
                <li className="flex items-center gap-3 text-gray-700">
                  <span className="w-2 h-2 bg-teal-500 rounded-full"></span>
                  Advanced diagnostic facilities
                </li>
              </ul>

              <button
                onClick={handleChooseDoctor}
                className="inline-flex items-center gap-2 text-teal-600 font-semibold hover:gap-3 transition-all"
              >
                Choose Doctor <ArrowRight className="w-4 h-4" />
              </button>
            </div>

            {/* Nurse Service Card */}
            <div className="border-2 border-gray-200 rounded-2xl p-8 hover:border-teal-500 hover:shadow-lg transition-all cursor-pointer"
              onClick={handleChooseNurse}>
              <div className="flex items-center justify-center w-16 h-16 bg-teal-100 rounded-2xl mb-6">
                <Home className="w-8 h-8 text-teal-500" />
              </div>

              <h3 className="text-2xl font-bold text-gray-900 mb-3">
                Request Home Service
              </h3>

              <p className="text-gray-600 mb-6 leading-relaxed">
                Get professional nursing care in the comfort of your home
              </p>

              <ul className="space-y-3 mb-8">
                <li className="flex items-center gap-3 text-gray-700">
                  <span className="w-2 h-2 bg-teal-500 rounded-full"></span>
                  Home nursing services
                </li>
                <li className="flex items-center gap-3 text-gray-700">
                  <span className="w-2 h-2 bg-teal-500 rounded-full"></span>
                  Convenient and comfortable
                </li>
                <li className="flex items-center gap-3 text-gray-700">
                  <span className="w-2 h-2 bg-teal-500 rounded-full"></span>
                  Specialized care at home
                </li>
              </ul>

              <button
                onClick={handleChooseNurse}
                className="inline-flex items-center gap-2 text-teal-600 font-semibold hover:gap-3 transition-all"
              >
                Choose Nurse <ArrowRight className="w-4 h-4" />
              </button>
            </div>
          </div>

          {/* Note */}
          <div className="bg-teal-50 border-l-4 border-teal-500 p-6 rounded-lg">
            <p className="text-gray-800">
              <span className="font-semibold text-teal-900">Note:</span> After
              selecting a service type, you'll be directed to choose your
              preferred <span className="font-semibold">doctor or nurse</span>.
              You can then book directly from their profile.
            </p>
          </div>
        </div>
      </div>
    </div>
  );
}
