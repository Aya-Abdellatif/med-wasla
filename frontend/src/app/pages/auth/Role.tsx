import { Link, useNavigate } from "react-router-dom";
import { User, BriefcaseMedical } from "lucide-react";
import AuthLayout from "../../components/auth/AuthLayout";
import RoleSelectCard from "../../components/auth/RoleSelectCard";

export default function Role() {
  const navigate = useNavigate();

  return (
    <AuthLayout
      title="Create your account"
      subtitle="Choose how you want to use MedWasla"
      wide
    >
      <div className="grid grid-cols-1 gap-4 sm:grid-cols-2 sm:gap-5">
        <RoleSelectCard
          icon={<User className="h-8 w-8" />}
          title="Patient"
          description="Schedule visits, consult licensed providers, and access your medical records securely."
          onClick={() => navigate("/signup?role=patient")}
        />

        <RoleSelectCard
          icon={<BriefcaseMedical className="h-8 w-8" />}
          title="Medical Specialist"
          description="Register as a licensed doctor or nurse to deliver verified care through MedWasla."
          onClick={() => navigate("/medical-specialist")}
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
