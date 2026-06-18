import { useState, useEffect, useMemo } from "react";
import { Calendar, Users, TrendingUp, CheckCircle, Home as HomeIcon } from "lucide-react";
import { useAuth } from "../../context/useAuth";
import { apiFetch, API_BASE, getToken } from "../../../services/api";
import { showError, showSuccess, showWarning } from "../../../utils/toast";
import { VerificationStatusNotice } from "../../components/common/VerificationStatusNotice";
import type { AvailableSlot } from "../../context/AuthContext";
import type {
  Appointment,
  DashboardTab,
  HomeServiceRequest,
  NewCertificateForm,
  ProfileForm,
} from "./dashboard/dashboardTypes";
import {
  buildProfileFormFromUser,
  buildProfileUpdatePayload,
  createEmptySlot,
} from "./dashboard/dashboardTypes";
import {
  countAppointmentsThisWeek,
  countUniquePatients,
  getDateStrWithOffset,
  getFormattedToday,
  offersHomeService,
} from "./dashboard/dashboardUtils";
import { DashboardTabs } from "./dashboard/DashboardTabs";
import { OverviewTab } from "./dashboard/OverviewTab";
import { ScheduleTab } from "./dashboard/ScheduleTab";
import { ProfileTab } from "./dashboard/ProfileTab";
import { RequestsTab } from "./dashboard/RequestsTab";

export function Dashboard() {
  const { user, updateProfile, refreshSpecialistProfile } = useAuth();
  const [activeTab, setActiveTab] = useState<DashboardTab>("overview");
  const [selectedScheduleDate, setSelectedScheduleDate] = useState(() => getDateStrWithOffset(0));
  const [isEditingProfile, setIsEditingProfile] = useState(false);
  const [isSaving, setIsSaving] = useState(false);
  const [showCertForm, setShowCertForm] = useState(false);
  const [isUploadingPhoto, setIsUploadingPhoto] = useState(false);
  const [newCert, setNewCert] = useState<NewCertificateForm>({ title: "", issuedBy: "", certificateUrl: "" });
  const [slotEdits, setSlotEdits] = useState<AvailableSlot[] | null>(null);
  const [isSavingSlots, setIsSavingSlots] = useState(false);
  const savedProfile = useMemo(() => buildProfileFormFromUser(user), [user]);
  const availableSlots = slotEdits ?? user?.availableSlots ?? [];
  const [profileData, setProfileData] = useState<ProfileForm>(buildProfileFormFromUser(user));

  // Empty until appointments API is connected — new specialists start at zero.
  const [appointments] = useState<Appointment[]>([]);
  const [homeServiceRequests, setHomeServiceRequests] = useState<HomeServiceRequest[]>([]);

  useEffect(() => {
    if (user?.role === "doctor" || user?.role === "nurse") {
      refreshSpecialistProfile();
    }
  }, [user?.id, user?.role, refreshSpecialistProfile]);

  const todayStr = getDateStrWithOffset(0);
  const formValues = isEditingProfile ? profileData : savedProfile;

  const startEditingProfile = () => {
    setProfileData(buildProfileFormFromUser(user));
    setIsEditingProfile(true);
  };

  const cancelEditingProfile = () => {
    setIsEditingProfile(false);
  };

  const handlePhotoUpload = async (e: React.ChangeEvent<HTMLInputElement>) => {
    const file = e.target.files?.[0];
    if (!file) return;

    if (!file.type.startsWith("image/")) {
      showWarning("Please select an image file (JPG, PNG, etc.)", { userName: user?.name });
      return;
    }

    if (file.size > 5 * 1024 * 1024) {
      showWarning("Image must be smaller than 5MB", { userName: user?.name });
      return;
    }

    setIsUploadingPhoto(true);
    try {
      const token = getToken();
      const formData = new FormData();
      formData.append("photo", file);

      const res = await fetch(`${API_BASE}/api/specialists/me/photo`, {
        method: "PATCH",
        headers: token ? { Authorization: `Bearer ${token}` } : {},
        body: formData,
      });

      const data = (await res.json().catch(() => ({}))) as {
        data?: { photoUrl?: string };
        message?: string;
      };

      if (!res.ok) {
        throw new Error(data.message ?? "Failed to upload photo");
      }

      const photoUrl = data.data?.photoUrl;
      if (!photoUrl) {
        throw new Error("Failed to upload photo");
      }

      updateProfile({ avatar: photoUrl });
      await refreshSpecialistProfile();
      showSuccess("Profile photo updated successfully!", { userName: user?.name });
    } catch (err) {
      showError(err instanceof Error ? err.message : "Failed to upload photo", { userName: user?.name });
    } finally {
      setIsUploadingPhoto(false);
    }
  };

  const handleUpdateProfile = async () => {
    if (user?.role === "doctor" && !profileData.specialty) {
      showWarning("Please select a medical specialty", { userName: user?.name });
      return;
    }

    const payload = buildProfileUpdatePayload(profileData, savedProfile);
    if (Object.keys(payload).length === 0) {
      showWarning("No profile changes to submit", { userName: user?.name });
      return;
    }

    setIsSaving(true);
    try {
      await apiFetch("/api/specialists/profile", {
        method: "PUT",
        body: JSON.stringify(payload),
      });
      await refreshSpecialistProfile();
      setIsEditingProfile(false);
      showSuccess("Changes submitted for admin review. Your live profile stays unchanged until approved.", {
        userName: user?.name,
      });
    } catch (err) {
      showError(err instanceof Error ? err.message : "Failed to update profile", { userName: user?.name });
    } finally {
      setIsSaving(false);
    }
  };

  const handleSaveAvailability = async () => {
    setIsSavingSlots(true);
    try {
      await apiFetch("/api/specialists/availability", {
        method: "PUT",
        body: JSON.stringify({ availableSlots }),
      });
      await refreshSpecialistProfile();
      setSlotEdits(null);
      showSuccess("Availability saved and visible on your public profile.", { userName: user?.name });
    } catch (err) {
      showError(err instanceof Error ? err.message : "Failed to save availability", { userName: user?.name });
    } finally {
      setIsSavingSlots(false);
    }
  };

  const handleAddCertificate = async () => {
    if (!newCert.title || !newCert.issuedBy || !newCert.certificateUrl) {
      showWarning("Please fill all certificate fields", { userName: user?.name });
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
      showSuccess("Certificate submitted for review!", { userName: user?.name });
    } catch (err) {
      showError(err instanceof Error ? err.message : "Failed to upload certificate", { userName: user?.name });
    }
  };

  const handleRequestAction = (requestId: string, action: "accepted" | "rejected") => {
    setHomeServiceRequests((prev) =>
      prev.map((req) => (req.id === requestId ? { ...req, status: action } : req)),
    );
    showSuccess(action === "accepted" ? "Request accepted!" : "Request declined.", { userName: user?.name });
  };

  const pendingRequestsCount = homeServiceRequests.filter((r) => r.status === "pending").length;
  const showHomeServiceTab = offersHomeService(user);

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
      value: countUniquePatients(appointments),
      icon: Users,
      iconColor: "#7c3aed",
      bgColor: "#f5f3ff",
    },
    {
      label: showHomeServiceTab ? "Pending Requests" : "This Week",
      value: showHomeServiceTab ? pendingRequestsCount : countAppointmentsThisWeek(appointments),
      icon: showHomeServiceTab ? HomeIcon : TrendingUp,
      iconColor: "#ea580c",
      bgColor: "#fff7ed",
    },
  ];

  const todayUpcoming = appointments.filter((a) => a.date === todayStr && a.status === "scheduled");
  const filteredUpcoming = appointments.filter(
    (a) => a.date === selectedScheduleDate && a.status === "scheduled",
  );
  const filteredCompleted = appointments.filter(
    (a) => a.date === selectedScheduleDate && a.status === "completed",
  );

  const openScheduleTab = () => {
    setSelectedScheduleDate(todayStr);
    setActiveTab("schedule");
  };

  return (
    <div className="min-h-screen" style={{ backgroundColor: "#f8fafc" }}>
      {(user?.role === "doctor" || user?.role === "nurse") && user.verificationStatus && (
        <VerificationStatusNotice status={user.verificationStatus} />
      )}

      <DashboardTabs
        activeTab={activeTab}
        onTabChange={setActiveTab}
        formattedDate={getFormattedToday()}
        showRequestsTab={showHomeServiceTab}
        pendingRequestsCount={pendingRequestsCount}
      />

      <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 py-8">
        {activeTab === "overview" && (
          <OverviewTab
            stats={stats}
            todayUpcoming={todayUpcoming}
            onViewAllSchedule={openScheduleTab}
          />
        )}

        {activeTab === "schedule" && (
          <ScheduleTab
            selectedDate={selectedScheduleDate}
            onSelectedDateChange={setSelectedScheduleDate}
            filteredUpcoming={filteredUpcoming}
            filteredCompleted={filteredCompleted}
          />
        )}

        {activeTab === "profile" && (
          <ProfileTab
            user={user}
            formValues={formValues}
            profileData={profileData}
            onProfileDataChange={setProfileData}
            availableSlots={availableSlots}
            onAvailableSlotsChange={setSlotEdits}
            isEditingProfile={isEditingProfile}
            isSaving={isSaving}
            isSavingSlots={isSavingSlots}
            isUploadingPhoto={isUploadingPhoto}
            showCertForm={showCertForm}
            onShowCertFormChange={setShowCertForm}
            newCert={newCert}
            onNewCertChange={setNewCert}
            onStartEditing={startEditingProfile}
            onCancelEditing={cancelEditingProfile}
            onSaveProfile={handleUpdateProfile}
            onSaveAvailability={handleSaveAvailability}
            onAddSlot={() => setSlotEdits((prev) => [...(prev ?? user?.availableSlots ?? []), createEmptySlot()])}
            onRemoveSlot={(index) =>
              setSlotEdits((prev) =>
                (prev ?? user?.availableSlots ?? []).filter((_, slotIndex) => slotIndex !== index),
              )
            }
            onPhotoUpload={handlePhotoUpload}
            onAddCertificate={handleAddCertificate}
          />
        )}

        {activeTab === "requests" && showHomeServiceTab && (
          <RequestsTab requests={homeServiceRequests} onRequestAction={handleRequestAction} />
        )}
      </div>
    </div>
  );
}
