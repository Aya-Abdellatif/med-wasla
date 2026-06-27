import { Navigate } from "react-router-dom";
import { useAuth } from "../../context/useAuth";
import { PatientProfile } from "../patient/PatientProfile";
import { SpecialistProfilePage } from "./SpecialistProfilePage";

export function ProfilePage() {
  const { user } = useAuth();

  if (!user) {
    return <Navigate to="/login" replace />;
  }

  if (user.role === "doctor" || user.role === "nurse") {
    return <SpecialistProfilePage />;
  }

  if (user.role === "patient") {
    return <PatientProfile />;
  }

  return <Navigate to="/" replace />;
}
