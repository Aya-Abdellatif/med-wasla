import { useRef, useState } from "react";
import {
  Edit,
  Save,
  Phone,
  Mail,
  MapPin,
  Award,
  FileCheck,
  Upload,
  Clock as ClockIcon,
  Plus,
  Trash2,
  Lock,
} from "lucide-react";
import { showWarning } from "../../../../utils/toast";
import type { User, AvailableSlot } from "../../../context/AuthContext";
import { MEDICAL_SPECIALIZATIONS } from "../../../../constants/medicalSpecializations";
import { getFirstName } from "../../../../utils/displayName";
import type { NewCertificateForm, ProfileForm } from "./dashboardTypes";
import { WEEK_DAYS } from "./dashboardTypes";
import { Avatar } from "./Avatar";

interface ProfileTabProps {
  user: User | null;
  formValues: ProfileForm;
  profileData: ProfileForm;
  onProfileDataChange: (data: ProfileForm) => void;
  availableSlots: AvailableSlot[];
  onAvailableSlotsChange: (slots: AvailableSlot[]) => void;
  isEditingProfile: boolean;
  isSaving: boolean;
  isSavingSlots: boolean;
  isUploadingPhoto: boolean;
  showCertForm: boolean;
  onShowCertFormChange: (show: boolean) => void;
  newCert: NewCertificateForm;
  onNewCertChange: (cert: NewCertificateForm) => void;
  onStartEditing: () => void;
  onCancelEditing: () => void;
  onSaveProfile: () => void;
  onSaveAvailability: () => void;
  onAddSlot: () => void;
  onRemoveSlot: (index: number) => void;
  onPhotoUpload: (e: React.ChangeEvent<HTMLInputElement>) => Promise<void>;
  onAddCertificate: () => void;
  onUpdateCertificate: (certId: string, cert: NewCertificateForm) => Promise<void>;
  onDeleteCertificate: (certId: string) => Promise<void>;
}

export function ProfileTab({
  user,
  formValues,
  profileData,
  onProfileDataChange,
  isEditingProfile,
  isSaving,
  isUploadingPhoto,
  showCertForm,
  onShowCertFormChange,
  newCert,
  onNewCertChange,
  onStartEditing,
  onCancelEditing,
  onSaveProfile,
  onSaveAvailability,
  onAddSlot,
  onRemoveSlot,
  onPhotoUpload,
  onAddCertificate,
  onUpdateCertificate,
  onDeleteCertificate,
  availableSlots,
  onAvailableSlotsChange,
  isSavingSlots,
}: ProfileTabProps) {
  const [editingCertId, setEditingCertId] = useState<string | null>(null);
  const [editingCert, setEditingCert] = useState<NewCertificateForm>({
    title: "",
    issuedBy: "",
    certificateUrl: "",
  });
  const photoInputRef = useRef<HTMLInputElement>(null);
  const firstName = getFirstName(user?.name);

  const handlePhotoChange = (e: React.ChangeEvent<HTMLInputElement>) => {
    void onPhotoUpload(e).finally(() => {
      if (photoInputRef.current) photoInputRef.current.value = "";
    });
  };

  const setField = <K extends keyof ProfileForm>(key: K, value: ProfileForm[K]) => {
    onProfileDataChange({ ...profileData, [key]: value });
  };

  const updateSlot = (index: number, field: keyof AvailableSlot, value: string) => {
    if (field === "day") {
      const isDuplicate = availableSlots.some(
        (slot, slotIndex) => slotIndex !== index && slot.day === value,
      );
      if (isDuplicate) {
        showWarning("This day already has a slot. Each weekday can only be added once.");
        return;
      }
    }

    onAvailableSlotsChange(
      availableSlots.map((slot, slotIndex) =>
        slotIndex === index ? { ...slot, [field]: value } : slot,
      ),
    );
  };

  const startEditingCert = (certId: string) => {
    const cert = user?.certificates?.find((item) => item.id === certId);
    if (!cert || cert.locked) return;
    setEditingCertId(certId);
    setEditingCert({
      title: cert.name,
      issuedBy: cert.issuer,
      certificateUrl: cert.fileUrl ?? "",
    });
  };

  const cancelEditingCert = () => {
    setEditingCertId(null);
    setEditingCert({ title: "", issuedBy: "", certificateUrl: "" });
  };

  const pending = user?.pendingProfileUpdates;

  return (
    <div className="bg-white rounded-xl p-8" style={{ boxShadow: "0 1px 3px rgba(0,0,0,0.1)" }}>
      <div className="flex items-center justify-between mb-8">
        <h2 className="text-xl font-bold" style={{ color: "#111827" }}>Profile Information</h2>
        {!isEditingProfile ? (
          <button
            onClick={onStartEditing}
            className="flex items-center space-x-2 px-4 py-2 text-white rounded-lg transition-colors text-sm bg-teal-500 hover:bg-teal-600"
          >
            <Edit className="w-4 h-4" />
            <span>Edit Profile</span>
          </button>
        ) : (
          <div className="flex space-x-2">
            <button
              onClick={onCancelEditing}
              className="px-4 py-2 border rounded-lg transition-colors text-sm border-gray-200 text-gray-700 hover:bg-gray-50"
            >
              Cancel
            </button>
            <button
              onClick={onSaveProfile}
              disabled={isSaving}
              className="flex items-center space-x-2 px-4 py-2 text-white rounded-lg transition-colors text-sm disabled:opacity-50 bg-teal-500 hover:bg-teal-600"
            >
              <Save className="w-4 h-4" />
              <span>{isSaving ? "Saving..." : "Save"}</span>
            </button>
          </div>
        )}
      </div>

      {pending && Object.keys(pending).length > 0 && (
        <div className="mb-6 rounded-lg border border-amber-200 bg-amber-50 px-4 py-3 text-sm text-amber-900">
          <p className="font-semibold">Pending admin review</p>
          <p className="mt-1 text-amber-800">
            Your live profile still shows the approved version until the admin approves these changes.
          </p>
          <ul className="mt-2 space-y-1">
            {pending.bio && <li>Bio update submitted</li>}
            {pending.location && <li>Location update submitted</li>}
            {pending.specialty && <li>Specialty update submitted</li>}
          </ul>
        </div>
      )}

      <div className="space-y-6">
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
              onChange={handlePhotoChange}
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

        <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
          <div>
            <label className="block mb-2 text-sm font-medium" style={{ color: "#374151" }}>Full Name</label>
            <input
              type="text"
              value={formValues.name}
              onChange={(e) => setField("name", e.target.value)}
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
                onChange={(e) => setField("email", e.target.value)}
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
                onChange={(e) => setField("phone", e.target.value)}
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
                    onChange={(e) => setField("specialty", e.target.value)}
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
                    onChange={(e) => setField("experience", e.target.value)}
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
                    onChange={(e) => setField("location", e.target.value)}
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
            onChange={(e) => setField("bio", e.target.value)}
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

        {(user?.role === "doctor" || user?.role === "nurse") && (
          <div className="pt-6 border-t" style={{ borderColor: "#e5e7eb" }}>
            <div className="flex items-center justify-between mb-4">
              <div>
                <h3 className="text-lg font-semibold" style={{ color: "#111827" }}>
                  Available Slots
                </h3>
                <p className="text-sm mt-1" style={{ color: "#6b7280" }}>
                  Saved immediately and shown on your public doctor/nurse card.
                </p>
              </div>
              <button
                type="button"
                onClick={onAddSlot}
                className="flex items-center space-x-2 px-4 py-2 border rounded-lg text-sm transition-colors border-gray-200 text-gray-700 hover:bg-gray-50"
              >
                <Plus className="w-4 h-4" />
                <span>Add Slot</span>
              </button>
            </div>

            <div className="space-y-3">
              {availableSlots.length > 0 ? (
                availableSlots.map((slot, index) => (
                  <div
                    key={`${slot.day}-${slot.startTime}-${index}`}
                    className="grid grid-cols-1 md:grid-cols-4 gap-3 p-4 border rounded-lg"
                    style={{ borderColor: "#e5e7eb" }}
                  >
                    <select
                      value={slot.day}
                      onChange={(e) => updateSlot(index, "day", e.target.value)}
                      className="px-3 py-2 border rounded-lg text-sm"
                    >
                      {WEEK_DAYS.map((day) => {
                        const dayTaken = availableSlots.some(
                          (slot, slotIndex) => slotIndex !== index && slot.day === day,
                        );
                        return (
                          <option key={day} value={day} disabled={dayTaken}>
                            {day}
                            {dayTaken ? " (added)" : ""}
                          </option>
                        );
                      })}
                    </select>
                    <input
                      type="time"
                      value={slot.startTime}
                      onChange={(e) => updateSlot(index, "startTime", e.target.value)}
                      className="px-3 py-2 border rounded-lg text-sm"
                    />
                    <input
                      type="time"
                      value={slot.endTime}
                      onChange={(e) => updateSlot(index, "endTime", e.target.value)}
                      className="px-3 py-2 border rounded-lg text-sm"
                    />
                    <button
                      type="button"
                      onClick={() => onRemoveSlot(index)}
                      className="flex items-center justify-center gap-2 px-3 py-2 border border-rose-200 text-rose-600 rounded-lg text-sm hover:bg-rose-50"
                    >
                      <Trash2 className="w-4 h-4" />
                      Remove
                    </button>
                  </div>
                ))
              ) : (
                <div className="text-center py-6 rounded-lg" style={{ backgroundColor: "#f9fafb" }}>
                  <ClockIcon className="w-10 h-10 mx-auto mb-2" style={{ color: "#9ca3af" }} />
                  <p style={{ color: "#6b7280" }}>No availability slots yet</p>
                </div>
              )}
            </div>

            <button
              type="button"
              onClick={onSaveAvailability}
              disabled={isSavingSlots}
              className="mt-4 px-4 py-2 bg-teal-500 text-white rounded-lg text-sm font-semibold hover:bg-teal-600 transition-colors disabled:opacity-50"
            >
              {isSavingSlots ? "Saving availability..." : "Save Availability"}
            </button>
          </div>
        )}

        {(user?.role === "doctor" || user?.role === "nurse") && (
          <div className="pt-6 border-t" style={{ borderColor: "#e5e7eb" }}>
            <div className="flex items-center justify-between mb-4">
              <h3 className="text-lg font-semibold" style={{ color: "#111827" }}>Certificates & Credentials</h3>
              <button
                onClick={() => onShowCertFormChange(!showCertForm)}
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
                  onChange={(e) => onNewCertChange({ ...newCert, title: e.target.value })}
                  className="w-full px-3 py-2 border rounded-lg text-sm"
                />
                <input
                  placeholder="Issued by"
                  value={newCert.issuedBy}
                  onChange={(e) => onNewCertChange({ ...newCert, issuedBy: e.target.value })}
                  className="w-full px-3 py-2 border rounded-lg text-sm"
                />
                <input
                  placeholder="Certificate URL"
                  value={newCert.certificateUrl}
                  onChange={(e) => onNewCertChange({ ...newCert, certificateUrl: e.target.value })}
                  className="w-full px-3 py-2 border rounded-lg text-sm"
                />
                <button
                  onClick={onAddCertificate}
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
                    {editingCertId === cert.id ? (
                      <div className="space-y-3">
                        <input
                          placeholder="Certificate title"
                          value={editingCert.title}
                          onChange={(e) =>
                            setEditingCert({ ...editingCert, title: e.target.value })
                          }
                          className="w-full px-3 py-2 border rounded-lg text-sm"
                        />
                        <input
                          placeholder="Issued by"
                          value={editingCert.issuedBy}
                          onChange={(e) =>
                            setEditingCert({ ...editingCert, issuedBy: e.target.value })
                          }
                          className="w-full px-3 py-2 border rounded-lg text-sm"
                        />
                        <input
                          placeholder="Certificate URL"
                          value={editingCert.certificateUrl}
                          onChange={(e) =>
                            setEditingCert({
                              ...editingCert,
                              certificateUrl: e.target.value,
                            })
                          }
                          className="w-full px-3 py-2 border rounded-lg text-sm"
                        />
                        <div className="flex gap-2">
                          <button
                            type="button"
                            onClick={() => {
                              void onUpdateCertificate(cert.id, editingCert).then(() =>
                                cancelEditingCert(),
                              );
                            }}
                            className="px-4 py-2 bg-teal-500 text-white rounded-lg text-sm font-semibold hover:bg-teal-600"
                          >
                            Save changes
                          </button>
                          <button
                            type="button"
                            onClick={cancelEditingCert}
                            className="px-4 py-2 border rounded-lg text-sm text-gray-700 hover:bg-gray-50"
                          >
                            Cancel
                          </button>
                        </div>
                      </div>
                    ) : (
                    <div className="flex items-start justify-between gap-3">
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
                          <div className="flex flex-wrap items-center gap-2">
                            <h4 className="font-semibold" style={{ color: "#111827" }}>
                              {cert.name}
                            </h4>
                            {cert.isRegistrationCert && (
                              <span className="px-2 py-0.5 text-xs rounded-full bg-sky-100 text-sky-800 font-medium">
                                Graduation certificate
                              </span>
                            )}
                          </div>
                          <p className="text-sm mt-1" style={{ color: "#6b7280" }}>
                            Issued by {cert.issuer}
                          </p>
                          <p className="text-sm" style={{ color: "#6b7280" }}>
                            Issue Date:{" "}
                            {new Date(cert.issueDate).toLocaleDateString("en-US", {
                              year: "numeric",
                              month: "long",
                              day: "numeric",
                            })}
                          </p>
                          {cert.locked && (
                            <p className="mt-2 flex items-center gap-1.5 text-xs text-emerald-800">
                              <Lock className="w-3.5 h-3.5" />
                              Verified by admin — cannot be edited or deleted
                            </p>
                          )}
                        </div>
                      </div>
                      <div className="flex flex-col items-end gap-2 shrink-0">
                        <span
                          className="px-3 py-1 text-xs rounded-full font-medium"
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
                        {!cert.locked && (
                          <div className="flex gap-1">
                            <button
                              type="button"
                              onClick={() => startEditingCert(cert.id)}
                              title="Edit certificate"
                              aria-label="Edit certificate"
                              className="p-2 border rounded-lg text-gray-700 hover:bg-white hover:border-teal-300 transition-colors"
                            >
                              <Edit className="w-4 h-4" />
                            </button>
                            <button
                              type="button"
                              onClick={() => void onDeleteCertificate(cert.id)}
                              title="Delete certificate"
                              aria-label="Delete certificate"
                              className="p-2 border border-rose-200 rounded-lg text-rose-600 hover:bg-rose-50 transition-colors"
                            >
                              <Trash2 className="w-4 h-4" />
                            </button>
                          </div>
                        )}
                      </div>
                    </div>
                    )}
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
  );
}
