import { useState, useEffect } from "react";
import {
  Edit,
  Save,
  Phone,
  Mail,
  AlertCircle,
  Activity,
  Calendar,
  FileText,
  ShieldCheck,
  Loader2,
} from "lucide-react";
import { useAuth } from "../../context/useAuth";
import {
  fetchPatientProfile,
  updatePatientProfile,
  type PatientProfileResponse,
} from "../../../services/patientApi";
import { showError, showSuccess } from "../../../utils/toast";

function formatDobForInput(dob?: string) {
  if (!dob) return "";

  const date = new Date(dob);
  if (Number.isNaN(date.getTime())) return "";

  const year = date.getFullYear();
  const month = String(date.getMonth() + 1).padStart(2, "0");
  const day = String(date.getDate()).padStart(2, "0");
  return `${year}-${month}-${day}`;
}

function buildProfileForm(data: PatientProfileResponse["user"]) {
  return {
    name: data.name,
    email: data.email,
    phone: data.phone,
    dob: formatDobForInput(data.dob),
    address: data.address ?? "",
    governorate: data.governorate ?? "",
  };
}

export function PatientProfile() {
  const { user, updateProfile } = useAuth();
  const [profile, setProfile] = useState<PatientProfileResponse | null>(null);
  const [loading, setLoading] = useState(true);
  const [loadError, setLoadError] = useState<string | null>(null);
  const [reloadKey, setReloadKey] = useState(0);
  const [isEditingProfile, setIsEditingProfile] = useState(false);
  const [isSaving, setIsSaving] = useState(false);
  const [profileData, setProfileData] = useState({
    name: "",
    email: "",
    phone: "",
    dob: "",
    address: "",
    governorate: "",
  });

  useEffect(() => {
    if (!user?.id || user.role !== "patient") {
      return;
    }

    let cancelled = false;

    void fetchPatientProfile(user.id)
      .then((data) => {
        if (cancelled) return;
        setProfile(data);
        setProfileData(buildProfileForm(data.user));
        setLoadError(null);
      })
      .catch((err) => {
        if (cancelled) return;
        setProfile(null);
        const message = err instanceof Error ? err.message : "Failed to load profile";
        setLoadError(message);
        showError(message);
      })
      .finally(() => {
        if (!cancelled) setLoading(false);
      });

    return () => {
      cancelled = true;
    };
  }, [user?.id, user?.role, reloadKey]);

  const handleUpdateProfile = async () => {
    if (!user?.id || !profile) return;

    setIsSaving(true);
    try {
      await updatePatientProfile(user.id, {
        name: profileData.name,
        email: profileData.email,
        phone: profileData.phone,
        address: profileData.address,
        dob: profileData.dob || undefined,
        governorate: profileData.governorate || undefined,
      });

      const data = await fetchPatientProfile(user.id);
      setProfile(data);
      setProfileData(buildProfileForm(data.user));
      setLoadError(null);

      updateProfile({
        name: data.user.name,
        email: data.user.email,
        phone: data.user.phone,
        location: data.user.address,
      });

      setIsEditingProfile(false);
      showSuccess("Profile updated successfully!");
    } catch (err) {
      showError(err instanceof Error ? err.message : "Failed to update profile");
    } finally {
      setIsSaving(false);
    }
  };

  if (!user?.id || user.role !== "patient") {
    return (
      <div className="min-h-screen bg-muted/30 flex items-center justify-center px-4">
        <p className="text-muted-foreground">Unable to load your profile.</p>
      </div>
    );
  }

  if (loading) {
    return (
      <div className="min-h-screen bg-muted/30 flex items-center justify-center">
        <Loader2 className="w-8 h-8 animate-spin text-primary" />
      </div>
    );
  }

  if (!profile) {
    return (
      <div className="min-h-screen bg-muted/30 flex flex-col items-center justify-center gap-4 px-4">
        <p className="text-muted-foreground text-center">
          {loadError ?? "Unable to load your profile."}
        </p>
        <button
          type="button"
          onClick={() => {
            setLoading(true);
            setReloadKey((key) => key + 1);
          }}
          className="px-4 py-2 bg-primary text-white rounded-lg hover:bg-primary/90 transition-colors"
        >
          Try Again
        </button>
      </div>
    );
  }

  const avatar = profile.user.photoUrl ?? user?.avatar;

  return (
    <div className="min-h-screen bg-muted/30 overflow-y-auto">
      <div className="bg-white border-b border-border">
        <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 py-6">
          <div className="flex items-center space-x-4">
            <div className="w-16 h-16 rounded-full overflow-hidden bg-primary/10">
              {avatar ? (
                <img src={avatar} alt={profile.user.name} className="w-full h-full object-cover" />
              ) : (
                <div className="w-full h-full flex items-center justify-center text-primary text-2xl font-semibold">
                  {profile.user.name.charAt(0)}
                </div>
              )}
            </div>
            <div>
              <h1 className="text-2xl font-bold text-foreground">{profile.user.name}</h1>
              <p className="text-muted-foreground">Manage your personal health information</p>
            </div>
          </div>
        </div>
      </div>

      <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 py-8">
        <div className="bg-white rounded-xl shadow-sm p-8 mb-6">
          <div className="flex items-center justify-between mb-8">
            <h2 className="text-xl font-bold text-foreground">Personal Information</h2>
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
                  onClick={() => {
                    setIsEditingProfile(false);
                    setProfileData(buildProfileForm(profile.user));
                  }}
                  className="px-4 py-2 border border-border rounded-lg hover:bg-muted transition-colors"
                >
                  Cancel
                </button>
                <button
                  onClick={handleUpdateProfile}
                  disabled={isSaving}
                  className="flex items-center space-x-2 px-4 py-2 bg-primary text-white rounded-lg hover:bg-primary/90 transition-colors disabled:opacity-50"
                >
                  {isSaving ? (
                    <Loader2 className="w-4 h-4 animate-spin" />
                  ) : (
                    <Save className="w-4 h-4" />
                  )}
                  <span>{isSaving ? "Saving..." : "Save"}</span>
                </button>
              </div>
            )}
          </div>

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

            <div>
              <label className="block mb-2 font-medium text-foreground">Date of Birth</label>
              <input
                type="date"
                value={profileData.dob}
                onChange={(e) => setProfileData({ ...profileData, dob: e.target.value })}
                disabled={!isEditingProfile}
                className="w-full px-4 py-3 border border-border rounded-lg focus:outline-none focus:ring-2 focus:ring-primary disabled:bg-muted disabled:cursor-not-allowed"
              />
            </div>

            <div>
              <label className="block mb-2 font-medium text-foreground">Governorate</label>
              <input
                type="text"
                value={profileData.governorate}
                onChange={(e) => setProfileData({ ...profileData, governorate: e.target.value })}
                disabled={!isEditingProfile}
                className="w-full px-4 py-3 border border-border rounded-lg focus:outline-none focus:ring-2 focus:ring-primary disabled:bg-muted disabled:cursor-not-allowed"
              />
            </div>

            <div className="md:col-span-2">
              <label className="block mb-2 font-medium text-foreground">Address</label>
              <textarea
                value={profileData.address}
                onChange={(e) => setProfileData({ ...profileData, address: e.target.value })}
                disabled={!isEditingProfile}
                rows={3}
                className="w-full px-4 py-3 border border-border rounded-lg focus:outline-none focus:ring-2 focus:ring-primary disabled:bg-muted disabled:cursor-not-allowed"
              />
            </div>
          </div>
        </div>

        <div className="bg-white rounded-xl shadow-sm p-8">
          <div className="flex items-center justify-between mb-6">
            <div className="flex items-center space-x-3">
              <Activity className="w-6 h-6 text-primary" />
              <h2 className="text-xl font-bold text-foreground">Medical History</h2>
            </div>
            <div className="flex items-center space-x-2 px-3 py-1.5 bg-blue-50 border border-blue-200 rounded-lg">
              <ShieldCheck className="w-4 h-4 text-blue-600" />
              <span className="text-sm text-blue-600 font-medium">Read-only for patients</span>
            </div>
          </div>

          <div className="mb-4 p-4 bg-yellow-50 border border-yellow-200 rounded-lg flex items-start space-x-3">
            <AlertCircle className="w-5 h-5 text-yellow-600 shrink-0 mt-0.5" />
            <div>
              <p className="text-sm text-yellow-800 font-medium">Restricted Access</p>
              <p className="text-sm text-yellow-700 mt-1">
                Your medical history can only be updated by your doctor or administrator.
              </p>
            </div>
          </div>

          <div className="space-y-4">
            {profile.medicalHistory.length > 0 ? (
              profile.medicalHistory.map((record, index) => (
                <div
                  key={`${record.condition}-${index}`}
                  className="p-6 border-2 rounded-lg border-border bg-muted/20"
                >
                  <h3 className="text-lg font-semibold text-foreground mb-2">{record.condition}</h3>
                  <div className="space-y-2">
                    <div className="flex items-center space-x-2 text-sm text-muted-foreground">
                      <Calendar className="w-4 h-4" />
                      <span>
                        Diagnosed:{" "}
                        {new Date(record.diagnosed).toLocaleDateString("en-US", {
                          year: "numeric",
                          month: "long",
                          day: "numeric",
                        })}
                      </span>
                    </div>
                    {record.notes && (
                      <div className="flex items-start space-x-2 text-sm text-muted-foreground mt-3">
                        <FileText className="w-4 h-4 shrink-0 mt-0.5" />
                        <span>{record.notes}</span>
                      </div>
                    )}
                  </div>
                </div>
              ))
            ) : (
              <div className="text-center py-12 bg-muted/30 rounded-lg">
                <Activity className="w-12 h-12 text-muted-foreground mx-auto mb-3" />
                <p className="text-muted-foreground">No medical history recorded yet</p>
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
