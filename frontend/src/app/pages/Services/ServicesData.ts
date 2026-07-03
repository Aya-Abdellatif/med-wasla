import {
  faClock,
  faUserDoctor,
  faUserNurse,
  faRobot,
  faShieldHeart,
  faCalendarCheck,
  faBrain,
} from "@fortawesome/free-solid-svg-icons";
import nurseImage from "../../../assets/nurse.png";
import clinicImage from "../../../assets/clinic.jpg";
import homeImage from "../../../assets/home.jpeg";
import type { ServiceFeature, ServiceItem } from "./serviceTypes";

export const topFeatures: ServiceFeature[] = [
  { icon: faClock, key: "access247" },
  { icon: faUserDoctor, key: "qualifiedDoctors" },
  { icon: faRobot, key: "aiAssistance" },
  { icon: faShieldHeart, key: "trustedCare" },
];

export const aiMedicalAssistantService: ServiceItem = {
  icon: faBrain,
  key: "aiMedicalAssistant",
  featureKeys: [
    "symptomAnalysis",
    "specialtyRecommendation",
    "assistance247",
    "smartHealthcareGuidance",
  ],
  color: "bg-purple-50 text-purple-500",
  image:
    "https://images.unsplash.com/photo-1581093588401-fbb62a02f120?auto=format&fit=crop&w=1080&q=80",
};

export const services: ServiceItem[] = [
  {
    icon: faCalendarCheck,
    key: "doctorReservation",
    featureKeys: [
      "specialistSearch",
      "onlineBooking",
      "appointmentReminders",
      "homeVisitScheduling",
    ],
    color: "bg-teal-50 text-[#14B8A6]",
    image:
      "https://images.unsplash.com/photo-1550831107-1553da8c8464?auto=format&fit=crop&w=1080&q=80",
  },
  {
    icon: faUserNurse,
    key: "nursingCare",
    featureKeys: [
      "homeNursingServices",
      "medicationInjectionSupport",
      "patientMonitoring",
      "flexibleNurseScheduling",
    ],
    color: "bg-blue-50 text-blue-500",
    image: nurseImage,
  },
  aiMedicalAssistantService,
];

export const providerAiMedicalAssistantService: ServiceItem = {
  ...aiMedicalAssistantService,
  featureKeys: [
    "clinicalReferenceSupport",
    "patientIntakeGuidance",
    "assistance247",
    "smartPracticeSupport",
  ],
};

export const providerServices: ServiceItem[] = [
  {
    icon: faCalendarCheck,
    key: "clinicSchedule",
    featureKeys: [
      "customWorkingHours",
      "automatedBookingManagement",
      "realTimeAppointmentReminders",
      "patientMedicalHistoryAccess",
    ],
    color: "bg-teal-50 text-[#14B8A6]",
    image: clinicImage,
  },
  {
    icon: faUserNurse,
    key: "homeVisitRequests",
    featureKeys: [
      "homeVisitRequestManagement",
      "geographicServiceAreaSetup",
      "directPatientCommunication",
      "digitalPrescriptionIssuance",
    ],
    color: "bg-blue-50 text-blue-500",
    image: homeImage,
  },
  providerAiMedicalAssistantService,
];
