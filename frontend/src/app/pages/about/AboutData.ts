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
import ranimImage from "../../../assets/Ranim.jpeg";
import walaamage from "../../../assets/Walaa.jpg";


export const stats = [
  {
    value: "25+",
    label: "Years of Excellence",
  },
  {
    value: "100+",
    label: "Medical Experts",
  },
  {
    value: "50,000+",
    label: "Happy Patients",
  },
  {
    value: "15",
    label: "Specialized Departments",
  },
];

export const missionVision = [
  {
    title: "Our Mission",
    description:
      "To simplify healthcare access by connecting patients with trusted doctors, nurses, and healthcare specialists through a secure and user-friendly digital platform. We are committed to making healthcare more accessible, efficient, and reliable for everyone.",
    icon: faBullseye,
    bg: "bg-[#f0fffe]",
    iconBg: "bg-[#14B8A6]",
  },
  {
    title: "Our Vision",
    description:
      "To become the leading digital healthcare platform that empowers patients to find the right healthcare professionals easily while enabling medical specialists to deliver quality care anytime and anywhere.",
    icon: faEye,
    bg: "bg-[#f0fffe]",
    iconBg: "bg-[#14B8A6]",
  },
];

export const coreValues = [
  {
    title: "Trusted Professionals",
    description:
      "We connect patients with verified doctors, nurses, and healthcare specialists to ensure safe and reliable care.",
    icon: faAward,
  },
  {
    title: "Easy Access",
    description:
      "We make healthcare services easier to reach by allowing patients to book appointments and manage care online.",
    icon: faUsers,
  },
  {
    title: "Patient First",
    description:
      "We focus on patient needs by providing a simple, convenient, and supportive healthcare experience.",
    icon: faHeart,
  },
  {
    title: "Digital Healthcare",
    description:
      "We use technology to simplify communication between patients and medical professionals anytime and anywhere.",
    icon: faHospital,
  },
];
export const teamMembers = [
  {
    name: "Mayar Oraby",
    role: "Full Stack Developer",
    image: mayarImage,
    linkedin: "https://www.linkedin.com/in/mayar-oraby",
    whatsapp: "https://wa.me/201202818745",
   },
  {
    name: "Salma Assem",
    role: "Full Stack Developer",
    image: salmaImage,
    linkedin: "https://www.linkedin.com/in/salma-assem",
    whatsapp: "https://wa.me/201202818745",
   },
   {
    name: "Walaa Khafagy",
    role: "Full Stack Developer",
    image: walaamage,
    linkedin: "https://www.linkedin.com/in/walaa-khafagy",
    whatsapp: "https://wa.me/201121041373",
   },
  {
    name: "Aya Abdellatif",
    role: `Full Stack Developer (Team Leader)`,
    image: ayaImage,
    linkedin: "https://www.linkedin.com/in/aya-abdllatif/",
    whatsapp: "https://wa.me/20128363363",
  },
  {
    name: "Hana Ahmed",
    role: "Full Stack Developer",
    image: hanaImage,
    linkedin: "https://www.linkedin.com/in/hanasamir",
    whatsapp: "https://wa.me/201003333333",
  },
  {
    name: "Ranim Mogharab",
    role: "AI Specialist",
    image: ranimImage,
    linkedin: "https://www.linkedin.com/in/ranim-mohareb/",
    whatsapp: "https://wa.me/201004444444",
  },
];

export const servicesHighlight = [
  {
  title: "Anytime Booking",
  description:
    "Our platform allows patients to book appointments online 24/7, making healthcare access simple, convenient, and always available.",
  icon: faHeart,
},
  {
    title: "Specialized Departments",
    description:
      "10+ specialized departments covering all major medical disciplines.",
    icon: faHospital,
  },
  {
    title: "Expert Doctors",
    description:
      "100+ board-certified physicians with decades of combined expertise.",
    icon: faUserDoctor,
  },
];

export const CheckIcon = faCircleCheck;
export const UsersIcon = faUserDoctor;