import { Navigate, Outlet } from "react-router-dom";
import { useAuth } from "../../context/useAuth";
import type { UserRole } from "../../context/AuthContext";
import NotFound from "../../pages/NotFound";
import { LoadingPage } from "./LoadingPage";

interface RoleProtectedRouteProps {
  allowedRoles: UserRole[];
}

export function RoleProtectedRoute({ allowedRoles }: RoleProtectedRouteProps) {
  const { user, isLoading } = useAuth();

  if (isLoading) {
    return <LoadingPage />;
  }

  if (!user) {
    return <Navigate to="/login" replace />;
  }

  if (!allowedRoles.includes(user.role)) {
    return <NotFound />;
  }

  return <Outlet />;
}
