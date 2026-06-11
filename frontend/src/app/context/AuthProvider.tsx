import { useState } from "react";
import type { ReactNode } from "react";
import { AuthContext } from "./AuthContextType";
import type { User, UserRole } from "./AuthContext";

export function AuthProvider({ children }: { children: ReactNode }) {
  const [user, setUser] = useState<User | null>(null);

  const login = async (
    email: string,
    _password: string,
    role: UserRole
  ) => {
    await new Promise((resolve) => setTimeout(resolve, 1000));

    const mockUser: User = {
      id: "1",
      name:
        role === "patient"
          ? "John Doe"
          : role === "doctor"
          ? "Dr. Sarah Williams"
          : "Nurse Emily Johnson",
      email,
      role,
      avatar:
        role === "doctor"
          ? "https://images.unsplash.com/photo-1632054224477-c9cb3aae1b7e?crop=entropy&cs=tinysrgb&fit=max&fm=jpg&ixid=M3w3Nzg4Nzd8MHwxfHNlYXJjaHwxfHxmZW1hbGUlMjBkb2N0b3IlMjBwcm9mZXNzaW9uYWx8ZW58MXx8fHwxNzc3NzI3Njk4fDA&ixlib=rb-4.1.0&q=80&w=1080"
          : role === "nurse"
          ? "https://images.unsplash.com/photo-1594824476967-48c8b964273f?crop=entropy&cs=tinysrgb&fit=max&fm=jpg&ixid=M3w3Nzg4Nzd8MHwxfHNlYXJjaHwxfHxudXJzZSUyMHByb2Zlc3Npb25hbHxlbnwxfHx8fDE3Nzc3Mjc2OTl8MA&ixlib=rb-4.1.0&q=80&w=1080"
          : undefined,
      specialty: role === "doctor" ? "Cardiology" : undefined,
      experience: role !== "patient" ? "10 years" : undefined,
      location: role !== "patient" ? "Building A, Floor 3" : undefined,
      certificates:
        role === "doctor" || role === "nurse"
          ? [
              {
                id: "1",
                name: "Board Certification in Cardiology",
                issuer: "American Board of Internal Medicine",
                issueDate: "2015-06-15",
                verified: true,
              },
              {
                id: "2",
                name: "Advanced Cardiac Life Support (ACLS)",
                issuer: "American Heart Association",
                issueDate: "2023-01-10",
                verified: true,
              },
              {
                id: "3",
                name: "Fellowship in Cardiology",
                issuer: "Johns Hopkins University",
                issueDate: "2018-08-20",
                verified: false,
              },
            ]
          : undefined,
      diseaseHistory:
        role === "patient"
          ? [
              {
                id: "1",
                disease: "Hypertension",
                diagnosedDate: "2020-03-15",
                treatedBy: "Dr. Michael Chen",
                status: "under_treatment",
                notes: "Blood pressure controlled with medication",
              },
              {
                id: "2",
                disease: "Type 2 Diabetes",
                diagnosedDate: "2019-07-22",
                treatedBy: "Dr. Sarah Williams",
                status: "under_treatment",
                notes: "HbA1c levels stable with diet and medication",
              },
            ]
          : undefined,
    };

    setUser(mockUser);
  };

  const logout = () => setUser(null);

  const updateProfile = (data: Partial<User>) => {
    if (user) setUser({ ...user, ...data });
  };

  return (
    <AuthContext.Provider
      value={{ user, isAuthenticated: !!user, login, logout, updateProfile }}
    >
      {children}
    </AuthContext.Provider>
  );
}
