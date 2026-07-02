import { Link, useNavigate } from "react-router-dom";
import { User, BriefcaseMedical } from "lucide-react";
import { useTranslation } from "react-i18next";
import AuthLayout from "../../components/auth/AuthLayout";
import RoleSelectCard from "../../components/auth/RoleSelectCard";

export default function Role() {
  const { t } = useTranslation("auth");
  const navigate = useNavigate();

  return (
    <AuthLayout
      title={t("role.title")}
      subtitle={t("role.subtitle")}
      wide
    >
      <div className="grid grid-cols-1 gap-4 sm:grid-cols-2 sm:gap-5">
        <RoleSelectCard
          icon={<User className="h-8 w-8" />}
          title={t("role.patientTitle")}
          description={t("role.patientDescription")}
          onClick={() => navigate("/signup?role=patient")}
        />

        <RoleSelectCard
          icon={<BriefcaseMedical className="h-8 w-8" />}
          title={t("role.specialistTitle")}
          description={t("role.specialistDescription")}
          onClick={() => navigate("/medical-specialist")}
        />
      </div>

      <p className="mt-6 text-center text-lg text-fg-muted">
        {t("role.hasAccount")}{" "}
        <Link
          to="/login"
          className="inline-block font-bold text-primary transition-transform duration-200 hover:text-primary/80 hover:-translate-y-0.5"
        >
          {t("role.signInLink")}
        </Link>
      </p>
    </AuthLayout>
  );
}
