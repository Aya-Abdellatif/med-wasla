import {
  faClock,
  faUserDoctor,
  faUserNurse,
  faRobot,
  faShieldHeart,
  faCalendarCheck,
  faBrain,
} from "@fortawesome/free-solid-svg-icons";

import type { ServiceFeature, ServiceItem } from "./serviceTypes";

export const topFeatures: ServiceFeature[] = [
  {
    icon: faClock,
    title: "24/7 Access",
    description: "Access healthcare services anytime from anywhere.",
  },
  {
    icon: faUserDoctor,
    title: "Qualified Doctors",
    description: "Book with experienced doctors across multiple specialties.",
  },
  {
    icon: faRobot,
    title: "AI Assistance",
    description: "Smart guidance for patients and healthcare providers, anytime.",
  },
  {
    icon: faShieldHeart,
    title: "Trusted Care",
    description:
      "Every healthcare professional here is verified to ensure safe, reliable, and quality care.",
  },
];

export const aiMedicalAssistantService: ServiceItem = {
  icon: faBrain,
  title: "AI Medical Assistant",
  description:
    "Describe your symptoms and let our chatbot guide you to the most suitable medical specialty.",
  features: [
    "Symptom Analysis",
    "Specialty Recommendation",
    "24/7 Assistance",
    "Smart Healthcare Guidance",
  ],
  color: "bg-purple-50 text-purple-500",
  image:
    "https://images.unsplash.com/photo-1581093588401-fbb62a02f120?auto=format&fit=crop&w=1080&q=80",
};

export const services: ServiceItem[] = [
  {
    icon: faCalendarCheck,
    title: "Doctor Reservation",
    description:
      "Book appointments with qualified healthcare professionals based on specialty, availability, and patient needs.",
    features: [
      "Specialist Search",
      "Online Booking",
      "Appointment Reminders",
      "Home Visit Scheduling",
    ],
    color: "bg-teal-50 text-[#14B8A6]",
    image:
      "https://images.unsplash.com/photo-1550831107-1553da8c8464?auto=format&fit=crop&w=1080&q=80",
  },
  {
    icon: faUserNurse,
    title: "Nursing Care",
    description:
      "Schedule professional nursing services at home for follow-up care, monitoring, injections, and medical support.",
    features: [
      "Home Nursing Services",
      "Medication & Injection Support",
      "Patient Monitoring",
      "Flexible Nurse Scheduling",
    ],
    color: "bg-blue-50 text-blue-500",
    image:
      "https://images.unsplash.com/photo-1584515933487-779824d29309?auto=format&fit=crop&w=1080&q=80",
  },
  aiMedicalAssistantService,
];

export const providerAiMedicalAssistantService: ServiceItem = {
  ...aiMedicalAssistantService,
  description:
    "Use AI support for quick clinical reference, patient intake questions, and specialty guidance while you manage your practice.",
  features: [
    "Clinical Reference Support",
    "Patient Intake Guidance",
    "24/7 Assistance",
    "Smart Practice Support",
  ],
};

export const providerServices: ServiceItem[] = [
  {
    icon: faCalendarCheck,
    title: "Clinic & Schedule Management",
    description:
      "Manage your weekly schedule, define your working hours, and let patients book appointments directly with automated slot coordination.",
    features: [
      "Custom Working Hours",
      "Automated Booking Management",
      "Real-time Appointment Reminders",
      "Patient Medical History Access",
    ],
    color: "bg-teal-50 text-[#14B8A6]",
    image:
      "https://images.unsplash.com/photo-1622253692010-333f2da6031d?auto=format&fit=crop&w=1080&q=80",
  },
  {
    icon: faUserNurse,
    title: "Home Visit & Nursing Requests",
    description:
      "Receive and manage home visit and care requests from patients in your area, and coordinate with nursing staff easily.",
    features: [
      "Home Visit Request Management",
      "Geographic Service Area Setup",
      "Direct Patient Communication",
      "Digital Prescription Issuance",
    ],
    color: "bg-blue-50 text-blue-500",
    image:
      "https://images.unsplash.com/photo-1576091160550-2173dba999ef?auto=format&fit=crop&w=1080&q=80",
  },
  providerAiMedicalAssistantService,
];
