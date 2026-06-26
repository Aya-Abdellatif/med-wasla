import { useCallback, useEffect, useState } from "react";
import type { ReactNode } from "react";
import { AuthContext } from "./AuthContextType";
import type { Certificate, User, UserRole } from "./AuthContext";
import {
  API_BASE,
  apiFetch,
  clearToken,
  getToken,
  setToken,
} from "../../services/api";

interface AuthUserResponse {
  id?: string;
  _id?: string;
  name: string;
  email: string;
  role: string;
}

interface LoginResponse {
  token: string;
  user: AuthUserResponse;
}

interface SpecialistProfile {
  _id: string;
  specialistType: "doctor" | "nurse";
  specialization?: string;
  clinicAddress?: string;
  bio?: string;
  verificationStatus: "pending" | "approved" | "rejected";
  homeVisit?: boolean;
  availableSlots?: Array<{ day: string; startTime: string; endTime: string }>;
  pendingProfileUpdates?: {
    bio?: string;
    clinicAddress?: string;
    specialization?: string;
  };
  certifications?: Array<{
    _id?: string;
    title: string;
    issuedBy: string;
    issuedAt?: string;
    certificateUrl: string;
    status: "pending" | "approved" | "rejected";
  }>;
  userId?: {
    name: string;
    email: string;
    phone: string;
    address: string;
    photoUrl?: string;
  };
}

function mapCertificates(
  certifications: SpecialistProfile["certifications"],
): Certificate[] {
  return (certifications ?? []).map((cert, index) => ({
    id: cert._id ?? String(index),
    name: cert.title,
    issuer: cert.issuedBy,
    issueDate: cert.issuedAt ?? new Date().toISOString(),
    fileUrl: cert.certificateUrl,
    verified: cert.status === "approved",
    status: cert.status,
  }));
}

function mapBackendRole(role: string, specialistType?: string): UserRole {
  if (role === "admin") return "admin";
  if (role === "patient") return "patient";
  if (specialistType === "nurse") return "nurse";
  return "doctor";
}

async function fetchSpecialistProfile(token: string): Promise<SpecialistProfile | null> {
  const res = await fetch(`${API_BASE}/api/specialists/me`, {
    headers: { Authorization: `Bearer ${token}` },
  });
  const json = await res.json();
  if (!res.ok) return null;
  return json.data as SpecialistProfile;
}

async function buildUser(authUser: AuthUserResponse, token: string): Promise<User> {
  if (authUser.role === "specialist") {
    const profile = await fetchSpecialistProfile(token);
    const userInfo = profile?.userId;

    return {
      id: authUser.id,
      name: userInfo?.name ?? authUser.name,
      email: userInfo?.email ?? authUser.email,
      phone: userInfo?.phone,
      role: mapBackendRole(authUser.role, profile?.specialistType),
      avatar: userInfo?.photoUrl,
      specialty: profile?.specialization,
      location: profile?.clinicAddress,
      bio: profile?.bio,
      verificationStatus: profile?.verificationStatus ?? "pending",
      specialistId: profile?._id,
      homeVisit: profile?.homeVisit ?? false,
      availableSlots: profile?.availableSlots ?? [],
      pendingProfileUpdates: profile?.pendingProfileUpdates
        ? {
            bio: profile.pendingProfileUpdates.bio,
            location: profile.pendingProfileUpdates.clinicAddress,
            specialty: profile.pendingProfileUpdates.specialization,
          }
        : undefined,
      certificates: mapCertificates(profile?.certifications),
    };
  }

  return {
    id: authUser.id,
    name: authUser.name,
    email: authUser.email,
    role: mapBackendRole(authUser.role),
  };
}

export function AuthProvider({ children }: { children: ReactNode }) {
  const [user, setUser] = useState<User | null>(null);
  const [isLoading, setIsLoading] = useState(true);

  const refreshSpecialistProfile = useCallback(async () => {
    const token = getToken();
    if (!token) return;

    const profile = await fetchSpecialistProfile(token);
    if (!profile) return;

    const userInfo = profile.userId;
    setUser((prev) => {
      if (!prev || (prev.role !== "doctor" && prev.role !== "nurse")) return prev;

      return {
        ...prev,
        name: userInfo?.name ?? prev.name,
        email: userInfo?.email ?? prev.email,
        phone: userInfo?.phone ?? prev.phone,
        avatar: userInfo?.photoUrl ?? prev.avatar,
        specialty: profile.specialization ?? prev.specialty,
        location: profile.clinicAddress ?? prev.location,
        bio: profile.bio ?? prev.bio,
        verificationStatus: profile.verificationStatus,
        specialistId: profile._id,
        homeVisit: profile.homeVisit ?? prev.homeVisit,
        availableSlots: profile.availableSlots ?? prev.availableSlots ?? [],
        pendingProfileUpdates: profile.pendingProfileUpdates
          ? {
              bio: profile.pendingProfileUpdates.bio,
              location: profile.pendingProfileUpdates.clinicAddress,
              specialty: profile.pendingProfileUpdates.specialization,
            }
          : undefined,
        certificates: mapCertificates(profile.certifications),
      };
    });
  }, []);

  useEffect(() => {
    const restoreSession = async () => {
      const token = getToken();
      if (!token) {
        setIsLoading(false);
        return;
      }

      try {
        const data = await apiFetch<{ data: { user: AuthUserResponse } }>(
          "/api/auth/me",
        );
        const restoredUser = await buildUser(data.data.user, token);
        setUser(restoredUser);
      } catch {
        clearToken();
      } finally {
        setIsLoading(false);
      }
    };

    restoreSession();
  }, []);

  const login = async (email: string, password: string): Promise<User> => {
    const data = await apiFetch<LoginResponse>("/api/auth/login", {
      method: "POST",
      body: JSON.stringify({ email, password }),
    });

    setToken(data.token);
    const loggedInUser = await buildUser(data.user, data.token);
    setUser(loggedInUser);
    return loggedInUser;
  };

  const logout = () => {
    clearToken();
    setUser(null);
  };

  const updateProfile = (data: Partial<User>) => {
    if (user) setUser({ ...user, ...data });
  };

  return (
    <AuthContext.Provider
      value={{
        user,
        isAuthenticated: !!user,
        isLoading,
        login,
        logout,
        updateProfile,
        refreshSpecialistProfile,
      }}
    >
      {children}
    </AuthContext.Provider>
  );
}
