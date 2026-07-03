import {
  faLocationDot,
  faPhone,
  faEnvelope,
  faClock,
} from "@fortawesome/free-solid-svg-icons";

export const contactInfoMeta = [
  { key: "address", icon: faLocationDot, iconBoxClass: "bg-red-50 text-red-500" },
  { key: "phone", icon: faPhone, iconBoxClass: "bg-blue-50 text-blue-500" },
  { key: "email", icon: faEnvelope, iconBoxClass: "bg-green-50 text-green-500" },
  { key: "hours", icon: faClock, iconBoxClass: "bg-purple-50 text-purple-500" },
];

export const departmentKeys: string[] = [
  "generalInquiry",
  "appointmentScheduling",
  "medicalRecords",
  "billingInsurance",
  "emergency",
  "feedbackComplaints",
];

export const faqKeys: string[] = [
  "manageOnline",
  "insurance",
  "scheduleAppointment",
  "telemedicine",
];