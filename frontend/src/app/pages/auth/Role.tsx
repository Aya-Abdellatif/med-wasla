import { Link, useNavigate } from "react-router-dom";
import { UserRound, Stethoscope } from "lucide-react";
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
      <p className="mb-5 text-center text-sm font-medium text-slate-600">
        I want to register as...
      </p>

      <div className="grid grid-cols-1 gap-4 sm:grid-cols-2 sm:gap-5">
        <RoleSelectCard
          accent="blue"
          icon={<UserRound className="h-8 w-8" />}
          title="Patient"
          description="Book appointments and manage your health records easily."
          onClick={() => navigate("/signup?role=patient")}
        />

        <RoleSelectCard
          accent="teal"
          icon={<Stethoscope className="h-8 w-8" />}
          title="Medical Specialist"
          description="Join as a doctor or nurse and offer your medical services."
          onClick={() => navigate("/medical-specialist")}
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
