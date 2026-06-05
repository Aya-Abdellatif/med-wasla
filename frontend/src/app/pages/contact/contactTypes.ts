import type { IconDefinition } from "@fortawesome/fontawesome-svg-core";

export type ContactInfo = {
  icon: IconDefinition;
  title: string;
  details: string[];
  iconBoxClass: string;
};

export type FAQ = {
  question: string;
  answer: string;
};

export type ContactFormData = {
  name: string;
  email: string;
  phone: string;
  subject: string;
  message: string;
};