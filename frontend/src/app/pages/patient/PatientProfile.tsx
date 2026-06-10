import { useState } from "react";
import {
  User as UserIcon,
  Edit,
  Save,
  Phone,
  Mail,
  AlertCircle,
  Activity,
  Calendar,
  FileText,
  ShieldCheck,
} from "lucide-react";

export function PatientProfile() {
  const user = {
    name: "John Doe",
    email: "john.doe@example.com",
    avatar: "https://randomuser.me/api/portraits/men/75.jpg",
    dob: "1990-05-20",
    address: null,
    diseaseHistory: [
      {
        id: 1,
        disease: "Diabetes",
        status: "active",
        diagnosedDate: "2022-01-15",
        diagnosedBy: "Dr. Smith",
        treatedBy: "Dr. Smith",
        notes:
          "Patient is managing diabetes with medication and lifestyle changes.",
      },
    ],
  };

  const [isEditingProfile, setIsEditingProfile] = useState(false);

  const [profileData, setProfileData] = useState({
    name: user?.name || "",
    email: user?.email || "",
    phone: "+1 (234) 567-890",
    dob: user?.dob || "",
    address: user?.address || "",
  });

  const handleUpdateProfile = () => {
    console.log("Updated profile:", profileData);
    setIsEditingProfile(false);
  };

  const getStatusColor = (status: string) => {
    switch (status) {
      case "active":
        return "bg-red-100 text-red-700 border-red-200";
      case "under_treatment":
        return "bg-blue-100 text-blue-700 border-blue-200";
      case "treated":
        return "bg-green-100 text-green-700 border-green-200";
      default:
        return "bg-gray-100 text-gray-700 border-gray-200";
    }
  };

  const getStatusLabel = (status: string) => {
    switch (status) {
      case "active":
        return "Active";
      case "under_treatment":
        return "Under Treatment";
      case "treated":
        return "Treated";
      default:
        return status;
    }
  };

  return (
    <div className="min-h-screen bg-muted/30 overflow-y-auto">
      {/* Header */}
      <div className="bg-white border-b border-border">
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
              <div>
                <h1 className="text-2xl font-bold text-foreground">
                  My Profile
                </h1>
                <p className="text-muted-foreground">
                  Manage your health information
                </p>
              </div>
            </div>
          </div>
        </div>
      </div>

      <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 py-8">
        {/* Profile Information Card */}
        <div className="bg-white rounded-xl shadow-sm p-8 mb-6">
          <div className="flex items-center justify-between mb-8">
            <h2 className="text-xl font-bold text-foreground">
              Personal Information
            </h2>
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
              <div>
                <h3 className="text-lg font-semibold text-foreground">
                  {user?.name}
                </h3>
                <p className="text-muted-foreground">Patient</p>
              </div>
            </div>

            {/* Form Fields */}
            <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
              <div>
                <label className="block mb-2 font-medium text-foreground">
                  Full Name
                </label>
                <input
                  type="text"
                  value={profileData.name}
                  onChange={(e) =>
                    setProfileData({ ...profileData, name: e.target.value })
                  }
                  disabled={!isEditingProfile}
                  className="w-full px-4 py-3 border border-border rounded-lg focus:outline-none focus:ring-2 focus:ring-primary disabled:bg-muted disabled:cursor-not-allowed"
                />
              </div>

              <div>
                <label className="block mb-2 font-medium text-foreground">
                  Email
                </label>
                <div className="relative">
                  <Mail className="absolute left-4 top-1/2 -translate-y-1/2 w-5 h-5 text-muted-foreground" />
                  <input
                    type="email"
                    value={profileData.email}
                    onChange={(e) =>
                      setProfileData({ ...profileData, email: e.target.value })
                    }
                    disabled={!isEditingProfile}
                    className="w-full pl-12 pr-4 py-3 border border-border rounded-lg focus:outline-none focus:ring-2 focus:ring-primary disabled:bg-muted disabled:cursor-not-allowed"
                  />
                </div>
              </div>

              <div>
                <label className="block mb-2 font-medium text-foreground">
                  Phone
                </label>
                <div className="relative">
                  <Phone className="absolute left-4 top-1/2 -translate-y-1/2 w-5 h-5 text-muted-foreground" />
                  <input
                    type="tel"
                    value={profileData.phone}
                    onChange={(e) =>
                      setProfileData({ ...profileData, phone: e.target.value })
                    }
                    disabled={!isEditingProfile}
                    className="w-full pl-12 pr-4 py-3 border border-border rounded-lg focus:outline-none focus:ring-2 focus:ring-primary disabled:bg-muted disabled:cursor-not-allowed"
                  />
                </div>
              </div>

              <div>
                <label className="block mb-2 font-medium text-foreground">
                  Date of Birth
                </label>
                <input
                  type="date"
                  value={profileData.dob}
                  onChange={(e) =>
                    setProfileData({ ...profileData, dob: e.target.value })
                  }
                  disabled={!isEditingProfile}
                  className="w-full px-4 py-3 border border-border rounded-lg focus:outline-none focus:ring-2 focus:ring-primary disabled:bg-muted disabled:cursor-not-allowed"
                />
              </div>

              <div>
                <label className="block mb-2 font-medium text-foreground">
                  Address (optional)
                </label>
                <textarea
                  value={profileData.address}
                  onChange={(e) =>
                    setProfileData({ ...profileData, address: e.target.value })
                  }
                  disabled={!isEditingProfile}
                  rows={3}
                  className="w-full px-4 py-3 border border-border rounded-lg focus:outline-none focus:ring-2 focus:ring-primary disabled:bg-muted disabled:cursor-not-allowed"
                />
              </div>
            </div>
          </div>
        </div>

        {/* Disease History Card */}
        <div className="bg-white rounded-xl shadow-sm p-8">
          <div className="flex items-center justify-between mb-6">
            <div className="flex items-center space-x-3">
              <Activity className="w-6 h-6 text-primary" />
              <h2 className="text-xl font-bold text-foreground">
                Medical History
              </h2>
            </div>
            <div className="flex items-center space-x-2 px-3 py-1.5 bg-blue-50 border border-blue-200 rounded-lg">
              <ShieldCheck className="w-4 h-4 text-blue-600" />
              <span className="text-sm text-blue-600 font-medium">
                Read-only for patients
              </span>
            </div>
          </div>

          <div className="mb-4 p-4 bg-yellow-50 border border-yellow-200 rounded-lg flex items-start space-x-3">
            <AlertCircle className="w-5 h-5 text-yellow-600 flex-shrink-0 mt-0.5" />
            <div>
              <p className="text-sm text-yellow-800 font-medium">
                Restricted Access
              </p>
              <p className="text-sm text-yellow-700 mt-1">
                Your medical history can only be updated by your doctor or
                administrator for accuracy and security purposes.
              </p>
            </div>
          </div>

          <div className="space-y-4">
            {user?.diseaseHistory && user.diseaseHistory.length > 0 ? (
              user.diseaseHistory.map((record) => (
                <div
                  key={record.id}
                  className="p-6 border-2 rounded-lg border-border bg-muted/20"
                >
                  <div className="flex items-start justify-between mb-4">
                    <div className="flex-1">
                      <div className="flex items-center space-x-3 mb-2">
                        <h3 className="text-lg font-semibold text-foreground">
                          {record.disease}
                        </h3>
                        <span
                          className={`px-3 py-1 text-xs rounded-full font-medium border ${getStatusColor(record.status)}`}
                        >
                          {getStatusLabel(record.status)}
                        </span>
                      </div>
                      <div className="space-y-2">
                        <div className="flex items-center space-x-2 text-sm text-muted-foreground">
                          <Calendar className="w-4 h-4" />
                          <span>
                            Diagnosed:{" "}
                            {new Date(record.diagnosedDate).toLocaleDateString(
                              "en-US",
                              {
                                year: "numeric",
                                month: "long",
                                day: "numeric",
                              },
                            )}
                          </span>
                        </div>
                        <div className="flex items-center space-x-2 text-sm text-muted-foreground">
                          <UserIcon className="w-4 h-4" />
                          <span>Treated by: {record.treatedBy}</span>
                        </div>
                        {record.notes && (
                          <div className="flex items-start space-x-2 text-sm text-muted-foreground mt-3">
                            <FileText className="w-4 h-4 flex-shrink-0 mt-0.5" />
                            <span>{record.notes}</span>
                          </div>
                        )}
                      </div>
                    </div>
                  </div>
                </div>
              ))
            ) : (
              <div className="text-center py-12 bg-muted/30 rounded-lg">
                <Activity className="w-12 h-12 text-muted-foreground mx-auto mb-3" />
                <p className="text-muted-foreground">
                  No medical history recorded yet
                </p>
                <p className="text-sm text-muted-foreground mt-1">
                  Your doctor will add records during consultations
                </p>
              </div>
            )}
          </div>
        </div>
      </div>
    </div>
  );
}
