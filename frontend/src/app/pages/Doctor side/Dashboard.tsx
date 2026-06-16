import { useState, useEffect, useRef, useMemo } from "react";
import { useAuth } from "../../context/useAuth";
import type { User } from "../../context/AuthContext";
import { apiFetch } from "../../../services/api";
import { showError, showSuccess, showWarning } from "../../../utils/toast";
import { MEDICAL_SPECIALIZATIONS } from "../../../constants/medicalSpecializations";
import { getFirstName, getDisplayInitial } from "../../../utils/displayName";
import { resizeImageToDataUrl } from "../../../utils/imageToDataUrl";

import {
  Calendar,
  Clock,
  Users,
  TrendingUp,
  CheckCircle,
  XCircle,
  Home as HomeIcon,
//   User as UserIcon,
  Edit,
  Save,
  Phone,
  Mail,
  MapPin,
  Award,
  FileCheck,
  Upload,
  Clock as ClockIcon
} from "lucide-react";

interface Appointment {
  id: string;
  patientName: string;
  patientAvatar?: string;
  time: string;
  date: string;
  type: string;
  status: "scheduled" | "completed" | "cancelled";
}

interface HomeServiceRequest {
  id: string;
  patientName: string;
  address: string;
  service: string;
  requestedDate: string;
  requestedTime: string;
  status: "pending" | "accepted" | "rejected";
  phone: string;
}

// Generate a consistent color based on name initial
function getAvatarColor(name: string): { bg: string; text: string } {
  const colors = [
    { bg: "#e0f2fe", text: "#0369a1" }, // sky
    { bg: "#d1fae5", text: "#065f46" }, // emerald
    { bg: "#ede9fe", text: "#5b21b6" }, // violet
    { bg: "#fce7f3", text: "#9d174d" }, // pink
    { bg: "#fef3c7", text: "#92400e" }, // amber
    { bg: "#e0e7ff", text: "#3730a3" }, // indigo
    { bg: "#ccfbf1", text: "#0f766e" }, // teal
  ];
  const index = (name.charCodeAt(0) || 0) % colors.length;
  return colors[index];
}

interface ProfileForm {
  name: string;
  email: string;
  phone: string;
  specialty: string;
  experience: string;
  location: string;
  bio: string;
}

function buildProfileFormFromUser(user?: User | null): ProfileForm {
  return {
    name: user?.name || "",
    email: user?.email || "",
    phone: user?.phone || "",
    specialty: user?.specialty || "",
    experience: user?.experience || "",
    location: user?.location || "",
    bio: user?.bio || "",
  };
}

interface AvatarProps {
  src?: string;
  name: string;
  size?: "sm" | "md" | "lg";
}

function Avatar({ src, name, size = "md" }: AvatarProps) {
  const sizeMap = { sm: "w-10 h-10 text-base", md: "w-12 h-12 text-lg", lg: "w-24 h-24 text-3xl" };
  const { bg, text } = getAvatarColor(name);
  const initial = getDisplayInitial(name);

  if (src) {
    return (
      <img
        src={src}
        alt={name}
        className={`${sizeMap[size]} rounded-full object-cover shrink-0`}
      />
    );
  }

  return (
    <div
      className={`${sizeMap[size]} rounded-full flex items-center justify-center font-semibold shrink-0`}
      style={{ backgroundColor: bg, color: text }}
    >
      {initial}
    </div>
  );
}

export function Dashboard() {
  const { user, updateProfile, refreshSpecialistProfile } = useAuth();
  const [activeTab, setActiveTab] = useState<"overview" | "schedule" | "profile" | "requests">("overview");
  const [isEditingProfile, setIsEditingProfile] = useState(false);
  const [isSaving, setIsSaving] = useState(false);
  const [showCertForm, setShowCertForm] = useState(false);
  const [isUploadingPhoto, setIsUploadingPhoto] = useState(false);
  const photoInputRef = useRef<HTMLInputElement>(null);
  const [newCert, setNewCert] = useState({ title: "", issuedBy: "", certificateUrl: "" });
  const savedProfile = useMemo(() => buildProfileFormFromUser(user), [user]);
  const [profileData, setProfileData] = useState<ProfileForm>(buildProfileFormFromUser(user));

  useEffect(() => {
    if (user?.role === "doctor" || user?.role === "nurse") {
      refreshSpecialistProfile();
    }
  }, [user?.id, user?.role, refreshSpecialistProfile]);

  const startEditingProfile = () => {
    setProfileData(buildProfileFormFromUser(user));
    setIsEditingProfile(true);
  };

  const cancelEditingProfile = () => {
    setIsEditingProfile(false);
  };

  const formValues = isEditingProfile ? profileData : savedProfile;

  // Dynamic date
  const today = new Date();
  const formattedDate = today.toLocaleDateString("en-US", {
    weekday: "long",
    year: "numeric",
    month: "long",
    day: "numeric",
  });

  // Today's date string for filtering
  const todayStr = today.toISOString().split("T")[0];

  const [appointments] = useState<Appointment[]>([
    { id: "1", patientName: "John Smith", time: "09:00 AM", date: todayStr, type: "Check-up", status: "scheduled" },
    { id: "2", patientName: "Sarah Johnson", time: "10:30 AM", date: todayStr, type: "Follow-up", status: "scheduled" },
    { id: "3", patientName: "Mike Davis", time: "02:00 PM", date: todayStr, type: "Consultation", status: "scheduled" },
    { id: "4", patientName: "Emily Brown", time: "03:30 PM", date: todayStr, type: "Check-up", status: "completed" },
  ]);

  const [homeServiceRequests, setHomeServiceRequests] = useState<HomeServiceRequest[]>([
    { id: "1", patientName: "Robert Wilson", address: "123 Main St, Apt 4B, New York, NY 10001", service: "Blood Pressure Monitoring", requestedDate: "2026-06-04", requestedTime: "10:00 AM", status: "pending", phone: "+1 (234) 567-8901" },
    { id: "2", patientName: "Linda Martinez", address: "456 Oak Ave, Brooklyn, NY 11201", service: "Wound Care", requestedDate: "2026-06-04", requestedTime: "02:00 PM", status: "pending", phone: "+1 (234) 567-8902" },
    { id: "3", patientName: "David Lee", address: "789 Pine Rd, Queens, NY 11354", service: "Medication Administration", requestedDate: "2026-06-05", requestedTime: "09:00 AM", status: "pending", phone: "+1 (234) 567-8903" },
  ]);

  const handlePhotoUpload = async (e: React.ChangeEvent<HTMLInputElement>) => {
    const file = e.target.files?.[0];
    if (!file) return;

    if (!file.type.startsWith("image/")) {
      showWarning("Please select an image file (JPG, PNG, etc.)");
      return;
    }

    if (file.size > 5 * 1024 * 1024) {
      showWarning("Image must be smaller than 5MB");
      return;
    }

    setIsUploadingPhoto(true);
    try {
      const photoUrl = await resizeImageToDataUrl(file);
      const data = await apiFetch<{ data: { photoUrl: string } }>("/api/auth/me/photo", {
        method: "PATCH",
        body: JSON.stringify({ photoUrl }),
      });

      updateProfile({ avatar: data.data.photoUrl });
      await refreshSpecialistProfile();
      showSuccess("Profile photo updated successfully!");
    } catch (err) {
      showError(err instanceof Error ? err.message : "Failed to upload photo");
    } finally {
      setIsUploadingPhoto(false);
      if (photoInputRef.current) photoInputRef.current.value = "";
    }
  };

  const handleUpdateProfile = async () => {
    if (user?.role === "doctor" && !profileData.specialty) {
      showWarning("Please select a medical specialty");
      return;
    }

    setIsSaving(true);
    try {
      await apiFetch("/api/specialists/profile", {
        method: "PUT",
        body: JSON.stringify({
          bio: profileData.bio,
          clinicAddress: profileData.location,
          specialization: profileData.specialty,
        }),
      });
      updateProfile({
        name: profileData.name,
        email: profileData.email,
        specialty: profileData.specialty,
        location: profileData.location,
        bio: profileData.bio,
        verificationStatus: "pending",
      });
      await refreshSpecialistProfile();
      setIsEditingProfile(false);
      showSuccess("Profile updated successfully! Pending admin review.");
    } catch (err) {
      showError(err instanceof Error ? err.message : "Failed to update profile");
    } finally {
      setIsSaving(false);
    }
  };

  const handleAddCertificate = async () => {
    if (!newCert.title || !newCert.issuedBy || !newCert.certificateUrl) {
      showWarning("Please fill all certificate fields");
      return;
    }

    try {
      await apiFetch("/api/specialists/me/certificates", {
        method: "POST",
        body: JSON.stringify(newCert),
      });
      setNewCert({ title: "", issuedBy: "", certificateUrl: "" });
      setShowCertForm(false);
      await refreshSpecialistProfile();
      showSuccess("Certificate submitted for review!");
    } catch (err) {
      showError(err instanceof Error ? err.message : "Failed to upload certificate");
    }
  };

  const handleRequestAction = (requestId: string, action: "accepted" | "rejected") => {
    setHomeServiceRequests((prev) =>
      prev.map((req) => (req.id === requestId ? { ...req, status: action } : req))
    );
    showSuccess(action === "accepted" ? "Request accepted!" : "Request declined.");
  };

  const stats = [
    {
      label: "Today's Appointments",
      value: appointments.filter((a) => a.date === todayStr && a.status === "scheduled").length,
      icon: Calendar,
      iconColor: "#2563eb",
      bgColor: "#eff6ff",
    },
    {
      label: "Completed Today",
      value: appointments.filter((a) => a.date === todayStr && a.status === "completed").length,
      icon: CheckCircle,
      iconColor: "#16a34a",
      bgColor: "#f0fdf4",
    },
    {
      label: "Total Patients",
      value: "156",
      icon: Users,
      iconColor: "#7c3aed",
      bgColor: "#f5f3ff",
    },
    {
      label: user?.role === "nurse" ? "Pending Requests" : "This Week",
      value: user?.role === "nurse" ? homeServiceRequests.filter((r) => r.status === "pending").length : "24",
      icon: user?.role === "nurse" ? HomeIcon : TrendingUp,
      iconColor: "#ea580c",
      bgColor: "#fff7ed",
    },
  ];

  const firstName = getFirstName(user?.name);

  return (
    <div className="min-h-screen" style={{ backgroundColor: "#f8fafc" }}>
      <div className="bg-white border-b border-gray-200">
        <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 py-4 flex flex-wrap items-center justify-between gap-3">
          <p className="text-lg text-gray-600">
            Welcome,{" "}
            <span className="font-semibold text-gray-900">{firstName || "there"}</span>
          </p>
          <p className="text-sm text-gray-500">{formattedDate}</p>
        </div>
      </div>

      {(user?.role === "doctor" || user?.role === "nurse") && user.verificationStatus && (
        <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 pt-4">
          <div
            className={`rounded-xl px-4 py-3 text-sm font-semibold border ${
              user.verificationStatus === "approved"
                ? "bg-green-50 border-green-200 text-green-800"
                : user.verificationStatus === "rejected"
                ? "bg-red-50 border-red-200 text-red-800"
                : "bg-amber-50 border-amber-200 text-amber-800"
            }`}
          >
            {user.verificationStatus === "approved" &&
              "Your profile is approved. You are visible to patients on the doctors page."}
            {user.verificationStatus === "pending" &&
              "Your profile is pending admin review. You can still edit your data and certificates."}
            {user.verificationStatus === "rejected" &&
              "Your profile was rejected by admin. Please update your information and certificates, then wait for re-review."}
          </div>
        </div>
      )}

      {/* Tabs */}
      <div className="bg-white border-b border-gray-200 sticky top-20 z-40">
        <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
          <div className="flex space-x-8">
            {(["overview", "schedule", "profile"] as const).map((tab) => (
              <button
                key={tab}
                onClick={() => setActiveTab(tab)}
                className={`py-4 border-b-2 transition-colors capitalize text-sm font-medium hover:text-teal-600 ${
                  activeTab === tab
                    ? "border-teal-500 text-teal-500"
                    : "border-transparent text-gray-500"
                }`}
              >
                {tab.charAt(0).toUpperCase() + tab.slice(1)}
              </button>
            ))}
            {user?.role === "nurse" && (
              <button
                onClick={() => setActiveTab("requests")}
                className={`py-4 border-b-2 transition-colors relative text-sm font-medium hover:text-teal-600 ${
                  activeTab === "requests"
                    ? "border-teal-500 text-teal-500"
                    : "border-transparent text-gray-500"
                }`}
              >
                Home Service Requests
                {homeServiceRequests.filter((r) => r.status === "pending").length > 0 && (
                  <span
                    className="absolute -top-1 -right-2 w-5 h-5 text-white text-xs rounded-full flex items-center justify-center"
                    style={{ backgroundColor: "#ef4444" }}
                  >
                    {homeServiceRequests.filter((r) => r.status === "pending").length}
                  </span>
                )}
              </button>
            )}
          </div>
        </div>
      </div>

      <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 py-8">
        {/* Overview Tab */}
        {activeTab === "overview" && (
          <div className="space-y-8">
            {/* Stats Grid */}
            <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-4 gap-6">
              {stats.map((stat, index) => {
                const Icon = stat.icon;
                return (
                  <div key={index} className="bg-white rounded-xl p-6 transition-shadow duration-300 hover:shadow-md" style={{ boxShadow: "0 1px 3px rgba(0,0,0,0.1)" }}>
                    <div className="flex items-center justify-between">
                      <div>
                        <p className="text-sm mb-1" style={{ color: "#6b7280" }}>{stat.label}</p>
                        <p className="text-3xl font-bold" style={{ color: "#111827" }}>{stat.value}</p>
                      </div>
                      <div
                        className="w-12 h-12 rounded-lg flex items-center justify-center"
                        style={{ backgroundColor: stat.bgColor }}
                      >
                        <Icon className="w-6 h-6" style={{ color: stat.iconColor }} />
                      </div>
                    </div>
                  </div>
                );
              })}
            </div>

            {/* Today's Schedule */}
            <div className="bg-white rounded-xl p-6" style={{ boxShadow: "0 1px 3px rgba(0,0,0,0.1)" }}>
              <div className="flex items-center justify-between mb-6">
                <h2 className="text-xl font-bold" style={{ color: "#111827" }}>Today's Schedule</h2>
                <button
                  onClick={() => setActiveTab("schedule")}
                  className="text-sm font-medium text-teal-600 hover:text-teal-700 hover:underline transition-colors"
                >
                  View All
                </button>
              </div>
              <div className="space-y-4">
                {appointments
                  .filter((a) => a.date === todayStr && a.status === "scheduled")
                  .map((appointment) => (
                    <div
                      key={appointment.id}
                      className="flex items-center justify-between p-4 rounded-lg border transition-colors hover:bg-gray-50"
                      style={{ borderColor: "#e5e7eb" }}
                    >
                      <div className="flex items-center space-x-4">
                        <Avatar name={appointment.patientName} size="md" />
                        <div>
                          <h3 className="font-semibold" style={{ color: "#111827" }}>{appointment.patientName}</h3>
                          <p className="text-sm" style={{ color: "#6b7280" }}>{appointment.type}</p>
                        </div>
                      </div>
                      <div className="flex items-center space-x-4">
                        <div className="flex items-center space-x-2" style={{ color: "#6b7280" }}>
                          <Clock className="w-4 h-4" />
                          <span className="text-sm">{appointment.time}</span>
                        </div>
                        <span
                          className="px-3 py-1 text-sm rounded-full font-medium"
                          style={{ backgroundColor: "#eff6ff", color: "#2563eb" }}
                        >
                          Scheduled
                        </span>
                      </div>
                    </div>
                  ))}
              </div>
            </div>
          </div>
        )}

        {/* Schedule Tab */}
        {activeTab === "schedule" && (
          <div className="bg-white rounded-xl p-6" style={{ boxShadow: "0 1px 3px rgba(0,0,0,0.1)" }}>
            <h2 className="text-xl font-bold mb-6" style={{ color: "#111827" }}>All Appointments</h2>
            <div className="space-y-4">
              {appointments.map((appointment) => (
                <div
                  key={appointment.id}
                  className="flex items-center justify-between p-4 border rounded-lg transition-colors hover:bg-gray-50"
                  style={{ borderColor: "#e5e7eb" }}
                >
                  <div className="flex items-center space-x-4">
                    <Avatar name={appointment.patientName} size="md" />
                    <div>
                      <h3 className="font-semibold" style={{ color: "#111827" }}>{appointment.patientName}</h3>
                      <p className="text-sm" style={{ color: "#6b7280" }}>{appointment.type}</p>
                    </div>
                  </div>
                  <div className="flex items-center space-x-4">
                    <div className="text-right">
                      <p className="text-sm font-medium" style={{ color: "#111827" }}>{appointment.date}</p>
                      <div className="flex items-center space-x-2" style={{ color: "#6b7280" }}>
                        <Clock className="w-4 h-4" />
                        <span className="text-sm">{appointment.time}</span>
                      </div>
                    </div>
                    <span
                      className="px-3 py-1 text-sm rounded-full font-medium"
                      style={
                        appointment.status === "scheduled"
                          ? { backgroundColor: "#eff6ff", color: "#2563eb" }
                          : appointment.status === "completed"
                          ? { backgroundColor: "#f0fdf4", color: "#16a34a" }
                          : { backgroundColor: "#fef2f2", color: "#dc2626" }
                      }
                    >
                      {appointment.status.charAt(0).toUpperCase() + appointment.status.slice(1)}
                    </span>
                  </div>
                </div>
              ))}
            </div>
          </div>
        )}

        {/* Profile Tab */}
        {activeTab === "profile" && (
          <div className="bg-white rounded-xl p-8" style={{ boxShadow: "0 1px 3px rgba(0,0,0,0.1)" }}>
            <div className="flex items-center justify-between mb-8">
              <h2 className="text-xl font-bold" style={{ color: "#111827" }}>Profile Information</h2>
              {!isEditingProfile ? (
                <button
                  onClick={startEditingProfile}
                  className="flex items-center space-x-2 px-4 py-2 text-white rounded-lg transition-colors text-sm bg-teal-500 hover:bg-teal-600"
                >
                  <Edit className="w-4 h-4" />
                  <span>Edit Profile</span>
                </button>
              ) : (
                <div className="flex space-x-2">
                  <button
                    onClick={cancelEditingProfile}
                    className="px-4 py-2 border rounded-lg transition-colors text-sm border-gray-200 text-gray-700 hover:bg-gray-50"
                  >
                    Cancel
                  </button>
                  <button
                    onClick={handleUpdateProfile}
                    disabled={isSaving}
                    className="flex items-center space-x-2 px-4 py-2 text-white rounded-lg transition-colors text-sm disabled:opacity-50 bg-teal-500 hover:bg-teal-600"
                  >
                    <Save className="w-4 h-4" />
                    <span>{isSaving ? "Saving..." : "Save"}</span>
                  </button>
                </div>
              )}
            </div>

            <div className="space-y-6">
              {/* Avatar Section */}
              <div className="flex items-center space-x-6">
                <div className="relative group">
                  <Avatar src={user?.avatar} name={user?.name || "U"} size="lg" />
                  <button
                    type="button"
                    onClick={() => photoInputRef.current?.click()}
                    disabled={isUploadingPhoto}
                    className="absolute bottom-0 right-0 p-2 bg-teal-500 text-white rounded-full shadow-md hover:bg-teal-600 transition-colors disabled:opacity-50"
                    title="Upload profile photo"
                  >
                    <Upload className="w-4 h-4" />
                  </button>
                  <input
                    ref={photoInputRef}
                    type="file"
                    accept="image/*"
                    className="hidden"
                    onChange={handlePhotoUpload}
                  />
                </div>
                <div>
                  <h3 className="text-lg font-semibold" style={{ color: "#111827" }}>{firstName}</h3>
                  <p style={{ color: "#6b7280" }}>
                    {user?.role === "doctor"
                      ? `${user.specialty || "General"} Specialist`
                      : user?.role === "nurse"
                      ? "Home Care Nurse"
                      : "Patient"}
                  </p>
                  <p className="text-xs mt-1 text-gray-400">
                    {isUploadingPhoto
                      ? "Uploading photo..."
                      : user?.avatar
                      ? "Click the upload icon to change your photo"
                      : "No photo yet — upload one or your initial will be shown"}
                  </p>
                </div>
              </div>

              {/* Form Fields */}
              <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
                <div>
                  <label className="block mb-2 text-sm font-medium" style={{ color: "#374151" }}>Full Name</label>
                  <input
                    type="text"
                    value={formValues.name}
                    onChange={(e) => setProfileData({ ...profileData, name: e.target.value })}
                    disabled={!isEditingProfile}
                    className="w-full px-4 py-3 border rounded-lg focus:outline-none focus:ring-2 text-sm"
                    style={{
                      borderColor: "#e5e7eb",
                      backgroundColor: isEditingProfile ? "#fff" : "#f9fafb",
                      color: "#111827",
                    }}
                  />
                </div>

                <div>
                  <label className="block mb-2 text-sm font-medium" style={{ color: "#374151" }}>Email</label>
                  <div className="relative">
                    <Mail className="absolute left-4 top-1/2 -translate-y-1/2 w-4 h-4" style={{ color: "#9ca3af" }} />
                    <input
                      type="email"
                      value={formValues.email}
                      onChange={(e) => setProfileData({ ...profileData, email: e.target.value })}
                      disabled={!isEditingProfile}
                      className="w-full pl-11 pr-4 py-3 border rounded-lg focus:outline-none focus:ring-2 text-sm"
                      style={{
                        borderColor: "#e5e7eb",
                        backgroundColor: isEditingProfile ? "#fff" : "#f9fafb",
                        color: "#111827",
                      }}
                    />
                  </div>
                </div>

                <div>
                  <label className="block mb-2 text-sm font-medium" style={{ color: "#374151" }}>Phone</label>
                  <div className="relative">
                    <Phone className="absolute left-4 top-1/2 -translate-y-1/2 w-4 h-4" style={{ color: "#9ca3af" }} />
                    <input
                      type="tel"
                      value={formValues.phone}
                      onChange={(e) => setProfileData({ ...profileData, phone: e.target.value })}
                      disabled={!isEditingProfile}
                      className="w-full pl-11 pr-4 py-3 border rounded-lg focus:outline-none focus:ring-2 text-sm"
                      style={{
                        borderColor: "#e5e7eb",
                        backgroundColor: isEditingProfile ? "#fff" : "#f9fafb",
                        color: "#111827",
                      }}
                    />
                  </div>
                </div>

                {(user?.role === "doctor" || user?.role === "nurse") && (
                  <>
                    {user?.role === "doctor" && (
                      <div>
                        <label className="block mb-2 text-sm font-medium" style={{ color: "#374151" }}>Specialty</label>
                        <select
                          value={formValues.specialty}
                          onChange={(e) => setProfileData({ ...profileData, specialty: e.target.value })}
                          disabled={!isEditingProfile}
                          className="w-full px-4 py-3 border rounded-lg focus:outline-none focus:ring-2 text-sm"
                          style={{
                            borderColor: "#e5e7eb",
                            backgroundColor: isEditingProfile ? "#fff" : "#f9fafb",
                            color: "#111827",
                          }}
                        >
                          <option value="" disabled>
                            Select medical specialty
                          </option>
                          {MEDICAL_SPECIALIZATIONS.map((specialty) => (
                            <option key={specialty} value={specialty}>
                              {specialty}
                            </option>
                          ))}
                        </select>
                      </div>
                    )}

                    <div>
                      <label className="block mb-2 text-sm font-medium" style={{ color: "#374151" }}>Experience</label>
                      <div className="relative">
                        <Award className="absolute left-4 top-1/2 -translate-y-1/2 w-4 h-4" style={{ color: "#9ca3af" }} />
                        <input
                          type="text"
                          value={formValues.experience}
                          onChange={(e) => setProfileData({ ...profileData, experience: e.target.value })}
                          disabled={!isEditingProfile}
                          className="w-full pl-11 pr-4 py-3 border rounded-lg focus:outline-none focus:ring-2 text-sm"
                          style={{
                            borderColor: "#e5e7eb",
                            backgroundColor: isEditingProfile ? "#fff" : "#f9fafb",
                            color: "#111827",
                          }}
                        />
                      </div>
                    </div>

                    <div>
                      <label className="block mb-2 text-sm font-medium" style={{ color: "#374151" }}>Location</label>
                      <div className="relative">
                        <MapPin className="absolute left-4 top-1/2 -translate-y-1/2 w-4 h-4" style={{ color: "#9ca3af" }} />
                        <input
                          type="text"
                          value={formValues.location}
                          onChange={(e) => setProfileData({ ...profileData, location: e.target.value })}
                          disabled={!isEditingProfile}
                          className="w-full pl-11 pr-4 py-3 border rounded-lg focus:outline-none focus:ring-2 text-sm"
                          style={{
                            borderColor: "#e5e7eb",
                            backgroundColor: isEditingProfile ? "#fff" : "#f9fafb",
                            color: "#111827",
                          }}
                        />
                      </div>
                    </div>
                  </>
                )}
              </div>

              <div>
                <label className="block mb-2 text-sm font-medium" style={{ color: "#374151" }}>Bio</label>
                <textarea
                  value={formValues.bio}
                  onChange={(e) => setProfileData({ ...profileData, bio: e.target.value })}
                  disabled={!isEditingProfile}
                  rows={4}
                  className="w-full px-4 py-3 border rounded-lg focus:outline-none focus:ring-2 resize-none text-sm"
                  style={{
                    borderColor: "#e5e7eb",
                    backgroundColor: isEditingProfile ? "#fff" : "#f9fafb",
                    color: "#111827",
                  }}
                />
              </div>

              {/* Certificates - Doctor & Nurse */}
              {(user?.role === "doctor" || user?.role === "nurse") && (
                <div className="pt-6 border-t" style={{ borderColor: "#e5e7eb" }}>
                  <div className="flex items-center justify-between mb-4">
                    <h3 className="text-lg font-semibold" style={{ color: "#111827" }}>Certificates & Credentials</h3>
                    <button
                      onClick={() => setShowCertForm(!showCertForm)}
                      className="flex items-center space-x-2 px-4 py-2 border rounded-lg text-sm transition-colors border-gray-200 text-gray-700 hover:bg-gray-50 hover:border-teal-300"
                    >
                      <Upload className="w-4 h-4" />
                      <span>Upload New</span>
                    </button>
                  </div>

                  {showCertForm && (
                    <div className="mb-4 p-4 border rounded-lg space-y-3" style={{ borderColor: "#e5e7eb" }}>
                      <input
                        placeholder="Certificate title"
                        value={newCert.title}
                        onChange={(e) => setNewCert({ ...newCert, title: e.target.value })}
                        className="w-full px-3 py-2 border rounded-lg text-sm"
                      />
                      <input
                        placeholder="Issued by"
                        value={newCert.issuedBy}
                        onChange={(e) => setNewCert({ ...newCert, issuedBy: e.target.value })}
                        className="w-full px-3 py-2 border rounded-lg text-sm"
                      />
                      <input
                        placeholder="Certificate URL"
                        value={newCert.certificateUrl}
                        onChange={(e) => setNewCert({ ...newCert, certificateUrl: e.target.value })}
                        className="w-full px-3 py-2 border rounded-lg text-sm"
                      />
                      <button
                        onClick={handleAddCertificate}
                        className="px-4 py-2 bg-teal-500 text-white rounded-lg text-sm font-semibold hover:bg-teal-600 transition-colors"
                      >
                        Save Certificate
                      </button>
                    </div>
                  )}
                  <div className="space-y-4">
                    {user?.certificates && user.certificates.length > 0 ? (
                      user.certificates.map((cert) => (
                        <div
                          key={cert.id}
                          className="p-4 border-2 rounded-lg"
                          style={{
                            borderColor:
                              cert.status === "rejected"
                                ? "#fecaca"
                                : cert.verified
                                ? "#bbf7d0"
                                : "#fde68a",
                            backgroundColor:
                              cert.status === "rejected"
                                ? "#fef2f2"
                                : cert.verified
                                ? "#f0fdf4"
                                : "#fffbeb",
                          }}
                        >
                          <div className="flex items-start justify-between">
                            <div className="flex items-start space-x-3 flex-1">
                              <div
                                className="w-10 h-10 rounded-lg flex items-center justify-center shrink-0"
                                style={{ backgroundColor: cert.verified ? "#dcfce7" : "#fef3c7" }}
                              >
                                {cert.verified ? (
                                  <FileCheck className="w-5 h-5" style={{ color: "#16a34a" }} />
                                ) : (
                                  <ClockIcon className="w-5 h-5" style={{ color: "#d97706" }} />
                                )}
                              </div>
                              <div className="flex-1">
                                <h4 className="font-semibold" style={{ color: "#111827" }}>{cert.name}</h4>
                                <p className="text-sm mt-1" style={{ color: "#6b7280" }}>Issued by {cert.issuer}</p>
                                <p className="text-sm" style={{ color: "#6b7280" }}>
                                  Issue Date:{" "}
                                  {new Date(cert.issueDate).toLocaleDateString("en-US", {
                                    year: "numeric",
                                    month: "long",
                                    day: "numeric",
                                  })}
                                </p>
                              </div>
                            </div>
                            <span
                              className="px-3 py-1 text-xs rounded-full font-medium shrink-0"
                              style={
                                cert.verified
                                  ? { backgroundColor: "#dcfce7", color: "#15803d" }
                                  : { backgroundColor: "#fef3c7", color: "#b45309" }
                              }
                            >
                              {cert.status === "rejected"
                                ? "Rejected"
                                : cert.verified
                                ? "Verified"
                                : "Pending Verification"}
                            </span>
                          </div>
                        </div>
                      ))
                    ) : (
                      <div className="text-center py-8 rounded-lg" style={{ backgroundColor: "#f9fafb" }}>
                        <FileCheck className="w-12 h-12 mx-auto mb-2" style={{ color: "#9ca3af" }} />
                        <p style={{ color: "#6b7280" }}>No certificates uploaded yet</p>
                      </div>
                    )}
                  </div>
                </div>
              )}
            </div>
          </div>
        )}

        {/* Home Service Requests Tab (Nurse Only) */}
        {activeTab === "requests" && user?.role === "nurse" && (
          <div className="bg-white rounded-xl p-6" style={{ boxShadow: "0 1px 3px rgba(0,0,0,0.1)" }}>
            <h2 className="text-xl font-bold mb-6" style={{ color: "#111827" }}>Home Service Requests</h2>
            <div className="space-y-4">
              {homeServiceRequests.map((request) => (
                <div
                  key={request.id}
                  className="p-6 border-2 rounded-xl"
                  style={{
                    borderColor:
                      request.status === "pending" ? "#fed7aa"
                      : request.status === "accepted" ? "#bbf7d0"
                      : "#fecaca",
                    backgroundColor:
                      request.status === "pending" ? "#fff7ed"
                      : request.status === "accepted" ? "#f0fdf4"
                      : "#fef2f2",
                  }}
                >
                  <div className="flex items-start justify-between mb-4">
                    <div className="flex items-start space-x-4">
                      <div
                        className="w-12 h-12 rounded-full flex items-center justify-center shrink-0"
                        style={{ backgroundColor: "#ccfbf1" }}
                      >
                        <HomeIcon className="w-6 h-6" style={{ color: "#0d9488" }} />
                      </div>
                      <div>
                        <h3 className="font-semibold text-lg" style={{ color: "#111827" }}>{request.patientName}</h3>
                        <p className="text-sm mt-1" style={{ color: "#6b7280" }}>{request.service}</p>
                      </div>
                    </div>
                    <span
                      className="px-3 py-1 text-sm rounded-full font-medium"
                      style={
                        request.status === "pending"
                          ? { backgroundColor: "#fed7aa", color: "#c2410c" }
                          : request.status === "accepted"
                          ? { backgroundColor: "#bbf7d0", color: "#15803d" }
                          : { backgroundColor: "#fecaca", color: "#b91c1c" }
                      }
                    >
                      {request.status.charAt(0).toUpperCase() + request.status.slice(1)}
                    </span>
                  </div>

                  <div className="space-y-2 mb-4">
                    <div className="flex items-start space-x-2">
                      <MapPin className="w-4 h-4 mt-0.5 shrink-0" style={{ color: "#9ca3af" }} />
                      <span className="text-sm" style={{ color: "#374151" }}>{request.address}</span>
                    </div>
                    <div className="flex items-center space-x-4">
                      <div className="flex items-center space-x-2">
                        <Calendar className="w-4 h-4" style={{ color: "#9ca3af" }} />
                        <span className="text-sm" style={{ color: "#374151" }}>{request.requestedDate}</span>
                      </div>
                      <div className="flex items-center space-x-2">
                        <Clock className="w-4 h-4" style={{ color: "#9ca3af" }} />
                        <span className="text-sm" style={{ color: "#374151" }}>{request.requestedTime}</span>
                      </div>
                    </div>
                    <div className="flex items-center space-x-2">
                      <Phone className="w-4 h-4" style={{ color: "#9ca3af" }} />
                      <span className="text-sm" style={{ color: "#374151" }}>{request.phone}</span>
                    </div>
                  </div>

                  {request.status === "pending" && (
                    <div className="flex space-x-3">
                      <button
                        onClick={() => handleRequestAction(request.id, "accepted")}
                        className="flex-1 flex items-center justify-center space-x-2 px-4 py-2 text-white rounded-lg transition-colors text-sm bg-green-600 hover:bg-green-700"
                      >
                        <CheckCircle className="w-4 h-4" />
                        <span>Accept</span>
                      </button>
                      <button
                        onClick={() => handleRequestAction(request.id, "rejected")}
                        className="flex-1 flex items-center justify-center space-x-2 px-4 py-2 text-white rounded-lg transition-colors text-sm bg-red-600 hover:bg-red-700"
                      >
                        <XCircle className="w-4 h-4" />
                        <span>Reject</span>
                      </button>
                    </div>
                  )}
                </div>
              ))}
            </div>
          </div>
        )}
      </div>
    </div>
  );
}
