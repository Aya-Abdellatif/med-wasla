import { useState } from "react";
import { Link, useLocation, useNavigate } from "react-router-dom";
import {
  ArrowLeft,
  ChevronRight,
  UserRound,
  Stethoscope,
  HeartPulse,
  ChevronDown,
} from "lucide-react";
import AuthLayout from "../../components/auth/AuthLayout";
import { apiFetch } from "../../../services/api";
import { MEDICAL_SPECIALIZATIONS } from "../../../constants/medicalSpecializations";
import { showError, showSuccess, showWarning } from "../../../utils/toast";

type Governorate = "Alexandria" | "Cairo" | "Giza";

type FormData = {
  firstName: string;
  lastName: string;
  email: string;
  phone: string;
  password: string;
  confirmPassword: string;
  dob: string;
  address: Governorate;
  specialization: string;
  licenseNumber: string;
  clinicAddress: string;
  homeVisit: boolean;
  serviceArea: string;
  bio: string;
  consultationFee: string;
  certTitle: string;
  certIssuer: string;
  certUrl: string;
};

type FieldName = keyof FormData;
type FieldErrors = Partial<Record<FieldName, string>>;

const inputBaseClass =
  "w-full rounded-xl border bg-slate-50 px-3.5 py-2.5 text-sm transition-colors focus:bg-white focus:outline-none focus:ring-2";
const labelClass =
  "mb-1.5 block text-xs font-semibold uppercase tracking-wide text-slate-500";

function getInputClass(hasError?: boolean) {
  return `${inputBaseClass} ${
    hasError
      ? "border-red-300 bg-red-50/40 focus:border-red-400 focus:ring-red-400/20"
      : "border-slate-200 focus:border-teal-400 focus:ring-teal-400/20"
  }`;
}

function Field({
  label,
  children,
  error,
  className = "",
}: {
  label: string;
  children: React.ReactNode;
  error?: string;
  className?: string;
}) {
  return (
    <div className={className}>
      <label className={labelClass}>{label}</label>
      {children}
      {error && (
        <p className="mt-1.5 text-xs font-medium text-red-500">{error}</p>
      )}
    </div>
  );
}

const roleMeta = {
  patient: {
    label: "Patient",
    icon: UserRound,
    color: "bg-blue-100 text-blue-700",
  },
  doctor: {
    label: "Doctor",
    icon: Stethoscope,
    color: "bg-indigo-100 text-indigo-700",
  },
  nurse: {
    label: "Nurse",
    icon: HeartPulse,
    color: "bg-emerald-100 text-emerald-700",
  },
} as const;

const emailRegex = /^[^\s@]+@[^\s@]+\.[^\s@]+$/;

function validateStep1(form: FormData): FieldErrors {
  const errors: FieldErrors = {};

  if (!form.firstName.trim()) errors.firstName = "First name is required";
  if (!form.lastName.trim()) errors.lastName = "Last name is required";

  if (!form.email.trim()) {
    errors.email = "Email is required";
  } else if (!emailRegex.test(form.email.trim())) {
    errors.email = "Enter a valid email address";
  }

  if (!form.phone.trim()) {
    errors.phone = "Phone number is required";
  } else if (form.phone.trim().length < 8) {
    errors.phone = "Enter a valid phone number";
  }

  if (!form.password) {
    errors.password = "Password is required";
  } else if (form.password.length < 8) {
    errors.password = "Password must be at least 8 characters";
  }

  if (!form.dob) {
    errors.dob = "Date of birth is required";
  }

  if (!form.confirmPassword) {
    errors.confirmPassword = "Please confirm your password";
  } else if (form.password !== form.confirmPassword) {
    errors.confirmPassword = "Passwords do not match";
  }

  return errors;
}

function validateStep2(
  form: FormData,
  isDoctor: boolean,
  isNurse: boolean,
): FieldErrors {
  const errors: FieldErrors = {};

  if (isDoctor && !form.specialization) {
    errors.specialization = "Please select a medical specialty";
  }

  if (!form.licenseNumber.trim()) {
    errors.licenseNumber = "License number is required";
  }

  if (isNurse && !form.serviceArea.trim()) {
    errors.serviceArea = "Enter at least one service area";
  }

  const hasCertInput = Boolean(
    form.certTitle || form.certIssuer || form.certUrl,
  );
  if (hasCertInput) {
    if (!form.certTitle.trim())
      errors.certTitle = "Certificate title is required";
    if (!form.certIssuer.trim()) errors.certIssuer = "Issuer is required";
    if (!form.certUrl.trim()) errors.certUrl = "Certificate URL is required";
  }

  return errors;
}

function hasErrors(errors: FieldErrors) {
  return Object.keys(errors).length > 0;
}

export default function SignUp() {
  const location = useLocation();
  const navigate = useNavigate();
  const roleParam = (new URLSearchParams(location.search).get("role") ??
    "patient") as "patient" | "doctor" | "nurse";
  const isDoctor = roleParam === "doctor";
  const isNurse = roleParam === "nurse";
  const isSpecialist = isDoctor || isNurse;
  const totalSteps = isSpecialist ? 2 : 1;

  const [formStep, setFormStep] = useState(1);
  const [showCert, setShowCert] = useState(false);
  const [fieldErrors, setFieldErrors] = useState<FieldErrors>({});
  const [isLoading, setIsLoading] = useState(false);

  const [form, setForm] = useState<FormData>({
    firstName: "",
    lastName: "",
    email: "",
    phone: "",
    password: "",
    confirmPassword: "",
    dob: "",
    address: "Cairo",
    specialization: "",
    licenseNumber: "",
    clinicAddress: "",
    homeVisit: false,
    serviceArea: "",
    bio: "",
    consultationFee: "200",
    certTitle: "",
    certIssuer: "",
    certUrl: "",
  });

  const clearFieldError = (field: FieldName) => {
    setFieldErrors((prev) => {
      if (!prev[field]) return prev;
      const next = { ...prev };
      delete next[field];
      return next;
    });
  };

  const showValidationToast = (errors: FieldErrors) => {
    const count = Object.keys(errors).length;
    showWarning(
      count === 1
        ? "Please fix the highlighted field"
        : `Please fix ${count} highlighted fields`,
    );
  };

  const handleChange = (field: keyof FormData, value: string | boolean) => {
    setForm((prev) => ({ ...prev, [field]: value }));
    clearFieldError(field);
  };

  const goNext = () => {
    const errors = validateStep1(form);
    setFieldErrors(errors);
    if (hasErrors(errors)) {
      showValidationToast(errors);
      return;
    }
    if (formStep < totalSteps) setFormStep((s) => s + 1);
  };

  const goBack = () => {
    setFieldErrors({});
    if (formStep > 1) setFormStep((s) => s - 1);
    else if (isSpecialist) navigate("/medical-specialist");
    else navigate("/role");
  };

  const handleRegister = async (e: React.FormEvent) => {
    e.preventDefault();

    const step1Errors = validateStep1(form);
    if (hasErrors(step1Errors)) {
      setFieldErrors(step1Errors);
      setFormStep(1);
      showValidationToast(step1Errors);
      return;
    }

    if (isSpecialist) {
      const step2Errors = validateStep2(form, isDoctor, isNurse);
      if (hasErrors(step2Errors)) {
        setFieldErrors(step2Errors);
        showValidationToast(step2Errors);
        return;
      }
    }

    setFieldErrors({});
    setIsLoading(true);
    try {
      const payload: Record<string, unknown> = {
        name: `${form.firstName} ${form.lastName}`.trim(),
        email: form.email,
        password: form.password,
        phone: form.phone,
        governorate: form.address,
        dob: form.dob,
        address: form.address,
        role: isSpecialist ? "specialist" : "patient",
      };

      if (isSpecialist) {
        payload.specialistType = isDoctor ? "doctor" : "nurse";
        payload.licenseNumber = form.licenseNumber;
        payload.homeVisit = form.homeVisit;
        payload.bio = form.bio;
        payload.consultationFee = Number(form.consultationFee) || 0;

        if (isDoctor) {
          payload.specialization = form.specialization;
          payload.clinicAddress = form.clinicAddress;
        } else {
          payload.serviceAreas = form.serviceArea
            .split(",")
            .map((area) => area.trim())
            .filter(Boolean);
        }

        if (form.certTitle && form.certIssuer && form.certUrl) {
          payload.certifications = [
            {
              title: form.certTitle,
              issuedBy: form.certIssuer,
              certificateUrl: form.certUrl,
            },
          ];
        }
      }

      await apiFetch("/api/auth/register", {
        method: "POST",
        body: JSON.stringify(payload),
      });

      showSuccess("Check your email for the verification code.");
      navigate(`/verify-otp?email=${encodeURIComponent(form.email.trim())}`);
    } catch (err) {
      const message =
        err instanceof Error ? err.message : "Registration failed";
      if (message.toLowerCase().includes("email")) {
        setFieldErrors({ email: message });
        setFormStep(1);
        showError(message);
      } else if (message.toLowerCase().includes("license")) {
        setFieldErrors({ licenseNumber: message });
        if (isSpecialist) setFormStep(2);
        showError(message);
      } else {
        showError(message);
      }
    } finally {
      setIsLoading(false);
    }
  };

  const RoleIcon = roleMeta[roleParam].icon;

  return (
    <AuthLayout
      title="Create account"
      subtitle={
        isSpecialist
          ? "Set up your professional profile"
          : "Join MedWasla in a few steps"
      }
      wide={isSpecialist}
      compact={!isSpecialist}
    >
      <button
        type="button"
        onClick={goBack}
        className="mb-4 inline-flex items-center gap-1 text-sm font-medium text-slate-500 transition-colors hover:text-teal-600"
      >
        <ArrowLeft className="h-4 w-4" />
        {formStep > 1 ? "Previous step" : "Change role"}
      </button>

      <div className="mb-5 flex flex-wrap items-center justify-between gap-3">
        <span
          className={`inline-flex items-center gap-2 rounded-full px-3 py-1.5 text-xs font-semibold ${roleMeta[roleParam].color}`}
        >
          <RoleIcon className="h-3.5 w-3.5" />
          {roleMeta[roleParam].label}
        </span>

        {totalSteps > 1 && (
          <div className="flex items-center gap-2">
            {Array.from({ length: totalSteps }, (_, i) => i + 1).map((n) => (
              <div
                key={n}
                className={`h-2 rounded-full transition-all duration-300 ${
                  n === formStep
                    ? "w-8 bg-teal-500"
                    : n < formStep
                      ? "w-2 bg-teal-300"
                      : "w-2 bg-slate-200"
                }`}
              />
            ))}
            <span className="text-xs font-medium text-slate-400">
              {formStep}/{totalSteps}
            </span>
          </div>
        )}
      </div>

      <form onSubmit={handleRegister} className="space-y-4" noValidate>
        {formStep === 1 && (
          <div className="space-y-3">
            <div className="grid gap-3 sm:grid-cols-2">
              <Field label="First name" error={fieldErrors.firstName}>
                <input
                  value={form.firstName}
                  onChange={(e) => handleChange("firstName", e.target.value)}
                  className={getInputClass(Boolean(fieldErrors.firstName))}
                />
              </Field>
              <Field label="Last name" error={fieldErrors.lastName}>
                <input
                  value={form.lastName}
                  onChange={(e) => handleChange("lastName", e.target.value)}
                  className={getInputClass(Boolean(fieldErrors.lastName))}
                />
              </Field>
            </div>

            <div className="grid gap-3 sm:grid-cols-2">
              <Field label="Email" error={fieldErrors.email}>
                <input
                  type="email"
                  value={form.email}
                  onChange={(e) => handleChange("email", e.target.value)}
                  className={getInputClass(Boolean(fieldErrors.email))}
                />
              </Field>
              <Field label="Phone" error={fieldErrors.phone}>
                <input
                  value={form.phone}
                  onChange={(e) => handleChange("phone", e.target.value)}
                  className={getInputClass(Boolean(fieldErrors.phone))}
                />
              </Field>
            </div>

            <Field label="Governorate">
              <select
                value={form.address}
                onChange={(e) => handleChange("address", e.target.value)}
                className={getInputClass()}
              >
                <option value="Cairo">Cairo</option>
                <option value="Giza">Giza</option>
                <option value="Alexandria">Alexandria</option>
              </select>
            </Field>

            <Field label="Date of birth" error={fieldErrors.dob}>
              <input
                type="date"
                value={form.dob}
                onChange={(e) => handleChange("dob", e.target.value)}
                className={getInputClass(Boolean(fieldErrors.dob))}
              />
            </Field>

            <div className="grid gap-3 sm:grid-cols-2">
              <Field label="Password" error={fieldErrors.password}>
                <input
                  type="password"
                  value={form.password}
                  onChange={(e) => handleChange("password", e.target.value)}
                  className={getInputClass(Boolean(fieldErrors.password))}
                />
              </Field>
              <Field
                label="Confirm password"
                error={fieldErrors.confirmPassword}
              >
                <input
                  type="password"
                  value={form.confirmPassword}
                  onChange={(e) =>
                    handleChange("confirmPassword", e.target.value)
                  }
                  className={getInputClass(
                    Boolean(fieldErrors.confirmPassword),
                  )}
                />
              </Field>
            </div>
          </div>
        )}

        {formStep === 2 && isSpecialist && (
          <div className="space-y-3">
            {isDoctor && (
              <>
                <div className="grid gap-3 sm:grid-cols-2">
                  <Field
                    label="Medical specialty"
                    error={fieldErrors.specialization}
                  >
                    <select
                      value={form.specialization}
                      onChange={(e) =>
                        handleChange("specialization", e.target.value)
                      }
                      className={getInputClass(
                        Boolean(fieldErrors.specialization),
                      )}
                    >
                      <option value="" disabled>
                        Select specialty
                      </option>
                      {MEDICAL_SPECIALIZATIONS.map((specialty) => (
                        <option key={specialty} value={specialty}>
                          {specialty}
                        </option>
                      ))}
                    </select>
                  </Field>
                  <Field
                    label="License number"
                    error={fieldErrors.licenseNumber}
                  >
                    <input
                      value={form.licenseNumber}
                      onChange={(e) =>
                        handleChange("licenseNumber", e.target.value)
                      }
                      className={getInputClass(
                        Boolean(fieldErrors.licenseNumber),
                      )}
                    />
                  </Field>
                </div>
                <Field label="Clinic address">
                  <input
                    value={form.clinicAddress}
                    onChange={(e) =>
                      handleChange("clinicAddress", e.target.value)
                    }
                    className={getInputClass()}
                  />
                </Field>
                <Field label="Home visits">
                  <div className="grid grid-cols-2 gap-2">
                    <ToggleOption
                      active={form.homeVisit}
                      label="Yes"
                      onClick={() => handleChange("homeVisit", true)}
                    />
                    <ToggleOption
                      active={!form.homeVisit}
                      label="No"
                      onClick={() => handleChange("homeVisit", false)}
                    />
                  </div>
                </Field>
              </>
            )}

            {isNurse && (
              <div className="grid gap-3 sm:grid-cols-2">
                <Field
                  label="Nursing license"
                  error={fieldErrors.licenseNumber}
                >
                  <input
                    value={form.licenseNumber}
                    onChange={(e) =>
                      handleChange("licenseNumber", e.target.value)
                    }
                    className={getInputClass(
                      Boolean(fieldErrors.licenseNumber),
                    )}
                  />
                </Field>
                <Field label="Service areas" error={fieldErrors.serviceArea}>
                  <input
                    placeholder="e.g. Maadi, Nasr City"
                    value={form.serviceArea}
                    onChange={(e) =>
                      handleChange("serviceArea", e.target.value)
                    }
                    className={getInputClass(Boolean(fieldErrors.serviceArea))}
                  />
                </Field>
              </div>
            )}

            <div className="grid gap-3 sm:grid-cols-2">
              <Field label="Consultation fee (EGP)">
                <input
                  type="number"
                  value={form.consultationFee}
                  onChange={(e) =>
                    handleChange("consultationFee", e.target.value)
                  }
                  className={getInputClass()}
                />
              </Field>
              <Field label="Short bio" className="sm:col-span-1">
                <input
                  value={form.bio}
                  onChange={(e) => handleChange("bio", e.target.value)}
                  className={getInputClass()}
                  placeholder="Brief intro..."
                />
              </Field>
            </div>

            <div
              className={`rounded-xl border ${
                fieldErrors.certTitle ||
                fieldErrors.certIssuer ||
                fieldErrors.certUrl
                  ? "border-red-200"
                  : "border-slate-200"
              }`}
            >
              <button
                type="button"
                onClick={() => setShowCert((v) => !v)}
                className="flex w-full items-center justify-between px-4 py-3 text-left text-sm font-semibold text-slate-700 transition-colors hover:bg-slate-50"
              >
                Add certificate (optional)
                <ChevronDown
                  className={`h-4 w-4 text-slate-400 transition-transform ${showCert ? "rotate-180" : ""}`}
                />
              </button>
              {showCert && (
                <div className="space-y-3 border-t border-slate-100 px-4 pb-4 pt-3">
                  <Field label="Title" error={fieldErrors.certTitle}>
                    <input
                      value={form.certTitle}
                      onChange={(e) =>
                        handleChange("certTitle", e.target.value)
                      }
                      className={getInputClass(Boolean(fieldErrors.certTitle))}
                    />
                  </Field>
                  <div className="grid gap-3 sm:grid-cols-2">
                    <Field label="Issued by" error={fieldErrors.certIssuer}>
                      <input
                        value={form.certIssuer}
                        onChange={(e) =>
                          handleChange("certIssuer", e.target.value)
                        }
                        className={getInputClass(
                          Boolean(fieldErrors.certIssuer),
                        )}
                      />
                    </Field>
                    <Field label="Certificate URL" error={fieldErrors.certUrl}>
                      <input
                        value={form.certUrl}
                        onChange={(e) =>
                          handleChange("certUrl", e.target.value)
                        }
                        className={getInputClass(Boolean(fieldErrors.certUrl))}
                      />
                    </Field>
                  </div>
                </div>
              )}
            </div>
          </div>
        )}

        <div className="flex gap-3 pt-1">
          {formStep < totalSteps ? (
            <button
              type="button"
              onClick={goNext}
              className="flex w-full items-center justify-center gap-2 rounded-2xl bg-teal-500 py-3 text-sm font-bold text-white transition-colors hover:bg-teal-600"
            >
              Continue
              <ChevronRight className="h-4 w-4" />
            </button>
          ) : (
            <button
              type="submit"
              disabled={isLoading}
              className="w-full rounded-2xl bg-teal-500 py-3 text-sm font-bold text-white transition-colors hover:bg-teal-600 disabled:opacity-50"
            >
              {isLoading ? "Creating account..." : "Create account"}
            </button>
          )}
        </div>

        <p className="text-center text-sm text-slate-600">
          Already have an account?{" "}
          <Link
            to="/login"
            className="font-bold text-teal-600 hover:text-teal-700"
          >
            Sign in
          </Link>
        </p>
      </form>
    </AuthLayout>
  );
}

function ToggleOption({
  active,
  label,
  onClick,
}: {
  active: boolean;
  label: string;
  onClick: () => void;
}) {
  return (
    <button
      type="button"
      onClick={onClick}
      className={`rounded-xl border-2 px-3 py-2.5 text-sm font-semibold transition-all ${
        active
          ? "border-teal-500 bg-teal-50 text-teal-700"
          : "border-slate-200 bg-white text-slate-600 hover:border-slate-300"
      }`}
    >
      {label}
    </button>
  );
}
