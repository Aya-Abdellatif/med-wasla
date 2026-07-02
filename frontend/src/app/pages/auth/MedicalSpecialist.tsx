import { Link, useNavigate } from "react-router-dom";
import { ArrowLeft, Stethoscope, HeartPulse } from "lucide-react";
import { useTranslation } from "react-i18next";
import AuthLayout from "../../components/auth/AuthLayout";
import RoleSelectCard from "../../components/auth/RoleSelectCard";

export default function MedicalSpecialist() {
  const { t } = useTranslation("auth");
  const navigate = useNavigate();

  return (
    <AuthLayout
      title={t("medicalSpecialist.title")}
      subtitle={t("medicalSpecialist.subtitle")}
      wide
    >
      <button
        type="button"
        onClick={() => navigate("/role")}
        className="mb-5 inline-flex items-center gap-1 text-sm font-medium text-fg-muted transition-all duration-200 hover:text-primary hover:-translate-y-0.5"
      >
        <ArrowLeft className="h-4 w-4 rtl:rotate-180" />
        {t("medicalSpecialist.backToRole")}
      </button>

      <div className="grid grid-cols-1 gap-4 sm:grid-cols-2 sm:gap-5">
        <RoleSelectCard
          icon={<Stethoscope className="h-8 w-8" />}
          title={t("medicalSpecialist.doctorTitle")}
          description={t("medicalSpecialist.doctorDescription")}
          onClick={() => navigate("/signup?role=doctor")}
        />

        <RoleSelectCard
          icon={<HeartPulse className="h-8 w-8" />}
          title={t("medicalSpecialist.nurseTitle")}
          description={t("medicalSpecialist.nurseDescription")}
          onClick={() => navigate("/signup?role=nurse")}
        />
      </div>

      <p className="mt-6 text-center text-lg text-fg-muted">
        {t("medicalSpecialist.hasAccount")}{" "}
        <Link
          to="/login"
          className="inline-block font-bold text-primary transition-transform duration-200 hover:text-primary/80 hover:-translate-y-0.5"
        >
          {t("medicalSpecialist.signInLink")}
        </Link>
      </p>
    </AuthLayout>
  );
}
