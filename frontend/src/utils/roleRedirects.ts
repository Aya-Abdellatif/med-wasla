import type { UserRole } from "../app/context/AuthContext";

export function getDefaultPathForRole(role: UserRole): string {
  switch (role) {
    case "admin":
      return "/admin-dashboard";
    case "doctor":
    case "nurse":
      return "/dashboard";
    case "patient":
      return "/appointments";
    default:
      return "/";
  }
}
