import { Link, useNavigate } from "react-router-dom";
import { ArrowLeft, Stethoscope, HeartPulse } from "lucide-react";
import AuthLayout from "../../components/auth/AuthLayout";
import RoleSelectCard from "../../components/auth/RoleSelectCard";

export default function MedicalSpecialist() {
  const navigate = useNavigate();

  return (
    <AuthLayout
      title="Medical specialist"
      subtitle="Tell us which type of specialist you are"
      wide
    >
      <button
        type="button"
        onClick={() => navigate("/role")}
        className="mb-5 inline-flex items-center gap-1 text-sm font-medium text-slate-500 transition-colors hover:text-teal-600"
      >
        <ArrowLeft className="h-4 w-4" />
        Back to role selection
      </button>

      <div className="grid grid-cols-1 gap-4 sm:grid-cols-2 sm:gap-5">
        <RoleSelectCard
          accent="indigo"
          icon={<Stethoscope className="h-8 w-8" />}
          title="Doctor"
          description="Manage clinic appointments, profile, and patient consultations."
          onClick={() => navigate("/signup?role=doctor")}
        />

        <RoleSelectCard
          accent="emerald"
          icon={<HeartPulse className="h-8 w-8" />}
          title="Nurse"
          description="Offer home care services and manage your nursing profile."
          onClick={() => navigate("/signup?role=nurse")}
        />
      </div>

      <p className="mt-6 text-center text-sm text-slate-600">
        Already have an account?{" "}
        <Link to="/" className="font-bold text-teal-600 hover:text-teal-700">
          Sign in
        </Link>
      </p>
    </AuthLayout>
  );
}
