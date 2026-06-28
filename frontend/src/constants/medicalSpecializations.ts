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

export const NURSE_EXPERTISE_AREAS = [
  "Home Care",
  "Pediatric",
  "Geriatric",
  "Wound Care",
  "IV Therapy",
  "Post-Op Care",
] as const;

export type MedicalSpecialization = (typeof MEDICAL_SPECIALIZATIONS)[number];

export type NurseExpertiseArea = (typeof NURSE_EXPERTISE_AREAS)[number];
