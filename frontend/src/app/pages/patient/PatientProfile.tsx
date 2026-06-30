import { useEffect, useState, useRef, type ChangeEvent } from "react";
import { useAuth } from "../../context/useAuth";
import type { DiseaseRecord, User } from "../../context/AuthContext";
import { fetchPatientProfile, updatePatientProfile, updatePatientSecurity, type PatientProfileApi } from "../../../services/patientApi";
import {
  User as UserIcon,
  Mail,
  Phone,
  Lock,
  Eye,
  EyeOff,
  CheckCircle2,
  AlertCircle,
  Activity,
  Calendar,
  FileText,
  ShieldCheck,
  ChevronDown,
  MapPin,
  Save,
  X,
  Edit,
  UploadCloud,
} from "lucide-react";
import { ImageWithFallback } from "../../figma/ImageWithFallback";

const EGYPTIAN_GOVERNORATES = [
  "Cairo", "Giza", "Alexandria", "Dakahlia", "Red Sea", "Beheira",
  "Fayoum", "Gharbia", "Ismailia", "Menofia", "Minya", "Qaliubiya",
  "New Valley", "Suez", "Aswan", "Assiut", "Beni Suef", "Port Said",
  "Damietta", "Sharqia", "South Sinai", "Kafr El Sheikh", "Matruh",
  "Luxor", "Qena", "North Sinai", "Sohag",
];

type Tab = "personal" | "security";

function FieldError({ msg }: { msg?: string }) {
  if (!msg) return null;
  return (
    <p className="flex items-center gap-1 text-xs text-red-600 mt-1">
      <AlertCircle className="w-3.5 h-3.5 flex-shrink-0" />
      {msg}
    </p>
  );
}

function SuccessBanner({ message, onDismiss }: { message: string; onDismiss: () => void }) {
  return (
    <div className="flex items-center gap-3 px-4 py-3 bg-emerald-50 border border-emerald-200 rounded-xl text-sm text-emerald-700">
      <CheckCircle2 className="w-4 h-4 flex-shrink-0" />
      <span className="flex-1">{message}</span>
      <button onClick={onDismiss}>
        <X className="w-4 h-4 opacity-60 hover:opacity-100" />
      </button>
    </div>
  );
}

// ─── Read-only info row ────────────────────────────────────────
function InfoRow({ label, value, icon: Icon }: { label: string; value?: string; icon?: React.ElementType }) {
  return (
    <div>
      <p className="text-xs font-medium text-fg-muted uppercase tracking-wider mb-1">{label}</p>
      <div className="flex items-center gap-2">
        {Icon && <Icon className="w-4 h-4 text-fg-muted flex-shrink-0" />}
        <p className="text-sm text-fg">{value || <span className="text-fg-muted italic">Not set</span>}</p>
      </div>
    </div>
  );
}

// ─── Personal Info Tab ──────────────────────────────────────────
function PersonalTab({ profile, onSave, isLoading }: {
  profile: PatientProfileApi["user"] | null;
  isLoading?: boolean;
  onSave: (payload: {
    name: string;
    phone: string;
    dob: string;
    governorate: string;
    address: string;
    photoUrl: string;
  }) => Promise<void>;
}) {
  const getInitialState = (p: PatientProfileApi["user"] | null) => ({
    name: p?.name || "",
    phone: p?.phone || "",
    dob: p?.dob ? p.dob.slice(0, 10) : "",
    governorate: p?.governorate || "",
    address: p?.address || "",
    photoUrl: p?.photoUrl || "",
  });

  const [editing, setEditing] = useState(false);
  const [saved, setSaved] = useState(getInitialState(profile));
  const [form, setForm] = useState(getInitialState(profile));
  const [errors, setErrors] = useState<Record<string, string>>({});
  const [govOpen, setGovOpen] = useState(false);
  const [govSearch, setGovSearch] = useState("");
  const [success, setSuccess] = useState(false);
  const [saveError, setSaveError] = useState<string>("");
  const [isSaving, setIsSaving] = useState(false);
  const fileInputRef = useRef<HTMLInputElement | null>(null);

  const handleFileChange = (e: ChangeEvent<HTMLInputElement>) => {
    const file = e.target.files?.[0];
    if (!file) return;
    const reader = new FileReader();
    reader.onload = () => {
      setForm((prev) => ({ ...prev, photoUrl: String(reader.result) }));
    };
    reader.readAsDataURL(file);
  };

  if (isLoading && !profile) {
    return <div className="py-10 text-center text-sm text-fg-muted">Loading profile...</div>;
  }

  const filteredGovs = EGYPTIAN_GOVERNORATES.filter((g) =>
    g.toLowerCase().includes(govSearch.toLowerCase())
  );

  const validate = () => {
    const e: Record<string, string> = {};
    if (!form.name.trim()) e.name = "Full name is required.";
    else if (form.name.trim().length < 3) e.name = "Name must be at least 3 characters.";
    if (!form.phone.trim()) e.phone = "Phone number is required.";
    else if (!/^\d{7,15}$/.test(form.phone.replace(/\s/g, ""))) e.phone = "Enter a valid phone number.";
    if (!form.dob) e.dob = "Date of birth is required.";
    if (!form.governorate) e.governorate = "Governorate is required.";
    return e;
  };

  const handleSave = async () => {
    const e = validate();
    if (Object.keys(e).length) { setErrors(e); return; }
    setSaveError("");
    setIsSaving(true);

    try {
      await onSave({
        name: form.name,
        phone: form.phone,
        dob: form.dob,
        governorate: form.governorate,
        address: form.address,
        photoUrl: form.photoUrl,
      });
      setSaved(form);
      // console.log("setSaved called");
      // console.log(saved);
      // console.log(form);
      setErrors({});
      setSuccess(true);
      setEditing(false);
    } catch (error) {
      setSaveError(error instanceof Error ? error.message : "Unable to save profile.");
    } finally {
      setIsSaving(false);
    }
  };

  const handleCancel = () => {
    setForm(saved);
    setErrors({});
    setEditing(false);
  };

  // ── View mode ──
  if (!editing) {
    return (
      <div className="space-y-6">
        {success && (
          <SuccessBanner
            message="Personal information saved successfully."
            onDismiss={() => setSuccess(false)}
          />
        )}

        <div className="flex items-center justify-between">
          <p className="text-sm text-fg-muted">Your personal details as registered on MedWasla.</p>
          <button
            onClick={() => setEditing(true)}
            className="group flex items-center gap-2 bg-primary text-white border-2 border-primary text-base px-4 py-1.5 rounded-xl cursor-pointer transition-all duration-300 ease-in-out hover:border-primary hover:-translate-y-0.5 hover:bg-white hover:text-primary hover:shadow-md whitespace-nowrap"
          >
            <Edit className="w-3.5 h-3.5" />
            Edit Profile
          </button>
        </div>

        <div className="grid grid-cols-1 md:grid-cols-2 gap-x-8 gap-y-5">
          <div className="md:col-span-2">
            <InfoRow label="Full Name" value={saved?.name} icon={UserIcon} />
          </div>
          <InfoRow
            label="Phone Number"
            value={saved?.phone ? `+20 ${saved.phone}` : undefined}
            icon={Phone}
          />
          <InfoRow
            label="Date of Birth"
            value={
              saved?.dob
                ? new Date(saved.dob).toLocaleDateString("en-US", {
                  year: "numeric",
                  month: "long",
                  day: "numeric",
                })
                : undefined
            }
            icon={Calendar}
          />
          <InfoRow label="Governorate" value={saved?.governorate} icon={MapPin} />
          <InfoRow label="Address Details" value={saved?.address} icon={MapPin} />
        </div>
      </div>
    );
  }

  // ── Edit mode ──
  return (
    <div className="space-y-6">
      <div className="flex items-center justify-between">
        <p className="text-sm text-fg-muted">Update your personal details below.</p>
        <span className="text-xs text-primary bg-primary/5 px-2.5 py-1 rounded-full">Editing</span>
      </div>

      {saveError && (
        <div className="rounded-2xl border border-red-200 bg-red-50 px-4 py-3 text-sm text-red-700">
          {saveError}
        </div>
      )}

      {/* Avatar + Row 1 — Full Name */}
      <div className="flex items-start gap-6">
        <div className="relative">
          <div className="w-24 h-24 rounded-full bg-primary/10 overflow-hidden flex items-center justify-center text-2xl text-fg">
            {form.photoUrl ? (
              <img src={form.photoUrl} alt="avatar" className="w-full h-full object-cover" />
            ) : (
              <span className="uppercase">{(profile?.name || "P").charAt(0)}</span>
            )}
          </div>
          <button
            type="button"
            onClick={() => fileInputRef.current?.click()}
            className="absolute -bottom-0.5 -right-0.5 bg-white border border-border rounded-full p-2 shadow-sm hover:bg-muted transition-colors"
            aria-label="Upload avatar"
          >
            <UploadCloud className="w-4 h-4 text-primary" />
          </button>
          <input ref={fileInputRef} onChange={handleFileChange} accept="image/*" type="file" className="hidden" />
        </div>
        <div className="flex-1">
          <label className="block text-sm font-medium text-fg mb-1.5">Full Name</label>
          <input
            type="text"
            value={form.name}
            onChange={(e) => { setForm({ ...form, name: e.target.value }); setErrors({ ...errors, name: "" }); }}
            placeholder="e.g. Ahmed Mohamed"
            className={`w-full px-4 py-3 bg-input-background border rounded-xl focus:outline-none focus:ring-2 focus:ring-primary transition-colors ${errors.name ? "border-red-400 focus:ring-red-300" : "border-border"}`}
          />
          <FieldError msg={errors.name} />
        </div>
      </div>

      {/* Row 2 — Phone + DOB */}
      <div className="grid grid-cols-1 md:grid-cols-2 gap-5">
        <div>
          <label className="block text-sm font-medium text-fg mb-1.5">Phone Number</label>
          <div className={`flex rounded-xl border overflow-hidden focus-within:ring-2 focus-within:ring-primary transition-colors ${errors.phone ? "border-red-400" : "border-border"}`}>
            <div className="flex items-center gap-2 px-3 py-3 bg-muted/50 border-r border-border flex-shrink-0 select-none">
              <span className="text-lg leading-none">🇪🇬</span>
              <span className="text-sm font-medium text-fg">+20</span>
              <ChevronDown className="w-3.5 h-3.5 text-fg-muted" />
            </div>
            <input
              type="tel"
              value={form.phone}
              onChange={(e) => { setForm({ ...form, phone: e.target.value }); setErrors({ ...errors, phone: "" }); }}
              placeholder="1234567890"
              className="flex-1 px-4 py-3 bg-input-background focus:outline-none text-sm"
            />
          </div>
          <FieldError msg={errors.phone} />
        </div>

        <div>
          <label className="block text-sm font-medium text-fg mb-1.5">Date of Birth</label>
          <input
            type="date"
            value={form.dob}
            max={new Date().toISOString().split("T")[0]}
            onChange={(e) => setForm({ ...form, dob: e.target.value })}
            className="w-full px-4 py-3 bg-input-background border border-border rounded-xl focus:outline-none focus:ring-2 focus:ring-primary transition-colors text-sm"
          />
        </div>
      </div>

      {/* Row 3 — Governorate + Address */}
      <div className="grid grid-cols-1 md:grid-cols-2 gap-5">
        <div className="relative">
          <label className="block text-sm font-medium text-fg mb-1.5">Governorate</label>
          <button
            type="button"
            onClick={() => { setGovOpen(!govOpen); setGovSearch(""); }}
            className="w-full flex items-center justify-between px-4 py-3 bg-input-background border border-border rounded-xl focus:outline-none focus:ring-2 focus:ring-primary transition-colors text-sm text-left"
          >
            <span className={form.governorate ? "text-fg" : "text-fg-muted"}>
              {form.governorate || "Select governorate"}
            </span>
            <ChevronDown className={`w-4 h-4 text-fg-muted transition-transform ${govOpen ? "rotate-180" : ""}`} />
          </button>
          {govOpen && (
            <div className="w-full mt-2 bg-white border border-border rounded-xl shadow-lg overflow-hidden">
              <div className="p-2 border-b border-border">
                <input
                  type="text"
                  value={govSearch}
                  onChange={(e) => setGovSearch(e.target.value)}
                  placeholder="Search governorate..."
                  autoFocus
                  className="w-full px-3 py-2 bg-input-background border border-border rounded-lg text-sm focus:outline-none focus:ring-2 focus:ring-primary"
                />
              </div>
              <ul className="max-h-40 overflow-y-auto">
                {filteredGovs.length === 0 && (
                  <li className="px-4 py-3 text-sm text-fg-muted text-center">No results</li>
                )}
                {filteredGovs.map((g) => (
                  <li key={g}>
                    <button
                      type="button"
                      onClick={() => { setForm({ ...form, governorate: g }); setGovOpen(false); }}
                      className={`w-full text-left px-4 py-2.5 text-sm hover:bg-primary/5 transition-colors ${form.governorate === g ? "text-primary bg-primary/5" : "text-fg"}`}
                    >
                      {g}
                    </button>
                  </li>
                ))}
              </ul>
            </div>
          )}
        </div>

        <div>
          <label className="block text-sm font-medium text-fg mb-1.5">
            Address Details
            <span className="ml-1 text-fg-muted">(Optional)</span>
          </label>
          <div className="relative">
            <MapPin className="absolute left-3 top-3.5 w-4 h-4 text-fg-muted" />
            <input
              type="text"
              value={form.address}
              onChange={(e) => setForm({ ...form, address: e.target.value })}
              placeholder="Street, building, apartment..."
              className="w-full pl-9 pr-4 py-3 bg-input-background border border-border rounded-xl focus:outline-none focus:ring-2 focus:ring-primary transition-colors text-sm"
            />
          </div>
        </div>
      </div>

      {/* Actions */}
      <div className="flex items-center gap-3 pt-2">
        <button
          onClick={handleSave}
          disabled={isSaving}
          className="group flex items-center gap-2 bg-primary text-white border-2 border-primary text-base px-3 py-1 rounded-xl cursor-pointer transition-all duration-300 ease-in-out hover:border-primary hover:-translate-y-0.5 hover:bg-white hover:text-primary hover:shadow-md whitespace-nowrap disabled:opacity-60 disabled:cursor-not-allowed disabled:hover:translate-y-0"
        >
          {isSaving ? (
            <>
              <div className="animate-spin rounded-full h-4 w-4 border-2 border-current border-t-transparent" />
              Saving...
            </>
          ) : (
            <>
              <Save className="w-4 h-4" />
              Save Changes
            </>
          )}
        </button>
        <button
          onClick={handleCancel}
          disabled={isSaving}
          className="group flex items-center gap-2 bg-white text-fg border-2 border-fg/10 text-base px-3 py-1 rounded-xl cursor-pointer transition-all duration-300 ease-in-out hover:border-fg-muted hover:-translate-y-0.5 hover:bg-fg-muted hover:text-white hover:shadow-md whitespace-nowrap disabled:opacity-50 disabled:cursor-not-allowed"
        >
          Cancel
        </button>
      </div>
    </div>
  );
}

// ─── Security Tab ───────────────────────────────────────────────
function SecurityTab({ user, onSave }: { user: User | null; onSave: (payload: { currentPassword: string; email: string; password?: string }) => Promise<void>; }) {
  const [editing, setEditing] = useState(false);
  const [savedEmail, setSavedEmail] = useState(user?.email || "");
  const [form, setForm] = useState({
    email: user?.email || "",
    currentPassword: "",
    newPassword: "",
    confirmPassword: "",
  });
  const [show, setShow] = useState({ current: false, newPw: false, confirm: false });
  const [errors, setErrors] = useState<Record<string, string>>({});
  const [saveError, setSaveError] = useState<string>("");
  const [success, setSuccess] = useState(false);
  const [isSaving, setIsSaving] = useState(false);

  const getStrength = (pw: string) => {
    if (!pw) return 0;
    let s = 0;
    if (pw.length >= 8) s++;
    if (/[A-Z]/.test(pw)) s++;
    if (/[0-9]/.test(pw)) s++;
    if (/[^A-Za-z0-9]/.test(pw)) s++;
    return s;
  };

  const strengthLabel = ["Password must be at least 8 characters", "Weak password", "Fair password", "Good password", "Strong password"];
  const strengthColor = ["", "bg-red-400", "bg-amber-400", "bg-blue-400", "bg-emerald-400"];
  const strengthText = ["", "text-red-600", "text-amber-600", "text-blue-600", "text-emerald-600"];
  const strength = getStrength(form.newPassword);

  const validate = () => {
    const e: Record<string, string> = {};
    const isEmailChanged = form.email.trim() !== savedEmail.trim();
    const isPasswordChanged = form.newPassword || form.confirmPassword;
    const requireCurrentPassword = isEmailChanged || isPasswordChanged;

    if (!form.email.trim()) e.email = "Email is required.";
    else if (!/^[^\s@]+@[^\s@]+\.[^\s@]+$/.test(form.email)) e.email = "Enter a valid email address.";

    if (requireCurrentPassword && !form.currentPassword) {
      e.currentPassword = "Current password is required to make changes.";
    }

    if (isPasswordChanged) {
      if (!form.newPassword) e.newPassword = "New password is required.";
      else if (form.newPassword.length < 8) e.newPassword = "Password must be at least 8 characters.";
      if (form.newPassword !== form.confirmPassword) e.confirmPassword = "Passwords do not match.";
    }

    return e;
  };

  const handleSave = async () => {
    const e = validate();
    if (Object.keys(e).length) { setErrors(e); return; }
    setSaveError("");
    setIsSaving(true);

    try {
      await onSave({
        currentPassword: form.currentPassword,
        email: form.email,
        password: form.newPassword || undefined,
      });
      setSavedEmail(form.email);
      setErrors({});
      setForm({ ...form, currentPassword: "", newPassword: "", confirmPassword: "" });
      setEditing(false);
      setSuccess(true);
    } catch (error) {
      setSaveError(error instanceof Error ? error.message : "Unable to save security settings.");
    } finally {
      setIsSaving(false);
    }
  };

  const handleCancel = () => {
    setForm({ email: savedEmail, currentPassword: "", newPassword: "", confirmPassword: "" });
    setErrors({});
    setEditing(false);
  };

  // ── View mode ──
  if (!editing) {
    return (
      <div className="space-y-6">
        {success && (
          <SuccessBanner
            message="Account & security settings saved successfully."
            onDismiss={() => setSuccess(false)}
          />
        )}

        <div className="flex items-center justify-between">
          <p className="text-sm text-fg-muted">Manage your login email and password.</p>
          <button
            onClick={() => setEditing(true)}
            className="group flex items-center gap-2 bg-primary text-white border-2 border-primary text-base px-4 py-1.5 rounded-xl cursor-pointer transition-all duration-300 ease-in-out hover:border-primary hover:-translate-y-0.5 hover:bg-white hover:text-primary hover:shadow-md whitespace-nowrap"
          >
            <Edit className="w-3.5 h-3.5" />
            Edit Security
          </button>
        </div>

        <div className="space-y-5">
          <InfoRow label="Email Address" value={savedEmail} icon={Mail} />
          <div>
            <p className="text-xs font-medium text-fg-muted uppercase tracking-wider mb-1">Password</p>
            <div className="flex items-center gap-2">
              <Lock className="w-4 h-4 text-fg-muted" />
              <p className="text-sm text-fg tracking-widest">••••••••••</p>
            </div>
          </div>
        </div>
      </div>
    );
  }

  // ── Edit mode ──
  return (
    <div className="space-y-6">
      <div className="flex items-center justify-between">
        <p className="text-sm text-fg-muted">Update your email or change your password.</p>
        <span className="text-xs text-primary bg-primary/5 px-2.5 py-1 rounded-full">Editing</span>
      </div>
      {saveError && (
        <div className="rounded-2xl border border-red-200 bg-red-50 px-4 py-3 text-sm text-red-700">
          {saveError}
        </div>
      )}
      <div className="relative">
        <Lock className="absolute left-3 top-1/2 -translate-y-1/2 w-4 h-4 text-fg-muted" />
        <input
          type={show.current ? "text" : "password"}
          value={form.currentPassword}
          onChange={(e) => { setForm({ ...form, currentPassword: e.target.value }); setErrors({ ...errors, currentPassword: "" }); }}
          placeholder="Enter current password"
          className={`w-full pl-9 pr-10 py-3 bg-input-background border rounded-xl focus:outline-none focus:ring-2 focus:ring-primary transition-colors text-sm ${errors.currentPassword ? "border-red-400 focus:ring-red-300" : "border-border"}`}
        />
        <button type="button" onClick={() => setShow({ ...show, current: !show.current })} className="absolute right-3 top-1/2 -translate-y-1/2 text-fg-muted hover:text-fg">
          {show.current ? <EyeOff className="w-4 h-4" /> : <Eye className="w-4 h-4" />}
        </button>
      </div>
      <FieldError msg={errors.currentPassword} />

      {/* Divider */}
      <div className="flex items-center gap-3">
        <div className="flex-1 h-px bg-border" />
        <span className="text-xs text-fg-muted px-2">Change Email</span>
        <div className="flex-1 h-px bg-border" />
      </div>

      {/* Email */}
      <div>
        <label className="block text-sm font-medium text-fg mb-1.5">Email Address</label>
        <div className="relative">
          <Mail className="absolute left-3 top-1/2 -translate-y-1/2 w-4 h-4 text-fg-muted" />
          <input
            type="email"
            value={form.email}
            onChange={(e) => { setForm({ ...form, email: e.target.value }); setErrors({ ...errors, email: "" }); }}
            placeholder="you@example.com"
            className={`w-full pl-9 pr-4 py-3 bg-input-background border rounded-xl focus:outline-none focus:ring-2 focus:ring-primary transition-colors text-sm ${errors.email ? "border-red-400 focus:ring-red-300" : "border-border"}`}
          />
        </div>
        <FieldError msg={errors.email} />
      </div>

      <div className="flex items-center gap-3">
        <div className="flex-1 h-px bg-border" />
        <span className="text-xs text-fg-muted px-2">Change Password</span>
        <div className="flex-1 h-px bg-border" />
      </div>

      <div>
        <label className="block text-sm font-medium text-fg mb-1.5">New Password</label>
        <div className="relative">
          <Lock className="absolute left-3 top-1/2 -translate-y-1/2 w-4 h-4 text-fg-muted" />
          <input
            type={show.newPw ? "text" : "password"}
            value={form.newPassword}
            onChange={(e) => { setForm({ ...form, newPassword: e.target.value }); setErrors({ ...errors, newPassword: "" }); }}
            placeholder="Enter new password"
            className={`w-full pl-9 pr-10 py-3 bg-input-background border rounded-xl focus:outline-none focus:ring-2 focus:ring-primary transition-colors text-sm ${errors.newPassword ? "border-red-400 focus:ring-red-300" : "border-border"}`}
          />
          <button type="button" onClick={() => setShow({ ...show, newPw: !show.newPw })} className="absolute right-3 top-1/2 -translate-y-1/2 text-fg-muted hover:text-fg">
            {show.newPw ? <EyeOff className="w-4 h-4" /> : <Eye className="w-4 h-4" />}
          </button>
        </div>
        {form.newPassword && (
          <div className="mt-2">
            <div className="flex gap-1 mb-1">
              {[1, 2, 3, 4].map((i) => (
                <div key={i} className={`h-1 flex-1 rounded-full transition-colors ${i <= strength ? strengthColor[strength] : "bg-border"}`} />
              ))}
            </div>
            <p className={`text-xs ${strengthText[strength]}`}>{strengthLabel[strength]}</p>
          </div>
        )}
        <FieldError msg={errors.newPassword} />
      </div>

      <div>
        <label className="block text-sm font-medium text-fg mb-1.5">Confirm New Password</label>
        <div className="relative">
          <Lock className="absolute left-3 top-1/2 -translate-y-1/2 w-4 h-4 text-fg-muted" />
          <input
            type={show.confirm ? "text" : "password"}
            value={form.confirmPassword}
            onChange={(e) => { setForm({ ...form, confirmPassword: e.target.value }); setErrors({ ...errors, confirmPassword: "" }); }}
            placeholder="Repeat new password"
            className={`w-full pl-9 pr-10 py-3 bg-input-background border rounded-xl focus:outline-none focus:ring-2 focus:ring-primary transition-colors text-sm ${errors.confirmPassword ? "border-red-400 focus:ring-red-300" : "border-border"}`}
          />
          <button type="button" onClick={() => setShow({ ...show, confirm: !show.confirm })} className="absolute right-3 top-1/2 -translate-y-1/2 text-fg-muted hover:text-fg">
            {show.confirm ? <EyeOff className="w-4 h-4" /> : <Eye className="w-4 h-4" />}
          </button>
        </div>
        {form.confirmPassword && form.newPassword && form.confirmPassword === form.newPassword && (
          <p className="flex items-center gap-1 text-xs text-emerald-600 mt-1">
            <CheckCircle2 className="w-3.5 h-3.5" /> Passwords match
          </p>
        )}
        <FieldError msg={errors.confirmPassword} />
      </div>

      <div className="flex items-center gap-3 pt-2">
        <button
          onClick={handleSave}
          disabled={isSaving}
          className="group flex items-center gap-2 bg-primary text-white border-2 border-primary text-base px-3 py-1 rounded-xl cursor-pointer transition-all duration-300 ease-in-out hover:border-primary hover:-translate-y-0.5 hover:bg-white hover:text-primary hover:shadow-md whitespace-nowrap disabled:opacity-60 disabled:cursor-not-allowed disabled:hover:translate-y-0"
        >
          <Save className="w-4 h-4" />
          Save Changes
        </button>
        <button
          onClick={handleCancel}
          className="group flex items-center gap-2 bg-white text-fg border-2 border-fg/10 text-base px-3 py-1 rounded-xl cursor-pointer transition-all duration-300 ease-in-out hover:border-fg-muted hover:-translate-y-0.5 hover:bg-fg-muted hover:text-white hover:shadow-md whitespace-nowrap"
        >
          Cancel
        </button>
      </div>
    </div>
  );
}

// ─── Main Page ──────────────────────────────────────────────────
export function PatientProfile() {
  const { user, updateProfile } = useAuth();
  const [profile, setProfile] = useState<PatientProfileApi | null>(null);
  const [isProfileLoading, setIsProfileLoading] = useState(true);
  const [profileError, setProfileError] = useState<string | null>(null);
  const [activeTab, setActiveTab] = useState<Tab>("personal");

  const hasFetchedRef = useRef(false);

  useEffect(() => {
    if (!user?.id || hasFetchedRef.current) return;
    hasFetchedRef.current = true;

    fetchPatientProfile(user.id)
      .then((data: PatientProfileApi) => {
        setProfile(data);
        // console.log(data);
      })
      .catch((error: unknown) => {
        setProfileError(error instanceof Error ? error.message : "Unable to load patient profile.");
      })
      .finally(() => setIsProfileLoading(false));
  }, [user?.id]);

  const handleSaveProfile = async (payload: {
    name: string;
    phone: string;
    dob: string;
    governorate: string;
    address: string;
    photoUrl: string;
  }) => {
    if (!user?.id) throw new Error("Unable to save profile without a logged in user.");
    const updatedUser = await updatePatientProfile(user.id, payload);

    setProfile((currentProfile) =>
      currentProfile
        ? { ...currentProfile, user: updatedUser }
        : {
          patientId: user.id,
          user: updatedUser,
          medicalHistory: [],
          createdAt: undefined,
          updatedAt: undefined,
        }
    );

    updateProfile({ name: updatedUser.name, phone: updatedUser.phone });
  };

  const getStatusColor = (status: string) => {
    switch (status) {
      case "active": return "bg-red-100 text-red-700 border-red-200";
      case "under_treatment": return "bg-blue-100 text-blue-700 border-blue-200";
      case "resolved": return "bg-emerald-100 text-emerald-700 border-emerald-200";
      default: return "bg-gray-100 text-gray-700 border-gray-200";
    }
  };

  const getStatusLabel = (status: string) => {
    switch (status) {
      case "active": return "Active";
      case "under_treatment": return "Under Treatment";
      case "resolved": return "Resolved";
      default: return status;
    }
  };

  const tabs: { id: Tab; label: string; icon: React.ElementType }[] = [
    { id: "personal", label: "Personal Information", icon: UserIcon },
    { id: "security", label: "Account & Security", icon: Lock },
  ];

  return (
    <div className="min-h-screen bg-muted/20">
      {/* Header banner */}
      <div className="bg-linear-to-br from-[#F6FFFB] via-[#ECFEFF] to-[#F0FDFA] py-10 px-4">
        <div className="max-w-5xl mx-auto flex items-center gap-5">
          <div className="w-25 h-25 rounded-full bg-primary/20 flex items-center justify-center flex-shrink-0 overflow-hidden ring-2 ring-white/30">
            {user?.avatar ? (
              <ImageWithFallback src={user.avatar} alt={user.name} className="w-full h-full object-cover" />
            ) : (
              <span className="text-fg/70 text-3xl font-bold">{user?.name?.charAt(0) ?? "P"}</span>
            )}
          </div>
          <div>
            <h1 className="text-xl font-bold text-fg/90">{user?.name ?? "Patient"}</h1>
            <p className="text-fg/70 text-sm mt-0.5">Patient · MedWasla</p>
          </div>
        </div>
      </div>

      <div className="max-w-5xl mx-auto px-4 py-8 space-y-6">
        {/* Tab card */}
        <div className="bg-white rounded-2xl border border-border shadow-sm overflow-hidden">
          {/* Tab header */}
          <div className="flex border-b border-border">
            {tabs.map((tab) => {
              const Icon = tab.icon;
              const active = activeTab === tab.id;
              return (
                <button
                  key={tab.id}
                  onClick={() => setActiveTab(tab.id)}
                  className={`flex-1 flex items-center justify-center gap-2 px-4 py-4 text-m text-fg font-medium transition-colors relative ${active ? "text-primary" : "text-fg/95"
                    }`}
                >
                  <Icon className="w-4 h-4" />
                  {tab.label}
                  {active && (
                    <span className="absolute bottom-0 left-0 right-0 h-0.5 bg-primary rounded-t-full" />
                  )}
                </button>
              );
            })}
          </div>

          {/* Tab body */}
          <div className="p-6 md:p-8">
            {profileError && (
              <div className="mb-6 rounded-2xl border border-red-200 bg-red-50 px-4 py-3 text-sm text-red-700">
                Unable to load patient profile: {profileError}
              </div>
            )}

            {/* Keep PersonalTab mounted at all times so saving never unmounts it.
                Show a spinner inside the tab while the initial load is in flight. */}
            <div className={activeTab === "personal" ? "" : "hidden"}>
              <PersonalTab
                key={profile?.user?.name ?? "loading"}
                profile={profile?.user ?? null}
                onSave={handleSaveProfile}
                isLoading={isProfileLoading}
              />            
              </div>

            {activeTab === "security" && <SecurityTab user={user} onSave={async (payload) => {
              if (!user?.id) throw new Error("Unable to save security settings without a logged in user.");
              const updatedUser = await updatePatientSecurity(user.id, payload);
              // console.log("updatedUser", updatedUser);
              if (updatedUser.email) {
                updateProfile({ email: updatedUser.email });
                // console.log(user);
              }
            }} />}
          </div>
        </div>

        {/* Medical History (read-only, always visible) */}
        <div className="bg-white rounded-2xl border border-border shadow-sm p-6 md:p-8">
          <div className="flex items-center justify-between mb-5">
            <div className="flex items-center gap-2">
              <Activity className="w-5 h-5 text-primary" />
              <h2 className="font-bold text-fg">Medical History</h2>
            </div>
            <span className="flex items-center gap-1.5 px-3 py-1 bg-primary/10 border border-primary rounded-lg text-xs text-primary font-medium">
              <ShieldCheck className="w-3.5 h-3.5" />
              Read-only for patients
            </span>
          </div>

          <div className="flex items-start gap-3 p-3 bg-amber-50 border border-amber-100 rounded-xl mb-5 text-sm text-amber-800">
            <AlertCircle className="w-4 h-4 text-amber-500 flex-shrink-0 mt-0.5" />
            <p>Your medical history can only be updated by your doctor or administrator for accuracy and security.</p>
          </div>

          {user?.diseaseHistory && user.diseaseHistory.length > 0 ? (
            <div className="space-y-3">
              {user.diseaseHistory.map((record: DiseaseRecord) => (
                <div key={record.id} className="p-4 border border-border rounded-xl bg-muted/10">
                  <div className="flex items-start justify-between mb-2">
                    <h3 className="font-semibold text-fg">{record.disease}</h3>
                    <span className={`px-2.5 py-0.5 text-xs rounded-full font-medium border ${getStatusColor(record.status)}`}>
                      {getStatusLabel(record.status)}
                    </span>
                  </div>
                  <div className="space-y-1.5 text-sm text-fg-muted">
                    <span className="flex items-center gap-2">
                      <Calendar className="w-3.5 h-3.5" />
                      Diagnosed:{" "}
                      {new Date(record.diagnosedDate).toLocaleDateString("en-US", {
                        year: "numeric",
                        month: "long",
                        day: "numeric",
                      })}
                    </span>
                    <span className="flex items-center gap-2">
                      <UserIcon className="w-3.5 h-3.5" />
                      Treated by: {record.treatedBy}
                    </span>
                    {record.notes && (
                      <span className="flex items-start gap-2">
                        <FileText className="w-3.5 h-3.5 flex-shrink-0 mt-0.5" />
                        {record.notes}
                      </span>
                    )}
                  </div>
                </div>
              ))}
            </div>
          ) : (
            <div className="text-center py-10 bg-muted/20 rounded-xl">
              <Activity className="w-10 h-10 text-fg-muted/50 mx-auto mb-2" />
              <p className="text-fg-muted text-sm">No medical history recorded yet.</p>
              <p className="text-xs text-fg-muted mt-1">Your doctor will add records during consultations.</p>
            </div>
          )}
        </div>
      </div>
    </div>
  );
}
