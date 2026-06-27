import { Routes, Route } from "react-router-dom";
import { AuthProvider } from "./app/context/AuthProvider";
import { ChatBotProvider } from "./app/context/ChatBotProvider";
import AppToast from "./app/components/common/AppToast";
import SignIn from "./app/pages/auth/SignIn";
import SignUp from "./app/pages/auth/SignUp";
import VerifyOtp from "./app/pages/auth/VerifyOtp";
import ForgotPassword from "./app/pages/auth/ForgotPassword";
import ResetPassword from "./app/pages/auth/ResetPassword";
import Role from "./app/pages/auth/Role";
import MedicalSpecialist from "./app/pages/auth/MedicalSpecialist";
import AboutPage from "./app/pages/about/AboutPage";
import { Dashboard } from "./app/pages/Doctor side/Dashboard";
import ContactPage from "./app/pages/contact/ContactPage";

import { PatientProfile } from "./app/pages/patient/PatientProfile";
import { MyAppointments } from "./app/pages/patient/PatientAppointments";

import MainLayout from "./app/Layouts/MainLayout";
import Home from "./app/pages/Home";
import ServicesPage from "./app/pages/Services/ServicesPage";

import { Doctors } from "./app/pages/public/DoctorsPage";
import { Nurses } from "./app/pages/public/NursesPage";
import { DoctorProfile } from "./app/pages/public/DoctorProfile";
import { NurseProfile } from "./app/pages/public/NurseProfile";
import AdminDashboard from "./app/pages/admin/AdminDashboard";

import { ProtectedRoute } from "./app/components/common/ProtectedRoute";

import NotFound from "./app/pages/NotFound";

function App() {
  return (
    <AuthProvider>
      <ChatBotProvider>
        <AppToast />
        <Routes>
          <Route path="/login" element={<SignIn />} />
          <Route path="/role" element={<Role />} />
          <Route path="/signup" element={<SignUp />} />
          <Route path="/verify-otp" element={<VerifyOtp />} />
          <Route path="/medical-specialist" element={<MedicalSpecialist />} />
          <Route path="/forgot-password" element={<ForgotPassword />} />
          <Route path="/reset-password" element={<ResetPassword />} />

          <Route path="/admin-dashboard" element={<AdminDashboard />} />

          <Route element={<MainLayout />}>
            <Route path="/" element={<Home />} />
            <Route path="/about" element={<AboutPage />} />
            <Route path="/contact" element={<ContactPage />} />
            <Route path="/services" element={<ServicesPage />} />
            <Route path="/doctors" element={<Doctors />} />
            <Route path="/nurses" element={<Nurses />} />
            <Route path="/doctor/:id" element={<DoctorProfile />} />
            <Route path="/nurse/:id" element={<NurseProfile />} />
            <Route element={<ProtectedRoute />}>
              <Route path="/dashboard" element={<Dashboard />} />
              <Route path="/profile" element={<PatientProfile />} />
              <Route path="/appointments" element={<MyAppointments />} />
            </Route>
            <Route path="*" element={<NotFound />} />
          </Route>
        </Routes>
      </ChatBotProvider>
    </AuthProvider>
  );
}

export default App;
