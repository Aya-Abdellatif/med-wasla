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
    description: "Get smart guidance to choose the right medical specialty.",
  },
  {
    icon: faShieldHeart,
    title: "Trusted Care",
    description: "Secure, reliable, and patient-centered healthcare services.",
  },
];

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
      "Doctor Profiles",
    ],
    color: "bg-teal-50 text-[#14B8A6]",
    image:
      "https://images.unsplash.com/photo-1550831107-1553da8c8464?auto=format&fit=crop&w=1080&q=80",
  },
  {
    icon: faUserNurse,
    title: "Nurse Home Visit",
    description:
      "Schedule professional nursing services at home for follow-up care, monitoring, injections, and medical support.",
    features: [
      "Home Care Services",
      "Medication Administration",
      "Patient Monitoring",
      "Flexible Scheduling",
    ],
    color: "bg-blue-50 text-blue-500",
    image:
      "https://images.unsplash.com/photo-1584515933487-779824d29309?auto=format&fit=crop&w=1080&q=80",
  },
  {
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
  },
];