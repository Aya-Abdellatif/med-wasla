import {
  faLocationDot,
  faPhone,
  faEnvelope,
  faClock,
} from "@fortawesome/free-solid-svg-icons";

import type { ContactInfo, FAQ } from "./contactTypes";

export const contactInfo: ContactInfo[] = [
  {
    icon: faLocationDot,
    title: "Address",
    details: ["123 Healthcare Ave", "Medical District", "New York, NY 10001"],
    iconBoxClass: "bg-red-50 text-red-500",
  },
  {
    icon: faPhone,
    title: "Phone",
    details: ["+1 (234) 567-890", "+1 (234) 567-891 Emergency"],
    iconBoxClass: "bg-blue-50 text-blue-500",
  },
  {
    icon: faEnvelope,
    title: "Email",
    details: ["info@healthcareplus.com", "support@healthcareplus.com"],
    iconBoxClass: "bg-green-50 text-green-500",
  },
  {
    icon: faClock,
    title: "Working Hours",
    details: [
      "Monday - Friday: 8AM - 8PM",
      "Saturday - Sunday: 9AM - 5PM",
      "Emergency: 24/7",
    ],
    iconBoxClass: "bg-purple-50 text-purple-500",
  },
];

export const departments: string[] = [
  "General Inquiry",
  "Appointment Scheduling",
  "Medical Records",
  "Billing & Insurance",
  "Emergency",
  "Feedback & Complaints",
];

export const faqs: FAQ[] = [
  {
    question: "What are your visiting hours?",
    answer:
      "Our general visiting hours are from 8 AM to 8 PM daily. However, some departments may have different hours.",
  },
  {
    question: "Do you accept insurance?",
    answer:
      "Yes, we accept most major insurance plans. Please contact our billing department or check with your insurance provider.",
  },
  {
    question: "How do I schedule an appointment?",
    answer:
      "You can schedule an appointment through our online booking system, by phone, or by visiting our facility.",
  },
  {
    question: "Do you offer telemedicine services?",
    answer:
      "Yes, we offer telemedicine consultations for certain medical conditions.",
  },
];