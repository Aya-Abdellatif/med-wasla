import { useState } from "react";
import { Link, useNavigate, useLocation } from "react-router-dom";
import { Eye, EyeOff } from "lucide-react"; // Imported clean modern icons
import AuthLayout from "../../components/auth/AuthLayout";
import { useAuth } from "../../context/useAuth";
import { showError, showSuccess } from "../../../utils/toast";

export default function SignIn() {
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
      showError("Please enter your email and password");
      return;
    }

    setIsLoading(true);
    try {
      const loggedInUser = await login(email, password);
      showSuccess(`Welcome back, ${loggedInUser.name.split(" ")[0]}!`);

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
          : "Login failed. Please verify credentials.";
      if (message === "Please verify your email first") {
        showError(
          "Your email is not verified. Redirecting to verification page...",
        );
        navigate(`/verify-otp?email=${encodeURIComponent(email)}`);
      } else {
        showError(message);
      }
    } finally {
      setIsLoading(false);
    }
  };

  return (
    <AuthLayout title="Welcome Back" subtitle="Sign in to access your account">
      <form onSubmit={handleLogin} className="space-y-6">
        <div className="space-y-4">
          <div>
            <label className="block text-sm font-semibold text-fg mb-2">
              Email Address
            </label>
            <input
              type="email"
              placeholder="your.email@example.com"
              value={email}
              onChange={(e) => setEmail(e.target.value)}
              className="w-full rounded-xl border border-slate-200 bg-slate-50 px-4 py-4 text-fg outline-none focus:border-primary"
            />
          </div>

          <div>
            <label className="block text-sm font-semibold text-fg mb-2">
              Password
            </label>
            <div className="relative">
              <input
                type={showPassword ? "text" : "password"}
                placeholder="Enter your password"
                value={password}
                onChange={(e) => setPassword(e.target.value)}
                className="w-full rounded-xl border border-slate-200 bg-slate-50 pl-4 pr-12 py-4 text-fg outline-none focus:border-primary"
              />
              <button
                type="button"
                onClick={() => setShowPassword(!showPassword)}
                className="absolute right-4 top-1/2 -translate-y-1/2 text-slate-400 hover:text-slate-600 transition-colors cursor-pointer"
              >
                {/* Corrected logic: Displays eye with slash when hidden, regular eye when visible */}
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
            Forgot password?
          </Link>
        </div>

        <button
          type="submit"
          disabled={isLoading}
          className="w-full rounded-xl bg-primary border-2 border-primary py-4 text-base font-bold cursor-pointer text-white shadow-lg transition-all duration-300 ease-in-out hover:-translate-y-0.5 hover:bg-transparent hover:text-primary hover:shadow-md whitespace-nowrap"
        >
          {isLoading ? "Signing in..." : "Login"}
        </button>

        <p className="text-center text-lg text-fg-muted">
          Don't have an account?{" "}
          <Link
            to="/role"
            className="inline-block font-bold text-primary transition-transform duration-200 hover:text-primary/80 hover:-translate-y-0.5"
          >
            Sign up
          </Link>
        </p>
      </form>
    </AuthLayout>
  );
}
