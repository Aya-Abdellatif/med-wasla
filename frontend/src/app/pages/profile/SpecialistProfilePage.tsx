import { useState, useMemo, useEffect } from "react";
import { Navigate } from "react-router-dom";
import { useAuth } from "../../context/useAuth";
import { apiFetch, API_BASE, getToken } from "../../../services/api";
import {
  showError,
  showSuccess,
  showWarning,
  getToastUserContext,
} from "../../../utils/toast";
import { VerificationStatusNotice } from "../../components/common/VerificationStatusNotice";
import type { AvailableSlot } from "../../context/AuthContext";
import {
  buildProfileFormFromUser,
  buildProfileUpdatePayload,
  createEmptySlot,
  type NewCertificateForm,
  type ProfileForm,
} from "../Doctor side/dashboard/dashboardTypes";
import { ProfileTab } from "../Doctor side/dashboard/ProfileTab";

export function SpecialistProfilePage() {
  const { user, updateProfile, refreshSpecialistProfile } = useAuth();
  const [isEditingProfile, setIsEditingProfile] = useState(false);
  const [isSaving, setIsSaving] = useState(false);
  const [showCertForm, setShowCertForm] = useState(false);
  const [isUploadingPhoto, setIsUploadingPhoto] = useState(false);
  const [newCert, setNewCert] = useState<NewCertificateForm>({
    title: "",
    issuedBy: "",
    certificateUrl: "",
  });
  const [slotEdits, setSlotEdits] = useState<AvailableSlot[] | null>(null);
  const [isSavingSlots, setIsSavingSlots] = useState(false);
  const savedProfile = useMemo(() => buildProfileFormFromUser(user), [user]);
  const availableSlots = slotEdits ?? user?.availableSlots ?? [];
  const [profileData, setProfileData] = useState<ProfileForm>(
    buildProfileFormFromUser(user),
  );

  useEffect(() => {
    if (user?.role === "doctor" || user?.role === "nurse") {
      void refreshSpecialistProfile();
    }
  }, [user?.id, user?.role, refreshSpecialistProfile]);

  if (!user || (user.role !== "doctor" && user.role !== "nurse")) {
    return <Navigate to="/" replace />;
  }

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
      showWarning(
        "Please select an image file (JPG, PNG, etc.)",
        getToastUserContext(user),
      );
      return;
    }

    if (file.size > 5 * 1024 * 1024) {
      showWarning("Image must be smaller than 5MB", getToastUserContext(user));
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
      showSuccess(
        "Profile photo updated successfully!",
        getToastUserContext(user),
      );
    } catch (err) {
      showError(
        err instanceof Error ? err.message : "Failed to upload photo",
        getToastUserContext(user),
      );
    } finally {
      setIsUploadingPhoto(false);
    }
  };

  const handleUpdateProfile = async () => {
    if (user?.role === "doctor" && !profileData.specialty) {
      showWarning(
        "Please select a medical specialty",
        getToastUserContext(user),
      );
      return;
    }
    const payload = buildProfileUpdatePayload(profileData, savedProfile);
    if (Object.keys(payload).length === 0) {
      showWarning("No profile changes to submit", getToastUserContext(user));
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
      showSuccess(
        "Changes submitted for admin review. Your live profile stays unchanged until approved.",
        getToastUserContext(user),
      );
    } catch (err) {
      showError(
        err instanceof Error ? err.message : "Failed to update profile",
        getToastUserContext(user),
      );
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
      showSuccess(
        "Availability saved and visible on your public profile.",
        getToastUserContext(user),
      );
    } catch (err) {
      showError(
        err instanceof Error ? err.message : "Failed to save availability",
        getToastUserContext(user),
      );
    } finally {
      setIsSavingSlots(false);
    }
  };

  const handleAddCertificate = async () => {
    if (!newCert.title || !newCert.issuedBy || !newCert.certificateUrl) {
      showWarning(
        "Please fill all certificate fields",
        getToastUserContext(user),
      );
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
      showSuccess(
        "Certificate submitted for review!",
        getToastUserContext(user),
      );
    } catch (err) {
      showError(
        err instanceof Error ? err.message : "Failed to upload certificate",
        getToastUserContext(user),
      );
    }
  };

  return (
    <div className="min-h-screen" style={{ backgroundColor: "#f8fafc" }}>
      {user.verificationStatus && (
        <VerificationStatusNotice status={user.verificationStatus} />
      )}

      <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 py-8">
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
          onAddSlot={() =>
            setSlotEdits((prev) => [
              ...(prev ?? user?.availableSlots ?? []),
              createEmptySlot(),
            ])
          }
          onRemoveSlot={(index) =>
            setSlotEdits((prev) =>
              (prev ?? user?.availableSlots ?? []).filter(
                (_, slotIndex) => slotIndex !== index,
              ),
            )
          }
          onPhotoUpload={handlePhotoUpload}
          onAddCertificate={handleAddCertificate}
        />
      </div>
    </div>
  );
}
