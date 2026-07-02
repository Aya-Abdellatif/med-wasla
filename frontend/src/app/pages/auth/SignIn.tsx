import { useState } from "react";
import { Link, useNavigate, useLocation } from "react-router-dom";
import { Eye, EyeOff } from "lucide-react";
import { useTranslation } from "react-i18next";
import AuthLayout from "../../components/auth/AuthLayout";
import { useAuth } from "../../context/useAuth";
import { showError, showSuccess } from "../../../utils/toast";

export default function SignIn() {
  const { t } = useTranslation(["auth", "validation", "toast"]);
  const [showPassword, setShowPassword] = useState(false);
  const [email, setEmail] = useState("");
  const [password, setPassword] = useState("");
  const [isLoading, setIsLoading] = useState(false);
  const navigate = useNavigate();
  const location = useLocation();
  const { login } = useAuth();
  const redirectTo = (location.state as { from?: string } | null)?.from;

  const handleLogin = async (e: React.FormEvent) => {
    e.preventDefault();

    if (!email || !password) {
      showError(t("validation:signIn.credentialsRequired"));
      return;
    }

    setIsLoading(true);
    try {
      const loggedInUser = await login(email, password);
      showSuccess(
        t("toast:auth.welcomeBack", { name: loggedInUser.name.split(" ")[0] }),
      );

      if (loggedInUser.role === "admin") {
        navigate("/admin-dashboard");
      } else if (
        loggedInUser.role === "doctor" ||
        loggedInUser.role === "nurse"
      ) {
        navigate("/dashboard");
      } else if (redirectTo) {
        navigate(redirectTo, { replace: true });
      } else {
        navigate("/");
      }
    } catch (err) {
      const message =
        err instanceof Error
          ? err.message
          : t("toast:auth.loginFailed");
      if (message === "Please verify your email first") {
        showError(t("toast:auth.verifyRedirect"));
        navigate(`/verify-otp?email=${encodeURIComponent(email)}`);
      } else {
        showError(message);
      }
    } finally {
      setIsLoading(false);
    }
  };

  return (
    <AuthLayout title={t("auth:signIn.title")} subtitle={t("auth:signIn.subtitle")}>
      <form onSubmit={handleLogin} className="space-y-6">
        <div className="space-y-4">
          <div>
            <label className="block text-sm font-semibold text-fg mb-2">
              {t("auth:fields.email")}
            </label>
            <input
              type="email"
              placeholder={t("auth:placeholders.email")}
              value={email}
              onChange={(e) => setEmail(e.target.value)}
              className="w-full rounded-xl border border-slate-200 bg-slate-50 px-4 py-4 text-fg outline-none focus:border-primary"
            />
          </div>

          <div>
            <label className="block text-sm font-semibold text-fg mb-2">
              {t("auth:fields.password")}
            </label>
            <div className="relative">
              <input
                type={showPassword ? "text" : "password"}
                placeholder={t("auth:placeholders.password")}
                value={password}
                onChange={(e) => setPassword(e.target.value)}
                className="w-full rounded-xl border border-slate-200 bg-slate-50 ps-4 pe-12 py-4 text-fg outline-none focus:border-primary"
              />
              <button
                type="button"
                onClick={() => setShowPassword(!showPassword)}
                className="absolute end-4 top-1/2 -translate-y-1/2 text-slate-400 hover:text-slate-600 transition-colors cursor-pointer"
              >
                {showPassword ? (
                  <EyeOff className="h-5 w-5 stroke-[1.75]" />
                ) : (
                  <Eye className="h-5 w-5 stroke-[1.75]" />
                )}
              </button>
            </div>
          </div>
        </div>

        <div className="flex justify-end">
          <Link
            to="/forgot-password"
            className="inline-block font-bold text-primary transition-transform duration-200 hover:text-primary/80 hover:-translate-y-0.5"
          >
            {t("auth:signIn.forgotPassword")}
          </Link>
        </div>

        <button
          type="submit"
          disabled={isLoading}
          className="w-full rounded-xl bg-primary border-2 border-primary py-4 text-base font-bold cursor-pointer text-white shadow-lg transition-all duration-300 ease-in-out hover:-translate-y-0.5 hover:bg-transparent hover:text-primary hover:shadow-md whitespace-nowrap"
        >
          {isLoading ? t("auth:signIn.submitting") : t("auth:signIn.submit")}
        </button>

        <p className="text-center text-lg text-fg-muted">
          {t("auth:signIn.noAccount")}{" "}
          <Link
            to="/role"
            className="inline-block font-bold text-primary transition-transform duration-200 hover:text-primary/80 hover:-translate-y-0.5"
          >
            {t("auth:signIn.signUpLink")}
          </Link>
        </p>
      </form>
    </AuthLayout>
  );
}
