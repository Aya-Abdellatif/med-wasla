import { useState } from "react";
import { useNavigate } from "react-router-dom";
import { useTranslation } from "react-i18next";
import AuthLayout from "../../components/auth/AuthLayout";
import { apiFetch } from "../../../services/api";
import { showError, showSuccess } from "../../../utils/toast";

export default function ForgotPassword() {
  const { t } = useTranslation(["auth", "validation", "toast"]);
  const [email, setEmail] = useState("");
  const [isLoading, setIsLoading] = useState(false);
  const navigate = useNavigate();

  const handleSendOtp = async (e: React.FormEvent) => {
    e.preventDefault();
    if (!email.trim()) {
      showError(t("validation:forgotPassword.emailRequired"));
      return;
    }

    setIsLoading(true);
    try {
      await apiFetch("/api/auth/forgot-password", {
        method: "POST",
        body: JSON.stringify({ email: email.trim() }),
      });
      showSuccess(t("toast:auth.otpSent"));
      navigate("/reset-password", { state: { email: email.trim() } });
    } catch (err) {
      showError(err instanceof Error ? err.message : t("toast:auth.otpSendFailed"));
    } finally {
      setIsLoading(false);
    }
  };

  return (
    <AuthLayout title={t("auth:forgotPassword.title")} subtitle={t("auth:forgotPassword.subtitle")}>
      <form onSubmit={handleSendOtp} className="space-y-6">
        <div>
          <label className="block text-sm font-semibold text-slate-700 mb-2">
            {t("auth:fields.email")}
          </label>
          <div className="relative flex items-center bg-slate-50 border border-slate-200 rounded-xl focus-within:border-teal-500 transition-colors">
            <span className="absolute start-4 text-slate-400" aria-hidden="true">
              <svg width="20" height="20" viewBox="0 0 24 24" fill="none" xmlns="http://www.w3.org/2000/svg">
                <path d="M4 6.5C4 5.11929 5.11929 4 6.5 4H17.5C18.8807 4 20 5.11929 20 6.5V17.5C20 18.8807 18.8807 20 17.5 20H6.5C5.11929 20 4 18.8807 4 17.5V6.5Z" stroke="currentColor" strokeWidth="1.5" strokeLinecap="round" strokeLinejoin="round" />
                <path d="M4 7.5L12 13L20 7.5" stroke="currentColor" strokeWidth="1.5" strokeLinecap="round" strokeLinejoin="round" />
              </svg>
            </span>
            <input
              type="email"
              placeholder={t("auth:placeholders.email")}
              value={email}
              onChange={(e) => setEmail(e.target.value)}
              className="w-full bg-transparent px-14 py-4 text-slate-900 placeholder:text-slate-400 outline-none rounded-xl"
            />
          </div>
        </div>

        <button
          type="submit"
          disabled={isLoading}
          className="w-full rounded-xl bg-primary border-2 border-primary py-4 text-base font-bold cursor-pointer text-white shadow-lg transition-all duration-300 ease-in-out hover:-translate-y-0.5 hover:bg-transparent hover:text-primary hover:shadow-md whitespace-nowrap"
        >
          {isLoading ? t("auth:forgotPassword.submitting") : t("auth:forgotPassword.submit")}
        </button>
      </form>
    </AuthLayout>
  );
}
