import { Link, useNavigate } from "react-router-dom";
import { ArrowLeft, Stethoscope, HeartPulse } from "lucide-react";
import AuthLayout from "../../components/auth/AuthLayout";
import RoleSelectCard from "../../components/auth/RoleSelectCard";

export default function MedicalSpecialist() {
  const navigate = useNavigate();

  return (
    <AuthLayout
      title="Medical specialist"
      subtitle="Tell us which type of specialist are you"
      wide
    >
      <button
        type="button"
        onClick={() => navigate("/role")}
        className="mb-5 inline-flex items-center gap-1 text-sm font-medium text-fg-muted transition-all duration-200 hover:text-primary hover:-translate-y-0.5"
      >
        <ArrowLeft className="h-4 w-4" />
        Back to role selection
      </button>

      <div className="grid grid-cols-1 gap-4 sm:grid-cols-2 sm:gap-5">
        <RoleSelectCard
          icon={<Stethoscope className="h-8 w-8" />}
          title="Doctor"
          description="Manage clinic appointments, consultations, and patient records under your verified profile."
          onClick={() => navigate("/signup?role=doctor")}
        />

        <RoleSelectCard
          icon={<HeartPulse className="h-8 w-8" />}
          title="Nurse"
          description="Provide licensed home care services and manage your nursing profile."
          onClick={() => navigate("/signup?role=nurse")}
        />
      </div>

      <p className="mt-6 text-center text-lg text-fg-muted">
        Already have an account?{" "}
        <Link
          to="/login"
          className="inline-block font-bold text-primary transition-transform duration-200 hover:text-primary/80 hover:-translate-y-0.5"
        >
          Sign in
        </Link>
      </p>
    </AuthLayout>
  );
}
