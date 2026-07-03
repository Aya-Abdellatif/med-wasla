const specialtyKeyMap: Record<string, string> = {
  "Cardiology": "cardiology",
  "Orthopedics": "orthopedics",
  "Dermatology": "dermatology",
  "Pediatrics": "pediatrics",
  "Neurology": "neurology",
  "Psychiatry": "psychiatry",
  "Gynecology": "gynecology",
  "ENT": "ent",
  "Ophthalmology": "ophthalmology",
  "General Practice": "generalPractice",
  "Urology": "urology",
  "Oncology": "oncology",
};

export function specialtyToKey(specialty: string): string | undefined {
  return specialtyKeyMap[specialty];
}

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

const expertiseKeyMap: Record<string, string> = {
  "Home Care": "homeCare",
  "Pediatric": "pediatric",
  "Geriatric": "geriatric",
  "Wound Care": "woundCare",
  "IV Therapy": "ivTherapy",
  "Post-Op Care": "postOpCare",
};

export function expertiseToKey(area: string): string | undefined {
  return expertiseKeyMap[area];
}

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
