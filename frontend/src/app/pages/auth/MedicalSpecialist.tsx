import { Link, useNavigate } from "react-router-dom";
import AuthLayout from "../../components/auth/AuthLayout";

export default function MedicalSpecialist() {
  const navigate = useNavigate();

  const selectRole = (role: string) => {
    navigate(`/signup?role=${role}`);
  };

  return (
    <AuthLayout
      title="Create Your Account"
      subtitle="Choose your role to get started"
      wide
    >
      <div className="w-full">
        <div className="bg-white rounded-2xl border border-slate-100 shadow-sm p-8">
          <h3 className="text-center text-xl font-semibold mb-6">
            I want to register as...
          </h3>

          <div className="max-w-4xl mx-auto">
            <div className="grid grid-cols-1 sm:grid-cols-2 gap-8">
              
              {/* Doctor */}
              <button
                onClick={() => selectRole("doctor")}
                className="flex flex-col items-center gap-4 p-8 bg-white border border-slate-200 rounded-xl shadow-sm hover:shadow-md transition-shadow text-center"
                aria-label="Register as doctor"
              >
                <div className="w-20 h-20 rounded-xl bg-blue-500 flex items-center justify-center text-white text-3xl">
                  👤
                </div>
                <div className="font-semibold text-lg">Doctor</div>
                <div className="text-sm text-slate-500">
                  Book appointments and manage your health record
                </div>
              </button>

              {/*Nurse*/}
              <button
                onClick={() => selectRole("nurse")}
                className="flex flex-col items-center gap-4 p-8 bg-white border border-slate-200 rounded-xl shadow-sm hover:shadow-md transition-shadow text-center"
                aria-label="Register as nurse"
              >
                <div className="w-20 h-20 rounded-xl bg-teal-500 flex items-center justify-center text-white text-3xl">
                  🩺
                </div>
                <div className="font-semibold text-lg">
                  Nurse
                </div>
                <div className="text-sm text-slate-500">
                  Provide medical services and manage patient care
                </div>
              </button>

            </div>

            <p className="text-center text-sm text-slate-600 mt-8">
              Already have an account?{" "}
              <Link to="/" className="font-bold text-teal-500 hover:text-teal-600">
                Sign in
              </Link>
            </p>
          </div>
        </div>
      </div>
    </AuthLayout>
  );
}