import { Routes, Route } from "react-router-dom";
import { AuthProvider } from "./app/context/AuthContext";
import SignIn from "./app/pages/auth/SignIn";
import SignUp from "./app/pages/auth/SignUp";
import ForgotPassword from "./app/pages/auth/ForgotPassword";
import ResetPassword from "./app/pages/auth/ResetPassword";
import { Dashboard } from "./app/pages/Doctor side/Dashboard";
import { PatientProfile } from "./app/pages/patient/PatientProfile";

function App() {
  return (
    <AuthProvider>
      <Routes>
        <Route path="/" element={<SignIn />} />
        <Route path="/signup" element={<SignUp />} />
        <Route path="/forgot-password" element={<ForgotPassword />}/>
        <Route path="/reset-password" element={<ResetPassword />}/>
        <Route path="/dashboard" element={<Dashboard />}/>
        <Route path="/patient-profile" element={<PatientProfile />} />

      </Routes>
    </AuthProvider>
  );
}

export default App;
