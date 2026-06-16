export function getFirstName(name?: string | null): string {
  if (!name) return "";

  const cleaned = name.replace(/^Dr\.?\s*/i, "").trim();
  return cleaned.split(/\s+/)[0] || cleaned;
}

export function getDisplayInitial(name?: string | null): string {
  return getFirstName(name).charAt(0).toUpperCase() || "U";
}
