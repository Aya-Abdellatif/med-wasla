import { useState } from "react";
import { useLocation, useNavigate } from "react-router-dom";
import { Eye, EyeOff, Mail } from "lucide-react";
import { useTranslation } from "react-i18next";
import AuthLayout from "../../components/auth/AuthLayout";
import { apiFetch } from "../../../services/api";
import { showError, showSuccess } from "../../../utils/toast";

export default function ResetPassword() {
  const { t } = useTranslation(["auth", "validation", "toast"]);
  const [showPassword, setShowPassword] = useState(false);
  const [otp, setOtp] = useState("");
  const [newPassword, setNewPassword] = useState("");
  const [isLoading, setIsLoading] = useState(false);
  const [isResending, setIsResending] = useState(false);
  const navigate = useNavigate();
  const location = useLocation();

  const email = (location.state as { email?: string } | null)?.email ?? "";

  const handleResetPassword = async (e: React.FormEvent) => {
    e.preventDefault();
    if (!otp.trim()) {
      showError(t("validation:resetPassword.otpRequired"));
      return;
    }
    if (!newPassword || newPassword.length < 8) {
      showError(t("validation:password.minLength"));
      return;
    }

    setIsLoading(true);
    try {
      await apiFetch("/api/auth/reset-password", {
        method: "POST",
        body: JSON.stringify({ email, otp: otp.trim(), newPassword }),
      });
      showSuccess(t("toast:auth.passwordReset"));
      navigate("/login");
    } catch (err) {
      showError(err instanceof Error ? err.message : t("toast:auth.passwordResetFailed"));
    } finally {
      setIsLoading(false);
    }
  };

  const handleResendOtp = async () => {
    if (!email) return;
    setIsResending(true);
    try {
      await apiFetch("/api/auth/forgot-password", {
        method: "POST",
        body: JSON.stringify({ email }),
      });
      showSuccess(t("toast:auth.codeResent"));
    } catch (err) {
      showError(err instanceof Error ? err.message : t("toast:auth.codeResendFailed"));
    } finally {
      setIsResending(false);
    }
  };

  return (
    <AuthLayout title={t("auth:resetPassword.title")} subtitle={t("auth:resetPassword.subtitle")}>
      <form onSubmit={handleResetPassword} className="space-y-6">
        <div>
          <label className="block text-sm font-semibold text-slate-700 mb-2">
            {t("auth:fields.email")}
          </label>
          <div className="relative flex items-center bg-slate-50 border border-slate-200 rounded-xl focus-within:border-primary transition-colors">
            <span className="absolute start-4 text-slate-400" aria-hidden="true">
              <Mail className="h-5 w-5 stroke-[1.75]" />
            </span>
            <input
              value={email}
              readOnly
              className="w-full bg-transparent px-14 py-4 text-fg outline-none rounded-xl cursor-not-allowed"
            />
          </div>
        </div>

        <div>
          <label className="block text-sm font-semibold text-fg mb-2">
            {t("auth:fields.otp")}
          </label>
          <input
            type="text"
            inputMode="numeric"
            maxLength={6}
            placeholder={t("auth:placeholders.otp")}
            value={otp}
            onChange={(e) => setOtp(e.target.value.replace(/\D/g, ""))}
            className="w-full rounded-xl border border-slate-200 bg-slate-50 px-5 py-4 text-center text-lg tracking-[0.4em] text-slate-900 outline-none focus:border-primary"
          />
        </div>

        <div>
          <label className="block text-sm font-semibold text-fg-muted mb-2">
            {t("auth:fields.newPassword")}
          </label>
          <div className="relative flex items-center bg-slate-50 border border-slate-200 rounded-xl focus-within:border-primary transition-colors">
            <input
              type={showPassword ? "text" : "password"}
              placeholder={t("auth:placeholders.newPassword")}
              value={newPassword}
              onChange={(e) => setNewPassword(e.target.value)}
              className="w-full bg-transparent ps-5 pe-12 py-4 text-fg placeholder:text-slate-400 outline-none rounded-xl"
            />
            <button
              type="button"
              onClick={() => setShowPassword(!showPassword)}
              className="absolute end-4 text-slate-400 hover:text-fg-muted transition-colors cursor-pointer"
            >
              {showPassword ? (
                <EyeOff className="h-5 w-5 stroke-[1.75]" />
              ) : (
                <Eye className="h-5 w-5 stroke-[1.75]" />
              )}
            </button>
          </div>
        </div>

        <button
          type="submit"
          disabled={isLoading}
          className="w-full rounded-xl bg-primary border-2 border-primary py-4 text-base font-bold cursor-pointer text-white shadow-lg transition-all duration-300 ease-in-out hover:-translate-y-0.5 hover:bg-transparent hover:text-primary hover:shadow-md whitespace-nowrap"
        >
          {isLoading ? t("auth:resetPassword.submitting") : t("auth:resetPassword.submit")}
        </button>

        <div className="flex items-center justify-center gap-8 text-sm">
          <button
            type="button"
            onClick={() => navigate("/forgot-password")}
            className="inline-block font-bold text-slate-600 underline underline-offset-4 transition-transform duration-200 hover:text-slate-800 hover:-translate-y-0.5 cursor-pointer"
          >
            {t("auth:resetPassword.editEmail")}
          </button>
          <button
            type="button"
            onClick={handleResendOtp}
            disabled={isResending}
            className="inline-block font-bold text-primary underline underline-offset-4 transition-transform duration-200 hover:text-primary/80 hover:-translate-y-0.5 cursor-pointer"
          >
            {isResending ? t("auth:resetPassword.resending") : t("auth:resetPassword.resendOtp")}
          </button>
        </div>
      </form>
    </AuthLayout>
  );
}
