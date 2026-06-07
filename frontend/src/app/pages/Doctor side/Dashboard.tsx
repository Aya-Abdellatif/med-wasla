import { useState } from "react";
import { useAuth } from "../../context/AuthContext";

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
import { ImageWithFallback } from "../../figma/ImageWithFallback";

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

// Avatar component with fallback to first letter
function Avatar({
  src,
  name,
  size = "md",
}: {
  src?: string;
  name: string;
  size?: "sm" | "md" | "lg";
}) {
  const sizeMap = { sm: "w-10 h-10 text-base", md: "w-12 h-12 text-lg", lg: "w-24 h-24 text-3xl" };
  const headerMap = { sm: "w-10 h-10", md: "w-12 h-12", lg: "w-24 h-24" };
  const { bg, text } = getAvatarColor(name);

  if (src) {
    return (
      <div className={`${headerMap[size]} rounded-full overflow-hidden shrink-0`}>
        <ImageWithFallback src={src} alt={name} className="w-full h-full object-cover" />
      </div>
    );
  }

  return (
    <div
      className={`${sizeMap[size]} rounded-full flex items-center justify-center font-semibold shrink-0`}
      style={{ backgroundColor: bg, color: text }}
    >
      {name.charAt(0).toUpperCase()}
    </div>
  );
}

export function Dashboard() {
  const { user, updateProfile } = useAuth();
  const [activeTab, setActiveTab] = useState<"overview" | "schedule" | "profile" | "requests">("overview");
  const [isEditingProfile, setIsEditingProfile] = useState(false);
  const [profileData, setProfileData] = useState({
    name: user?.name || "",
    email: user?.email || "",
    phone: "+1 (234) 567-890",
    specialty: user?.specialty || "",
    experience: user?.experience || "",
    location: user?.location || "",
    bio: "Dedicated healthcare professional committed to providing excellent patient care.",
  });

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

  const handleUpdateProfile = () => {
    updateProfile({
      name: profileData.name,
      email: profileData.email,
      specialty: profileData.specialty,
      experience: profileData.experience,
      location: profileData.location,
    });
    setIsEditingProfile(false);
  };

  const handleRequestAction = (requestId: string, action: "accepted" | "rejected") => {
    setHomeServiceRequests((prev) =>
      prev.map((req) => (req.id === requestId ? { ...req, status: action } : req))
    );
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

  return (
    <div className="min-h-screen" style={{ backgroundColor: "#f8fafc" }}>
      {/* Header */}
      <div className="bg-white border-b border-gray-200">
        <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 py-6">
          <div className="flex items-center justify-between">
            <div className="flex items-center space-x-4">
              <div className="w-16 h-16 rounded-full overflow-hidden bg-primary/10">
                {user?.avatar ? (
                  <img
                    src={user.avatar}
                    alt={user.name}
                    className="w-full h-full object-cover"
                  />
                ) : (
                  <div className="w-full h-full flex items-center justify-center text-primary text-2xl font-semibold">
                    {user?.name.charAt(0)}
                  </div>
                )}
              </div>
              <Avatar src={user?.avatar} name={user?.name || "U"} size="md" />
              <div>
                <h1 className="text-2xl font-bold" style={{ color: "#111827" }}>
                  Welcome back, {user?.name}!
                </h1>
                <p style={{ color: "#6b7280" }}>
                  {user?.role === "doctor"
                    ? `${user.specialty || "General"} Specialist`
                    : user?.role === "nurse"
                    ? "Home Care Nurse"
                    : "Patient"}
                </p>
              </div>
            </div>
            <div className="text-right">
              <p className="text-sm" style={{ color: "#6b7280" }}>Today</p>
              <p className="text-lg font-semibold" style={{ color: "#111827" }}>{formattedDate}</p>
            </div>
          </div>
        </div>
      </div>

      {/* Tabs */}
      <div className="bg-white border-b border-gray-200 sticky top-0 z-40">
        <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
          <div className="flex space-x-8">
            {(["overview", "schedule", "profile"] as const).map((tab) => (
              <button
                key={tab}
                onClick={() => setActiveTab(tab)}
                className="py-4 border-b-2 transition-colors capitalize text-sm font-medium"
                style={{
                  borderBottomColor: activeTab === tab ? "#14b8a6" : "transparent",
                  color: activeTab === tab ? "#14b8a6" : "#6b7280",
                }}
              >
                {tab.charAt(0).toUpperCase() + tab.slice(1)}
              </button>
            ))}
            {user?.role === "nurse" && (
              <button
                onClick={() => setActiveTab("requests")}
                className="py-4 border-b-2 transition-colors relative text-sm font-medium"
                style={{
                  borderBottomColor: activeTab === "requests" ? "#14b8a6" : "transparent",
                  color: activeTab === "requests" ? "#14b8a6" : "#6b7280",
                }}
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
                  <div key={index} className="bg-white rounded-xl p-6" style={{ boxShadow: "0 1px 3px rgba(0,0,0,0.1)" }}>
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
                  className="text-sm font-medium"
                  style={{ color: "#14b8a6" }}
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
                      className="flex items-center justify-between p-4 rounded-lg border"
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
                  className="flex items-center justify-between p-4 border rounded-lg"
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
                  onClick={() => setIsEditingProfile(true)}
                  className="flex items-center space-x-2 px-4 py-2 text-white rounded-lg transition-colors text-sm"
                  style={{ backgroundColor: "#14b8a6" }}
                >
                  <Edit className="w-4 h-4" />
                  <span>Edit Profile</span>
                </button>
              ) : (
                <div className="flex space-x-2">
                  <button
                    onClick={() => setIsEditingProfile(false)}
                    className="px-4 py-2 border rounded-lg transition-colors text-sm"
                    style={{ borderColor: "#e5e7eb", color: "#374151" }}
                  >
                    Cancel
                  </button>
                  <button
                    onClick={handleUpdateProfile}
                    className="flex items-center space-x-2 px-4 py-2 text-white rounded-lg transition-colors text-sm"
                    style={{ backgroundColor: "#14b8a6" }}
                  >
                    <Save className="w-4 h-4" />
                    <span>Save</span>
                  </button>
                </div>
              )}
            </div>

            <div className="space-y-6">
              {/* Avatar Section */}
              <div className="flex items-center space-x-6">
                <div className="w-24 h-24 rounded-full overflow-hidden bg-primary/10">
                  {user?.avatar ? (
                    <img
                      src={user.avatar}
                      alt={user.name}
                      className="w-full h-full object-cover"
                    />
                  ) : (
                    <div className="w-full h-full flex items-center justify-center text-primary text-3xl font-semibold">
                      {user?.name.charAt(0)}
                    </div>
                  )}
                </div>
                <Avatar src={user?.avatar} name={user?.name || "U"} size="lg" />
                <div>
                  <h3 className="text-lg font-semibold" style={{ color: "#111827" }}>{user?.name}</h3>
                  <p style={{ color: "#6b7280" }}>
                    {user?.role === "doctor" ? "Doctor" : user?.role === "nurse" ? "Nurse" : "Patient"}
                  </p>
                </div>
              </div>

              {/* Form Fields */}
              <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
                <div>
                  <label className="block mb-2 text-sm font-medium" style={{ color: "#374151" }}>Full Name</label>
                  <input
                    type="text"
                    value={profileData.name}
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
                      value={profileData.email}
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
                      value={profileData.phone}
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
                        <input
                          type="text"
                          value={profileData.specialty}
                          onChange={(e) => setProfileData({ ...profileData, specialty: e.target.value })}
                          disabled={!isEditingProfile}
                          className="w-full px-4 py-3 border rounded-lg focus:outline-none focus:ring-2 text-sm"
                          style={{
                            borderColor: "#e5e7eb",
                            backgroundColor: isEditingProfile ? "#fff" : "#f9fafb",
                            color: "#111827",
                          }}
                        />
                      </div>
                    )}

                    <div>
                      <label className="block mb-2 text-sm font-medium" style={{ color: "#374151" }}>Experience</label>
                      <div className="relative">
                        <Award className="absolute left-4 top-1/2 -translate-y-1/2 w-4 h-4" style={{ color: "#9ca3af" }} />
                        <input
                          type="text"
                          value={profileData.experience}
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
                          value={profileData.location}
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
                  value={profileData.bio}
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
                      className="flex items-center space-x-2 px-4 py-2 border rounded-lg text-sm transition-colors"
                      style={{ borderColor: "#e5e7eb", color: "#374151" }}
                    >
                      <Upload className="w-4 h-4" />
                      <span>Upload New</span>
                    </button>
                  </div>
                  <div className="space-y-4">
                    {user?.certificates && user.certificates.length > 0 ? (
                      user.certificates.map((cert) => (
                        <div
                          key={cert.id}
                          className="p-4 border-2 rounded-lg"
                          style={{
                            borderColor: cert.verified ? "#bbf7d0" : "#fde68a",
                            backgroundColor: cert.verified ? "#f0fdf4" : "#fffbeb",
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
                              {cert.verified ? "Verified" : "Pending Verification"}
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
                        className="flex-1 flex items-center justify-center space-x-2 px-4 py-2 text-white rounded-lg transition-colors text-sm"
                        style={{ backgroundColor: "#16a34a" }}
                      >
                        <CheckCircle className="w-4 h-4" />
                        <span>Accept</span>
                      </button>
                      <button
                        onClick={() => handleRequestAction(request.id, "rejected")}
                        className="flex-1 flex items-center justify-center space-x-2 px-4 py-2 text-white rounded-lg transition-colors text-sm"
                        style={{ backgroundColor: "#dc2626" }}
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
