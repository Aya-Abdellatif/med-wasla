import { useState } from "react";
import { useLocation, useNavigate } from "react-router-dom";
import AuthLayout from "../../components/auth/AuthLayout";

export default function ResetPassword() {
  const [showPassword, setShowPassword] = useState(false);
  const navigate = useNavigate();
  const location = useLocation();

  const email = location.state?.email || "";

  const handleResetPassword = () => {
    //hanady hna el API lma n3ml el backedn

    navigate("/");
  };

  return (
    <AuthLayout
      title="Reset Password"
      subtitle="Create a new password"
    >
      <form className="space-y-6">
        <div>
          <label className="block text-sm font-semibold text-slate-700 mb-2">Email Address</label>
          <div className="relative flex items-center bg-slate-50 border border-slate-200 rounded-full focus-within:border-teal-500 transition-colors">
            <span className="absolute left-4 text-slate-400" aria-hidden="true">
              <svg width="20" height="20" viewBox="0 0 24 24" fill="none" xmlns="http://www.w3.org/2000/svg">
                <path d="M4 6.5C4 5.11929 5.11929 4 6.5 4H17.5C18.8807 4 20 5.11929 20 6.5V17.5C20 18.8807 18.8807 20 17.5 20H6.5C5.11929 20 4 18.8807 4 17.5V6.5Z" stroke="currentColor" strokeWidth="1.5" strokeLinecap="round" strokeLinejoin="round"/>
                <path d="M4 7.5L12 13L20 7.5" stroke="currentColor" strokeWidth="1.5" strokeLinecap="round" strokeLinejoin="round"/>
              </svg>
            </span>
            <input
              value={email}
              readOnly
              className="w-full bg-transparent px-14 py-4 text-slate-900 placeholder:text-slate-400 outline-none rounded-full cursor-not-allowed"
            />
          </div>
        </div>

        <div>
          <label className="block text-sm font-semibold text-slate-700 mb-2">OTP</label>
          <div className="relative flex items-center bg-slate-50 border border-slate-200 rounded-full focus-within:border-teal-500 transition-colors">
            <input
              placeholder="Enter OTP"
              className="w-full bg-transparent px-5 py-4 text-slate-900 placeholder:text-slate-400 outline-none rounded-full"
            />
          </div>
        </div>

        <div>
          <label className="block text-sm font-semibold text-slate-700 mb-2">New Password</label>
          <div className="relative flex items-center bg-slate-50 border border-slate-200 rounded-full focus-within:border-teal-500 transition-colors">
            <input
              type={showPassword ? "text" : "password"}
              placeholder="New Password"
              className="w-full bg-transparent px-5 py-4 text-slate-900 placeholder:text-slate-400 outline-none rounded-full"
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

        <button
          type="button"
          onClick={handleResetPassword}
          className="w-full rounded-full bg-teal-500 py-4 text-base font-bold text-white shadow-lg hover:bg-teal-600 transition-colors"
        >
          Reset Password
        </button>
                <div className="flex items-center justify-center gap-8 text-sm">
          <button
            type="button"
            onClick={() => navigate("/forgot-password")}
            className="text-slate-500 underline underline-offset-4 decoration-slate-500 hover:text-slate-700"
          >
            Edit Email
          </button>
          <button
            type="button"
            className="text-teal-500 underline underline-offset-4 decoration-teal-500 hover:text-teal-600"
          >
            Resend OTP
          </button>
        </div>
      </form>
    </AuthLayout>
  );
}