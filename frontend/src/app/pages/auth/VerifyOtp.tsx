import { useState } from "react";
import { Link, useSearchParams } from "react-router-dom";
import { useTranslation } from "react-i18next";
import AuthLayout from "../../components/auth/AuthLayout";
import { apiFetch, setToken } from "../../../services/api";
import { showError, showSuccess } from "../../../utils/toast";

export default function VerifyOtp() {
  const { t } = useTranslation(["auth", "validation", "toast"]);
  const [searchParams] = useSearchParams();
  const [email, setEmail] = useState(searchParams.get("email") ?? "");
  const [otp, setOtp] = useState("");
  const [isLoading, setIsLoading] = useState(false);
  const [isResending, setIsResending] = useState(false);

  const handleVerify = async (e: React.FormEvent) => {
    e.preventDefault();

    if (!email.trim() || !otp.trim()) {
      showError(t("validation:verifyOtp.fieldsRequired"));
      return;
    }

    setIsLoading(true);
    try {
      const data = await apiFetch<{
        token: string;
        user: { id: string; name: string; email: string; role: string };
      }>("/api/auth/verify-otp", {
        method: "POST",
        body: JSON.stringify({ email: email.trim(), otp: otp.trim() }),
      });

      setToken(data.token);
      showSuccess(t("toast:auth.verifySuccess"));

      if (data.user.role === "specialist") {
        window.location.assign("/dashboard");
      } else {
        window.location.assign("/");
      }
    } catch (err) {
      showError(err instanceof Error ? err.message : t("toast:auth.verifyFailed"));
    } finally {
      setIsLoading(false);
    }
  };

  const handleResend = async () => {
    if (!email.trim()) {
      showError(t("validation:verifyOtp.emailRequired"));
      return;
    }

    setIsResending(true);
    try {
      await apiFetch("/api/auth/resend-otp", {
        method: "POST",
        body: JSON.stringify({ email: email.trim() }),
      });
      showSuccess(t("toast:auth.verificationCodeResent"));
    } catch (err) {
      showError(err instanceof Error ? err.message : t("toast:auth.codeResendFailed"));
    } finally {
      setIsResending(false);
    }
  };

  return (
    <AuthLayout title={t("auth:verifyOtp.title")} subtitle={t("auth:verifyOtp.subtitle")}>
      <form onSubmit={handleVerify} className="space-y-6">
        <div>
          <label className="block text-sm font-semibold text-slate-700 mb-2">{t("auth:fields.email")}</label>
          <input
            type="email"
            value={email}
            onChange={(e) => setEmail(e.target.value)}
            className="w-full rounded-full border border-slate-200 bg-slate-50 px-4 py-4 text-slate-900 outline-none focus:border-teal-500"
          />
        </div>

        <div>
          <label className="block text-sm font-semibold text-slate-700 mb-2">
            {t("auth:fields.verificationCode")}
          </label>
          <input
            type="text"
            inputMode="numeric"
            maxLength={6}
            placeholder={t("auth:placeholders.otp")}
            value={otp}
            onChange={(e) => setOtp(e.target.value.replace(/\D/g, ""))}
            className="w-full rounded-full border border-slate-200 bg-slate-50 px-4 py-4 text-center text-lg tracking-[0.4em] text-slate-900 outline-none focus:border-teal-500"
          />
        </div>

        <button
          type="submit"
          disabled={isLoading}
          className="w-full rounded-full bg-teal-500 py-4 text-base font-bold text-white shadow-lg hover:bg-teal-600 transition-colors disabled:opacity-50"
        >
          {isLoading ? t("auth:verifyOtp.submitting") : t("auth:verifyOtp.submit")}
        </button>

        <button
          type="button"
          onClick={handleResend}
          disabled={isResending}
          className="w-full text-sm font-semibold text-teal-600 hover:text-teal-700 disabled:opacity-50"
        >
          {isResending ? t("auth:verifyOtp.resending") : t("auth:verifyOtp.resend")}
        </button>

        <p className="text-center text-sm text-slate-600">
          {t("auth:verifyOtp.alreadyVerified")}{" "}
          <Link to="/" className="font-bold text-teal-500 hover:text-teal-600">
            {t("auth:verifyOtp.signInLink")}
          </Link>
        </p>
      </form>
    </AuthLayout>
  );
}
