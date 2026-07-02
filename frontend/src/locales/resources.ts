import common from "./en/common.json";
import nav from "./en/nav.json";
import language from "./en/language.json";
import footer from "./en/footer.json";
import auth from "./en/auth.json";
import validation from "./en/validation.json";
import toast from "./en/toast.json";
import publicNs from "./en/public.json";
import patient from "./en/patient.json";
import dashboard from "./en/dashboard.json";
import booking from "./en/booking.json";
import chatbot from "./en/chatbot.json";
import constants from "./en/constants.json";

import arCommon from "./ar/common.json";
import arNav from "./ar/nav.json";
import arLanguage from "./ar/language.json";
import arFooter from "./ar/footer.json";
import arAuth from "./ar/auth.json";
import arValidation from "./ar/validation.json";
import arToast from "./ar/toast.json";
import arPublic from "./ar/public.json";
import arPatient from "./ar/patient.json";
import arDashboard from "./ar/dashboard.json";
import arBooking from "./ar/booking.json";
import arChatbot from "./ar/chatbot.json";
import arConstants from "./ar/constants.json";
import enHome from "./en/home.json";
import arHome from "./ar/home.json";
import enServices from "./en/services.json";
import arServices from "./ar/services.json";
import enDoctors from "./en/doctors.json";
import arDoctors from "./ar/doctors.json";
import enNurses from "./en/nurses.json";
import arNurses from "./ar/nurses.json";
import enAbout from "./en/about.json";
import arAbout from "./ar/about.json";
import enContact from "./en/contact.json";
import arContact from "./ar/contact.json";

export const namespaces = [
  "common",
  "nav",
  "language",
  "footer",
  "auth",
  "validation",
  "toast",
  "public",
  "patient",
  "dashboard",
  "booking",
  "chatbot",
  "constants",
  "home",
  "services",
  "doctors",
  "nurses",
  "about",
  "contact",
] as const;

export type AppNamespace = (typeof namespaces)[number];

export const resources = {
  en: {
    common,
    nav,
    language,
    footer,
    auth,
    validation,
    toast,
    public: publicNs,
    patient,
    dashboard,
    booking,
    chatbot,
    constants,
    home: enHome,
    services: enServices,
    doctors: enDoctors,
    nurses: enNurses,
    about: enAbout,
    contact: enContact,
  },
  ar: {
    common: arCommon,
    nav: arNav,
    language: arLanguage,
    footer: arFooter,
    auth: arAuth,
    validation: arValidation,
    toast: arToast,
    public: arPublic,
    patient: arPatient,
    dashboard: arDashboard,
    booking: arBooking,
    chatbot: arChatbot,
    constants: arConstants,
    home: arHome,
    services: arServices,
    doctors: arDoctors,
    nurses: arNurses,
    about: arAbout,
    contact: arContact,
  },
} as const;
