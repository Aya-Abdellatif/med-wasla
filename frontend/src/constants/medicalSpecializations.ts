export const MEDICAL_SPECIALIZATIONS = [
  "Cardiology",
  "Orthopedics",
  "Dermatology",
  "Pediatrics",
  "Neurology",
  "Psychiatry",
  "Gynecology",
  "ENT",
  "Ophthalmology",
  "General Practice",
  "Urology",
  "Oncology",
] as const;

export type MedicalSpecialization = (typeof MEDICAL_SPECIALIZATIONS)[number];
