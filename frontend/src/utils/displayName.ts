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
  return `DR. ${firstName}`;
}

export function formatSpecialistName(
  name?: string | null,
  type: "doctor" | "nurse" = "doctor",
): string {
  if (!name?.trim()) return type === "doctor" ? "Doctor" : "Nurse";
  if (/^Dr\.?\s/i.test(name.trim())) return name.trim();
  return type === "doctor" ? `Dr. ${name.trim()}` : name.trim();
}
