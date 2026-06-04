import { X, Stethoscope, Home } from "lucide-react";
import { useNavigate } from "react-router";

interface BookingTypeModalProps {
  isOpen: boolean;
  onClose: () => void;
}

export function BookingTypeModal({ isOpen, onClose }: BookingTypeModalProps) {
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
            <h2 className="text-2xl font-bold text-foreground">Choose Service Type</h2>
            <p className="text-sm text-muted-foreground mt-1">
              Select the type of healthcare service you need
            </p>
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
              className="group relative overflow-hidden bg-white border-2 border-border rounded-xl p-8 hover:border-primary transition-all hover:shadow-xl text-left"
            >
              <div className="absolute inset-0 bg-gradient-to-br from-teal-500 to-blue-600 opacity-0 group-hover:opacity-5 transition-opacity" />
              <div className="relative">
                <div className="w-16 h-16 bg-gradient-to-br from-teal-500 to-blue-600 rounded-xl flex items-center justify-center mb-4">
                  <Stethoscope className="w-8 h-8 text-white" />
                </div>
                <h3 className="text-xl font-bold text-foreground mb-2">
                  Book Doctor Appointment
                </h3>
                <p className="text-muted-foreground mb-4">
                  Schedule a consultation with our expert doctors at the clinic
                </p>
                <ul className="space-y-2 text-sm text-muted-foreground">
                  <li className="flex items-center space-x-2">
                    <div className="w-1.5 h-1.5 rounded-full bg-primary" />
                    <span>In-clinic consultations</span>
                  </li>
                  <li className="flex items-center space-x-2">
                    <div className="w-1.5 h-1.5 rounded-full bg-primary" />
                    <span>Multiple specialties available</span>
                  </li>
                  <li className="flex items-center space-x-2">
                    <div className="w-1.5 h-1.5 rounded-full bg-primary" />
                    <span>Advanced diagnostic facilities</span>
                  </li>
                </ul>
                <div className="mt-6 inline-flex items-center text-primary font-medium group-hover:translate-x-1 transition-transform">
                  Choose Doctor
                  <span className="ml-2">→</span>
                </div>
              </div>
            </button>

            {/* Home Service Option */}
            <button
              onClick={() => handleSelection("nurse")}
              className="group relative overflow-hidden bg-white border-2 border-border rounded-xl p-8 hover:border-primary transition-all hover:shadow-xl text-left"
            >
              <div className="absolute inset-0 bg-gradient-to-br from-pink-500 to-pink-600 opacity-0 group-hover:opacity-5 transition-opacity" />
              <div className="relative">
                <div className="w-16 h-16 bg-gradient-to-br from-pink-500 to-pink-600 rounded-xl flex items-center justify-center mb-4">
                  <Home className="w-8 h-8 text-white" />
                </div>
                <h3 className="text-xl font-bold text-foreground mb-2">
                  Request Home Service
                </h3>
                <p className="text-muted-foreground mb-4">
                  Get professional nursing care in the comfort of your home
                </p>
                <ul className="space-y-2 text-sm text-muted-foreground">
                  <li className="flex items-center space-x-2">
                    <div className="w-1.5 h-1.5 rounded-full bg-primary" />
                    <span>Home nursing services</span>
                  </li>
                  <li className="flex items-center space-x-2">
                    <div className="w-1.5 h-1.5 rounded-full bg-primary" />
                    <span>Convenient and comfortable</span>
                  </li>
                  <li className="flex items-center space-x-2">
                    <div className="w-1.5 h-1.5 rounded-full bg-primary" />
                    <span>Specialized care at home</span>
                  </li>
                </ul>
                <div className="mt-6 inline-flex items-center text-primary font-medium group-hover:translate-x-1 transition-transform">
                  Choose Nurse
                  <span className="ml-2">→</span>
                </div>
              </div>
            </button>
          </div>

          <div className="mt-6 p-4 bg-blue-50 rounded-lg border border-blue-200">
            <p className="text-sm text-blue-900">
              <strong>Note:</strong> After selecting a service type, you'll be directed to choose your
              preferred {" "}
              <span className="font-medium">doctor or nurse</span>. You can then book directly from their profile.
            </p>
          </div>
        </div>
      </div>
    </div>
  );
}
