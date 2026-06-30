import { useState } from "react";
import { useLocation, useNavigate } from "react-router-dom";
import { Eye, EyeOff, Mail } from "lucide-react"; // Imported clean, standard icons
import AuthLayout from "../../components/auth/AuthLayout";
import { apiFetch } from "../../../services/api";
import { showError, showSuccess } from "../../../utils/toast";

export default function ResetPassword() {
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
      showError("Please enter the OTP code");
      return;
    }
    if (!newPassword || newPassword.length < 8) {
      showError("Password must be at least 8 characters");
      return;
    }

    setIsLoading(true);
    try {
      await apiFetch("/api/auth/reset-password", {
        method: "POST",
        body: JSON.stringify({ email, otp: otp.trim(), newPassword }),
      });
      showSuccess("Password reset successfully!");
      navigate("/login");
    } catch (err) {
      showError(
        err instanceof Error ? err.message : "Failed to reset password",
      );
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
      showSuccess("A new code was sent to your email.");
    } catch (err) {
      showError(err instanceof Error ? err.message : "Could not resend code");
    } finally {
      setIsResending(false);
    }
  };

  return (
    <AuthLayout title="Reset Password" subtitle="Create a new password">
      <form onSubmit={handleResetPassword} className="space-y-6">
        <div>
          <label className="block text-sm font-semibold text-slate-700 mb-2">
            Email Address
          </label>
          <div className="relative flex items-center bg-slate-50 border border-slate-200 rounded-xl focus-within:border-primary transition-colors">
            <span className="absolute left-4 text-slate-400" aria-hidden="true">
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
            OTP
          </label>
          <input
            type="text"
            inputMode="numeric"
            maxLength={6}
            placeholder="123456"
            value={otp}
            onChange={(e) => setOtp(e.target.value.replace(/\D/g, ""))}
            className="w-full rounded-xl border border-slate-200 bg-slate-50 px-5 py-4 text-center text-lg tracking-[0.4em] text-slate-900 outline-none focus:border-primary"
          />
        </div>

        <div>
          <label className="block text-sm font-semibold text-fg-muted mb-2">
            New Password
          </label>
          <div className="relative flex items-center bg-slate-50 border border-slate-200 rounded-xl focus-within:border-primary transition-colors">
            <input
              type={showPassword ? "text" : "password"}
              placeholder="New Password"
              value={newPassword}
              onChange={(e) => setNewPassword(e.target.value)}
              className="w-full bg-transparent pl-5 pr-12 py-4 text-fg placeholder:text-slate-400 outline-none rounded-xl"
            />
            <button
              type="button"
              onClick={() => setShowPassword(!showPassword)}
              className="absolute right-4 text-slate-400 hover:text-fg-muted transition-colors cursor-pointer"
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
          {isLoading ? "Resetting..." : "Reset Password"}
        </button>

        <div className="flex items-center justify-center gap-8 text-sm">
          <button
            type="button"
            onClick={() => navigate("/forgot-password")}
            className="inline-block font-bold text-slate-600 underline underline-offset-4 transition-transform duration-200 hover:text-slate-800 hover:-translate-y-0.5 cursor-pointer"
          >
            Edit Email
          </button>
          <button
            type="button"
            onClick={handleResendOtp}
            disabled={isResending}
            className="inline-block font-bold text-primary underline underline-offset-4 transition-transform duration-200 hover:text-primary/80 hover:-translate-y-0.5 cursor-pointer"
          >
            {isResending ? "Sending..." : "Resend OTP"}
          </button>
        </div>
      </form>
    </AuthLayout>
  );
}
