import { useState } from "react";
import { Link, useLocation, useNavigate } from "react-router-dom";
import { useTranslation } from "react-i18next";
import {
  ArrowLeft,
  User,
  Stethoscope,
  HeartPulse,
  ChevronDown,
} from "lucide-react";
import AuthLayout from "../../components/auth/AuthLayout";
import { PasswordStrengthHints } from "../../components/auth/PasswordStrengthHints";
import { apiFetch } from "../../../services/api";
import { specialtyToKey, MEDICAL_SPECIALIZATIONS } from "../../../constants/medicalSpecializations";
import {
  mapRegisterErrorMessage,
  validateEmail,
  validatePassword,
} from "../../../utils/authValidation";
import { showError, showSuccess, showWarning } from "../../../utils/toast";

import { EgyptianGovernorates, governorateKeyMap, type Governorate } from "../../../constants/governorates";

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
  "w-full rounded-xl border bg-slate-50 px-3.5 py-2 text-sm transition-colors focus:bg-white focus:outline-none focus:ring-2";
const labelClass =
  "mb-1 block text-xs font-semibold uppercase tracking-wide text-slate-500";

function getInputClass(hasError?: boolean) {
  return `${inputBaseClass} ${hasError
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

export default function SignUp() {
  const { t } = useTranslation(["auth", "constants"]);
  const location = useLocation();
  const navigate = useNavigate();
  const roleParam = (new URLSearchParams(location.search).get("role") ??
    "patient") as "patient" | "doctor" | "nurse";
  const isDoctor = roleParam === "doctor";
  const isNurse = roleParam === "nurse";
  const isSpecialist = isDoctor || isNurse;
  const totalSteps = isSpecialist ? 2 : 1;

  const roleMeta = {
    patient: {
      label: t("roles.patient"),
      icon: User,
      color: "bg-primary text-white",
    },
    doctor: {
      label: t("roles.doctor"),
      icon: Stethoscope,
      color: "bg-primary text-white",
    },
    nurse: {
      label: t("roles.nurse"),
      icon: HeartPulse,
      color: "bg-primary text-white",
    },
  } as const;

  function validateStep1(form: FormData): FieldErrors {
    const errors: FieldErrors = {};

    if (!form.firstName.trim())
      errors.firstName = t("validation.firstNameRequired");
    if (!form.lastName.trim())
      errors.lastName = t("validation.lastNameRequired");

    const emailError = validateEmail(form.email);
    if (emailError) errors.email = emailError;

    if (!form.phone.trim()) {
      errors.phone = t("validation.phoneRequired");
    } else if (form.phone.trim().length < 8) {
      errors.phone = t("validation.phoneInvalid");
    }

    const passwordError = validatePassword(form.password);
    if (passwordError) errors.password = passwordError;

    if (!form.dob) {
      errors.dob = t("validation.dobRequired");
    }

    if (!form.confirmPassword) {
      errors.confirmPassword = t("validation.confirmPasswordRequired");
    } else if (form.password !== form.confirmPassword) {
      errors.confirmPassword = t("validation.passwordMismatch");
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
      errors.specialization = t("validation.specializationRequired");
    }

    if (!form.licenseNumber.trim()) {
      errors.licenseNumber = t("validation.licenseRequired");
    }
    if (isDoctor) {
      if (!form.certTitle.trim()) {
        errors.certTitle = "Graduation certificate title is required";
      }
      if (!form.certIssuer.trim()) {
        errors.certIssuer = "Issuing university is required";
      }
      if (!form.certUrl.trim()) {
        errors.certUrl = "Certificate file URL is required";
      }
    } else {
      const hasCertInput = Boolean(
        form.certTitle || form.certIssuer || form.certUrl,
      );
      if (hasCertInput) {
        if (!form.certTitle.trim())
          errors.certTitle = "Certificate title is required";
        if (!form.certIssuer.trim()) errors.certIssuer = "Issuer is required";
        if (!form.certUrl.trim()) errors.certUrl = "Certificate URL is required";
      }
    }

    if (isNurse && !form.serviceArea.trim()) {
      errors.serviceArea = t("validation.serviceAreaRequired");
    }

    const hasCertInput = Boolean(
      form.certTitle || form.certIssuer || form.certUrl,
    );
    if (hasCertInput) {
      if (!form.certTitle.trim())
        errors.certTitle = t("validation.certTitleRequired");
      if (!form.certIssuer.trim())
        errors.certIssuer = t("validation.certIssuerRequired");
      if (!form.certUrl.trim())
        errors.certUrl = t("validation.certUrlRequired");
    }

    return errors;
  }

  function hasErrors(errors: FieldErrors) {
    return Object.keys(errors).length > 0;
  }

  const [formStep, setFormStep] = useState(1);
  const [showCert, setShowCert] = useState(false);
  const [fieldErrors, setFieldErrors] = useState<FieldErrors>({});
  const [touched, setTouched] = useState<Partial<Record<FieldName, boolean>>>(
    {},
  );
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
        ? t("toast.fixOneField")
        : t("toast.fixNFields", { count }),
    );
  };

  const handleChange = (field: keyof FormData, value: string | boolean) => {
    setForm((prev) => ({ ...prev, [field]: value }));
    clearFieldError(field);
  };

  const handleBlur = (field: FieldName) => {
    setTouched((prev) => ({ ...prev, [field]: true }));

    if (field === "email") {
      const emailError = validateEmail(form.email);
      setFieldErrors((prev) => {
        const next = { ...prev };
        if (emailError) next.email = emailError;
        else delete next.email;
        return next;
      });
      return;
    }

    if (field === "password") {
      const passwordError = validatePassword(form.password);
      setFieldErrors((prev) => {
        const next = { ...prev };
        if (passwordError) next.password = passwordError;
        else delete next.password;
        return next;
      });
      return;
    }

    if (field === "confirmPassword") {
      setFieldErrors((prev) => {
        const next = { ...prev };
        if (!form.confirmPassword) {
          next.confirmPassword = t("validation.confirmPasswordRequired");
        } else if (form.password !== form.confirmPassword) {
          next.confirmPassword = t("validation.passwordMismatch");
        } else {
          delete next.confirmPassword;
        }
        return next;
      });
    }
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
          payload.certifications = [
            {
              title: form.certTitle,
              issuedBy: form.certIssuer,
              certificateUrl: form.certUrl,
              isRegistrationCert: true,
            },
          ];
        } else {
          payload.serviceAreas = form.serviceArea
            .split(",")
            .map((area) => area.trim())
            .filter(Boolean);
        }

        if (!isDoctor && form.certTitle && form.certIssuer && form.certUrl) {
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

      showSuccess(t("toast.registrationSuccess"));
      navigate(`/verify-otp?email=${encodeURIComponent(form.email.trim())}`);
    } catch (err) {
      const message =
        err instanceof Error ? err.message : t("toast.registrationFailed");
      const mapped = mapRegisterErrorMessage(message);

      if (mapped.field === "email") {
        setFieldErrors({ email: mapped.text });
        setTouched((prev) => ({ ...prev, email: true }));
        setFormStep(1);
        showError(mapped.text);
      } else if (mapped.field === "licenseNumber") {
        setFieldErrors({ licenseNumber: mapped.text });
        if (isSpecialist) setFormStep(2);
        showError(mapped.text);
      } else {
        showError(mapped.text);
      }
    } finally {
      setIsLoading(false);
    }
  };

  const RoleIcon = roleMeta[roleParam].icon;

  return (
    <AuthLayout
      title={t("signUp.title")}
      subtitle={
        isSpecialist
          ? t("signUp.subtitleSpecialist")
          : t("signUp.subtitlePatient")
      }
      fitScreen
    >
      <button
        type="button"
        onClick={goBack}
        className="mb-2 inline-flex items-center gap-1 text-sm font-medium text-fg-muted transition-all duration-200 hover:text-primary hover:-translate-y-0.5"
      >
        <ArrowLeft className="h-4 w-4 rtl:rotate-180" />
        {formStep > 1 ? t("signUp.previousStep") : t("signUp.changeRole")}
      </button>

      <div className="mb-4 flex flex-wrap items-center justify-between gap-3">
        <span
          className={`inline-flex items-center gap-2 rounded-xl px-3 py-1.5 text-xs font-semibold ${roleMeta[roleParam].color}`}
        >
          <RoleIcon className="h-3.5 w-3.5" />
          {roleMeta[roleParam].label}
        </span>

        {totalSteps > 1 && (
          <div className="flex items-center gap-2">
            {Array.from({ length: totalSteps }, (_, i) => i + 1).map((n) => (
              <div
                key={n}
                className={`h-2 rounded-xl transition-all duration-300 ${n === formStep
                    ? "w-8 bg-teal-500"
                    : n < formStep
                      ? "w-2 bg-teal-300"
                      : "w-2 bg-slate-200"
                  }`}
              />
            ))}
            <span className="text-xs font-medium text-slate-400">
              {t("signUp.step", { current: formStep, total: totalSteps })}
            </span>
          </div>
        )}
      </div>

      <form onSubmit={handleRegister} className="space-y-3" noValidate>
        {formStep === 1 && (
          <div className="grid gap-3 lg:grid-cols-3">
            <Field label={t("fields.firstName")} error={fieldErrors.firstName}>
              <input
                value={form.firstName}
                onChange={(e) => handleChange("firstName", e.target.value)}
                className={getInputClass(Boolean(fieldErrors.firstName))}
              />
            </Field>
            <Field label={t("fields.lastName")} error={fieldErrors.lastName}>
              <input
                value={form.lastName}
                onChange={(e) => handleChange("lastName", e.target.value)}
                className={getInputClass(Boolean(fieldErrors.lastName))}
              />
            </Field>
            <Field label={t("fields.email")} error={fieldErrors.email}>
              <input
                type="email"
                value={form.email}
                onChange={(e) => handleChange("email", e.target.value)}
                onBlur={() => handleBlur("email")}
                className={getInputClass(Boolean(fieldErrors.email))}
                placeholder={t("placeholders.email")}
              />
            </Field>

            <Field label={t("fields.phone")} error={fieldErrors.phone}>
              <input
                value={form.phone}
                onChange={(e) => handleChange("phone", e.target.value)}
                className={getInputClass(Boolean(fieldErrors.phone))}
              />
            </Field>
            <Field label={t("fields.governorate")}>
              <select
                value={form.address}
                onChange={(e) =>
                  handleChange("address", e.target.value as Governorate)
                }
                className={getInputClass()}
              >
                {EgyptianGovernorates.map((gov) => (
                  <option key={gov} value={gov}>
                    {t(`constants:governorates.${governorateKeyMap[gov]}`)}
                  </option>
                ))}
              </select>
            </Field>
            <Field label={t("fields.dob")} error={fieldErrors.dob}>
              <input
                type="date"
                value={form.dob}
                onChange={(e) => handleChange("dob", e.target.value)}
                className={getInputClass(Boolean(fieldErrors.dob))}
              />
            </Field>

            <Field
              label={t("fields.password")}
              error={fieldErrors.password}
              className="lg:col-span-1"
            >
              <input
                type="password"
                value={form.password}
                onChange={(e) => handleChange("password", e.target.value)}
                onBlur={() => handleBlur("password")}
                className={getInputClass(Boolean(fieldErrors.password))}
                placeholder={t("placeholders.createPassword")}
              />
              <PasswordStrengthHints
                password={form.password}
                showErrors={Boolean(touched.password || fieldErrors.password)}
              />
            </Field>
            <Field
              label={t("fields.confirmPassword")}
              error={fieldErrors.confirmPassword}
              className="lg:col-span-2"
            >
              <input
                type="password"
                value={form.confirmPassword}
                onChange={(e) =>
                  handleChange("confirmPassword", e.target.value)
                }
                onBlur={() => handleBlur("confirmPassword")}
                className={getInputClass(Boolean(fieldErrors.confirmPassword))}
                placeholder={t("placeholders.confirmPasswordField")}
              />
            </Field>
          </div>
        )}

        {formStep === 2 && isSpecialist && (
          <div className="grid gap-3 lg:grid-cols-3">
            {isDoctor && (
              <>
                <Field
                  label={t("fields.specialization")}
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
                      {t("signUp.selectSpecialty")}
                    </option>
                    {MEDICAL_SPECIALIZATIONS.map((specialty) => {
                      const key = specialtyToKey(specialty);
                      return (
                        <option key={specialty} value={specialty}>
                          {key
                            ? t(`constants:specializations.${key}`)
                            : specialty}
                        </option>
                      );
                    })}
                  </select>
                </Field>
                <Field label={t("fields.licenseNumber")} error={fieldErrors.licenseNumber}>
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
                <Field label={t("fields.consultationFeeEgp")}>
                  <input
                    type="number"
                    value={form.consultationFee}
                    onChange={(e) =>
                      handleChange("consultationFee", e.target.value)
                    }
                    className={getInputClass()}
                  />
                </Field>
                <Field label={t("fields.clinicAddress")} className="lg:col-span-2">
                  <input
                    value={form.clinicAddress}
                    onChange={(e) =>
                      handleChange("clinicAddress", e.target.value)
                    }
                    className={getInputClass()}
                  />
                </Field>
                <Field label={t("fields.homeVisit")}>
                  <div className="grid grid-cols-2 gap-2">
                    <ToggleOption
                      active={form.homeVisit}
                      label={t("common.yes")}
                      onClick={() => handleChange("homeVisit", true)}
                    />
                    <ToggleOption
                      active={!form.homeVisit}
                      label={t("common.no")}
                      onClick={() => handleChange("homeVisit", false)}
                    />
                  </div>
                </Field>
              </>
            )}

            {isNurse && (
              <>
                <Field
                  label={t("fields.nursingLicense")}
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
                <Field label={t("fields.serviceArea")} error={fieldErrors.serviceArea}>
                  <input
                    placeholder={t("placeholders.serviceArea")}
                    value={form.serviceArea}
                    onChange={(e) =>
                      handleChange("serviceArea", e.target.value)
                    }
                    className={getInputClass(Boolean(fieldErrors.serviceArea))}
                  />
                </Field>
                <Field label={t("fields.consultationFeeEgp")}>
                  <input
                    type="number"
                    value={form.consultationFee}
                    onChange={(e) =>
                      handleChange("consultationFee", e.target.value)
                    }
                    className={getInputClass()}
                  />
                </Field>
              </>
            )}

            <Field label={t("fields.shortBio")} className="lg:col-span-3">
              <input
                value={form.bio}
                onChange={(e) => handleChange("bio", e.target.value)}
                className={getInputClass()}
                placeholder={t("placeholders.bio")}
              />
            </Field>

            {isDoctor ? (
              <div
                className={`lg:col-span-3 rounded-xl border px-4 pb-4 pt-3 space-y-3 ${fieldErrors.certTitle ||
                    fieldErrors.certIssuer ||
                    fieldErrors.certUrl
                    ? "border-red-200"
                    : "border-slate-200"
                  }`}
              >
                <div>
                  <p className="text-sm font-semibold text-slate-800">
                    Graduation certificate (required)
                  </p>
                  <p className="mt-1 text-xs text-slate-500">
                    Upload your graduation certificate so our admin team can verify your medical credentials.
                  </p>
                </div>
                <Field label="Certificate title" error={fieldErrors.certTitle}>
                  <input
                    value={form.certTitle}
                    onChange={(e) => handleChange("certTitle", e.target.value)}
                    placeholder="e.g. MBBS, Medical Degree"
                    className={getInputClass(Boolean(fieldErrors.certTitle))}
                  />
                </Field>
                <div className="grid gap-3 sm:grid-cols-2">
                  <Field label="Issued by" error={fieldErrors.certIssuer}>
                    <input
                      value={form.certIssuer}
                      onChange={(e) => handleChange("certIssuer", e.target.value)}
                      placeholder="University name"
                      className={getInputClass(Boolean(fieldErrors.certIssuer))}
                    />
                  </Field>
                  <Field label="Certificate URL" error={fieldErrors.certUrl}>
                    <input
                      value={form.certUrl}
                      onChange={(e) => handleChange("certUrl", e.target.value)}
                      placeholder="Link to your certificate file"
                      className={getInputClass(Boolean(fieldErrors.certUrl))}
                    />
                  </Field>
                </div>
              </div>
            ) : (
              <div
                className={`lg:col-span-3 rounded-xl border ${fieldErrors.certTitle ||
                    fieldErrors.certIssuer ||
                    fieldErrors.certUrl
                    ? "border-red-200"
                    : "border-slate-200"
                  }`}
              >
                <button
                  type="button"
                  onClick={() => setShowCert((v) => !v)}
                  className="flex w-full items-center justify-between px-4 py-3 text-start text-sm font-semibold text-slate-700 transition-colors hover:bg-slate-50"
                >
                  {t("signUp.addCertificate")}
                  <ChevronDown
                    className={`h-4 w-4 text-slate-400 transition-transform ${showCert ? "rotate-180" : ""}`}
                  />
                </button>
                {showCert && (
                  <div className="space-y-3 border-t border-slate-100 px-4 pb-4 pt-3">
                    <Field label={t("fields.certTitle")} error={fieldErrors.certTitle}>
                      <input
                        value={form.certTitle}
                        onChange={(e) =>
                          handleChange("certTitle", e.target.value)
                        }
                        className={getInputClass(Boolean(fieldErrors.certTitle))}
                      />
                    </Field>
                    <div className="grid gap-3 sm:grid-cols-2">
                      <Field label={t("fields.certIssuer")} error={fieldErrors.certIssuer}>
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
                      <Field label={t("fields.certUrl")} error={fieldErrors.certUrl}>
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
            )}
          </div>
        )}

        <div className="flex gap-3 pt-1">
          {formStep < totalSteps ? (
            <button
              type="button"
              onClick={goNext}
              className="w-full rounded-xl bg-primary border-2 border-primary py-3 text-base font-bold cursor-pointer text-white shadow-lg  transition-all duration-300 ease-in-out hover:-translate-y-0.5 hover:bg-transparent hover:text-primary hover:shadow-md whitespace-nowrap"
            >
              {t("signUp.continue")}
            </button>
          ) : (
            <button
              type="submit"
              disabled={isLoading}
              className="w-full rounded-xl bg-primary border-2 border-primary py-3 text-base font-bold cursor-pointer text-white shadow-lg  transition-all duration-300 ease-in-out hover:-translate-y-0.5 hover:bg-transparent hover:text-primary hover:shadow-md whitespace-nowrap"
            >
              {isLoading ? t("signUp.submitting") : t("signUp.submit")}
            </button>
          )}
        </div>

        <p className="mt-6 text-center text-lg text-fg-muted">
          {t("signUp.hasAccount")}{" "}
          <Link
            to="/login"
            className="inline-block font-bold text-primary transition-transform duration-200 hover:text-primary/80 hover:-translate-y-0.5"
          >
            {t("signUp.signInLink")}
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
      className={`rounded-xl border-2 px-3 py-2.5 text-sm font-semibold transition-all ${active
          ? "border-teal-500 bg-teal-50 text-teal-700"
          : "border-slate-200 bg-white text-slate-600 hover:border-slate-300"
        }`}
    >
      {label}
    </button>
  );
}