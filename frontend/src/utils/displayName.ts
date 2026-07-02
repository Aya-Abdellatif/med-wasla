import i18n from "../i18n";

export function getFirstName(name?: string | null): string {
  if (!name) return "";

  const cleaned = name.replace(/^Dr\.?\s*/i, "").trim();
  return cleaned.split(/\s+/)[0] || cleaned;
}

export function getDisplayInitial(name?: string | null): string {
  return getFirstName(name).charAt(0).toUpperCase() || "U";
}

export function getSpecialistDisplayName(name?: string | null): string {
  const firstName = getFirstName(name);
  if (!firstName) return "";
  return i18n.t("common:titles.dr", { name: firstName });
}

export type ToastUserRole = "patient" | "doctor" | "nurse" | "admin";

/** Label shown in toast header — respects role (no "Dr." for patients). */
export function getToastUserLabel(
  name?: string | null,
  role?: ToastUserRole | null,
): string {
  const firstName = getFirstName(name);
  if (!firstName) return "";
  if (role === "doctor") return i18n.t("common:titles.drShort", { name: firstName });
  return firstName;
}

export function formatSpecialistName(
  name?: string | null,
  type: "doctor" | "nurse" = "doctor",
): string {
  if (!name?.trim()) {
    return i18n.t(type === "doctor" ? "common:roles.doctor" : "common:roles.nurse");
  }
  if (/^Dr\.?\s/i.test(name.trim())) return name.trim();
  return type === "doctor" ? i18n.t("common:titles.drShort", { name: name.trim() }) : name.trim();
}
