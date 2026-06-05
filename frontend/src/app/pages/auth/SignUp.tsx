import { Link, useNavigate } from "react-router-dom";
import AuthLayout from "../../components/auth/AuthLayout";

export default function SignUp() {
  const navigate = useNavigate();

  const handleSignUp = () => {
    // Later call API here

    navigate("/home");
  };

  return (
    <AuthLayout
      title="Create Account"
      subtitle="Join MedWasla"
    >
      <form className="space-y-6">
        <div className="space-y-4">
          <div>
            <label className="block text-sm font-semibold text-slate-700 mb-2">Full Name</label>
            <div className="relative flex items-center bg-slate-50 border border-slate-200 rounded-full focus-within:border-teal-500 transition-colors">
              <input
                placeholder="Full Name"
                className="w-full bg-transparent px-5 py-4 text-slate-900 placeholder:text-slate-400 outline-none rounded-full"
              />
            </div>
          </div>

          <div>
            <label className="block text-sm font-semibold text-slate-700 mb-2">Email Address</label>
            <div className="relative flex items-center bg-slate-50 border border-slate-200 rounded-full focus-within:border-teal-500 transition-colors">
              <input
                placeholder="your.email@example.com"
                className="w-full bg-transparent px-5 py-4 text-slate-900 placeholder:text-slate-400 outline-none rounded-full"
              />
            </div>
          </div>

          <div>
            <label className="block text-sm font-semibold text-slate-700 mb-2">Password</label>
            <div className="relative flex items-center bg-slate-50 border border-slate-200 rounded-full focus-within:border-teal-500 transition-colors">
              <input
                type="password"
                placeholder="Password"
                className="w-full bg-transparent px-5 py-4 text-slate-900 placeholder:text-slate-400 outline-none rounded-full"
              />
            </div>
          </div>
        </div>

        <button
          type="button"
          onClick={handleSignUp}
          className="w-full rounded-full bg-teal-500 py-4 text-base font-bold text-white shadow-lg hover:bg-teal-600 transition-colors"
        >
          Sign Up
        </button>

        <p className="text-center text-sm text-slate-600">
          Already have an account?{' '}
          <Link to="/" className="font-bold text-teal-500 hover:text-teal-600">
            Sign In
          </Link>
        </p>
      </form>
    </AuthLayout>
  );
}