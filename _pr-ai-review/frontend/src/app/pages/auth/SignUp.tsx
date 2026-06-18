import { Link, useLocation, useNavigate } from "react-router-dom";
import AuthLayout from "../../components/auth/AuthLayout";

export default function SignUp() {
  const navigate = useNavigate();
  const location = useLocation();
  const roleParam = new URLSearchParams(location.search).get("role") ?? "";
  const roleLabel = roleParam
    ? roleParam.charAt(0).toUpperCase() + roleParam.slice(1)
    : "Your selected role";
  const isDoctor = roleParam === "doctor";
  const isNurse = roleParam === "nurse";

  const handleSignUp = () => {
    // Later call API here

    navigate("/home");
  };

  return (
    <AuthLayout
      title="Create Account"
      subtitle="Join MedWasla"
    >
      <div className="mb-6">
        <div className="flex items-center justify-between gap-4 mb-4">
          <Link to="/role" className="text-sm font-semibold text-teal-500 hover:text-teal-600">
            ← Change role
          </Link>
          {roleParam && (
            <div className="inline-flex items-center gap-2 rounded-full border border-slate-200 bg-slate-50 px-4 py-2 text-sm font-semibold text-slate-900 shadow-sm">
              <span className="text-teal-500">●</span>
              {`Registering as ${roleLabel}`}
            </div>
          )}
        </div>
      </div>

      <form className="space-y-5">
        <div className="grid gap-4 sm:grid-cols-2">
          <div>
            <label className="block text-sm font-semibold text-slate-700 mb-2">First Name</label>
            <input
              placeholder="John"
              className="w-full rounded-2xl border border-slate-200 bg-slate-50 px-4 py-4 text-slate-900 placeholder:text-slate-400 outline-none focus:border-teal-500 focus:ring-2 focus:ring-teal-100"
            />
          </div>
          <div>
            <label className="block text-sm font-semibold text-slate-700 mb-2">Last Name</label>
            <input
              placeholder="Doe"
              className="w-full rounded-2xl border border-slate-200 bg-slate-50 px-4 py-4 text-slate-900 placeholder:text-slate-400 outline-none focus:border-teal-500 focus:ring-2 focus:ring-teal-100"
            />
          </div>
        </div>

        <div>
          <label className="block text-sm font-semibold text-slate-700 mb-2">Email Address</label>
          <input
            placeholder="your.email@example.com"
            className="w-full rounded-2xl border border-slate-200 bg-slate-50 px-4 py-4 text-slate-900 placeholder:text-slate-400 outline-none focus:border-teal-500 focus:ring-2 focus:ring-teal-100"
          />
        </div>

        <div>
          <label className="block text-sm font-semibold text-slate-700 mb-2">Phone Number</label>
          <input
            placeholder="+1 (234) 567-890"
            className="w-full rounded-2xl border border-slate-200 bg-slate-50 px-4 py-4 text-slate-900 placeholder:text-slate-400 outline-none focus:border-teal-500 focus:ring-2 focus:ring-teal-100"
          />
        </div>




{(isDoctor || isNurse) && (
  <div className="rounded-2xl border border-slate-200 bg-slate-50 p-4">
    <p className="text-sm font-semibold text-slate-700 mb-4">
      Professional Information
    </p>

    {isDoctor && (
      <div className="space-y-4">
        <div>
          <label className="block text-sm font-semibold text-slate-700 mb-2">
            Medical Specialty
          </label>
          <input
            placeholder="e.g., Cardiology, Pediatrics"
            className="w-full rounded-2xl border border-slate-200 bg-white px-4 py-4 text-slate-900 placeholder:text-slate-400 outline-none focus:border-teal-500 focus:ring-2 focus:ring-teal-100"
          />
        </div>

        <div>
          <label className="block text-sm font-semibold text-slate-700 mb-2">
            Medical License Number
          </label>
          <input
            placeholder="Enter your medical license number"
            className="w-full rounded-2xl border border-slate-200 bg-white px-4 py-4 text-slate-900 placeholder:text-slate-400 outline-none focus:border-teal-500 focus:ring-2 focus:ring-teal-100"
          />
        </div>

        <div>
          <label className="block text-sm font-semibold text-slate-700 mb-2">
            Office/Clinic Location
          </label>
          <input
            placeholder="e.g., Building A, Floor 3"
            className="w-full rounded-2xl border border-slate-200 bg-white px-4 py-4 text-slate-900 placeholder:text-slate-400 outline-none focus:border-teal-500 focus:ring-2 focus:ring-teal-100"
          />
        </div>

        <div>
          <label className="block text-sm font-semibold text-slate-700 mb-2">
            Do you provide home service?
          </label>

          <div className="flex gap-4">
            <button
              type="button"
              className="px-6 py-3 rounded-xl border border-slate-200 hover:border-teal-500 hover:bg-teal-50"
            >
              Yes
            </button>

            <button
              type="button"
              className="px-6 py-3 rounded-xl border border-slate-200 hover:border-teal-500 hover:bg-teal-50"
            >
              No
            </button>
          </div>
        </div>
      </div>
    )}

    {isNurse && (
      <div className="space-y-4">
        <div>
          <label className="block text-sm font-semibold text-slate-700 mb-2">
            Nursing License Number
          </label>
          <input
            placeholder="Enter your nursing license number"
            className="w-full rounded-2xl border border-slate-200 bg-white px-4 py-4 text-slate-900 placeholder:text-slate-400 outline-none focus:border-teal-500 focus:ring-2 focus:ring-teal-100"
          />
        </div>

        <div>
          <label className="block text-sm font-semibold text-slate-700 mb-2">
            Service Area
          </label>
          <input
            placeholder="e.g., New York City, Brooklyn"
            className="w-full rounded-2xl border border-slate-200 bg-white px-4 py-4 text-slate-900 placeholder:text-slate-400 outline-none focus:border-teal-500 focus:ring-2 focus:ring-teal-100"
          />
        </div>
      </div>
    )}
  </div>
)}




        <div className="grid gap-4 sm:grid-cols-2">
          <div>
            <label className="block text-sm font-semibold text-slate-700 mb-2">Password</label>
            <input
              type="password"
              placeholder="Create a strong password"
              className="w-full rounded-2xl border border-slate-200 bg-slate-50 px-4 py-4 text-slate-900 placeholder:text-slate-400 outline-none focus:border-teal-500 focus:ring-2 focus:ring-teal-100"
            />
          </div>
          <div>
            <label className="block text-sm font-semibold text-slate-700 mb-2">Confirm Password</label>
            <input
              type="password"
              placeholder="Re-enter your password"
              className="w-full rounded-2xl border border-slate-200 bg-slate-50 px-4 py-4 text-slate-900 placeholder:text-slate-400 outline-none focus:border-teal-500 focus:ring-2 focus:ring-teal-100"
            />
          </div>
        </div>

        <label className="flex items-center gap-3 text-sm text-slate-600">
          <input type="checkbox" className="h-4 w-4 rounded border-slate-300 text-teal-500 focus:ring-teal-500" />
          I agree to the <span className="font-semibold text-teal-500">Terms of Service</span> and <span className="font-semibold text-teal-500">Privacy Policy</span>
        </label>

        <button
          type="button"
          onClick={handleSignUp}
          className="w-full rounded-3xl bg-teal-500 py-4 text-base font-bold text-white shadow-lg hover:bg-teal-600 transition-colors"
        >
          Create Account
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