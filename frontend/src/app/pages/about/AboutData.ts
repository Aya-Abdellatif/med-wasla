import {
  faBullseye,
  faEye,
  faHeart,
  faAward,
  faUsers,
  faHospital,
  faCircleCheck,
  faUserDoctor,
} from "@fortawesome/free-solid-svg-icons";

import mayarImage from "../../../assets/Mayar.jpg";
import salmaImage from "../../../assets/Salma.jpg";
import ayaImage from "../../../assets/Aya.jpg";
import hanaImage from "../../../assets/Hana.jpg";
import ranimImage from "../../../assets/Ranem.jpeg";
import walaamage from "../../../assets/Walaa.jpg";

export const stats = [
  { key: "yearsExcellence", value: "25+" },
  { key: "medicalExperts", value: "200+" },
  { key: "happyPatients", value: "5000+" },
  { key: "specializedDepartments", value: "10+" },
];

export const missionVision = [
  {
    key: "mission",
    icon: faBullseye,
    bg: "bg-[#f0fffe]",
    iconBg: "bg-[#14B8A6]",
  },
  {
    key: "vision",
    icon: faEye,
    bg: "bg-[#f0fffe]",
    iconBg: "bg-[#14B8A6]",
  },
];

export const coreValues = [
  { key: "trustedProfessionals", icon: faAward },
  { key: "easyAccess", icon: faUsers },
  { key: "patientFirst", icon: faHeart },
  { key: "digitalHealthcare", icon: faHospital },
];

export const teamMembers = [
  {
    name: "Mayar Oraby",
    roleKey: "fullStackDeveloper",
    image: mayarImage,
    linkedin: "https://www.linkedin.com/in/mayar-oraby",
    whatsapp: "https://wa.me/201202818745",
  },
  {
    name: "Salma Assem",
    roleKey: "fullStackDeveloper",
    image: salmaImage,
    linkedin: "https://www.linkedin.com/in/salma-assem",
    whatsapp: "https://wa.me/201202818745",
  },
  {
    name: "Walaa Khafagy",
    roleKey: "fullStackDeveloper",
    image: walaamage,
    linkedin: "https://www.linkedin.com/in/walaa-khafagy",
    whatsapp: "https://wa.me/201121041373",
  },
  {
    name: "Aya Abdellatif",
    roleKey: "fullStackDeveloperLead",
    image: ayaImage,
    linkedin: "https://www.linkedin.com/in/aya-abdllatif/",
    whatsapp: "https://wa.me/20128363363",
  },
  {
    name: "Hana Ahmed",
    roleKey: "fullStackDeveloper",
    image: hanaImage,
    linkedin: "https://www.linkedin.com/in/hanasamir",
    whatsapp: "https://wa.me/201003333333",
  },
  {
    name: "Ranim Mogharab",
    roleKey: "fullStackDeveloperAiSpecialist",
    image: ranimImage,
    linkedin: "https://www.linkedin.com/in/ranim-mohareb/",
    whatsapp: "https://wa.me/201004444444",
  },
];

export const servicesHighlight = [
  { key: "anytimeBooking", icon: faHeart },
  { key: "specializedDepartments", icon: faHospital },
  { key: "expertDoctors", icon: faUserDoctor },
];

export const CheckIcon = faCircleCheck;
export const UsersIcon = faUserDoctor;