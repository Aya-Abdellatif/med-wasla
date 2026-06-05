import { useState } from "react";
import { Link, useNavigate } from "react-router-dom";
import AuthLayout from "../../components/auth/AuthLayout";

export default function SignIn() {
  const [showPassword, setShowPassword] = useState(false);
  const navigate = useNavigate();

  return (
    <AuthLayout
      title="Welcome Back"
      subtitle="Sign in to access your account"
    >
      <form className="space-y-6">
        <div className="space-y-4">
          <div>
            <label className="block text-sm font-semibold text-slate-700 mb-2">
              Email Address
            </label>
            <div className="relative flex items-center bg-slate-50 border border-slate-200 rounded-full focus-within:border-teal-500 transition-colors">
              <span className="absolute left-4 text-slate-400" aria-hidden="true">
                <svg width="20" height="20" viewBox="0 0 24 24" fill="none" xmlns="http://www.w3.org/2000/svg">
                  <path d="M4 6.5C4 5.11929 5.11929 4 6.5 4H17.5C18.8807 4 20 5.11929 20 6.5V17.5C20 18.8807 18.8807 20 17.5 20H6.5C5.11929 20 4 18.8807 4 17.5V6.5Z" stroke="currentColor" strokeWidth="1.5" strokeLinecap="round" strokeLinejoin="round"/>
                  <path d="M4 7.5L12 13L20 7.5" stroke="currentColor" strokeWidth="1.5" strokeLinecap="round" strokeLinejoin="round"/>
                </svg>
              </span>
              <input
                type="email"
                placeholder="your.email@example.com"
                className="w-full bg-transparent px-14 py-4 text-slate-900 placeholder:text-slate-400 outline-none rounded-full"
              />
            </div>
          </div>

          <div>
            <label className="block text-sm font-semibold text-slate-700 mb-2">
              Password
            </label>
            <div className="relative flex items-center bg-slate-50 border border-slate-200 rounded-full focus-within:border-teal-500 transition-colors">
              <span className="absolute left-4 text-slate-400" aria-hidden="true">
                <svg width="20" height="20" viewBox="0 0 24 24" fill="none" xmlns="http://www.w3.org/2000/svg">
                  <path d="M16 11V7C16 4.79086 14.2091 3 12 3C9.79086 3 8 4.79086 8 7V11" stroke="currentColor" strokeWidth="1.5" strokeLinecap="round" strokeLinejoin="round"/>
                  <rect x="5" y="11" width="14" height="10" rx="2" stroke="currentColor" strokeWidth="1.5"/>
                </svg>
              </span>
              <input
                type={showPassword ? "text" : "password"}
                placeholder="Enter your password"
                className="w-full bg-transparent px-14 py-4 text-slate-900 placeholder:text-slate-400 outline-none rounded-full"
              />
              <button 
                type="button" 
                onClick={() => setShowPassword(!showPassword)}
                className="absolute right-4 text-slate-400 hover:text-slate-600"
              >
                {showPassword ? (
                  <svg width="20" height="20" viewBox="0 0 24 24" fill="none" xmlns="http://www.w3.org/2000/svg">
                    <path d="M3 3L21 21M9.878 9.878C9.33 10.424 9 11.189 9 12C9 13.657 10.343 15 12 15C12.811 15 13.576 14.67 14.122 14.122M6.61 6.61C5.29 7.974 4.27 9.716 3.878 11.7C3 15.9 7.03 19 12 19C13.357 19 14.671 18.838 15.926 18.54M9.13 5.13C10.359 5.043 11.666 5 12 5C17 5 20.333 7.333 21.878 12.3C22.5 14.1 22.898 15.725 23 17.3" stroke="currentColor" strokeWidth="1.5" strokeLinecap="round" strokeLinejoin="round"/>
                  </svg>
                ) : (
                  <svg width="20" height="20" viewBox="0 0 24 24" fill="none" xmlns="http://www.w3.org/2000/svg">
                    <path d="M1 12C1 12 5 5 12 5C19 5 23 12 23 12C23 12 19 19 12 19C5 19 1 12 1 12Z" stroke="currentColor" strokeWidth="1.5" strokeLinecap="round" strokeLinejoin="round"/>
                    <circle cx="12" cy="12" r="3" stroke="currentColor" strokeWidth="1.5"/>
                  </svg>
                )}
              </button>
            </div>
          </div>
        </div>

        <div className="flex flex-wrap justify-between items-center gap-3 text-sm text-slate-600">
          <label className="flex items-center gap-2 cursor-pointer">
            <input
              type="checkbox"
              className="w-4 h-4 rounded border-2 border-teal-500 accent-teal-500 bg-white"
            />
            Remember me
          </label>

          <Link
            to="/forgot-password"
            className="text-teal-500 font-semibold hover:text-teal-600"
          >
            Forgot password?
          </Link>
        </div>

        <button
          type="button"
          onClick={() => navigate("/home")}
          className="w-full rounded-full bg-teal-500 py-4 text-base font-bold text-white shadow-lg hover:bg-teal-600 transition-colors"
        >
          Sign In
        </button>



        <p className="text-center text-sm text-slate-600">
          Don't have an account?{' '}
          <Link to="/signup" className="font-bold text-teal-500 hover:text-teal-600">
            Sign up
          </Link>
        </p>
      </form>
    </AuthLayout>
  );
}