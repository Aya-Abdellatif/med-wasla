import { Routes, Route } from "react-router-dom";
import { AuthProvider } from "./app/context/AuthProvider";
import SignIn from "./app/pages/auth/SignIn";
import SignUp from "./app/pages/auth/SignUp";
import ForgotPassword from "./app/pages/auth/ForgotPassword";
import ResetPassword from "./app/pages/auth/ResetPassword";
import AboutPage from "./app/pages/about/AboutPage";
import { Dashboard } from "./app/pages/Doctor side/Dashboard";
import ContactPage from "./app/pages/contact/ContactPage";
import { PatientProfile } from "./app/pages/patient/PatientProfile";

import MainLayout from "./app/Layouts/MainLayout";
import Home from "./app/pages/Home";
import ServicesPage from "./app/pages/Services/ServicesPage";


import { Doctors } from "./app/pages/public/DoctorsPage";
import { Nurses } from "./app/pages/public/NursesPage";
import { DoctorProfile } from "./app/pages/public/DoctorProfile";
import { NurseProfile } from "./app/pages/public/NurseProfile";

function App() {
  return (
     <AuthProvider>
    <Routes>
      <Route path="/" element={<SignIn />} />
      <Route path="/signup" element={<SignUp />} />
      <Route path="/forgot-password" element={<ForgotPassword />}/>
      <Route path="/reset-password" element={<ResetPassword />}/>
      <Route path="/doctor/:id" element={<DoctorProfile />} />
      <Route path="/nurse/:id" element={<NurseProfile />} />
      
      <Route element={<MainLayout />}>
        <Route path="/home" element={<Home />} />
        <Route path="/about" element={<AboutPage />} />
        <Route path="/contact" element={<ContactPage />} />
        <Route path="/services" element={<ServicesPage />} />
        <Route path="/dashboard" element={<Dashboard />} />
        <Route path="/doctors" element={<Doctors />} />
        <Route path="/nurses" element={<Nurses />} />
        <Route path="/patient-profile" element={<PatientProfile />} />
      </Route>
    </Routes>
    </AuthProvider>
  );
}

export default App;

 