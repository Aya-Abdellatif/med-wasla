import { useEffect, useState, useRef, type ChangeEvent } from "react";
import { createPortal } from "react-dom";
import { useTranslation } from "react-i18next";
import { useAuth } from "../../context/useAuth";
import type { DiseaseRecord, User } from "../../context/AuthContext";
import { fetchPatientProfile, updatePatientProfile, updatePatientPhoto, removePatientPhoto, updatePatientSecurity, type PatientProfileApi } from "../../../services/patientApi";
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
  Edit,
  UploadCloud,
  Trash2,
  Camera,
  X,
} from "lucide-react";
import { ImageWithFallback } from "../../figma/ImageWithFallback";
import { showError, showSuccess } from "../../../utils/toast";
import { EgyptianGovernorates } from "../../../constants/governorates";

function stripPhoneDisplay(phone: string): string {
  const digits = phone.replace(/\D/g, "");
  return digits.startsWith("0") ? digits.slice(1) : digits;
}

type Tab = "personal" | "security";

const PHOTO_MENU_WIDTH = 208;

function FieldError({ msg }: { msg?: string }) {
  if (!msg) return null;
  return (
    <p className="flex items-center gap-1 text-xs text-red-600 mt-1">
      <AlertCircle className="w-3.5 h-3.5 flex-shrink-0" />
      {msg}
    </p>
  );
}

// ─── Read-only info row ────────────────────────────────────────
function InfoRow({ label, value, icon: Icon }: { label: string; value?: string; icon?: React.ElementType }) {
  const { t } = useTranslation(["patientProfile"]);
  return (
    <div>
      <p className="text-xs font-medium text-fg-muted uppercase tracking-wider mb-1">{label}</p>
      <div className="flex items-center gap-2">
        {Icon && <Icon className="w-4 h-4 text-fg-muted flex-shrink-0" />}
        <p className="text-sm text-fg">{value || <span className="text-fg-muted italic">{t("patientProfile:personal.notSet")}</span>}</p>
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
    photo?: File;
    removePhoto?: boolean;
  }) => Promise<{ photoUrl?: string }>;
}) {
  const { t, i18n } = useTranslation(["patientProfile"]);
  const dateLocale = i18n.language === "ar" ? "ar-EG" : "en-US";

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
  const [isSaving, setIsSaving] = useState(false);
  const [selectedPhotoFile, setSelectedPhotoFile] = useState<File | null>(null);
  const [removePhotoRequested, setRemovePhotoRequested] = useState(false);
  const [photoMenuOpen, setPhotoMenuOpen] = useState(false);
  const [showPhotoPreview, setShowPhotoPreview] = useState(false);
  const [photoMenuPosition, setPhotoMenuPosition] = useState({ top: 0, left: 0 });
  const fileInputRef = useRef<HTMLInputElement | null>(null);
  const photoEditButtonRef = useRef<HTMLButtonElement | null>(null);
  const photoMenuRef = useRef<HTMLDivElement | null>(null);

  const hasProfilePhoto = Boolean(form.photoUrl);

  const updatePhotoMenuPosition = () => {
    const button = photoEditButtonRef.current;
    if (!button) return;

    const rect = button.getBoundingClientRect();
    setPhotoMenuPosition({
      top: rect.bottom + 8,
      left: Math.min(
        Math.max(8, rect.right - PHOTO_MENU_WIDTH),
        window.innerWidth - PHOTO_MENU_WIDTH - 8,
      ),
    });
  };

  useEffect(() => {
    if (!photoMenuOpen) return;

    updatePhotoMenuPosition();
    window.addEventListener("resize", updatePhotoMenuPosition);
    window.addEventListener("scroll", updatePhotoMenuPosition, true);

    const handleClickOutside = (event: MouseEvent) => {
      const target = event.target as Node;
      if (
        photoMenuRef.current?.contains(target) ||
        photoEditButtonRef.current?.contains(target)
      ) {
        return;
      }
      setPhotoMenuOpen(false);
    };

    document.addEventListener("mousedown", handleClickOutside);
    return () => {
      window.removeEventListener("resize", updatePhotoMenuPosition);
      window.removeEventListener("scroll", updatePhotoMenuPosition, true);
      document.removeEventListener("mousedown", handleClickOutside);
    };
  }, [photoMenuOpen]);

  const handleFileChange = (e: ChangeEvent<HTMLInputElement>) => {
    const file = e.target.files?.[0];
    if (!file) return;

    if (!file.type.startsWith("image/")) {
      showError(t("patientProfile:personal.photo.invalidType"));
      return;
    }

    if (file.size > 5 * 1024 * 1024) {
      showError(t("patientProfile:personal.photo.tooLarge"));
      return;
    }

    setSelectedPhotoFile(file);
    setRemovePhotoRequested(false);
    setPhotoMenuOpen(false);

    const reader = new FileReader();
    reader.onload = () => {
      setForm((prev) => ({ ...prev, photoUrl: String(reader.result) }));
    };
    reader.readAsDataURL(file);
  };

  const handleRemovePhoto = () => {
    setForm((prev) => ({ ...prev, photoUrl: "" }));
    setSelectedPhotoFile(null);
    if (saved.photoUrl) setRemovePhotoRequested(true);
    if (fileInputRef.current) fileInputRef.current.value = "";
    setPhotoMenuOpen(false);
    setShowPhotoPreview(false);
  };

  if (isLoading && !profile) {
    return <div className="py-10 text-center text-sm text-fg-muted">{t("patientProfile:personal.loading")}</div>;
  }

  const filteredGovs = EgyptianGovernorates.filter((g) =>
    t(`patientProfile:governorates.${g}`).toLowerCase().includes(govSearch.toLowerCase())
    || g.toLowerCase().includes(govSearch.toLowerCase())
  );

  const validate = () => {
    const e: Record<string, string> = {};
    if (!form.name.trim()) e.name = t("patientProfile:personal.errors.nameRequired");
    else if (form.name.trim().length < 3) e.name = t("patientProfile:personal.errors.nameTooShort");
    if (!form.phone.trim()) e.phone = t("patientProfile:personal.errors.phoneRequired");
    else if (!/^0?1[0125][0-9]{8}$/.test(form.phone.replace(/\s/g, ""))) e.phone = t("patientProfile:personal.errors.phoneInvalid");
    if (!form.dob) e.dob = t("patientProfile:personal.errors.dobRequired");
    if (!form.governorate) e.governorate = t("patientProfile:personal.errors.governorateRequired");
    return e;
  };

  const handleSave = async () => {
    const e = validate();
    if (Object.keys(e).length) { setErrors(e); return; }
    setIsSaving(true);

    try {
      const normalizedPhone = stripPhoneDisplay(form.phone);
      const result = await onSave({
        name: form.name,
        phone: normalizedPhone,
        dob: form.dob,
        governorate: form.governorate,
        address: form.address,
        ...(selectedPhotoFile ? { photo: selectedPhotoFile } : {}),
        ...(removePhotoRequested ? { removePhoto: true } : {}),
      });
      const nextSaved = {
        ...form,
        phone: normalizedPhone,
        photoUrl: result.photoUrl ?? "",
      };
      setSaved(nextSaved);
      setForm(nextSaved);
      setSelectedPhotoFile(null);
      setRemovePhotoRequested(false);
      if (fileInputRef.current) fileInputRef.current.value = "";
      setErrors({});
      showSuccess(t("patientProfile:personal.toast.saveSuccess"));
      setPhotoMenuOpen(false);
      setShowPhotoPreview(false);
      setEditing(false);
    } catch (error) {
      showError(error instanceof Error ? error.message : t("patientProfile:personal.toast.saveError"));
    } finally {
      setIsSaving(false);
    }
  };

  const handleCancel = () => {
    setForm(saved);
    setSelectedPhotoFile(null);
    setRemovePhotoRequested(false);
    if (fileInputRef.current) fileInputRef.current.value = "";
    setPhotoMenuOpen(false);
    setShowPhotoPreview(false);
    setErrors({});
    setEditing(false);
  };

  // ── View mode ──
  if (!editing) {
    return (
      <div className="space-y-6">
        <div className="flex items-center justify-between">
          <p className="text-sm text-fg-muted">{t("patientProfile:personal.view.description")}</p>
          <button
            onClick={() => setEditing(true)}
            className="group flex items-center gap-2 bg-primary text-white border-2 border-primary text-base px-4 py-1.5 rounded-xl cursor-pointer transition-all duration-300 ease-in-out hover:border-primary hover:-translate-y-0.5 hover:bg-white hover:text-primary hover:shadow-md whitespace-nowrap"
          >
            <Edit className="w-3.5 h-3.5" />
            {t("patientProfile:personal.view.editButton")}
          </button>
        </div>

        <div className="grid grid-cols-1 md:grid-cols-2 gap-x-8 gap-y-5">
          <div className="md:col-span-2">
            <InfoRow label={t("patientProfile:personal.fields.fullName")} value={saved?.name} icon={UserIcon} />
          </div>
          <InfoRow
            label={t("patientProfile:personal.fields.phone")}
            value={saved?.phone ? `+20 ${stripPhoneDisplay(saved.phone)}` : undefined}
            icon={Phone}
          />
          <InfoRow
            label={t("patientProfile:personal.fields.dob")}
            value={
              saved?.dob
                ? new Date(saved.dob).toLocaleDateString(dateLocale, {
                  year: "numeric",
                  month: "long",
                  day: "numeric",
                })
                : undefined
            }
            icon={Calendar}
          />
          <InfoRow
            label={t("patientProfile:personal.fields.governorate")}
            value={saved?.governorate ? t(`patientProfile:governorates.${saved.governorate}`) : undefined}
            icon={MapPin}
          />
          <InfoRow label={t("patientProfile:personal.fields.address")} value={saved?.address} icon={MapPin} />
        </div>
      </div>
    );
  }

  // ── Edit mode ──
  return (
    <div className="space-y-6">
      <div className="flex items-center justify-between">
        <p className="text-sm text-fg-muted">{t("patientProfile:personal.edit.description")}</p>
        <span className="text-xs text-primary bg-primary/5 px-2.5 py-1 rounded-full">{t("patientProfile:personal.edit.editingBadge")}</span>
      </div>

      {/* Avatar + Row 1 — Full Name */}
      <div className="flex items-start gap-6">
        <div className="relative w-24 h-24 shrink-0">
          <div className="w-full h-full rounded-full bg-primary/10 overflow-hidden flex items-center justify-center text-2xl text-fg">
            {form.photoUrl ? (
              <img src={form.photoUrl} alt="avatar" className="w-full h-full object-cover" />
            ) : (
              <span className="uppercase">{(profile?.name || "P").charAt(0)}</span>
            )}
          </div>

          <button
            ref={photoEditButtonRef}
            type="button"
            onClick={() => setPhotoMenuOpen((open) => !open)}
            className="absolute -bottom-1 -right-1 flex items-center gap-1 bg-white border border-border rounded-full pl-1.5 pr-2 py-1 shadow-sm hover:bg-muted transition-colors text-[11px] font-medium text-primary whitespace-nowrap rtl:-right-auto rtl:-left-1"
            aria-expanded={photoMenuOpen}
            aria-haspopup="menu"
          >
            <Camera className="w-3.5 h-3.5" />
            {t("patientProfile:personal.photo.editButton")}
          </button>

          <input ref={fileInputRef} onChange={handleFileChange} accept="image/*" type="file" className="hidden" />
        </div>
        <div className="flex-1">
          <label className="block text-sm font-medium text-fg mb-1.5">{t("patientProfile:personal.fields.fullName")}</label>
          <input
            type="text"
            value={form.name}
            onChange={(e) => { setForm({ ...form, name: e.target.value }); setErrors({ ...errors, name: "" }); }}
            placeholder={t("patientProfile:personal.fields.fullNamePlaceholder")}
            className={`w-full px-4 py-3 bg-input-background border rounded-xl focus:outline-none focus:ring-2 focus:ring-primary transition-colors ${errors.name ? "border-red-400 focus:ring-red-300" : "border-border"}`}
          />
          <FieldError msg={errors.name} />
        </div>
      </div>

      {/* Row 2 — Phone + DOB */}
      <div className="grid grid-cols-1 md:grid-cols-2 gap-5">
        <div>
          <label className="block text-sm font-medium text-fg mb-1.5">{t("patientProfile:personal.fields.phone")}</label>
          <div className={`flex rounded-xl border overflow-hidden focus-within:ring-2 focus-within:ring-primary transition-colors ${errors.phone ? "border-red-400" : "border-border"}`}>
            <div className="flex items-center gap-2 px-3 py-3 bg-muted/50 border-r border-border rtl:border-r-0 rtl:border-l flex-shrink-0 select-none">
              <span className="text-lg leading-none">🇪🇬</span>
              <span className="text-sm font-medium text-fg">+20</span>
              <ChevronDown className="w-3.5 h-3.5 text-fg-muted" />
            </div>
            <input
              type="tel"
              value={form.phone}
              onChange={(e) => {
                setForm({ ...form, phone: e.target.value });
                setErrors({ ...errors, phone: "" });
              }}
              placeholder={t("patientProfile:personal.fields.phonePlaceholder")}
              className="flex-1 px-4 py-3 bg-input-background focus:outline-none text-sm"
            />
          </div>
          <FieldError msg={errors.phone} />
        </div>

        <div>
          <label className="block text-sm font-medium text-fg mb-1.5">{t("patientProfile:personal.fields.dob")}</label>
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
          <label className="block text-sm font-medium text-fg mb-1.5">{t("patientProfile:personal.fields.governorate")}</label>
          <button
            type="button"
            onClick={() => { setGovOpen(!govOpen); setGovSearch(""); }}
            className="w-full flex items-center justify-between px-4 py-3 bg-input-background border border-border rounded-xl focus:outline-none focus:ring-2 focus:ring-primary transition-colors text-sm text-left rtl:text-right"
          >
            <span className={form.governorate ? "text-fg" : "text-fg-muted"}>
              {form.governorate ? t(`patientProfile:governorates.${form.governorate}`) : t("patientProfile:personal.fields.governoratePlaceholder")}
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
                  placeholder={t("patientProfile:personal.fields.governorateSearchPlaceholder")}
                  autoFocus
                  className="w-full px-3 py-2 bg-input-background border border-border rounded-lg text-sm focus:outline-none focus:ring-2 focus:ring-primary"
                />
              </div>
              <ul className="max-h-40 overflow-y-auto">
                {filteredGovs.length === 0 && (
                  <li className="px-4 py-3 text-sm text-fg-muted text-center">{t("patientProfile:personal.fields.governorateNoResults")}</li>
                )}
                {filteredGovs.map((g) => (
                  <li key={g}>
                    <button
                      type="button"
                      onClick={() => { setForm({ ...form, governorate: g }); setGovOpen(false); }}
                      className={`w-full text-left rtl:text-right px-4 py-2.5 text-sm hover:bg-primary/5 transition-colors ${form.governorate === g ? "text-primary bg-primary/5" : "text-fg"}`}
                    >
                      {t(`patientProfile:governorates.${g}`)}
                    </button>
                  </li>
                ))}
              </ul>
            </div>
          )}
        </div>

        <div>
          <label className="block text-sm font-medium text-fg mb-1.5">
            {t("patientProfile:personal.fields.address")}
            <span className="ml-1 rtl:ml-0 rtl:mr-1 text-fg-muted">{t("patientProfile:personal.fields.addressOptional")}</span>
          </label>
          <div className="relative">
            <MapPin className="absolute left-3 top-3.5 w-4 h-4 text-fg-muted rtl:left-auto rtl:right-3" />
            <input
              type="text"
              value={form.address}
              onChange={(e) => setForm({ ...form, address: e.target.value })}
              placeholder={t("patientProfile:personal.fields.addressPlaceholder")}
              className="w-full pl-9 pr-4 py-3 bg-input-background border border-border rounded-xl focus:outline-none focus:ring-2 focus:ring-primary transition-colors text-sm rtl:pl-4 rtl:pr-9"
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
              {t("patientProfile:personal.actions.saving")}
            </>
          ) : (
            <>
              <Save className="w-4 h-4" />
              {t("patientProfile:personal.actions.save")}
            </>
          )}
        </button>
        <button
          onClick={handleCancel}
          disabled={isSaving}
          className="group flex items-center gap-2 bg-white text-fg border-2 border-fg/10 text-base px-3 py-1 rounded-xl cursor-pointer transition-all duration-300 ease-in-out hover:border-fg-muted hover:-translate-y-0.5 hover:bg-fg-muted hover:text-white hover:shadow-md whitespace-nowrap disabled:opacity-50 disabled:cursor-not-allowed"
        >
          {t("patientProfile:personal.actions.cancel")}
        </button>
      </div>

      {photoMenuOpen && createPortal(
        <div
          ref={photoMenuRef}
          role="menu"
          style={{ top: photoMenuPosition.top, left: photoMenuPosition.left, width: PHOTO_MENU_WIDTH }}
          className="fixed z-[200] bg-white border border-border rounded-xl shadow-lg py-1.5"
        >
          <button
            type="button"
            role="menuitem"
            onClick={() => {
              fileInputRef.current?.click();
              setPhotoMenuOpen(false);
            }}
            className="w-full flex items-center gap-2.5 px-3.5 py-2.5 text-sm text-fg hover:bg-primary/5 transition-colors"
          >
            <UploadCloud className="w-4 h-4 text-primary shrink-0" />
            {t("patientProfile:personal.photo.uploadOption")}
          </button>
          <button
            type="button"
            role="menuitem"
            disabled={!hasProfilePhoto}
            onClick={handleRemovePhoto}
            className="w-full flex items-center gap-2.5 px-3.5 py-2.5 text-sm text-fg hover:bg-red-50 transition-colors disabled:opacity-40 disabled:cursor-not-allowed disabled:hover:bg-transparent"
          >
            <Trash2 className="w-4 h-4 text-red-500 shrink-0" />
            {t("patientProfile:personal.photo.removeOption")}
          </button>
          <button
            type="button"
            role="menuitem"
            disabled={!hasProfilePhoto}
            onClick={() => {
              setShowPhotoPreview(true);
              setPhotoMenuOpen(false);
            }}
            className="w-full flex items-center gap-2.5 px-3.5 py-2.5 text-sm text-fg hover:bg-primary/5 transition-colors disabled:opacity-40 disabled:cursor-not-allowed disabled:hover:bg-transparent"
          >
            <Eye className="w-4 h-4 text-fg-muted shrink-0" />
            {t("patientProfile:personal.photo.showOption")}
          </button>
        </div>,
        document.body,
      )}

      {showPhotoPreview && form.photoUrl && (
        <div
          className="fixed inset-0 z-50 flex items-center justify-center bg-black/60 px-4"
          onClick={() => setShowPhotoPreview(false)}
        >
          <div className="relative max-w-lg w-full" onClick={(e) => e.stopPropagation()}>
            <button
              type="button"
              onClick={() => setShowPhotoPreview(false)}
              className="absolute -top-3 -right-3 bg-white rounded-full p-2 shadow-lg hover:bg-muted transition-colors rtl:-right-auto rtl:-left-3"
              aria-label={t("patientProfile:personal.photo.previewClose")}
            >
              <X className="w-4 h-4 text-fg" />
            </button>
            <img
              src={form.photoUrl}
              alt={t("patientProfile:personal.photo.previewAlt")}
              className="w-full max-h-[80vh] object-contain rounded-2xl bg-white"
            />
          </div>
        </div>
      )}
    </div>
  );
}

// ─── Security Tab ───────────────────────────────────────────────
function SecurityTab({ user, onSave }: { user: User | null; onSave: (payload: { currentPassword: string; password: string }) => Promise<void>; }) {
  const { t } = useTranslation(["patientProfile"]);
  const [editing, setEditing] = useState(false);
  const email = user?.email || "";
  const [form, setForm] = useState({
    currentPassword: "",
    newPassword: "",
    confirmPassword: "",
  });
  const [show, setShow] = useState({ current: false, newPw: false, confirm: false });
  const [errors, setErrors] = useState<Record<string, string>>({});
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

  const strengthLabelKeys = ["empty", "weak", "fair", "good", "strong"] as const;
  const strengthColor = ["", "bg-red-400", "bg-amber-400", "bg-blue-400", "bg-emerald-400"];
  const strengthText = ["", "text-red-600", "text-amber-600", "text-blue-600", "text-emerald-600"];
  const strength = getStrength(form.newPassword);

  const validate = () => {
    const e: Record<string, string> = {};
    const isPasswordChanged = form.newPassword || form.confirmPassword;

    if (!isPasswordChanged) {
      e.newPassword = t("patientProfile:security.errors.newPasswordRequiredToSave");
      return e;
    }

    if (!form.currentPassword) {
      e.currentPassword = t("patientProfile:security.errors.currentPasswordRequired");
    }

    if (!form.newPassword) e.newPassword = t("patientProfile:security.errors.newPasswordRequired");
    else if (form.newPassword.length < 8) e.newPassword = t("patientProfile:security.errors.newPasswordTooShort");
    if (form.newPassword !== form.confirmPassword) e.confirmPassword = t("patientProfile:security.errors.passwordsMismatch");

    return e;
  };

  const handleSave = async () => {
    const e = validate();
    if (Object.keys(e).length) { setErrors(e); return; }
    setIsSaving(true);

    try {
      await onSave({
        currentPassword: form.currentPassword,
        password: form.newPassword,
      });
      setErrors({});
      setForm({ currentPassword: "", newPassword: "", confirmPassword: "" });
      setEditing(false);
      showSuccess(t("patientProfile:security.toast.saveSuccess"));
    } catch (error) {
      showError(error instanceof Error ? error.message : t("patientProfile:security.toast.saveError"));
    } finally {
      setIsSaving(false);
    }
  };

  const handleCancel = () => {
    setForm({ currentPassword: "", newPassword: "", confirmPassword: "" });
    setErrors({});
    setEditing(false);
  };

  // ── View mode ──
  if (!editing) {
    return (
      <div className="space-y-6">
        <div className="flex items-center justify-between">
          <p className="text-sm text-fg-muted">{t("patientProfile:security.view.description")}</p>
          <button
            onClick={() => setEditing(true)}
            className="group flex items-center gap-2 bg-primary text-white border-2 border-primary text-base px-4 py-1.5 rounded-xl cursor-pointer transition-all duration-300 ease-in-out hover:border-primary hover:-translate-y-0.5 hover:bg-white hover:text-primary hover:shadow-md whitespace-nowrap"
          >
            <Edit className="w-3.5 h-3.5" />
            {t("patientProfile:security.view.editButton")}
          </button>
        </div>

        <div className="space-y-5">
          <InfoRow label={t("patientProfile:security.view.emailLabel")} value={email} icon={Mail} />
          <div>
            <p className="text-xs font-medium text-fg-muted uppercase tracking-wider mb-1">{t("patientProfile:security.view.passwordLabel")}</p>
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
        <p className="text-sm text-fg-muted">{t("patientProfile:security.edit.description")}</p>
        <span className="text-xs text-primary bg-primary/5 px-2.5 py-1 rounded-full">{t("patientProfile:security.edit.editingBadge")}</span>
      </div>
      <div>
        <label className="block text-sm font-medium text-fg mb-1.5">{t("patientProfile:security.edit.emailLabel")}</label>
        <div className="relative">
          <Mail className="absolute left-3 top-1/2 -translate-y-1/2 w-4 h-4 text-fg-muted rtl:left-auto rtl:right-3" />
          <input
            type="email"
            value={email}
            readOnly
            disabled
            className="w-full pl-9 pr-4 py-3 bg-muted/40 border border-border rounded-xl text-sm text-fg-muted cursor-not-allowed rtl:pl-4 rtl:pr-9"
          />
        </div>
        <p className="text-xs text-fg-muted mt-1.5">{t("patientProfile:security.edit.emailHint")}</p>
      </div>

      <div className="flex items-center gap-3">
        <div className="flex-1 h-px bg-border" />
        <span className="text-xs text-fg-muted px-2">{t("patientProfile:security.edit.divider")}</span>
        <div className="flex-1 h-px bg-border" />
      </div>

      <div>
        <label className="block text-sm font-medium text-fg mb-1.5">{t("patientProfile:security.edit.currentPassword")}</label>
        <div className="relative">
          <Lock className="absolute left-3 top-1/2 -translate-y-1/2 w-4 h-4 text-fg-muted rtl:left-auto rtl:right-3" />
          <input
            type={show.current ? "text" : "password"}
            value={form.currentPassword}
            onChange={(e) => { setForm({ ...form, currentPassword: e.target.value }); setErrors({ ...errors, currentPassword: "" }); }}
            placeholder={t("patientProfile:security.edit.currentPasswordPlaceholder")}
            className={`w-full pl-9 pr-10 py-3 bg-input-background border rounded-xl focus:outline-none focus:ring-2 focus:ring-primary transition-colors text-sm rtl:pl-10 rtl:pr-9 ${errors.currentPassword ? "border-red-400 focus:ring-red-300" : "border-border"}`}
          />
          <button type="button" onClick={() => setShow({ ...show, current: !show.current })} className="absolute right-3 top-1/2 -translate-y-1/2 text-fg-muted hover:text-fg rtl:right-auto rtl:left-3">
            {show.current ? <EyeOff className="w-4 h-4" /> : <Eye className="w-4 h-4" />}
          </button>
        </div>
        <FieldError msg={errors.currentPassword} />
      </div>

      <div>
        <label className="block text-sm font-medium text-fg mb-1.5">{t("patientProfile:security.edit.newPassword")}</label>
        <div className="relative">
          <Lock className="absolute left-3 top-1/2 -translate-y-1/2 w-4 h-4 text-fg-muted rtl:left-auto rtl:right-3" />
          <input
            type={show.newPw ? "text" : "password"}
            value={form.newPassword}
            onChange={(e) => { setForm({ ...form, newPassword: e.target.value }); setErrors({ ...errors, newPassword: "" }); }}
            placeholder={t("patientProfile:security.edit.newPasswordPlaceholder")}
            className={`w-full pl-9 pr-10 py-3 bg-input-background border rounded-xl focus:outline-none focus:ring-2 focus:ring-primary transition-colors text-sm rtl:pl-10 rtl:pr-9 ${errors.newPassword ? "border-red-400 focus:ring-red-300" : "border-border"}`}
          />
          <button type="button" onClick={() => setShow({ ...show, newPw: !show.newPw })} className="absolute right-3 top-1/2 -translate-y-1/2 text-fg-muted hover:text-fg rtl:right-auto rtl:left-3">
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
            <p className={`text-xs ${strengthText[strength]}`}>{t(`patientProfile:security.strength.${strengthLabelKeys[strength]}`)}</p>
          </div>
        )}
        <FieldError msg={errors.newPassword} />
      </div>

      <div>
        <label className="block text-sm font-medium text-fg mb-1.5">{t("patientProfile:security.edit.confirmPassword")}</label>
        <div className="relative">
          <Lock className="absolute left-3 top-1/2 -translate-y-1/2 w-4 h-4 text-fg-muted rtl:left-auto rtl:right-3" />
          <input
            type={show.confirm ? "text" : "password"}
            value={form.confirmPassword}
            onChange={(e) => { setForm({ ...form, confirmPassword: e.target.value }); setErrors({ ...errors, confirmPassword: "" }); }}
            placeholder={t("patientProfile:security.edit.confirmPasswordPlaceholder")}
            className={`w-full pl-9 pr-10 py-3 bg-input-background border rounded-xl focus:outline-none focus:ring-2 focus:ring-primary transition-colors text-sm rtl:pl-10 rtl:pr-9 ${errors.confirmPassword ? "border-red-400 focus:ring-red-300" : "border-border"}`}
          />
          <button type="button" onClick={() => setShow({ ...show, confirm: !show.confirm })} className="absolute right-3 top-1/2 -translate-y-1/2 text-fg-muted hover:text-fg rtl:right-auto rtl:left-3">
            {show.confirm ? <EyeOff className="w-4 h-4" /> : <Eye className="w-4 h-4" />}
          </button>
        </div>
        {form.confirmPassword && form.newPassword && form.confirmPassword === form.newPassword && (
          <p className="flex items-center gap-1 text-xs text-emerald-600 mt-1">
            <CheckCircle2 className="w-3.5 h-3.5" /> {t("patientProfile:security.edit.passwordsMatch")}
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
          {t("patientProfile:security.actions.save")}
        </button>
        <button
          onClick={handleCancel}
          className="group flex items-center gap-2 bg-white text-fg border-2 border-fg/10 text-base px-3 py-1 rounded-xl cursor-pointer transition-all duration-300 ease-in-out hover:border-fg-muted hover:-translate-y-0.5 hover:bg-fg-muted hover:text-white hover:shadow-md whitespace-nowrap"
        >
          {t("patientProfile:security.actions.cancel")}
        </button>
      </div>
    </div>
  );
}

// ─── Main Page ──────────────────────────────────────────────────
export function PatientProfile() {
  const { t, i18n } = useTranslation(["patientProfile"]);
  const dateLocale = i18n.language === "ar" ? "ar-EG" : "en-US";
  const { user, updateProfile } = useAuth();
  const [profile, setProfile] = useState<PatientProfileApi | null>(null);
  const [isProfileLoading, setIsProfileLoading] = useState(true);
  const [activeTab, setActiveTab] = useState<Tab>("personal");

  const hasFetchedRef = useRef(false);

  useEffect(() => {
    if (!user?.id || hasFetchedRef.current) return;
    hasFetchedRef.current = true;

    fetchPatientProfile(user.id)
      .then((data: PatientProfileApi) => {
        setProfile(data);
        if (data.user.photoUrl) {
          updateProfile({ avatar: data.user.photoUrl });
        }
      })
      .catch((error: unknown) => {
        showError(error instanceof Error ? error.message : t("patientProfile:personal.toast.loadError"));
      })
      .finally(() => setIsProfileLoading(false));
  }, [user?.id]);

  const handleSaveProfile = async (payload: {
    name: string;
    phone: string;
    dob: string;
    governorate: string;
    address: string;
    photo?: File;
    removePhoto?: boolean;
  }) => {
    if (!user?.id) throw new Error("Unable to save profile without a logged in user.");

    let photoUrl: string | undefined;
    if (payload.removePhoto) {
      await removePatientPhoto(user.id);
      photoUrl = undefined;
    } else if (payload.photo) {
      const photoResult = await updatePatientPhoto(user.id, payload.photo);
      photoUrl = photoResult.photoUrl;
    }

    const updatedUser = await updatePatientProfile(user.id, {
      name: payload.name,
      phone: payload.phone,
      dob: payload.dob,
      governorate: payload.governorate,
      address: payload.address,
    });

    const finalPhotoUrl = photoUrl ?? (payload.removePhoto ? undefined : updatedUser.photoUrl);
    const mergedUser = { ...updatedUser, photoUrl: finalPhotoUrl };

    setProfile((currentProfile) =>
      currentProfile
        ? { ...currentProfile, user: mergedUser }
        : {
          patientId: user.id,
          user: mergedUser,
          medicalHistory: [],
          createdAt: undefined,
          updatedAt: undefined,
        }
    );

    updateProfile({
      name: mergedUser.name,
      phone: mergedUser.phone,
      avatar: finalPhotoUrl,
    });

    return { photoUrl: finalPhotoUrl };
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
      case "active": return t("patientProfile:medicalHistory.status.active");
      case "under_treatment": return t("patientProfile:medicalHistory.status.under_treatment");
      case "resolved": return t("patientProfile:medicalHistory.status.resolved");
      default: return status;
    }
  };

  const tabs: { id: Tab; label: string; icon: React.ElementType }[] = [
    { id: "personal", label: t("patientProfile:tabs.personal"), icon: UserIcon },
    { id: "security", label: t("patientProfile:tabs.security"), icon: Lock },
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
            <h1 className="text-xl font-bold text-fg/90">{user?.name ?? t("patientProfile:header.defaultName")}</h1>
            <p className="text-fg/70 text-sm mt-0.5">{t("patientProfile:header.roleLabel")}</p>
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
              await updatePatientSecurity(user.id, payload);
            }} />}
          </div>
        </div>

        {/* Medical History (read-only, always visible) */}
        <div className="bg-white rounded-2xl border border-border shadow-sm p-6 md:p-8">
          <div className="flex items-center justify-between mb-5">
            <div className="flex items-center gap-2">
              <Activity className="w-5 h-5 text-primary" />
              <h2 className="font-bold text-fg">{t("patientProfile:medicalHistory.title")}</h2>
            </div>
            <span className="flex items-center gap-1.5 px-3 py-1 bg-primary/10 border border-primary rounded-lg text-xs text-primary font-medium">
              <ShieldCheck className="w-3.5 h-3.5" />
              {t("patientProfile:medicalHistory.readOnlyBadge")}
            </span>
          </div>

          <div className="flex items-start gap-3 p-3 bg-amber-50 border border-amber-100 rounded-xl mb-5 text-sm text-amber-800">
            <AlertCircle className="w-4 h-4 text-amber-500 flex-shrink-0 mt-0.5" />
            <p>{t("patientProfile:medicalHistory.notice")}</p>
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
                      {t("patientProfile:medicalHistory.diagnosed")}:{" "}
                      {new Date(record.diagnosedDate).toLocaleDateString(dateLocale, {
                        year: "numeric",
                        month: "long",
                        day: "numeric",
                      })}
                    </span>
                    <span className="flex items-center gap-2">
                      <UserIcon className="w-3.5 h-3.5" />
                      {t("patientProfile:medicalHistory.treatedBy")}: {record.treatedBy}
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
              <p className="text-fg-muted text-sm">{t("patientProfile:medicalHistory.empty.title")}</p>
              <p className="text-xs text-fg-muted mt-1">{t("patientProfile:medicalHistory.empty.subtitle")}</p>
            </div>
          )}
        </div>
      </div>
    </div>
  );
}