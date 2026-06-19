import { useState } from "react";
import { Link, useNavigate } from "react-router-dom";
import AuthLayout from "../../components/auth/AuthLayout";
import { useAuth } from "../../context/useAuth";
import { showError, showSuccess } from "../../../utils/toast";

export default function SignIn() {
  const [showPassword, setShowPassword] = useState(false);
  const [email, setEmail] = useState("");
  const [password, setPassword] = useState("");
  const [isLoading, setIsLoading] = useState(false);
  const navigate = useNavigate();
  const { login } = useAuth();

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
      } else if (loggedInUser.role === "doctor" || loggedInUser.role === "nurse") {
        navigate("/dashboard");
      } else {
        navigate("/");
      }
    } catch (err) {
      showError(err instanceof Error ? err.message : "Login failed. Please verify credentials.");
    } finally {
      setIsLoading(false);
    }
  };

  return (
    <AuthLayout title="Welcome Back" subtitle="Sign in to access your account">
      <form onSubmit={handleLogin} className="space-y-6">

        <div className="space-y-4">
          <div>
            <label className="block text-sm font-semibold text-slate-700 mb-2">
              Email Address
            </label>
            <input
              type="email"
              placeholder="your.email@example.com"
              value={email}
              onChange={(e) => setEmail(e.target.value)}
              className="w-full rounded-full border border-slate-200 bg-slate-50 px-4 py-4 text-slate-900 outline-none focus:border-teal-500"
            />
          </div>

          <div>
            <label className="block text-sm font-semibold text-slate-700 mb-2">
              Password
            </label>
            <div className="relative">
              <input
                type={showPassword ? "text" : "password"}
                placeholder="Enter your password"
                value={password}
                onChange={(e) => setPassword(e.target.value)}
                className="w-full rounded-full border border-slate-200 bg-slate-50 px-4 py-4 text-slate-900 outline-none focus:border-teal-500"
              />
              <button
                type="button"
                onClick={() => setShowPassword(!showPassword)}
                className="absolute right-4 top-1/2 -translate-y-1/2 text-slate-400 hover:text-slate-600 text-sm"
              >
                {showPassword ? "Hide" : "Show"}
              </button>
            </div>
          </div>
        </div>

        <button
          type="submit"
          disabled={isLoading}
          className="w-full rounded-full bg-teal-500 py-4 text-base font-bold text-white shadow-lg hover:bg-teal-600 transition-colors disabled:opacity-50"
        >
          {isLoading ? "Signing in..." : "Login"}
        </button>

        <p className="text-center text-sm text-slate-600">
          Don't have an account?{" "}
          <Link to="/role" className="font-bold text-teal-500 hover:text-teal-600">
            Sign up
          </Link>
        </p>
      </form>
    </AuthLayout>
  );
}
