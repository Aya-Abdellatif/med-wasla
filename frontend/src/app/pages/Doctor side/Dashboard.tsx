import { useState } from "react";
import { useAuth } from "../../context/useAuth";
import {
  Calendar,
  Clock,
  Users,
  TrendingUp,
  CheckCircle,
  XCircle,
  Home as HomeIcon,
  User as UserIcon,
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
// import { ImageWithFallback } from ".";

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

  // Mock appointments data
  const [appointments] = useState<Appointment[]>([
    {
      id: "1",
      patientName: "John Smith",
      time: "09:00 AM",
      date: "2026-06-03",
      type: "Check-up",
      status: "scheduled",
    },
    {
      id: "2",
      patientName: "Sarah Johnson",
      time: "10:30 AM",
      date: "2026-06-03",
      type: "Follow-up",
      status: "scheduled",
    },
    {
      id: "3",
      patientName: "Mike Davis",
      time: "02:00 PM",
      date: "2026-06-03",
      type: "Consultation",
      status: "scheduled",
    },
    {
      id: "4",
      patientName: "Emily Brown",
      time: "03:30 PM",
      date: "2026-06-03",
      type: "Check-up",
      status: "completed",
    },
  ]);

  // Mock home service requests (for nurses only)
  const [homeServiceRequests, setHomeServiceRequests] = useState<HomeServiceRequest[]>([
    {
      id: "1",
      patientName: "Robert Wilson",
      address: "123 Main St, Apt 4B, New York, NY 10001",
      service: "Blood Pressure Monitoring",
      requestedDate: "2026-06-04",
      requestedTime: "10:00 AM",
      status: "pending",
      phone: "+1 (234) 567-8901",
    },
    {
      id: "2",
      patientName: "Linda Martinez",
      address: "456 Oak Ave, Brooklyn, NY 11201",
      service: "Wound Care",
      requestedDate: "2026-06-04",
      requestedTime: "02:00 PM",
      status: "pending",
      phone: "+1 (234) 567-8902",
    },
    {
      id: "3",
      patientName: "David Lee",
      address: "789 Pine Rd, Queens, NY 11354",
      service: "Medication Administration",
      requestedDate: "2026-06-05",
      requestedTime: "09:00 AM",
      status: "pending",
      phone: "+1 (234) 567-8903",
    },
  ]);

  const handleUpdateProfile = () => {
    updateProfile(profileData);
    setIsEditingProfile(false);
  };

  const handleRequestAction = (requestId: string, action: "accepted" | "rejected") => {
    setHomeServiceRequests((prev) =>
      prev.map((req) =>
        req.id === requestId ? { ...req, status: action } : req
      )
    );
  };

  const stats = [
    {
      label: "Today's Appointments",
      value: appointments.filter(a => a.date === "2026-06-03" && a.status === "scheduled").length,
      icon: Calendar,
      color: "text-blue-600",
      bg: "bg-blue-50",
    },
    {
      label: "Completed Today",
      value: appointments.filter(a => a.date === "2026-06-03" && a.status === "completed").length,
      icon: CheckCircle,
      color: "text-green-600",
      bg: "bg-green-50",
    },
    {
      label: "Total Patients",
      value: "156",
      icon: Users,
      color: "text-purple-600",
      bg: "bg-purple-50",
    },
    {
      label: user?.role === "nurse" ? "Pending Requests" : "This Week",
      value: user?.role === "nurse" ? homeServiceRequests.filter(r => r.status === "pending").length : "24",
      icon: user?.role === "nurse" ? HomeIcon : TrendingUp,
      color: "text-orange-600",
      bg: "bg-orange-50",
    },
  ];

  return (
    <div className="min-h-screen bg-muted/30">
      {/* Header */}
      <div className="bg-white border-b border-border">
        <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 py-6">
          <div className="flex items-center justify-between">
            <div className="flex items-center space-x-4">
              <div className="w-16 h-16 rounded-full overflow-hidden bg-primary/10">
                {user?.avatar ? (
                  <ImageWithFallback
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
              <div>
                <h1 className="text-2xl font-bold text-foreground">Welcome back, {user?.name}!</h1>
                <p className="text-muted-foreground">
                  {user?.role === "doctor" ? `${user.specialty} Specialist` : "Home Care Nurse"}
                </p>
              </div>
            </div>
            <div className="text-right">
              <p className="text-sm text-muted-foreground">Today</p>
              <p className="text-lg font-semibold">Tuesday, June 2, 2026</p>
            </div>
          </div>
        </div>
      </div>

      {/* Tabs */}
      <div className="bg-white border-b border-border sticky top-20 z-40">
        <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
          <div className="flex space-x-8">
            <button
              onClick={() => setActiveTab("overview")}
              className={`py-4 border-b-2 transition-colors ${
                activeTab === "overview"
                  ? "border-primary text-primary"
                  : "border-transparent text-muted-foreground hover:text-foreground"
              }`}
            >
              Overview
            </button>
            <button
              onClick={() => setActiveTab("schedule")}
              className={`py-4 border-b-2 transition-colors ${
                activeTab === "schedule"
                  ? "border-primary text-primary"
                  : "border-transparent text-muted-foreground hover:text-foreground"
              }`}
            >
              Schedule
            </button>
            <button
              onClick={() => setActiveTab("profile")}
              className={`py-4 border-b-2 transition-colors ${
                activeTab === "profile"
                  ? "border-primary text-primary"
                  : "border-transparent text-muted-foreground hover:text-foreground"
              }`}
            >
              Profile
            </button>
            {user?.role === "nurse" && (
              <button
                onClick={() => setActiveTab("requests")}
                className={`py-4 border-b-2 transition-colors relative ${
                  activeTab === "requests"
                    ? "border-primary text-primary"
                    : "border-transparent text-muted-foreground hover:text-foreground"
                }`}
              >
                Home Service Requests
                {homeServiceRequests.filter(r => r.status === "pending").length > 0 && (
                  <span className="absolute -top-1 -right-2 w-5 h-5 bg-red-500 text-white text-xs rounded-full flex items-center justify-center">
                    {homeServiceRequests.filter(r => r.status === "pending").length}
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
                  <div key={index} className="bg-white rounded-xl p-6 shadow-sm">
                    <div className="flex items-center justify-between">
                      <div>
                        <p className="text-sm text-muted-foreground mb-1">{stat.label}</p>
                        <p className="text-3xl font-bold text-foreground">{stat.value}</p>
                      </div>
                      <div className={`w-12 h-12 rounded-lg ${stat.bg} flex items-center justify-center`}>
                        <Icon className={`w-6 h-6 ${stat.color}`} />
                      </div>
                    </div>
                  </div>
                );
              })}
            </div>

            {/* Today's Appointments */}
            <div className="bg-white rounded-xl shadow-sm p-6">
              <div className="flex items-center justify-between mb-6">
                <h2 className="text-xl font-bold text-foreground">Today's Schedule</h2>
                <button
                  onClick={() => setActiveTab("schedule")}
                  className="text-primary hover:text-primary/80 text-sm font-medium"
                >
                  View All
                </button>
              </div>
              <div className="space-y-4">
                {appointments
                  .filter(a => a.date === "2026-06-03" && a.status === "scheduled")
                  .map((appointment) => (
                    <div
                      key={appointment.id}
                      className="flex items-center justify-between p-4 border border-border rounded-lg hover:bg-muted/50 transition-colors"
                    >
                      <div className="flex items-center space-x-4">
                        <div className="w-12 h-12 rounded-full bg-primary/10 flex items-center justify-center">
                          <UserIcon className="w-6 h-6 text-primary" />
                        </div>
                        <div>
                          <h3 className="font-semibold text-foreground">{appointment.patientName}</h3>
                          <p className="text-sm text-muted-foreground">{appointment.type}</p>
                        </div>
                      </div>
                      <div className="flex items-center space-x-4">
                        <div className="flex items-center space-x-2 text-muted-foreground">
                          <Clock className="w-4 h-4" />
                          <span className="text-sm">{appointment.time}</span>
                        </div>
                        <span className="px-3 py-1 bg-blue-50 text-blue-600 text-sm rounded-full">
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
          <div className="bg-white rounded-xl shadow-sm p-6">
            <h2 className="text-xl font-bold text-foreground mb-6">All Appointments</h2>
            <div className="space-y-4">
              {appointments.map((appointment) => (
                <div
                  key={appointment.id}
                  className="flex items-center justify-between p-4 border border-border rounded-lg"
                >
                  <div className="flex items-center space-x-4">
                    <div className="w-12 h-12 rounded-full bg-primary/10 flex items-center justify-center">
                      <UserIcon className="w-6 h-6 text-primary" />
                    </div>
                    <div>
                      <h3 className="font-semibold text-foreground">{appointment.patientName}</h3>
                      <p className="text-sm text-muted-foreground">{appointment.type}</p>
                    </div>
                  </div>
                  <div className="flex items-center space-x-4">
                    <div className="text-right">
                      <p className="text-sm font-medium text-foreground">{appointment.date}</p>
                      <div className="flex items-center space-x-2 text-muted-foreground">
                        <Clock className="w-4 h-4" />
                        <span className="text-sm">{appointment.time}</span>
                      </div>
                    </div>
                    <span
                      className={`px-3 py-1 text-sm rounded-full ${
                        appointment.status === "scheduled"
                          ? "bg-blue-50 text-blue-600"
                          : appointment.status === "completed"
                          ? "bg-green-50 text-green-600"
                          : "bg-red-50 text-red-600"
                      }`}
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
          <div className="bg-white rounded-xl shadow-sm p-8">
            <div className="flex items-center justify-between mb-8">
              <h2 className="text-xl font-bold text-foreground">Profile Information</h2>
              {!isEditingProfile ? (
                <button
                  onClick={() => setIsEditingProfile(true)}
                  className="flex items-center space-x-2 px-4 py-2 bg-primary text-white rounded-lg hover:bg-primary/90 transition-colors"
                >
                  <Edit className="w-4 h-4" />
                  <span>Edit Profile</span>
                </button>
              ) : (
                <div className="flex space-x-2">
                  <button
                    onClick={() => setIsEditingProfile(false)}
                    className="px-4 py-2 border border-border rounded-lg hover:bg-muted transition-colors"
                  >
                    Cancel
                  </button>
                  <button
                    onClick={handleUpdateProfile}
                    className="flex items-center space-x-2 px-4 py-2 bg-primary text-white rounded-lg hover:bg-primary/90 transition-colors"
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
                    <ImageWithFallback
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
                <div>
                  <h3 className="text-lg font-semibold text-foreground">{user?.name}</h3>
                  <p className="text-muted-foreground">
                    {user?.role === "doctor" ? "Doctor" : "Nurse"}
                  </p>
                </div>
              </div>

              {/* Form Fields */}
              <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
                <div>
                  <label className="block mb-2 font-medium text-foreground">Full Name</label>
                  <input
                    type="text"
                    value={profileData.name}
                    onChange={(e) => setProfileData({ ...profileData, name: e.target.value })}
                    disabled={!isEditingProfile}
                    className="w-full px-4 py-3 border border-border rounded-lg focus:outline-none focus:ring-2 focus:ring-primary disabled:bg-muted disabled:cursor-not-allowed"
                  />
                </div>

                <div>
                  <label className="block mb-2 font-medium text-foreground">Email</label>
                  <div className="relative">
                    <Mail className="absolute left-4 top-1/2 -translate-y-1/2 w-5 h-5 text-muted-foreground" />
                    <input
                      type="email"
                      value={profileData.email}
                      onChange={(e) => setProfileData({ ...profileData, email: e.target.value })}
                      disabled={!isEditingProfile}
                      className="w-full pl-12 pr-4 py-3 border border-border rounded-lg focus:outline-none focus:ring-2 focus:ring-primary disabled:bg-muted disabled:cursor-not-allowed"
                    />
                  </div>
                </div>

                <div>
                  <label className="block mb-2 font-medium text-foreground">Phone</label>
                  <div className="relative">
                    <Phone className="absolute left-4 top-1/2 -translate-y-1/2 w-5 h-5 text-muted-foreground" />
                    <input
                      type="tel"
                      value={profileData.phone}
                      onChange={(e) => setProfileData({ ...profileData, phone: e.target.value })}
                      disabled={!isEditingProfile}
                      className="w-full pl-12 pr-4 py-3 border border-border rounded-lg focus:outline-none focus:ring-2 focus:ring-primary disabled:bg-muted disabled:cursor-not-allowed"
                    />
                  </div>
                </div>

                {user?.role === "doctor" && (
                  <div>
                    <label className="block mb-2 font-medium text-foreground">Specialty</label>
                    <input
                      type="text"
                      value={profileData.specialty}
                      onChange={(e) => setProfileData({ ...profileData, specialty: e.target.value })}
                      disabled={!isEditingProfile}
                      className="w-full px-4 py-3 border border-border rounded-lg focus:outline-none focus:ring-2 focus:ring-primary disabled:bg-muted disabled:cursor-not-allowed"
                    />
                  </div>
                )}

                <div>
                  <label className="block mb-2 font-medium text-foreground">Experience</label>
                  <div className="relative">
                    <Award className="absolute left-4 top-1/2 -translate-y-1/2 w-5 h-5 text-muted-foreground" />
                    <input
                      type="text"
                      value={profileData.experience}
                      onChange={(e) => setProfileData({ ...profileData, experience: e.target.value })}
                      disabled={!isEditingProfile}
                      className="w-full pl-12 pr-4 py-3 border border-border rounded-lg focus:outline-none focus:ring-2 focus:ring-primary disabled:bg-muted disabled:cursor-not-allowed"
                    />
                  </div>
                </div>

                <div>
                  <label className="block mb-2 font-medium text-foreground">Location</label>
                  <div className="relative">
                    <MapPin className="absolute left-4 top-1/2 -translate-y-1/2 w-5 h-5 text-muted-foreground" />
                    <input
                      type="text"
                      value={profileData.location}
                      onChange={(e) => setProfileData({ ...profileData, location: e.target.value })}
                      disabled={!isEditingProfile}
                      className="w-full pl-12 pr-4 py-3 border border-border rounded-lg focus:outline-none focus:ring-2 focus:ring-primary disabled:bg-muted disabled:cursor-not-allowed"
                    />
                  </div>
                </div>
              </div>

              <div>
                <label className="block mb-2 font-medium text-foreground">Bio</label>
                <textarea
                  value={profileData.bio}
                  onChange={(e) => setProfileData({ ...profileData, bio: e.target.value })}
                  disabled={!isEditingProfile}
                  rows={4}
                  className="w-full px-4 py-3 border border-border rounded-lg focus:outline-none focus:ring-2 focus:ring-primary disabled:bg-muted disabled:cursor-not-allowed resize-none"
                />
              </div>

              {/* Certificates Section - Doctor Only */}
              {user?.role === "doctor" && (
                <div className="pt-6 border-t border-border">
                  <div className="flex items-center justify-between mb-4">
                    <h3 className="text-lg font-semibold text-foreground">Certificates & Credentials</h3>
                    <button className="flex items-center space-x-2 px-4 py-2 border border-border rounded-lg hover:bg-muted transition-colors text-sm">
                      <Upload className="w-4 h-4" />
                      <span>Upload New</span>
                    </button>
                  </div>

                  <div className="space-y-4">
                    {user.certificates && user.certificates.length > 0 ? (
                      user.certificates.map((cert) => (
                        <div
                          key={cert.id}
                          className={`p-4 border-2 rounded-lg ${
                            cert.verified
                              ? "border-green-200 bg-green-50/30"
                              : "border-yellow-200 bg-yellow-50/30"
                          }`}
                        >
                          <div className="flex items-start justify-between">
                            <div className="flex items-start space-x-3 flex-1">
                              <div className={`w-10 h-10 rounded-lg ${cert.verified ? "bg-green-100" : "bg-yellow-100"} flex items-center justify-center flex-shrink-0`}>
                                {cert.verified ? (
                                  <FileCheck className={`w-5 h-5 ${cert.verified ? "text-green-600" : "text-yellow-600"}`} />
                                ) : (
                                  <ClockIcon className="w-5 h-5 text-yellow-600" />
                                )}
                              </div>
                              <div className="flex-1">
                                <h4 className="font-semibold text-foreground">{cert.name}</h4>
                                <p className="text-sm text-muted-foreground mt-1">
                                  Issued by {cert.issuer}
                                </p>
                                <p className="text-sm text-muted-foreground">
                                  Issue Date: {new Date(cert.issueDate).toLocaleDateString("en-US", { year: "numeric", month: "long", day: "numeric" })}
                                </p>
                              </div>
                            </div>
                            <span
                              className={`px-3 py-1 text-xs rounded-full font-medium ${
                                cert.verified
                                  ? "bg-green-100 text-green-700"
                                  : "bg-yellow-100 text-yellow-700"
                              }`}
                            >
                              {cert.verified ? "Verified" : "Pending Verification"}
                            </span>
                          </div>
                        </div>
                      ))
                    ) : (
                      <div className="text-center py-8 bg-muted/30 rounded-lg">
                        <FileCheck className="w-12 h-12 text-muted-foreground mx-auto mb-2" />
                        <p className="text-muted-foreground">No certificates uploaded yet</p>
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
          <div className="bg-white rounded-xl shadow-sm p-6">
            <h2 className="text-xl font-bold text-foreground mb-6">Home Service Requests</h2>
            <div className="space-y-4">
              {homeServiceRequests.map((request) => (
                <div
                  key={request.id}
                  className={`p-6 border-2 rounded-xl ${
                    request.status === "pending"
                      ? "border-orange-200 bg-orange-50/30"
                      : request.status === "accepted"
                      ? "border-green-200 bg-green-50/30"
                      : "border-red-200 bg-red-50/30"
                  }`}
                >
                  <div className="flex items-start justify-between mb-4">
                    <div className="flex items-start space-x-4">
                      <div className="w-12 h-12 rounded-full bg-primary/10 flex items-center justify-center flex-shrink-0">
                        <HomeIcon className="w-6 h-6 text-primary" />
                      </div>
                      <div>
                        <h3 className="font-semibold text-foreground text-lg">{request.patientName}</h3>
                        <p className="text-sm text-muted-foreground mt-1">{request.service}</p>
                      </div>
                    </div>
                    <span
                      className={`px-3 py-1 text-sm rounded-full font-medium ${
                        request.status === "pending"
                          ? "bg-orange-100 text-orange-700"
                          : request.status === "accepted"
                          ? "bg-green-100 text-green-700"
                          : "bg-red-100 text-red-700"
                      }`}
                    >
                      {request.status.charAt(0).toUpperCase() + request.status.slice(1)}
                    </span>
                  </div>

                  <div className="space-y-2 mb-4">
                    <div className="flex items-start space-x-2">
                      <MapPin className="w-4 h-4 text-muted-foreground mt-0.5 flex-shrink-0" />
                      <span className="text-sm text-foreground">{request.address}</span>
                    </div>
                    <div className="flex items-center space-x-4">
                      <div className="flex items-center space-x-2">
                        <Calendar className="w-4 h-4 text-muted-foreground" />
                        <span className="text-sm text-foreground">{request.requestedDate}</span>
                      </div>
                      <div className="flex items-center space-x-2">
                        <Clock className="w-4 h-4 text-muted-foreground" />
                        <span className="text-sm text-foreground">{request.requestedTime}</span>
                      </div>
                    </div>
                    <div className="flex items-center space-x-2">
                      <Phone className="w-4 h-4 text-muted-foreground" />
                      <span className="text-sm text-foreground">{request.phone}</span>
                    </div>
                  </div>

                  {request.status === "pending" && (
                    <div className="flex space-x-3">
                      <button
                        onClick={() => handleRequestAction(request.id, "accepted")}
                        className="flex-1 flex items-center justify-center space-x-2 px-4 py-2 bg-green-600 text-white rounded-lg hover:bg-green-700 transition-colors"
                      >
                        <CheckCircle className="w-4 h-4" />
                        <span>Accept</span>
                      </button>
                      <button
                        onClick={() => handleRequestAction(request.id, "rejected")}
                        className="flex-1 flex items-center justify-center space-x-2 px-4 py-2 bg-red-600 text-white rounded-lg hover:bg-red-700 transition-colors"
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
