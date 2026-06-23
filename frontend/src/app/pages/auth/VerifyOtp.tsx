import { useState } from "react";
import { Link, useSearchParams } from "react-router-dom";
import AuthLayout from "../../components/auth/AuthLayout";
import { apiFetch, setToken } from "../../../services/api";
import { showError, showSuccess } from "../../../utils/toast";

export default function VerifyOtp() {
  const [searchParams] = useSearchParams();
  const [email, setEmail] = useState(searchParams.get("email") ?? "");
  const [otp, setOtp] = useState("");
  const [isLoading, setIsLoading] = useState(false);
  const [isResending, setIsResending] = useState(false);

  const handleVerify = async (e: React.FormEvent) => {
    e.preventDefault();

    if (!email.trim() || !otp.trim()) {
      showError("Please enter your email and verification code");
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
      showSuccess("Email verified! Welcome to MedWasla.");

      if (data.user.role === "specialist") {
        window.location.assign("/dashboard");
      } else {
        window.location.assign("/home");
      }
    } catch (err) {
      showError(err instanceof Error ? err.message : "Verification failed");
    } finally {
      setIsLoading(false);
    }
  };

  const handleResend = async () => {
    if (!email.trim()) {
      showError("Enter your email to resend the code");
      return;
    }

    setIsResending(true);
    try {
      await apiFetch("/api/auth/resend-otp", {
        method: "POST",
        body: JSON.stringify({ email: email.trim() }),
      });
      showSuccess("A new verification code was sent to your email.");
    } catch (err) {
      showError(err instanceof Error ? err.message : "Could not resend code");
    } finally {
      setIsResending(false);
    }
  };

  return (
    <AuthLayout title="Verify your email" subtitle="Enter the 6-digit code we sent you">
      <form onSubmit={handleVerify} className="space-y-6">
        <div>
          <label className="block text-sm font-semibold text-slate-700 mb-2">Email</label>
          <input
            type="email"
            value={email}
            onChange={(e) => setEmail(e.target.value)}
            className="w-full rounded-full border border-slate-200 bg-slate-50 px-4 py-4 text-slate-900 outline-none focus:border-teal-500"
          />
        </div>

        <div>
          <label className="block text-sm font-semibold text-slate-700 mb-2">
            Verification code
          </label>
          <input
            type="text"
            inputMode="numeric"
            maxLength={6}
            placeholder="123456"
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
          {isLoading ? "Verifying..." : "Verify email"}
        </button>

        <button
          type="button"
          onClick={handleResend}
          disabled={isResending}
          className="w-full text-sm font-semibold text-teal-600 hover:text-teal-700 disabled:opacity-50"
        >
          {isResending ? "Sending..." : "Resend code"}
        </button>

        <p className="text-center text-sm text-slate-600">
          Already verified?{" "}
          <Link to="/" className="font-bold text-teal-500 hover:text-teal-600">
            Sign in
          </Link>
        </p>
      </form>
    </AuthLayout>
  );
}
